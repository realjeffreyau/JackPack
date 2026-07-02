import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeScreenProps } from '../navigation/types';
import { GAMES } from '../data/games';
import { isPlayable } from '../games/registry';
import { GameCard } from '../components/GameCard';
import { SidequestPanel } from '../components/sidequests/SidequestPanel';
import { colors, fonts, spacing } from '../theme/theme';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [sidequestPanelOpen, setSidequestPanelOpen] = useState(false);

  return (
    <View style={styles.root}>
      {/* Atmospheric neon glow blobs */}
      <View style={[styles.blob, styles.blobPink]} pointerEvents="none" />
      <View style={[styles.blob, styles.blobCyan]} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingBottom: insets.bottom + spacing.xxl,
          paddingHorizontal: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row: kicker + sidequest icon */}
        <View style={styles.headerRow}>
          <Text style={styles.kicker}>PASS-THE-PHONE</Text>
          <Pressable
            onPress={() => setSidequestPanelOpen(true)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open Sidequests"
            style={({ pressed }) => [styles.sqBtn, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons name="compass" size={24} color={colors.sidequest} />
          </Pressable>
        </View>

        <Text style={styles.title}>JackPack</Text>
        <Text style={styles.subtitle}>
          One phone. Your whole crew. Pick a game and let chaos decide.
        </Text>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              locked={!isPlayable(game.id)}
              onPress={() => navigation.navigate('GameDetail', { gameId: game.id })}
            />
          ))}
        </View>
      </ScrollView>

      {sidequestPanelOpen && (
        <SidequestPanel onClose={() => setSidequestPanelOpen(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    opacity: 0.18,
  },
  blobPink: {
    backgroundColor: colors.primary,
    top: -120,
    right: -100,
  },
  blobCyan: {
    backgroundColor: colors.purple,
    bottom: -140,
    left: -120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.primary,
  },
  sqBtn: {
    padding: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 52,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
