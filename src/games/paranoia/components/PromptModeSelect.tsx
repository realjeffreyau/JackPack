import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../../theme/theme';
import type { PromptMode } from '../types';

interface Props {
  onSelect: (mode: PromptMode) => void;
}

export function PromptModeSelect({ onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.emoji}>👀</Text>
      <Text style={styles.title}>Paranoia</Text>
      <Text style={styles.sub}>Choose your prompts</Text>

      <View style={styles.options}>
        <PrimaryButton
          label="Built-in Prompts"
          variant="outline"
          color={colors.lime}
          onPress={() => onSelect('builtin')}
        />
        <PrimaryButton
          label="Custom Prompts Only"
          variant="outline"
          color={colors.lime}
          onPress={() => onSelect('custom')}
          style={styles.gap}
        />
        <PrimaryButton
          label="Mix Both"
          color={colors.lime}
          onPress={() => onSelect('mix')}
          style={styles.gap}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 46,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: spacing.xxxl,
  },
  options: {
    width: '100%',
  },
  gap: {
    marginTop: spacing.md,
  },
});
