import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { JoinLobbyScreenProps } from '../navigation/types';
import { joinLobby, LobbyJoinError } from '../multiplayer/lobbyApi';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../theme/theme';

export function JoinLobbyScreen({ navigation }: JoinLobbyScreenProps) {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedCode = code.trim();
  const trimmedName = name.trim();
  const canSubmit = trimmedCode.length === 6 && trimmedName.length > 0 && trimmedName.length <= 20 && !submitting;

  const handleJoin = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const { lobbyId } = await joinLobby(trimmedCode, trimmedName);
      navigation.replace('WaitingRoom', { lobbyId });
    } catch (e) {
      setError(e instanceof LobbyJoinError ? e.message : 'Failed to join lobby.');
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
        <Text style={styles.title}>Join Lobby</Text>
        <Text style={styles.subtitle}>Enter the 6-character code and your name.</Text>

        <TextInput
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase().slice(0, 6))}
          placeholder="ABCXYZ"
          placeholderTextColor={colors.textFaint}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          style={[styles.input, styles.codeInput]}
          returnKeyType="next"
        />

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textFaint}
          maxLength={20}
          autoCapitalize="words"
          autoCorrect={false}
          style={[styles.input, { marginTop: spacing.md }]}
          returnKeyType="done"
          onSubmitEditing={handleJoin}
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <PrimaryButton
        label={submitting ? 'Joining…' : 'Join Lobby'}
        icon="enter"
        onPress={handleJoin}
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
    color: colors.cyan,
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
  codeInput: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 6,
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.danger,
    marginTop: spacing.md,
  },
});
