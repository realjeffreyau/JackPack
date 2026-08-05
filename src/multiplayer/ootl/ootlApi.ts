import { supabase } from '../supabase';
import { OOTL_CATEGORIES } from '../../data/ootlTopics';
import { loadRecentTopics, recordUsedTopic } from '../../utils/ootlTopicHistory';
import type { OotlSettings, OotlState } from './types';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function getActivePlayerIds(lobbyId: string): Promise<string[]> {
  const { data, error } = await supabase!
    .from('lobby_players')
    .select('id')
    .eq('lobby_id', lobbyId)
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []).map((p) => p.id as string);
}

async function getState(sessionId: string): Promise<{ state: OotlState; roundNumber: number; totalRounds: number }> {
  const { data, error } = await supabase!
    .from('game_sessions')
    .select('state, round_number, total_rounds')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return { state: data.state as OotlState, roundNumber: data.round_number, totalRounds: data.total_rounds };
}

async function awardPoints(playerId: string, points: number): Promise<void> {
  if (points <= 0) return;
  const { data: player } = await supabase!.from('lobby_players').select('score').eq('id', playerId).single();
  const currentScore = player?.score ?? 0;
  await supabase!.from('lobby_players').update({ score: currentScore + points }).eq('id', playerId);
}

/** Host-only. Zeroes scores, picks category/topic/outsider/questions/order, creates the session, flips the lobby to 'playing'. */
export async function startOotl(lobbyId: string, settings: OotlSettings): Promise<{ sessionId: string }> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const playerIds = await getActivePlayerIds(lobbyId);
  if (playerIds.length < 4) throw new Error('Need at least 4 players to start.');
  if (playerIds.length > 8) throw new Error('The Outsider supports up to 8 players.');

  await supabase.from('lobby_players').update({ score: 0 }).eq('lobby_id', lobbyId);

  const recentTopics = await loadRecentTopics();
  const category = OOTL_CATEGORIES[Math.floor(Math.random() * OOTL_CATEGORIES.length)];
  const availableTopics = category.topics.filter((t) => !recentTopics.includes(t));
  const topicPool = availableTopics.length > 0 ? availableTopics : category.topics;
  const topic = topicPool[Math.floor(Math.random() * topicPool.length)];

  const outsiderPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];

  const cycles = Math.min(settings.questionCycles, category.questions.length);
  const questionIds = shuffle(category.questions.map((_, i) => i)).slice(0, cycles);
  const speakingOrder = shuffle(playerIds);

  const initialState: OotlState = {
    settings: { ...settings, questionCycles: cycles },
    category: category.id,
    topic,
    outsider_player_id: outsiderPlayerId,
    question_ids: questionIds,
    current_question_index: 0,
    speaking_order: speakingOrder,
    current_speaker_index: 0,
    ready_player_ids: [],
    discussion_ends_at: null,
    caught: null,
    guess_correct: null,
  };

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      lobby_id: lobbyId,
      game_id: 'out-of-the-loop',
      phase: 'role_reveal',
      round_number: 1,
      total_rounds: cycles,
      state: initialState,
    })
    .select('id')
    .single();
  if (sessionError) throw sessionError;

  await recordUsedTopic(recentTopics, topic);

  const { error: lobbyError } = await supabase
    .from('lobbies')
    .update({ status: 'playing', game_session_id: session.id, current_game: 'out-of-the-loop' })
    .eq('id', lobbyId);
  if (lobbyError) throw lobbyError;

  return { sessionId: session.id };
}

/** Own row only — appends the caller's own player id once. */
export async function markReady(sessionId: string, playerId: string): Promise<void> {
  if (!supabase) return;
  const { state } = await getState(sessionId);
  if (state.ready_player_ids.includes(playerId)) return;
  await supabase
    .from('game_sessions')
    .update({ state: { ...state, ready_player_ids: [...state.ready_player_ids, playerId] } })
    .eq('id', sessionId);
}

/** Host-only. All players ready → move role_reveal to answering. */
export async function beginAnswering(sessionId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('game_sessions').update({ phase: 'answering' }).eq('id', sessionId).eq('phase', 'role_reveal');
}

/** Called by the current speaker only — advances to the next speaker's turn. */
export async function advanceSpeaker(sessionId: string): Promise<void> {
  if (!supabase) return;
  const { state } = await getState(sessionId);
  await supabase
    .from('game_sessions')
    .update({ state: { ...state, current_speaker_index: state.current_speaker_index + 1 } })
    .eq('id', sessionId);
}

