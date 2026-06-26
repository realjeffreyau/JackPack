import type { AgendaType } from '../../data/secretAgenda';

export interface Player {
  id: string;
  name: string;
  points: number;
}

/** One player's hidden objective for a round (targets are player ids). */
export interface Agenda {
  type: AgendaType;
  ownerId: string;
  targetAId?: string;
  targetBId?: string;
  /** Display text with names already resolved. */
  text: string;
}

/** Stable, scored outcome for one player in a round. */
export interface AgendaResult {
  ownerId: string;
  agendaText: string;
  success: boolean;
  reason: string;
}

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 12;

let playerCounter = 0;
export function makePlayerId(): string {
  playerCounter += 1;
  return `p_${Date.now()}_${playerCounter}`;
}

/** Ids of the player(s) with the most points (leaders). Empty if all 0. */
export function leaderIds(players: readonly Player[]): string[] {
  const max = Math.max(0, ...players.map((p) => p.points));
  if (max <= 0) return [];
  return players.filter((p) => p.points === max).map((p) => p.id);
}

/** Case-insensitive duplicate check over trimmed names. */
export function hasDuplicateNames(names: string[]): boolean {
  const seen = new Set<string>();
  for (const n of names) {
    const key = n.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}
