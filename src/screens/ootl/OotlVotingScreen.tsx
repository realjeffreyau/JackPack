import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface VotablePlayer {
  playerId: string;
  name: string;
}

interface Props {
  players: VotablePlayer[];
  myVoteAccusedId: string | null;
  onVote: (accusedId: string) => void;
  votedCount: number;
  totalEligible: number;
}

export function OotlVotingScreen({ players, myVoteAccusedId, onVote, votedCount, totalEligible }: Props) {
  const hasVoted = myVoteAccusedId !== null;

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>VOTE</Text>
      <Text style={styles.title}>Who is The Outsider?</Text>

      <FlatList
        data={players}
        keyExtractor={(p) => p.playerId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const selected = myVoteAccusedId === item.playerId;
          return (
            <Pressable
              onPress={() => !hasVoted && onVote(item.playerId)}
              disabled={hasVoted}
              accessibilityRole="button"
              accessibilityLabel={`Vote for ${item.name}`}
              style={({ pressed }) => [
                styles.row,
                selected && styles.rowSelected,
                { opacity: hasVoted && !selected ? 0.5 : 1, transform: [{ scale: pressed && !hasVoted ? 0.98 : 1 }] },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              {selected && <Ionicons name="checkmark-circle" size={20} color={colors.purple} />}
            </Pressable>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      {hasVoted ? (
        <Text style={styles.waitingText}>
          Vote submitted — {votedCount}/{totalEligible} voted
        </Text>
      ) : (
        <Text style={styles.hintText}>Tap a player to cast your vote.</Text>
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
    letterSpacing: 3,
    color: colors.purple,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
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
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 56,
  },
  rowSelected: {
    borderColor: colors.purple,
    backgroundColor: colors.purple + '18',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.text,
  },
  waitingText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  hintText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
