import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { MultiGameDetailScreenProps } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

const GAME_COPY = {
  witlash: { icon: '🎭', title: 'Witlash', accent: 'cyan' as const },
  'out-of-the-loop': { icon: '🕵️', title: 'The Outsider', accent: 'purple' as const },
  spymaster: { icon: '🔡', title: 'Spymaster', accent: 'cyan' as const },
};

export function MultiGameDetailScreen({ navigation, route }: MultiGameDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const gameId = route.params?.game ?? 'witlash';
  const copy = GAME_COPY[gameId];
  const iconBg = copy.accent === 'cyan' ? colors.cyan + '22' : colors.purple + '22';

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={10}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Ionicons name="chevron-back" size={20} color={colors.text} />
        <Text style={styles.backLabel}>Back</Text>
      </Pressable>

      <View style={styles.body}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Text style={styles.icon}>{copy.icon}</Text>
        </View>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>
          Create or join a lobby, then the host can pick {copy.title} from the waiting room to
          start.
        </Text>
        {gameId === 'spymaster' && (
          <Text style={styles.note}>Needs exactly 2 phones: one shows the board, the other shows the spymaster key.</Text>
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
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginBottom: spacing.xl,
  },
  backLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.cyan + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  note: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
