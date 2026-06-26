import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { summarizeVotes } from '../agenda';
import type { AgendaResult, Player } from '../types';

interface Props {
  accent: string;
  players: Player[];
  votes: Record<string, number>;
  results: AgendaResult[];
  isLastRound: boolean; // fixed mode, final round
  onPrimary: () => void; // Next Round or Final Results
  onScoreboard: () => void;
  onEndGame: () => void;
}

export function RoundReveal({ accent, players, votes, results, isLastRound, onPrimary, onScoreboard, onEndGame }: Props) {
  const insets = useSafeAreaInsets();
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '?';
  const { highest, topIds, tie } = summarizeVotes(players, votes);

  const summary = tie
    ? `Tie between ${topIds.map(nameOf).join(', ')} with ${highest} vote${highest === 1 ? '' : 's'}.`
    : `${nameOf(topIds[0])} received the most votes with ${highest} vote${highest === 1 ? '' : 's'}.`;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + spacing.xl }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.kicker}>AGENDAS REVEALED</Text>
      <View style={[styles.summaryCard, { borderColor: accent + '55' }]}>
        <Text style={styles.summaryLabel}>VOTE RESULT</Text>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      <View style={styles.list}>
        {results.map((r) => (
          <View key={r.ownerId} style={[styles.card, { borderColor: r.success ? colors.success + '66' : colors.border }]}>
            <View style={styles.cardHead}>
              <Text style={styles.player}>{nameOf(r.ownerId)}</Text>
              <View style={[styles.badge, { backgroundColor: r.success ? colors.success : colors.surfaceAlt }]}>
                <Text style={[styles.badgeText, { color: r.success ? colors.black : colors.textFaint }]}>
                  {r.success ? 'SUCCESS +1' : 'FAILED +0'}
                </Text>
              </View>
            </View>
            <Text style={styles.agenda}>{r.agendaText}</Text>
            <Text style={styles.reason}>{r.reason}</Text>
          </View>
        ))}
      </View>

      <PrimaryButton
        label={isLastRound ? 'Final Results' : 'Next Round'}
        icon={isLastRound ? 'trophy' : 'arrow-forward'}
        color={accent}
        onPress={onPrimary}
      />
      <View style={styles.secondaryRow}>
        <PrimaryButton label="Scoreboard" variant="outline" size="md" color={colors.textMuted} onPress={onScoreboard} style={styles.flex} />
        {!isLastRound && (
          <PrimaryButton label="End Game" variant="outline" size="md" color={colors.textMuted} onPress={onEndGame} style={styles.flex} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  kicker: { fontFamily: fonts.bodyExtra, fontSize: 12, letterSpacing: 2, color: colors.cyan, textAlign: 'center' },
  summaryCard: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    ...glow(colors.cyan, 0.15),
  },
  summaryLabel: { fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 1.5, color: colors.textFaint },
  summaryText: { fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 24, color: colors.text, textAlign: 'center' },
  list: { gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  player: { flex: 1, fontFamily: fonts.display, fontSize: 20, color: colors.text },
  badge: { borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: spacing.md },
  badgeText: { fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 0.5 },
  agenda: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text, lineHeight: 21 },
  reason: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  secondaryRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
