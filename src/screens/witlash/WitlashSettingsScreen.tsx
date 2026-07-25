import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stepper } from '../../components/Stepper';
import { PrimaryButton } from '../../components/PrimaryButton';
import { startWitlash } from '../../multiplayer/witlash/witlashApi';
import type { WitlashSettings } from '../../multiplayer/witlash/types';
import { colors, fonts, radius, spacing } from '../../theme/theme';

const ROUND_OPTIONS = [1, 3, 5];
const MIN_TIMER = 15;
const MAX_TIMER = 120;
const TIMER_STEP = 15;

interface Props {
  lobbyId: string;
  isHost: boolean;
  activePlayerCount: number;
}

export function WitlashSettingsScreen({ lobbyId, isHost, activePlayerCount }: Props) {
  const [rounds, setRounds] = useState(3);
  const [answerTimerSec, setAnswerTimerSec] = useState(60);
  const [votingTimerSec, setVotingTimerSec] = useState(30);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roundIndex = ROUND_OPTIONS.indexOf(rounds);
  const canStart = activePlayerCount >= 3 && activePlayerCount <= 8 && !starting;

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    setError(null);
    const settings: WitlashSettings = { rounds, answerTimerSec, votingTimerSec };
    try {
      await startWitlash(lobbyId, settings);
      // No navigation here — WitlashGameScreen switches to the session-driven
      // view automatically once useLobby picks up lobby.game_session_id.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start Witlash.');
      setStarting(false);
    }
  };

  const ugcWarning = (
    <View style={styles.warning}>
      <Ionicons name="information-circle" size={18} color={colors.textMuted} />
      <Text style={styles.warningText}>Players write their own answers. Keep it fun and don't be awful.</Text>
    </View>
  );

  if (!isHost) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={colors.cyan} />
        <Text style={styles.waitingTitle}>Waiting for host to start…</Text>
        {ugcWarning}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>WITLASH SETTINGS</Text>
      <Text style={styles.title}>Set up the game</Text>

      <View style={styles.settingsCard}>
        <Stepper
          label="Rounds"
          value={rounds}
          accent={colors.cyan}
          onDecrement={() => setRounds(ROUND_OPTIONS[Math.max(0, roundIndex - 1)])}
          onIncrement={() => setRounds(ROUND_OPTIONS[Math.min(ROUND_OPTIONS.length - 1, roundIndex + 1)])}
          canDecrement={roundIndex > 0}
          canIncrement={roundIndex < ROUND_OPTIONS.length - 1}
        />
        <Stepper
          label="Answer timer"
          value={answerTimerSec}
          display={`${answerTimerSec}s`}
          accent={colors.cyan}
          onDecrement={() => setAnswerTimerSec((t) => Math.max(MIN_TIMER, t - TIMER_STEP))}
          onIncrement={() => setAnswerTimerSec((t) => Math.min(MAX_TIMER, t + TIMER_STEP))}
          canDecrement={answerTimerSec > MIN_TIMER}
          canIncrement={answerTimerSec < MAX_TIMER}
        />
        <Stepper
          label="Voting timer"
          value={votingTimerSec}
          display={`${votingTimerSec}s`}
          accent={colors.cyan}
          onDecrement={() => setVotingTimerSec((t) => Math.max(MIN_TIMER, t - TIMER_STEP))}
          onIncrement={() => setVotingTimerSec((t) => Math.min(MAX_TIMER, t + TIMER_STEP))}
          canDecrement={votingTimerSec > MIN_TIMER}
          canIncrement={votingTimerSec < MAX_TIMER}
        />
      </View>

      {ugcWarning}

      {!canStart && !starting && (
        <Text style={styles.reason}>
          {activePlayerCount < 3
            ? `Need at least 3 players (${activePlayerCount} here now).`
            : 'Witlash supports up to 8 players.'}
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label={starting ? 'Starting…' : 'Start Game'}
        icon="play"
        color={colors.cyan}
        onPress={handleStart}
        disabled={!canStart}
        style={styles.startBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  waitingTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.cyan,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  settingsCard: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  warningText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  reason: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  startBtn: {
    marginTop: spacing.xl,
  },
});
