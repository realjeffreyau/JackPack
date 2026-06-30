import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { ActiveSlot, VerdictPlayer } from '../types';

const HOLD_MS = 1500;
const RING_SIZE = 160;
const BORDER = 6;

interface Props {
  players: VerdictPlayer[];
  activeSlots: ActiveSlot[];
  dealIndex: number;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
}

function HoldGate({ playerName, onReady }: { playerName: string; onReady: () => void }) {
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
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }

  const innerSize = RING_SIZE - BORDER * 2;
  const fillScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const fillOpacity = progress.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 1] });

  if (reduced) {
    return (
      <View style={styles.gateRoot}>
        <Text style={styles.gateInstruction}>Pass the phone to</Text>
        <Text style={[styles.gateName, { color: colors.yellow }]}>{playerName}</Text>
        <Text style={styles.gateSub}>Tap when ready — keep your screen private.</Text>
        <PrimaryButton label="I'm Ready" color={colors.yellow} onPress={onReady} />
      </View>
    );
  }

  return (
    <View style={styles.gateRoot}>
      <Text style={styles.gateInstruction}>Pass the phone to</Text>
      <Text style={[styles.gateName, { color: colors.yellow }]}>{playerName}</Text>
      <Text style={styles.gateSub}>Hold the button until it fills to reveal your role.</Text>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Hold to confirm you are ${playerName}`}
        style={[
          styles.ring,
          { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderColor: colors.yellow + '44' },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: colors.yellow,
              transform: [{ scale: fillScale }],
              opacity: fillOpacity,
            },
          ]}
        />
      </Pressable>
      <Text style={styles.hint}>Hold to reveal</Text>
    </View>
  );
}

export function RoleDeal({ players, activeSlots, dealIndex, revealed, onReveal, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const player = players[dealIndex];
  const slot = activeSlots.find((s) => s.assignedPlayerId === player.id)!;
  const isLast = dealIndex === players.length - 1;

  if (!revealed) {
    return (
      <View
        style={[
          { flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <HoldGate playerName={player.name} onReady={onReveal} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.cardRoot,
        { paddingTop: insets.top + spacing.xs, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      {/* Fixed header clears the HomeButton — paddingLeft:48 pushes name past the 40pt button */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardFor}>{player.name}</Text>
        <Text style={[styles.roleTitle, { color: colors.yellow }]}>{slot.roleTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.cardScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your Private Information</Text>
          <Text style={styles.sectionText}>{slot.interpolatedPrivateInfo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What You Believe</Text>
          <Text style={styles.sectionText}>{slot.interpolatedBelief}</Text>
        </View>

        {slot.interpolatedRumor != null && (
          <View style={[styles.section, styles.rumorBox]}>
            <Text style={[styles.sectionLabel, { color: colors.textFaint }]}>Rumor (may or may not be true)</Text>
            <Text style={[styles.sectionText, { color: colors.textMuted }]}>{slot.interpolatedRumor}</Text>
          </View>
        )}

        <View style={styles.objectiveBox}>
          <Text style={styles.objectiveLabel}>Your Objective</Text>
          <Text style={styles.objectiveText}>{slot.objectiveText}</Text>
        </View>
      </ScrollView>

      <View style={styles.cardFooter}>
        <PrimaryButton
          label={isLast ? 'All Done — Begin Discussion' : 'Done, pass the phone'}
          icon={isLast ? 'play' : 'arrow-forward'}
          color={colors.yellow}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gateRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  gateInstruction: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
  },
  gateName: {
    fontFamily: fonts.display,
    fontSize: 48,
    textAlign: 'center',
  },
  gateSub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.xl,
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
  },
  cardRoot: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  cardHeader: {
    paddingLeft: 48,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardScroll: {
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  cardFor: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  roleTitle: {
    fontFamily: fonts.display,
    fontSize: 30,
  },
  section: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.yellow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  rumorBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  objectiveBox: {
    backgroundColor: colors.yellow + '18',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.yellow + '44',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  objectiveLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.yellow,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  objectiveText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.yellow,
  },
  cardFooter: {
    paddingTop: spacing.md,
  },
});
