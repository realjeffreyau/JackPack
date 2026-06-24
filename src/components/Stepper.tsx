import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface Props {
  label: string;
  value: number;
  display?: string;
  accent: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement: boolean;
  canIncrement: boolean;
}

export function Stepper({
  label,
  value,
  display,
  accent,
  onDecrement,
  onIncrement,
  canDecrement,
  canIncrement,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <StepButton icon="remove" accent={accent} onPress={onDecrement} disabled={!canDecrement} />
        <Text style={styles.value}>{display ?? value}</Text>
        <StepButton icon="add" accent={accent} onPress={onIncrement} disabled={!canIncrement} />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  accent,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      hitSlop={6}
      style={({ pressed }) => [
        styles.stepBtn,
        { borderColor: disabled ? colors.border : accent },
        { opacity: disabled ? 0.35 : 1, transform: [{ scale: pressed && !disabled ? 0.92 : 1 }] },
      ]}
    >
      <Ionicons name={icon} size={22} color={disabled ? colors.textFaint : accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    minWidth: 70,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
