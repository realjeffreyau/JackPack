import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { GameEngineProps } from '../../types/game';
import { SMILE_PROMPTS } from '../../data/drinkIfYouSmile';
import { useDeck } from '../../utils/deck';
import { loadRecentPrompts, recordUsedPrompt } from '../../utils/smilePromptHistory';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { CountdownDisplay } from '../../components/CountdownDisplay';
import { colors, fonts, radius, spacing } from '../../theme/theme';
import { PlayerSetup } from './components/PlayerSetup';
import { PrivacyGate } from './components/PrivacyGate';

// Pool must stay large enough for useDeck to feel varied — fall back to the
// full bank if filtering by recent history would leave too few prompts.
const MIN_POOL_SIZE = 40;

type Phase =
  | 'player_setup'
  | 'game_setup'
  | 'turn_intro'
  | 'card_reveal'
  | 'acting'
  | 'verdict'
  | 'turn_result'
  | 'game_over';

type WinMode = 'points' | 'survival';

interface Player {
  id: string;
  name: string;
  score: number;
  drinks: number;
}

interface Outcome {
  actorName: string;
  targetName: string;
  cracked: boolean;
}

const MIN_POINTS = 3;
const MAX_POINTS = 10;
const MIN_TIMER = 15;
const MAX_TIMER = 60;
const TIMER_STEP = 15;

