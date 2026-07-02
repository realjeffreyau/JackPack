import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { GameEngineProps } from '../../types/game';
import { getGame } from '../../data/games';
import { useSidequestContext } from '../../sidequests/SidequestContext';
import type { Sidequest } from '../../sidequests/types';
import { SidequestModal } from '../../components/sidequests/SidequestModal';
import { SidequestCheckModal } from '../../components/sidequests/SidequestCheckModal';
import { BackButton } from '../../components/BackButton';
import { PARANOIA_PROMPTS } from '../../data/paranoia';
import { shuffle } from '../../utils/deck';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors } from '../../theme/theme';
import type { Phase, Player, PromptMode } from './types';
import { PrivacyGate } from './components/PrivacyGate';
import { PromptModeSelect } from './components/PromptModeSelect';
import { CustomPromptInput } from './components/CustomPromptInput';
import { PlayerSetup } from './components/PlayerSetup';
import { VoteScreen } from './components/VoteScreen';
import { SubjectNotification } from './components/SubjectNotification';
import { InterrogationScreen } from './components/InterrogationScreen';
import { GroupReveal } from './components/GroupReveal';
import { ScoreBoard } from './components/ScoreBoard';

type SqModalState = {
  type: 'assign' | 'check';
  playerId: string;
  playerName: string;
  sidequest: Sidequest;
} | null;

