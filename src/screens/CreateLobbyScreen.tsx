import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { CreateLobbyScreenProps } from '../navigation/types';
import { createLobby } from '../multiplayer/lobbyApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../theme/theme';

export function CreateLobbyScreen({ navigation }: CreateLobbyScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= 20 && !submitting;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const { lobbyId } = await createLobby(trimmed);
      navigation.replace('WaitingRoom', { lobbyId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create lobby.');
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <View style={styles.body}>
        <Text style={styles.kicker}>MULTI PHONE</Text>
        <Text style={styles.title}>Create Lobby</Text>
        <Text style={styles.subtitle}>Pick a name your friends will see in the lobby.</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textFaint}
          maxLength={20}
          autoCapitalize="words"
          autoCorrect={false}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <PrimaryButton
        label={submitting ? 'Creating…' : 'Create Lobby'}
        icon="add-circle"
        onPress={handleCreate}
        disabled={!canSubmit}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginBottom: spacing.lg,
  },
  backLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  body: {
    flex: 1,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.text,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.danger,
    marginTop: spacing.md,
  },
});
