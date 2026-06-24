import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface PrivacyGateProps {
  playerName: string;
  context: string;
  onReveal: () => void;
}

const HOLD_DURATION = 1500;

export function PrivacyGate({ playerName, context, onReveal }: PrivacyGateProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      progressAnimRef.current?.stop();
    };
  }, []);

  function handlePressIn() {
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
      onReveal();
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
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.center}>
        <Text style={styles.passLabel}>PASS THE PHONE TO</Text>
        <Text style={styles.playerName}>{playerName}</Text>
        <Text style={styles.context}>{context}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.hint}>Hold the button below when you are {playerName}</Text>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`Hold to reveal for ${playerName}`}
          style={({ pressed }) => [styles.holdBtn, pressed && styles.holdBtnPressed]}
        >
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <Text style={styles.holdLabel}>HOLD TO REVEAL</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.md,
  },
  playerName: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  context: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    gap: spacing.md,
  },
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
  holdBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 64,
    justifyContent: 'center',
  },
  holdBtnPressed: {
    borderColor: colors.textMuted,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.purple + '33',
  },
  holdLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
    letterSpacing: 2,
    color: colors.text,
  },
});
