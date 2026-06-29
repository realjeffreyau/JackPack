import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { VerdictPlayer } from '../types';

interface Props {
  players: VerdictPlayer[];
  currentRound: number;
  totalRounds: number;
  onNextRound: () => void;
  onFinalResults: () => void;
}

export function Scoreboard({ players, currentRound, totalRounds, onNextRound, onFinalResults }: Props) {
  const insets = useSafeAreaInsets();
  const isLastRound = currentRound >= totalRounds;

  const sorted = [...players].sort((a, b) => b.credibility - a.credibility);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Credibility</Text>
      <Text style={styles.sub}>After round {currentRound} of {totalRounds}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sorted.map((p, i) => {
          const isFirst = i === 0;
          return (
            <View key={p.id} style={[styles.row, isFirst && styles.rowFirst]}>
              <Text style={[styles.rank, isFirst && styles.rankFirst]}>{i + 1}</Text>
              <Text style={[styles.playerName, isFirst && styles.playerNameFirst]}>{p.name}</Text>
              <Text style={[styles.score, isFirst && styles.scoreFirst]}>{p.credibility}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {isLastRound ? (
          <PrimaryButton
            label="Final Results"
            icon="trophy"
            color={colors.yellow}
            onPress={onFinalResults}
          />
        ) : (
          <PrimaryButton
            label={`Round ${currentRound + 1} →`}
            icon="arrow-forward"
            color={colors.yellow}
            onPress={onNextRound}
          />
        )}
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
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  rowFirst: {
    backgroundColor: colors.yellow + '18',
    borderColor: colors.yellow,
  },
  rank: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.textFaint,
    width: 24,
    textAlign: 'center',
  },
  rankFirst: {
    color: colors.yellow,
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.text,
  },
  playerNameFirst: {
    color: colors.yellow,
    fontFamily: fonts.bodyBold,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textMuted,
  },
  scoreFirst: {
    color: colors.yellow,
  },
  footer: { paddingTop: spacing.md },
});
