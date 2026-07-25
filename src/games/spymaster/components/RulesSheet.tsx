import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import { GlassCard } from './GlassCard';

type Strictness = 'conservative' | 'flexible' | 'custom';

interface RulesSheetProps {
  onClose: () => void;
}

const STRICTNESS_OPTIONS: { key: Strictness; label: string }[] = [
  { key: 'conservative', label: 'Conservative' },
  { key: 'flexible', label: 'Flexible' },
  { key: 'custom', label: 'Custom' },
];

interface ClueRule {
  title: string;
  note: Record<Strictness, string>;
}

const CLUE_RULES: ClueRule[] = [
  {
    title: 'Translation Rule',
    note: {
      conservative: 'Clues must be a single word in the language you\'ve agreed to play in — no translations as a workaround.',
      flexible: 'A translated word is fine if it\'s common knowledge to the whole table.',
      custom: 'House call — agree before the game starts.',
    },
  },
  {
    title: 'Shared-Root Rule',
    note: {
      conservative: 'No clue that shares a root with a board word (e.g. "FLY" for "FLYING").',
      flexible: 'Shared roots allowed if the connection is a stretch, not a giveaway.',
      custom: 'House call — agree before the game starts.',
    },
  },
  {
    title: 'Homophones',
    note: {
      conservative: 'Not allowed — clue must be spelled distinctly from any board word.',
      flexible: 'Allowed, since the board is visual, not audible.',
      custom: 'House call — agree before the game starts.',
    },
  },
  {
    title: 'Proper Nouns',
    note: {
      conservative: 'Not allowed as clues (names, places, brands).',
      flexible: 'Allowed if well known to the group.',
      custom: 'House call — agree before the game starts.',
    },
  },
];

export function RulesSheet({ onClose }: RulesSheetProps) {
  const insets = useSafeAreaInsets();
  const [strictness, setStrictness] = useState<Strictness>('conservative');

  return (
    <View style={styles.overlay}>
      <GlassCard intensity={50} borderRadius={0} style={styles.sheet}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.title}>How to Play Spymaster</Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close rules"
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Section title="Roles & Setup">
            <Bullet>Two teams, Red and Blue. Each team has a Spymaster and one or more Operatives.</Bullet>
            <Bullet>25 words are laid out in a 5×5 grid. A hidden key assigns 9 to the starting team, 8 to the other, 7 neutral bystanders, and 1 assassin.</Bullet>
            <Bullet>Only Spymasters may view the key (via "Spymaster View" on the board) — Operatives see a plain grid.</Bullet>
            <Bullet>The Spymaster gives a one-word clue plus a number, out loud. The number tells Operatives how many words relate to that clue.</Bullet>
          </Section>

          <Section title="Clue Checker">
            <Text style={styles.strictLabel}>Strictness</Text>
            <View style={styles.segmented}>
              {STRICTNESS_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => setStrictness(opt.key)}
                  style={[styles.segment, strictness === opt.key && styles.segmentActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Strictness: ${opt.label}`}
                >
                  <Text style={[styles.segmentLabel, strictness === opt.key && styles.segmentLabelActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {CLUE_RULES.map((rule) => (
              <View key={rule.title} style={styles.ruleCard}>
                <Text style={styles.ruleTitle}>{rule.title}</Text>
                <Text style={styles.ruleNote}>{rule.note[strictness]}</Text>
              </View>
            ))}
            <Text style={styles.hint}>Clues are spoken out loud — this app doesn't validate them for you, just gives the table a shared reference.</Text>
          </Section>

          <Section title="Advanced Mechanics">
            <Bullet><Text style={styles.bold}>+1 guess: </Text>if Operatives guess all N words correctly, they get one bonus guess before passing the turn.</Bullet>
            <Bullet><Text style={styles.bold}>"0" clue: </Text>tells Operatives none of the remaining words relate — they may guess as many as they want.</Bullet>
            <Bullet><Text style={styles.bold}>"Unlimited" clue: </Text>Operatives may guess as many words as they want for that clue.</Bullet>
            <Bullet><Text style={styles.bold}>Passing: </Text>Operatives may end their turn at any time without guessing.</Bullet>
          </Section>

          <Section title="Winning & Losing">
            <Bullet>First team to reveal all of their words wins instantly.</Bullet>
            <Bullet>Tapping the assassin tile loses the game instantly for the tapping team.</Bullet>
          </Section>
        </ScrollView>
      </GlassCard>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  sheet: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.displaySemi,
    fontSize: 17,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bulletDot: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.cyan,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
  bold: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  strictLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.cyan + '2A',
  },
  segmentLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
  },
  segmentLabelActive: {
    color: colors.cyan,
  },
  ruleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  ruleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  ruleNote: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  hint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textFaint,
    fontStyle: 'italic',
  },
});
