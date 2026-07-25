import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface ResultSide {
  authorName: string;
  text: string;
  votes: number;
  points: number;
  isSweep: boolean;
}

interface Props {
  promptText: string;
  sideA: ResultSide;
  sideB: ResultSide;
  isHost: boolean;
  onContinue: () => void;
}

export function VoteResultsScreen({ promptText, sideA, sideB, isHost, onContinue }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>RESULTS</Text>
      <View style={styles.promptCard}>
        <Text style={styles.promptText}>{promptText}</Text>
      </View>

      <ResultCard side={sideA} />
      <ResultCard side={sideB} />

      {isHost ? (
        <PrimaryButton label="Continue" icon="arrow-forward" color={colors.cyan} onPress={onContinue} style={styles.continueBtn} />
      ) : (
        <Text style={styles.waitingText}>Waiting for host to continue…</Text>
      )}
    </View>
  );
}

function ResultCard({ side }: { side: ResultSide }) {
  return (
    <View style={[styles.card, side.isSweep && styles.cardSweep]}>
      <View style={styles.cardHeader}>
        <Text style={styles.authorName}>{side.authorName}</Text>
        {side.isSweep && (
          <View style={styles.sweepBadge}>
            <Ionicons name="flame" size={13} color={colors.bg} />
            <Text style={styles.sweepText}>SWEEP +200</Text>
          </View>
        )}
      </View>
      <Text style={styles.answerText}>{side.text}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.voteRow}>
          <Ionicons name="thumbs-up" size={14} color={colors.textMuted} />
          <Text style={styles.voteText}>
            {side.votes} {side.votes === 1 ? 'vote' : 'votes'}
          </Text>
        </View>
        <Text style={styles.points}>+{side.points} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.cyan,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  promptText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardSweep: {
    borderColor: colors.yellow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  authorName: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  sweepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  sweepText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.bg,
  },
  answerText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  points: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
    color: colors.success,
  },
  continueBtn: {
    marginTop: spacing.lg,
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
