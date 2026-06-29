import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { PLAYER_NAMES_KEY, clearSavedNames, loadSavedNames, persistNames } from '../../../utils/savedNames';
import type { VerdictPlayer } from '../types';

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 8;

function makeId(): string {
  return `vp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface Props {
  onDone: (players: VerdictPlayer[]) => void;
}

export function PlayerSetup({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    loadSavedNames(PLAYER_NAMES_KEY).then((saved) => {
      if (saved && saved.length >= MIN_PLAYERS) {
        setNames(saved.slice(0, MAX_PLAYERS));
      }
      didLoad.current = true;
    });
  }, []);

  useEffect(() => {
    if (!didLoad.current) return;
    const filled = names.map((n) => n.trim()).filter(Boolean);
    if (filled.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistNames(PLAYER_NAMES_KEY, filled), 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [names]);

  function updateName(i: number, v: string) {
    setNames((prev) => prev.map((n, idx) => (idx === i ? v : n)));
  }

  function addPlayer() {
    if (names.length < MAX_PLAYERS) setNames((prev) => [...prev, '']);
  }

  function removePlayer(i: number) {
    if (names.length > MIN_PLAYERS) setNames((prev) => prev.filter((_, idx) => idx !== i));
  }

  function clearAll() {
    Alert.alert('Clear saved player names?', 'Player list will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearSavedNames(PLAYER_NAMES_KEY);
          setNames(['', '', '', '']);
        },
      },
    ]);
  }

  const filled = names.map((n) => n.trim()).filter(Boolean);
  const hasDupes = new Set(filled).size !== filled.length;
  const canStart = filled.length >= MIN_PLAYERS && filled.length === names.length && !hasDupes;

  function start() {
    const players: VerdictPlayer[] = names.map((n) => ({
      id: makeId(),
      name: n.trim(),
      credibility: 0,
    }));
    onDone(players);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Who's Playing?</Text>
          <Pressable
            onPress={clearAll}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear all player names"
            style={({ pressed }) => [styles.clearBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
            <Text style={styles.clearText}>Clear All</Text>
          </Pressable>
        </View>
        <Text style={styles.sub}>{MIN_PLAYERS}–{MAX_PLAYERS} players</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {names.map((name, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.indexPill, { backgroundColor: colors.yellow + '22' }]}>
                <Text style={[styles.indexText, { color: colors.yellow }]}>{i + 1}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(v) => updateName(i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={colors.textFaint}
                maxLength={18}
                autoCapitalize="words"
                returnKeyType="next"
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
              <Ionicons name="add-circle-outline" size={20} color={colors.yellow} />
              <Text style={[styles.addLabel, { color: colors.yellow }]}>Add Player</Text>
            </Pressable>
          )}
        </ScrollView>

        <PrimaryButton
          label="Choose Rounds"
          icon="arrow-forward"
          color={colors.yellow}
          onPress={start}
          disabled={!canStart}
        />
        {!canStart && names.some((n) => !n.trim()) && (
          <Text style={styles.warning}>All name fields must be filled in.</Text>
        )}
        {!canStart && !names.some((n) => !n.trim()) && hasDupes && (
          <Text style={styles.warning}>Player names must be unique.</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingLeft: 48,
  },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  clearText: { fontFamily: fonts.bodySemi, fontSize: 14, color: colors.textFaint },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing.md, paddingBottom: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  indexPill: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    alignSelf: 'center',
  },
  addLabel: { fontFamily: fonts.bodySemi, fontSize: 15 },
  warning: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
