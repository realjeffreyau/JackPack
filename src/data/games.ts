import type { Game } from '../types/game';
import { colors } from '../theme/theme';

/**
 * Central list of all games. The home screen renders these in a grid.
 * A game becomes playable once its engine is registered in
 * src/games/registry.ts — until then it shows as "Coming soon".
 */
export const GAMES: readonly Game[] = [
  {
    id: 'truth-bomb',
    name: 'Truth Bomb',
    tagline: 'Pass the phone before it blows.',
    description:
      'Pass the phone around the circle. When the timer runs out, whoever is holding it must face the Truth Bomb — a spicy question or a dare.',
    instructions: [
      'Sit in a circle and pick someone to start.',
      'A question appears — read it out loud and answer it.',
      'Tap NEXT and pass the phone to the next player.',
      'Keep it moving! The timer never stops ticking.',
      'When time hits zero, whoever holds the phone gets the Truth Bomb.',
    ],
    icon: '💣',
    accent: colors.primary,
    minPlayers: 3,
    maxPlayers: 12,
    hasSettings: true,
    settings: {
      defaultRoundLength: 60,
      defaultRounds: 5,
      minRoundLength: 15,
      maxRoundLength: 120,
      roundLengthStep: 15,
      minRounds: 1,
      maxRounds: 10,
    },
  },
  {
    id: 'would-you-rather',
    name: 'Would You Rather',
    tagline: 'Two awful choices. Pick one.',
    description: 'The group votes on impossible dilemmas. Defend your choice or face the roast.',
    instructions: [],
    icon: '🤔',
    accent: colors.cyan,
    minPlayers: 2,
    maxPlayers: 16,
    hasSettings: false,
  },
  {
    id: 'paranoia',
    name: 'Paranoia',
    tagline: 'Whisper a question. Reveal at your own risk.',
    description: 'Whisper a juicy question to your neighbour. They answer out loud — but only a coin flip reveals what you asked.',
    instructions: [],
    icon: '👀',
    accent: colors.lime,
    minPlayers: 4,
    maxPlayers: 12,
    hasSettings: false,
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
