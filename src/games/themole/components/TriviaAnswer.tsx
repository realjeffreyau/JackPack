import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import type { MoleQuestion } from '../../../data/theMole';

interface TriviaAnswerProps {
  playerName: string;
  question: MoleQuestion;
  playerIndex: number;
  totalPlayers: number;
  onLock: (answerIndex: 0 | 1 | 2 | 3) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export function TriviaAnswer({
  playerName,
  question,
  playerIndex,
  totalPlayers,
  onLock,
}: TriviaAnswerProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<0 | 1 | 2 | 3 | null>(null);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.playerPill}>
          <Text style={styles.playerText}>
            {playerName} — {playerIndex + 1}/{totalPlayers}
          </Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.privateLabel}>YOUR PRIVATE ANSWER</Text>
        <View style={styles.questionCard}>
          <Text style={styles.question}>{question.question}</Text>
        </View>

        <View style={styles.options}>
          {question.options.map((option, i) => {
            const idx = i as 0 | 1 | 2 | 3;
            const isSelected = selected === idx;
            return (
              <Pressable
                key={i}
                onPress={() => setSelected(idx)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Option ${OPTION_LABELS[i]}: ${option}`}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  <Text style={[styles.optionLabelText, isSelected && styles.optionLabelTextSelected]}>
                    {OPTION_LABELS[i]}
                  </Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PrimaryButton
        label="Lock Answer"
        icon="lock-closed"
        color={colors.purple}
        onPress={() => selected !== null && onLock(selected)}
        disabled={selected === null}
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
  topRow: {
    marginBottom: spacing.md,
    paddingLeft: 48,
  },
  playerPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  playerText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  privateLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  question: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 28,
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
  optionSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.surface,
    ...glow(colors.purple, 0.3),
  },
  optionPressed: {
    opacity: 0.8,
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
  optionLabelSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  optionLabelText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  optionLabelTextSelected: {
    color: colors.white,
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  optionTextSelected: {
    color: colors.text,
  },
});
