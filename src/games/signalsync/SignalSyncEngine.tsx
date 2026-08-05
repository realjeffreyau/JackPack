import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GameEngineProps } from '../../types/game';
import {
  SIGNAL_SYNC_PROMPTS,
  type Spectrum,
  type SignalSyncPack,
} from '../../data/signalSyncPrompts';
import { useDeck } from '../../utils/deck';
import {
  loadRecentSpectrumIds,
  recordUsedSpectrumIds,
  recordSignalSyncResult,
} from '../../utils/signalSyncStorage';
import { BackButton } from '../../components/BackButton';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Toggle } from '../../components/Toggle';
import { colors, fonts, radius, spacing } from '../../theme/theme';
import {
  MAX_ROUND_POINTS,
  randomTarget,
  ratingFor,
  reactionFor,
  scoreGuess,
} from './scoring';
import { PlayerSetup } from './components/PlayerSetup';
import { HoldPrimaryButton } from './components/HoldPrimaryButton';
import { SignalSyncDial } from './components/SignalSyncDial';

type Phase =
  | 'player_setup'
  | 'game_setup'
  | 'role_intro'
  | 'target_reveal'
  | 'pass_phone'
  | 'guessing'
  | 'result_reveal'
  | 'round_summary'
  | 'game_over';

type RoundsMode = 5 | 10 | 15 | 'endless';
type PackMode = SignalSyncPack | 'mixed';
type ClueMode = 'spoken' | 'typed';

const MIN_POOL_SIZE = 15;
const PACKS: { label: string; value: PackMode }[] = [
  { label: 'General', value: 'general' },
  { label: 'Couples', value: 'couples' },
  { label: 'Funny', value: 'funny' },
  { label: 'Deep', value: 'deep' },
  { label: 'Spicy', value: 'spicy' },
  { label: 'Mixed', value: 'mixed' },
];
const ROUND_OPTIONS: { label: string; value: RoundsMode }[] = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '∞', value: 'endless' },
];

function poolFor(pack: PackMode, recentHistory: string[]): Spectrum[] {
  const packPool = SIGNAL_SYNC_PROMPTS.filter(
    (spectrum) => pack === 'mixed' || spectrum.pack === pack,
  );
  const filtered = packPool.filter((spectrum) => !recentHistory.includes(spectrum.id));
  return filtered.length >= MIN_POOL_SIZE ? filtered : packPool;
}

interface SegmentedProps<T extends string | number> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

