import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Game } from '../types/game';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface Props {
  game: Game;
  locked: boolean;
  onPress: () => void;
}

export function GameCard({ game, locked, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={`${game.name}. ${locked ? 'Coming soon.' : game.tagline}`}
      accessibilityState={{ disabled: locked }}
      style={({ pressed }) => [
        styles.card,
        { borderColor: locked ? colors.border : game.accent + '88' },
        { transform: [{ scale: pressed && !locked ? 0.97 : 1 }] },
        locked && styles.locked,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: game.accent + '22' }]}>
        <Text style={styles.icon}>{game.icon}</Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {game.name}
      </Text>
      <Text style={styles.tagline} numberOfLines={2}>
        {locked ? 'Coming soon' : game.tagline}
      </Text>

      <View style={styles.footer}>
        <View style={styles.players}>
          <Ionicons name="people" size={13} color={colors.textFaint} />
          <Text style={styles.playersText}>
            {game.minPlayers}–{game.maxPlayers}
          </Text>
        </View>

        {locked ? (
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={11} color={colors.textFaint} />
            <Text style={styles.badgeText}>SOON</Text>
          </View>
        ) : (
          <View style={[styles.playPill, { backgroundColor: game.accent }]}>
            <Ionicons name="play" size={14} color={colors.onPrimary} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 170,
  },
  locked: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.text,
    marginBottom: 2,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playersText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: colors.textFaint,
  },
  playPill: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
  },
  badgeText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textFaint,
  },
});
