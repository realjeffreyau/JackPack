import { supabase } from './supabase';
import { ensureAnonSession } from './auth';

// Excludes O/0/I/1 to avoid confusing characters.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const MAX_PLAYERS = 8;

export function generateLobbyCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export class LobbyJoinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LobbyJoinError';
  }
}

/** Creates a lobby with a unique 6-char code, retrying on collision, and adds the caller as host. */
export async function createLobby(displayName: string): Promise<{ lobbyId: string }> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const authUserId = await ensureAnonSession();

  let lobbyId: string | null = null;
  let attempts = 0;
  while (!lobbyId && attempts < 5) {
    attempts += 1;
    const lobbyCode = generateLobbyCode();
    const { data, error } = await supabase
      .from('lobbies')
      .insert({ lobby_code: lobbyCode, host_auth_user_id: authUserId })
      .select('id')
      .single();

    if (error) {
      // Unique violation on lobby_code — try again with a new code.
      if (error.code === '23505') continue;
      throw error;
    }
    lobbyId = data.id as string;
  }

  if (!lobbyId) {
    throw new Error('Could not generate a unique lobby code. Please try again.');
  }

  const { error: playerError } = await supabase.from('lobby_players').insert({
    lobby_id: lobbyId,
    auth_user_id: authUserId,
    display_name: displayName.trim(),
    is_host: true,
  });

  if (playerError) {
    throw playerError;
  }

  return { lobbyId };
}

/** Looks up a lobby by code, validates it, and adds the caller as a player. */
export async function joinLobby(code: string, displayName: string): Promise<{ lobbyId: string }> {
  if (!supabase) throw new Error('Supabase is not configured.');

  const normalizedCode = code.trim().toUpperCase();
  const trimmedName = displayName.trim();

  const authUserId = await ensureAnonSession();

  const { data: lobby, error: lobbyError } = await supabase
    .from('lobbies')
    .select('id, status, max_players, expires_at')
    .eq('lobby_code', normalizedCode)
    .maybeSingle();

  if (lobbyError) throw lobbyError;
  if (!lobby) throw new LobbyJoinError('No lobby found with that code.');
  if (lobby.status === 'ended') throw new LobbyJoinError('This lobby has ended.');
  if (new Date(lobby.expires_at).getTime() < Date.now()) {
    throw new LobbyJoinError('This lobby has expired.');
  }
  // A game in progress doesn't block joining — the joiner is added as a
  // 'waiting' spectator and is picked up automatically at the next round.
  const joinerStatus = lobby.status === 'playing' ? 'waiting' : 'active';

  const { count, error: countError } = await supabase
    .from('lobby_players')
    .select('id', { count: 'exact', head: true })
    .eq('lobby_id', lobby.id);

  if (countError) throw countError;
  if ((count ?? 0) >= (lobby.max_players ?? MAX_PLAYERS)) {
    throw new LobbyJoinError('This lobby is full.');
  }

  const { data: existingName } = await supabase
    .from('lobby_players')
    .select('id')
    .eq('lobby_id', lobby.id)
    .eq('display_name', trimmedName)
    .maybeSingle();

  if (existingName) {
    throw new LobbyJoinError('That name is already taken in this lobby.');
  }

  const { error: insertError } = await supabase.from('lobby_players').insert({
    lobby_id: lobby.id,
    auth_user_id: authUserId,
    display_name: trimmedName,
    is_host: false,
    status: joinerStatus,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      throw new LobbyJoinError('That name is already taken in this lobby.');
    }
    throw insertError;
  }

  return { lobbyId: lobby.id as string };
}

/** Removes the caller's own row from a lobby (frees their display name). */
export async function leaveLobby(lobbyId: string): Promise<void> {
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const authUserId = sessionData.session?.user?.id;
  if (!authUserId) return;

  await supabase.from('lobby_players').delete().eq('lobby_id', lobbyId).eq('auth_user_id', authUserId);
}

/** Host-only. Sets which game the waiting room's Start button will launch. */
export async function setLobbyGame(lobbyId: string, game: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('lobbies').update({ current_game: game }).eq('id', lobbyId);
}
