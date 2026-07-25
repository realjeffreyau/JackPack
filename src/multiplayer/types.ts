export type LobbyStatus = 'waiting' | 'playing' | 'ended';
export type LobbyPlayerStatus = 'active' | 'waiting' | 'disconnected' | 'kicked';

export interface Lobby {
  id: string;
  lobby_code: string;
  host_auth_user_id: string;
  status: LobbyStatus;
  current_game: string;
  game_session_id: string | null;
  settings: Record<string, unknown>;
  max_players: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface LobbyPlayer {
  id: string;
  lobby_id: string;
  auth_user_id: string;
  display_name: string;
  is_host: boolean;
  is_connected: boolean;
  status: LobbyPlayerStatus;
  score: number;
  joined_at: string;
  last_seen_at: string;
}

export interface GameSession {
  id: string;
  lobby_id: string;
  game_id: string;
  phase: string;
  round_number: number;
  total_rounds: number;
  state: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
