import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, glow, radius, spacing } from '../theme/theme';

type Variant = 'solid' | 'outline' | 'ghost';
type Size = 'lg' | 'md';

interface Props {
  label: string;
  onPress: () => void;
  color?: string;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  onPress,
  color = colors.primary,
  variant = 'solid',
  size = 'lg',
  icon,
  disabled = false,
  style,
}: Props) {
  const isSolid = variant === 'solid';
  const isOutline = variant === 'outline';

  const bg = isSolid ? color : 'transparent';
  const borderColor = isOutline ? color : 'transparent';
  const textColor = isSolid ? colors.onPrimary : color;
  const pad = size === 'lg' ? spacing.xl : spacing.md;
  const fontSize = size === 'lg' ? 20 : 16;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isOutline ? 2 : 0,
          paddingVertical: pad,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
        },
        isSolid && !disabled ? glow(color, 0.45) : null,
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Ionicons name={icon} size={fontSize + 2} color={textColor} /> : null}
        <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.display,
    letterSpacing: 0.5,
  },
});
