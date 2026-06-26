import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
  visible: boolean;
  accent: string;
  players: Player[];
  /** True when agendas are already dealt this round — saving restarts the round. */
  restartWarning: boolean;
  onSave: (players: Player[]) => void;
  onCancel: () => void;
}

export function EditPlayersModal({ visible, accent, players, restartWarning, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Player[]>(players);
  const [warn, setWarn] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(players.map((p) => ({ ...p })));
      setWarn('');
    }
  }, [visible, players]);

  function rename(id: string, name: string) {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }
  function adjust(id: string, delta: number) {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, points: Math.max(0, p.points + delta) } : p)));
  }
  function addPlayer() {
    if (draft.length < MAX_PLAYERS) setDraft((prev) => [...prev, { id: makePlayerId(), name: `Player ${prev.length + 1}`, points: 0 }]);
  }
  function removePlayer(id: string) {
    if (draft.length > MIN_PLAYERS) setDraft((prev) => prev.filter((p) => p.id !== id));
  }
  function clearScores() {
    Alert.alert('Reset all scores?', 'Every player goes back to 0.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setDraft((prev) => prev.map((p) => ({ ...p, points: 0 }))) },
    ]);
  }

  function commit() {
    const trimmed = draft.map((p) => ({ ...p, name: p.name.trim() }));
    if (trimmed.some((p) => !p.name)) { setWarn('Player names can’t be empty.'); return; }
    if (trimmed.length < MIN_PLAYERS) { setWarn(`You need at least ${MIN_PLAYERS} players.`); return; }
    if (hasDuplicateNames(trimmed.map((p) => p.name))) { setWarn('Player names must be unique.'); return; }
    onSave(trimmed);
  }

  function save() {
    if (restartWarning) {
      Alert.alert(
        'Restart this round?',
        'Changing players will restart this round because secret agendas were already assigned.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save & Restart Round', style: 'destructive', onPress: commit },
        ],
      );
      return;
    }
    commit();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Edit Players</Text>
          <Text style={styles.sub}>
            {restartWarning ? 'Agendas are dealt — saving restarts this round.' : 'Rename, add or remove players, and adjust scores.'}
          </Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {draft.map((p) => (
              <View key={p.id} style={styles.row}>
                <TextInput
                  style={styles.input}
                  value={p.name}
                  onChangeText={(v) => rename(p.id, v)}
                  placeholder="Name"
                  placeholderTextColor={colors.textFaint}
                  maxLength={18}
                  autoCapitalize="words"
                  accessibilityLabel="Player name"
                />
                <View style={styles.pointsCtrl}>
                  <Pressable
                    onPress={() => adjust(p.id, -1)}
                    hitSlop={6}
                    disabled={p.points <= 0}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease ${p.name}`}
                    style={({ pressed }) => [styles.stepBtn, { opacity: p.points <= 0 ? 0.3 : pressed ? 0.6 : 1 }]}
                  >
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </Pressable>
                  <Text style={styles.points}>{p.points}</Text>
                  <Pressable
                    onPress={() => adjust(p.id, 1)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase ${p.name}`}
                    style={({ pressed }) => [styles.stepBtn, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Ionicons name="add" size={18} color={colors.text} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => removePlayer(p.id)}
                  hitSlop={6}
                  disabled={draft.length <= MIN_PLAYERS}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${p.name}`}
                  style={({ pressed }) => [styles.removeBtn, { opacity: draft.length <= MIN_PLAYERS ? 0.25 : pressed ? 0.5 : 1 }]}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.textFaint} />
                </Pressable>
              </View>
            ))}

            {draft.length < MAX_PLAYERS && (
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

          {!!warn && <Text style={styles.warn}>{warn}</Text>}

          <View style={styles.actions}>
            <View style={styles.actionRow}>
              <PrimaryButton label="Cancel" variant="ghost" size="md" color={colors.textMuted} onPress={onCancel} style={styles.flex} />
              <PrimaryButton label="Clear Scores" variant="outline" size="md" color={colors.danger} onPress={clearScores} style={styles.flex} />
            </View>
            <PrimaryButton label={restartWarning ? 'Save & Restart' : 'Save'} icon="checkmark" color={accent} onPress={save} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '90%',
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: radius.pill, backgroundColor: colors.border, marginBottom: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  sub: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: 2, marginBottom: spacing.lg },
  list: { flexGrow: 0 },
  listContent: { gap: spacing.md, paddingBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    minHeight: 46,
  },
  pointsCtrl: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  points: { fontFamily: fonts.display, fontSize: 18, color: colors.text, minWidth: 24, textAlign: 'center' },
  removeBtn: { padding: spacing.xs },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, alignSelf: 'center' },
  addLabel: { fontFamily: fonts.bodySemi, fontSize: 15 },
  warn: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  actions: { gap: spacing.md, paddingTop: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
