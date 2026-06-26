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
    tagline: 'Vote in secret. Deduce who did it.',
    description:
      'The group votes secretly on a juicy prompt. One player lands in the Hot Seat — told how many votes they got, but not who cast them. Interrogate the room, make your predictions, then find out who fooled who.',
    instructions: [
      'Everyone votes secretly on a group prompt.',
      'One player is put in the Hot Seat — they learn how many votes they got, but not who.',
      'The Subject interrogates the group to figure out who voted for them.',
      'Lock in predictions, then reveal who fooled who.',
      'Score points for correct guesses or successful deception.',
    ],
    icon: '👀',
    accent: colors.lime,
    minPlayers: 4,
    maxPlayers: 12,
    hasSettings: true,
    settings: {
      defaultRoundLength: 90,
      defaultRounds: 5,
      minRoundLength: 60,
      maxRoundLength: 120,
      roundLengthStep: 15,
      minRounds: 2,
      maxRounds: 10,
    },
  },
  {
    id: 'the-mole',
    name: 'The Mole',
    tagline: 'One of you is lying.',
    description:
      'Work together to answer trivia — but one player is secretly sabotaging every round. Build the bigger pot to win. Whoever has the most points at the end takes it all.',
    instructions: [
      'Enter all player names and pick your trivia categories.',
      'Each player secretly receives their role — Mole or Regular Player.',
      'As a group, discuss each trivia question out loud.',
      'Pass the phone privately to each player to lock in their answer.',
      'Regular Players answer correctly to grow the Group Pot.',
      'The Mole answers wrong on purpose to fill their own Mole Pot.',
      'Fill your pot to the auto-win target and you win instantly.',
      'After all rounds, vote on the Mole: catch them by majority for a Group bonus, or they pocket an evasion bonus.',
      'Highest pot when the dust settles wins.',
    ],
    icon: '🕵️',
    accent: colors.purple,
    minPlayers: 3,
    maxPlayers: 10,
    hasSettings: true,
    settings: {
      defaultRounds: 4,
      minRounds: 2,
      maxRounds: 8,
      defaultRoundLength: 90,
      minRoundLength: 60,
      maxRoundLength: 120,
      roundLengthStep: 30,
      defaultRevealChoices: false,
    },
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
