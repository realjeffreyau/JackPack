import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface Player {
  id: string;
  name: string;
  isMole: boolean;
  votesReceived: number;
  votedFor: string | null;
}

interface GameOverProps {
  players: Player[];
  groupPot: number;
  molePot: number;
  winner: 'group' | 'mole' | 'tie';
  onPlayAgain: () => void;
  onExit: () => void;
}

export function GameOver({
  players,
  groupPot,
  molePot,
  winner,
  onPlayAgain,
  onExit,
}: GameOverProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(reduced ? 1 : 0.5)).current;
  const opacityAnim = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [reduced, scaleAnim, opacityAnim]);

  const mole = players.find((p) => p.isMole);

  const winnerConfig = {
    group: {
      emoji: '🎉',
      title: 'MOLE CAUGHT!',
      sub: 'The group identified the traitor. Justice is served.',
      color: colors.success,
    },
    mole: {
      emoji: '🕵️',
      title: 'MOLE ESCAPES!',
      sub: `${mole?.name ?? 'The Mole'} fooled everyone and vanished into the night.`,
      color: colors.purple,
    },
    tie: {
      emoji: '🤝',
      title: 'IT\'S A TIE',
      sub: 'Nobody wins. The Mole lives to sabotage another day.',
      color: colors.yellow,
    },
  }[winner];

  const getPlayerVoteName = (votedForId: string | null) => {
    if (!votedForId) return '—';
    return players.find((p) => p.id === votedForId)?.name ?? '—';
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + spacing.xl }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.hero,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.emoji}>{winnerConfig.emoji}</Text>
        <Text
          style={[
            styles.title,
            { color: winnerConfig.color, ...glow(winnerConfig.color, 0.6) },
          ]}
        >
          {winnerConfig.title}
        </Text>
        <Text style={styles.sub}>{winnerConfig.sub}</Text>
      </Animated.View>

      {mole && (
        <View style={[styles.moleReveal, { borderColor: colors.purple + '66' }]}>
          <Text style={styles.moleRevealLabel}>THE MOLE WAS</Text>
          <Text style={[styles.moleName, { color: colors.purple, ...glow(colors.purple, 0.5) }]}>
            {mole.name} 🕵️
          </Text>
        </View>
      )}

      <View style={styles.potsRow}>
        <View style={styles.potCard}>
          <Text style={styles.potEmoji}>👥</Text>
          <Text style={styles.potLabel}>GROUP POT</Text>
          <Text
            style={[
              styles.potValue,
              {
                color: winner === 'group' ? colors.success : colors.textFaint,
                ...(winner === 'group' ? glow(colors.success, 0.4) : {}),
              },
            ]}
          >
            {winner === 'group' ? groupPot.toLocaleString() : '0'}
          </Text>
          {winner === 'group' && <Text style={styles.potWon}>WON</Text>}
        </View>
        <View style={styles.potDivider} />
        <View style={styles.potCard}>
          <Text style={styles.potEmoji}>🕵️</Text>
          <Text style={styles.potLabel}>MOLE POT</Text>
          <Text
            style={[
              styles.potValue,
              {
                color: winner === 'mole' ? colors.purple : colors.textFaint,
                ...(winner === 'mole' ? glow(colors.purple, 0.4) : {}),
              },
            ]}
          >
            {winner === 'mole' ? molePot.toLocaleString() : '0'}
          </Text>
          {winner === 'mole' && <Text style={styles.potWon}>WON</Text>}
        </View>
      </View>

      <View style={styles.votes}>
        <Text style={styles.votesTitle}>VOTING RESULTS</Text>
        {players.map((p) => (
          <View
            key={p.id}
            style={[styles.voteRow, p.isMole && styles.voteRowMole]}
          >
            <View style={styles.voteLeft}>
              <Text style={styles.voteName}>
                {p.name}
                {p.isMole ? ' 🕵️' : ''}
              </Text>
              <Text style={styles.voteFor}>Voted: {getPlayerVoteName(p.votedFor)}</Text>
            </View>
            <View style={styles.voteBadge}>
              <Text style={styles.voteBadgeText}>{p.votesReceived} vote{p.votesReceived !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton label="Play Again" icon="refresh" color={colors.purple} onPress={onPlayAgain} />
      <PrimaryButton
        label="Back to Games"
        variant="ghost"
        color={colors.textMuted}
        onPress={onExit}
        style={styles.ghostSpacing}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  moleReveal: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  moleRevealLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
  },
  moleName: {
    fontFamily: fonts.display,
    fontSize: 32,
    textAlign: 'center',
  },
  potsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  potCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  potDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  potEmoji: {
    fontSize: 24,
  },
  potLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  potValue: {
    fontFamily: fonts.display,
    fontSize: 28,
  },
  potWon: {
    fontFamily: fonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.success,
  },
  votes: {
    gap: spacing.sm,
  },
  votesTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.xs,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  voteRowMole: {
    borderColor: colors.purple + '55',
    backgroundColor: '#1A0E2E',
  },
  voteLeft: {
    flex: 1,
    gap: 2,
  },
  voteName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  voteFor: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textFaint,
  },
  voteBadge: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  voteBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  ghostSpacing: {
    marginTop: -spacing.md,
  },
});
