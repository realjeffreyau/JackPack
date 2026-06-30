export interface VerdictPlayer {
  id: string;
  name: string;
  credibility: number;
}

export type ScoringType =
  | 'wants_culprit_convicted'
  | 'wants_culprit_free'
  | 'wants_helper_hidden'
  | 'wants_self_not_convicted'
  | 'wants_culprit_protected'
  | 'neutral';

export interface ScoringRule {
  type: ScoringType;
}

export interface CaseSlot {
  id: string;
  requiredFrom: number;
  isCulprit: boolean;
  isHelper: boolean;
  isFalseSuspect: boolean;
  roleTitle: string;
  privateInfoTemplate: string;
  beliefTemplate: string;
  rumorTemplate?: string;
  objectiveText: string;
  scoring: ScoringRule;
}

export interface CaseTemplate {
  id: string;
  title: string;
  category: string;
  intro: string;
  trueTimeline: string[];
  slots: CaseSlot[];
  votingQuestions: {
    culprit: string;
    helper: string;
  };
}

export interface ActiveSlot extends CaseSlot {
  assignedPlayerId: string;
  assignedPlayerName: string;
  interpolatedPrivateInfo: string;
  interpolatedBelief: string;
  interpolatedRumor?: string;
}

export interface ScaledCase {
  template: CaseTemplate;
  activeSlots: ActiveSlot[];
  truthCulpritId: string;
  truthHelperIds: string[];
  showHelperVote: boolean;
}

export interface VotesByQuestion {
  culprit: Record<string, string>;
  helper: Record<string, string>;
}

export interface GroupVerdict {
  culpritId: string | null;
  helperId: string | null;
}

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  roleTitle: string;
  objectiveText: string;
  succeeded: boolean;
  pointsChange: number;
  reason: string;
}

export type Phase =
  | 'player_setup'
  | 'rounds_select'
  | 'round_intro'
  | 'role_deal'
  | 'discussion'
  | 'final_args_prompt'
  | 'final_args'
  | 'voting'
  | 'reveal'
  | 'scoreboard'
  | 'final_results';

export type VoteSubPhase = 'gate' | 'vote';
export type RevealStep = 'verdict' | 'truth' | 'player_results';
