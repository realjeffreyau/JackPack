import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';
import type { Player } from '../types';

interface Props {
  accent: string;
  players: Player[];
  voteIndex: number;
  prompt: string;
  onVoteCast: (targetId: string) => void;
}

export function VoteEntry({ accent, players, voteIndex, prompt, onVoteCast }: Props) {
  const insets = useSafeAreaInsets();
  const [revealed, setRevealed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setRevealed(false);
    setSelectedId(null);
  }, [voteIndex]);

  const voter = players[voteIndex];
  if (!voter) return null;

  const isLast = voteIndex === players.length - 1;

  if (!revealed) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.progressRow}>
          {players.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < voteIndex && { backgroundColor: accent },
                i === voteIndex && { backgroundColor: accent, opacity: 0.4 },
              ]}
            />
          ))}
        </View>
        <Text style={styles.counter}>{voteIndex + 1} of {players.length}</Text>

        <View style={styles.lock}>
          <Text style={styles.lockEmoji}>🔒</Text>
          <Text style={styles.passLabel}>Pass to</Text>
          <Text style={[styles.voterName, { color: accent, ...glow(accent, 0.4) }]}>{voter.name}</Text>
          <Text style={styles.lockSub}>Hand the phone to {voter.name} so they can vote privately.</Text>
        </View>

        <View style={[styles.promptChip, { borderColor: accent + '44' }]}>
          <Text style={styles.promptChipLabel}>PROMPT</Text>
          <Text style={styles.promptChipText} numberOfLines={2}>{prompt}</Text>
        </View>

        <PrimaryButton label="Cast My Vote" icon="enter" color={accent} onPress={() => setRevealed(true)} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.lg }]}>
      <Text style={[styles.title, { paddingLeft: 48 }]}>{voter.name}'s Vote</Text>
      <Text style={styles.sub}>Who do you pick for: <Text style={{ color: accent }}>{prompt}</Text></Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {players.map((p) => {
          const selected = selectedId === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSelectedId(p.id)}
              accessibilityRole="button"
              accessibilityLabel={p.name}
              style={({ pressed }) => [
                styles.option,
                selected && { borderColor: accent, backgroundColor: accent + '1A' },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.optionName, selected && { color: accent }]}>{p.name}</Text>
              {selected && <Text style={[styles.check, { color: accent }]}>✓</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label={isLast ? 'Submit Vote' : 'Submit & Pass'}
        icon="checkmark"
        color={accent}
        onPress={() => selectedId && onVoteCast(selectedId)}
        disabled={!selectedId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  counter: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  lock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  lockEmoji: { fontSize: 56 },
  passLabel: { fontFamily: fonts.bodyExtra, fontSize: 13, letterSpacing: 2, color: colors.textFaint },
  voterName: { fontFamily: fonts.display, fontSize: 38, textAlign: 'center' },
  lockSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  promptChip: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: 4,
  },
  promptChipLabel: { fontFamily: fonts.bodyExtra, fontSize: 11, letterSpacing: 2, color: colors.textFaint },
  promptChipText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 20 },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing.sm, paddingBottom: spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 58,
  },
  optionName: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.text },
  check: { fontFamily: fonts.display, fontSize: 20 },
});
