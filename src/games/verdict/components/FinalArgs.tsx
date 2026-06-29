import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CountdownDisplay } from '../../../components/CountdownDisplay';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../../theme/theme';
import type { VerdictPlayer } from '../types';

const ARG_SECONDS = 30;

interface Props {
  players: VerdictPlayer[];
  argIndex: number;
  onNext: () => void;
}

export function FinalArgs({ players, argIndex, onNext }: Props) {
  const insets = useSafeAreaInsets();
  const [timeLeft, setTimeLeft] = useState(ARG_SECONDS);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    setTimeLeft(ARG_SECONDS);
  }, [argIndex]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [argIndex]);

  const player = players[argIndex];
  const isLast = argIndex === players.length - 1;
  const timesUp = timeLeft === 0;

  function handleNext() {
    if (firedRef.current) return;
    firedRef.current = true;
    onNext();
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.label}>Final Argument</Text>
      <Text style={styles.playerName}>{player.name}</Text>
      <Text style={styles.sub}>Make your closing statement.</Text>

      <View style={styles.timerArea}>
        <CountdownDisplay timeLeft={timeLeft} total={ARG_SECONDS} animate />
      </View>

      <View style={styles.footer}>
        {timesUp && (
          <Text style={styles.timesUp}>Time's up!</Text>
        )}
        <PrimaryButton
          label={isLast ? 'Proceed to Voting' : 'Next Player'}
          icon={isLast ? 'checkmark-circle' : 'arrow-forward'}
          color={colors.yellow}
          onPress={handleNext}
        />
        {!timesUp && (
          <PrimaryButton
            label="Skip"
            variant="ghost"
            color={colors.textFaint}
            onPress={handleNext}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  playerName: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.yellow,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  timerArea: {
    marginBottom: spacing.xxl,
  },
  footer: {
    width: '100%',
    gap: spacing.md,
  },
  timesUp: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
