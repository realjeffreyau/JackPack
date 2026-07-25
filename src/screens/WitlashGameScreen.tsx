import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { WitlashGameScreenProps } from '../navigation/types';
import { useLobby } from '../multiplayer/useLobby';
import { useWitlashSession } from '../multiplayer/witlash/useWitlashSession';
import { useServerCountdown } from '../multiplayer/witlash/useServerCountdown';
import {
  lockRoundAndAdvance,
  revealMatchupAndAdvance,
  advanceToNextMatchup,
  advanceToNextRoundOrFinish,
  submitAnswer,
  submitVote,
  endGame,
} from '../multiplayer/witlash/witlashApi';
import { WitlashSettingsScreen } from './witlash/WitlashSettingsScreen';
import { AnsweringScreen } from './witlash/AnsweringScreen';
import { MatchupVotingScreen } from './witlash/MatchupVotingScreen';
import { VoteResultsScreen } from './witlash/VoteResultsScreen';
import { RoundScoreboardScreen } from './witlash/RoundScoreboardScreen';
import { FinalResultsScreen } from './witlash/FinalResultsScreen';
import { PLACEHOLDER_ANSWER, type WitlashSessionState } from '../multiplayer/witlash/types';
import { colors } from '../theme/theme';

function computeSubmissionStatus(
  matchups: { id: string; player_a_id: string; player_b_id: string }[],
  answers: { matchup_id: string; player_id: string }[],
  activePlayerIds: string[]
) {
  let submittedCount = 0;
  activePlayerIds.forEach((playerId) => {
    const assigned = matchups.filter((m) => m.player_a_id === playerId || m.player_b_id === playerId).map((m) => m.id);
    if (assigned.length === 0) return;
    const answered = answers.filter((a) => a.player_id === playerId && assigned.includes(a.matchup_id)).length;
    if (answered >= assigned.length) submittedCount += 1;
  });
  return { submittedCount, allSubmitted: submittedCount >= activePlayerIds.length };
}

