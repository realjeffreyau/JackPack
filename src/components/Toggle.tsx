import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface Props {
  label: string;
  value: boolean;
  accent: string;
  onValueChange: (value: boolean) => void;
}

export function Toggle({ label, value, accent, onValueChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: accent }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 60,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
});
