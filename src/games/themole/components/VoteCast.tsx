import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';

interface Player {
  id: string;
  name: string;
}

interface VoteCastProps {
  voter: Player;
  candidates: Player[];
  voterIndex: number;
  totalVoters: number;
  onCast: (targetId: string) => void;
}

export function VoteCast({ voter, candidates, voterIndex, totalVoters, onCast }: VoteCastProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.voterPill}>
          <Text style={styles.voterText}>
            {voter.name} — {voterIndex + 1}/{totalVoters}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Who is The Mole?</Text>
      <Text style={styles.sub}>Vote secretly. Only you can see this screen.</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {candidates.map((candidate) => {
          const isSelected = selected === candidate.id;
          return (
            <Pressable
              key={candidate.id}
              onPress={() => setSelected(candidate.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Vote for ${candidate.name}`}
              style={({ pressed }) => [
                styles.candidate,
                isSelected && styles.candidateSelected,
                pressed && styles.candidatePressed,
              ]}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <Text style={styles.avatarText}>{candidate.name[0].toUpperCase()}</Text>
              </View>
              <Text style={[styles.candidateName, isSelected && styles.candidateNameSelected]}>
                {candidate.name}
              </Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>VOTED</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label="Cast Vote"
        icon="checkmark"
        color={colors.purple}
        onPress={() => selected !== null && onCast(selected)}
        disabled={selected === null}
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
  topRow: {
    marginBottom: spacing.lg,
  },
  voterPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  voterText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  candidate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    minHeight: 60,
  },
  candidateSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.surface,
    ...glow(colors.purple, 0.3),
  },
  candidatePressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarSelected: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  avatarText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  candidateName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.textMuted,
  },
  candidateNameSelected: {
    color: colors.text,
  },
  selectedBadge: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  selectedBadgeText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.white,
  },
});
