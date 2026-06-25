export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export type PromptMode = 'builtin' | 'custom' | 'mix';

export type Phase =
  | 'prompt_mode'
  | 'custom_input'
  | 'player_setup'
  | 'voting_gate'
  | 'vote'
  | 'subject_gate'
  | 'subject_notification'
  | 'interrogation'
  | 'group_reveal'
  | 'score'
  | 'game_over';
