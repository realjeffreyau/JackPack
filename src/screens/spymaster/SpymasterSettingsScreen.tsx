import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { startSpymaster } from '../../multiplayer/spymaster/spymasterApi';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  lobbyId: string;
  isHost: boolean;
  activePlayerCount: number;
}

export function SpymasterSettingsScreen({ lobbyId, isHost, activePlayerCount }: Props) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = activePlayerCount === 2 && !starting;

  async function handleStart() {
    if (!canStart) return;
    setStarting(true);
    setError(null);
    try {
      await startSpymaster(lobbyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start Spymaster.');
      setStarting(false);
    }
  }

  if (!isHost) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Ionicons name="key" size={40} color={colors.cyan} />
        <ActivityIndicator size="large" color={colors.cyan} />
        <Text style={styles.waitingTitle}>You're the Spymaster key</Text>
        <Text style={styles.sub}>Waiting for the board phone to start the game…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>SPYMASTER SETUP</Text>
      <Text style={styles.title}>This phone is the game board</Text>
      <Text style={styles.sub}>
        Keep this phone where everyone can see and tap the grid. The other phone shows the hidden color key —
        hand it to whoever's calling clues.
      </Text>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
        <Text style={styles.infoText}>Spymaster needs exactly 2 phones in the lobby — one board, one key.</Text>
      </View>

      {!canStart && !starting && (
        <Text style={styles.reason}>
          {activePlayerCount < 2 ? `Waiting for the second phone (${activePlayerCount}/2).` : 'Spymaster only supports 2 phones.'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
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
    fontSize: 28,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  infoText: {
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
