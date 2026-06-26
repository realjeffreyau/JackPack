import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, glow, spacing } from '../../../theme/theme';

interface Props {
  accent: string;
  round: number;
  totalRounds: number; // 0 = endless
  onDeal: () => void;
}

export function RoundIntro({ accent, round, totalRounds, onDeal }: Props) {
  const insets = useSafeAreaInsets();
  const label = totalRounds === 0 ? `Round ${round}` : `Round ${round} of ${totalRounds}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.center}>
        <Text style={styles.kicker}>{totalRounds === 0 ? 'ENDLESS' : 'NEW ROUND'}</Text>
        <Text style={[styles.title, glow(accent, 0.4)]}>{label}</Text>
        <Text style={styles.body}>
          Pass the phone around. Each player will privately receive a secret agenda. Keep yours hidden.
        </Text>
      </View>
      <PrimaryButton label="Deal Agendas" icon="albums" color={accent} onPress={onDeal} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  kicker: { fontFamily: fonts.bodyExtra, fontSize: 13, letterSpacing: 3, color: colors.textFaint },
  title: { fontFamily: fonts.display, fontSize: 52, color: colors.text, textAlign: 'center' },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
