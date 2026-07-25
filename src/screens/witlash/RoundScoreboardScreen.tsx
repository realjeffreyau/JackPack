import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { LobbyPlayer } from '../../multiplayer/types';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  players: LobbyPlayer[]; // pre-sorted by score desc
  roundNumber: number;
  totalRounds: number;
  isHost: boolean;
  onContinue: () => void;
}

export function RoundScoreboardScreen({ players, roundNumber, totalRounds, isHost, onContinue }: Props) {
  const isFinalRound = roundNumber >= totalRounds;

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>
        ROUND {roundNumber}/{totalRounds} COMPLETE
      </Text>
      <Text style={styles.title}>Scoreboard</Text>

      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <View style={[styles.rankWrap, index === 0 && styles.rankWrapLeader]}>
              <Text style={[styles.rank, index === 0 && styles.rankLeader]}>{index + 1}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.display_name}
            </Text>
            {index === 0 && <Ionicons name="trophy" size={16} color={colors.yellow} />}
            <Text style={styles.score}>{item.score} pts</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {isHost ? (
        <PrimaryButton
          label={isFinalRound ? 'See Final Results' : 'Next Round'}
          icon="arrow-forward"
          color={colors.cyan}
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
    paddingBottom: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.bodyExtra,
    fontSize: 13,
    letterSpacing: 2,
    color: colors.cyan,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
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
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  rankWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankWrapLeader: {
    backgroundColor: colors.yellow,
  },
  rank: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.text,
  },
  rankLeader: {
    color: colors.bg,
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
