import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';

interface Props {
  /** Called to step back one phase/screen. No confirmation — always reversible. */
  onPress: () => void;
}

/**
 * Floating "undo a misclick" control. Pinned top-right so it never collides
 * with the host-provided HomeButton (top-left). Engines render this
 * themselves only on phases safe to unwind (no committed score/random deal).
 */
export function BackButton({ onPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={({ pressed }) => [
        styles.btn,
        { top: insets.top + spacing.xs, opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: spacing.md,
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
