import type { WitlashPrompt } from '../../data/witlashPrompts';

export interface MatchupDraft {
  player_a_id: string;
  player_b_id: string;
  prompt_id: string;
  prompt_text: string;
  display_order: number;
  eligible_voter_count: number;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Shuffle + pair consecutively. Odd-length input leaves the last item as the "bye". */
function pairPass(players: string[]): { pairs: [string, string][]; bye: string | null } {
  const shuffled = shuffle(players);
  const pairs: [string, string][] = [];
  let i = 0;
  for (; i + 1 < shuffled.length; i += 2) {
    pairs.push([shuffled[i], shuffled[i + 1]]);
  }
  const bye = shuffled.length % 2 === 1 ? shuffled[shuffled.length - 1] : null;
  return { pairs, bye };
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * Two-pass shuffle-and-pair: each player lands in ~2 matchups per round.
 * Odd player counts produce one "bye" per pass; the two byes are paired
 * together as a bonus matchup so every player still gets exactly 2.
 * Retries pass 2 up to 5x to avoid repeating an exact pair from pass 1.
 */
export function buildMatchups(
  playerIds: string[],
  availablePrompts: readonly WitlashPrompt[],
  usedPromptIds: string[]
): { matchups: MatchupDraft[]; usedPromptIds: string[] } {
  const pass1 = pairPass(playerIds);
  const pass1Keys = new Set(pass1.pairs.map(([a, b]) => pairKey(a, b)));

  let pass2 = pairPass(playerIds);
  for (let attempt = 0; attempt < 5; attempt++) {
    const overlaps = pass2.pairs.some(([a, b]) => pass1Keys.has(pairKey(a, b)));
    if (!overlaps) break;
    pass2 = pairPass(playerIds);
  }

  const allPairs: [string, string][] = [...pass1.pairs, ...pass2.pairs];
  if (pass1.bye && pass2.bye && pass1.bye !== pass2.bye) {
    allPairs.push([pass1.bye, pass2.bye]);
  }

  const pool = availablePrompts.filter((p) => !usedPromptIds.includes(p.id));
  const source = pool.length >= allPairs.length ? pool : availablePrompts;
  const drawn = shuffle([...source]).slice(0, allPairs.length);

  const matchups: MatchupDraft[] = allPairs.map(([a, b], index) => ({
    player_a_id: a,
    player_b_id: b,
    prompt_id: drawn[index].id,
    prompt_text: drawn[index].text,
    display_order: index,
    eligible_voter_count: Math.max(playerIds.length - 2, 0),
  }));

  const nextUsedPromptIds = [...usedPromptIds, ...drawn.map((p) => p.id)];

  return { matchups, usedPromptIds: nextUsedPromptIds };
}
