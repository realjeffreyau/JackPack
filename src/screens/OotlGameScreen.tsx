import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { OotlGameScreenProps } from '../navigation/types';
import { useLobby } from '../multiplayer/useLobby';
import { useOotlSession } from '../multiplayer/ootl/useOotlSession';
import { useServerCountdown } from '../multiplayer/witlash/useServerCountdown';
import {
  markReady,
  beginAnswering,
  advanceSpeaker,
  advanceQuestionOrDiscussion,
  advanceToVoting,
  submitOotlVote,
  resolveVotes,
  advanceFromResults,
  judgeGuess,
  endOotlGame,
} from '../multiplayer/ootl/ootlApi';
import { OOTL_CATEGORIES } from '../data/ootlTopics';
import type { OotlState } from '../multiplayer/ootl/types';
import { OotlSettingsScreen } from './ootl/OotlSettingsScreen';
import { RoleRevealScreen } from './ootl/RoleRevealScreen';
import { OotlAnsweringScreen } from './ootl/OotlAnsweringScreen';
import { DiscussionScreen } from './ootl/DiscussionScreen';
import { OotlVotingScreen } from './ootl/OotlVotingScreen';
import { OotlVoteResultsScreen } from './ootl/OotlVoteResultsScreen';
import { FinalGuessScreen } from './ootl/FinalGuessScreen';
import { OotlGameOverScreen } from './ootl/OotlGameOverScreen';
import { colors } from '../theme/theme';

function Loading() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.purple} />
    </View>
  );
}