export function ParanoiaEngine({ roundLength, totalRounds, onExit }: GameEngineProps) {
  const reduced = useReducedMotion();
  const sq = useSidequestContext();
  const sqSupported = !!(getGame('paranoia')?.supportsSidequests) && sq.enabled;
  const [sqModal, setSqModal] = useState<SqModalState>(null);

  const [phase, setPhase] = useState<Phase>('prompt_mode');
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [promptMode, setPromptMode] = useState<PromptMode>('builtin');
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [subjectId, setSubjectId] = useState('');
  const [subjectPredictions, setSubjectPredictions] = useState<Record<string, boolean>>({});
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [revealIndex, setRevealIndex] = useState(0);
  const [roundScores, setRoundScores] = useState<Record<string, number>>({});
  const [subjectGuessedAll, setSubjectGuessedAll] = useState(false);
  const [timeLeft, setTimeLeft] = useState(roundLength);

  const promptDeckRef = useRef<string[]>([]);
  const pendingPredictionsRef = useRef<Record<string, boolean>>({});
  const lockedRef = useRef(false);

  function drawNextPrompt(prompts: string[]): string {
    if (promptDeckRef.current.length === 0) {
      promptDeckRef.current = shuffle(prompts);
    }
    return promptDeckRef.current.pop()!;
  }

  function effectivePrompts(mode: PromptMode, custom: string[]): string[] {
    if (mode === 'custom') return custom;
    if (mode === 'mix') return [...PARANOIA_PROMPTS, ...custom];
    return [...PARANOIA_PROMPTS];
  }

  function startRound(
    currentPlayers: Player[],
    mode: PromptMode,
    custom: string[],
    roundNum: number,
  ) {
    const prompts = effectivePrompts(mode, custom);
    const nextPrompt = drawNextPrompt(prompts);
    setPrompt(nextPrompt);
    setVotes({});
    setSubjectId('');
    setSubjectPredictions({});
    setCurrentVoterIndex(0);
    setRevealIndex(0);
    setRoundScores({});
    setTimeLeft(roundLength);
    setRound(roundNum);
    pendingPredictionsRef.current = {};
    lockedRef.current = false;
    setPhase('voting_gate');
  }

  // ---- Timer for interrogation phase ----------------------------------------
  useEffect(() => {
    if (phase !== 'interrogation') return undefined;
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-lock when timer hits 0
  useEffect(() => {
    if (phase === 'interrogation' && timeLeft === 0 && !lockedRef.current) {
      lockedRef.current = true;
      lockPredictions(pendingPredictionsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // ---- Scoring ----------------------------------------------------------------
  const lockPredictions = useCallback(
    (rawPredictions: Record<string, boolean>) => {
      const nonSubjects = players.filter((p) => p.id !== subjectId);
      const final: Record<string, boolean> = {};
      nonSubjects.forEach((p) => {
        final[p.id] = rawPredictions[p.id] ?? false;
      });

      const scores: Record<string, number> = {};
      players.forEach((p) => { scores[p.id] = 0; });

      let subjectGain = 0;
      let allCorrect = true;
      nonSubjects.forEach((player) => {
        const actual = votes[player.id] === subjectId;
        const predicted = final[player.id];
        if (actual === predicted) {
          subjectGain += 100;
        } else {
          scores[player.id] = 150;
          allCorrect = false;
        }
      });
      scores[subjectId] = subjectGain;

      const updatedPlayers = players.map((p) => ({
        ...p,
        totalScore: p.totalScore + (scores[p.id] ?? 0),
      }));

      setSubjectPredictions(final);
      setRoundScores(scores);
      setPlayers(updatedPlayers);
      setSubjectGuessedAll(allCorrect && nonSubjects.length > 0);
      setRevealIndex(0);
      setPhase('group_reveal');
    },
    [players, subjectId, votes],
  );

  // ---- Phase handlers ---------------------------------------------------------
  function handlePromptMode(mode: PromptMode) {
    setPromptMode(mode);
    if (mode === 'builtin') {
      setPhase('player_setup');
    } else {
      setPhase('custom_input');
    }
  }

  function handleCustomDone(custom: string[]) {
    setCustomPrompts(custom);
    setPhase('player_setup');
  }

  function showSidequestFor(playerId: string, playerName: string) {
    const pending = sq.getPendingSidequest(playerId);
    if (pending) {
      setSqModal({ type: 'check', playerId, playerName, sidequest: pending });
      return;
    }
    const newSq = sq.checkTrigger(playerId);
    if (newSq) {
      setSqModal({ type: 'assign', playerId, playerName, sidequest: newSq });
    }
  }

  // Sidequest: private vote moment (after voting_gate, voter has phone alone)
  useEffect(() => {
    if (!sqSupported || phase !== 'vote' || sqModal) return;
    const voter = players[currentVoterIndex];
    if (voter) showSidequestFor(voter.id, voter.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentVoterIndex, sqSupported]);

  // Sidequest: subject notification (subject has phone alone)
  useEffect(() => {
    if (!sqSupported || phase !== 'subject_notification' || sqModal || !subjectId) return;
    const subject = players.find((p) => p.id === subjectId);
    if (subject) showSidequestFor(subject.id, subject.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, subjectId, sqSupported]);

  function handlePlayersReady(readyPlayers: Player[]) {
    setPlayers(readyPlayers);
    if (sqSupported) sq.startSession(readyPlayers.map((p) => ({ id: p.id, name: p.name })));
    startRound(readyPlayers, promptMode, customPrompts, 1);
  }

  function handleVotingGateReady() {
    setPhase('vote');
  }

  function handleVote(votedForId: string) {
    const voter = players[currentVoterIndex];
    const updatedVotes = { ...votes, [voter.id]: votedForId };
    setVotes(updatedVotes);

    const nextIndex = currentVoterIndex + 1;
    if (nextIndex < players.length) {
      setCurrentVoterIndex(nextIndex);
      setPhase('voting_gate');
    } else {
      // All votes cast — pick subject
      const tally: Record<string, number> = {};
      players.forEach((p) => { tally[p.id] = 0; });
      Object.values(updatedVotes).forEach((id) => {
        tally[id] = (tally[id] ?? 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(tally));
      const topTied = players.filter((p) => (tally[p.id] ?? 0) === maxVotes && maxVotes > 0);
      const eligible = topTied.length > 0 ? topTied : players.filter((p) => (tally[p.id] ?? 0) > 0);
      const chosen = eligible[Math.floor(Math.random() * eligible.length)];
      setSubjectId(chosen.id);
      setPhase('subject_gate');
    }
  }

  function handleSubjectGateReady() {
    setPhase('subject_notification');
  }

  function handleSubjectReady() {
    setTimeLeft(roundLength);
    lockedRef.current = false;
    pendingPredictionsRef.current = {};
    setPhase('interrogation');
  }

  function handlePredictionChange(predictions: Record<string, boolean>) {
    pendingPredictionsRef.current = predictions;
  }

  function handleLockPredictions(predictions: Record<string, boolean>) {
    if (lockedRef.current) return;
    lockedRef.current = true;
    lockPredictions(predictions);
  }

  function handleRevealNext() {
    setRevealIndex((i) => i + 1);
  }

  function handleRevealDone() {
    setPhase('score');
  }

  function handleNextRound() {
    const nextRound = round + 1;
    startRound(players, promptMode, customPrompts, nextRound);
  }

  function handlePlayAgain() {
    if (sqSupported) sq.endSession();
    const reset = players.map((p) => ({ ...p, totalScore: 0 }));
    setPlayers(reset);
    promptDeckRef.current = [];
    startRound(reset, promptMode, customPrompts, 1);
  }

  function handleExitConfirm() {
    Alert.alert('Quit Paranoia?', 'All scores will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: () => { if (sqSupported) sq.endSession(); onExit(); } },
    ]);
  }

  // ---- Derived ----------------------------------------------------------------
  const currentVoter = players[currentVoterIndex];
  const subject = players.find((p) => p.id === subjectId);
  const subjectVoteCount = subjectId
    ? Object.values(votes).filter((id) => id === subjectId).length
    : 0;
  const isGameOver = phase === 'score' && round >= totalRounds;

  // ---- Render -----------------------------------------------------------------

  if (sqSupported && sqModal?.type === 'assign') {
    return (
      <SidequestModal
        sidequest={sqModal.sidequest}
        onConfirm={() => {
          sq.confirmAssignment(sqModal.playerId, sqModal.sidequest);
          setSqModal(null);
        }}
      />
    );
  }

  if (sqSupported && sqModal?.type === 'check') {
    return (
      <SidequestCheckModal
        sidequest={sqModal.sidequest}
        playerName={sqModal.playerName}
        otherPlayers={players.filter((p) => p.id !== sqModal.playerId).map((p) => p.name)}
        onResolve={(outcome, catcherName) => {
          sq.resolveSidequest(sqModal.playerId, sqModal.playerName, outcome, catcherName);
          setSqModal(null);
        }}
      />
    );
  }

  switch (phase) {
    case 'prompt_mode':
      return <PromptModeSelect onSelect={handlePromptMode} />;

    case 'custom_input':
      return (
        <>
          <CustomPromptInput onDone={handleCustomDone} />
          <BackButton onPress={() => setPhase('prompt_mode')} />
        </>
      );

    case 'player_setup':
      return (
        <>
          <PlayerSetup onDone={handlePlayersReady} />
          <BackButton onPress={() => setPhase('prompt_mode')} />
        </>
      );

    case 'voting_gate':
      return (
        <>
          <PrivacyGate
            playerName={currentVoter?.name ?? ''}
            accentColor={colors.danger}
            onReady={handleVotingGateReady}
          />
          {currentVoterIndex === 0 && (
            <BackButton onPress={() => setPhase('player_setup')} />
          )}
        </>
      );

    case 'vote':
      return (
        <VoteScreen
          prompt={prompt}
          voterName={currentVoter?.name ?? ''}
          voterId={currentVoter?.id ?? ''}
          players={players}
          onVote={handleVote}
        />
      );

    case 'subject_gate':
      return (
        <PrivacyGate
          playerName={subject?.name ?? ''}
          accentColor={colors.yellow}
          onReady={handleSubjectGateReady}
        />
      );

    case 'subject_notification':
      return (
        <SubjectNotification
          subjectName={subject?.name ?? ''}
          voteCount={subjectVoteCount}
          totalVoters={players.length}
          prompt={prompt}
          onReady={handleSubjectReady}
        />
      );

    case 'interrogation':
      return (
        <InterrogationScreen
          players={players}
          subjectId={subjectId}
          subjectName={subject?.name ?? ''}
          prompt={prompt}
          timeLeft={timeLeft}
          totalTime={roundLength}
          animate={!reduced}
          onPredictionChange={handlePredictionChange}
          onLockPredictions={handleLockPredictions}
        />
      );

    case 'group_reveal':
      return (
        <GroupReveal
          players={players}
          subjectId={subjectId}
          subjectName={subject?.name ?? ''}
          votes={votes}
          predictions={subjectPredictions}
          revealIndex={revealIndex}
          allCorrect={subjectGuessedAll}
          onNext={handleRevealNext}
          onDone={handleRevealDone}
        />
      );

    case 'score':
      return (
        <ScoreBoard
          players={players}
          roundScores={roundScores}
          subjectId={subjectId}
          round={round}
          totalRounds={totalRounds}
          isGameOver={isGameOver}
          onNext={handleNextRound}
          onPlayAgain={handlePlayAgain}
          onExit={() => { if (sqSupported) sq.endSession(); onExit(); }}
        />
      );

    case 'game_over':
      return (
        <ScoreBoard
          players={players}
          roundScores={roundScores}
          subjectId={subjectId}
          round={round}
          totalRounds={totalRounds}
          isGameOver
          onNext={handleNextRound}
          onPlayAgain={handlePlayAgain}
          onExit={() => { if (sqSupported) sq.endSession(); onExit(); }}
        />
      );

    default:
      return null;
  }
}
