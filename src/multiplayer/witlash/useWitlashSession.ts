import { useEffect, useRef, useState, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import type { GameSession } from '../types';
import type { WitlashAnswer, WitlashMatchup, WitlashRound, WitlashVote } from './types';

interface UseWitlashSessionResult {
  session: GameSession | null;
  round: WitlashRound | null;
  matchups: WitlashMatchup[];
  answers: WitlashAnswer[];
  votes: WitlashVote[];
  loading: boolean;
  error: string | null;
}

/** Fetches a Witlash game session + current round's matchups/answers/votes, kept in sync via one realtime channel. */
export function useWitlashSession(sessionId: string | null): UseWitlashSessionResult {
  const [session, setSession] = useState<GameSession | null>(null);
  const [round, setRound] = useState<WitlashRound | null>(null);
  const [matchups, setMatchups] = useState<WitlashMatchup[]>([]);
  const [answers, setAnswers] = useState<WitlashAnswer[]>([]);
  const [votes, setVotes] = useState<WitlashVote[]>([]);
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
    if (!sessionRow) return;

    const roundNumber = sessionRow.round_number;

    const [{ data: roundRow }, { data: matchupRows }, { data: answerRows }] = await Promise.all([
      supabase.from('witlash_rounds').select('*').eq('session_id', sessionId).eq('round_number', roundNumber).maybeSingle(),
      supabase
        .from('witlash_matchups')
        .select('*')
        .eq('session_id', sessionId)
        .eq('round_number', roundNumber)
        .order('display_order', { ascending: true }),
      supabase.from('witlash_answers').select('*').eq('session_id', sessionId).eq('round_number', roundNumber),
    ]);

    setRound((roundRow as WitlashRound) ?? null);
    setMatchups((matchupRows as WitlashMatchup[]) ?? []);
    setAnswers((answerRows as WitlashAnswer[]) ?? []);

    const currentMatchupId = (sessionRow.state as { current_matchup_id?: string | null } | null)?.current_matchup_id;
    if (currentMatchupId) {
      const { data: voteRows } = await supabase.from('witlash_votes').select('*').eq('matchup_id', currentMatchupId);
      setVotes((voteRows as WitlashVote[]) ?? []);
    } else {
      setVotes([]);
    }
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
      .channel(`witlash:${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` }, () => refetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'witlash_rounds', filter: `session_id=eq.${sessionId}` }, () => refetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'witlash_matchups', filter: `session_id=eq.${sessionId}` }, () => refetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'witlash_answers', filter: `session_id=eq.${sessionId}` }, () => refetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'witlash_votes', filter: `session_id=eq.${sessionId}` }, () => refetchAll())
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

  return { session, round, matchups, answers, votes, loading, error };
}
