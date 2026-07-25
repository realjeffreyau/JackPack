import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CountdownDisplay } from '../../components/CountdownDisplay';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../theme/theme';

interface Props {
  timeLeft: number;
  discussionSec: number;
  isHost: boolean;
  onSkip: () => void;
}

export function DiscussionScreen({ timeLeft, discussionSec, isHost, onSkip }: Props) {
  return (
    <View style={styles.root}>
      <Ionicons name="chatbubbles" size={40} color={colors.purple} />
      <Text style={styles.title}>Discussion</Text>
      <Text style={styles.prompt}>Who sounded like they didn't know the topic?</Text>
      <Text style={styles.sub}>You may accuse, defend yourself, or explain your answers — out loud.</Text>

      <CountdownDisplay timeLeft={timeLeft} total={discussionSec} animate />

      {isHost && (
        <PrimaryButton label="Start Voting" icon="arrow-forward" color={colors.purple} onPress={onSkip} style={styles.skipBtn} />
      )}
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
    fontSize: 32,
    color: colors.text,
  },
  prompt: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  skipBtn: {
    marginTop: spacing.xl,
    width: '100%',
  },
});
