import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { WordCard } from '../../../data/outblurt';
import { losingTeamIds, type Team } from '../types';
import type { BombStage } from '../useBombTimer';

interface Props {
  accent: string;
  teams: Team[];
  card: WordCard;
  stage: BombStage;
  onNextWord: () => void;
  onOpenStandings: () => void;
  onOpenManageTeams: () => void;
  onExit: () => void;
}

// Pulse cadence (ms for one beat) per urgency stage — faster as the bomb nears.
const PULSE_DURATION: Record<BombStage, number> = { 0: 1100, 1: 800, 2: 500, 3: 280 };

export function BombPlay({
  accent,
  teams,
  card,
  stage,
  onNextWord,
  onOpenStandings,
  onOpenManageTeams,
  onExit,
}: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const losing = losingTeamIds(teams);

  const pulse = useRef(new Animated.Value(0)).current;
  const tint = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  // Restart the pulse loop whenever urgency changes so it visibly speeds up.
  useEffect(() => {
    loopRef.current?.stop();
    if (reduced) {
      pulse.setValue(0);
      return;
    }
    pulse.setValue(0);
    const beat = PULSE_DURATION[stage];
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: beat, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: beat, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loopRef.current.start();
    return () => loopRef.current?.stop();
  }, [stage, reduced, pulse]);

  // Warm the background as the hidden timer drains (never a numeric readout).
  useEffect(() => {
    Animated.timing(tint, {
      toValue: stage,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [stage, tint]);

  const bombScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, stage >= 2 ? 1.18 : 1.08] });
  const bgColor = tint.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [colors.bg, colors.bg, '#1E0E1A', '#2A0C12'],
  });

  return (
    <Animated.View style={[styles.root, { backgroundColor: bgColor, paddingTop: insets.top + spacing.md }]}>
      {/* Top bar: title + quit */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Outblurt</Text>
        <Pressable
          onPress={onExit}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Exit game"
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Compact scoreboard */}
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreCaption}>Most points loses</Text>
        <View style={styles.scoreActions}>
          <Pressable
            onPress={onOpenStandings}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View standings"
            style={({ pressed }) => [styles.miniBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="podium-outline" size={16} color={colors.textMuted} />
            <Text style={styles.miniBtnText}>Standings</Text>
          </Pressable>
          <Pressable
            onPress={onOpenManageTeams}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit teams"
            style={({ pressed }) => [styles.miniBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="create-outline" size={16} color={colors.textMuted} />
            <Text style={styles.miniBtnText}>Edit</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scoreStrip}
        style={styles.scoreStripWrap}
      >
        {teams.map((t) => {
          const isLosing = losing.includes(t.id);
          return (
            <View
              key={t.id}
              style={[styles.scoreChip, isLosing && { borderColor: colors.danger + '99', backgroundColor: '#2A0C12' }]}
            >
              <Text style={styles.scoreName} numberOfLines={1}>
                {t.name}
              </Text>
              <Text style={[styles.scorePoints, isLosing && { color: colors.danger }]}>{t.points}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Bomb + word card */}
      <View style={styles.center}>
        <Animated.Text style={[styles.bomb, { transform: [{ scale: bombScale }] }]}>💣</Animated.Text>

        <Text style={styles.cardLabel}>DESCRIBE THIS</Text>
        <Text style={styles.target} adjustsFontSizeToFit numberOfLines={2}>
          {card.targetWord}
        </Text>

        <Text style={styles.bannedLabel}>DON'T SAY</Text>
        <View style={styles.bannedWrap}>
          {card.bannedWords.map((w) => (
            <View key={w} style={styles.bannedChip}>
              <Text style={styles.bannedText}>{w}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Text style={styles.reminder}>Describe the word. Avoid the banned words. Pass after each card.</Text>
        <PrimaryButton label="Next Word" icon="arrow-forward-circle" color={accent} onPress={onNextWord} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 48, // clear the host's floating Home button
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  scoreCaption: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textFaint,
    textTransform: 'uppercase',
  },
  scoreActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  miniBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textMuted,
  },
  scoreStripWrap: {
    flexGrow: 0,
    marginTop: spacing.sm,
  },
  scoreStrip: {
    gap: spacing.sm,
    paddingVertical: 2,
    paddingRight: spacing.lg,
  },
  scoreChip: {
    minWidth: 78,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  scoreName: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: 96,
  },
  scorePoints: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  bomb: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
  },
  target: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 58,
    color: colors.text,
    textAlign: 'center',
    ...glow(colors.white, 0.18),
  },
  bannedLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.danger,
    marginTop: spacing.lg,
  },
  bannedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bannedChip: {
    backgroundColor: '#3A0F17',
    borderWidth: 1,
    borderColor: colors.danger + '66',
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  bannedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: '#FFB3B3',
  },
  footer: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  reminder: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
