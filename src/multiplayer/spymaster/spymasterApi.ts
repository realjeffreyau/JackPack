import { supabase } from '../supabase';
import { CODEWORDS } from '../../data/codenames';
import type { SpymasterState, SpymasterTile, SpymasterTileTeam, SpymasterTeam } from './types';

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildInitialState(): SpymasterState {
  const words = shuffle(CODEWORDS).slice(0, 25);
  const startingTeam: SpymasterTeam = Math.random() < 0.5 ? 'red' : 'blue';
  const otherTeam: SpymasterTeam = startingTeam === 'red' ? 'blue' : 'red';
  const assignment: SpymasterTileTeam[] = shuffle([
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(otherTeam),
    ...Array(7).fill('neutral'),
    'assassin',
  ]);
  const tiles: SpymasterTile[] = words.map((word, i) => ({ word, team: assignment[i], revealed: false }));

  return {
    tiles,
    startingTeam,
    currentTeam: startingTeam,
    redRemaining: tiles.filter((t) => t.team === 'red').length,
    blueRemaining: tiles.filter((t) => t.team === 'blue').length,
    winner: null,
    assassinTripped: false,
  };
}

async function getActivePlayerCount(lobbyId: string): Promise<number> {
  const { data, error } = await supabase!
    .from('lobby_players')
    .select('id')
    .eq('lobby_id', lobbyId)
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []).length;
}

async function getState(sessionId: string): Promise<SpymasterState> {
  const { data, error } = await supabase!.from('game_sessions').select('state').eq('id', sessionId).single();
  if (error) throw error;
  return data.state as SpymasterState;
}

/** Host-only. Requires exactly 2 devices, builds the board, creates the session, flips the lobby to playing. */
export async function startSpymaster(lobbyId: string): Promise<{ sessionId: string }> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const playerCount = await getActivePlayerCount(lobbyId);
  if (playerCount !== 2) throw new Error('Spymaster needs exactly 2 phones — one board, one spymaster key.');

  await supabase.from('lobby_players').update({ score: 0 }).eq('lobby_id', lobbyId);

  const initialState = buildInitialState();

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .insert({
      lobby_id: lobbyId,
      game_id: 'spymaster',
      phase: 'board',
      round_number: 1,
      total_rounds: 1,
      state: initialState,
    })
    .select('id')
    .single();
  if (sessionError) throw sessionError;

  const { error: lobbyError } = await supabase
    .from('lobbies')
    .update({ status: 'playing', game_session_id: session.id, current_game: 'spymaster' })
    .eq('id', lobbyId);
  if (lobbyError) throw lobbyError;

  return { sessionId: session.id };
}

/** Host-only (board phone). Applies the tap outcome for one tile and writes the resulting state/phase. */
export async function revealTile(sessionId: string, index: number): Promise<void> {
  if (!supabase) return;
  const state = await getState(sessionId);
  const tile = state.tiles[index];
  if (!tile || tile.revealed) return;

  const tiles = state.tiles.map((t, i) => (i === index ? { ...t, revealed: true } : t));

  if (tile.team === 'assassin') {
    const winner: SpymasterTeam = state.currentTeam === 'red' ? 'blue' : 'red';
    await supabase
      .from('game_sessions')
      .update({ phase: 'game_over', state: { ...state, tiles, winner, assassinTripped: true } })
      .eq('id', sessionId);
    return;
  }

  if (tile.team === 'red' || tile.team === 'blue') {
    const isRed = tile.team === 'red';
    const remaining = (isRed ? state.redRemaining : state.blueRemaining) - 1;
    const nextTeam: SpymasterTeam = tile.team === state.currentTeam ? state.currentTeam : tile.team;
    const nextState: SpymasterState = {
      ...state,
      tiles,
      redRemaining: isRed ? remaining : state.redRemaining,
      blueRemaining: isRed ? state.blueRemaining : remaining,
      currentTeam: nextTeam,
    };
    if (remaining <= 0) {
      await supabase
        .from('game_sessions')
        .update({ phase: 'game_over', state: { ...nextState, winner: tile.team } })
        .eq('id', sessionId);
    } else {
      await supabase.from('game_sessions').update({ state: nextState }).eq('id', sessionId);
    }
    return;
  }

  // neutral
  const nextTeam: SpymasterTeam = state.currentTeam === 'red' ? 'blue' : 'red';
  await supabase.from('game_sessions').update({ state: { ...state, tiles, currentTeam: nextTeam } }).eq('id', sessionId);
}

/** Host-only. Manually passes the turn. */
export async function endTurn(sessionId: string): Promise<void> {
  if (!supabase) return;
  const state = await getState(sessionId);
  const nextTeam: SpymasterTeam = state.currentTeam === 'red' ? 'blue' : 'red';
  await supabase.from('game_sessions').update({ state: { ...state, currentTeam: nextTeam } }).eq('id', sessionId);
}

/** Host-only. Rebuilds a fresh board, resets phase to board. */
export async function newGame(sessionId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('game_sessions').update({ phase: 'board', state: buildInitialState() }).eq('id', sessionId);
}

/** Host-only. Returns the lobby to the waiting room. */
export async function endSpymasterGame(lobbyId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('lobbies').update({ status: 'waiting', game_session_id: null }).eq('id', lobbyId);
}
