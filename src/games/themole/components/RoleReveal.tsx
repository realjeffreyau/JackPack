import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface RoleRevealProps {
  playerName: string;
  isMole: boolean;
  playerIndex: number;
  totalPlayers: number;
  onHide: () => void;
}

export function RoleReveal({ playerName, isMole, playerIndex, totalPlayers, onHide }: RoleRevealProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const scaleAnim = useRef(new Animated.Value(reduced ? 1 : 0.6)).current;
  const opacityAnim = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [reduced, scaleAnim, opacityAnim]);

  const accentColor = isMole ? colors.purple : colors.success;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.progress}>
        {playerIndex + 1} of {totalPlayers}
      </Text>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.card,
            { borderColor: accentColor + '80' },
            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
            isMole ? styles.moleCard : styles.regularCard,
          ]}
        >
          <Text style={styles.emoji}>{isMole ? '🕵️' : '👤'}</Text>
          <Text style={[styles.roleLabel, { color: accentColor, ...glow(accentColor, 0.5) }]}>
            {isMole ? 'THE MOLE' : 'REGULAR PLAYER'}
          </Text>
          <Text style={styles.roleName}>{playerName}</Text>
          <View style={styles.divider} />
          <Text style={styles.objective}>
            {isMole
              ? 'Answer questions INCORRECTLY on purpose.\nStay subtle — if they catch you, you lose everything.'
              : 'Answer questions CORRECTLY to grow the Group Pot.\nFind the Mole before the final vote.'}
          </Text>
        </Animated.View>
      </View>

      <PrimaryButton
        label="Hide & Continue"
        icon="eye-off-outline"
        color={colors.purple}
        onPress={onHide}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  progress: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  moleCard: {
    backgroundColor: '#1A0E2E',
  },
  regularCard: {
    backgroundColor: colors.bgElevated,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  roleLabel: {
    fontFamily: fonts.display,
    fontSize: 28,
    textAlign: 'center',
  },
  roleName: {
    fontFamily: fonts.bodySemi,
    fontSize: 18,
    color: colors.textMuted,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  objective: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
