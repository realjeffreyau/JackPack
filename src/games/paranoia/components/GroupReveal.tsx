import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import type { Player } from '../types';

interface Props {
  players: Player[];
  subjectId: string;
  subjectName: string;
  votes: Record<string, string>;
  predictions: Record<string, boolean>;
  revealIndex: number;
  onNext: () => void;
  onDone: () => void;
}

export function GroupReveal({
  players,
  subjectId,
  subjectName,
  votes,
  predictions,
  revealIndex,
  onNext,
  onDone,
}: Props) {
  const insets = useSafeAreaInsets();
  const candidates = players.filter((p) => p.id !== subjectId);
  const current = candidates[revealIndex];
  const isLast = revealIndex >= candidates.length - 1;

  if (!current) return null;

  const actual = votes[current.id] === subjectId;
  const predicted = predictions[current.id] ?? false;
  const correct = actual === predicted;

  const cardBorderColor = correct ? colors.success : colors.danger;
  const cardBg = correct ? colors.success + '12' : colors.danger + '12';
  const resultLabel = correct
    ? `${subjectName} +100 pts`
    : `${current.name} +150 pts`;
  const resultColor = correct ? colors.success : colors.danger;
  const resultIcon = correct ? 'checkmark-circle' : 'close-circle';

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.counter}>
          {revealIndex + 1} / {candidates.length}
        </Text>
        <Text style={styles.title}>The Reveal</Text>
      </View>

      <View style={styles.cardWrap}>
        <View style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBg }]}>
          <Text style={styles.playerName}>{current.name}</Text>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>
                {subjectName} predicted
              </Text>
              <Text style={[styles.colValue, { color: predicted ? colors.danger : colors.textMuted }]}>
                {predicted ? 'Voted for me' : "Didn't vote"}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.col}>
              <Text style={styles.colLabel}>Reality</Text>
              <Text style={[styles.colValue, { color: actual ? colors.danger : colors.textMuted }]}>
                {actual ? 'Voted for you' : "Didn't vote"}
              </Text>
            </View>
          </View>

          <View style={[styles.result, { borderTopColor: cardBorderColor + '44' }]}>
            <Ionicons name={resultIcon} size={28} color={resultColor} />
            <Text style={[styles.resultText, { color: resultColor }, glow(resultColor, 0.4)]}>
              {resultLabel}
            </Text>
          </View>
        </View>
      </View>

      <PrimaryButton
        label={isLast ? 'See Scores' : 'Next'}
        icon={isLast ? 'trophy' : 'arrow-forward'}
        color={colors.lime}
        onPress={isLast ? onDone : onNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  counter: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
  },
  cardWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: spacing.xl,
    gap: spacing.xl,
  },
  playerName: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.text,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  colLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
    textAlign: 'center',
  },
  colValue: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    paddingTop: spacing.lg,
  },
  resultText: {
    fontFamily: fonts.display,
    fontSize: 24,
  },
});
