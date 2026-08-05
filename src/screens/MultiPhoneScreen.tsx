import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MultiPhoneScreenProps } from '../navigation/types';
import { isSupabaseConfigured } from '../multiplayer/supabase';
import { colors, fonts, radius, spacing } from '../theme/theme';

const PLACEHOLDER_GAMES = ['Game #3'];

export function MultiPhoneScreen({ navigation }: MultiPhoneScreenProps) {
  return (
    <View style={styles.root}>
      <View style={[styles.blob, styles.blobPurple]} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.xl,
          paddingBottom: spacing.xxl,
          paddingHorizontal: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kicker}>PLAY TOGETHER</Text>
        <Text style={styles.title}>Multi Phone</Text>
        <Text style={styles.subtitle}>
          Everyone joins from their own phone. Create a lobby or join one with a code.
        </Text>

        {!isSupabaseConfigured ? (
          <View style={styles.notice}>
            <Ionicons name="cloud-offline-outline" size={22} color={colors.textFaint} />
            <Text style={styles.noticeText}>
              Multiplayer isn't configured yet. Add your Supabase project URL and anon key to
              continue.
            </Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <Pressable
              onPress={() => navigation.navigate('CreateLobby')}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create Lobby"
            >
              <Ionicons name="add-circle" size={24} color={colors.onPrimary} />
              <Text style={[styles.actionLabel, { color: colors.onPrimary }]}>Create Lobby</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('JoinLobby')}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionBtnOutline,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Join Lobby"
            >
              <Ionicons name="enter" size={24} color={colors.text} />
              <Text style={styles.actionLabel}>Join Lobby</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.sectionLabel}>GAMES</Text>

        <Pressable
          onPress={() => navigation.navigate('MultiGameDetail', { game: 'witlash' })}
          style={({ pressed }) => [
            styles.gameCard,
            { borderColor: colors.cyan + '88', transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Witlash"
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.cyan + '22' }]}>
            <Text style={styles.icon}>🎭</Text>
          </View>
          <View style={styles.gameCardBody}>
            <Text style={styles.gameName}>Witlash</Text>
            <Text style={styles.gameTagline}>Funny-answer voting game</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('MultiGameDetail', { game: 'out-of-the-loop' })}
          style={({ pressed }) => [
            styles.gameCard,
            { borderColor: colors.purple + '88', transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="The Outsider"
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.purple + '22' }]}>
            <Text style={styles.icon}>🕵️</Text>
          </View>
          <View style={styles.gameCardBody}>
            <Text style={styles.gameName}>The Outsider</Text>
            <Text style={styles.gameTagline}>Social deduction — spot the outsider</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('MultiGameDetail', { game: 'spymaster' })}
          style={({ pressed }) => [
            styles.gameCard,
            { borderColor: colors.cyan + '88', transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Spymaster"
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.cyan + '22' }]}>
            <Text style={styles.icon}>🔡</Text>
          </View>
          <View style={styles.gameCardBody}>
            <Text style={styles.gameName}>Spymaster</Text>
            <Text style={styles.gameTagline}>2 phones — board + spymaster key</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
        </Pressable>

        {PLACEHOLDER_GAMES.map((label) => (
          <View key={label} style={[styles.gameCard, styles.gameCardLocked]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="lock-closed" size={20} color={colors.textFaint} />
            </View>
            <View style={styles.gameCardBody}>
              <Text style={[styles.gameName, { color: colors.textFaint }]}>{label}</Text>
              <Text style={styles.gameTagline}>Coming soon</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    opacity: 0.16,
  },
  blobPurple: {
    backgroundColor: colors.purple,
    top: -100,
    right: -120,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.cyan,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 46,
    color: colors.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionBtnOutline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  actionLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  sectionLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2.5,
    color: colors.textFaint,
    marginBottom: spacing.md,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gameCardLocked: {
    opacity: 0.55,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  gameCardBody: {
    flex: 1,
  },
  gameName: {
    fontFamily: fonts.display,
    fontSize: 17,
    color: colors.text,
  },
  gameTagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
