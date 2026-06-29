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
import { MAX_TEAMS, MIN_TEAMS, makeTeamId, type Team } from '../types';
import { TEAM_NAMES_KEY, clearSavedNames, loadSavedNames, persistNames } from '../../../utils/savedNames';

interface Props {
  accent: string;
  onDone: (teams: Team[]) => void;
  onBack: () => void;
}

export function TeamSetup({ accent, onDone, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [names, setNames] = useState<string[]>(['Team 1', 'Team 2']);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    loadSavedNames(TEAM_NAMES_KEY).then((saved) => {
      if (saved && saved.length >= MIN_TEAMS) setNames(saved);
      didLoad.current = true;
    });
  }, []);

  useEffect(() => {
    if (!didLoad.current) return;
    const filled = names.map((n) => n.trim()).filter(Boolean);
    if (filled.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistNames(TEAM_NAMES_KEY, filled), 400);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [names]);

  function updateName(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addTeam() {
    if (names.length < MAX_TEAMS) setNames((prev) => [...prev, `Team ${prev.length + 1}`]);
  }

  function removeTeam(index: number) {
    if (names.length > MIN_TEAMS) setNames((prev) => prev.filter((_, i) => i !== index));
  }

  function clearAll() {
    Alert.alert('Clear saved team names?', 'Team names will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearSavedNames(TEAM_NAMES_KEY);
          setNames(['Team 1', 'Team 2']);
        },
      },
    ]);
  }

  const filled = names.map((n) => n.trim()).filter(Boolean);
  const canStart = filled.length >= MIN_TEAMS && filled.length === names.length;
  const hasBlank = names.some((n) => !n.trim());

  function start() {
    const teams: Team[] = names.map((n) => ({ id: makeTeamId(), name: n.trim(), points: 0 }));
    onDone(teams);
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
          <Pressable
            onPress={clearAll}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear all team names"
            style={({ pressed }) => [styles.clearBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
            <Text style={styles.clearText}>Clear All</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Teams</Text>
        <Text style={styles.sub}>At least {MIN_TEAMS} teams, up to {MAX_TEAMS}. Most explosion points loses.</Text>

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
                placeholder={`Team ${i + 1}`}
                placeholderTextColor={colors.textFaint}
                maxLength={18}
                autoCapitalize="words"
                returnKeyType="next"
                accessibilityLabel={`Team ${i + 1} name`}
              />
              {names.length > MIN_TEAMS && (
                <Pressable
                  onPress={() => removeTeam(i)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove team ${i + 1}`}
                  style={({ pressed }) => [styles.removeBtn, { opacity: pressed ? 0.5 : 1 }]}
                >
                  <Ionicons name="close-circle" size={22} color={colors.textFaint} />
                </Pressable>
              )}
            </View>
          ))}

          {names.length < MAX_TEAMS && (
            <Pressable
              onPress={addTeam}
              accessibilityRole="button"
              accessibilityLabel="Add team"
              style={({ pressed }) => [styles.addBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons name="add-circle-outline" size={20} color={accent} />
              <Text style={[styles.addLabel, { color: accent }]}>Add Team</Text>
            </Pressable>
          )}
        </ScrollView>

        <PrimaryButton label="Start Game" icon="play" color={accent} onPress={start} disabled={!canStart} />
        {!canStart && hasBlank && <Text style={styles.warning}>Team names can't be empty.</Text>}
      </View>
    </KeyboardAvoidingView>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: -4,
  },
  backText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clearText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textFaint,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  indexPill: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
  },
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
  removeBtn: {
    padding: spacing.xs,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    alignSelf: 'center',
  },
  addLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
  },
  warning: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
