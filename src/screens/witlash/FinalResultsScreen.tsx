import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { LobbyPlayer } from '../../multiplayer/types';
import { colors, fonts, radius, spacing } from '../../theme/theme';

interface Props {
  players: LobbyPlayer[]; // pre-sorted by score desc
  isHost: boolean;
  onBackToLobby: () => void;
}

export function FinalResultsScreen({ players, isHost, onBackToLobby }: Props) {
  const topScore = players[0]?.score ?? 0;
  const winners = players.filter((p) => p.score === topScore && topScore > 0);
  const winnerNames = winners.map((w) => w.display_name).join(' & ');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={48} color={colors.yellow} />
        <Text style={styles.title}>Game Over</Text>
        {winners.length > 0 && (
          <Text style={styles.winnerText}>
            {winners.length > 1 ? 'Tied for the win: ' : 'Winner: '}
            <Text style={styles.winnerName}>{winnerNames}</Text>
          </Text>
        )}
      </View>

      <FlatList
        data={players}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isWinner = item.score === topScore && topScore > 0;
          return (
            <View style={[styles.row, isWinner && styles.rowWinner]}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {item.display_name}
              </Text>
              {isWinner && <Ionicons name="star" size={16} color={colors.yellow} />}
              <Text style={styles.score}>{item.score} pts</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      {isHost ? (
        <PrimaryButton label="Back to Lobby" icon="home" color={colors.cyan} onPress={onBackToLobby} />
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
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
  },
  winnerText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  winnerName: {
    fontFamily: fonts.bodyExtra,
    color: colors.yellow,
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
  rowWinner: {
    borderColor: colors.yellow,
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
