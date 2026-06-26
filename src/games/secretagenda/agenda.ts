import { AGENDA_TEMPLATES, type AgendaKind, type AgendaType } from '../../data/secretAgenda';
import { shuffle } from '../../utils/deck';
import type { Agenda, AgendaResult, Player } from './types';

function satisfiable(kind: AgendaKind, otherCount: number): boolean {
  if (kind === 'target1') return otherCount >= 1;
  if (kind === 'target2') return otherCount >= 2;
  return true; // self / global
}

/**
 * Agenda types that should not co-exist in the same round.
 * Each key lists types that conflict with it. Conflict is symmetric — if A
 * conflicts with B then B conflicts with A — but both directions are listed
 * so the lookup is a simple read.
 */
const CONFLICTS: Partial<Record<AgendaType, readonly AgendaType[]>> = {
  VOTE_MUST_TIE:        ['NO_TIE', 'WINNER_BY_ONE', 'MAJORITY_VOTE', 'THREE_WAY_TIE'],
  NO_TIE:               ['VOTE_MUST_TIE', 'THREE_WAY_TIE'],
  THREE_WAY_TIE:        ['NO_TIE', 'WINNER_BY_ONE', 'MAJORITY_VOTE', 'VOTE_MUST_TIE'],
  WINNER_BY_ONE:        ['VOTE_MUST_TIE', 'THREE_WAY_TIE'],
  MAJORITY_VOTE:        ['VOTE_MUST_TIE', 'THREE_WAY_TIE'],
  EVERYONE_GETS_A_VOTE: ['SOMEONE_GETS_ZERO', 'SELF_ZERO_VOTES', 'TARGET_ZERO_VOTES'],
  SOMEONE_GETS_ZERO:    ['EVERYONE_GETS_A_VOTE'],
  SELF_ZERO_VOTES:      ['EVERYONE_GETS_A_VOTE'],
  TARGET_ZERO_VOTES:    ['EVERYONE_GETS_A_VOTE'],
};

function blockedByConflicts(usedTypes: ReadonlySet<AgendaType>): Set<AgendaType> {
  const blocked = new Set<AgendaType>();
  for (const type of usedTypes) {
    for (const conflict of CONFLICTS[type] ?? []) blocked.add(conflict);
  }
  return blocked;
}

function agendaText(type: AgendaType, aName?: string, bName?: string): string {
  switch (type) {
    case 'SELF_MUST_WIN':          return 'Make yourself the obvious answer. Get the most votes.';
    case 'SELF_MUST_NOT_WIN':      return 'Stay under the radar. Do not top the vote.';
    case 'SELF_ZERO_VOTES':        return 'Become invisible. Receive zero votes.';
    case 'SELF_AT_LEAST_ONE_VOTE': return 'Leave a mark. Get at least one vote.';
    case 'SELF_BOTTOM':            return 'Blend into the background. Get the fewest votes (tied is fine).';
    case 'SELF_BEATS_TARGET':      return `Outshine ${aName}. Get more votes than them.`;
    case 'TARGET_MUST_WIN':        return `Push ${aName} to the top. They must get the most votes.`;
    case 'TARGET_MUST_NOT_WIN':    return `Keep ${aName} off the top spot. They cannot win the vote.`;
    case 'TARGET_ZERO_VOTES':      return `Make ${aName} a non-answer. They must get zero votes.`;
    case 'TARGET_AT_LEAST_ONE_VOTE': return `Get ${aName} noticed. They need at least one vote.`;
    case 'TARGET_BOTTOM':          return `Push ${aName} to the bottom. They must get the fewest votes (tied is fine).`;
    case 'TARGET_BEATS_SELF':      return `${aName} must get more votes than you.`;
    case 'TARGET_MORE_THAN_OTHER': return `${aName} must beat ${bName} in the vote.`;
    case 'VOTE_MUST_TIE':          return 'No clear winner. Force a tie for the most votes.';
    case 'NO_TIE':                 return 'One winner only. There must be no tie for the top spot.';
    case 'THREE_WAY_TIE':          return 'Chaos mode. At least 3 players must tie for the most votes.';
    case 'WINNER_BY_ONE':          return 'Make it dramatic. The winner must beat 2nd place by exactly 1 vote.';
    case 'MAJORITY_VOTE':          return 'Landslide. One player must get more than half the total votes.';
    case 'EVERYONE_GETS_A_VOTE':   return 'Spread the love. Every player must get at least one vote.';
    case 'SOMEONE_GETS_ZERO':      return 'Leave someone out. At least one player must get zero votes.';
  }
}

