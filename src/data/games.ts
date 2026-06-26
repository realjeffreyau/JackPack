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
  {
    id: 'outblurt',
    name: 'Outblurt',
    tagline: 'Describe it. Dodge the banned words. Beat the bomb.',
    description:
      'Describe the word without saying any banned words. Pass the phone after each card. The bomb timer is hidden, but the ticking gets faster as it gets closer to exploding. Whoever is holding the phone when it explodes gives their team an explosion point.',
    instructions: [
      'Split into 2+ teams and pass one phone around.',
      'The holder describes the target word out loud — no banned words, no rhymes, no spelling, no "sounds like".',
      'Everyone else shouts guesses. Once it lands (or to skip), tap Next Word and pass on.',
      'The timer is hidden — listen to the ticking speed up as the bomb nears.',
      'When it explodes, pick which team was holding the phone. They get 1 explosion point.',
      'Most explosion points loses. Play as long as you like.',
    ],
    icon: '💥',
    accent: colors.orange,
    minPlayers: 4,
    maxPlayers: 24,
    hasSettings: false,
  },
  {
    id: 'secret-agenda',
    name: 'Secret Agenda',
    tagline: 'Get a hidden objective, influence the vote, then reveal who pulled it off.',
    description:
      'Everyone gets a hidden objective. Discuss the prompt, influence the vote, then reveal who secretly completed their agenda.',
    instructions: [
      'Each player privately receives one secret agenda — keep it hidden.',
      'A public prompt appears. Everyone discusses and tries to influence the vote.',
      'Vote out loud, by pointing, or by show of hands.',
      'The host enters the final vote counts.',
      'The app reveals all agendas — if yours succeeded, you score a point.',
      'Most points wins after the final round.',
    ],
    icon: '🎭',
    accent: colors.cyan,
    minPlayers: 3,
    maxPlayers: 12,
    hasSettings: false,
  },
];

export function getGame(id: string): Game | undefined {
  return GAMES.find((g) => g.id === id);
}
