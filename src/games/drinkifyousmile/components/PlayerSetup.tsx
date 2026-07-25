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

interface PlayerSetupProps {
  onDone: (names: string[]) => void;
  onExit: () => void;
  initialNames?: string[];
}

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export function PlayerSetup({ onDone, onExit, initialNames }: PlayerSetupProps) {
  const insets = useSafeAreaInsets();
  const [names, setNames] = useState<string[]>(
    initialNames && initialNames.length >= MIN_PLAYERS ? initialNames : ['', '', ''],
  );
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLoad = useRef(false);

  useEffect(() => {
    if (initialNames && initialNames.length >= MIN_PLAYERS) {
      didLoad.current = true;
      return;
    }
    loadSavedNames(PLAYER_NAMES_KEY).then((saved) => {
      if (saved && saved.length >= MIN_PLAYERS) setNames(saved);
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

  function updateName(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addPlayer() {
    if (names.length < MAX_PLAYERS) {
      setNames((prev) => [...prev, '']);
    }
  }

  function removePlayer(index: number) {
    if (names.length > MIN_PLAYERS) {
      setNames((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function clearAll() {
    Alert.alert('Clear saved player names?', 'Player list will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearSavedNames(PLAYER_NAMES_KEY);
          setNames(['', '', '']);
        },
      },
    ]);
  }

  const filled = names.map((n) => n.trim()).filter(Boolean);
  const canProceed = filled.length >= MIN_PLAYERS && filled.length === names.length;

  function proceed() {
    onDone(names.map((n) => n.trim()));
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <View style={styles.topBar}>
          <Text style={styles.title}>Who's Playing?</Text>
          <View style={styles.topRight}>
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
        </View>

        <Text style={styles.sub}>Enter each player's name before starting.</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {names.map((name, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.indexPill}>
                <Text style={styles.indexText}>{i + 1}</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(v) => updateName(i, v)}
                placeholder={`Player ${i + 1}`}
                placeholderTextColor={colors.textFaint}
                maxLength={20}
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
              <Ionicons name="add-circle-outline" size={20} color={colors.orange} />
              <Text style={styles.addLabel}>Add Player</Text>
            </Pressable>
          )}
        </ScrollView>

        <PrimaryButton
          label="Set Up Game"
          icon="arrow-forward"
          onPress={proceed}
          disabled={!canProceed}
          color={colors.orange}
        />
        {!canProceed && names.some((n) => !n.trim()) && (
          <Text style={styles.warning}>All name fields must be filled in.</Text>
        )}
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
    paddingLeft: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.textMuted,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
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
    color: colors.orange,
  },
  warning: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
