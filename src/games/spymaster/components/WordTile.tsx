import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '../../../theme/theme';
import { GlassCard } from './GlassCard';

export type TileTeam = 'red' | 'blue' | 'neutral' | 'assassin';

interface WordTileProps {
  word: string;
  team: TileTeam;
  revealed: boolean;
  /** true when showing the spymaster key (all tiles tinted, non-interactive) */
  spyView: boolean;
  onPress: () => void;
}

const TEAM_TINT: Record<TileTeam, string> = {
  red: colors.danger + '55',
  blue: colors.cyan + '55',
  neutral: 'rgba(255,255,255,0.08)',
  assassin: 'rgba(0,0,0,0.85)',
};

export function WordTile({ word, team, revealed, spyView, onPress }: WordTileProps) {
  const showTint = revealed || spyView;
  const interactive = !revealed && !spyView;

  return (
    <Pressable
      onPress={interactive ? onPress : undefined}
      disabled={!interactive}
      accessibilityRole="button"
      accessibilityLabel={word}
      style={({ pressed }) => [styles.pressWrap, interactive && pressed && styles.pressed]}
    >
      <GlassCard
        intensity={20}
        borderRadius={radius.md}
        tint={showTint ? TEAM_TINT[team] : undefined}
        style={styles.card}
      >
        <Text
          style={[styles.word, revealed && styles.wordRevealed]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {word}
        </Text>
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    width: '19%',
    aspectRatio: 1,
    minWidth: 44,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  word: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  wordRevealed: {
    color: colors.textMuted,
  },
});
