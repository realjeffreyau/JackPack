import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';

interface Props {
  accent: string;
  round: number;
  totalRounds: number; // 0 = endless
  prompt: string;
  onVote: () => void;
  onScoreboard: () => void;
  onEditPlayers: () => void;
  onEndGame: () => void;
}

export function PromptScreen({
  accent,
  round,
  totalRounds,
  prompt,
  onVote,
  onScoreboard,
  onEditPlayers,
  onEndGame,
}: Props) {
  const insets = useSafeAreaInsets();
  const label = totalRounds === 0 ? `Round ${round}` : `Round ${round} of ${totalRounds}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.lg }]}>
      <Text style={styles.round}>{label}</Text>

      <View style={styles.center}>
        <Text style={styles.kicker}>PUBLIC PROMPT</Text>
        <Text style={[styles.prompt, glow(accent, 0.15)]}>{prompt}</Text>
        <Text style={styles.instructions}>
          Discuss. Defend yourself. Influence the vote without exposing your agenda.
        </Text>
      </View>

      <View style={styles.utilityRow}>
        <UtilityBtn icon="podium-outline" label="Scores" onPress={onScoreboard} />
        <UtilityBtn icon="create-outline" label="Edit" onPress={onEditPlayers} />
        <UtilityBtn icon="flag-outline" label="End" onPress={onEndGame} />
      </View>
      <PrimaryButton label="Start Voting" icon="enter" color={accent} onPress={onVote} />
    </View>
  );
}

function UtilityBtn({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.utilBtn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.utilText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  round: { fontFamily: fonts.bodyExtra, fontSize: 13, letterSpacing: 2, color: colors.textFaint, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  kicker: { fontFamily: fonts.bodyExtra, fontSize: 12, letterSpacing: 2, color: colors.cyan },
  prompt: { fontFamily: fonts.display, fontSize: 34, lineHeight: 42, color: colors.text, textAlign: 'center' },
  instructions: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  utilityRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
  utilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  utilText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.textMuted },
});
