import { useEffect, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { GameSession } from '../types';
import type { OotlVote } from './types';

interface UseOotlSessionResult {
  session: GameSession | null;
  votes: OotlVote[];
  loading: boolean;
  error: string | null;
}

/** Fetches an Out of the Loop game session + its votes, kept in sync via one realtime channel. */
export function useOotlSession(sessionId: string | null): UseOotlSessionResult {
  const [session, setSession] = useState<GameSession | null>(null);
  const [votes, setVotes] = useState<OotlVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const refetchAll = useCallback(async () => {
    if (!supabase || !sessionId) return;

    const { data: sessionRow, error: sessionErr } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();
    if (sessionErr) {
      setError(sessionErr.message);
      return;
    }
    setSession((sessionRow as GameSession) ?? null);

    const { data: voteRows } = await supabase.from('ootl_votes').select('*').eq('session_id', sessionId);
    setVotes((voteRows as OotlVote[]) ?? []);
  }, [sessionId]);

  useEffect(() => {
    if (!supabase || !sessionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      await refetchAll();
      if (!cancelled) setLoading(false);
    })();

    const channel = supabase
      .channel(`ootl:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` }, () => refetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ootl_votes', filter: `session_id=eq.${sessionId}` }, () => refetchAll())
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase!.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, refetchAll]);

  return { session, votes, loading, error };
}
