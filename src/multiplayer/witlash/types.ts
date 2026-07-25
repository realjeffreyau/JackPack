export interface WitlashSettings {
  rounds: number;
  answerTimerSec: number;
  votingTimerSec: number;
}

export interface WitlashSessionState {
  settings: WitlashSettings;
  used_prompt_ids: string[];
  current_matchup_id: string | null;
}

export type WitlashPhase =
  | 'settings'
  | 'round_intro'
  | 'answering'
  | 'voting'
  | 'vote_results'
  | 'round_scoreboard'
  | 'final_results';

export type WitlashRoundStatus = 'answering' | 'voting' | 'complete';
export type WitlashMatchupStatus = 'pending' | 'voting' | 'results' | 'complete';

export interface WitlashRound {
  id: string;
  session_id: string;
  round_number: number;
  status: WitlashRoundStatus;
  prompt_ids: string[];
  answer_started_at: string;
  answer_ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface WitlashMatchup {
  id: string;
  session_id: string;
  round_number: number;
  prompt_id: string;
  prompt_text: string;
  player_a_id: string;
  player_b_id: string;
  answer_a_id: string | null;
  answer_b_id: string | null;
  status: WitlashMatchupStatus;
  eligible_voter_count: number;
  display_order: number;
  voting_started_at: string | null;
  voting_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WitlashAnswer {
  id: string;
  session_id: string;
  round_number: number;
  matchup_id: string;
  player_id: string;
  answer_text: string;
  submitted_at: string;
  updated_at: string;
}

export interface WitlashVote {
  id: string;
  session_id: string;
  round_number: number;
  matchup_id: string;
  voter_player_id: string;
  answer_id: string;
  submitted_at: string;
}

export const PLACEHOLDER_ANSWER = '[No answer submitted]';
