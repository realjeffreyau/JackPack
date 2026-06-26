import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { GamePlayScreenProps } from '../navigation/types';
import { getGameEngine } from '../games/registry';
import { PrimaryButton } from '../components/PrimaryButton';
import { HomeButton } from '../components/HomeButton';
import { colors, fonts, spacing } from '../theme/theme';

/**
 * Generic host for any game. Looks up the engine for the given game id and
 * hands it the chosen settings plus an onExit callback back to Home.
 */
export function GamePlayScreen({ navigation, route }: GamePlayScreenProps) {
  const { gameId, roundLength, totalRounds, revealChoices } = route.params;
  const Engine = getGameEngine(gameId);

  const exitToHome = () => navigation.popToTop();

  if (!Engine) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>This game isn't available yet.</Text>
        <PrimaryButton label="Back to Games" variant="outline" onPress={exitToHome} />
      </View>
    );
  }

  return (
    <View style={styles.host}>
      <Engine roundLength={roundLength} totalRounds={totalRounds} revealChoices={revealChoices} onExit={exitToHome} />
      <HomeButton onExit={exitToHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  fallbackText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
});
