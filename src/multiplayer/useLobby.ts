import { useEffect, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Lobby, LobbyPlayer } from './types';

interface UseLobbyResult {
  lobby: Lobby | null;
  players: LobbyPlayer[];
  loading: boolean;
  error: string | null;
  currentUserId: string | null;
}

/** Fetches a lobby + its players and keeps both in sync via a single realtime channel. */
export function useLobby(lobbyId: string | null): UseLobbyResult {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const refetchPlayers = useCallback(async () => {
    if (!supabase || !lobbyId) return;
    const { data } = await supabase
      .from('lobby_players')
      .select('*')
      .eq('lobby_id', lobbyId)
      .order('joined_at', { ascending: true });
    if (data) setPlayers(data as LobbyPlayer[]);
  }, [lobbyId]);

  useEffect(() => {
    if (!supabase || !lobbyId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase!.auth.getSession();
      if (!cancelled) setCurrentUserId(sessionData.session?.user?.id ?? null);

      const [{ data: lobbyData, error: lobbyErr }, { data: playersData, error: playersErr }] =
        await Promise.all([
          supabase!.from('lobbies').select('*').eq('id', lobbyId).maybeSingle(),
          supabase!.from('lobby_players').select('*').eq('lobby_id', lobbyId).order('joined_at', { ascending: true }),
        ]);

      if (cancelled) return;

      if (lobbyErr || playersErr) {
        setError((lobbyErr ?? playersErr)?.message ?? 'Failed to load lobby.');
        setLoading(false);
        return;
      }

      setLobby((lobbyData as Lobby) ?? null);
      setPlayers((playersData as LobbyPlayer[]) ?? []);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`lobby:${lobbyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lobby_players', filter: `lobby_id=eq.${lobbyId}` },
        () => refetchPlayers()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setLobby(null);
          } else {
            setLobby(payload.new as Lobby);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase!.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [lobbyId, refetchPlayers]);

  return { lobby, players, loading, error, currentUserId };
}
