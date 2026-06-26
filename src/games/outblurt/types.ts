/** A team in an Outblurt session. Points are BAD — most points loses. */
export interface Team {
  id: string;
  name: string;
  points: number;
}

let teamCounter = 0;
/** Stable unique id for a freshly created team. */
export function makeTeamId(): string {
  teamCounter += 1;
  return `team_${Date.now()}_${teamCounter}`;
}

/** Ids of the team(s) currently losing (most points). Empty until a point exists. */
export function losingTeamIds(teams: readonly Team[]): string[] {
  const max = Math.max(0, ...teams.map((t) => t.points));
  if (max <= 0) return [];
  return teams.filter((t) => t.points === max).map((t) => t.id);
}

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 12;
