import type {
  ActiveSlot,
  GroupVerdict,
  PlayerRoundResult,
  VerdictPlayer,
  VotesByQuestion,
} from './types';

export function getMajorityVote(votes: Record<string, string>): string | null {
  const tally: Record<string, number> = {};
  Object.values(votes).forEach((id) => {
    tally[id] = (tally[id] ?? 0) + 1;
  });
  const entries = Object.entries(tally);
  if (entries.length === 0) return null;
  const max = Math.max(...entries.map(([, c]) => c));
  const winners = entries.filter(([, c]) => c === max).map(([id]) => id);
  return winners.length === 1 ? winners[0] : null;
}

export function calculateVerdict(votes: VotesByQuestion): GroupVerdict {
  return {
    culpritId: getMajorityVote(votes.culprit),
    helperId: getMajorityVote(votes.helper),
  };
}

export function evaluateRound(
  activeSlots: ActiveSlot[],
  verdict: GroupVerdict,
  truthCulpritId: string,
  truthHelperIds: string[],
  players: VerdictPlayer[],
): PlayerRoundResult[] {
  return activeSlots.map((slot) => {
    const pid = slot.assignedPlayerId;
    const name = slot.assignedPlayerName;

    switch (slot.scoring.type) {
      case 'wants_culprit_convicted': {
        const success = verdict.culpritId === truthCulpritId;
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: success,
          pointsChange: success ? 3 : -1,
          reason: success ? 'The group convicted the real culprit.' : 'The real culprit was not convicted.',
        };
      }
      case 'wants_culprit_free': {
        const success = verdict.culpritId !== pid;
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: success,
          pointsChange: success ? 4 : -3,
          reason: success ? 'You avoided conviction.' : 'The group convicted you.',
        };
      }
      case 'wants_helper_hidden': {
        const success = !truthHelperIds.includes(pid) || verdict.helperId !== pid;
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: success,
          pointsChange: success ? 3 : -2,
          reason: success ? 'You were not exposed as the helper.' : 'The group identified you as the helper.',
        };
      }
      case 'wants_self_not_convicted': {
        const success = verdict.culpritId !== pid;
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: success,
          pointsChange: success ? 3 : -3,
          reason: success ? 'You avoided wrongful conviction.' : 'The group wrongly convicted you.',
        };
      }
      case 'wants_culprit_protected': {
        const success = verdict.culpritId !== truthCulpritId;
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: success,
          pointsChange: success ? 3 : -2,
          reason: success
            ? 'The real culprit was not convicted.'
            : 'The group saw through your deception.',
        };
      }
      case 'neutral': {
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: true,
          pointsChange: 1,
          reason: 'Participation bonus.',
        };
      }
      default: {
        const _exhaustive: never = slot.scoring.type;
        return {
          playerId: pid,
          playerName: name,
          roleTitle: slot.roleTitle,
          objectiveText: slot.objectiveText,
          succeeded: true,
          pointsChange: 0,
          reason: '',
        };
      }
    }
  });
}

export function applyResults(
  players: VerdictPlayer[],
  results: PlayerRoundResult[],
): VerdictPlayer[] {
  return players.map((p) => {
    const result = results.find((r) => r.playerId === p.id);
    if (!result) return p;
    return { ...p, credibility: p.credibility + result.pointsChange };
  });
}