export function OotlGameScreen({ navigation, route }: OotlGameScreenProps) {
  const { lobbyId } = route.params;
  const { lobby, players, currentUserId } = useLobby(lobbyId);
  const sessionId = lobby?.game_session_id ?? null;
  const { session, votes } = useOotlSession(sessionId);

  const myPlayer = players.find((p) => p.auth_user_id === currentUserId);
  const isHost = myPlayer?.is_host ?? false;
  const myPlayerId = myPlayer?.id;
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);
  const activePlayerIds = useMemo(() => players.filter((p) => p.status === 'active').map((p) => p.id), [players]);

  const readyRef = useRef(false);
  const speakerRef = useRef(false);
  const discussionRef = useRef(false);
  const voteRef = useRef(false);

  useEffect(() => {
    if (lobby && lobby.status === 'waiting' && lobby.game_session_id === null && sessionId !== null) {
      navigation.replace('WaitingRoom', { lobbyId });
    }
  }, [lobby, sessionId, lobbyId, navigation]);

  const state = session?.state as OotlState | undefined;
  const category = state ? OOTL_CATEGORIES.find((c) => c.id === state.category) : undefined;
  const discussionTimeLeft = useServerCountdown(state?.discussion_ends_at ?? null);

  // Host-only: all active players ready → begin answering.
  useEffect(() => {
    if (!isHost || !session || !state || session.phase !== 'role_reveal') return;
    if (readyRef.current) return;
    const allReady = activePlayerIds.every((id) => state.ready_player_ids.includes(id));
    if (allReady && activePlayerIds.length > 0) {
      readyRef.current = true;
      beginAnswering(sessionId!).finally(() => {
        readyRef.current = false;
      });
    }
  }, [isHost, session, state, activePlayerIds, sessionId]);

  // Host-only: last speaker done for this question → next question or discussion.
  useEffect(() => {
    if (!isHost || !session || !state || session.phase !== 'answering' || !sessionId) return;
    if (speakerRef.current) return;
    if (state.current_speaker_index >= state.speaking_order.length) {
      speakerRef.current = true;
      advanceQuestionOrDiscussion(sessionId, lobbyId).finally(() => {
        speakerRef.current = false;
      });
    }
  }, [isHost, session, state, sessionId, lobbyId]);

  // Host-only: discussion timer expires → voting.
  useEffect(() => {
    if (!isHost || !session || session.phase !== 'discussion' || !sessionId) return;
    if (discussionRef.current) return;
    if (discussionTimeLeft <= 0) {
      discussionRef.current = true;
      advanceToVoting(sessionId).finally(() => {
        discussionRef.current = false;
      });
    }
  }, [isHost, session, discussionTimeLeft, sessionId]);

  // Host-only: everyone has voted → resolve.
  useEffect(() => {
    if (!isHost || !session || session.phase !== 'voting' || !sessionId) return;
    if (voteRef.current) return;
    if (activePlayerIds.length > 0 && votes.length >= activePlayerIds.length) {
      voteRef.current = true;
      resolveVotes(sessionId, lobbyId).finally(() => {
        voteRef.current = false;
      });
    }
  }, [isHost, session, votes, activePlayerIds, sessionId, lobbyId]);

  if (!lobby) return <Loading />;

  if (!sessionId) {
    return <OotlSettingsScreen lobbyId={lobbyId} isHost={isHost} activePlayerCount={activePlayerIds.length} />;
  }

  if (!session || !state || !myPlayerId || !category) return <Loading />;

  if (session.phase === 'role_reveal') {
    return (
      <RoleRevealScreen
        categoryName={category.name}
        topic={state.topic}
        isOutsider={myPlayerId === state.outsider_player_id}
        isReady={state.ready_player_ids.includes(myPlayerId)}
        readyCount={state.ready_player_ids.length}
        totalCount={activePlayerIds.length}
        onReady={() => markReady(sessionId, myPlayerId)}
        isHost={isHost}
        onForceStart={() => beginAnswering(sessionId)}
      />
    );
  }

  if (session.phase === 'answering') {
    const question = category.questions[state.question_ids[state.current_question_index]];
    const speakers = state.speaking_order.map((id, index) => ({
      playerId: id,
      name: players.find((p) => p.id === id)?.display_name ?? '?',
      isCurrent: index === state.current_speaker_index,
      hasSpoken: index < state.current_speaker_index,
    }));
    const isCurrentSpeaker = state.speaking_order[state.current_speaker_index] === myPlayerId;

    return (
      <OotlAnsweringScreen
        question={question}
        questionNumber={state.current_question_index + 1}
        totalQuestions={state.question_ids.length}
        speakers={speakers}
        isCurrentSpeaker={isCurrentSpeaker}
        onDone={() => advanceSpeaker(sessionId)}
        isHost={isHost}
        onSkipSpeaker={() => advanceSpeaker(sessionId)}
      />
    );
  }

  if (session.phase === 'discussion') {
    return (
      <DiscussionScreen
        timeLeft={discussionTimeLeft}
        discussionSec={state.settings.discussionSec}
        isHost={isHost}
        onSkip={() => advanceToVoting(sessionId)}
      />
    );
  }

  if (session.phase === 'voting') {
    const votablePlayers = players
      .filter((p) => p.status === 'active' && p.id !== myPlayerId)
      .map((p) => ({ playerId: p.id, name: p.display_name }));
    const myVoteAccusedId = votes.find((v) => v.voter_player_id === myPlayerId)?.accused_player_id ?? null;

    return (
      <OotlVotingScreen
        players={votablePlayers}
        myVoteAccusedId={myVoteAccusedId}
        onVote={(accusedId) => submitOotlVote(sessionId, myPlayerId, accusedId)}
        votedCount={votes.length}
        totalEligible={activePlayerIds.length}
      />
    );
  }

  if (session.phase === 'vote_results') {
    const outsiderName = players.find((p) => p.id === state.outsider_player_id)?.display_name ?? 'Unknown';
    const tally = players
      .filter((p) => p.status === 'active')
      .map((p) => ({
        playerId: p.id,
        name: p.display_name,
        votes: votes.filter((v) => v.accused_player_id === p.id).length,
      }))
      .sort((a, b) => b.votes - a.votes);

    return (
      <OotlVoteResultsScreen
        caught={state.caught ?? false}
        outsiderName={outsiderName}
        topic={state.topic}
        tally={tally}
        isHost={isHost}
        onContinue={() => advanceFromResults(sessionId)}
      />
    );
  }

  if (session.phase === 'final_guess') {
    return (
      <FinalGuessScreen
        isOutsider={myPlayerId === state.outsider_player_id}
        isHost={isHost}
        onJudge={(correct) => judgeGuess(sessionId, lobbyId, correct)}
      />
    );
  }

  if (session.phase === 'game_over') {
    const outsiderName = players.find((p) => p.id === state.outsider_player_id)?.display_name ?? 'Unknown';
    return (
      <OotlGameOverScreen
        caught={state.caught ?? false}
        guessCorrect={state.guess_correct}
        outsiderName={outsiderName}
        topic={state.topic}
        players={sortedPlayers}
        isHost={isHost}
        onBackToLobby={() => endOotlGame(lobbyId)}
      />
    );
  }

  return <Loading />;
}
