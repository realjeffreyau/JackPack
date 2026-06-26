import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { Player } from '../types';

interface Props {
  prompt: string;
  voterName: string;
  voterId: string;
  players: Player[];
  onVote: (votedForId: string) => void;
}

export function VoteScreen({ prompt, voterName, voterId, players, onVote }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  const candidates = players.filter((p) => p.id !== voterId);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.voterLabel}>{voterName}'s vote</Text>
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>
        <Text style={styles.instruction}>Pick one person. Your vote is secret.</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {candidates.map((player) => {
          const isSelected = selected === player.id;
          return (
            <Pressable
              key={player.id}
              onPress={() => setSelected(player.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={player.name}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.optionSelected,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {player.name}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={22} color={colors.danger} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label="Lock Vote"
        icon="lock-closed"
        color={colors.danger}
        onPress={() => selected && onVote(selected)}
        disabled={!selected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A0A10',
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  voterLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.danger,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    paddingLeft: 48,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.danger + '55',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  promptText: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    lineHeight: 30,
    color: colors.text,
    textAlign: 'center',
  },
  instruction: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  listContent: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  optionSelected: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '18',
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.danger,
  },
});
