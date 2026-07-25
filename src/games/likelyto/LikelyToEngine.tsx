import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { GameEngineProps } from '../../types/game';
import { LIKELY_TO_PROMPTS } from '../../data/likelyTo';
import { useDeck } from '../../utils/deck';
import { loadRecentPrompts, recordUsedPrompt } from '../../utils/likelyToPromptHistory';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Stepper } from '../../components/Stepper';
import { BackButton } from '../../components/BackButton';
import { colors, fonts, radius, spacing } from '../../theme/theme';
import { PlayerSetup } from './components/PlayerSetup';

type Phase = 'player_setup' | 'game_setup' | 'judge_intro' | 'round_play' | 'round_result' | 'game_over';

interface Player {
  id: string;
  name: string;
  cards: number;
}

const MIN_CARDS = 3;
const MAX_CARDS = 10;
const MIN_POOL_SIZE = 30;

export function LikelyToEngine({ onExit }: GameEngineProps) {
  const [phase, setPhase] = useState<Phase>('player_setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [prevNames, setPrevNames] = useState<string[] | undefined>(undefined);

  const [cardsToLose, setCardsToLose] = useState(7);
  const [judgeIndex, setJudgeIndex] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastAwarded, setLastAwarded] = useState<{ name: string } | null>(null);

  const [recentHistory, setRecentHistory] = useState<string[]>([]);
  useEffect(() => {
    loadRecentPrompts().then(setRecentHistory);
  }, []);

  const promptPool = useMemo(() => {
    const filtered = LIKELY_TO_PROMPTS.filter((p) => !recentHistory.includes(p));
    return filtered.length >= MIN_POOL_SIZE ? filtered : LIKELY_TO_PROMPTS;
  }, [recentHistory]);

  const drawPrompt = useDeck(promptPool);

  const judge = players[judgeIndex];
  const gameJustStarted = players.every((p) => p.cards === 0);

  const insets = useSafeAreaInsets();
  const topPad = insets.top + spacing.md;
  const bottomPad = insets.bottom + spacing.lg;

  function handlePlayersDone(names: string[]) {
    setPrevNames(names);
    setPlayers(names.map((name, i) => ({ id: `player_${i}`, name, cards: 0 })));
    setPhase('game_setup');
  }

  function handleStartGame() {
    setJudgeIndex(0);
    setPhase('judge_intro');
  }

  function handleDrawCard() {
    const drawn = drawPrompt();
    setPrompt(drawn);
    recordUsedPrompt(drawn);
    setSelectedId(null);
    setPhase('round_play');
  }

  function handleAward() {
    if (!selectedId) return;
    const awarded = players.find((p) => p.id === selectedId);
    if (!awarded) return;
    const next = players.map((p) => (p.id === selectedId ? { ...p, cards: p.cards + 1 } : p));
    setPlayers(next);
    setLastAwarded({ name: awarded.name });

    const loser = next.find((p) => p.cards >= cardsToLose);
    setPhase(loser ? 'game_over' : 'round_result');
  }

  function nextRound() {
    setJudgeIndex((i) => (i + 1) % players.length);
    setPrompt('');
    setSelectedId(null);
    setLastAwarded(null);
    setPhase('judge_intro');
  }

  function playAgain() {
    setPlayers((prev) => prev.map((p) => ({ ...p, cards: 0 })));
    setJudgeIndex(0);
    setPrompt('');
    setSelectedId(null);
    setLastAwarded(null);
    setPhase('game_setup');
  }

  if (phase === 'player_setup') {
    return <PlayerSetup onDone={handlePlayersDone} onExit={onExit} initialNames={prevNames} />;
  }

  if (phase === 'game_setup') {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={[styles.title, styles.topBarPad]}>Likely To</Text>
        <Text style={styles.sub}>Set the target before you start.</Text>

        <Stepper
          label="Cards to lose"
          value={cardsToLose}
          accent={colors.primary}
          onDecrement={() => setCardsToLose((v) => Math.max(MIN_CARDS, v - 1))}
          onIncrement={() => setCardsToLose((v) => Math.min(MAX_CARDS, v + 1))}
          canDecrement={cardsToLose > MIN_CARDS}
          canIncrement={cardsToLose < MAX_CARDS}
        />

        <View style={styles.spacer} />
        <PrimaryButton label="Start Game" icon="play" color={colors.primary} onPress={handleStartGame} />
        <BackButton onPress={() => setPhase('player_setup')} />
      </View>
    );
  }

  if (phase === 'judge_intro' && judge) {
    return (
      <View style={[styles.root, styles.centerAll, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Ionicons name="hammer" size={48} color={colors.primary} />
        <Text style={styles.eyebrow}>PASS THE PHONE TO THE JUDGE</Text>
        <Text style={styles.judgeName}>{judge.name}</Text>
        <Text style={styles.sub}>Draw a card, read it out loud, and let the group argue.</Text>
        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Draw Card" icon="albums" color={colors.primary} onPress={handleDrawCard} />
        {gameJustStarted && <BackButton onPress={() => setPhase('game_setup')} />}
      </View>
    );
  }

  if (phase === 'round_play' && judge) {
    const others = players.filter((p) => p.id !== judge.id);
    const selected = players.find((p) => p.id === selectedId);
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={[styles.eyebrow, styles.topBarPad]}>MOST LIKELY TO</Text>
        <View style={styles.promptCard}>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>
        <Text style={styles.sub}>Judge, award this card to…</Text>
        <View style={styles.targetList}>
          {others.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setSelectedId(p.id)}
              style={[styles.targetChip, selectedId === p.id && styles.targetChipActive]}
            >
              <Text style={[styles.targetLabel, selectedId === p.id && styles.targetLabelActive]}>{p.name}</Text>
              {selectedId === p.id && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
            </Pressable>
          ))}
        </View>
        <View style={styles.spacer} />
        <PrimaryButton
          label={selected ? `Give the card to ${selected.name}` : 'Give the card to…'}
          icon="arrow-forward"
          color={colors.primary}
          onPress={handleAward}
          disabled={!selectedId}
        />
      </View>
    );
  }

  if (phase === 'round_result' && lastAwarded) {
    const sorted = [...players].sort((a, b) => b.cards - a.cards);
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Text style={[styles.title, styles.topBarPad]}>{lastAwarded.name} takes the card! 🃏</Text>
        <View style={styles.scoreList}>
          {sorted.map((p) => (
            <View key={p.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{p.name}</Text>
              <Text style={styles.scoreValue}>{p.cards} cards</Text>
            </View>
          ))}
        </View>
        <View style={styles.spacer} />
        <PrimaryButton label="Next Round" icon="arrow-forward" color={colors.primary} onPress={nextRound} />
      </View>
    );
  }

  if (phase === 'game_over') {
    const sorted = [...players].sort((a, b) => b.cards - a.cards);
    const maxCards = sorted[0]?.cards ?? 0;
    const losers = sorted.filter((p) => p.cards === maxCards);

    return (
      <View style={[styles.root, styles.centerAll, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Ionicons name="skull" size={56} color={colors.danger} />
        <Text style={styles.overTitle}>Ultimate Loser</Text>
        <Text style={styles.sub}>{losers.map((l) => l.name).join(' & ')}</Text>
        <View style={styles.scoreList}>
          {sorted.map((p) => (
            <View key={p.id} style={styles.scoreRow}>
              <Text style={styles.scoreName}>{p.name}</Text>
              <Text style={styles.scoreValue}>{p.cards} cards</Text>
            </View>
          ))}
        </View>
        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Play Again" icon="refresh" color={colors.primary} onPress={playAgain} />
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
    fontSize: 26,
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
    color: colors.primary,
  },
  judgeName: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
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
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary + '55',
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  promptText: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    lineHeight: 29,
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
    borderColor: colors.primary,
    backgroundColor: colors.primary + '18',
  },
  targetLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textFaint,
  },
  targetLabelActive: {
    color: colors.text,
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
