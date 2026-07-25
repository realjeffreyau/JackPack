import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountdownDisplay } from '../../components/CountdownDisplay';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { WitlashMatchup } from '../../multiplayer/witlash/types';
import { colors, fonts, radius, spacing } from '../../theme/theme';

const MAX_LEN = 80;

interface Props {
  myMatchups: WitlashMatchup[];
  myAnswers: Record<string, string>; // matchup_id -> answer_text
  onSubmit: (matchupId: string, text: string) => void;
  timeLeft: number;
  answerTimerSec: number;
  roundNumber: number;
  totalRounds: number;
  submittedCount: number;
  totalActivePlayers: number;
}

export function AnsweringScreen({
  myMatchups,
  myAnswers,
  onSubmit,
  timeLeft,
  answerTimerSec,
  roundNumber,
  totalRounds,
  submittedCount,
  totalActivePlayers,
}: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      myMatchups.forEach((m) => {
        if (next[m.id] === undefined) next[m.id] = myAnswers[m.id] ?? '';
      });
      return next;
    });
  }, [myMatchups, myAnswers]);

  const allSubmitted = myMatchups.every((m) => myAnswers[m.id] !== undefined);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.roundLabel}>
            ROUND {roundNumber}/{totalRounds}
          </Text>
          <CountdownDisplay timeLeft={timeLeft} total={answerTimerSec} animate />
        </View>

        {myMatchups.map((matchup, index) => {
          const draft = drafts[matchup.id] ?? '';
          const submitted = myAnswers[matchup.id] !== undefined;
          return (
            <View key={matchup.id} style={styles.promptCard}>
              <Text style={styles.promptLabel}>PROMPT {index + 1}</Text>
              <Text style={styles.promptText}>{matchup.prompt_text}</Text>
              <TextInput
                value={draft}
                onChangeText={(t) => setDrafts((prev) => ({ ...prev, [matchup.id]: t.slice(0, MAX_LEN) }))}
                placeholder="Type your answer…"
                placeholderTextColor={colors.textFaint}
                maxLength={MAX_LEN}
                multiline
                style={styles.input}
              />
              <View style={styles.promptFooter}>
                <Text style={styles.charCount}>
                  {draft.length}/{MAX_LEN}
                </Text>
                <PrimaryButton
                  label={submitted ? 'Update' : 'Submit'}
                  size="md"
                  color={colors.cyan}
                  onPress={() => onSubmit(matchup.id, draft)}
                  disabled={draft.trim().length === 0}
                />
              </View>
              {submitted && (
                <View style={styles.savedRow}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.savedText}>Saved — you can still edit until the timer ends</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.waitingArea}>
          {allSubmitted ? (
            <Text style={styles.waitingText}>Waiting for other players…</Text>
          ) : (
            <Text style={styles.waitingText}>Answer every prompt above before the timer runs out.</Text>
          )}
          <Text style={styles.submittedCount}>
            {submittedCount}/{totalActivePlayers} players submitted
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  roundLabel: {
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
    marginBottom: spacing.lg,
  },
  promptLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.xs,
  },
  promptText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    lineHeight: 25,
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  promptFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  charCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  savedText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.success,
  },
  waitingArea: {
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  waitingText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  submittedCount: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    color: colors.textFaint,
  },
});
