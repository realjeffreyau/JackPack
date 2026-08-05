/** Inclusive bounds the target centre is generated within, so every scoring band fits on the dial. */
export const TARGET_MIN = 17;
export const TARGET_MAX = 83;

/** Max points obtainable in one round. */
export const MAX_ROUND_POINTS = 4;

/** Half-widths of each scoring band, measured as distance from the target centre. */
export const BAND_EDGES = [3, 7, 12, 17] as const;

/** Random target centre in [TARGET_MIN, TARGET_MAX]. */
export function randomTarget(): number {
  return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
}

/** Points awarded for the absolute distance between a guess and target. */
export function scoreGuess(guess: number, target: number): number {
  if (!Number.isFinite(guess) || !Number.isFinite(target)) return 0;

  const distance = Math.abs(guess - target);
  if (distance <= BAND_EDGES[0]) return 4;
  if (distance <= BAND_EDGES[1]) return 3;
  if (distance <= BAND_EDGES[2]) return 2;
  if (distance <= BAND_EDGES[3]) return 1;
  return 0;
}

/** Playful reaction line for a given round score. */
export function reactionFor(points: number): string {
  switch (points) {
    case 4:
      return 'Perfect signal!';
    case 3:
      return 'You two are seriously in sync.';
    case 2:
      return 'Pretty close!';
    case 1:
      return 'You almost had it.';
    default:
      return 'Different signals this time.';
  }
}

/** Team rating for a final accuracy ratio. */
export function ratingFor(accuracy: number): string {
  if (accuracy > 0.9) return 'One shared brain';
  if (accuracy > 0.75) return 'Basically mind readers';
  if (accuracy > 0.5) return 'Strong connection';
  if (accuracy > 0.25) return 'Occasionally on the same signal';
  return 'Still tuning the signal';
}
