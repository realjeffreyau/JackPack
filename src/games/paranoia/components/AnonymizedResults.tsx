import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import type { Player } from '../types';

interface Props {
  subjectName: string;
  candidates: Player[];
  votes: Record<string, string>;
  predictions: Record<string, boolean>;
  subjectId: string;
  onDone: () => void;
}

/**
 * Shown instead of the per-player reveal walk whenever the subject didn't
 * guess every vote correctly — protects voter identities while still
 * surfacing the score outcome (no player name is ever paired with a
 * vote/no-vote reality value here).
 */
export function AnonymizedResults({ subjectName, candidates, votes, predictions, subjectId, onDone }: Props) {
  const insets = useSafeAreaInsets();

  let correctGuesses = 0;
  let subjectPoints = 0;
  let othersPoints = 0;
  candidates.forEach((c) => {
    const actual = votes[c.id] === subjectId;
    const predicted = predictions[c.id] ?? false;
    if (actual === predicted) {
      correctGuesses += 1;
      subjectPoints += 100;
    } else {
      othersPoints += 150;
    }
  });

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.iconRing}>
        <Ionicons name="eye-off" size={32} color={colors.textMuted} />
      </View>

      <Text style={styles.eyebrow}>IDENTITIES STAY HIDDEN</Text>
      <Text style={styles.title}>Not a perfect read</Text>
      <Text style={styles.sub}>
        {subjectName} didn't correctly guess every vote, so nobody's vote is revealed this round.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Correct guesses</Text>
          <Text style={styles.rowValue}>
            {correctGuesses} / {candidates.length}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{subjectName} earned</Text>
          <Text style={[styles.rowValue, { color: colors.success }]}>+{subjectPoints} pts</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Group earned</Text>
          <Text style={[styles.rowValue, { color: colors.danger }]}>+{othersPoints} pts</Text>
        </View>
      </View>

      <View style={styles.buttonArea}>
        <PrimaryButton label="See Scores" icon="trophy" color={colors.lime} onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.textFaint,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...glow(colors.text, 0.03),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textMuted,
  },
  rowValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  buttonArea: {
    width: '100%',
    marginTop: spacing.xl,
  },
});
