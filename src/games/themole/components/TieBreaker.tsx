import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { CountdownDisplay } from '../../../components/CountdownDisplay';
import { colors, fonts, spacing } from '../../../theme/theme';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface TiedPlayer {
  id: string;
  name: string;
}

interface TieBreakerProps {
  tiedPlayers: TiedPlayer[];
  argumentDuration: number;
  onStartRevote: () => void;
}

export function TieBreaker({ tiedPlayers, argumentDuration, onStartRevote }: TieBreakerProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [timeLeft, setTimeLeft] = useState(argumentDuration);
  const [timerDone, setTimerDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setTimerDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>IT'S A TIE!</Text>
      <Text style={styles.sub}>These players are tied. Discuss — then vote again.</Text>

      <View style={styles.tiedList}>
        {tiedPlayers.map((p) => (
          <View key={p.id} style={styles.tiedPlayer}>
            <Text style={styles.tiedName}>{p.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.timerArea}>
        <Text style={styles.timerLabel}>ARGUMENT TIME</Text>
        <CountdownDisplay timeLeft={timeLeft} total={argumentDuration} animate={!reduced} />
      </View>

      <PrimaryButton
        label={timerDone ? 'Start Re-Vote' : 'Skip Timer & Re-Vote'}
        icon="refresh"
        color={colors.purple}
        onPress={onStartRevote}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.yellow,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  tiedList: {
    gap: 8,
    alignItems: 'center',
  },
  tiedPlayer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.yellow + '55',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  tiedName: {
    fontFamily: fonts.displaySemi,
    fontSize: 22,
    color: colors.yellow,
    textAlign: 'center',
  },
  timerArea: {
    alignItems: 'center',
    gap: 8,
  },
  timerLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
  },
});
