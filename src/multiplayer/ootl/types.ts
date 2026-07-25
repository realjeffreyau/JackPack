export interface OotlSettings {
  questionCycles: number;
  discussionSec: number;
}

export type OotlPhase =
  | 'role_reveal'
  | 'answering'
  | 'discussion'
  | 'voting'
  | 'vote_results'
  | 'final_guess'
  | 'game_over';

export interface OotlState {
  settings: OotlSettings;
  category: string;
  topic: string;
  outsider_player_id: string;
  question_ids: number[]; // indexes into the category's questions array
  current_question_index: number;
  speaking_order: string[]; // player ids, reshuffled per question
  current_speaker_index: number;
  ready_player_ids: string[];
  discussion_ends_at: string | null;
  caught: boolean | null;
  guess_correct: boolean | null;
}

export interface OotlVote {
  id: string;
  session_id: string;
  voter_player_id: string;
  accused_player_id: string;
  submitted_at: string;
}
