import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import { ROUNDS_OPTIONS, type RoundsMode } from '../../../data/secretAgenda';

interface Props {
  accent: string;
  initial: RoundsMode;
  onDone: (rounds: RoundsMode) => void;
  onExit: () => void;
}

export function RoundsSelect({ accent, initial, onDone, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const [rounds, setRounds] = useState<RoundsMode>(initial);

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Rounds</Text>
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

      <Text style={styles.sub}>How many rounds? Endless runs until you tap End Game.</Text>

      <View style={styles.grid}>
        {ROUNDS_OPTIONS.map((opt) => {
          const selected = opt.value === rounds;
          return (
            <Pressable
              key={opt.label}
              onPress={() => setRounds(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${opt.label} rounds`}
              style={({ pressed }) => [
                styles.cell,
                opt.value === 0 && styles.cellWide,
                {
                  borderColor: selected ? accent : colors.border,
                  backgroundColor: selected ? accent + '1F' : colors.surface,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
                selected ? glow(accent, 0.35) : null,
              ]}
            >
              <Text style={[styles.cellText, { color: selected ? accent : colors.text }]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.spacer} />
      <PrimaryButton label="Add Players" icon="arrow-forward" color={accent} onPress={() => onDone(rounds)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingLeft: 48, // clear the host's floating Home button
  },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.text },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  cell: {
    width: '47%',
    flexGrow: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellWide: { width: '100%' },
  cellText: { fontFamily: fonts.display, fontSize: 26 },
  spacer: { flex: 1 },
});
