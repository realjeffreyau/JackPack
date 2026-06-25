import React, { useState } from 'react';
import {
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
import type { Player } from '../types';

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 12;

interface Props {
  onDone: (players: Player[]) => void;
}

export function PlayerSetup({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);

  function addPlayer() {
    const name = input.trim();
    if (!name || players.length >= MAX_PLAYERS) return;
    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random()}`,
      name,
      totalScore: 0,
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setInput('');
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  const canAdd = !!input.trim() && players.length < MAX_PLAYERS;
  const canStart = players.length >= MIN_PLAYERS;

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Who's Playing?</Text>
      <Text style={styles.sub}>Add {MIN_PLAYERS}–{MAX_PLAYERS} players</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Enter a name…"
          placeholderTextColor={colors.textFaint}
          returnKeyType="done"
          onSubmitEditing={addPlayer}
          maxLength={20}
        />
        <Pressable
          onPress={addPlayer}
          disabled={!canAdd}
          style={({ pressed }) => [
            styles.addBtn,
            { opacity: !canAdd ? 0.4 : pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add player"
        >
          <Ionicons name="person-add" size={22} color={colors.lime} />
        </Pressable>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {players.map((player) => (
          <View key={player.id} style={styles.chip}>
            <Ionicons name="person" size={16} color={colors.lime} />
            <Text style={styles.chipText}>{player.name}</Text>
            <Pressable
              onPress={() => removePlayer(player.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${player.name}`}
            >
              <Ionicons name="close-circle" size={20} color={colors.textFaint} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.count}>
        {players.length} / {MAX_PLAYERS} players
        {!canStart && players.length > 0
          ? `  ·  Need ${MIN_PLAYERS - players.length} more`
          : ''}
      </Text>

      <PrimaryButton
        label="Let's Play"
        icon="arrow-forward"
        color={colors.lime}
        onPress={() => onDone(players)}
        disabled={!canStart}
        style={styles.startBtn}
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
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  addBtn: {
    padding: spacing.sm,
  },
  list: {
    flex: 1,
    marginBottom: spacing.md,
  },
  listContent: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lime + '44',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chipText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  startBtn: {
    marginTop: spacing.sm,
  },
});
