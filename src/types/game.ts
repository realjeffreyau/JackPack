import type { ComponentType } from 'react';

/**
 * Per-game configuration for the optional settings screen.
 * All times are in seconds.
 */
export interface GameSettingsConfig {
  defaultRoundLength: number;
  defaultRounds: number;
  minRoundLength: number;
  maxRoundLength: number;
  roundLengthStep: number;
  minRounds: number;
  maxRounds: number;
  /** Default for the "reveal answer choices" toggle (off when omitted). */
  defaultRevealChoices?: boolean;
}

/**
 * A game definition. Add a new game by appending one of these to the central
 * GAMES list and registering its engine component in src/games/registry.ts.
 */
export interface Game {
  id: string;
  name: string;
  /** Short one-liner shown on the home card. */
  tagline: string;
  /** Longer description shown on the detail screen. */
  description: string;
  instructions: string[];
  /** Emoji placeholder icon. */
  icon: string;
  /** Neon accent colour used across the card and detail screen. */
  accent: string;
  minPlayers: number;
  maxPlayers: number;
  hasSettings: boolean;
  settings?: GameSettingsConfig;
}

/**
 * Props every game engine receives from the generic GamePlay host screen.
 */
export interface GameEngineProps {
  roundLength: number;
  totalRounds: number;
  /** When true, the group question screen reveals the answer choices. */
  revealChoices?: boolean;
  /** Call to leave the game and return to the home screen. */
  onExit: () => void;
}

export type GameEngine = ComponentType<GameEngineProps>;