/**
 * Deals one evaluatable agenda to each player. Types are varied across the round;
 * conflicting outcome types (e.g. TIE and NO_TIE) are never assigned together.
 * Targets are always valid (not the owner, distinct for comparisons).
 */
export function generateAgendas(players: readonly Player[]): Agenda[] {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '?';
  const pool = shuffle(AGENDA_TEMPLATES);
  const usedTypes = new Set<AgendaType>();
  const agendas: Agenda[] = [];

  for (const player of players) {
    const others = players.filter((p) => p.id !== player.id);
    const blocked = blockedByConflicts(usedTypes);
    const valid = pool.filter((t) => satisfiable(t.kind, others.length));

    // Priority: unused AND not conflicting → unused (may conflict) → any valid
    const pick =
      valid.find((t) => !usedTypes.has(t.type) && !blocked.has(t.type)) ??
      valid.find((t) => !usedTypes.has(t.type)) ??
      valid[Math.floor(Math.random() * valid.length)];

    usedTypes.add(pick.type);

    let targetAId: string | undefined;
    let targetBId: string | undefined;
    if (pick.kind === 'target1') {
      targetAId = others[Math.floor(Math.random() * others.length)].id;
    } else if (pick.kind === 'target2') {
      const [a, b] = shuffle(others);
      targetAId = a.id;
      targetBId = b.id;
    }

    agendas.push({
      type: pick.type,
      ownerId: player.id,
      targetAId,
      targetBId,
      text: agendaText(pick.type, targetAId && nameOf(targetAId), targetBId && nameOf(targetBId)),
    });
  }

  return agendas;
}

interface VoteSummary {
  highest: number;
  topIds: string[];
  tie: boolean;
}

/** Derive the headline vote facts used by evaluation and the reveal screen. */
export function summarizeVotes(players: readonly Player[], votes: Record<string, number>): VoteSummary {
  const v = (id: string) => votes[id] ?? 0;
  const highest = Math.max(0, ...players.map((p) => v(p.id)));
  const topIds = players.filter((p) => v(p.id) === highest).map((p) => p.id);
  return { highest, topIds, tie: topIds.length > 1 };
}

