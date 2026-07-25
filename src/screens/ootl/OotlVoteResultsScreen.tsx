import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface TallyRow {
  playerId: string;
  name: string;
  votes: number;
}

interface Props {
  caught: boolean;
  outsiderName: string;
  topic: string;
  tally: TallyRow[];
  isHost: boolean;
  onContinue: () => void;
}

export function OotlVoteResultsScreen({ caught, outsiderName, topic, tally, isHost, onContinue }: Props) {
  return (
    <View style={styles.root}>
      <View style={[styles.banner, caught ? styles.bannerCaught : styles.bannerSurvived]}>
        <Ionicons
          name={caught ? 'checkmark-circle' : 'close-circle'}
          size={40}
          color={caught ? colors.success : colors.danger}
        />
        <Text style={styles.bannerTitle}>{caught ? 'Caught!' : 'They got away'}</Text>
        <Text style={styles.bannerBody}>
          {caught
            ? `The group correctly identified ${outsiderName} as Out of the Loop.`
            : `The group failed to identify the outsider. ${outsiderName} was Out of the Loop.`}
        </Text>
        {!caught && (
          <View style={styles.topicPill}>
            <Text style={styles.topicLabel}>THE TOPIC WAS</Text>
            <Text style={styles.topicText}>{topic}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>VOTES</Text>
      <FlatList
        data={tally}
        keyExtractor={(t) => t.playerId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.votes}>
              {item.votes} {item.votes === 1 ? 'vote' : 'votes'}
            </Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {isHost ? (
        <PrimaryButton
          label={caught ? 'Outsider Guesses' : 'See Results'}
          icon="arrow-forward"
          color={colors.purple}
          onPress={onContinue}
        />
      ) : (
        <Text style={styles.waitingText}>Waiting for host to continue…</Text>
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
  banner: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  bannerCaught: {
    backgroundColor: colors.success + '14',
    borderColor: colors.success + '55',
  },
  bannerSurvived: {
    backgroundColor: colors.danger + '14',
    borderColor: colors.danger + '55',
  },
  bannerTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
  },
  bannerBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
  },
  topicPill: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  topicLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textFaint,
  },
  topicText: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
  },
  sectionLabel: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textFaint,
    marginBottom: spacing.sm,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.text,
  },
  votes: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.textMuted,
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
