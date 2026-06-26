import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import { leaderIds, type Player } from '../types';

interface Props {
  visible: boolean;
  accent: string;
  players: Player[];
  onClose: () => void;
  onEditPlayers: () => void;
  onResetScores: () => void;
  onEndGame: () => void;
}

export function ScoreboardModal({ visible, accent, players, onClose, onEditPlayers, onResetScores, onEndGame }: Props) {
  const insets = useSafeAreaInsets();
  const sorted = [...players].sort((a, b) => b.points - a.points);
  const leaders = leaderIds(players);
  const leaderNames = players.filter((p) => leaders.includes(p.id)).map((p) => p.name);

  function confirmReset() {
    Alert.alert('Reset all scores?', 'Every player goes back to 0. Players and names stay.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: onResetScores },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Scoreboard</Text>
          <Text style={styles.subtitle}>Most successful agendas wins.</Text>

          {leaderNames.length > 0 && (
            <View style={[styles.leaderBanner, { borderColor: accent + '66' }]}>
              <Ionicons name="star" size={18} color={accent} />
              <Text style={[styles.leaderText, { color: accent }]}>
                {leaderNames.length > 1 ? 'Current Leaders: ' : 'Current Leader: '}
                {leaderNames.join(', ')}
              </Text>
            </View>
          )}

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {sorted.map((p, i) => {
              const isLeader = leaders.includes(p.id);
              return (
                <View key={p.id} style={[styles.row, isLeader && { borderColor: accent + '66' }]}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                  <Text style={[styles.points, isLeader && { color: accent }]}>
                    {p.points} pt{p.points === 1 ? '' : 's'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <PrimaryButton label="Back to Game" icon="arrow-back" color={accent} onPress={onClose} />
            <View style={styles.actionRow}>
              <PrimaryButton label="Edit Players" variant="outline" size="md" color={colors.textMuted} onPress={onEditPlayers} style={styles.flex} />
              <PrimaryButton label="Reset Scores" variant="outline" size="md" color={colors.danger} onPress={confirmReset} style={styles.flex} />
            </View>
            <Pressable
              onPress={onEndGame}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="End game"
              style={({ pressed }) => [styles.endBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={styles.endText}>End Game</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: radius.pill, backgroundColor: colors.border, marginBottom: spacing.lg },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.text },
  subtitle: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: 2, marginBottom: spacing.lg },
  leaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  leaderText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14 },
  list: { flexGrow: 0 },
  listContent: { gap: spacing.sm, paddingBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rank: { fontFamily: fonts.display, fontSize: 16, color: colors.textFaint, width: 22 },
  name: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  points: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
  actions: { gap: spacing.md, paddingTop: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  endBtn: { alignSelf: 'center', paddingVertical: spacing.sm },
  endText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textMuted },
});
