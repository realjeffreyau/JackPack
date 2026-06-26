import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';
import { losingTeamIds, type Team } from '../types';

interface Props {
  visible: boolean;
  accent: string;
  teams: Team[];
  onClose: () => void;
  onEditTeams: () => void;
  onResetPoints: () => void;
  onExit: () => void;
}

export function StandingsModal({ visible, accent, teams, onClose, onEditTeams, onResetPoints, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const sorted = [...teams].sort((a, b) => b.points - a.points);
  const losing = losingTeamIds(teams);
  const losingNames = teams.filter((t) => losing.includes(t.id)).map((t) => t.name);

  function confirmReset() {
    Alert.alert('Reset all points?', 'Every team goes back to 0. Teams and names stay.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: onResetPoints },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Current Standings</Text>
          <Text style={styles.sub}>Most explosion points loses.</Text>

          {losingNames.length > 0 && (
            <View style={[styles.losingBanner, { borderColor: colors.danger + '66' }]}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.losingText}>
                Currently Losing: {losingNames.join(', ')}
              </Text>
            </View>
          )}

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {sorted.map((t, i) => {
              const isLosing = losing.includes(t.id);
              return (
                <View key={t.id} style={[styles.row, isLosing && { borderColor: colors.danger + '66' }]}>
                  <Text style={styles.rank}>{i + 1}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {t.name}
                  </Text>
                  <Text style={[styles.points, isLosing && { color: colors.danger }]}>
                    {t.points} pt{t.points === 1 ? '' : 's'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <PrimaryButton label="Back to Game" icon="arrow-back" color={accent} onPress={onClose} />
            <View style={styles.actionRow}>
              <PrimaryButton
                label="Edit Teams"
                variant="outline"
                size="md"
                color={colors.textMuted}
                onPress={onEditTeams}
                style={styles.flex}
              />
              <PrimaryButton
                label="Reset Points"
                variant="outline"
                size="md"
                color={colors.danger}
                onPress={confirmReset}
                style={styles.flex}
              />
            </View>
            <Pressable
              onPress={onExit}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go home"
              style={({ pressed }) => [styles.homeBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={styles.homeText}>Home</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  losingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#2A0C12',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  losingText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#FFB3B3',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
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
  rank: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textFaint,
    width: 22,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  points: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.text,
  },
  actions: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
  },
  homeBtn: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  homeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textMuted,
  },
});
