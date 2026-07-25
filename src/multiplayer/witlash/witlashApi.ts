import { supabase } from '../supabase';
import { WITLASH_PROMPTS } from '../../data/witlashPrompts';
import { buildMatchups } from './matchmaking';
import { loadRecentPromptIds, recordUsedPromptIds } from '../../utils/witlashPromptHistory';
import { PLACEHOLDER_ANSWER, type WitlashSessionState, type WitlashSettings } from './types';

async function getActivePlayerIds(lobbyId: string): Promise<string[]> {
  const { data, error } = await supabase!
    .from('lobby_players')
    .select('id')
    .eq('lobby_id', lobbyId)
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []).map((p) => p.id as string);
}

async function getSessionState(sessionId: string): Promise<{ state: WitlashSessionState; roundNumber: number; totalRounds: number }> {
  const { data, error } = await supabase!
    .from('game_sessions')
    .select('state, round_number, total_rounds')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return { state: data.state as WitlashSessionState, roundNumber: data.round_number, totalRounds: data.total_rounds };
}

async function insertRoundAndMatchups(
  sessionId: string,
  roundNumber: number,
  playerIds: string[],
  sessionUsedPromptIds: string[],
  votingTimerSec: number,
  answerTimerSec: number
): Promise<string[]> {
  // Pool-filtering excludes this session's own history plus recent picks
  // from previous games on this device, so repeats stay rare across games
  // too — but only the session-scoped ids get stored back in game_sessions.
  const deviceHistory = await loadRecentPromptIds();
  const poolExcludeIds = Array.from(new Set([...deviceHistory, ...sessionUsedPromptIds]));

  const { matchups } = buildMatchups(playerIds, WITLASH_PROMPTS, poolExcludeIds);
  const nextUsed = [...sessionUsedPromptIds, ...matchups.map((m) => m.prompt_id)];
  await recordUsedPromptIds(deviceHistory, matchups.map((m) => m.prompt_id));

  const now = new Date();
  const answerEndsAt = new Date(now.getTime() + answerTimerSec * 1000).toISOString();

  const { error: roundError } = await supabase!.from('witlash_rounds').insert({
    session_id: sessionId,
    round_number: roundNumber,
    status: 'answering',
    prompt_ids: matchups.map((m) => m.prompt_id),
    answer_started_at: now.toISOString(),
    answer_ends_at: answerEndsAt,
  });
  if (roundError) throw roundError;

  const { error: matchupError } = await supabase!.from('witlash_matchups').insert(
    matchups.map((m) => ({
      session_id: sessionId,
      round_number: roundNumber,
      prompt_id: m.prompt_id,
      prompt_text: m.prompt_text,
      player_a_id: m.player_a_id,
      player_b_id: m.player_b_id,
      status: 'pending',
      eligible_voter_count: m.eligible_voter_count,
      display_order: m.display_order,
    }))
  );
  if (matchupError) throw matchupError;

  // Voting timer length is stashed for later matchups (used by advanceToNextMatchup);
  // nothing else to do with it here since only the first matchup's voting window
  // opens once answers lock (see lockRoundAndAdvance).
  void votingTimerSec;

  return nextUsed;
}

/** Host-only. Zeroes scores, creates the game session + round 1, flips the lobby to 'playing'. */
export async function startWitlash(lobbyId: string, settings: WitlashSettings): Promise<{ sessionId: string }> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const playerIds = await getActivePlayerIds(lobbyId);
  if (playerIds.length < 3) throw new Error('Need at least 3 players to start.');
  if (playerIds.length > 8) throw new Error('Witlash supports up to 8 players.');

  await supabase.from('lobby_players').update({ score: 0 }).eq('lobby_id', lobbyId);

  const initialState: WitlashSessionState = {
    settings,
    used_prompt_ids: [],
    current_matchup_id: null,
  };

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      lobby_id: lobbyId,
      game_id: 'witlash',
      phase: 'answering',
      round_number: 1,
      total_rounds: settings.rounds,
      state: initialState,
    })
    .select('id')
    .single();
  if (sessionError) throw sessionError;

  const usedPromptIds = await insertRoundAndMatchups(
    session.id,
    1,
    playerIds,
    [],
    settings.votingTimerSec,
    settings.answerTimerSec
  );

  await supabase
    .from('game_sessions')
    .update({ state: { ...initialState, used_prompt_ids: usedPromptIds } })
    .eq('id', session.id);

  const { error: lobbyError } = await supabase
    .from('lobbies')
    .update({ status: 'playing', game_session_id: session.id, current_game: 'witlash' })
    .eq('id', lobbyId);
  if (lobbyError) throw lobbyError;

  return { sessionId: session.id };
}

