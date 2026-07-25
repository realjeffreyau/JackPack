import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../../../theme/theme';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

/** Frosted-glass surface: BlurView + translucent fill + hairline highlight border. */
export function GlassCard({ children, intensity = 36, tint, borderRadius = radius.lg, style }: GlassCardProps) {
  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.fill, { borderRadius }, tint ? { backgroundColor: tint } : null]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.surface,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
