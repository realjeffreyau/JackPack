import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';

interface RoundRecapProps {
  currentRound: number;
  totalRounds: number;
  correctCount: number;
  incorrectCount: number;
  groupPot: number;
  molePot: number;
  groupThreshold: number;
  moleThreshold: number;
  onNext: () => void;
  isLastRound: boolean;
}

export function RoundRecap({
  currentRound,
  totalRounds,
  correctCount,
  incorrectCount,
  groupPot,
  molePot,
  groupThreshold,
  moleThreshold,
  onNext,
  isLastRound,
}: RoundRecapProps) {
  const insets = useSafeAreaInsets();
  const groupPct = groupThreshold > 0 ? Math.min(100, (groupPot / groupThreshold) * 100) : 0;
  const molePct = moleThreshold > 0 ? Math.min(100, (molePot / moleThreshold) * 100) : 0;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.roundLabel}>ROUND {currentRound} RECAP</Text>
        <Text style={styles.progress}>
          {currentRound} of {totalRounds}
        </Text>
      </View>

      <View style={styles.center}>
        <View style={styles.resultsRow}>
          <View style={[styles.resultCard, styles.correctCard]}>
            <Text style={styles.resultCount}>{correctCount}</Text>
            <Text style={[styles.resultLabel, { color: colors.success }]}>CORRECT</Text>
          </View>
          <View style={[styles.resultCard, styles.incorrectCard]}>
            <Text style={styles.resultCount}>{incorrectCount}</Text>
            <Text style={[styles.resultLabel, { color: colors.danger }]}>WRONG</Text>
          </View>
        </View>

        <View style={styles.potsSection}>
          <Text style={styles.potsTitle}>PROGRESS TO AUTO-WIN</Text>
          <View style={styles.potsRow}>
            <View style={styles.potCard}>
              <Text style={styles.potEmoji}>👥</Text>
              <Text style={styles.potLabel}>GROUP POT</Text>
              <Text style={[styles.potValue, { color: colors.success, ...glow(colors.success, 0.4) }]}>
                {groupPot.toLocaleString()}
              </Text>
              <Text style={styles.potTarget}>/ {groupThreshold.toLocaleString()}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${groupPct}%`, backgroundColor: colors.success }]} />
              </View>
            </View>
            <View style={styles.potDivider} />
            <View style={styles.potCard}>
              <Text style={styles.potEmoji}>🕵️</Text>
              <Text style={styles.potLabel}>MOLE POT</Text>
              <Text style={[styles.potValue, { color: colors.purple, ...glow(colors.purple, 0.4) }]}>
                {molePot.toLocaleString()}
              </Text>
              <Text style={styles.potTarget}>/ {moleThreshold.toLocaleString()}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${molePct}%`, backgroundColor: colors.purple }]} />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.suspicion}>
          {incorrectCount > correctCount
            ? 'More wrong answers than right... Someone might be playing you. 👀'
            : incorrectCount === 0
            ? 'Everyone answered correctly. The Mole is well hidden.'
            : 'Stay sharp. The Mole is out there.'}
        </Text>
      </View>

      <PrimaryButton
        label={isLastRound ? 'Time to Vote' : 'Next Round'}
        icon={isLastRound ? 'checkmark-circle' : 'arrow-forward'}
        color={colors.purple}
        onPress={onNext}
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
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  roundLabel: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  progress: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textFaint,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  resultsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  resultCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  correctCard: {
    backgroundColor: colors.success + '11',
    borderColor: colors.success + '44',
  },
  incorrectCard: {
    backgroundColor: colors.danger + '11',
    borderColor: colors.danger + '44',
  },
  resultCount: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.text,
  },
  resultLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  potsSection: {
    gap: spacing.md,
  },
  potsTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    textAlign: 'center',
  },
  potsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  potCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  potDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  potEmoji: {
    fontSize: 24,
  },
  potLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  potValue: {
    fontFamily: fonts.display,
    fontSize: 28,
  },
  potTarget: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.textFaint,
    marginTop: -2,
  },
  barTrack: {
    width: '100%',
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  suspicion: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
