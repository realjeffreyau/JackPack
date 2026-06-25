import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountdownDisplay } from '../../../components/CountdownDisplay';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { Player } from '../types';

interface Props {
  players: Player[];
  subjectId: string;
  subjectName: string;
  prompt: string;
  timeLeft: number;
  totalTime: number;
  animate: boolean;
  onPredictionChange: (predictions: Record<string, boolean>) => void;
  onLockPredictions: (predictions: Record<string, boolean>) => void;
}

export function InterrogationScreen({
  players,
  subjectId,
  subjectName,
  prompt,
  timeLeft,
  totalTime,
  animate,
  onPredictionChange,
  onLockPredictions,
}: Props) {
  const insets = useSafeAreaInsets();
  const [predictions, setPredictions] = useState<Record<string, boolean>>({});

  const candidates = players.filter((p) => p.id !== subjectId);
  const allPredicted = candidates.every((p) => p.id in predictions);

  function toggle(playerId: string, voted: boolean) {
    const updated = { ...predictions, [playerId]: voted };
    setPredictions(updated);
    onPredictionChange(updated);
  }

  function handleLock() {
    const final: Record<string, boolean> = {};
    candidates.forEach((p) => {
      final[p.id] = predictions[p.id] ?? false;
    });
    onLockPredictions(final);
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.topBar}>
        <View style={styles.timerWrap}>
          <CountdownDisplay timeLeft={timeLeft} total={totalTime} animate={animate} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.hotSeatLabel}>HOT SEAT</Text>
          <Text style={styles.subjectName}>{subjectName}</Text>
          <View style={styles.promptMini}>
            <Text style={styles.promptMiniText} numberOfLines={2}>{prompt}</Text>
          </View>
          <Text style={styles.instruction}>
            Ask questions, read the room, then mark who you think voted for you.
          </Text>
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {candidates.map((player) => {
          const pred = predictions[player.id];
          return (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View style={styles.toggles}>
                <Pressable
                  onPress={() => toggle(player.id, true)}
                  style={[styles.toggle, pred === true && styles.toggleActiveYes]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: pred === true }}
                  accessibilityLabel={`${player.name} voted for me`}
                >
                  <Text style={[styles.toggleLabel, pred === true && styles.toggleLabelActiveYes]}>
                    Voted
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => toggle(player.id, false)}
                  style={[styles.toggle, pred === false && styles.toggleActiveNo]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: pred === false }}
                  accessibilityLabel={`${player.name} did not vote for me`}
                >
                  <Text style={[styles.toggleLabel, pred === false && styles.toggleLabelActiveNo]}>
                    Didn't
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label={allPredicted ? 'Lock Predictions' : `${candidates.length - Object.keys(predictions).length} left to predict`}
        icon={allPredicted ? 'lock-closed' : undefined}
        color={colors.yellow}
        onPress={handleLock}
        disabled={!allPredicted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#131000',
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    marginBottom: spacing.lg,
  },
  timerWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metaRow: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  hotSeatLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.yellow,
  },
  subjectName: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  promptMini: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.yellow + '44',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  promptMiniText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  instruction: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
  list: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  listContent: {
    gap: spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.text,
  },
  toggles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  toggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  },
  toggleActiveYes: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '22',
  },
  toggleActiveNo: {
    borderColor: colors.success,
    backgroundColor: colors.success + '22',
  },
  toggleLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
  },
  toggleLabelActiveYes: {
    color: colors.danger,
  },
  toggleLabelActiveNo: {
    color: colors.success,
  },
});
