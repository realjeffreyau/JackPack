import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';

interface HoldPrimaryButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onConfirm: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HOLD_DURATION = 650;

export function HoldPrimaryButton({
  label,
  icon,
  color,
  onConfirm,
  disabled = false,
  style,
}: HoldPrimaryButtonProps) {
  const reduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const didConfirmRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      progressAnimRef.current?.stop();
    };
  }, []);

  function handlePressIn() {
    if (disabled) return;

    didConfirmRef.current = false;
    progressAnim.setValue(0);
    if (!reduced) {
      const anim = Animated.timing(progressAnim, {
        toValue: 1,
        duration: HOLD_DURATION,
        useNativeDriver: false,
      });
      progressAnimRef.current = anim;
      anim.start();
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (didConfirmRef.current) return;
      didConfirmRef.current = true;
      onConfirm();
    }, HOLD_DURATION);
  }

  function handlePressOut() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    progressAnimRef.current?.stop();
    progressAnim.setValue(0);
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Hold to ${label.toLowerCase()}`}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: color,
          opacity: disabled ? 0.4 : 1,
          transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
        },
        !disabled ? glow(color, 0.45) : null,
        style,
      ]}
    >
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>
      <View style={styles.row}>
        <Ionicons name={icon} size={22} color={colors.onPrimary} />
        <Text style={styles.label}>{label}</Text>
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
    paddingVertical: spacing.xl,
    overflow: 'hidden',
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.white + '33',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 0.5,
    color: colors.onPrimary,
  },
});
