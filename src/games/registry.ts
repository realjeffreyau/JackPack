import type { GameEngine } from '../types/game';
import { TruthBombEngine } from './truthbomb/TruthBombEngine';
import { TheMoleEngine } from './themole/TheMoleEngine';
import { ParanoiaEngine } from './paranoia/ParanoiaEngine';
import { OutblurtEngine } from './outblurt/OutblurtEngine';
import { VerdictEngine } from './verdict/VerdictEngine';
import { DrinkIfYouSmileEngine } from './drinkifyousmile/DrinkIfYouSmileEngine';
import { LikelyToEngine } from './likelyto/LikelyToEngine';
import { SignalSyncEngine } from './signalsync/SignalSyncEngine';

/**
 * Maps a game id to its playable engine component. To ship a new game, build
 * its engine (accepting GameEngineProps) and register it here.
 */
export const GAME_ENGINES: Record<string, GameEngine> = {
  'truth-bomb': TruthBombEngine,
  'the-mole': TheMoleEngine,
  'paranoia': ParanoiaEngine,
  'outblurt': OutblurtEngine,
  'verdict': VerdictEngine,
  'drink-if-you-smile': DrinkIfYouSmileEngine,
  'likely-to': LikelyToEngine,
  'signal-sync': SignalSyncEngine,
};

export function getGameEngine(id: string): GameEngine | undefined {
  return GAME_ENGINES[id];
}

export function isPlayable(id: string): boolean {
  return id in GAME_ENGINES;
}