/** Evaluate a single agenda against the entered vote counts. */
export function evaluateAgenda(
  agenda: Agenda,
  players: readonly Player[],
  votes: Record<string, number>,
): { success: boolean; reason: string } {
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? '?';
  const v = (id: string) => votes[id] ?? 0;
  const { topIds, tie } = summarizeVotes(players, votes);
  const inTop = (id: string) => topIds.includes(id);
  const a = agenda.targetAId;
  const b = agenda.targetBId;

  switch (agenda.type) {
    case 'SELF_MUST_WIN': {
      const ok = inTop(agenda.ownerId);
      return { success: ok, reason: ok ? 'Topped the vote.' : `Didn't top the vote (${v(agenda.ownerId)} vote(s)).` };
    }
    case 'SELF_MUST_NOT_WIN': {
      const ok = !inTop(agenda.ownerId);
      return { success: ok, reason: ok ? 'Avoided the top spot.' : 'Ended up with the most votes.' };
    }
    case 'SELF_ZERO_VOTES': {
      const ok = v(agenda.ownerId) === 0;
      return { success: ok, reason: ok ? 'Received zero votes.' : `Received ${v(agenda.ownerId)} vote(s).` };
    }
    case 'SELF_AT_LEAST_ONE_VOTE': {
      const ok = v(agenda.ownerId) > 0;
      return { success: ok, reason: ok ? `Got ${v(agenda.ownerId)} vote(s).` : 'Received zero votes.' };
    }
    case 'SELF_BOTTOM': {
      const lowest = Math.min(...players.map((p) => v(p.id)));
      const ok = v(agenda.ownerId) === lowest;
      return { success: ok, reason: ok ? `Got the fewest votes (${lowest}).` : `Got ${v(agenda.ownerId)}, minimum was ${lowest}.` };
    }
    case 'SELF_BEATS_TARGET': {
      const ok = !!a && v(agenda.ownerId) > v(a);
      return { success: ok, reason: `You: ${v(agenda.ownerId)} vs ${nameOf(a!)}: ${v(a!)}.` };
    }
    case 'TARGET_MUST_WIN': {
      const ok = !!a && inTop(a);
      return { success: ok, reason: ok ? `${nameOf(a!)} topped the vote.` : `${nameOf(a!)} didn't top the vote.` };
    }
    case 'TARGET_MUST_NOT_WIN': {
      const ok = !!a && !inTop(a);
      return { success: ok, reason: ok ? `${nameOf(a!)} avoided the top spot.` : `${nameOf(a!)} topped the vote.` };
    }
    case 'TARGET_ZERO_VOTES': {
      const ok = !!a && v(a) === 0;
      return { success: ok, reason: ok ? `${nameOf(a!)} got zero votes.` : `${nameOf(a!)} got ${v(a!)} vote(s).` };
    }
    case 'TARGET_AT_LEAST_ONE_VOTE': {
      const ok = !!a && v(a) > 0;
      return { success: ok, reason: ok ? `${nameOf(a!)} got ${v(a!)} vote(s).` : `${nameOf(a!)} got zero votes.` };
    }
    case 'TARGET_BOTTOM': {
      const lowest = Math.min(...players.map((p) => v(p.id)));
      const ok = !!a && v(a) === lowest;
      return { success: ok, reason: ok ? `${nameOf(a!)} got the fewest votes (${lowest}).` : `${nameOf(a!)} got ${v(a!)}, minimum was ${lowest}.` };
    }
    case 'TARGET_BEATS_SELF': {
      const ok = !!a && v(a) > v(agenda.ownerId);
      return { success: ok, reason: `${nameOf(a!)}: ${v(a!)} vs you: ${v(agenda.ownerId)}.` };
    }
    case 'TARGET_MORE_THAN_OTHER': {
      const ok = !!a && !!b && v(a) > v(b);
      return { success: ok, reason: `${nameOf(a!)}: ${v(a!)} vs ${nameOf(b!)}: ${v(b!)}.` };
    }
    case 'VOTE_MUST_TIE':
      return { success: tie, reason: tie ? 'The vote tied for most.' : 'No tie for most votes.' };
    case 'NO_TIE':
      return { success: !tie, reason: !tie ? 'A single player topped the vote.' : 'The vote tied for most.' };
    case 'THREE_WAY_TIE': {
      const ok = topIds.length >= 3;
      return { success: ok, reason: ok ? `${topIds.length} players tied for most votes.` : `Only ${topIds.length} player(s) at the top.` };
    }
    case 'WINNER_BY_ONE': {
      if (tie) return { success: false, reason: 'The vote tied — no single winner.' };
      const sorted = [...players].sort((pa, pb) => v(pb.id) - v(pa.id));
      const topVotes = v(sorted[0].id);
      const secondVotes = sorted.length > 1 ? v(sorted[1].id) : 0;
      const margin = topVotes - secondVotes;
      const ok = margin === 1;
      return { success: ok, reason: ok ? `${nameOf(sorted[0].id)} won by exactly 1 vote (${topVotes} vs ${secondVotes}).` : `Margin was ${margin} vote(s).` };
    }
    case 'MAJORITY_VOTE': {
      const total = players.reduce((s, p) => s + v(p.id), 0);
      const ok = !tie && total > 0 && v(topIds[0]) > total / 2;
      return {
        success: ok,
        reason: ok
          ? `${nameOf(topIds[0])} got ${v(topIds[0])} of ${total} votes (majority).`
          : `No single majority winner.`,
      };
    }
    case 'EVERYONE_GETS_A_VOTE': {
      const ok = players.every((p) => v(p.id) > 0);
      return { success: ok, reason: ok ? 'Everyone got at least one vote.' : 'Someone got zero votes.' };
    }
    case 'SOMEONE_GETS_ZERO': {
      const ok = players.some((p) => v(p.id) === 0);
      return { success: ok, reason: ok ? 'At least one player got zero votes.' : 'Everyone got at least one vote.' };
    }
  }
}

/** Evaluate every agenda once and return stable results for the reveal screen. */
export function scoreRound(
  agendas: readonly Agenda[],
  players: readonly Player[],
  votes: Record<string, number>,
): AgendaResult[] {
  return agendas.map((ag) => {
    const { success, reason } = evaluateAgenda(ag, players, votes);
    return { ownerId: ag.ownerId, agendaText: ag.text, success, reason };
  });
}
