export interface Sidequest {
  id: string;
  text: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface LeaderboardEntry {
  name: string;
  normalizedName: string;
  points: number;
}

export interface SidequestSessionState {
  players: { id: string; name: string }[];
  playersWhoReceived: string[];
  activeSidequests: Record<string, Sidequest>;
  totalTriggered: number;
}

export interface SidequestContextValue {
  enabled: boolean;
  leaderboard: LeaderboardEntry[];
  session: SidequestSessionState | null;
  setEnabled: (v: boolean) => void;
  resetLeaderboard: () => void;
  startSession: (players: { id: string; name: string }[]) => void;
  endSession: () => void;
  checkTrigger: (playerId: string) => Sidequest | null;
  confirmAssignment: (playerId: string, sq: Sidequest) => void;
  getPendingSidequest: (playerId: string) => Sidequest | null;
  resolveSidequest: (
    playerId: string,
    playerName: string,
    outcome: 'completed' | 'failed' | 'caught',
    catcherName?: string,
  ) => void;
}
