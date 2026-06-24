import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { GameEngineProps } from '../../types/game';
import { BOMBS, QUESTIONS } from '../../data/truthBomb';
import { useDeck } from '../../utils/deck';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { CountdownDisplay } from '../../components/CountdownDisplay';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../theme/theme';

type Phase = 'playing' | 'bomb' | 'gameover';

export function TruthBombEngine({ roundLength, totalRounds, onExit }: GameEngineProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const drawQuestion = useDeck(QUESTIONS);
  const drawBomb = useDeck(BOMBS);

  const [phase, setPhase] = useState<Phase>('playing');
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(roundLength);
  const [question, setQuestion] = useState<string>(() => drawQuestion());
  const [bomb, setBomb] = useState<string>('');

  // ---- Round lifecycle ------------------------------------------------------
  const startRound = useCallback(() => {
    setQuestion(drawQuestion());
    setTimeLeft(roundLength);
    setPhase('playing');
  }, [drawQuestion, roundLength]);

  const nextQuestion = useCallback(() => {
    setQuestion(drawQuestion());
  }, [drawQuestion]);

  const nextRound = useCallback(() => {
    if (round >= totalRounds) {
      setPhase('gameover');
      return;
    }
    setRound((r) => r + 1);
    startRound();
  }, [round, totalRounds, startRound]);

  const playAgain = useCallback(() => {
    setRound(1);
    startRound();
  }, [startRound]);

  const confirmExit = useCallback(() => {
    Alert.alert('Quit game?', 'Your progress will be lost.', [
      { text: 'Keep playing', style: 'cancel' },
      { text: 'Quit', style: 'destructive', onPress: onExit },
    ]);
  }, [onExit]);

  // ---- Timer ----------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const id = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Trigger the bomb exactly once when the clock empties.
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      setBomb(drawBomb());
      setPhase('bomb');
    }
  }, [phase, timeLeft, drawBomb]);

  // ---- Animations -----------------------------------------------------------
  const qAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduced) {
      qAnim.setValue(1);
      return;
    }
    qAnim.setValue(0);
    Animated.timing(qAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [question, reduced, qAnim]);

  const bombAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (phase !== 'bomb') return;
    if (reduced) {
      bombAnim.setValue(1);
      return;
    }
    bombAnim.setValue(0);
    Animated.spring(bombAnim, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [phase, reduced, bombAnim]);

  // ---- Render ---------------------------------------------------------------
  const topPad = insets.top + spacing.md;
  const bottomPad = insets.bottom + spacing.lg;

  if (phase === 'bomb') {
    const isLast = round >= totalRounds;
    return (
      <View style={[styles.root, styles.bombRoot, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <Animated.View
          style={[
            styles.bombContent,
            {
              opacity: bombAnim,
              transform: [{ scale: bombAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
            },
          ]}
        >
          <Text style={styles.bombEmoji}>💣</Text>
          <Text style={styles.bombTitle}>YOU GOT THE{'\n'}TRUTH BOMB</Text>
          <View style={styles.bombCard}>
            <Text style={styles.bombLabel}>YOUR DARE</Text>
            <Text style={styles.bombPrompt}>{bomb}</Text>
          </View>
        </Animated.View>

        <View style={styles.bottomArea}>
          <PrimaryButton
            label={isLast ? 'See Results' : 'Next Round'}
            icon="arrow-forward"
            onPress={nextRound}
          />
        </View>
      </View>
    );
  }

  if (phase === 'gameover') {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
        <View style={styles.centerFill}>
          <Text style={styles.overEmoji}>🎉</Text>
          <Text style={styles.overTitle}>Game Over</Text>
          <Text style={styles.overSub}>
            {totalRounds} {totalRounds === 1 ? 'bomb' : 'bombs'} dropped. Who survived the night?
          </Text>
        </View>
        <View style={styles.bottomArea}>
          <PrimaryButton label="Play Again" icon="refresh" onPress={playAgain} />
          <PrimaryButton
            label="Back to Games"
            variant="ghost"
            color={colors.textMuted}
            onPress={onExit}
            style={styles.ghostSpacing}
          />
        </View>
      </View>
    );
  }

  // phase === 'playing'
  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topBar}>
        <View style={styles.roundPill}>
          <Text style={styles.roundText}>
            ROUND {round}/{totalRounds}
          </Text>
        </View>
        <Pressable
          onPress={confirmExit}
          accessibilityRole="button"
          accessibilityLabel="Quit game"
          hitSlop={10}
          style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="close" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.timerArea}>
        <CountdownDisplay timeLeft={timeLeft} total={roundLength} animate={!reduced} />
      </View>

      <Animated.View
        style={[
          styles.questionCard,
          {
            opacity: qAnim,
            transform: [{ translateY: qAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
          },
        ]}
      >
        <Text style={styles.question}>{question}</Text>
      </Animated.View>

      <View style={styles.bottomArea}>
        <Text style={styles.hint}>Read it out loud, answer, then pass the phone →</Text>
        <PrimaryButton label="NEXT" icon="arrow-forward" onPress={nextQuestion} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  roundText: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Timer
  timerArea: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  // Question
  questionCard: {
    flex: 1,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontFamily: fonts.displaySemi,
    fontSize: 30,
    lineHeight: 40,
    color: colors.text,
    textAlign: 'center',
  },
  // Bottom
  bottomArea: {
    marginTop: spacing.xl,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  ghostSpacing: {
    marginTop: spacing.sm,
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bomb screen
  bombRoot: {
    backgroundColor: '#1A0A18',
  },
  bombContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bombEmoji: {
    fontSize: 96,
    marginBottom: spacing.lg,
  },
  bombTitle: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    ...glow(colors.primary, 0.6),
  },
  bombCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.primary + '66',
    padding: spacing.xl,
    alignItems: 'center',
  },
  bombLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  bombPrompt: {
    fontFamily: fonts.displaySemi,
    fontSize: 24,
    lineHeight: 32,
    color: colors.text,
    textAlign: 'center',
  },
  // Game over
  overEmoji: {
    fontSize: 88,
    marginBottom: spacing.lg,
  },
  overTitle: {
    fontFamily: fonts.display,
    fontSize: 46,
    color: colors.text,
  },
  overSub: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
