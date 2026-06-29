import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/theme';
import type { GameEngineProps } from '../../types/game';
import { VERDICT_CASES } from '../../data/verdict';
import { shuffle } from '../../utils/deck';
import { scaleCase } from './caseScaler';
import { applyResults, calculateVerdict, evaluateRound } from './scoring';
import type {
  GroupVerdict,
  Phase,
  PlayerRoundResult,
  RevealStep,
  ScaledCase,
  VerdictPlayer,
  VoteSubPhase,
  VotesByQuestion,
} from './types';
import { Discussion } from './components/Discussion';
import { FinalArgs } from './components/FinalArgs';
import { FinalArgsPrompt } from './components/FinalArgsPrompt';
import { FinalResults } from './components/FinalResults';
import { PlayerSetup } from './components/PlayerSetup';
import { Reveal } from './components/Reveal';
import { RoleDeal } from './components/RoleDeal';
import { RoundIntro } from './components/RoundIntro';
import { RoundsSelect } from './components/RoundsSelect';
import { Scoreboard } from './components/Scoreboard';
import { VotingScreen } from './components/VotingScreen';

const DISCUSSION_TIME_BASE = 180;
const DISCUSSION_TIME_LARGE = 300;

export function VerdictEngine({ onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('player_setup');
  const [selectedRounds, setSelectedRounds] = useState<1 | 3 | 5>(3);
  const [players, setPlayers] = useState<VerdictPlayer[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [scaledCase, setScaledCase] = useState<ScaledCase | null>(null);
  const [usedCaseIds, setUsedCaseIds] = useState<string[]>([]);

  const [roleDealIndex, setRoleDealIndex] = useState(0);
  const [roleDealRevealed, setRoleDealRevealed] = useState(false);

  const [discussionTimeLeft, setDiscussionTimeLeft] = useState(DISCUSSION_TIME_BASE);
  const [discussionTotal, setDiscussionTotal] = useState(DISCUSSION_TIME_BASE);

  const [finalArgIndex, setFinalArgIndex] = useState(0);

  const [voteIndex, setVoteIndex] = useState(0);
  const [voteSubPhase, setVoteSubPhase] = useState<VoteSubPhase>('gate');
  const [votesByQuestion, setVotesByQuestion] = useState<VotesByQuestion>({ culprit: {}, helper: {} });

  const [groupVerdict, setGroupVerdict] = useState<GroupVerdict | null>(null);
  const [roundResults, setRoundResults] = useState<PlayerRoundResult[]>([]);
  const [revealStep, setRevealStep] = useState<RevealStep>('verdict');
  const hasScoredRef = useRef(false);

  const caseDeckRef = useRef<typeof VERDICT_CASES[number][]>(shuffle([...VERDICT_CASES]));

  function drawNextCase(used: string[]): typeof VERDICT_CASES[number] {
    if (caseDeckRef.current.length === 0) {
      caseDeckRef.current = shuffle([...VERDICT_CASES]);
    }
    const unused = caseDeckRef.current.filter((c) => !used.includes(c.id));
    if (unused.length === 0) {
      caseDeckRef.current = shuffle([...VERDICT_CASES]);
      return caseDeckRef.current[0];
    }
    const idx = caseDeckRef.current.indexOf(unused[0]);
    if (idx !== -1) caseDeckRef.current.splice(idx, 1);
    return unused[0];
  }

  const startNewRound = useCallback(
    (currentPlayers: VerdictPlayer[], usedIds: string[], round: number) => {
      const template = drawNextCase(usedIds);
      const scaled = scaleCase(template, currentPlayers);
      const timeTotal = currentPlayers.length >= 6 ? DISCUSSION_TIME_LARGE : DISCUSSION_TIME_BASE;

      setScaledCase(scaled);
      setUsedCaseIds((prev) => [...prev, template.id]);
      setRoleDealIndex(0);
      setRoleDealRevealed(false);
      setDiscussionTimeLeft(timeTotal);
      setDiscussionTotal(timeTotal);
      setFinalArgIndex(0);
      setVoteIndex(0);
      setVoteSubPhase('gate');
      setVotesByQuestion({ culprit: {}, helper: {} });
      setGroupVerdict(null);
      setRoundResults([]);
      setRevealStep('verdict');
      hasScoredRef.current = false;
      setCurrentRound(round);
      setPhase('round_intro');
    },
    [],
  );

  useEffect(() => {
    if (phase !== 'discussion') return;
    if (discussionTimeLeft <= 0) return;
    const id = setInterval(() => {
      setDiscussionTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function handlePlayersDone(newPlayers: VerdictPlayer[]) {
    setPlayers(newPlayers);
    setPhase('rounds_select');
  }

  function handleRoundsDone(rounds: 1 | 3 | 5) {
    setSelectedRounds(rounds);
    startNewRound(players, [], 1);
  }

  function handleRoleDealReveal() {
    setRoleDealRevealed(true);
  }

  function handleRoleDealNext() {
    if (roleDealIndex < players.length - 1) {
      setRoleDealIndex((i) => i + 1);
      setRoleDealRevealed(false);
    } else {
      setPhase('discussion');
    }
  }

  function handleDiscussionContinue() {
    setPhase('final_args_prompt');
  }

  function handleUseFinalArgs() {
    setFinalArgIndex(0);
    setPhase('final_args');
  }

  function handleSkipToVoting() {
    setVoteIndex(0);
    setVoteSubPhase('gate');
    setPhase('voting');
  }

  function handleFinalArgNext() {
    if (finalArgIndex < players.length - 1) {
      setFinalArgIndex((i) => i + 1);
    } else {
      setVoteIndex(0);
      setVoteSubPhase('gate');
      setPhase('voting');
    }
  }

  function handleGateReady() {
    setVoteSubPhase('vote');
  }

  function handleVoteSubmit(culpritId: string, helperId: string | null) {
    const voter = players[voteIndex];
    const newVotes: VotesByQuestion = {
      culprit: { ...votesByQuestion.culprit, [voter.id]: culpritId },
      helper: helperId != null ? { ...votesByQuestion.helper, [voter.id]: helperId } : votesByQuestion.helper,
    };
    setVotesByQuestion(newVotes);

    if (voteIndex < players.length - 1) {
      setVoteIndex((i) => i + 1);
      setVoteSubPhase('gate');
    } else {
      const verdict = calculateVerdict(newVotes);
      setGroupVerdict(verdict);
      setRevealStep('verdict');
      setPhase('reveal');
    }
  }

  function handleRevealNext() {
    if (revealStep === 'verdict') {
      setRevealStep('truth');
    } else if (revealStep === 'truth') {
      setRevealStep('player_results');
    } else {
      setPhase('scoreboard');
    }
  }

  function handleScore() {
    if (hasScoredRef.current || !scaledCase || !groupVerdict) return;
    hasScoredRef.current = true;
    const results = evaluateRound(
      scaledCase.activeSlots,
      groupVerdict,
      scaledCase.truthCulpritId,
      scaledCase.truthHelperIds,
      players,
    );
    setRoundResults(results);
    setPlayers((prev) => applyResults(prev, results));
  }

  function handleNextRound() {
    startNewRound(players, usedCaseIds, currentRound + 1);
  }

  function handleFinalResults() {
    setPhase('final_results');
  }

  function handlePlayAgain() {
    const reset = players.map((p) => ({ ...p, credibility: 0 }));
    setPlayers(reset);
    setUsedCaseIds([]);
    caseDeckRef.current = shuffle([...VERDICT_CASES]);
    startNewRound(reset, [], 1);
  }

  function handleNewGame() {
    setPhase('player_setup');
    setPlayers([]);
    setUsedCaseIds([]);
    setCurrentRound(1);
    caseDeckRef.current = shuffle([...VERDICT_CASES]);
  }

  return (
    <View style={styles.root}>
      {phase === 'player_setup' && <PlayerSetup onDone={handlePlayersDone} />}

      {phase === 'rounds_select' && <RoundsSelect onDone={handleRoundsDone} />}

      {phase === 'round_intro' && scaledCase && (
        <RoundIntro
          round={currentRound}
          totalRounds={selectedRounds}
          scaledCase={scaledCase}
          onBegin={() => setPhase('role_deal')}
        />
      )}

      {phase === 'role_deal' && scaledCase && (
        <RoleDeal
          players={players}
          activeSlots={scaledCase.activeSlots}
          dealIndex={roleDealIndex}
          revealed={roleDealRevealed}
          onReveal={handleRoleDealReveal}
          onNext={handleRoleDealNext}
        />
      )}

      {phase === 'discussion' && scaledCase && (
        <Discussion
          scaledCase={scaledCase}
          timeLeft={discussionTimeLeft}
          totalTime={discussionTotal}
          onContinue={handleDiscussionContinue}
        />
      )}

      {phase === 'final_args_prompt' && (
        <FinalArgsPrompt
          playerCount={players.length}
          onUse={handleUseFinalArgs}
          onSkip={handleSkipToVoting}
        />
      )}

      {phase === 'final_args' && (
        <FinalArgs
          players={players}
          argIndex={finalArgIndex}
          onNext={handleFinalArgNext}
        />
      )}

      {phase === 'voting' && scaledCase && (
        <VotingScreen
          players={players}
          scaledCase={scaledCase}
          voteIndex={voteIndex}
          subPhase={voteSubPhase}
          currentVotes={votesByQuestion}
          onGateReady={handleGateReady}
          onVoteSubmit={handleVoteSubmit}
        />
      )}

      {phase === 'reveal' && scaledCase && groupVerdict && (
        <Reveal
          revealStep={revealStep}
          scaledCase={scaledCase}
          verdict={groupVerdict}
          roundResults={roundResults}
          players={players}
          onNext={handleRevealNext}
          onScore={handleScore}
        />
      )}

      {phase === 'scoreboard' && (
        <Scoreboard
          players={players}
          currentRound={currentRound}
          totalRounds={selectedRounds}
          onNextRound={handleNextRound}
          onFinalResults={handleFinalResults}
        />
      )}

      {phase === 'final_results' && (
        <FinalResults
          players={players}
          onPlayAgain={handlePlayAgain}
          onNewGame={handleNewGame}
          onHome={onExit}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
