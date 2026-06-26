import React from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

interface Props {
  /** Called after the user confirms they want to leave the game. */
  onExit: () => void;
}

/**
 * Floating "leave game" control. Pinned top-left over any game engine so every
 * phase has a guaranteed way back to the home grid. Rendered once by the
 * GamePlay host, so individual engines/screens never need their own.
 */
export function HomeButton({ onExit }: Props) {
  const insets = useSafeAreaInsets();

  const confirm = () =>
    Alert.alert('Leave game?', 'Your current game progress will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: onExit },
    ]);

  return (
    <Pressable
      onPress={confirm}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Leave game and return home"
      style={({ pressed }) => [
        styles.btn,
        { top: insets.top + spacing.xs, opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      <Ionicons name="home" size={20} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
