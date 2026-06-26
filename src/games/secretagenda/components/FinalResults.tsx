import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { leaderIds, type Player } from '../types';

interface Props {
  accent: string;
  players: Player[];
  onPlayAgain: () => void;
  onEditPlayers: () => void;
  onNewGame: () => void;
  onExit: () => void;
}

export function FinalResults({ accent, players, onPlayAgain, onEditPlayers, onNewGame, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(reduced ? 1 : 0.5)).current;
  const opacity = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [reduced, scale, opacity]);

  const sorted = [...players].sort((a, b) => b.points - a.points);
  const winners = leaderIds(players);
  const winnerNames = players.filter((p) => winners.includes(p.id)).map((p) => p.name);
  const title = winnerNames.length === 0 ? 'No Winner Yet' : winnerNames.length > 1 ? 'Winners' : 'Winner';
  const winnerLine = winnerNames.length === 0 ? 'Nobody scored a point.' : winnerNames.join(', ');

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + spacing.xl }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.hero, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.emoji}>🎭</Text>
        <Text style={styles.heroTitle}>Final Results</Text>
        <Text style={styles.heroSub}>Most successful agendas wins.</Text>
      </Animated.View>

      <View style={[styles.winnerCard, { borderColor: accent + '66' }]}>
        <Text style={styles.winnerLabel}>{title.toUpperCase()}</Text>
        <Text style={[styles.winnerName, { color: accent, ...glow(accent, 0.5) }]}>{winnerLine}</Text>
      </View>

      <View style={styles.list}>
        {sorted.map((p, i) => {
          const isWinner = winners.includes(p.id);
          return (
            <View key={p.id} style={[styles.row, isWinner && { borderColor: accent + '66' }]}>
              <Text style={styles.rank}>{i + 1}</Text>
              <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
              <Text style={[styles.points, isWinner && { color: accent }]}>{p.points} pt{p.points === 1 ? '' : 's'}</Text>
            </View>
          );
        })}
      </View>

      <PrimaryButton label="Play Again (Same Players)" icon="refresh" color={accent} onPress={onPlayAgain} />
      <View style={styles.secondaryRow}>
        <PrimaryButton label="Edit Players" variant="outline" size="md" color={colors.textMuted} onPress={onEditPlayers} style={styles.flex} />
        <PrimaryButton label="New Game" variant="outline" size="md" color={colors.textMuted} onPress={onNewGame} style={styles.flex} />
      </View>
      <PrimaryButton label="Home" variant="ghost" color={colors.textMuted} onPress={onExit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  hero: { alignItems: 'center', gap: spacing.xs },
  emoji: { fontSize: 72 },
  heroTitle: { fontFamily: fonts.display, fontSize: 40, color: colors.text, textAlign: 'center' },
  heroSub: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  winnerCard: { backgroundColor: colors.bgElevated, borderWidth: 1.5, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  winnerLabel: { fontFamily: fonts.bodyExtra, fontSize: 12, letterSpacing: 2, color: colors.textFaint },
  winnerName: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center' },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rank: { fontFamily: fonts.display, fontSize: 16, color: colors.textFaint, width: 22 },
  name: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  points: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  secondaryRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
