import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { TIMER_MODE_META, type TimerMode } from '../../../data/outblurt';

interface Props {
  accent: string;
  initialMode: TimerMode;
  onDone: (mode: TimerMode) => void;
  onExit: () => void;
}

export function TimerModeSelect({ accent, initialMode, onDone, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<TimerMode>(initialMode);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Bomb Timer</Text>
        <Pressable
          onPress={onExit}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Exit game"
          style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.sub}>
        The timer is hidden and randomized inside this range every bomb. Longer ranges = longer fuses.
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {TIMER_MODE_META.map((meta) => {
          const selected = meta.mode === mode;
          return (
            <Pressable
              key={meta.mode}
              onPress={() => setMode(meta.mode)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${meta.label} timer, ${meta.range}`}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: selected ? accent : colors.border,
                  backgroundColor: selected ? accent + '1F' : colors.surface,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                selected ? glow(accent, 0.35) : null,
              ]}
            >
              <Text style={styles.cardIcon}>{meta.icon}</Text>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>{meta.label}</Text>
                  <Text style={[styles.cardRange, { color: selected ? accent : colors.textMuted }]}>{meta.range}</Text>
                </View>
                <Text style={styles.cardBlurb}>{meta.blurb}</Text>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? accent : colors.textFaint}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton label="Set Up Teams" icon="arrow-forward" color={accent} onPress={() => onDone(mode)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingLeft: 48, // clear the host's floating Home button
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cardIcon: {
    fontSize: 30,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    color: colors.text,
  },
  cardRange: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  cardBlurb: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