/** Host-only. All speakers done for this question → next question (reshuffled order) or discussion. */
export async function advanceQuestionOrDiscussion(sessionId: string, lobbyId: string): Promise<void> {
  if (!supabase) return;
  const { state, roundNumber, totalRounds } = await getState(sessionId);
  if (state.current_speaker_index < state.speaking_order.length) return; // not everyone has spoken yet

  if (roundNumber >= totalRounds) {
    const discussionEndsAt = new Date(Date.now() + state.settings.discussionSec * 1000).toISOString();
    await supabase
      .from('game_sessions')
      .update({ phase: 'discussion', state: { ...state, discussion_ends_at: discussionEndsAt } })
      .eq('id', sessionId)
      .eq('phase', 'answering');
  } else {
    const playerIds = await getActivePlayerIds(lobbyId);
    const newOrder = shuffle(playerIds);
    await supabase
      .from('game_sessions')
      .update({
        round_number: roundNumber + 1,
        state: { ...state, current_question_index: roundNumber, current_speaker_index: 0, speaking_order: newOrder },
      })
      .eq('id', sessionId)
      .eq('round_number', roundNumber);
  }
}

/** Host-only. Ends discussion early or on timer expiry. */
export async function advanceToVoting(sessionId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('game_sessions').update({ phase: 'voting' }).eq('id', sessionId).eq('phase', 'discussion');
}

/** Own vote only. DB unique constraint on (session_id, voter_player_id) blocks double-voting. */
export async function submitOotlVote(sessionId: string, voterPlayerId: string, accusedPlayerId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('ootl_votes').insert({
    session_id: sessionId,
    voter_player_id: voterPlayerId,
    accused_player_id: accusedPlayerId,
  });
  if (error && error.code !== '23505') throw error;
}

/** Host-only. Tallies votes, applies the tie rule, awards vote-outcome points. Runs at most once. */
export async function resolveVotes(sessionId: string, lobbyId: string): Promise<void> {
  if (!supabase) return;

  const { state } = await getState(sessionId);
  const { data: votes } = await supabase.from('ootl_votes').select('accused_player_id').eq('session_id', sessionId);
  const votesList = votes ?? [];

  const tally = new Map<string, number>();
  votesList.forEach((v) => tally.set(v.accused_player_id, (tally.get(v.accused_player_id) ?? 0) + 1));

  let maxCount = 0;
  tally.forEach((count) => {
    if (count > maxCount) maxCount = count;
  });
  const topAccused = [...tally.entries()].filter(([, count]) => count === maxCount).map(([id]) => id);
  const caught = maxCount > 0 && topAccused.length === 1 && topAccused[0] === state.outsider_player_id;

  const { data: affected } = await supabase
    .from('game_sessions')
    .update({ phase: 'vote_results', state: { ...state, caught } })
    .eq('id', sessionId)
    .eq('phase', 'voting')
    .select('id');
  if (!affected || affected.length === 0) return; // already resolved

  const playerIds = await getActivePlayerIds(lobbyId);
  const informedPlayerIds = playerIds.filter((id) => id !== state.outsider_player_id);

  if (caught) {
    for (const id of informedPlayerIds) await awardPoints(id, 200);
  } else {
    await awardPoints(state.outsider_player_id, 300);
  }
}

/** Host-only. Moves from vote_results to final_guess (if caught) or game_over. */
export async function advanceFromResults(sessionId: string): Promise<void> {
  if (!supabase) return;
  const { state } = await getState(sessionId);
  const nextPhase = state.caught ? 'final_guess' : 'game_over';
  await supabase.from('game_sessions').update({ phase: nextPhase }).eq('id', sessionId).eq('phase', 'vote_results');
}

/** Host-only. Judges the outsider's spoken guess, awards guess-bonus points. Runs at most once. */
export async function judgeGuess(sessionId: string, lobbyId: string, correct: boolean): Promise<void> {
  if (!supabase) return;
  const { state } = await getState(sessionId);

  const { data: affected } = await supabase
    .from('game_sessions')
    .update({ phase: 'game_over', state: { ...state, guess_correct: correct } })
    .eq('id', sessionId)
    .eq('phase', 'final_guess')
    .select('id');
  if (!affected || affected.length === 0) return; // already resolved

  if (correct) {
    await awardPoints(state.outsider_player_id, 150);
  } else {
    const playerIds = await getActivePlayerIds(lobbyId);
    const informedPlayerIds = playerIds.filter((id) => id !== state.outsider_player_id);
    for (const id of informedPlayerIds) await awardPoints(id, 100);
  }
}

/** Host-only. Returns the lobby to the waiting room for a fresh game, promoting any spectators back to active. */
export async function endOotlGame(lobbyId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('lobby_players').update({ status: 'active' }).eq('lobby_id', lobbyId).eq('status', 'waiting');
  await supabase.from('lobbies').update({ status: 'waiting', game_session_id: null }).eq('id', lobbyId);
}
