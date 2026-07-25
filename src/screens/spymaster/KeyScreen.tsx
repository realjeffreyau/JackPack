import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SpymasterState } from '../../multiplayer/spymaster/types';
import { GlassCard } from '../../games/spymaster/components/GlassCard';
import { WordTile } from '../../games/spymaster/components/WordTile';
import { RulesSheet } from '../../games/spymaster/components/RulesSheet';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  state: SpymasterState;
}

/** The spymaster key phone — passive, read-only color key. Never writes. */
export function KeyScreen({ state }: Props) {
  const insets = useSafeAreaInsets();
  const [showRules, setShowRules] = useState(false);
  const accent = state.currentTeam === 'red' ? colors.danger : colors.cyan;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <GlassCard intensity={40} borderRadius={radius.lg} style={styles.toolbar}>
        <View style={styles.toolbarTop}>
          <Text style={[styles.turnLabel, { color: accent }]}>{state.currentTeam.toUpperCase()}'S TURN</Text>
          <Pressable onPress={() => setShowRules(true)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Rules">
            <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </View>
        <View style={styles.counts}>
          <Text style={[styles.countText, { color: colors.danger }]}>RED {state.redRemaining}</Text>
          <Text style={[styles.countText, { color: colors.cyan }]}>BLUE {state.blueRemaining}</Text>
        </View>
        <Text style={styles.keyLabel}>SPYMASTER KEY — don't show this to the board</Text>
      </GlassCard>

      <View style={styles.grid}>
        {state.tiles.map((tile, i) => (
          <WordTile key={tile.word + i} word={tile.word} team={tile.team} revealed={tile.revealed} spyView onPress={() => {}} />
        ))}
      </View>

      {showRules && <RulesSheet onClose={() => setShowRules(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  toolbar: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  toolbarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turnLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 14,
    letterSpacing: 1.5,
  },
  counts: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  countText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  keyLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textFaint,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    gap: '1%' as unknown as number,
  },
});
