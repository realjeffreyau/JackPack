import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SpymasterState } from '../../multiplayer/spymaster/types';
import { WordTile } from '../../games/spymaster/components/WordTile';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../theme/theme';

interface Props {
  state: SpymasterState;
  isHost: boolean;
  onPlayAgain: () => void;
  onEndGame: () => void;
}

export function GameOverScreen({ state, isHost, onPlayAgain, onEndGame }: Props) {
  const insets = useSafeAreaInsets();
  const winAccent = state.winner === 'red' ? colors.danger : colors.cyan;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}>
      <Ionicons name="trophy" size={56} color={winAccent} />
      <Text style={[styles.title, { color: winAccent }]}>{state.winner?.toUpperCase()} WINS</Text>
      {state.assassinTripped && <Text style={styles.sub}>The assassin was tapped — instant loss for the other team.</Text>}

      <View style={styles.grid}>
        {state.tiles.map((tile, i) => (
          <WordTile key={tile.word + i} word={tile.word} team={tile.team} revealed spyView onPress={() => {}} />
        ))}
      </View>

      {isHost ? (
        <View style={styles.actions}>
          <PrimaryButton label="Play Again" icon="refresh" color={colors.cyan} onPress={onPlayAgain} />
          <PrimaryButton label="End Game" variant="ghost" color={colors.textMuted} onPress={onEndGame} style={styles.endBtn} />
        </View>
      ) : (
        <Text style={styles.waitingText}>Waiting for the board phone…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  grid: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'flex-start',
    gap: '1%' as unknown as number,
    marginTop: spacing.md,
  },
  actions: {
    width: '100%',
    marginTop: spacing.lg,
  },
  endBtn: {
    marginTop: spacing.sm,
  },
  waitingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    marginTop: spacing.lg,
  },
});
