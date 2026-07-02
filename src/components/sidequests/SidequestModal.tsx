import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../theme/theme';
import type { Sidequest } from '../../sidequests/types';

interface Props {
  sidequest: Sidequest;
  onConfirm: () => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};

export function SidequestModal({ sidequest, onConfirm }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.overlay,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Glow blob */}
      <View style={styles.glowBlob} pointerEvents="none" />

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconRing}>
          <Ionicons name="compass" size={32} color={colors.sidequest} />
        </View>

        {/* Label */}
        <View style={styles.labelRow}>
          <Text style={styles.eyebrow}>SECRET SIDEQUEST</Text>
          {sidequest.difficulty && (
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>{DIFFICULTY_LABEL[sidequest.difficulty] ?? ''}</Text>
            </View>
          )}
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.task}>{sidequest.text}</Text>
        </View>

        <Text style={styles.instruction}>Complete this before your next turn.</Text>

        <View style={styles.buttonArea}>
          <PrimaryButton label="Got it" color={colors.sidequest} onPress={onConfirm} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: colors.sidequest,
    opacity: 0.06,
    top: '20%',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.sidequest + '18',
    borderWidth: 1.5,
    borderColor: colors.sidequest + '55',
    alignItems: 'center',
    justifyContent: 'center',
    ...glow(colors.sidequest, 0.25),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.sidequest,
  },
  diffBadge: {
    backgroundColor: colors.sidequest + '22',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.sidequest + '44',
  },
  diffText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.sidequest,
  },
  card: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.sidequest + '33',
    padding: spacing.xl,
    ...glow(colors.sidequest, 0.1),
  },
  task: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
  },
  instruction: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
  buttonArea: {
    width: '100%',
    marginTop: spacing.sm,
  },
});
