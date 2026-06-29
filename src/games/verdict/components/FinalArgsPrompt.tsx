import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../../theme/theme';

interface Props {
  playerCount: number;
  onUse: () => void;
  onSkip: () => void;
}

export function FinalArgsPrompt({ playerCount, onUse, onSkip }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.icon}>⚖️</Text>
      <Text style={styles.title}>Final Arguments</Text>
      <Text style={styles.body}>
        Each player gets 30 seconds to make their closing statement. Use it to sway the jury — or skip straight to voting.
      </Text>
      <Text style={styles.note}>{playerCount} players × 30 seconds</Text>

      <View style={styles.buttons}>
        <PrimaryButton
          label="Use Final Arguments"
          icon="mic"
          color={colors.yellow}
          onPress={onUse}
        />
        <PrimaryButton
          label="Skip to Voting"
          variant="outline"
          color={colors.yellow}
          onPress={onSkip}
        />
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
    justifyContent: 'center',
  },
  icon: {
    fontSize: 60,
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  note: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textFaint,
    marginBottom: spacing.xxxl,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
});
