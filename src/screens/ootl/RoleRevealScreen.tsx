import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  categoryName: string;
  topic: string;
  isOutsider: boolean;
  isReady: boolean;
  readyCount: number;
  totalCount: number;
  onReady: () => void;
  isHost: boolean;
  onForceStart: () => void;
}

export function RoleRevealScreen({
  categoryName,
  topic,
  isOutsider,
  isReady,
  readyCount,
  totalCount,
  onReady,
  isHost,
  onForceStart,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>YOUR ROLE</Text>

      {!revealed ? (
        <Pressable
          onPress={() => setRevealed(true)}
          accessibilityRole="button"
          accessibilityLabel="Tap to reveal your role"
          style={({ pressed }) => [styles.hiddenCard, { opacity: pressed ? 0.85 : 1 }]}
        >
          <Ionicons name="eye-off-outline" size={40} color={colors.textFaint} />
          <Text style={styles.hiddenText}>Tap to reveal your role</Text>
          <Text style={styles.hiddenSub}>Make sure no one else can see your screen</Text>
        </Pressable>
      ) : isOutsider ? (
        <View style={[styles.card, styles.cardOutsider]}>
          <Ionicons name="help-circle" size={48} color={colors.danger} />
          <Text style={styles.cardTitle}>You are OUT OF THE LOOP</Text>
          <Text style={styles.cardBody}>
            You do not know the secret topic. Listen to the other answers, blend in, and try to
            figure it out.
          </Text>
        </View>
      ) : (
        <View style={[styles.card, styles.cardInformed]}>
          <Ionicons name="eye" size={48} color={colors.cyan} />
          <Text style={styles.cardEyebrow}>{categoryName.toUpperCase()}</Text>
          <Text style={styles.cardTopic}>{topic}</Text>
          <Text style={styles.cardBody}>
            Give answers that prove you know the topic — without making it obvious to the
            outsider.
          </Text>
        </View>
      )}

      {revealed && !isReady && (
        <PrimaryButton label="Got it" icon="checkmark" color={colors.purple} onPress={onReady} style={styles.readyBtn} />
      )}
      {isReady && (
        <View style={styles.readyRow}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.readyText}>
            {readyCount}/{totalCount} players ready
          </Text>
        </View>
      )}

      {isHost && (
        <PrimaryButton
          label="Force Start"
          variant="ghost"
          color={colors.textFaint}
          onPress={onForceStart}
          style={styles.forceBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    alignItems: 'center',
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.purple,
    marginBottom: spacing.xl,
  },
  hiddenCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  hiddenText: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  hiddenSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    borderRadius: radius.xl,
    borderWidth: 1.5,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardOutsider: {
    backgroundColor: colors.danger + '14',
    borderColor: colors.danger + '55',
  },
  cardInformed: {
    backgroundColor: colors.cyan + '14',
    borderColor: colors.cyan + '55',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
  },
  cardEyebrow: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.cyan,
    marginTop: spacing.xs,
  },
  cardTopic: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
  },
  cardBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  readyBtn: {
    marginTop: spacing.xl,
    width: '100%',
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
  },
  readyText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textMuted,
  },
  forceBtn: {
    marginTop: spacing.md,
  },
});
