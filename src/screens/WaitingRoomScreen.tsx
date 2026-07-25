import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { WaitingRoomScreenProps } from '../navigation/types';
import { useLobby } from '../multiplayer/useLobby';
import { leaveLobby, setLobbyGame } from '../multiplayer/lobbyApi';
import { PrimaryButton } from '../components/PrimaryButton';
import type { LobbyPlayer } from '../multiplayer/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

type GameId = 'witlash' | 'out-of-the-loop' | 'spymaster';

const GAME_INFO: Record<
  GameId,
  { label: string; icon: 'happy' | 'help-circle' | 'grid'; accent: string; minPlayers: number; maxPlayers: number; route: 'WitlashGame' | 'OotlGame' | 'SpymasterGame' }
> = {
  witlash: { label: 'Witlash', icon: 'happy', accent: colors.cyan, minPlayers: 3, maxPlayers: 8, route: 'WitlashGame' },
  'out-of-the-loop': { label: 'Out of the Loop', icon: 'help-circle', accent: colors.purple, minPlayers: 4, maxPlayers: 8, route: 'OotlGame' },
  spymaster: { label: 'Spymaster', icon: 'grid', accent: colors.cyan, minPlayers: 2, maxPlayers: 2, route: 'SpymasterGame' },
};

export function WaitingRoomScreen({ navigation, route }: WaitingRoomScreenProps) {
  const insets = useSafeAreaInsets();
  const { lobbyId } = route.params;
  const { lobby, players, loading, error, currentUserId } = useLobby(lobbyId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleLeave = useCallback(() => {
    Alert.alert('Leave lobby?', 'You can rejoin later with the same code.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          await leaveLobby(lobbyId);
          navigation.popToTop();
        },
      },
    ]);
  }, [lobbyId, navigation]);

  // Lobby was closed/ended remotely (e.g. host deleted it) — bail out to Home.
  useEffect(() => {
    if (!loading && !error && !lobby) {
      navigation.popToTop();
    }
  }, [loading, error, lobby, navigation]);

  const selectedGame: GameId =
    lobby?.current_game === 'out-of-the-loop' || lobby?.current_game === 'spymaster' ? lobby.current_game : 'witlash';
  const gameInfo = GAME_INFO[selectedGame];

  // A game started (host or otherwise) — every player follows into it automatically.
  useEffect(() => {
    if (lobby && lobby.status === 'playing' && lobby.game_session_id) {
      navigation.replace(gameInfo.route, { lobbyId });
    }
  }, [lobby, lobbyId, navigation, gameInfo.route]);

  const myPlayer = players.find((p) => p.auth_user_id === currentUserId);
  const isHost = myPlayer?.is_host ?? false;
  const activePlayerCount = players.filter((p) => p.status === 'active').length;
  const canStart = activePlayerCount >= gameInfo.minPlayers && activePlayerCount <= gameInfo.maxPlayers;

  if (loading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !lobby) {
    return (
      <View style={[styles.root, styles.centered, { paddingHorizontal: spacing.xl }]}>
        <Text style={styles.errorText}>{error ?? 'Lobby not found.'}</Text>
        <PrimaryButton label="Back to Home" variant="outline" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  const renderPlayer = ({ item }: { item: LobbyPlayer }) => (
    <View style={styles.playerRow}>
      <View style={styles.playerAvatar}>
        <Text style={styles.playerInitial}>{item.display_name.charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.playerName} numberOfLines={1}>
        {item.display_name}
        {item.auth_user_id === currentUserId ? ' (you)' : ''}
      </Text>
      {item.is_host && (
        <View style={styles.hostBadge}>
          <Ionicons name="star" size={12} color={colors.bg} />
          <Text style={styles.hostBadgeText}>HOST</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.header}>
        <Text style={styles.kicker}>WAITING ROOM</Text>
        <Text style={styles.gameLabel}>{gameInfo.label}</Text>
      </View>

      {isHost && (
        <>
          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={`Selected game: ${gameInfo.label}. Tap to change.`}
            style={({ pressed }) => [styles.selectTrigger, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name={gameInfo.icon} size={20} color={gameInfo.accent} />
            <Text style={styles.selectTriggerLabel} numberOfLines={1}>
              {gameInfo.label}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textFaint} />
          </Pressable>

          <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
            <Pressable style={styles.modalScrim} onPress={() => setPickerOpen(false)}>
              <Pressable style={styles.modalCard} onPress={() => {}}>
                <Text style={styles.modalTitle}>Choose a game</Text>
                {(Object.keys(GAME_INFO) as GameId[]).map((id) => {
                  const info = GAME_INFO[id];
                  const active = id === selectedGame;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => {
                        setLobbyGame(lobbyId, id);
                        setPickerOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${info.label}`}
                      style={({ pressed }) => [
                        styles.modalOption,
                        active && { borderColor: info.accent, backgroundColor: info.accent + '18' },
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <Ionicons name={info.icon} size={20} color={active ? info.accent : colors.textFaint} />
                      <Text style={[styles.modalOptionLabel, active && { color: colors.text }]} numberOfLines={1}>
                        {info.label}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={info.accent} />}
                    </Pressable>
                  );
                })}
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>LOBBY CODE</Text>
        <Text style={styles.code}>{lobby.lobby_code}</Text>
      </View>

      <View style={styles.countRow}>
        <Ionicons name="people" size={16} color={colors.textMuted} />
        <Text style={styles.countText}>
          {players.length} / {lobby.max_players} players
        </Text>
      </View>

      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        renderItem={renderPlayer}
        contentContainerStyle={styles.playerList}
        showsVerticalScrollIndicator={false}
      />

      {isHost && (
        <>
          {!canStart && (
            <Text style={styles.startReason}>
              {activePlayerCount < gameInfo.minPlayers
                ? `Need at least ${gameInfo.minPlayers} players (${activePlayerCount} here now).`
                : `${gameInfo.label} supports up to ${gameInfo.maxPlayers} players.`}
            </Text>
          )}
          <PrimaryButton
            label={`Start ${gameInfo.label}`}
            icon="play"
            color={gameInfo.accent}
            onPress={() => navigation.navigate(gameInfo.route, { lobbyId })}
            disabled={!canStart}
            style={styles.startBtn}
          />
        </>
      )}

      <PrimaryButton label="Leave Lobby" variant="outline" color={colors.danger} onPress={handleLeave} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    marginBottom: spacing.lg,
  },
  selectTriggerLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  modalOptionLabel: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textFaint,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.primary,
  },
  gameLabel: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    marginTop: spacing.xs,
  },
  codeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.textFaint,
    marginBottom: spacing.sm,
  },
  code: {
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: 8,
    color: colors.text,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  countText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textMuted,
  },
  playerList: {
    paddingBottom: spacing.lg,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitial: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.text,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.yellow,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  hostBadgeText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.bg,
  },
  startReason: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  startBtn: {
    marginBottom: spacing.md,
  },
});
