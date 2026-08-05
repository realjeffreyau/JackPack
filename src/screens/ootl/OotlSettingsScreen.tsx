import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stepper } from '../../components/Stepper';
import { PrimaryButton } from '../../components/PrimaryButton';
import { startOotl } from '../../multiplayer/ootl/ootlApi';
import type { OotlSettings } from '../../multiplayer/ootl/types';
import { colors, fonts, radius, spacing } from '../../theme/theme';

const MIN_CYCLES = 1;
const MAX_CYCLES = 3;
const MIN_DISCUSSION = 30;
const MAX_DISCUSSION = 120;
const DISCUSSION_STEP = 15;

interface Props {
  lobbyId: string;
  isHost: boolean;
  activePlayerCount: number;
}

export function OotlSettingsScreen({ lobbyId, isHost, activePlayerCount }: Props) {
  const [questionCycles, setQuestionCycles] = useState(2);
  const [discussionSec, setDiscussionSec] = useState(75);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = activePlayerCount >= 4 && activePlayerCount <= 8 && !starting;

  const handleStart = async () => {
    if (!canStart) return;
    setStarting(true);
    setError(null);
    const settings: OotlSettings = { questionCycles, discussionSec };
    try {
      await startOotl(lobbyId, settings);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start The Outsider.');
      setStarting(false);
    }
  };

  const ugcWarning = (
    <View style={styles.warning}>
      <Ionicons name="information-circle" size={18} color={colors.textMuted} />
      <Text style={styles.warningText}>
        Answers are spoken out loud — the app just tracks whose turn it is.
      </Text>
    </View>
  );

  if (!isHost) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={colors.purple} />
        <Text style={styles.waitingTitle}>Waiting for host to start…</Text>
        {ugcWarning}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.root} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>THE OUTSIDER SETTINGS</Text>
      <Text style={styles.title}>Set up the game</Text>

      <View style={styles.settingsCard}>
        <Stepper
          label="Question cycles"
          value={questionCycles}
          accent={colors.purple}
          onDecrement={() => setQuestionCycles((c) => Math.max(MIN_CYCLES, c - 1))}
          onIncrement={() => setQuestionCycles((c) => Math.min(MAX_CYCLES, c + 1))}
          canDecrement={questionCycles > MIN_CYCLES}
          canIncrement={questionCycles < MAX_CYCLES}
        />
        <Stepper
          label="Discussion timer"
          value={discussionSec}
          display={`${discussionSec}s`}
          accent={colors.purple}
          onDecrement={() => setDiscussionSec((t) => Math.max(MIN_DISCUSSION, t - DISCUSSION_STEP))}
          onIncrement={() => setDiscussionSec((t) => Math.min(MAX_DISCUSSION, t + DISCUSSION_STEP))}
          canDecrement={discussionSec > MIN_DISCUSSION}
          canIncrement={discussionSec < MAX_DISCUSSION}
        />
      </View>

      {ugcWarning}

      {!canStart && !starting && (
        <Text style={styles.reason}>
          {activePlayerCount < 4
            ? `Need at least 4 players (${activePlayerCount} here now).`
            : 'The Outsider supports up to 8 players.'}
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton
        label={starting ? 'Starting…' : 'Start Game'}
        icon="play"
        color={colors.purple}
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
    color: colors.purple,
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
