import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import type { MoleDifficulty } from '../../../data/theMole';

interface DifficultySelectProps {
  onDone: (difficulties: MoleDifficulty[]) => void;
}

const DIFFICULTIES: { id: MoleDifficulty; label: string; emoji: string; desc: string }[] = [
  { id: 'easy', label: 'Easy', emoji: '🟢', desc: 'Common knowledge, anyone can play' },
  { id: 'medium', label: 'Medium', emoji: '🟡', desc: 'Solid trivia, some brain required' },
  { id: 'hard', label: 'Hard', emoji: '🔴', desc: 'Specific facts, real knowledge needed' },
  { id: 'impossible', label: 'Impossible', emoji: '💀', desc: 'Obscure & brutal, even experts struggle' },
];

export function DifficultySelect({ onDone }: DifficultySelectProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<MoleDifficulty>>(new Set(['medium']));

  function toggle(id: MoleDifficulty) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Pick Difficulty</Text>
      <Text style={styles.sub}>Mix and match — harder questions reward players more.</Text>

      <View style={styles.list}>
        {DIFFICULTIES.map((diff) => {
          const active = selected.has(diff.id);
          return (
            <Pressable
              key={diff.id}
              onPress={() => toggle(diff.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={diff.label}
              style={({ pressed }) => [
                styles.card,
                active && styles.cardActive,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardEmoji}>{diff.emoji}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
                  {diff.label}
                </Text>
                <Text style={styles.cardDesc}>{diff.desc}</Text>
              </View>
              <View style={[styles.check, active && styles.checkActive]}>
                {active && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label="Pick Categories"
          icon="arrow-forward"
          color={colors.purple}
          onPress={() => onDone(Array.from(selected))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  list: {
    flex: 1,
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardActive: {
    borderColor: colors.purple,
    backgroundColor: colors.surface,
    ...glow(colors.purple, 0.25),
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textMuted,
  },
  cardLabelActive: {
    color: colors.text,
  },
  cardDesc: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textFaint,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purple,
  },
  checkMark: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.white,
  },
  bottom: {
    marginTop: spacing.xl,
  },
});
