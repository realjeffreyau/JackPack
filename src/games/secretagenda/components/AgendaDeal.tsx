import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';

const HOLD_DURATION = 900;

interface Props {
  accent: string;
  playerName: string;
  agendaText: string;
  index: number;
  total: number;
  isLast: boolean;
  onPass: () => void;
}

/**
 * One player's private deal. A pass-the-phone gate, then the agenda is shown
 * only between hold-reveal and "Hide & Pass" — never visible to anyone else.
 * Hold-to-reveal prevents accidental taps from advancing the screen.
 */
export function AgendaDeal({ accent, playerName, agendaText, index, total, isLast, onPass }: Props) {
  const insets = useSafeAreaInsets();
  const [revealed, setRevealed] = useState(false);
  const fillAnim = useRef(new Animated.Value(0)).current;
  const activeAnim = useRef<Animated.CompositeAnimation | null>(null);

  function startHold() {
    activeAnim.current = Animated.timing(fillAnim, {
      toValue: 1,
      duration: HOLD_DURATION,
      useNativeDriver: false,
    });
    activeAnim.current.start(({ finished }) => {
      if (finished) setRevealed(true);
    });
  }

  function cancelHold() {
    activeAnim.current?.stop();
    activeAnim.current = null;
    Animated.timing(fillAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();
  }

  function hideAndPass() {
    setRevealed(false);
    fillAnim.setValue(0);
    onPass();
  }

  if (!revealed) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.center}>
          <Ionicons name="lock-closed" size={56} color={accent} />
          <Text style={styles.counter}>Player {index + 1} of {total}</Text>
          <Text style={styles.passTitle}>Pass the phone to</Text>
          <Text style={[styles.name, { color: accent, ...glow(accent, 0.4) }]}>{playerName}</Text>
          <Text style={styles.warn}>Only {playerName} should look at this.</Text>
        </View>

        <View style={[styles.holdOuter, { borderColor: accent }]}>
          <Animated.View
            style={[
              styles.holdFill,
              {
                backgroundColor: accent,
                width: fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
          <Pressable
            onPressIn={startHold}
            onPressOut={cancelHold}
            style={styles.holdPressable}
            accessibilityRole="button"
            accessibilityLabel="Hold to reveal your secret agenda"
          >
            <Ionicons name="eye" size={22} color={colors.text} />
            <Text style={styles.holdLabel}>Hold to Reveal</Text>
          </Pressable>
        </View>

        <Text style={styles.holdHint}>Hold until the bar fills to reveal your agenda.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.center}>
        <Text style={styles.ownerLabel}>{playerName}'s Secret Agenda</Text>
        <View style={[styles.card, { borderColor: accent + '66', ...glow(accent, 0.15) }]}>
          <Ionicons name="document-lock" size={28} color={accent} style={{ marginBottom: spacing.md }} />
          <Text style={styles.agenda}>{agendaText}</Text>
        </View>
        <Text style={styles.hint}>Keep it secret. Influence the vote without giving it away.</Text>
      </View>
      <PrimaryButton
        label={isLast ? 'Hide & Finish' : 'Hide & Pass'}
        icon="eye-off"
        color={accent}
        onPress={hideAndPass}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  counter: { fontFamily: fonts.bodyExtra, fontSize: 12, letterSpacing: 2, color: colors.textFaint, marginTop: spacing.lg },
  passTitle: { fontFamily: fonts.body, fontSize: 16, color: colors.textMuted, marginTop: spacing.sm },
  name: { fontFamily: fonts.display, fontSize: 40, textAlign: 'center' },
  warn: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textFaint, marginTop: spacing.sm, textAlign: 'center' },

  holdOuter: {
    borderRadius: radius.pill,
    borderWidth: 2,
    overflow: 'hidden',
    height: 60,
    marginBottom: spacing.xs,
    position: 'relative',
  },
  holdFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.35,
  },
  holdPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  holdLabel: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.text,
    letterSpacing: 0.5,
  },
  holdHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },

  ownerLabel: { fontFamily: fonts.bodyExtra, fontSize: 13, letterSpacing: 1.5, color: colors.textMuted, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  agenda: { fontFamily: fonts.displaySemi, fontSize: 26, lineHeight: 34, color: colors.text, textAlign: 'center' },
  hint: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textFaint, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.md },
});
