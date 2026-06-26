/**
 * Secret Agenda content + config.
 *
 * Each player gets a hidden objective (an "agenda") that is evaluated purely
 * from the final vote counts — no speech/behavior detection.
 * Public prompts drive the discussion + vote.
 */

/** Rounds setting. 0 means Endless (manual End Game). */
export type RoundsMode = 3 | 5 | 7 | 10 | 0;

export interface RoundsModeMeta {
  value: RoundsMode;
  label: string;
}

export const ROUNDS_OPTIONS: readonly RoundsModeMeta[] = [
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 7, label: '7' },
  { value: 10, label: '10' },
  { value: 0, label: 'Endless' },
];

/** All 20 evaluatable agenda templates. */
export type AgendaType =
  // Self-referential
  | 'SELF_MUST_WIN'
  | 'SELF_MUST_NOT_WIN'
  | 'SELF_ZERO_VOTES'
  | 'SELF_AT_LEAST_ONE_VOTE'
  | 'SELF_BOTTOM'
  | 'SELF_BEATS_TARGET'
  // Target-referential
  | 'TARGET_MUST_WIN'
  | 'TARGET_MUST_NOT_WIN'
  | 'TARGET_ZERO_VOTES'
  | 'TARGET_AT_LEAST_ONE_VOTE'
  | 'TARGET_MORE_THAN_OTHER'
  | 'TARGET_BOTTOM'
  | 'TARGET_BEATS_SELF'
  // Global outcome
  | 'VOTE_MUST_TIE'
  | 'NO_TIE'
  | 'THREE_WAY_TIE'
  | 'WINNER_BY_ONE'
  | 'MAJORITY_VOTE'
  | 'EVERYONE_GETS_A_VOTE'
  | 'SOMEONE_GETS_ZERO';

/** What player references a template needs, so the generator can supply them. */
export type AgendaKind = 'self' | 'target1' | 'target2' | 'global';

export const AGENDA_TEMPLATES: readonly { type: AgendaType; kind: AgendaKind }[] = [
  { type: 'SELF_MUST_WIN',          kind: 'self' },
  { type: 'SELF_MUST_NOT_WIN',      kind: 'self' },
  { type: 'SELF_ZERO_VOTES',        kind: 'self' },
  { type: 'SELF_AT_LEAST_ONE_VOTE', kind: 'self' },
  { type: 'SELF_BOTTOM',            kind: 'self' },
  { type: 'SELF_BEATS_TARGET',      kind: 'target1' },
  { type: 'TARGET_MUST_WIN',        kind: 'target1' },
  { type: 'TARGET_MUST_NOT_WIN',    kind: 'target1' },
  { type: 'TARGET_ZERO_VOTES',      kind: 'target1' },
  { type: 'TARGET_AT_LEAST_ONE_VOTE', kind: 'target1' },
  { type: 'TARGET_BOTTOM',          kind: 'target1' },
  { type: 'TARGET_BEATS_SELF',      kind: 'target1' },
  { type: 'TARGET_MORE_THAN_OTHER', kind: 'target2' },
  { type: 'VOTE_MUST_TIE',          kind: 'global' },
  { type: 'NO_TIE',                 kind: 'global' },
  { type: 'THREE_WAY_TIE',          kind: 'global' },
  { type: 'WINNER_BY_ONE',          kind: 'global' },
  { type: 'MAJORITY_VOTE',          kind: 'global' },
  { type: 'EVERYONE_GETS_A_VOTE',   kind: 'global' },
  { type: 'SOMEONE_GETS_ZERO',      kind: 'global' },
];

/**
 * Public discussion prompts — 150 opinion-based, vote-for-a-player prompts.
 * Quirky, character-revealing, party-friendly. No protected traits / politics / trauma.
 */
