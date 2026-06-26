import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { loadSounds, unloadSounds } from './sounds';
import type { GameEngineProps } from '../../types/game';
import { colors } from '../../theme/theme';
import { WORD_CARDS, randomBombDuration, type TimerMode, type WordCard } from '../../data/outblurt';
import { shuffle } from '../../utils/deck';
import { TimerModeSelect } from './components/TimerModeSelect';
import { TeamSetup } from './components/TeamSetup';
import { BombPlay } from './components/BombPlay';
import { ExplosionResult } from './components/ExplosionResult';
import { StandingsModal } from './components/StandingsModal';
import { ManageTeamsModal } from './components/ManageTeamsModal';
import { useBombTimer, type BombStage } from './useBombTimer';
import type { Team } from './types';

type Phase = 'timer_select' | 'team_setup' | 'active' | 'exploded';

const ACCENT = colors.orange;

/**
 * Outblurt — Hot Potato × Taboo. The engine owns the whole session: timer-mode
 * pick, team setup, the endless bomb loop, explosion scoring, and the standings
 * / manage-teams overlays. There are no rounds and no automatic game over — the
 * group decides when to stop.
 */
export function OutblurtEngine({ onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('timer_select');
  const [mode, setMode] = useState<TimerMode>('medium');
  const [teams, setTeams] = useState<Team[]>([]);
  const [card, setCard] = useState<WordCard | null>(null);
  const [stage, setStage] = useState<BombStage>(0);
  const [assignedTeamId, setAssignedTeamId] = useState<string | null>(null);
  const [standingsOpen, setStandingsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  // No-repeat card pile until the bank is exhausted, then reshuffle.
  const cardPile = useRef<WordCard[]>(shuffle(WORD_CARDS));
  const drawCard = useCallback((): WordCard => {
    if (cardPile.current.length === 0) cardPile.current = shuffle(WORD_CARDS);
    return cardPile.current.pop()!;
  }, []);

  const handleExplode = useCallback(() => {
    setAssignedTeamId(null);
    setStage(0);
    setPhase('exploded');
  }, []);

  const timer = useBombTimer({ onStage: setStage, onExplode: handleExplode });

  // Preload sounds on mount, release on unmount.
  useEffect(() => {
    loadSounds();
    return () => { unloadSounds(); };
  }, []);

  // ── Bomb cycle ───────────────────────────────────────────────────────────────

  const startBomb = useCallback(
    (forMode: TimerMode) => {
      setCard(drawCard());
      setStage(0);
      setAssignedTeamId(null);
      timer.start(randomBombDuration(forMode));
      setPhase('active');
    },
    [drawCard, timer],
  );

  const handleModeDone = useCallback((m: TimerMode) => {
    setMode(m);
    setPhase('team_setup');
  }, []);

  const handleTeamsDone = useCallback(
    (newTeams: Team[]) => {
      setTeams(newTeams);
      startBomb(mode);
    },
    [mode, startBomb],
  );

  const handleNextWord = useCallback(() => {
    // New card only — the hidden timer keeps running, untouched.
    setCard(drawCard());
  }, [drawCard]);

  const handleAssignPoint = useCallback(
    (teamId: string) => {
      // Guard against double-assigning the same explosion.
      if (assignedTeamId !== null) return;
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, points: t.points + 1 } : t)));
      setAssignedTeamId(teamId);
    },
    [assignedTeamId],
  );

  const handleNextBomb = useCallback(() => {
    startBomb(mode);
  }, [mode, startBomb]);

  // ── Overlays ─────────────────────────────────────────────────────────────────

  const openStandings = useCallback(() => setStandingsOpen(true), []);

  const openManage = useCallback(() => {
    if (phase === 'active') timer.pause(); // don't punish anyone while editing
    setStandingsOpen(false);
    setManageOpen(true);
  }, [phase, timer]);

  const closeManage = useCallback(() => {
    setManageOpen(false);
    if (phase === 'active') timer.resume();
  }, [phase, timer]);

  const handleManageSave = useCallback(
    (next: Team[]) => {
      setTeams(next);
      closeManage();
    },
    [closeManage],
  );

  const resetPoints = useCallback(() => {
    setTeams((prev) => prev.map((t) => ({ ...t, points: 0 })));
  }, []);

  // ── Exit ───────────────────────────────────────────────────────────────────

  const exitNow = useCallback(() => {
    timer.stop();
    onExit();
  }, [timer, onExit]);

  const confirmExit = useCallback(() => {
    Alert.alert('Quit Outblurt?', 'Team scores will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: exitNow },
    ]);
  }, [exitNow]);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (phase === 'timer_select') {
    return <TimerModeSelect accent={ACCENT} initialMode={mode} onDone={handleModeDone} onExit={onExit} />;
  }

  if (phase === 'team_setup') {
    return <TeamSetup accent={ACCENT} onDone={handleTeamsDone} onBack={() => setPhase('timer_select')} />;
  }

  return (
    <>
      {phase === 'active' && card && (
        <BombPlay
          accent={ACCENT}
          teams={teams}
          card={card}
          stage={stage}
          onNextWord={handleNextWord}
          onOpenStandings={openStandings}
          onOpenManageTeams={openManage}
          onExit={confirmExit}
        />
      )}

      {phase === 'exploded' && (
        <ExplosionResult
          accent={ACCENT}
          teams={teams}
          assignedTeamId={assignedTeamId}
          onAssign={handleAssignPoint}
          onNextBomb={handleNextBomb}
          onOpenStandings={openStandings}
          onOpenManageTeams={openManage}
          onExit={exitNow}
        />
      )}

      <StandingsModal
        visible={standingsOpen}
        accent={ACCENT}
        teams={teams}
        onClose={() => setStandingsOpen(false)}
        onEditTeams={openManage}
        onResetPoints={resetPoints}
        onExit={exitNow}
      />

      <ManageTeamsModal
        visible={manageOpen}
        accent={ACCENT}
        teams={teams}
        onSave={handleManageSave}
        onCancel={closeManage}
      />
    </>
  );
}
