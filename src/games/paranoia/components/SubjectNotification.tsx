import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, radius, spacing } from '../../../theme/theme';

interface Props {
  subjectName: string;
  voteCount: number;
  totalVoters: number;
  prompt: string;
  onReady: () => void;
}

export function SubjectNotification({
  subjectName,
  voteCount,
  totalVoters,
  prompt,
  onReady,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🔥</Text>
        <Text style={styles.hotSeat}>YOU'RE IN THE HOT SEAT</Text>
        <Text style={styles.name}>{subjectName}</Text>

        <View style={styles.reveal}>
          <Text style={styles.revealLabel}>For the prompt</Text>
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>{prompt}</Text>
          </View>
          <Text style={styles.revealLabel}>you received</Text>
          <Text style={styles.voteCount}>
            {voteCount}{' '}
            <Text style={styles.voteSub}>
              out of {totalVoters} vote{totalVoters !== 1 ? 's' : ''}
            </Text>
          </Text>
          <Text style={styles.tip}>
            Now interrogate the group. Figure out who voted for you.
          </Text>
        </View>
      </View>

      <PrimaryButton label="I'm Ready" icon="flame" color={colors.yellow} onPress={onReady} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1A1200',
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  hotSeat: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.yellow,
    marginBottom: spacing.sm,
    ...glow(colors.yellow, 0.4),
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.text,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  reveal: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  revealLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
  },
  promptCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.yellow + '55',
    padding: spacing.lg,
  },
  promptText: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
    textAlign: 'center',
  },
  voteCount: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: colors.yellow,
    ...glow(colors.yellow, 0.5),
    lineHeight: 72,
  },
  voteSub: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
  },
  tip: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
});
