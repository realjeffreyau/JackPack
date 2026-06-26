import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { MoleQuestion } from '../../../data/theMole';

interface TriviaQuestionProps {
  question: MoleQuestion;
  currentRound: number;
  totalRounds: number;
  revealChoices?: boolean;
  onStartAnswering: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Knowledge',
  science: 'Science & Nature',
  history: 'History & Geography',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export function TriviaQuestion({
  question,
  currentRound,
  totalRounds,
  revealChoices = false,
  onStartAnswering,
}: TriviaQuestionProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.roundPill}>
          <Text style={styles.roundText}>
            ROUND {currentRound}/{totalRounds}
          </Text>
        </View>
        <View style={styles.catPill}>
          <Text style={styles.catText}>{CATEGORY_LABELS[question.category]}</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.groupLabel}>GROUP QUESTION</Text>
        <View style={styles.questionCard}>
          <Text style={styles.question}>{question.question}</Text>
        </View>
        {revealChoices && (
          <View style={styles.options}>
            {question.options.map((option, i) => (
              <View key={i} style={styles.option}>
                <View style={styles.optionLabel}>
                  <Text style={styles.optionLabelText}>{OPTION_LABELS[i]}</Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.optionsHint}>Discuss out loud before anyone locks in their answer.</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.hint}>When you're ready, pass the phone to answer privately.</Text>
        <PrimaryButton
          label="Start Answering"
          icon="arrow-forward"
          color={colors.purple}
          onPress={onStartAnswering}
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
  topRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  roundPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  roundText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  catPill: {
    backgroundColor: colors.purple + '22',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.purple + '44',
  },
  catText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.purple,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  groupLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  question: {
    fontFamily: fonts.displaySemi,
    fontSize: 26,
    lineHeight: 36,
    color: colors.text,
    textAlign: 'center',
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    minHeight: 52,
  },
  optionLabel: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionLabelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  optionsHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottom: {
    gap: spacing.md,
  },
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
