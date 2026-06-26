import React, { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { GameEngineProps } from '../../types/game';
import { MOLE_QUESTIONS, type MoleCategory, type MoleDifficulty, type MoleQuestion } from '../../data/theMole';
import { shuffle } from '../../utils/deck';
import { PlayerSetup } from './components/PlayerSetup';
import { DifficultySelect } from './components/DifficultySelect';
import { CategorySelect } from './components/CategorySelect';
import { PrivacyGate } from './components/PrivacyGate';
import { RoleReveal } from './components/RoleReveal';
import { TriviaQuestion } from './components/TriviaQuestion';
import { TriviaAnswer } from './components/TriviaAnswer';
import { RoundRecap } from './components/RoundRecap';
import { VoteCast } from './components/VoteCast';
import { GameOver } from './components/GameOver';

type Phase =
  | 'player_setup'
  | 'difficulty_select'
  | 'category_select'
  | 'role_reveal_gate'
  | 'role_reveal'
  | 'trivia_question'
  | 'trivia_answer_gate'
  | 'trivia_answer'
  | 'round_recap'
  | 'vote_gate'
  | 'vote_cast'
  | 'game_over';

interface MolePlayer {
  id: string;
  name: string;
  isMole: boolean;
  votedFor: string | null;
  votesReceived: number;
}

const DIFFICULTY_POINTS: Record<MoleDifficulty, { groupPoints: number; molePoints: number }> = {
  easy:       { groupPoints: 75,  molePoints: 150 },
  medium:     { groupPoints: 100, molePoints: 100 },
  hard:       { groupPoints: 150, molePoints: 75  },
  impossible: { groupPoints: 200, molePoints: 50  },
};

// ── Balance knobs ────────────────────────────────────────────────────────────
// Auto-win pots are scaled per side from rounds × difficulty × player count.
const GROUP_FACTOR = 0.70; // group must hit ~70% of perfect play to auto-win
const MOLE_FACTOR = 0.70;  // mole must hit ~70% of a strong sabotage run
// Voting bonuses (all-or-nothing) added to the totals after the final vote.
const CATCH_FACTOR = 1.0;   // group reward when the mole is caught by majority
const EVASION_FACTOR = 0.5; // mole reward (× rounds) when it dodges a majority vote

const round50 = (n: number) => Math.round(n / 50) * 50;

function difficultyAverages(diffs: MoleDifficulty[]) {
  const list = diffs.length > 0 ? diffs : (['medium'] as MoleDifficulty[]);
  const avgGroup = list.reduce((s, d) => s + DIFFICULTY_POINTS[d].groupPoints, 0) / list.length;
  const avgMole = list.reduce((s, d) => s + DIFFICULTY_POINTS[d].molePoints, 0) / list.length;
  return { avgGroup, avgMole };
}

function computeThresholds(playerCount: number, rounds: number, diffs: MoleDifficulty[]) {
  const { avgGroup, avgMole } = difficultyAverages(diffs);
  // Group ceiling = every regular correct ((N-1), the mole sabotages).
  // Mole ceiling = everyone wrong (N). Each side needs ~70% of its own max,
  // which keeps the mole from auto-winning by simply answering wrong alone.
  const regulars = Math.max(1, playerCount - 1);
  return {
    groupThreshold: round50(regulars * avgGroup * rounds * GROUP_FACTOR),
    moleThreshold: round50(playerCount * avgMole * rounds * MOLE_FACTOR),
  };
}

export function TheMoleEngine({ roundLength, totalRounds, revealChoices = false, onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('player_setup');
  const [players, setPlayers] = useState<MolePlayer[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<MoleCategory[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<MoleDifficulty[]>(['medium']);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<MoleQuestion | null>(null);
  const [groupPot, setGroupPot] = useState(0);
  const [molePot, setMolePot] = useState(0);
  const [roundAnswers, setRoundAnswers] = useState<Record<string, 0 | 1 | 2 | 3>>({});
  const [lastRoundCorrect, setLastRoundCorrect] = useState(0);
  const [lastRoundIncorrect, setLastRoundIncorrect] = useState(0);
  const [groupThreshold, setGroupThreshold] = useState(0);
  const [moleThreshold, setMoleThreshold] = useState(0);
  const [moleCaught, setMoleCaught] = useState(false);
  const [voteBonus, setVoteBonus] = useState(0);
  const [winner, setWinner] = useState<'group' | 'mole' | 'tie' | null>(null);
  const [isAutoWin, setIsAutoWin] = useState(false);
  const [prevNames, setPrevNames] = useState<string[]>([]);

  const questionDeckRef = useRef<MoleQuestion[]>([]);
  const categoriesRef = useRef<MoleCategory[]>([]);
  const difficultiesRef = useRef<MoleDifficulty[]>(['medium']);

  function buildDeck(cats: MoleCategory[], diffs: MoleDifficulty[]): MoleQuestion[] {
    const filtered = MOLE_QUESTIONS.filter(
      (q) => cats.includes(q.category) && diffs.includes(q.difficulty),
    );
    return shuffle(filtered.length > 0 ? filtered : MOLE_QUESTIONS);
  }

  function drawNextQuestion(): MoleQuestion {
    if (questionDeckRef.current.length === 0) {
      questionDeckRef.current = buildDeck(categoriesRef.current, difficultiesRef.current);
    }
    return questionDeckRef.current.pop()!;
  }

  // ── Setup ──────────────────────────────────────────────────────────────────

  const handlePlayersDone = useCallback((names: string[]) => {
    setPrevNames(names);
    const moleIndex = Math.floor(Math.random() * names.length);
    const newPlayers: MolePlayer[] = names.map((name, i) => ({
      id: `player_${i}`,
      name,
      isMole: i === moleIndex,
      votedFor: null,
      votesReceived: 0,
    }));
    setPlayers(newPlayers);
    setPhase('difficulty_select');
  }, []);

  const handleDifficultiesDone = useCallback((diffs: MoleDifficulty[]) => {
    setSelectedDifficulties(diffs);
    difficultiesRef.current = diffs;
    setPhase('category_select');
  }, []);

  const handleCategoriesDone = useCallback((cats: MoleCategory[]) => {
    setSelectedCategories(cats);
    categoriesRef.current = cats;
    questionDeckRef.current = buildDeck(cats, difficultiesRef.current);
    const { groupThreshold: gT, moleThreshold: mT } = computeThresholds(
      players.length,
      totalRounds,
      difficultiesRef.current,
    );
    setGroupThreshold(gT);
    setMoleThreshold(mT);
    setCurrentPlayerIndex(0);
    setPhase('role_reveal_gate');
  }, [players.length, totalRounds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Role reveal loop ───────────────────────────────────────────────────────

  const handleRoleGateReveal = useCallback(() => {
    setPhase('role_reveal');
  }, []);

  const handleRoleHidden = useCallback((playerIdx: number, totalPlayers: number) => {
    if (playerIdx < totalPlayers - 1) {
      setCurrentPlayerIndex(playerIdx + 1);
      setPhase('role_reveal_gate');
    } else {
      const q = drawNextQuestion();
      setCurrentQuestion(q);
      setRoundAnswers({});
      setCurrentPlayerIndex(0);
      setCurrentRound(1);
      setGroupPot(0);
      setMolePot(0);
      setPhase('trivia_question');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Trivia round loop ──────────────────────────────────────────────────────

  const handleStartAnswering = useCallback(() => {
    setCurrentPlayerIndex(0);
    setPhase('trivia_answer_gate');
  }, []);

  const handleAnswerGateReveal = useCallback(() => {
    setPhase('trivia_answer');
  }, []);

  const handleAnswerLocked = useCallback(
    (answerIndex: 0 | 1 | 2 | 3, playerIdx: number, allPlayers: MolePlayer[], question: MoleQuestion, gPot: number, mPot: number) => {
      const player = allPlayers[playerIdx];
      const newAnswers: Record<string, 0 | 1 | 2 | 3> = { ...roundAnswers, [player.id]: answerIndex };
      setRoundAnswers(newAnswers);

      if (playerIdx < allPlayers.length - 1) {
        setCurrentPlayerIndex(playerIdx + 1);
        setPhase('trivia_answer_gate');
      } else {
        // Tally round using difficulty-scaled points
        const { groupPoints, molePoints } = DIFFICULTY_POINTS[question.difficulty];
        let correct = 0;
        let incorrect = 0;
        allPlayers.forEach((p) => {
          if (newAnswers[p.id] === question.correctIndex) {
            correct++;
          } else {
            incorrect++;
          }
        });
        const newGroupPot = gPot + correct * groupPoints;
        const newMolePot = mPot + incorrect * molePoints;
        setGroupPot(newGroupPot);
        setMolePot(newMolePot);
        setLastRoundCorrect(correct);
        setLastRoundIncorrect(incorrect);
        setPhase('round_recap');
      }
    },
    [roundAnswers],
  );

  // ── Round recap → next round or voting ────────────────────────────────────

  const handleRecapNext = useCallback((round: number, gPot: number, mPot: number) => {
    // Auto-win check: if either pot crosses its own threshold, skip voting
    if (groupThreshold > 0 && gPot >= groupThreshold) {
      setWinner('group');
      setIsAutoWin(true);
      setPhase('game_over');
      return;
    }
    if (moleThreshold > 0 && mPot >= moleThreshold) {
      setWinner('mole');
      setIsAutoWin(true);
      setPhase('game_over');
      return;
    }
    if (round >= totalRounds) {
      setCurrentPlayerIndex(0);
      setPhase('vote_gate');
    } else {
      const q = drawNextQuestion();
      setCurrentQuestion(q);
      setRoundAnswers({});
      setCurrentPlayerIndex(0);
      setCurrentRound(round + 1);
      setPhase('trivia_question');
    }
  }, [totalRounds, groupThreshold, moleThreshold]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Voting loop ────────────────────────────────────────────────────────────

  const handleVoteGateReveal = useCallback(() => {
    setPhase('vote_cast');
  }, []);

  // Voting now awards points instead of deciding the winner outright. The mole
  // keeps an evasion bonus unless it is caught by a majority of votes.
  const tallyVotes = useCallback((currentPlayers: MolePlayer[], gPot: number, mPot: number) => {
    const n = currentPlayers.length;
    const mole = currentPlayers.find((p) => p.isMole);
    const { avgGroup, avgMole } = difficultyAverages(difficultiesRef.current);
    const regulars = Math.max(1, n - 1);
    const caughtBonus = round50(regulars * avgGroup * CATCH_FACTOR);
    const evasionBonus = round50(regulars * avgMole * totalRounds * EVASION_FACTOR);

    const moleVotes = mole?.votesReceived ?? 0;
    const majority = moleVotes > n / 2;

    let finalGroup = gPot;
    let finalMole = mPot;
    if (majority) {
      finalGroup += caughtBonus;
      setGroupPot(finalGroup);
      setVoteBonus(caughtBonus);
    } else {
      finalMole += evasionBonus;
      setMolePot(finalMole);
      setVoteBonus(evasionBonus);
    }
    setMoleCaught(majority);

    setWinner(finalGroup > finalMole ? 'group' : finalMole > finalGroup ? 'mole' : 'tie');
    setIsAutoWin(false);
    setPhase('game_over');
  }, [totalRounds]);

  const handleVoteCast = useCallback(
    (targetId: string, playerIdx: number, allPlayers: MolePlayer[], gPot: number, mPot: number) => {
      const voter = allPlayers[playerIdx];
      const updatedPlayers = allPlayers.map((p) => {
        if (p.id === voter.id) return { ...p, votedFor: targetId };
        if (p.id === targetId) return { ...p, votesReceived: p.votesReceived + 1 };
        return p;
      });
      setPlayers(updatedPlayers);

      if (playerIdx < allPlayers.length - 1) {
        setCurrentPlayerIndex(playerIdx + 1);
        setPhase('vote_gate');
      } else {
        tallyVotes(updatedPlayers, gPot, mPot);
      }
    },
    [tallyVotes],
  );

  // ── Game over ──────────────────────────────────────────────────────────────

  const handlePlayAgain = useCallback(() => {
    setPhase('player_setup');
    setPlayers([]);
    setSelectedCategories([]);
    setSelectedDifficulties(['medium']);
    // prevNames intentionally kept — passed to PlayerSetup to pre-fill
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setCurrentQuestion(null);
    setGroupPot(0);
    setMolePot(0);
    setRoundAnswers({});
    setLastRoundCorrect(0);
    setLastRoundIncorrect(0);
    setGroupThreshold(0);
    setMoleThreshold(0);
    setMoleCaught(false);
    setVoteBonus(0);
    setWinner(null);
    setIsAutoWin(false);
    questionDeckRef.current = [];
    categoriesRef.current = [];
    difficultiesRef.current = ['medium'];
  }, []);

  // ── Quit ───────────────────────────────────────────────────────────────────

  const confirmExit = useCallback(() => {
    Alert.alert('Quit game?', 'All progress will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: onExit },
    ]);
  }, [onExit]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (phase === 'player_setup') {
    return <PlayerSetup onDone={handlePlayersDone} onExit={onExit} initialNames={prevNames} />;
  }

  if (phase === 'difficulty_select') {
    return <DifficultySelect onDone={handleDifficultiesDone} />;
  }

  if (phase === 'category_select') {
    return <CategorySelect onDone={handleCategoriesDone} />;
  }

  if (phase === 'role_reveal_gate') {
    const player = players[currentPlayerIndex];
    return (
      <PrivacyGate
        playerName={player.name}
        context="Your role is waiting. Do not show anyone else."
        onReveal={handleRoleGateReveal}
      />
    );
  }

  if (phase === 'role_reveal') {
    const player = players[currentPlayerIndex];
    return (
      <RoleReveal
        playerName={player.name}
        isMole={player.isMole}
        playerIndex={currentPlayerIndex}
        totalPlayers={players.length}
        onHide={() => handleRoleHidden(currentPlayerIndex, players.length)}
      />
    );
  }

  if (phase === 'trivia_question' && currentQuestion) {
    return (
      <TriviaQuestion
        question={currentQuestion}
        currentRound={currentRound}
        totalRounds={totalRounds}
        revealChoices={revealChoices}
        onStartAnswering={handleStartAnswering}
      />
    );
  }

  if (phase === 'trivia_answer_gate') {
    const player = players[currentPlayerIndex];
    return (
      <PrivacyGate
        playerName={player.name}
        context="Lock in your private answer."
        onReveal={handleAnswerGateReveal}
      />
    );
  }

  if (phase === 'trivia_answer' && currentQuestion) {
    const player = players[currentPlayerIndex];
    return (
      <TriviaAnswer
        playerName={player.name}
        question={currentQuestion}
        playerIndex={currentPlayerIndex}
        totalPlayers={players.length}
        onLock={(idx) =>
          handleAnswerLocked(idx, currentPlayerIndex, players, currentQuestion, groupPot, molePot)
        }
      />
    );
  }

  if (phase === 'round_recap') {
    return (
      <RoundRecap
        currentRound={currentRound}
        totalRounds={totalRounds}
        correctCount={lastRoundCorrect}
        incorrectCount={lastRoundIncorrect}
        groupPot={groupPot}
        molePot={molePot}
        groupThreshold={groupThreshold}
        moleThreshold={moleThreshold}
        isLastRound={currentRound >= totalRounds}
        onNext={() => handleRecapNext(currentRound, groupPot, molePot)}
      />
    );
  }

  if (phase === 'vote_gate') {
    const player = players[currentPlayerIndex];
    return (
      <PrivacyGate
        playerName={player.name}
        context="Cast your secret vote."
        onReveal={handleVoteGateReveal}
      />
    );
  }

  if (phase === 'vote_cast') {
    const voter = players[currentPlayerIndex];
    const candidates = players.filter((p) => p.id !== voter.id);
    return (
      <VoteCast
        voter={{ id: voter.id, name: voter.name }}
        candidates={candidates.map((p) => ({ id: p.id, name: p.name }))}
        voterIndex={currentPlayerIndex}
        totalVoters={players.length}
        onCast={(targetId) => handleVoteCast(targetId, currentPlayerIndex, players, groupPot, molePot)}
      />
    );
  }

  if (phase === 'game_over' && winner) {
    return (
      <GameOver
        players={players}
        groupPot={groupPot}
        molePot={molePot}
        winner={winner}
        isAutoWin={isAutoWin}
        moleCaught={moleCaught}
        voteBonus={voteBonus}
        onPlayAgain={handlePlayAgain}
        onExit={onExit}
      />
    );
  }

  // Fallback — should never reach here
  return null;
}
