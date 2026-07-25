import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountdownDisplay } from '../../components/CountdownDisplay';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  promptText: string;
  answerAText: string;
  answerBText: string;
  answerAId: string;
  answerBId: string;
  isEligible: boolean;
  myVoteAnswerId: string | null;
  onVote: (answerId: string) => void;
  timeLeft: number;
  votingTimerSec: number;
}

export function MatchupVotingScreen({
  promptText,
  answerAText,
  answerBText,
  answerAId,
  answerBId,
  isEligible,
  myVoteAnswerId,
  onVote,
  timeLeft,
  votingTimerSec,
}: Props) {
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleVote = (answerId: string) => {
    if (!isEligible || myVoteAnswerId || submitting) return;
    setSubmitting(answerId);
    onVote(answerId);
  };

  const hasVoted = myVoteAnswerId !== null;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.kicker}>VOTE FOR THE FUNNIER ANSWER</Text>
        <CountdownDisplay timeLeft={timeLeft} total={votingTimerSec} animate />
      </View>

      <View style={styles.promptCard}>
        <Text style={styles.promptText}>{promptText}</Text>
      </View>

      {!isEligible ? (
        <View style={styles.waitingBox}>
          <Ionicons name="eye-off" size={28} color={colors.textFaint} />
          <Text style={styles.waitingText}>You answered this prompt. Waiting for votes.</Text>
        </View>
      ) : (
        <View style={styles.answers}>
          <AnswerButton
            label="A"
            text={answerAText}
            selected={myVoteAnswerId === answerAId}
            disabled={hasVoted}
            onPress={() => handleVote(answerAId)}
          />
          <AnswerButton
            label="B"
            text={answerBText}
            selected={myVoteAnswerId === answerBId}
            disabled={hasVoted}
            onPress={() => handleVote(answerBId)}
          />
          {hasVoted && <Text style={styles.votedText}>Vote submitted — waiting for others…</Text>}
        </View>
      )}
    </View>
  );
}

function AnswerButton({
  label,
  text,
  selected,
  disabled,
  onPress,
}: {
  label: string;
  text: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Answer ${label}: ${text}`}
      style={({ pressed }) => [
        styles.answerBtn,
        selected && styles.answerBtnSelected,
        { opacity: disabled && !selected ? 0.5 : 1, transform: [{ scale: pressed && !disabled ? 0.98 : 1 }] },
      ]}
    >
      <View style={styles.answerLabelWrap}>
        <Text style={styles.answerLabel}>{label}</Text>
      </View>
      <Text style={styles.answerText}>{text}</Text>
      {selected && <Ionicons name="checkmark-circle" size={22} color={colors.cyan} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.cyan,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  promptText: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 27,
    color: colors.text,
    textAlign: 'center',
  },
  answers: {
    gap: spacing.md,
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 64,
  },
  answerBtnSelected: {
    borderColor: colors.cyan,
    backgroundColor: colors.cyan + '18',
  },
  answerLabelWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerLabel: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
  },
  answerText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  votedText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  waitingBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
  },
  waitingText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
