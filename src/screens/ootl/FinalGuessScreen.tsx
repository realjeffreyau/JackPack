import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../theme/theme';

interface Props {
  isOutsider: boolean;
  isHost: boolean;
  onJudge: (correct: boolean) => void;
}

export function FinalGuessScreen({ isOutsider, isHost, onJudge }: Props) {
  return (
    <View style={styles.root}>
      <Ionicons name="mic" size={48} color={colors.purple} />
      <Text style={styles.title}>{isOutsider ? 'You were caught!' : 'Final Guess'}</Text>
      <Text style={styles.body}>
        {isOutsider
          ? 'Say your guess for the secret topic out loud.'
          : "The outsider is guessing the topic out loud — listen up."}
      </Text>

      {isHost && (
        <View style={styles.judgeRow}>
          <PrimaryButton label="Correct" icon="checkmark" color={colors.success} onPress={() => onJudge(true)} style={styles.judgeBtn} />
          <PrimaryButton label="Incorrect" icon="close" color={colors.danger} onPress={() => onJudge(false)} style={styles.judgeBtn} />
        </View>
      )}
      {!isHost && !isOutsider && <Text style={styles.waitingText}>Waiting for the host to judge the guess…</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  judgeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  judgeBtn: {
    flex: 1,
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
