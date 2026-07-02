import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SIDEQUESTS } from '../data/sidequests';
import {
  loadSidequestLeaderboard,
  loadSidequestsEnabled,
  saveSidequestLeaderboard,
  saveSidequestsEnabled,
} from './sidequestStorage';
import type { LeaderboardEntry, Sidequest, SidequestContextValue, SidequestSessionState } from './types';

function pickRandom<T>(arr: readonly T[]): T | null {
  if (arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

const SidequestContext = createContext<SidequestContextValue | null>(null);

export function SidequestProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [session, setSession] = useState<SidequestSessionState | null>(null);

  const isFirstEnabledMount = useRef(true);
  const isFirstLeaderboardMount = useRef(true);

  useEffect(() => {
    loadSidequestsEnabled().then(setEnabledState);
    loadSidequestLeaderboard().then(setLeaderboard);
  }, []);

  useEffect(() => {
    if (isFirstEnabledMount.current) { isFirstEnabledMount.current = false; return; }
    saveSidequestsEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    if (isFirstLeaderboardMount.current) { isFirstLeaderboardMount.current = false; return; }
    saveSidequestLeaderboard(leaderboard);
  }, [leaderboard]);

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v);
  }, []);

  const resetLeaderboard = useCallback(() => {
    setLeaderboard([]);
  }, []);

  const startSession = useCallback((players: { id: string; name: string }[]) => {
    setSession({
      players,
      playersWhoReceived: [],
      activeSidequests: {},
      totalTriggered: 0,
    });
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
  }, []);

  // Read-only: returns a sidequest candidate if the roll succeeds, null otherwise.
  // Does NOT mutate session. Call confirmAssignment to commit the assignment.
  const checkTrigger = useCallback(
    (playerId: string): Sidequest | null => {
      if (!enabled || !session) return null;
      if (session.totalTriggered >= 2) return null;
      if (session.activeSidequests[playerId]) return null;

      const hasHad = session.playersWhoReceived.includes(playerId);
      const chance = hasHad ? 0.05 : 0.25;
      if (Math.random() >= chance) return null;

      const usedIds = Object.values(session.activeSidequests).map((sq) => sq.id);
      return pickRandom(SIDEQUESTS.filter((sq) => !usedIds.includes(sq.id)));
    },
    [enabled, session],
  );

  const getPendingSidequest = useCallback(
    (playerId: string): Sidequest | null => {
      return session?.activeSidequests[playerId] ?? null;
    },
    [session],
  );

  // Called after "Got it" — commits the assignment to session state.
  const confirmAssignment = useCallback((playerId: string, sq: Sidequest) => {
    setSession((prev) => {
      if (!prev) return prev;
      const alreadyReceived = prev.playersWhoReceived.includes(playerId);
      return {
        ...prev,
        activeSidequests: { ...prev.activeSidequests, [playerId]: sq },
        playersWhoReceived: alreadyReceived
          ? prev.playersWhoReceived
          : [...prev.playersWhoReceived, playerId],
        totalTriggered: prev.totalTriggered + 1,
      };
    });
  }, []);

  const addLeaderboardPoints = useCallback((name: string, points: number) => {
    if (points <= 0) return;
    const normalized = name.trim().toLowerCase();
    const displayName = name.trim();
    setLeaderboard((prev) => {
      const idx = prev.findIndex((e) => e.normalizedName === normalized);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], points: updated[idx].points + points };
        return updated;
      }
      return [...prev, { name: displayName, normalizedName: normalized, points }];
    });
  }, []);

  const resolveSidequest = useCallback(
    (
      playerId: string,
      playerName: string,
      outcome: 'completed' | 'failed' | 'caught',
      catcherName?: string,
    ) => {
      setSession((prev) => {
        if (!prev) return prev;
        const { [playerId]: _removed, ...rest } = prev.activeSidequests;
        return { ...prev, activeSidequests: rest };
      });

      if (outcome === 'completed') {
        addLeaderboardPoints(playerName, 100);
      } else if (outcome === 'caught' && catcherName) {
        addLeaderboardPoints(catcherName, 200);
      }
    },
    [addLeaderboardPoints],
  );

  const value: SidequestContextValue = {
    enabled,
    leaderboard,
    session,
    setEnabled,
    resetLeaderboard,
    startSession,
    endSession,
    checkTrigger,
    confirmAssignment,
    getPendingSidequest,
    resolveSidequest,
  };

  return <SidequestContext.Provider value={value}>{children}</SidequestContext.Provider>;
}

export function useSidequestContext(): SidequestContextValue {
  const ctx = useContext(SidequestContext);
  if (!ctx) throw new Error('useSidequestContext must be used inside SidequestProvider');
  return ctx;
}
