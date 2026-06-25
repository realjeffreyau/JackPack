import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import type { Player } from '../types';

interface Props {
  players: Player[];
  roundScores: Record<string, number>;
  subjectId: string;
  round: number;
  totalRounds: number;
  isGameOver: boolean;
  onNext: () => void;
  onPlayAgain: () => void;
  onExit: () => void;
}

export function ScoreBoard({
  players,
  roundScores,
  subjectId,
  round,
  totalRounds,
  isGameOver,
  onNext,
  onPlayAgain,
  onExit,
}: Props) {
  const insets = useSafeAreaInsets();
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const leader = sorted[0];

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.header}>
        {isGameOver ? (
          <>
            <Text style={styles.emoji}>🏆</Text>
            <Text style={styles.title}>Game Over</Text>
            <Text style={styles.sub}>{leader?.name} wins!</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              Round {round} / {totalRounds}
            </Text>
            <Text style={styles.sub}>Score Update</Text>
          </>
        )}
      </View>

      <Text style={styles.sectionLabel}>LEADERBOARD</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {sorted.map((player, index) => {
          const gained = roundScores[player.id] ?? 0;
          const isSubject = player.id === subjectId;
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

          return (
            <View
              key={player.id}
              style={[
                styles.row,
                index === 0 && styles.rowFirst,
              ]}
            >
              <Text style={styles.rank}>{medal ?? `#${index + 1}`}</Text>
              <View style={styles.nameCol}>
                <Text style={styles.playerName}>
                  {player.name}
                  {isSubject ? ' 🔥' : ''}
                </Text>
                {gained > 0 && (
                  <Text style={styles.gained}>+{gained} this round</Text>
                )}
              </View>
              <Text style={[styles.score, index === 0 && styles.scoreFirst]}>
                {player.totalScore}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {isGameOver ? (
        <View style={styles.actions}>
          <PrimaryButton label="Play Again" icon="refresh" color={colors.lime} onPress={onPlayAgain} />
          <PrimaryButton
            label="Back to Games"
            variant="ghost"
            color={colors.textMuted}
            onPress={onExit}
            style={styles.ghostBtn}
          />
        </View>
      ) : (
        <PrimaryButton
          label="Next Round"
          icon="arrow-forward"
          color={colors.lime}
          onPress={onNext}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A1A0A',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.lime,
    marginTop: spacing.xs,
    ...glow(colors.lime, 0.3),
  },
  sectionLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  listContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowFirst: {
    borderColor: colors.lime + '88',
    backgroundColor: colors.lime + '10',
  },
  rank: {
    fontFamily: fonts.display,
    fontSize: 22,
    width: 36,
    textAlign: 'center',
    color: colors.textMuted,
  },
  nameCol: {
    flex: 1,
    gap: 2,
  },
  playerName: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.text,
  },
  gained: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.lime,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.textMuted,
  },
  scoreFirst: {
    color: colors.lime,
    ...glow(colors.lime, 0.4),
  },
  actions: {
    gap: spacing.sm,
  },
  ghostBtn: {
    marginTop: spacing.xs,
  },
});
