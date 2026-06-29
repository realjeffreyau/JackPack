import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { GroupVerdict, PlayerRoundResult, RevealStep, ScaledCase, VerdictPlayer } from '../types';

interface Props {
  revealStep: RevealStep;
  scaledCase: ScaledCase;
  verdict: GroupVerdict;
  roundResults: PlayerRoundResult[];
  players: VerdictPlayer[];
  onNext: () => void;
  onScore: () => void;
}

function VerdictStep({
  verdict,
  scaledCase,
  players,
  onNext,
}: {
  verdict: GroupVerdict;
  scaledCase: ScaledCase;
  players: VerdictPlayer[];
  onNext: () => void;
}) {
  const insets = useSafeAreaInsets();
  const culpritName = verdict.culpritId
    ? players.find((p) => p.id === verdict.culpritId)?.name ?? '?'
    : null;
  const helperName = verdict.helperId
    ? players.find((p) => p.id === verdict.helperId)?.name ?? '?'
    : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>The Jury Has Spoken</Text>

        <View style={[styles.verdictCard, culpritName ? styles.verdictCardGuilty : styles.verdictCardTie]}>
          <Text style={styles.verdictLabel}>CONVICTED</Text>
          <Text style={styles.verdictName}>
            {culpritName ?? 'No conviction — the jury was split'}
          </Text>
        </View>

        {scaledCase.showHelperVote && (
          <View style={[styles.verdictCard, helperName ? styles.verdictCardGuilty : styles.verdictCardTie]}>
            <Text style={styles.verdictLabel}>HELPER IDENTIFIED</Text>
            <Text style={styles.verdictName}>
              {helperName ?? 'No consensus — the jury was split'}
            </Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Reveal the Truth" icon="eye" color={colors.yellow} onPress={onNext} />
      </View>
    </View>
  );
}

function TruthStep({
  scaledCase,
  verdict,
  players,
  onNext,
  onScore,
}: {
  scaledCase: ScaledCase;
  verdict: GroupVerdict;
  players: VerdictPlayer[];
  onNext: () => void;
  onScore: () => void;
}) {
  const insets = useSafeAreaInsets();
  const culpritName = players.find((p) => p.id === scaledCase.truthCulpritId)?.name ?? '?';
  const helperNames = scaledCase.truthHelperIds
    .map((id) => players.find((p) => p.id === id)?.name ?? '?')
    .join(', ');

  function handle() {
    onScore();
    onNext();
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>The Real Story</Text>

        <View style={[styles.culpritReveal]}>
          <Text style={styles.culpritLabel}>The real culprit was</Text>
          <Text style={[styles.culpritName, { color: colors.yellow }]}>{culpritName}</Text>
        </View>

        {scaledCase.showHelperVote && scaledCase.truthHelperIds.length > 0 && (
          <View style={styles.helperReveal}>
            <Text style={styles.helperLabel}>Their helper</Text>
            <Text style={styles.helperName}>{helperNames}</Text>
          </View>
        )}

        <View style={styles.timelineBox}>
          <Text style={styles.timelineTitle}>What actually happened</Text>
          {scaledCase.template.trueTimeline.map((line, i) => (
            <View key={i} style={styles.timelineRow}>
              <Text style={styles.timelineNum}>{i + 1}</Text>
              <Text style={styles.timelineLine}>{line}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="See Everyone's Fate" icon="arrow-forward" color={colors.yellow} onPress={handle} />
      </View>
    </View>
  );
}

function PlayerResultsStep({
  roundResults,
  players,
  onNext,
}: {
  roundResults: PlayerRoundResult[];
  players: VerdictPlayer[];
  onNext: () => void;
}) {
  const insets = useSafeAreaInsets();

  const sorted = [...roundResults].sort((a, b) => {
    const slotOrder = (r: PlayerRoundResult) => {
      if (r.roleTitle.toLowerCase().includes('thief') || r.roleTitle.toLowerCase().includes('saboteur') || r.roleTitle.toLowerCase().includes('culprit') || r.roleTitle.toLowerCase().includes('leaker') || r.roleTitle.toLowerCase().includes('cheat') || r.roleTitle.toLowerCase().includes('pirate') || r.roleTitle.toLowerCase().includes('spoiler') || r.roleTitle.toLowerCase().includes('toppler') || r.roleTitle.toLowerCase().includes('exam') || r.roleTitle.toLowerCase().includes('heist') || r.roleTitle.toLowerCase().includes('thef') || r.roleTitle.toLowerCase().includes('ransom') || r.roleTitle.toLowerCase().includes('prank') || r.roleTitle.toLowerCase().includes('liberator') || r.roleTitle.toLowerCase().includes('changer') || r.roleTitle.toLowerCase().includes('suppressor')) return 0;
      if (r.roleTitle.toLowerCase().includes('lookout') || r.roleTitle.toLowerCase().includes('accomplice') || r.roleTitle.toLowerCase().includes('distract') || r.roleTitle.toLowerCase().includes('cover') || r.roleTitle.toLowerCase().includes('alibi') || r.roleTitle.toLowerCase().includes('access') || r.roleTitle.toLowerCase().includes('hat maker') || r.roleTitle.toLowerCase().includes('getaway') || r.roleTitle.toLowerCase().includes('petworld') || r.roleTitle.toLowerCase().includes('remote') || r.roleTitle.toLowerCase().includes('sympathetic') || r.roleTitle.toLowerCase().includes('provider') || r.roleTitle.toLowerCase().includes('anonymous')) return 1;
      return 2;
    };
    return slotOrder(a) - slotOrder(b);
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Everyone's Fate</Text>
        {sorted.map((result) => (
          <View
            key={result.playerId}
            style={[styles.resultCard, result.succeeded ? styles.resultSuccess : styles.resultFail]}
          >
            <View style={styles.resultHeader}>
              <View>
                <Text style={styles.resultName}>{result.playerName}</Text>
                <Text style={styles.resultRole}>{result.roleTitle}</Text>
              </View>
              <View style={[styles.badge, result.succeeded ? styles.badgeSuccess : styles.badgeFail]}>
                <Text style={styles.badgeText}>{result.succeeded ? 'SUCCESS' : 'FAILED'}</Text>
              </View>
            </View>
            <Text style={styles.resultObjective}>{result.objectiveText}</Text>
            <View style={styles.resultFooter}>
              <Text style={[styles.points, { color: result.pointsChange >= 0 ? colors.success : colors.danger }]}>
                {result.pointsChange >= 0 ? '+' : ''}{result.pointsChange} Credibility
              </Text>
              <Text style={styles.reason}>{result.reason}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="See Scoreboard" icon="trophy" color={colors.yellow} onPress={onNext} />
      </View>
    </View>
  );
}

export function Reveal({ revealStep, scaledCase, verdict, roundResults, players, onNext, onScore }: Props) {
  if (revealStep === 'verdict') {
    return <VerdictStep verdict={verdict} scaledCase={scaledCase} players={players} onNext={onNext} />;
  }
  if (revealStep === 'truth') {
    return <TruthStep scaledCase={scaledCase} verdict={verdict} players={players} onNext={onNext} onScore={onScore} />;
  }
  return <PlayerResultsStep roundResults={roundResults} players={players} onNext={onNext} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  scroll: { paddingBottom: spacing.xl, gap: spacing.lg },
  header: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  verdictCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  verdictCardGuilty: {
    backgroundColor: colors.yellow + '18',
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  verdictCardTie: {
    backgroundColor: colors.bgElevated,
    borderWidth: 2,
    borderColor: colors.border,
  },
  verdictLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verdictName: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.yellow,
    textAlign: 'center',
  },
  culpritReveal: {
    alignItems: 'center',
    backgroundColor: colors.yellow + '18',
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: colors.yellow,
  },
  culpritLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  culpritName: {
    fontFamily: fonts.display,
    fontSize: 38,
    textAlign: 'center',
  },
  helperReveal: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  helperLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textFaint,
  },
  helperName: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.text,
  },
  timelineBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  timelineTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  timelineNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.yellow,
    width: 20,
    marginTop: 2,
  },
  timelineLine: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  resultCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: colors.success + '0F',
    borderColor: colors.success + '44',
  },
  resultFail: {
    backgroundColor: colors.danger + '0F',
    borderColor: colors.danger + '33',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultName: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
  },
  resultRole: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeSuccess: { backgroundColor: colors.success + '22' },
  badgeFail: { backgroundColor: colors.danger + '22' },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultObjective: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  resultFooter: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  points: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  reason: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textFaint,
  },
  footer: { paddingTop: spacing.md },
});
