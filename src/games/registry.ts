import type { GameEngine } from '../types/game';
import { TruthBombEngine } from './truthbomb/TruthBombEngine';

/**
 * Maps a game id to its playable engine component. To ship a new game, build
 * its engine (accepting GameEngineProps) and register it here.
 */
export const GAME_ENGINES: Record<string, GameEngine> = {
  'truth-bomb': TruthBombEngine,
};

export function getGameEngine(id: string): GameEngine | undefined {
  return GAME_ENGINES[id];
}

export function isPlayable(id: string): boolean {
  return id in GAME_ENGINES;
}