function Segmented<T extends string | number>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.segment,
              selected && styles.segmentActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text style={[styles.segmentLabel, selected && styles.segmentLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SignalSyncEngine({ onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('player_setup');
  const [players, setPlayers] = useState<[string, string]>(['', '']);
  const [prevNames, setPrevNames] = useState<string[] | undefined>(undefined);
  const [roundsMode, setRoundsMode] = useState<RoundsMode>(5);
  const [pack, setPack] = useState<PackMode>('general');
  const [alternateRoles, setAlternateRoles] = useState(true);
  const [clueMode, setClueMode] = useState<ClueMode>('spoken');
  const [samePromptAllGame, setSamePromptAllGame] = useState(false);
  const [giverIndex, setGiverIndex] = useState<0 | 1>(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [typedClue, setTypedClue] = useState('');
  const [spectrum, setSpectrum] = useState<Spectrum | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [guess, setGuess] = useState(50);
  const [roundPoints, setRoundPoints] = useState<number | null>(null);
  const [perfectCount, setPerfectCount] = useState(0);
  const [usedSpectrumIds, setUsedSpectrumIds] = useState<string[]>([]);
  const [recentHistory, setRecentHistory] = useState<string[]>([]);
  const didRecordGame = useRef(false);

  useEffect(() => {
    loadRecentSpectrumIds().then(setRecentHistory);
  }, []);

  const generalPool = useMemo(() => poolFor('general', recentHistory), [recentHistory]);
  const couplesPool = useMemo(() => poolFor('couples', recentHistory), [recentHistory]);
  const funnyPool = useMemo(() => poolFor('funny', recentHistory), [recentHistory]);
  const deepPool = useMemo(() => poolFor('deep', recentHistory), [recentHistory]);
  const spicyPool = useMemo(() => poolFor('spicy', recentHistory), [recentHistory]);
  const mixedPool = useMemo(() => poolFor('mixed', recentHistory), [recentHistory]);
  const drawGeneral = useDeck(generalPool);
  const drawCouples = useDeck(couplesPool);
  const drawFunny = useDeck(funnyPool);
  const drawDeep = useDeck(deepPool);
  const drawSpicy = useDeck(spicyPool);
  const drawMixed = useDeck(mixedPool);

  useEffect(() => {
    if (phase !== 'target_reveal') return;
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') setPhase('pass_phone');
    });
    return () => subscription.remove();
  }, [phase]);

  useEffect(() => {
    if (phase !== 'game_over' || didRecordGame.current) return;
    didRecordGame.current = true;
    const max = roundNumber * MAX_ROUND_POINTS;
    recordSignalSyncResult(totalScore, max);
    recordUsedSpectrumIds(usedSpectrumIds);
  }, [phase, roundNumber, totalScore, usedSpectrumIds]);

  const insets = useSafeAreaInsets();
  const topPad = insets.top + spacing.md;
  const bottomPad = insets.bottom + spacing.lg;
  const giver = players[giverIndex];
  const guesser = players[giverIndex === 0 ? 1 : 0];

  function drawSpectrum(): Spectrum {
    switch (pack) {
      case 'general': return drawGeneral();
      case 'couples': return drawCouples();
      case 'funny': return drawFunny();
      case 'deep': return drawDeep();
      case 'spicy': return drawSpicy();
      case 'mixed': return drawMixed();
    }
  }

  function prepareRound() {
    if (!samePromptAllGame || spectrum === null) {
      setSpectrum(drawSpectrum());
    }
    setTarget(randomTarget());
    setGuess(50);
    setRoundPoints(null);
    setTypedClue('');
  }

  function handlePlayersDone(names: [string, string]) {
    setPlayers(names);
    setPrevNames(names);
    setPhase('game_setup');
  }

  function startGame() {
    didRecordGame.current = false;
    setGiverIndex(0);
    setRoundNumber(1);
    setTotalScore(0);
    setPerfectCount(0);
    setUsedSpectrumIds([]);
    prepareRound();
    setPhase('role_intro');
  }

  function lockGuess() {
    if (target === null || spectrum === null) return;
    const points = scoreGuess(guess, target);
    setRoundPoints(points);
    setTotalScore((score) => score + points);
    if (points === MAX_ROUND_POINTS) setPerfectCount((count) => count + 1);
    setUsedSpectrumIds((ids) => [...ids, spectrum.id]);
    setPhase('result_reveal');
  }

  function nextRound() {
    if (roundsMode !== 'endless' && roundNumber >= roundsMode) {
      setPhase('game_over');
      return;
    }
    setRoundNumber((round) => round + 1);
    if (alternateRoles) setGiverIndex((index) => (index === 0 ? 1 : 0));
    prepareRound();
    setPhase('role_intro');
  }

  function playAgain() {
    didRecordGame.current = false;
    setRoundNumber(1);
    setTotalScore(0);
    setPerfectCount(0);
    setUsedSpectrumIds([]);
    setSpectrum(null);
    setTarget(null);
    setGuess(50);
    setRoundPoints(null);
    setTypedClue('');
    setPhase('game_setup');
  }

  const rootStyle = [styles.root, { paddingTop: topPad, paddingBottom: bottomPad }];

  if (phase === 'player_setup') {
    return <PlayerSetup onDone={handlePlayersDone} onExit={onExit} initialNames={prevNames} />;
  }

  if (phase === 'game_setup') {
    return (
      <View style={rootStyle}>
        <Text style={[styles.title, styles.topBarPad]}>Signal Sync</Text>
        <Text style={styles.sub}>Choose how you want to play.</Text>
        <ScrollView contentContainerStyle={styles.setupContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>ROUNDS</Text>
          <Segmented options={ROUND_OPTIONS} value={roundsMode} onChange={setRoundsMode} />
          <Text style={styles.sectionLabel}>PACK</Text>
          <Segmented options={PACKS} value={pack} onChange={setPack} />
          <Text style={styles.sectionLabel}>OPTIONS</Text>
          <View style={styles.options}>
            <Toggle
              label="Alternate roles each round"
              value={alternateRoles}
              accent={colors.cyan}
              onValueChange={setAlternateRoles}
            />
            <Toggle
              label="Type the clue instead of saying it"
              value={clueMode === 'typed'}
              accent={colors.cyan}
              onValueChange={(typed) => setClueMode(typed ? 'typed' : 'spoken')}
            />
            <Toggle
              label="Use the same prompt for the whole game"
              value={samePromptAllGame}
              accent={colors.cyan}
              onValueChange={setSamePromptAllGame}
            />
          </View>
        </ScrollView>
        <PrimaryButton label="Start Game" icon="play" color={colors.cyan} onPress={startGame} />
        <BackButton onPress={() => setPhase('player_setup')} />
      </View>
    );
  }

  if (phase === 'role_intro') {
    return (
      <View style={[...rootStyle, styles.centerAll]}>
        <Text style={styles.eyebrow}>CLUE GIVER</Text>
        <Text style={styles.heroTitle}>{giver} is the Clue Giver</Text>
        <Text style={styles.sub}>{guesser}, look away!</Text>
        <View style={styles.spacer} />
        <PrimaryButton
          label="I'm ready to see the target"
          icon="eye"
          color={colors.cyan}
          onPress={() => setPhase('target_reveal')}
        />
        {roundNumber === 1 && <BackButton onPress={() => setPhase('game_setup')} />}
      </View>
    );
  }

  if (phase === 'target_reveal' && spectrum && target !== null) {
    return (
      <ScrollView
        style={styles.scrollRoot}
        contentContainerStyle={[styles.scrollScreen, { paddingTop: topPad, paddingBottom: bottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.eyebrow, styles.topBarPad]}>YOUR SECRET TARGET</Text>
        <View style={styles.dialWrap}>
          <SignalSyncDial
            target={target}
            guess={target}
            interactive={false}
            revealBands={true}
            leftLabel={spectrum.leftLabel}
            rightLabel={spectrum.rightLabel}
          />
        </View>
        <Text style={styles.privacy}>Don't let {guesser} see this!</Text>
        {clueMode === 'typed' && (
          <TextInput
            style={styles.clueInput}
            value={typedClue}
            onChangeText={setTypedClue}
            placeholder="Type your clue…"
            placeholderTextColor={colors.textFaint}
            maxLength={80}
            accessibilityLabel="Clue"
          />
        )}
        <View style={styles.spacer} />
        <HoldPrimaryButton
          label="Hide target & pass phone"
          icon="phone-portrait"
          color={colors.cyan}
          disabled={clueMode === 'typed' && !typedClue.trim()}
          onConfirm={() => setPhase('pass_phone')}
        />
      </ScrollView>
    );
  }

  if (phase === 'pass_phone') {
    return (
      <View style={[...rootStyle, styles.centerAll]}>
        <Text style={styles.eyebrow}>TARGET HIDDEN</Text>
        <Text style={styles.heroTitle}>Pass the phone to {guesser}</Text>
        <Text style={styles.sub}>The secret is safely hidden.</Text>
        <View style={styles.spacer} />
        <PrimaryButton
          label="Start Guessing"
          icon="navigate"
          color={colors.cyan}
          onPress={() => {
            setGuess(50);
            setPhase('guessing');
          }}
        />
      </View>
    );
  }

  if (phase === 'guessing' && spectrum) {
    return (
      <View style={rootStyle}>
        <Text style={[styles.eyebrow, styles.topBarPad]}>FIND THE SIGNAL</Text>
        {clueMode === 'spoken' ? (
          <Text style={styles.nudge}>Think about {giver}'s clue…</Text>
        ) : (
          <View style={styles.clueCard}>
            <Text style={styles.clueText}>{typedClue}</Text>
          </View>
        )}
        <View style={styles.dialWrap}>
          <SignalSyncDial
            target={null}
            guess={guess}
            interactive={true}
            onGuessChange={setGuess}
            revealBands={false}
            leftLabel={spectrum.leftLabel}
            rightLabel={spectrum.rightLabel}
          />
        </View>
        <View style={styles.spacer} />
        <HoldPrimaryButton label="Lock In Guess" icon="lock-closed" color={colors.cyan} onConfirm={lockGuess} />
      </View>
    );
  }

  if (phase === 'result_reveal' && spectrum && target !== null && roundPoints !== null) {
    return (
      <View style={rootStyle}>
        <Text style={[styles.eyebrow, styles.topBarPad]}>RESULT</Text>
        <View style={styles.dialWrap}>
          <SignalSyncDial
            target={target}
            guess={guess}
            interactive={false}
            revealBands={true}
            leftLabel={spectrum.leftLabel}
            rightLabel={spectrum.rightLabel}
          />
        </View>
        <Text style={styles.reaction}>{reactionFor(roundPoints)}</Text>
        <Text style={styles.points}>+{roundPoints} points</Text>
        <View style={styles.spacer} />
        <HoldPrimaryButton label="Continue" icon="arrow-forward" color={colors.cyan} onConfirm={() => setPhase('round_summary')} />
      </View>
    );
  }

  if (phase === 'round_summary' && roundPoints !== null) {
    const roundLabel = roundsMode === 'endless'
      ? `Round ${roundNumber}`
      : `Round ${roundNumber} of ${roundsMode}`;
    return (
      <View style={[...rootStyle, styles.centerAll]}>
        <Text style={styles.eyebrow}>{roundLabel.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>{roundPoints} points this round</Text>
        <Text style={styles.runningScore}>{totalScore} total points</Text>
        <View style={styles.spacer} />
        <HoldPrimaryButton label="Next Round" icon="arrow-forward" color={colors.cyan} onConfirm={nextRound} />
        {roundsMode === 'endless' && (
          <PrimaryButton
            label="End Game"
            variant="ghost"
            color={colors.textMuted}
            onPress={() => setPhase('game_over')}
            style={styles.secondaryButton}
          />
        )}
      </View>
    );
  }

  if (phase === 'game_over') {
    const max = roundNumber * MAX_ROUND_POINTS;
    const accuracy = max > 0 ? totalScore / max : 0;
    return (
      <View style={[...rootStyle, styles.centerAll]}>
        <Text style={styles.eyebrow}>FINAL SCORE</Text>
        <Text style={styles.finalScore}>{totalScore} / {max}</Text>
        <Text style={styles.heroTitle}>{ratingFor(accuracy)}</Text>
        <Text style={styles.runningScore}>{Math.round(accuracy * 100)}% accuracy</Text>
        <Text style={styles.sub}>{perfectCount} perfect round{perfectCount === 1 ? '' : 's'}</Text>
        <View style={styles.spacer} />
        <PrimaryButton label="Play Again" icon="refresh" color={colors.cyan} onPress={playAgain} />
        <PrimaryButton
          label="Back to Games"
          variant="ghost"
          color={colors.textMuted}
          onPress={onExit}
          style={styles.secondaryButton}
        />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  scrollRoot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollScreen: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarPad: {
    paddingLeft: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  eyebrow: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.cyan,
  },
  sectionLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.cyan,
  },
  setupContent: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  options: {
    gap: spacing.sm,
  },
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flexGrow: 1,
    minWidth: 44,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.cyan,
  },
  segmentPressed: {
    opacity: 0.7,
  },
  segmentLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.bg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xl,
  },
  privacy: {
    fontFamily: fonts.bodyExtra,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  clueInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.text,
    marginTop: spacing.lg,
  },
  clueCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  clueText: {
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
  },
  nudge: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  dialWrap: {
    marginTop: spacing.xl,
  },
  reaction: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  points: {
    fontFamily: fonts.bodyExtra,
    fontSize: 20,
    color: colors.cyan,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  runningScore: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.cyan,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  finalScore: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.cyan,
    marginTop: spacing.md,
  },
  secondaryButton: {
    marginTop: spacing.sm,
  },
});
