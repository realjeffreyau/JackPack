import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { SpymasterGameScreenProps } from '../navigation/types';
import { useLobby } from '../multiplayer/useLobby';
import { useSpymasterSession } from '../multiplayer/spymaster/useSpymasterSession';
import { revealTile, endTurn, newGame, endSpymasterGame } from '../multiplayer/spymaster/spymasterApi';
import type { SpymasterState } from '../multiplayer/spymaster/types';
import { SpymasterSettingsScreen } from './spymaster/SpymasterSettingsScreen';
import { BoardScreen } from './spymaster/BoardScreen';
import { KeyScreen } from './spymaster/KeyScreen';
import { GameOverScreen } from './spymaster/GameOverScreen';
import { colors } from '../theme/theme';

function Loading() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.cyan} />
    </View>
  );
}

export function SpymasterGameScreen({ navigation, route }: SpymasterGameScreenProps) {
  const { lobbyId } = route.params;
  const { lobby, players, currentUserId } = useLobby(lobbyId);
  const sessionId = lobby?.game_session_id ?? null;
  const { session } = useSpymasterSession(sessionId);

  const myPlayer = players.find((p) => p.auth_user_id === currentUserId);
  const isHost = myPlayer?.is_host ?? false;
  const activePlayerCount = players.filter((p) => p.status === 'active').length;

  useEffect(() => {
    if (lobby && lobby.status === 'waiting' && lobby.game_session_id === null && sessionId !== null) {
      navigation.replace('WaitingRoom', { lobbyId });
    }
  }, [lobby, sessionId, lobbyId, navigation]);

  if (!lobby) return <Loading />;

  if (!sessionId) {
    return <SpymasterSettingsScreen lobbyId={lobbyId} isHost={isHost} activePlayerCount={activePlayerCount} />;
  }

  const state = session?.state as SpymasterState | undefined;
  if (!session || !state) return <Loading />;

  if (session.phase === 'game_over') {
    return (
      <GameOverScreen
        state={state}
        isHost={isHost}
        onPlayAgain={() => newGame(sessionId)}
        onEndGame={() => endSpymasterGame(lobbyId)}
      />
    );
  }

  if (isHost) {
    return (
      <BoardScreen
        state={state}
        onTilePress={(index) => revealTile(sessionId, index)}
        onEndTurn={() => endTurn(sessionId)}
      />
    );
  }

  return <KeyScreen state={state} />;
}
