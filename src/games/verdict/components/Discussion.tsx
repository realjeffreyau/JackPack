import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountdownDisplay } from '../../../components/CountdownDisplay';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../../theme/theme';
import type { ScaledCase } from '../types';

interface Props {
  scaledCase: ScaledCase;
  timeLeft: number;
  totalTime: number;
  onContinue: () => void;
}

export function Discussion({ scaledCase, timeLeft, totalTime, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const timesUp = timeLeft === 0;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.label}>Discussion</Text>
      <Text style={styles.caseTitle}>{scaledCase.template.title}</Text>

      <View style={styles.timerArea}>
        <CountdownDisplay timeLeft={timeLeft} total={totalTime} animate />
      </View>

      <View style={styles.hints}>
        <Text style={styles.hintTitle}>What to do</Text>
        <Text style={styles.hint}>Discuss the case out loud. Share what you know. Accuse people. Defend yourself.</Text>
        <Text style={styles.hint}>Your role card is private — lie if you need to.</Text>
        <Text style={styles.hint}>The group votes secretly after discussion ends.</Text>
      </View>

      {timesUp ? (
        <View style={styles.footer}>
          <Text style={styles.timesUpText}>Time's up!</Text>
          <PrimaryButton
            label="Continue to Final Arguments"
            icon="arrow-forward"
            color={colors.yellow}
            onPress={onContinue}
          />
        </View>
      ) : (
        <View style={styles.footer}>
          <PrimaryButton
            label="Skip to Final Arguments"
            variant="outline"
            color={colors.yellow}
            onPress={onContinue}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  caseTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.yellow,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timerArea: {
    marginBottom: spacing.xxl,
  },
  hints: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.sm,
    width: '100%',
    marginBottom: spacing.xl,
  },
  hintTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  footer: {
    width: '100%',
    gap: spacing.sm,
  },
  timesUpText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
