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
import { MAX_TEAMS, MIN_TEAMS, makeTeamId, type Team } from '../types';
import { TEAM_NAMES_KEY, persistNames } from '../../../utils/savedNames';

interface Props {
  visible: boolean;
  accent: string;
  teams: Team[];
  onSave: (teams: Team[]) => void;
  onCancel: () => void;
}

export function ManageTeamsModal({ visible, accent, teams, onSave, onCancel }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<Team[]>(teams);
  const [showWarning, setShowWarning] = useState(false);

  // Reset the working copy each time the modal opens so Cancel truly discards.
  useEffect(() => {
    if (visible) {
      setDraft(teams.map((t) => ({ ...t })));
      setShowWarning(false);
    }
  }, [visible, teams]);

  function rename(id: string, name: string) {
    setDraft((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  }

  function adjust(id: string, delta: number) {
    setDraft((prev) => prev.map((t) => (t.id === id ? { ...t, points: Math.max(0, t.points + delta) } : t)));
  }

  function addTeam() {
    if (draft.length < MAX_TEAMS) {
      setDraft((prev) => [...prev, { id: makeTeamId(), name: `Team ${prev.length + 1}`, points: 0 }]);
    }
  }

  function removeTeam(id: string) {
    if (draft.length > MIN_TEAMS) setDraft((prev) => prev.filter((t) => t.id !== id));
  }

  function clearPoints() {
    Alert.alert('Reset all points?', 'Every team goes back to 0. Teams and names stay.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => setDraft((prev) => prev.map((t) => ({ ...t, points: 0 }))) },
    ]);
  }

  function clearNames() {
    Alert.alert('Clear all team names?', 'Names will be reset to blank.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setDraft((prev) => prev.map((t) => ({ ...t, name: '' }))) },
    ]);
  }

  function save() {
    const trimmed = draft.map((t) => ({ ...t, name: t.name.trim() }));
    if (trimmed.some((t) => !t.name) || trimmed.length < MIN_TEAMS) {
      setShowWarning(true);
      return;
    }
    persistNames(TEAM_NAMES_KEY, trimmed.map((t) => t.name));
    onSave(trimmed);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Manage Teams</Text>
          <Text style={styles.sub}>Rename, add or remove teams, and adjust points.</Text>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {draft.map((t) => (
              <View key={t.id} style={styles.row}>
                <TextInput
                  style={styles.input}
                  value={t.name}
                  onChangeText={(v) => rename(t.id, v)}
                  placeholder="Team name"
                  placeholderTextColor={colors.textFaint}
                  maxLength={18}
                  autoCapitalize="words"
                  accessibilityLabel="Team name"
                />
                <View style={styles.pointsCtrl}>
                  <Pressable
                    onPress={() => adjust(t.id, -1)}
                    hitSlop={6}
                    disabled={t.points <= 0}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease ${t.name} points`}
                    style={({ pressed }) => [styles.stepBtn, { opacity: t.points <= 0 ? 0.3 : pressed ? 0.6 : 1 }]}
                  >
                    <Ionicons name="remove" size={18} color={colors.text} />
                  </Pressable>
                  <Text style={styles.points}>{t.points}</Text>
                  <Pressable
                    onPress={() => adjust(t.id, 1)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase ${t.name} points`}
                    style={({ pressed }) => [styles.stepBtn, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <Ionicons name="add" size={18} color={colors.text} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => removeTeam(t.id)}
                  hitSlop={6}
                  disabled={draft.length <= MIN_TEAMS}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${t.name}`}
                  style={({ pressed }) => [
                    styles.removeBtn,
                    { opacity: draft.length <= MIN_TEAMS ? 0.25 : pressed ? 0.5 : 1 },
                  ]}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.textFaint} />
                </Pressable>
              </View>
            ))}

            {draft.length < MAX_TEAMS && (
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

          {showWarning && <Text style={styles.warning}>Team names can't be empty and you need at least {MIN_TEAMS} teams.</Text>}

          <View style={styles.actions}>
            <View style={styles.actionRow}>
              <PrimaryButton label="Cancel" variant="ghost" size="md" color={colors.textMuted} onPress={onCancel} style={styles.flex} />
              <PrimaryButton label="Clear Points" variant="outline" size="md" color={colors.danger} onPress={clearPoints} style={styles.flex} />
            </View>
            <PrimaryButton label="Clear Names" variant="outline" size="md" color={colors.danger} onPress={clearNames} />
            <PrimaryButton label="Save" icon="checkmark" color={accent} onPress={save} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '90%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
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
  pointsCtrl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
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
  points: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
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
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
});
