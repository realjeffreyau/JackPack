import { shuffle } from '../../utils/deck';
import type { ActiveSlot, CaseTemplate, ScaledCase, VerdictPlayer } from './types';

function interpolate(template: string, names: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => names[key] ?? `[${key}]`);
}

export function scaleCase(template: CaseTemplate, players: VerdictPlayer[]): ScaledCase {
  const n = players.length;

  const activeSlotDefs = template.slots
    .filter((s) => s.requiredFrom <= n)
    .slice(0, n);

  const shuffled = shuffle(players);

  const activeSlots: ActiveSlot[] = activeSlotDefs.map((slot, i) => ({
    ...slot,
    assignedPlayerId: shuffled[i].id,
    assignedPlayerName: shuffled[i].name,
    interpolatedPrivateInfo: '',
    interpolatedBelief: '',
    interpolatedRumor: undefined,
  }));

  const nameLookup: Record<string, string> = {};
  activeSlots.forEach((s) => {
    nameLookup[s.id] = s.assignedPlayerName;
  });

  activeSlots.forEach((s) => {
    s.interpolatedPrivateInfo = interpolate(s.privateInfoTemplate, nameLookup);
    s.interpolatedBelief = interpolate(s.beliefTemplate, nameLookup);
    if (s.rumorTemplate) {
      s.interpolatedRumor = interpolate(s.rumorTemplate, nameLookup);
    }
  });

  // Limit rumors to match culprit count so one culprit = one rumor floating around
  const culpritSlots = activeSlots.filter((s) => s.isCulprit);
  const slotsWithRumors = activeSlots.filter((s) => s.interpolatedRumor != null);
  const shuffledRumorSlots = shuffle([...slotsWithRumors]);
  const keepRumorIds = new Set(shuffledRumorSlots.slice(0, culpritSlots.length).map((s) => s.id));
  activeSlots.forEach((s) => {
    if (s.interpolatedRumor != null && !keepRumorIds.has(s.id)) {
      s.interpolatedRumor = undefined;
    }
  });

  // Secret Ally mechanic — 40% chance each round: one innocent witness secretly protects the culprit.
  // This changes the scoring outcome so repeated cases feel different.
  if (Math.random() < 0.4) {
    const candidateSlots = activeSlots.filter(
      (s) =>
        !s.isCulprit &&
        !s.isHelper &&
        !s.isFalseSuspect &&
        (s.scoring.type === 'neutral' || s.scoring.type === 'wants_culprit_convicted'),
    );
    if (candidateSlots.length > 0) {
      const ally = candidateSlots[Math.floor(Math.random() * candidateSlots.length)];
      const culpritName = culpritSlots[0]?.assignedPlayerName ?? 'the culprit';
      ally.roleTitle = `${ally.roleTitle} (Ally)`;
      ally.interpolatedPrivateInfo += ` In truth, you know what ${culpritName} did — and intend to protect them.`;
      ally.objectiveText = `Ensure ${culpritName} is not convicted.`;
      ally.scoring = { type: 'wants_culprit_protected' };
    }
  }

  const culpritSlot = culpritSlots[0]!;
  const helperSlots = activeSlots.filter((s) => s.isHelper);
  const showHelperVote = n >= 6;

  return {
    template: {
      ...template,
      intro: interpolate(template.intro, nameLookup),
      trueTimeline: template.trueTimeline.map((line) => interpolate(line, nameLookup)),
    },
    activeSlots,
    truthCulpritId: culpritSlot.assignedPlayerId,
    truthHelperIds: showHelperVote ? helperSlots.map((s) => s.assignedPlayerId) : [],
    showHelperVote,
  };
}
