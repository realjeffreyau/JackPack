import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';

const OPTIONS: (1 | 3 | 5)[] = [1, 3, 5];

interface Props {
  onDone: (rounds: 1 | 3 | 5) => void;
}

export function RoundsSelect({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<1 | 3 | 5>(3);

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>How many rounds?</Text>
      <Text style={styles.sub}>Each round is one case.</Text>

      <View style={styles.options}>
        {OPTIONS.map((n) => {
          const active = selected === n;
          return (
            <Pressable
              key={n}
              onPress={() => setSelected(n)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${n} round${n > 1 ? 's' : ''}`}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                { opacity: pressed && !active ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.optionNum, active && styles.optionNumActive]}>{n}</Text>
              <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                {n === 1 ? 'round' : 'rounds'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Start"
          icon="play"
          color={colors.yellow}
          onPress={() => onDone(selected)}
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
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: spacing.xxxl,
  },
  options: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  option: {
    width: 90,
    height: 100,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  optionActive: {
    borderColor: colors.yellow,
    backgroundColor: colors.yellow + '18',
  },
  optionNum: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.textFaint,
  },
  optionNumActive: {
    color: colors.yellow,
  },
  optionLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textFaint,
  },
  optionLabelActive: {
    color: colors.yellow,
  },
  footer: {
    width: '100%',
  },
});