export function DrinkIfYouSmileEngine({ onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('player_setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [prevNames, setPrevNames] = useState<string[] | undefined>(undefined);

  const [pointsTarget, setPointsTarget] = useState(7);
  const [timerSec, setTimerSec] = useState(30);
  const [winMode, setWinMode] = useState<WinMode>('points');

  const [actorIndex, setActorIndex] = useState(0);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const [recentHistory, setRecentHistory] = useState<string[]>([]);
  useEffect(() => {
    loadRecentPrompts().then(setRecentHistory);
  }, []);

  const promptPool = useMemo(() => {
    const filtered = SMILE_PROMPTS.filter((p) => !recentHistory.includes(p));
    return filtered.length >= MIN_POOL_SIZE ? filtered : SMILE_PROMPTS;
  }, [recentHistory]);

  const drawPrompt = useDeck(promptPool);

  const actor = players[actorIndex];
  const target = players.find((p) => p.id === targetId) ?? null;

  useEffect(() => {
    if (phase !== 'acting') return undefined;
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'acting' && timeLeft === 0) {
      setPhase('verdict');
    }
  }, [phase, timeLeft]);

  function handlePlayersDone(names: string[]) {
    setPrevNames(names);
    setPlayers(names.map((name, i) => ({ id: `player_${i}`, name, score: 0, drinks: 0 })));
    setPhase('game_setup');
  }

  function handleStartGame() {
    setActorIndex(0);
    setPhase('turn_intro');
  }

  function handleRevealed() {
    const drawn = drawPrompt();
    setPrompt(drawn);
    recordUsedPrompt(drawn);
    setTargetId(null);
    setPhase('card_reveal');
  }

  function handleStartActing() {
    setTimeLeft(timerSec);
    setPhase('acting');
  }

  function handleVerdict(cracked: boolean) {
    if (!actor || !target) return;
    const next = players.map((p) => {
      if (cracked && p.id === target.id) return { ...p, drinks: p.drinks + 1 };
      if (cracked && p.id === actor.id) return { ...p, score: p.score + 1 };
      if (!cracked && p.id === actor.id) return { ...p, drinks: p.drinks + 1 };
      if (!cracked && p.id === target.id) return { ...p, score: p.score + 1 };
      return p;
    });
    setOutcome({ actorName: actor.name, targetName: target.name, cracked });
    setPlayers(next);

    if (winMode === 'points') {
      const winner = next.find((p) => p.score >= pointsTarget);
      if (winner) {
        setPhase('game_over');
        return;
      }
    }
    setPhase('turn_result');
  }

  function nextTurn() {
    setActorIndex((i) => (i + 1) % players.length);
    setTargetId(null);
    setOutcome(null);
    setPhase('turn_intro');
  }

  function endGameNow() {
    setPhase('game_over');
  }

  function playAgain() {
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0, drinks: 0 })));
    setActorIndex(0);
    setTargetId(null);
    setOutcome(null);
    setPhase('game_setup');
  }

  const insets = useSafeAreaInsets();
  const topPad = insets.top + spacing.md;
  const bottomPad = insets.bottom + spacing.lg;

  if (phase === 'player_setup') {
    return <PlayerSetup onDone={handlePlayersDone} onExit={onExit} initialNames={prevNames} />;
  }

  if (phase === 'game_setup') {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={[styles.title, styles.topBarPad]}>Drink if You Smile</Text>
        <Text style={styles.sub}>Set the rules before you start.</Text>

        <View style={styles.modeRow}>
          <Pressable
            onPress={() => setWinMode('points')}
            style={[styles.modeBtn, winMode === 'points' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeLabel, winMode === 'points' && styles.modeLabelActive]}>Race to points</Text>
          </Pressable>
          <Pressable
            onPress={() => setWinMode('survival')}
            style={[styles.modeBtn, winMode === 'survival' && styles.modeBtnActive]}
          >
            <Text style={[styles.modeLabel, winMode === 'survival' && styles.modeLabelActive]}>Last one sober</Text>
          </Pressable>
        </View>

        {winMode === 'points' && (
          <Stepper
            label="Points to win"
            value={pointsTarget}
            accent={colors.orange}
            onDecrement={() => setPointsTarget((v) => Math.max(MIN_POINTS, v - 1))}
            onIncrement={() => setPointsTarget((v) => Math.min(MAX_POINTS, v + 1))}
            canDecrement={pointsTarget > MIN_POINTS}
            canIncrement={pointsTarget < MAX_POINTS}
          />
        )}

        <View style={{ height: spacing.md }} />

        <Stepper
          label="Act-out timer"
          value={timerSec}
          display={`${timerSec}s`}
          accent={colors.orange}
          onDecrement={() => setTimerSec((v) => Math.max(MIN_TIMER, v - TIMER_STEP))}
          onIncrement={() => setTimerSec((v) => Math.min(MAX_TIMER, v + TIMER_STEP))}
          canDecrement={timerSec > MIN_TIMER}
          canIncrement={timerSec < MAX_TIMER}
        />

        <View style={styles.spacer} />
        <PrimaryButton label="Start Game" icon="play" color={colors.orange} onPress={handleStartGame} />
      </View>
    );
  }

  if (phase === 'turn_intro' && actor) {
    return <PrivacyGate playerName={actor.name} context="It's your turn to act!" onReveal={handleRevealed} />;
  }

  if (phase === 'card_reveal' && actor) {
    const others = players.filter((p) => p.id !== actor.id);
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={[styles.eyebrow, styles.topBarPad]}>YOUR SECRET CARD</Text>
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>
        <Text style={styles.sub}>Pick your target — you have {timerSec}s to make them laugh.</Text>
        <View style={styles.targetList}>
          {others.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setTargetId(p.id)}
              style={[styles.targetChip, targetId === p.id && styles.targetChipActive]}
            >
              <Text style={[styles.targetLabel, targetId === p.id && styles.targetLabelActive]}>{p.name}</Text>
              {targetId === p.id && <Ionicons name="checkmark-circle" size={18} color={colors.orange} />}
            </Pressable>
          ))}
        </View>
        <View style={styles.spacer} />
        <PrimaryButton
          label="Start Acting"
          icon="play"
          color={colors.orange}
          onPress={handleStartActing}
          disabled={!targetId}
        />
      </View>
    );
  }

  if (phase === 'acting' && actor && target) {
    return (
      <View style={[styles.root, styles.centerAll, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={styles.actingPrompt}>Make {target.name} laugh!</Text>
        <View style={{ height: spacing.xl }} />
        <CountdownDisplay timeLeft={timeLeft} total={timerSec} animate />
        <View style={{ height: spacing.xxl }} />
        <PrimaryButton label="Done Early" variant="outline" onPress={() => setPhase('verdict')} />
      </View>
    );
  }

  if (phase === 'verdict' && actor && target) {
    return (
      <View style={[styles.root, styles.centerAll, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={styles.title}>Did {target.name} crack?</Text>
        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="They cracked 😂" color={colors.success} onPress={() => handleVerdict(true)} style={styles.verdictBtn} />
        <PrimaryButton label="Stone cold 😐" color={colors.danger} onPress={() => handleVerdict(false)} style={styles.verdictBtn} />
      </View>
    );
  }

  if (phase === 'turn_result' && outcome) {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={[styles.title, styles.topBarPad]}>
          {outcome.cracked ? `${outcome.targetName} drinks!` : `${outcome.actorName} drinks!`}
        </Text>
        <Text style={styles.sub}>
          {outcome.cracked ? `${outcome.actorName} gets a point.` : `${outcome.targetName} gets a point.`}
        </Text>
        <View style={styles.scoreList}>
          {sorted.map((p) => (
            <View key={p.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{p.name}</Text>
              <Text style={styles.scoreValue}>{p.score} pts · 🍺 {p.drinks}</Text>
            </View>
          ))}
        </View>
        <View style={styles.spacer} />
        <PrimaryButton label="Next Turn" icon="arrow-forward" color={colors.orange} onPress={nextTurn} />
        {winMode === 'survival' && (
          <PrimaryButton label="End Game" variant="ghost" color={colors.textFaint} onPress={endGameNow} style={styles.endBtn} />
        )}
      </View>
    );
  }

  if (phase === 'game_over') {
    const sorted = [...players].sort((a, b) =>
      winMode === 'points' ? b.score - a.score : a.drinks - b.drinks
    );
    const winnerValue = winMode === 'points' ? sorted[0]?.score : sorted[0]?.drinks;
    const winners = sorted.filter((p) => (winMode === 'points' ? p.score : p.drinks) === winnerValue);

    return (
      <View style={[styles.root, styles.centerAll, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Ionicons name="trophy" size={56} color={colors.yellow} />
        <Text style={styles.overTitle}>Game Over</Text>
        <Text style={styles.sub}>
          {winMode === 'points' ? 'Winner: ' : 'Last one sober: '}
          {winners.map((w) => w.name).join(' & ')}
        </Text>
        <View style={styles.scoreList}>
          {sorted.map((p) => (
            <View key={p.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{p.name}</Text>
              <Text style={styles.scoreValue}>{p.score} pts · 🍺 {p.drinks}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Play Again" icon="refresh" color={colors.orange} onPress={playAgain} />
        <PrimaryButton label="Back to Games" variant="ghost" color={colors.textMuted} onPress={onExit} style={styles.endBtn} />
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
    textAlign: 'center',
  },
  overTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    marginTop: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.orange,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  spacer: {
    flex: 1,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orange + '18',
  },
  modeLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textFaint,
  },
  modeLabelActive: {
    color: colors.text,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.orange + '55',
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  promptText: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 27,
    color: colors.text,
    textAlign: 'center',
  },
  targetList: {
    gap: spacing.sm,
  },
  targetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  targetChipActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orange + '18',
  },
  targetLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textFaint,
  },
  targetLabelActive: {
    color: colors.text,
  },
  actingPrompt: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
  },
  verdictBtn: {
    marginBottom: spacing.md,
    width: '100%',
  },
  scoreList: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  scoreName: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  scoreValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  endBtn: {
    marginTop: spacing.sm,
  },
});
