import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { ScaledCase } from '../types';

interface Props {
  round: number;
  totalRounds: number;
  scaledCase: ScaledCase;
  onBegin: () => void;
}

export function RoundIntro({ round, totalRounds, scaledCase, onBegin }: Props) {
  const insets = useSafeAreaInsets();
  const { template } = scaledCase;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.roundLabel}>Round {round} of {totalRounds}</Text>
        <Text style={styles.caseTitle}>{template.title}</Text>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{template.category}</Text>
        </View>

        <View style={styles.introBox}>
          <Text style={styles.introText}>{template.intro}</Text>
        </View>

        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>How this round works</Text>
          <Text style={styles.rulesItem}>1. Each player privately reads their role card.</Text>
          <Text style={styles.rulesItem}>2. Discuss the case — lie, mislead, or tell the truth.</Text>
          <Text style={styles.rulesItem}>3. Everyone votes in secret, passing the phone.</Text>
          <Text style={styles.rulesItem}>4. The truth is revealed. Points are awarded.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Deal Role Cards"
          icon="arrow-forward"
          color={colors.yellow}
          onPress={onBegin}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  scroll: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  roundLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  caseTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.yellow,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  categoryPill: {
    backgroundColor: colors.yellow + '18',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xl,
  },
  categoryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.yellow,
  },
  introBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: colors.yellow,
    width: '100%',
  },
  introText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 17,
    color: colors.text,
    lineHeight: 26,
  },
  rulesBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  rulesTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  rulesItem: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
