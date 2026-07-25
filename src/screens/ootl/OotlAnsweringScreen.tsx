import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface SpeakerRow {
  playerId: string;
  name: string;
  isCurrent: boolean;
  hasSpoken: boolean;
}

interface Props {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  speakers: SpeakerRow[];
  isCurrentSpeaker: boolean;
  onDone: () => void;
  isHost: boolean;
  onSkipSpeaker: () => void;
}

export function OotlAnsweringScreen({
  question,
  questionNumber,
  totalQuestions,
  speakers,
  isCurrentSpeaker,
  onDone,
  isHost,
  onSkipSpeaker,
}: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>
        QUESTION {questionNumber}/{totalQuestions}
      </Text>
      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      <Text style={styles.sectionLabel}>SPEAKING ORDER</Text>
      <FlatList
        data={speakers}
        keyExtractor={(s) => s.playerId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.speakerRow, item.isCurrent && styles.speakerRowCurrent]}>
            <View
              style={[
                styles.speakerAvatar,
                item.isCurrent && styles.speakerAvatarCurrent,
                item.hasSpoken && styles.speakerAvatarDone,
              ]}
            >
              <Text style={styles.speakerInitial}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.speakerName, item.isCurrent && styles.speakerNameCurrent]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.hasSpoken && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
            {item.isCurrent && <Ionicons name="mic" size={16} color={colors.purple} />}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {isCurrentSpeaker ? (
        <PrimaryButton label="Done Answering" icon="checkmark" color={colors.purple} onPress={onDone} />
      ) : (
        <Text style={styles.waitingText}>Answer out loud when it's your turn.</Text>
      )}

      {isHost && (
        <PrimaryButton
          label="Skip Speaker"
          variant="ghost"
          color={colors.textFaint}
          onPress={onSkipSpeaker}
          style={styles.skipBtn}
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
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.purple,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  questionText: {
    fontFamily: fonts.displaySemi,
    fontSize: 20,
    lineHeight: 27,
    color: colors.text,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.md,
  },
  speakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  speakerRowCurrent: {
    borderColor: colors.purple,
    backgroundColor: colors.purple + '18',
  },
  speakerAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerAvatarCurrent: {
    backgroundColor: colors.purple,
  },
  speakerAvatarDone: {
    opacity: 0.5,
  },
  speakerInitial: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.text,
  },
  speakerName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  speakerNameCurrent: {
    fontFamily: fonts.bodyBold,
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  skipBtn: {
    marginTop: spacing.sm,
  },
});
