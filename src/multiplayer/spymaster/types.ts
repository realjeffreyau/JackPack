export type SpymasterTileTeam = 'red' | 'blue' | 'neutral' | 'assassin';
export type SpymasterTeam = 'red' | 'blue';
export type SpymasterPhase = 'board' | 'game_over';

export interface SpymasterTile {
  word: string;
  team: SpymasterTileTeam;
  revealed: boolean;
}

export interface SpymasterState {
  tiles: SpymasterTile[];
  startingTeam: SpymasterTeam;
  currentTeam: SpymasterTeam;
  redRemaining: number;
  blueRemaining: number;
  winner: SpymasterTeam | null;
  assassinTripped: boolean;
}
