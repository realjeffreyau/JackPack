import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme/theme';

interface Props {
  timeLeft: number;
  total: number;
  animate?: boolean;
}

/** Colour ramps from cyan → yellow → red as the clock runs down. */
function urgencyColor(t: number): string {
  if (t <= 5) return colors.danger;
  if (t <= 10) return colors.yellow;
  return colors.cyan;
}

export function CountdownDisplay({ timeLeft, total, animate = true }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const danger = timeLeft <= 10 && timeLeft > 0;
  const color = urgencyColor(timeLeft);
  const pct = total > 0 ? Math.max(0, Math.min(1, timeLeft / total)) : 0;

  useEffect(() => {
    if (danger && animate) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 350, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
    return undefined;
  }, [danger, animate, pulse]);

  return (
    <View style={styles.wrap} accessibilityLabel={`${timeLeft} seconds left`}>
      <Animated.Text style={[styles.time, { color, transform: [{ scale: pulse }] }]}>
        {timeLeft}
      </Animated.Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 12,
  },
  time: {
    fontFamily: fonts.display,
    fontSize: 88,
    lineHeight: 96,
    fontVariant: ['tabular-nums'],
  },
  track: {
    width: 200,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