export function WitlashGameScreen({ navigation, route }: WitlashGameScreenProps) {
  const { lobbyId } = route.params;
  const { lobby, players, currentUserId } = useLobby(lobbyId);
  const sessionId = lobby?.game_session_id ?? null;
  const { session, round, matchups, answers, votes } = useWitlashSession(sessionId);

  const myPlayer = players.find((p) => p.auth_user_id === currentUserId);
  const isHost = myPlayer?.is_host ?? false;
  const myPlayerId = myPlayer?.id;
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);
  const activePlayerIds = useMemo(() => players.filter((p) => p.status === 'active').map((p) => p.id), [players]);

  const lockingRef = useRef(false);
  const revealingRef = useRef(false);

  // Lobby returned to 'waiting' (host ended the game) — send everyone back.
  useEffect(() => {
    if (lobby && lobby.status === 'waiting' && lobby.game_session_id === null && sessionId !== null) {
      navigation.replace('WaitingRoom', { lobbyId });
    }
  }, [lobby, sessionId, lobbyId, navigation]);

  const state = session?.state as WitlashSessionState | undefined;
  const currentMatchup = matchups.find((m) => m.id === state?.current_matchup_id) ?? matchups.find((m) => m.status === 'voting');

  const answerTimeLeft = useServerCountdown(round?.answer_ends_at ?? null);
  const votingTimeLeft = useServerCountdown(currentMatchup?.voting_ends_at ?? null);

  // Host-only: lock the round once everyone has answered or the timer expires.
  useEffect(() => {
    if (!isHost || !session || !round || !sessionId) return;
    if (session.phase !== 'answering') return;
    if (lockingRef.current) return;
    const { allSubmitted } = computeSubmissionStatus(matchups, answers, activePlayerIds);
    if (allSubmitted || answerTimeLeft <= 0) {
      lockingRef.current = true;
      lockRoundAndAdvance(sessionId, session.round_number).finally(() => {
        lockingRef.current = false;
      });
    }
  }, [isHost, session, round, sessionId, matchups, answers, activePlayerIds, answerTimeLeft]);

  // Host-only: reveal the current matchup once everyone eligible has voted or the timer expires.
  useEffect(() => {
    if (!isHost || !currentMatchup || currentMatchup.status !== 'voting') return;
    if (revealingRef.current) return;
    const allVoted = votes.length >= currentMatchup.eligible_voter_count && currentMatchup.eligible_voter_count > 0;
    const noEligibleVoters = currentMatchup.eligible_voter_count === 0;
    if (allVoted || noEligibleVoters || votingTimeLeft <= 0) {
      revealingRef.current = true;
      revealMatchupAndAdvance(currentMatchup.id).finally(() => {
        revealingRef.current = false;
      });
    }
  }, [isHost, currentMatchup, votes, votingTimeLeft]);

  // Reset advance guards whenever we move to a different round/matchup.
  useEffect(() => {
    lockingRef.current = false;
  }, [session?.round_number]);
  useEffect(() => {
    revealingRef.current = false;
  }, [currentMatchup?.id]);

  if (!lobby) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.cyan} />
      </View>
    );
  }

  // No session yet — pre-game settings (host configures, everyone else waits).
  if (!sessionId) {
    return <WitlashSettingsScreen lobbyId={lobbyId} isHost={isHost} activePlayerCount={activePlayerIds.length} />;
  }

  if (!session || !myPlayerId) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.cyan} />
      </View>
    );
  }

  if (session.phase === 'answering') {
    const myMatchups = matchups.filter((m) => m.player_a_id === myPlayerId || m.player_b_id === myPlayerId);
    const myAnswers: Record<string, string> = {};
    answers.filter((a) => a.player_id === myPlayerId).forEach((a) => (myAnswers[a.matchup_id] = a.answer_text));
    const { submittedCount } = computeSubmissionStatus(matchups, answers, activePlayerIds);

    return (
      <AnsweringScreen
        myMatchups={myMatchups}
        myAnswers={myAnswers}
        onSubmit={(matchupId, text) => submitAnswer(sessionId, session.round_number, matchupId, myPlayerId, text)}
        timeLeft={answerTimeLeft}
        answerTimerSec={state?.settings.answerTimerSec ?? 60}
        roundNumber={session.round_number}
        totalRounds={session.total_rounds}
        submittedCount={submittedCount}
        totalActivePlayers={activePlayerIds.length}
      />
    );
  }

  if (session.phase === 'voting' && currentMatchup) {
    const answerA = answers.find((a) => a.id === currentMatchup.answer_a_id);
    const answerB = answers.find((a) => a.id === currentMatchup.answer_b_id);

    if (currentMatchup.status === 'results') {
      const countA = votes.filter((v) => v.answer_id === currentMatchup.answer_a_id).length;
      const countB = votes.filter((v) => v.answer_id === currentMatchup.answer_b_id).length;
      const totalVotes = votes.length;
      const isSweep = totalVotes > 0 && totalVotes === currentMatchup.eligible_voter_count && (countA === totalVotes || countB === totalVotes);
      const authorA = players.find((p) => p.id === currentMatchup.player_a_id);
      const authorB = players.find((p) => p.id === currentMatchup.player_b_id);

      return (
        <VoteResultsScreen
          promptText={currentMatchup.prompt_text}
          sideA={{
            authorName: authorA?.display_name ?? 'Unknown',
            text: answerA?.answer_text ?? PLACEHOLDER_ANSWER,
            votes: countA,
            points: countA * 100 + (isSweep && countA === totalVotes ? 200 : 0),
            isSweep: isSweep && countA === totalVotes,
          }}
          sideB={{
            authorName: authorB?.display_name ?? 'Unknown',
            text: answerB?.answer_text ?? PLACEHOLDER_ANSWER,
            votes: countB,
            points: countB * 100 + (isSweep && countB === totalVotes ? 200 : 0),
            isSweep: isSweep && countB === totalVotes,
          }}
          isHost={isHost}
          onContinue={() => advanceToNextMatchup(sessionId, session.round_number)}
        />
      );
    }

    const isEligible = myPlayerId !== currentMatchup.player_a_id && myPlayerId !== currentMatchup.player_b_id;
    const myVoteAnswerId = votes.find((v) => v.voter_player_id === myPlayerId)?.answer_id ?? null;

    return (
      <MatchupVotingScreen
        promptText={currentMatchup.prompt_text}
        answerAText={answerA?.answer_text ?? PLACEHOLDER_ANSWER}
        answerBText={answerB?.answer_text ?? PLACEHOLDER_ANSWER}
        answerAId={currentMatchup.answer_a_id ?? ''}
        answerBId={currentMatchup.answer_b_id ?? ''}
        isEligible={isEligible}
        myVoteAnswerId={myVoteAnswerId}
        onVote={(answerId) => submitVote(sessionId, session.round_number, currentMatchup.id, myPlayerId, answerId)}
        timeLeft={votingTimeLeft}
        votingTimerSec={state?.settings.votingTimerSec ?? 30}
      />
    );
  }

  if (session.phase === 'round_scoreboard') {
    return (
      <RoundScoreboardScreen
        players={sortedPlayers}
        roundNumber={session.round_number}
        totalRounds={session.total_rounds}
        isHost={isHost}
        onContinue={() => advanceToNextRoundOrFinish(sessionId, lobbyId)}
      />
    );
  }

  if (session.phase === 'final_results') {
    return <FinalResultsScreen players={sortedPlayers} isHost={isHost} onBackToLobby={() => endGame(lobbyId)} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.cyan} />
    </View>
  );
}
