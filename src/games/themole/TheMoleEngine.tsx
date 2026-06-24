import React, { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { GameEngineProps } from '../../types/game';
import { MOLE_QUESTIONS, type MoleCategory, type MoleQuestion } from '../../data/theMole';
import { shuffle } from '../../utils/deck';
import { PlayerSetup } from './components/PlayerSetup';
import { CategorySelect } from './components/CategorySelect';
import { PrivacyGate } from './components/PrivacyGate';
import { RoleReveal } from './components/RoleReveal';
import { TriviaQuestion } from './components/TriviaQuestion';
import { TriviaAnswer } from './components/TriviaAnswer';
import { RoundRecap } from './components/RoundRecap';
import { VoteCast } from './components/VoteCast';
import { TieBreaker } from './components/TieBreaker';
import { GameOver } from './components/GameOver';

type Phase =
  | 'player_setup'
  | 'category_select'
  | 'role_reveal_gate'
  | 'role_reveal'
  | 'trivia_question'
  | 'trivia_answer_gate'
  | 'trivia_answer'
  | 'round_recap'
  | 'vote_gate'
  | 'vote_cast'
  | 'tie_breaker'
  | 'tie_vote_gate'
  | 'tie_vote_cast'
  | 'game_over';

interface MolePlayer {
  id: string;
  name: string;
  isMole: boolean;
  votedFor: string | null;
  votesReceived: number;
}

const POINTS_PER_ANSWER = 100;

export function TheMoleEngine({ roundLength, totalRounds, onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('player_setup');
  const [players, setPlayers] = useState<MolePlayer[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<MoleCategory[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<MoleQuestion | null>(null);
  const [groupPot, setGroupPot] = useState(0);
  const [molePot, setMolePot] = useState(0);
  const [roundAnswers, setRoundAnswers] = useState<Record<string, 0 | 1 | 2 | 3>>({});
  const [lastRoundCorrect, setLastRoundCorrect] = useState(0);
  const [lastRoundIncorrect, setLastRoundIncorrect] = useState(0);
  const [tiePlayerIds, setTiePlayerIds] = useState<string[]>([]);
  const [tieBreakerRound, setTieBreakerRound] = useState(0);
  const [winner, setWinner] = useState<'group' | 'mole' | 'tie' | null>(null);
  const [prevNames, setPrevNames] = useState<string[]>([]);

  const questionDeckRef = useRef<MoleQuestion[]>([]);
  const categoriesRef = useRef<MoleCategory[]>([]);

  function drawNextQuestion(): MoleQuestion {
    if (questionDeckRef.current.length === 0) {
      const filtered = MOLE_QUESTIONS.filter((q) => categoriesRef.current.includes(q.category));
      questionDeckRef.current = shuffle(filtered.length > 0 ? filtered : MOLE_QUESTIONS);
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
    setPhase('category_select');
  }, []);

  const handleCategoriesDone = useCallback((cats: MoleCategory[]) => {
    setSelectedCategories(cats);
    categoriesRef.current = cats;
    const filtered = MOLE_QUESTIONS.filter((q) => cats.includes(q.category));
    questionDeckRef.current = shuffle(filtered.length > 0 ? filtered : MOLE_QUESTIONS);
    setCurrentPlayerIndex(0);
    setPhase('role_reveal_gate');
  }, []);

  // ── Role reveal loop ───────────────────────────────────────────────────────

  const handleRoleGateReveal = useCallback(() => {
    setPhase('role_reveal');
  }, []);

  const handleRoleHidden = useCallback((playerIdx: number, totalPlayers: number) => {
    if (playerIdx < totalPlayers - 1) {
      setCurrentPlayerIndex(playerIdx + 1);
      setPhase('role_reveal_gate');
    } else {
      // All roles seen — start first trivia round
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
        // Tally round
        let correct = 0;
        let incorrect = 0;
        allPlayers.forEach((p) => {
          if (newAnswers[p.id] === question.correctIndex) {
            correct++;
          } else {
            incorrect++;
          }
        });
        const newGroupPot = gPot + correct * POINTS_PER_ANSWER;
        const newMolePot = mPot + incorrect * POINTS_PER_ANSWER;
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

  const handleRecapNext = useCallback((round: number) => {
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
  }, [totalRounds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Voting loop ────────────────────────────────────────────────────────────

  const handleVoteGateReveal = useCallback(() => {
    setPhase('vote_cast');
  }, []);

  const handleTieVoteGateReveal = useCallback(() => {
    setPhase('tie_vote_cast');
  }, []);

  function tallyVotes(currentPlayers: MolePlayer[], isTieRound: number) {
    const maxVotes = Math.max(...currentPlayers.map((p) => p.votesReceived));
    const topVoters = currentPlayers.filter((p) => p.votesReceived === maxVotes);

    if (topVoters.length === 1) {
      const topPlayer = topVoters[0];
      setWinner(topPlayer.isMole ? 'group' : 'mole');
      setPhase('game_over');
    } else if (isTieRound >= 1) {
      setWinner('tie');
      setPhase('game_over');
    } else {
      setTiePlayerIds(topVoters.map((p) => p.id));
      setTieBreakerRound(1);
      setPhase('tie_breaker');
    }
  }

  const handleVoteCast = useCallback(
    (targetId: string, playerIdx: number, allPlayers: MolePlayer[], currentTieBreakerRound: number) => {
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
        tallyVotes(updatedPlayers, currentTieBreakerRound);
      }
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleTieVoteCast = useCallback(
    (targetId: string, playerIdx: number, allPlayers: MolePlayer[], currentTieBreakerRound: number) => {
      const voter = allPlayers[playerIdx];
      const updatedPlayers = allPlayers.map((p) => {
        if (p.id === voter.id) return { ...p, votedFor: targetId };
        if (p.id === targetId) return { ...p, votesReceived: p.votesReceived + 1 };
        return p;
      });
      setPlayers(updatedPlayers);

      if (playerIdx < allPlayers.length - 1) {
        setCurrentPlayerIndex(playerIdx + 1);
        setPhase('tie_vote_gate');
      } else {
        tallyVotes(updatedPlayers, currentTieBreakerRound);
      }
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Tie breaker ────────────────────────────────────────────────────────────

  const handleStartRevote = useCallback((allPlayers: MolePlayer[]) => {
    const resetPlayers = allPlayers.map((p) => ({
      ...p,
      votesReceived: 0,
      votedFor: null,
    }));
    setPlayers(resetPlayers);
    setCurrentPlayerIndex(0);
    setPhase('tie_vote_gate');
  }, []);

  // ── Game over ──────────────────────────────────────────────────────────────

  const handlePlayAgain = useCallback(() => {
    setPhase('player_setup');
    setPlayers([]);
    setSelectedCategories([]);
    // prevNames intentionally kept — passed to PlayerSetup to pre-fill
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setCurrentQuestion(null);
    setGroupPot(0);
    setMolePot(0);
    setRoundAnswers({});
    setLastRoundCorrect(0);
    setLastRoundIncorrect(0);
    setTiePlayerIds([]);
    setTieBreakerRound(0);
    setWinner(null);
    questionDeckRef.current = [];
    categoriesRef.current = [];
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
        isLastRound={currentRound >= totalRounds}
        onNext={() => handleRecapNext(currentRound)}
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
        onCast={(targetId) => handleVoteCast(targetId, currentPlayerIndex, players, tieBreakerRound)}
      />
    );
  }

  if (phase === 'tie_breaker') {
    const tiedPlayers = players.filter((p) => tiePlayerIds.includes(p.id));
    return (
      <TieBreaker
        tiedPlayers={tiedPlayers.map((p) => ({ id: p.id, name: p.name }))}
        argumentDuration={roundLength}
        onStartRevote={() => handleStartRevote(players)}
      />
    );
  }

  if (phase === 'tie_vote_gate') {
    const player = players[currentPlayerIndex];
    return (
      <PrivacyGate
        playerName={player.name}
        context="Tie-breaker vote. Cast your secret vote."
        onReveal={handleTieVoteGateReveal}
      />
    );
  }

  if (phase === 'tie_vote_cast') {
    const voter = players[currentPlayerIndex];
    const candidates = players.filter(
      (p) => p.id !== voter.id && tiePlayerIds.includes(p.id),
    );
    return (
      <VoteCast
        voter={{ id: voter.id, name: voter.name }}
        candidates={candidates.map((p) => ({ id: p.id, name: p.name }))}
        voterIndex={currentPlayerIndex}
        totalVoters={players.length}
        onCast={(targetId) =>
          handleTieVoteCast(targetId, currentPlayerIndex, players, tieBreakerRound)
        }
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
        onPlayAgain={handlePlayAgain}
        onExit={onExit}
      />
    );
  }

  // Fallback — should never reach here
  return null;
}
