import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import type { Team } from '../types';

interface Props {
  accent: string;
  teams: Team[];
  /** Team chosen as holding the phone, or null while still awaiting the pick. */
  assignedTeamId: string | null;
  onAssign: (teamId: string) => void;
  onNextBomb: () => void;
  onOpenStandings: () => void;
  onOpenManageTeams: () => void;
  onExit: () => void;
}

export function ExplosionResult({
  accent,
  teams,
  assignedTeamId,
  onAssign,
  onNextBomb,
  onOpenStandings,
  onOpenManageTeams,
  onExit,
}: Props) {
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

  const assigned = assignedTeamId ? teams.find((t) => t.id === assignedTeamId) ?? null : null;

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top + spacing.xxl }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.hero, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.emoji}>💥</Text>
        <Text style={[styles.title, glow(colors.danger, 0.6)]}>BOOM!</Text>
        <Text style={styles.sub}>
          {assigned ? `${assigned.name} got the explosion point.` : 'Which team was holding the phone?'}
        </Text>
        <Text style={styles.caption}>Most points loses.</Text>
      </Animated.View>

      {!assigned ? (
        <View style={styles.teamList}>
          {teams.map((t) => (
            <TeamPick key={t.id} team={t} onPress={() => onAssign(t.id)} />
          ))}
        </View>
      ) : (
        <View style={styles.actions}>
          <PrimaryButton label="Start Next Bomb" icon="flame" color={accent} onPress={onNextBomb} />
          <PrimaryButton
            label="View Standings"
            icon="podium-outline"
            variant="outline"
            color={colors.textMuted}
            onPress={onOpenStandings}
          />
          <PrimaryButton
            label="Edit Teams"
            icon="create-outline"
            variant="outline"
            color={colors.textMuted}
            onPress={onOpenManageTeams}
          />
          <PrimaryButton label="Home" variant="ghost" color={colors.textMuted} onPress={onExit} />
        </View>
      )}
    </ScrollView>
  );
}

function TeamPick({ team, onPress }: { team: Team; onPress: () => void }) {
  return (
    <PrimaryButton
      label={`${team.name}   •   ${team.points} pt${team.points === 1 ? '' : 's'}`}
      color={colors.danger}
      variant="outline"
      onPress={onPress}
    />
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
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 88,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.danger,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  caption: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textFaint,
  },
  teamList: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
});
