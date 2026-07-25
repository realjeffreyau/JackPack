import { useEffect, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { GameSession } from '../types';

interface UseSpymasterSessionResult {
  session: GameSession | null;
  loading: boolean;
  error: string | null;
}

/** Fetches a Spymaster game session, kept in sync via one realtime channel. */
export function useSpymasterSession(sessionId: string | null): UseSpymasterSessionResult {
  const [session, setSession] = useState<GameSession | null>(null);
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
      .channel(`spymaster:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` }, () => refetchAll())
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

  return { session, loading, error };
}
