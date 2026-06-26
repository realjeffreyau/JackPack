import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import { MAX_PLAYERS, MIN_PLAYERS, hasDuplicateNames, makePlayerId, type Player } from '../types';

interface Props {
  accent: string;
  onDone: (players: Player[]) => void;
  onBack: () => void;
}

export function PlayerSetup({ accent, onDone, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [names, setNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3']);

  function updateName(i: number, v: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? v : n)));
  }
  function addPlayer() {
    if (names.length < MAX_PLAYERS) setNames((prev) => [...prev, `Player ${prev.length + 1}`]);
  }
  function removePlayer(i: number) {
    if (names.length > MIN_PLAYERS) setNames((prev) => prev.filter((_, idx) => idx !== i));
  }

  const filled = names.map((n) => n.trim()).filter(Boolean);
  const dup = hasDuplicateNames(names);
  const canStart = filled.length >= MIN_PLAYERS && filled.length === names.length && !dup;
  const blank = names.some((n) => !n.trim());

  function start() {
    onDone(names.map((n) => ({ id: makePlayerId(), name: n.trim(), points: 0 })));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Players</Text>
        <Text style={styles.sub}>At least {MIN_PLAYERS}, up to {MAX_PLAYERS}.</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {names.map((name, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.indexPill, { backgroundColor: accent + '22' }]}>
                <Text style={[styles.indexText, { color: accent }]}>{i + 1}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(v) => updateName(i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={colors.textFaint}
                maxLength={18}
                autoCapitalize="words"
                accessibilityLabel={`Player ${i + 1} name`}
              />
              {names.length > MIN_PLAYERS && (
                <Pressable
                  onPress={() => removePlayer(i)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove player ${i + 1}`}
                  style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.5 : 1 }]}
                >
                  <Ionicons name="close-circle" size={22} color={colors.textFaint} />
                </Pressable>
              )}
            </View>
          ))}

          {names.length < MAX_PLAYERS && (
            <Pressable
              onPress={addPlayer}
              accessibilityRole="button"
              accessibilityLabel="Add player"
              style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="add-circle-outline" size={20} color={accent} />
              <Text style={[styles.addLabel, { color: accent }]}>Add Player</Text>
            </Pressable>
          )}
        </ScrollView>

        <PrimaryButton label="Start Game" icon="play" color={accent} onPress={start} disabled={!canStart} />
        {!canStart && blank && <Text style={styles.warning}>Player names can't be empty.</Text>}
        {!canStart && !blank && dup && <Text style={styles.warning}>Player names must be unique.</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingLeft: 48 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: -4 },
  backText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text },
  sub: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  indexPill: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  indexText: { fontFamily: fonts.bodyExtra, fontSize: 13 },
  input: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    minHeight: 48,
  },
  removeBtn: { padding: spacing.xs },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, alignSelf: 'center' },
  addLabel: { fontFamily: fonts.bodySemi, fontSize: 15 },
  warning: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
});
