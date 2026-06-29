import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { VerdictPlayer } from '../types';

interface Props {
  players: VerdictPlayer[];
  onPlayAgain: () => void;
  onNewGame: () => void;
  onHome: () => void;
}

export function FinalResults({ players, onPlayAgain, onNewGame, onHome }: Props) {
  const insets = useSafeAreaInsets();
  const sorted = [...players].sort((a, b) => b.credibility - a.credibility);
  const winner = sorted[0];
  const maxScore = winner.credibility;
  const winners = sorted.filter((p) => p.credibility === maxScore);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Final Verdict</Text>

        {winners.length === 1 ? (
          <>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerSub}>wins with {winner.credibility} Credibility</Text>
          </>
        ) : (
          <>
            <Text style={styles.winnerName}>{winners.map((p) => p.name).join(' & ')}</Text>
            <Text style={styles.winnerSub}>tie at {maxScore} Credibility</Text>
          </>
        )}

        <View style={styles.table}>
          {sorted.map((p, i) => (
            <View
              key={p.id}
              style={[styles.tableRow, i === 0 && p.credibility === maxScore && styles.tableRowWinner]}
            >
              <Text style={[styles.tableRank, { color: i === 0 ? colors.yellow : colors.textFaint }]}>
                {i + 1}
              </Text>
              <Text style={[styles.tableName, { color: i === 0 ? colors.text : colors.textMuted }]}>
                {p.name}
              </Text>
              <Text style={[styles.tableScore, { color: i === 0 ? colors.yellow : colors.textMuted }]}>
                {p.credibility}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Play Again (Same Players)"
          icon="refresh"
          color={colors.yellow}
          onPress={onPlayAgain}
        />
        <PrimaryButton
          label="New Game"
          variant="outline"
          color={colors.yellow}
          onPress={onNewGame}
        />
        <PrimaryButton
          label="Back to Games"
          variant="ghost"
          color={colors.textFaint}
          onPress={onHome}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  scroll: { paddingBottom: spacing.xl, alignItems: 'center' },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  winnerName: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.yellow,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  winnerSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  table: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  tableRowWinner: {
    backgroundColor: colors.yellow + '10',
  },
  tableRank: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  tableName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
  },
  tableScore: {
    fontFamily: fonts.display,
    fontSize: 22,
  },
  footer: { gap: spacing.md, paddingTop: spacing.md },
});
