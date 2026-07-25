import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { LobbyPlayer } from '../../multiplayer/types';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  caught: boolean;
  guessCorrect: boolean | null;
  outsiderName: string;
  topic: string;
  players: LobbyPlayer[]; // pre-sorted by score desc
  isHost: boolean;
  onBackToLobby: () => void;
}

export function OotlGameOverScreen({ caught, guessCorrect, outsiderName, topic, players, isHost, onBackToLobby }: Props) {
  const headline = !caught
    ? 'Outsider Survived'
    : guessCorrect
    ? 'Outsider Redeemed'
    : 'Group Wins';

  const sub = !caught
    ? `${outsiderName} blended in and was never caught.`
    : guessCorrect
    ? `${outsiderName} was caught but correctly guessed the topic.`
    : `${outsiderName} was caught and guessed wrong.`;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={48} color={colors.yellow} />
        <Text style={styles.title}>{headline}</Text>
        <Text style={styles.sub}>{sub}</Text>
        <View style={styles.topicPill}>
          <Text style={styles.topicLabel}>THE TOPIC WAS</Text>
          <Text style={styles.topicText}>{topic}</Text>
        </View>
      </View>

      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {item.display_name}
            </Text>
            {item.display_name === outsiderName && <Ionicons name="help-circle" size={14} color={colors.textFaint} />}
            <Text style={styles.score}>{item.score} pts</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {isHost ? (
        <PrimaryButton label="Back to Lobby" icon="home" color={colors.purple} onPress={onBackToLobby} />
      ) : (
        <Text style={styles.waitingText}>Waiting for host to return to the lobby…</Text>
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
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  topicPill: {
    marginTop: spacing.md,
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
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  rank: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.textFaint,
    width: 20,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.text,
  },
  score: {
    fontFamily: fonts.bodyExtra,
    fontSize: 15,
    color: colors.text,
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
