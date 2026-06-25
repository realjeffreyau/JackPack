import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../../theme/theme';

interface Props {
  playerName: string;
  accentColor: string;
  onReady: () => void;
}

const HOLD_MS = 1500;
const RING_SIZE = 160;
const BORDER = 6;

export function PrivacyGate({ playerName, accentColor, onReady }: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const firedRef = useRef(false);

  function handlePressIn() {
    firedRef.current = false;
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    });
    animRef.current.start(({ finished }) => {
      if (finished && !firedRef.current) {
        firedRef.current = true;
        onReady();
      }
    });
  }

  function handlePressOut() {
    animRef.current?.stop();
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }

  const innerSize = RING_SIZE - BORDER * 2;
  const fillScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const fillOpacity = progress.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 1] });

  if (reduced) {
    return (
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + spacing.xxxl,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <Text style={styles.instruction}>Pass the phone to</Text>
        <Text style={[styles.name, { color: accentColor }]}>{playerName}</Text>
        <Text style={styles.sub}>Tap when safely holding the phone.</Text>
        <View style={styles.btnArea}>
          <PrimaryButton label="I'm Ready" color={accentColor} onPress={onReady} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.instruction}>Pass the phone to</Text>
      <Text style={[styles.name, { color: accentColor }]}>{playerName}</Text>
      <Text style={styles.sub}>Hold the button below until it fills.</Text>

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Hold to confirm you are ${playerName}`}
        style={[
          styles.ring,
          {
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderColor: accentColor + '44',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: accentColor,
              transform: [{ scale: fillScale }],
              opacity: fillOpacity,
            },
          ]}
        />
      </Pressable>
      <Text style={styles.hint}>Hold to confirm</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  instruction: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
  ring: {
    borderWidth: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {},
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    marginTop: spacing.lg,
  },
  btnArea: {
    width: '100%',
    marginTop: spacing.xl,
  },
});
