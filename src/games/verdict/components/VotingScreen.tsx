import React, { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import type { ScaledCase, VerdictPlayer, VotesByQuestion } from '../types';

const HOLD_MS = 1500;
const RING_SIZE = 140;
const BORDER = 5;

function HoldGate({ playerName, onReady }: { playerName: string; onReady: () => void }) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const firedRef = useRef(false);

  function handlePressIn() {
    firedRef.current = false;
    animRef.current = Animated.timing(progress, { toValue: 1, duration: HOLD_MS, useNativeDriver: false });
    animRef.current.start(({ finished }) => {
      if (finished && !firedRef.current) { firedRef.current = true; onReady(); }
    });
  }
  function handlePressOut() {
    animRef.current?.stop();
    Animated.timing(progress, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  }

  const innerSize = RING_SIZE - BORDER * 2;
  const fillScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const fillOpacity = progress.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 1] });

  if (reduced) {
    return (
      <View style={styles.gateRoot}>
        <Text style={styles.gateInstruction}>Pass to</Text>
        <Text style={[styles.gateName, { color: colors.yellow }]}>{playerName}</Text>
        <Text style={styles.gateSub}>Only {playerName} should see the next screen.</Text>
        <PrimaryButton label="I'm Ready to Vote" color={colors.yellow} onPress={onReady} />
      </View>
    );
  }

  return (
    <View style={styles.gateRoot}>
      <Text style={styles.gateInstruction}>Pass to</Text>
      <Text style={[styles.gateName, { color: colors.yellow }]}>{playerName}</Text>
      <Text style={styles.gateSub}>Hold to open your private ballot.</Text>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Hold to open ${playerName}'s ballot`}
        style={[styles.ring, { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderColor: colors.yellow + '44' }]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              width: innerSize, height: innerSize, borderRadius: innerSize / 2,
              backgroundColor: colors.yellow, transform: [{ scale: fillScale }], opacity: fillOpacity,
            },
          ]}
        />
      </Pressable>
      <Text style={styles.hint}>Hold to vote</Text>
    </View>
  );
}

interface Props {
  players: VerdictPlayer[];
  scaledCase: ScaledCase;
  voteIndex: number;
  subPhase: 'gate' | 'vote';
  currentVotes: VotesByQuestion;
  onGateReady: () => void;
  onVoteSubmit: (culpritId: string, helperId: string | null) => void;
}

function VoteBallot({
  player,
  players,
  scaledCase,
  onSubmit,
}: {
  player: VerdictPlayer;
  players: VerdictPlayer[];
  scaledCase: ScaledCase;
  onSubmit: (culpritId: string, helperId: string | null) => void;
}) {
  const [culpritVote, setCulpritVote] = useState<string | null>(null);
  const [helperVote, setHelperVote] = useState<string | null>(null);

  const canSubmit = culpritVote !== null && (!scaledCase.showHelperVote || helperVote !== null);

  return (
    <ScrollView contentContainerStyle={styles.ballotScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.ballotFor}>Voting as</Text>
      <Text style={[styles.ballotName, { color: colors.yellow }]}>{player.name}</Text>

      <Text style={styles.question}>{scaledCase.template.votingQuestions.culprit}</Text>
      <View style={styles.choices}>
        {players.map((p) => {
          const active = culpritVote === p.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setCulpritVote(p.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.choice,
                active && styles.choiceActive,
                { opacity: pressed && !active ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{p.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {scaledCase.showHelperVote && (
        <>
          <Text style={styles.question}>{scaledCase.template.votingQuestions.helper}</Text>
          <View style={styles.choices}>
            {players.map((p) => {
              const active = helperVote === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setHelperVote(p.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.choice,
                    active && styles.choiceActive,
                    { opacity: pressed && !active ? 0.7 : 1 },
                  ]}
                >
                  <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{p.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.submitArea}>
        <PrimaryButton
          label="Submit Vote"
          icon="checkmark"
          color={colors.yellow}
          disabled={!canSubmit}
          onPress={() => {
            if (culpritVote) onSubmit(culpritVote, helperVote);
          }}
        />
      </View>
    </ScrollView>
  );
}

export function VotingScreen({
  players,
  scaledCase,
  voteIndex,
  subPhase,
  currentVotes,
  onGateReady,
  onVoteSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const player = players[voteIndex];

  if (subPhase === 'gate') {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <HoldGate playerName={player.name} onReady={onGateReady} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom }]}>
      <VoteBallot
        player={player}
        players={players}
        scaledCase={scaledCase}
        onSubmit={onVoteSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  gateRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  gateInstruction: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
  },
  gateName: {
    fontFamily: fonts.display,
    fontSize: 44,
    textAlign: 'center',
  },
  gateSub: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  ring: { borderWidth: BORDER, alignItems: 'center', justifyContent: 'center' },
  fill: {},
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.textFaint },
  ballotScroll: { paddingBottom: spacing.xl, gap: spacing.lg },
  ballotFor: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.md,
  },
  ballotName: {
    fontFamily: fonts.display,
    fontSize: 34,
    marginBottom: spacing.sm,
  },
  question: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.sm,
  },
  choices: {
    gap: spacing.sm,
  },
  choice: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  choiceActive: {
    borderColor: colors.yellow,
    backgroundColor: colors.yellow + '18',
  },
  choiceText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textMuted,
  },
  choiceTextActive: {
    color: colors.yellow,
  },
  submitArea: {
    marginTop: spacing.md,
  },
});