/** Own row only. Edits before the answer timer ends are upserts, never duplicates. */
export async function submitAnswer(
  sessionId: string,
  roundNumber: number,
  matchupId: string,
  playerId: string,
  answerText: string
): Promise<void> {
  if (!supabase) return;
  const trimmed = answerText.trim().slice(0, 80);
  if (!trimmed) return;
  await supabase.from('witlash_answers').upsert(
    {
      session_id: sessionId,
      round_number: roundNumber,
      matchup_id: matchupId,
      player_id: playerId,
      answer_text: trimmed,
    },
    { onConflict: 'matchup_id,player_id' }
  );
}

/** Host-only. Fills missing answers with the placeholder, locks the round, opens voting on matchup 1. */
export async function lockRoundAndAdvance(sessionId: string, roundNumber: number): Promise<void> {
  if (!supabase) return;

  const { data: round } = await supabase
    .from('witlash_rounds')
    .select('id, status')
    .eq('session_id', sessionId)
    .eq('round_number', roundNumber)
    .single();
  if (!round || round.status !== 'answering') return; // already locked by another invocation

  const { data: lockedRows } = await supabase
    .from('witlash_rounds')
    .update({ status: 'voting' })
    .eq('id', round.id)
    .eq('status', 'answering')
    .select('id');
  if (!lockedRows || lockedRows.length === 0) return; // race: someone else locked it first

  const { data: matchups } = await supabase
    .from('witlash_matchups')
    .select('id, player_a_id, player_b_id, display_order')
    .eq('session_id', sessionId)
    .eq('round_number', roundNumber)
    .order('display_order', { ascending: true });
  if (!matchups) return;

  const matchupIds = matchups.map((m) => m.id);
  const { data: answers } = await supabase
    .from('witlash_answers')
    .select('id, matchup_id, player_id')
    .in('matchup_id', matchupIds);

  const answerByMatchupPlayer = new Map<string, string>();
  (answers ?? []).forEach((a) => answerByMatchupPlayer.set(`${a.matchup_id}:${a.player_id}`, a.id));

  const placeholders: { session_id: string; round_number: number; matchup_id: string; player_id: string; answer_text: string }[] = [];
  for (const m of matchups) {
    if (!answerByMatchupPlayer.has(`${m.id}:${m.player_a_id}`)) {
      placeholders.push({ session_id: sessionId, round_number: roundNumber, matchup_id: m.id, player_id: m.player_a_id, answer_text: PLACEHOLDER_ANSWER });
    }
    if (!answerByMatchupPlayer.has(`${m.id}:${m.player_b_id}`)) {
      placeholders.push({ session_id: sessionId, round_number: roundNumber, matchup_id: m.id, player_id: m.player_b_id, answer_text: PLACEHOLDER_ANSWER });
    }
  }
  if (placeholders.length > 0) {
    const { data: inserted } = await supabase.from('witlash_answers').insert(placeholders).select('id, matchup_id, player_id');
    (inserted ?? []).forEach((a) => answerByMatchupPlayer.set(`${a.matchup_id}:${a.player_id}`, a.id));
  }

  for (const m of matchups) {
    const answerAId = answerByMatchupPlayer.get(`${m.id}:${m.player_a_id}`);
    const answerBId = answerByMatchupPlayer.get(`${m.id}:${m.player_b_id}`);
    await supabase.from('witlash_matchups').update({ answer_a_id: answerAId, answer_b_id: answerBId }).eq('id', m.id);
  }

  const { state } = await getSessionState(sessionId);
  const first = matchups[0];
  const now = new Date();
  const votingEndsAt = new Date(now.getTime() + state.settings.votingTimerSec * 1000).toISOString();

  await supabase
    .from('witlash_matchups')
    .update({ status: 'voting', voting_started_at: now.toISOString(), voting_ends_at: votingEndsAt })
    .eq('id', first.id);

  await supabase
    .from('game_sessions')
    .update({ phase: 'voting', state: { ...state, current_matchup_id: first.id } })
    .eq('id', sessionId);
}

/** Own vote only. DB unique constraint on (matchup_id, voter_player_id) blocks double-voting. */
export async function submitVote(
  sessionId: string,
  roundNumber: number,
  matchupId: string,
  voterPlayerId: string,
  answerId: string
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('witlash_votes').insert({
    session_id: sessionId,
    round_number: roundNumber,
    matchup_id: matchupId,
    voter_player_id: voterPlayerId,
    answer_id: answerId,
  });
  if (error && error.code !== '23505') throw error;
}

