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

  const culpritSlot = activeSlots.find((s) => s.isCulprit)!;
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
