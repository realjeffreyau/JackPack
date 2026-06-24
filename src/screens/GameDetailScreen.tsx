import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { GameDetailScreenProps } from '../navigation/types';
import { getGame } from '../data/games';
import { isPlayable } from '../games/registry';
import { PrimaryButton } from '../components/PrimaryButton';
import { Stepper } from '../components/Stepper';
import { colors, fonts, radius, spacing } from '../theme/theme';

export function GameDetailScreen({ navigation, route }: GameDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const game = getGame(route.params.gameId);

  const cfg = game?.settings;
  const [roundLength, setRoundLength] = useState(cfg?.defaultRoundLength ?? 60);
  const [rounds, setRounds] = useState(cfg?.defaultRounds ?? 5);

  if (!game) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.missing}>Game not found.</Text>
        <PrimaryButton label="Back" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const playable = isPlayable(game.id);
  const accent = game.accent;

  const start = () =>
    navigation.navigate('GamePlay', {
      gameId: game.id,
      roundLength,
      totalRounds: rounds,
    });

  return (
    <View style={styles.root}>
      <View style={[styles.blob, { backgroundColor: accent, top: -130, right: -90 }]} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: 140,
          paddingHorizontal: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
          <Text style={styles.backText}>Games</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: accent + '1F', borderColor: accent + '55' }]}>
          <Text style={styles.heroIcon}>{game.icon}</Text>
        </View>

        <Text style={styles.title}>{game.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name="people" size={14} color={accent} />
            <Text style={styles.metaText}>
              {game.minPlayers}–{game.maxPlayers} players
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{game.description}</Text>

        {game.instructions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>How to play</Text>
            <View style={styles.instructions}>
              {game.instructions.map((step, i) => (
                <View key={i} style={styles.step}>
                  <View style={[styles.stepNum, { backgroundColor: accent }]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {game.hasSettings && cfg && (
          <>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settings}>
              <Stepper
                label="Round length"
                value={roundLength}
                display={`${roundLength}s`}
                accent={accent}
                onDecrement={() => setRoundLength((v) => Math.max(cfg.minRoundLength, v - cfg.roundLengthStep))}
                onIncrement={() => setRoundLength((v) => Math.min(cfg.maxRoundLength, v + cfg.roundLengthStep))}
                canDecrement={roundLength > cfg.minRoundLength}
                canIncrement={roundLength < cfg.maxRoundLength}
              />
              <Stepper
                label="Rounds"
                value={rounds}
                accent={accent}
                onDecrement={() => setRounds((v) => Math.max(cfg.minRounds, v - 1))}
                onIncrement={() => setRounds((v) => Math.min(cfg.maxRounds, v + 1))}
                canDecrement={rounds > cfg.minRounds}
                canIncrement={rounds < cfg.maxRounds}
              />
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <PrimaryButton
          label={playable ? 'Start Game' : 'Coming Soon'}
          icon={playable ? 'play' : 'lock-closed'}
          color={accent}
          disabled={!playable}
          onPress={start}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  missing: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    opacity: 0.16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.lg,
    marginLeft: -4,
  },
  backText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  hero: {
    width: 96,
    height: 96,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    fontSize: 52,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 42,
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  metaText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textMuted,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.text,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  instructions: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    color: colors.onPrimary,
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  settings: {
    gap: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