export const PROMPTS: readonly string[] = [
  // Survival + chaos
  'Who would be the worst person to take on a road trip?',
  'Who is most likely to survive a zombie apocalypse?',
  'Who would be the best leader on a deserted island?',
  'Who would survive the longest in the wilderness?',
  'Who would be the first to get lost on a hike?',
  'Who would be the best person to survive a horror movie?',
  'Who would be the last person to leave a sinking ship?',
  'Who would panic first during a minor emergency?',
  'Who would stay suspiciously calm during a horror movie?',
  'Who would be the best at surviving in a cabin in the woods — alone?',
  'Who would panic-buy the most bizarre items before a storm?',

  // Social chaos
  'Who is most likely to accidentally start drama in a group chat?',
  'Who would be the worst roommate?',
  'Who would be the worst person to share a hotel room with?',
  'Who would be the most dramatic in an argument?',
  'Who would be the worst person to lend money to?',
  'Who would stop a fight by making it incredibly awkward?',
  "Who would get genuinely invested in a stranger's drama on the train?",
  'Who would give the most chaotic guided tour of their hometown?',
  'Who would turn a 5-minute errand into a 3-hour adventure?',
  'Who would be the worst influence at a sleepover?',
  'Who would ruin a surprise party by being too helpful?',
  'Who would be first to suggest karaoke when nobody else is ready?',

  // Fame + success
  'Who is most likely to become famous?',
  'Who is most likely to become a millionaire?',
  'Who is most likely to start their own business?',
  'Who is most likely to become a viral sensation?',
  'Who is most likely to become a famous chef?',
  'Who is most likely to become a famous influencer?',
  'Who is most likely to become a motivational speaker?',
  'Who would accidentally become mayor of a small town?',
  'Who would invent the most useless app and somehow get funding for it?',
  'Who would accidentally discover a new species and name it after themselves?',
  'Who would give the worst TED talk?',
  'Who would accidentally become the most popular person at a networking event?',

  // Personality reveals
  'Who is most likely to have a whole different personality online?',
  'Who is most likely to have read every single terms and conditions?',
  'Who is most likely to still believe in a childhood superstition?',
  'Who would try to casually drop a philosophy reference into every conversation?',
  'Who would take a board game so seriously it becomes a personality trait?',
  'Who would commit fully to an accent for an entire weekend?',
  'Who would go full method actor for a school play?',
  'Who would be the person everyone texts at 3am for emotional support?',
  'Who would give the most surprisingly good advice at 2am?',
  'Who would bring unsolicited snacks to every event they attend?',
  'Who is most likely to know every word to a song no one else has heard of?',

  // Incompetence comedy
  'Who would be the worst dance partner?',
  'Who would make the worst getaway driver?',
  'Who would be the worst person to babysit kids?',
  'Who would be the worst at giving directions?',
  'Who would be the worst at keeping a plant alive?',
  'Who would be the worst contestant on a cooking show?',
  'Who would be the worst person to wake up early with?',
  'Who would be the worst at hide and seek?',
  'Who would make the most convincing villain?',
  'Who would be the most useless in a heist?',
  'Who would be the worst at poker despite claiming to be incredible at it?',
  'Who would lose a debate to a child?',
  'Who would forget their PIN at the worst possible moment?',
  'Who is most likely to get into an argument with a self-checkout machine?',
  'Who would try to reason with airport security?',

  // Absurdist
  'Who would attempt to make friends with a seagull?',
  'Who would try to negotiate with the villain instead of fighting them?',
  'Who would spend a whole week in a haunted house and genuinely enjoy it?',
  'Who would be the most likely to win a staring contest against a dog?',
  'Who would cry watching a furniture assembly video?',
  'Who would accidentally befriend a cult thinking it was a book club?',
  'Who would pretend to understand a foreign language until it backfires?',
  'Who would get emotionally attached to a rental car?',
  'Who would fall asleep at a concert they paid a lot for?',
  'Who would challenge someone twice their size to an arm wrestle?',
  'Who would bring a full charcuterie board to a movie night no one asked them to host?',
  'Who would find a wild conspiracy connection between two completely unrelated things?',

  // Party scenarios
  'Who would be voted "most likely to still be at the after-party at 9am"?',
  'Who would start crying at a Disney movie before the sad part even hits?',
  'Who would lose at rock-paper-scissors the most times in a row?',
  'Who would fall asleep during a movie?',
  'Who would be the most dramatic about a mild sunburn?',
  'Who would have the most unhinged energy at 6am?',
  'Who is most likely to accidentally text their boss a meme?',
  "Who would be last to realize the zoom call wasn't muted?",
  'Who would make the most elaborate excuse for being 3 minutes late?',
  'Who is most likely to be late to their own party?',
  'Who would ask the most unexpected question during a formal presentation?',

  // Skills + competition
  'Who is most likely to win a reality show?',
  'Who is most likely to win an eating contest?',
  'Who would be the funniest game show host?',
  'Who would be the best karaoke performer?',
  'Who is most likely to win a trivia night?',
  'Who would be the best person in a pub quiz?',
  'Who would be the best escape room teammate?',
  'Who is most likely to win a dance-off?',
  'Who would be the best stand-up comedian?',
  'Who would be the best detective?',
  'Who would be the best wedding planner?',
  'Who would make the best ghost hunter?',
  'Who would be the best superhero?',
  'Who would be the most convincing fake doctor?',
  'Who would be best at bluffing their way through an expert-level conversation?',
  'Who is most likely to solve a mystery before the detective does?',
  'Who would be first to realize the escape room was actually a locked room?',

  // Quirky specifics
  'Who is most likely to trip on a perfectly flat floor?',
  'Who is most likely to talk their way out of a parking ticket?',
  'Who is most likely to adopt ten pets?',
  'Who is most likely to forget their own birthday?',
  'Who is most likely to lose their phone at a party?',
  'Who is most likely to start a conspiracy theory?',
  'Who is most likely to cry at a commercial?',
  'Who is most likely to overpack for a weekend trip?',
  'Who is most likely to get scared by their own shadow?',
  'Who is most likely to fall for an obvious prank?',
  'Who is most likely to befriend a stranger instantly?',
  'Who is most likely to get distracted mid-sentence?',
  'Who is most likely to spend their last dollar on snacks?',
  'Who is most likely to laugh at the wrong moment?',
  'Who is most likely to start a food fight?',
  'Who is most likely to forget where they parked?',
  'Who is most likely to argue with a GPS?',
  'Who is most likely to make friends with the waiter?',
  'Who is most likely to win an award for being extra?',
  'Who is most likely to accidentally text the wrong person?',
  'Who is most likely to start a dance party out of nowhere?',
  'Who is most likely to become a cult leader?',
  'Who is most likely to bring the wrong gift to a party?',
  'Who is most likely to win a hot dog eating contest?',
  "Who is most likely to get a song stuck in everyone's head?",
  'Who is most likely to win a staring contest?',

  // Deep character
  'Who would be first to propose a "quick detour" that takes 2 hours?',
  "Who would be last to admit they're lost?",
  'Who would be the most aggressively supportive sports parent?',
  "Who would try to speedrun a video game they've never played before at a party?",
  'Who would genuinely believe they found a loophole in a museum?',
  'Who would think a tornado drill is the real thing?',
  'Who is most likely to have the most chaotic first day at a new job?',
  'Who would ask to speak to the manager and somehow leave as their friend?',
  'Who would be first to volunteer for the most suspicious job at a mystery dinner?',
  "Who would be first to suggest a midnight swim in a lake they've never been to?",
  "Who would give the longest speech at a wedding they weren't invited to speak at?",
  "Who would commit to a New Year's resolution the longest?",
  'Who would apologize to a chair after bumping into it?',
  'Who would wake up the earliest on vacation?',
  'Who would somehow befriend airport staff and get a free upgrade?',
];