/** Host-only. Tallies votes, awards points + sweep bonus, flips the matchup to 'results'. Runs at most once per matchup. */
export async function revealMatchupAndAdvance(matchupId: string): Promise<void> {
  if (!supabase) return;

  const { data: affected } = await supabase
    .from('witlash_matchups')
    .update({ status: 'results' })
    .eq('id', matchupId)
    .eq('status', 'voting')
    .select('id');
  if (!affected || affected.length === 0) return; // already resolved

  const { data: matchup } = await supabase
    .from('witlash_matchups')
    .select('answer_a_id, answer_b_id, player_a_id, player_b_id, eligible_voter_count')
    .eq('id', matchupId)
    .single();
  if (!matchup) return;

  const { data: votes } = await supabase.from('witlash_votes').select('answer_id').eq('matchup_id', matchupId);
  const votesList = votes ?? [];

  const countA = votesList.filter((v) => v.answer_id === matchup.answer_a_id).length;
  const countB = votesList.filter((v) => v.answer_id === matchup.answer_b_id).length;
  const totalVotes = votesList.length;

  let pointsA = countA * 100;
  let pointsB = countB * 100;

  const isSweep = totalVotes > 0 && totalVotes === matchup.eligible_voter_count && (countA === totalVotes || countB === totalVotes);
  if (isSweep) {
    if (countA === totalVotes) pointsA += 200;
    else pointsB += 200;
  }

  for (const [playerId, points] of [[matchup.player_a_id, pointsA] as const, [matchup.player_b_id, pointsB] as const]) {
    if (points <= 0) continue;
    const { data: player } = await supabase.from('lobby_players').select('score').eq('id', playerId).single();
    const currentScore = player?.score ?? 0;
    await supabase.from('lobby_players').update({ score: currentScore + points }).eq('id', playerId);
  }
}

/** Host-only. Marks the current matchup complete and opens voting on the next one, or moves to round_scoreboard. */
export async function advanceToNextMatchup(sessionId: string, roundNumber: number): Promise<void> {
  if (!supabase) return;

  const { state } = await getSessionState(sessionId);
  const currentMatchupId = state.current_matchup_id;
  if (currentMatchupId) {
    await supabase.from('witlash_matchups').update({ status: 'complete' }).eq('id', currentMatchupId).eq('status', 'results');
  }

  const { data: next } = await supabase
    .from('witlash_matchups')
    .select('id')
    .eq('session_id', sessionId)
    .eq('round_number', roundNumber)
    .eq('status', 'pending')
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (next) {
    const now = new Date();
    const votingEndsAt = new Date(now.getTime() + state.settings.votingTimerSec * 1000).toISOString();
    await supabase
      .from('witlash_matchups')
      .update({ status: 'voting', voting_started_at: now.toISOString(), voting_ends_at: votingEndsAt })
      .eq('id', next.id);
    await supabase
      .from('game_sessions')
      .update({ phase: 'voting', state: { ...state, current_matchup_id: next.id } })
      .eq('id', sessionId);
  } else {
    await supabase.from('witlash_rounds').update({ status: 'complete' }).eq('session_id', sessionId).eq('round_number', roundNumber);
    await supabase
      .from('game_sessions')
      .update({ phase: 'round_scoreboard', state: { ...state, current_matchup_id: null } })
      .eq('id', sessionId);
  }
}

/** Host-only. Promotes waiting spectators to active, then starts the next round or moves to final_results. */
export async function advanceToNextRoundOrFinish(sessionId: string, lobbyId: string): Promise<void> {
  if (!supabase) return;

  const { data: session } = await supabase
    .from('game_sessions')
    .select('round_number, total_rounds, state')
    .eq('id', sessionId)
    .single();
  if (!session) return;

  await supabase.from('lobby_players').update({ status: 'active' }).eq('lobby_id', lobbyId).eq('status', 'waiting');

  if (session.round_number >= session.total_rounds) {
    await supabase.from('game_sessions').update({ phase: 'final_results' }).eq('id', sessionId);
    return;
  }

  const state = session.state as WitlashSessionState;
  const playerIds = await getActivePlayerIds(lobbyId);
  const nextRoundNumber = session.round_number + 1;

  const usedPromptIds = await insertRoundAndMatchups(
    sessionId,
    nextRoundNumber,
    playerIds,
    state.used_prompt_ids,
    state.settings.votingTimerSec,
    state.settings.answerTimerSec
  );

  await supabase
    .from('game_sessions')
    .update({
      round_number: nextRoundNumber,
      phase: 'answering',
      state: { ...state, used_prompt_ids: usedPromptIds, current_matchup_id: null },
    })
    .eq('id', sessionId);
}

/** Host-only. Returns the lobby to the waiting room for a fresh game. */
export async function endGame(lobbyId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('lobbies').update({ status: 'waiting', game_session_id: null }).eq('id', lobbyId);
}
