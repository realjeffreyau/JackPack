import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, glow, radius, spacing } from '../../theme/theme';
import { useSidequestContext } from '../../sidequests/SidequestContext';
import type { LeaderboardEntry } from '../../sidequests/types';

interface Props {
  onClose: () => void;
}

const RANK_ICONS: Record<number, { name: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  0: { name: 'trophy', color: '#FFD700' },
  1: { name: 'medal', color: '#C0C0C0' },
  2: { name: 'ribbon', color: '#CD7F32' },
};

function sortedLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.points - a.points);
}

export function SidequestPanel({ onClose }: Props) {
  const insets = useSafeAreaInsets();
  const sq = useSidequestContext();
  const [confirmReset, setConfirmReset] = useState(false);

  const sorted = sortedLeaderboard(sq.leaderboard);

  function handleReset() {
    sq.resetLeaderboard();
    setConfirmReset(false);
  }

  return (
    <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.panel}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="compass" size={18} color={colors.sidequest} />
            </View>
            <Text style={styles.title}>Sidequests</Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="close" size={22} color={colors.textFaint} />
          </Pressable>
        </View>

        {/* Toggle card */}
        <View style={[styles.toggleCard, sq.enabled && styles.toggleCardOn]}>
          <View style={styles.toggleLabel}>
            <Text style={styles.toggleTitle}>
              {sq.enabled ? 'Active' : 'Disabled'}
            </Text>
            <Text style={styles.toggleSub}>Secret missions during supported games</Text>
          </View>
          <Pressable
            onPress={() => sq.setEnabled(!sq.enabled)}
            accessibilityRole="switch"
            accessibilityState={{ checked: sq.enabled }}
            style={[styles.togglePill, sq.enabled && styles.togglePillOn]}
          >
            <View style={[styles.toggleThumb, sq.enabled && styles.toggleThumbOn]} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Leaderboard header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LEADERBOARD</Text>
            {sorted.length > 0 && !confirmReset && (
              <Pressable
                onPress={() => setConfirmReset(true)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={styles.resetLink}>Reset</Text>
              </Pressable>
            )}
          </View>

          {sorted.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="compass-outline" size={40} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>No points yet</Text>
              <Text style={styles.emptySub}>
                Enable Sidequests and play to earn points.
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {sorted.map((entry, i) => {
                const rankMeta = RANK_ICONS[i];
                const isTop = i === 0;
                return (
                  <View
                    key={entry.normalizedName}
                    style={[styles.leaderboardRow, isTop && styles.leaderboardRowTop]}
                  >
                    <View style={styles.rankCell}>
                      {rankMeta ? (
                        <Ionicons name={rankMeta.name} size={18} color={rankMeta.color} />
                      ) : (
                        <Text style={styles.rankNum}>{i + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.entryName, isTop && styles.entryNameTop]}>
                      {entry.name}
                    </Text>
                    <Text style={[styles.entryPoints, isTop && styles.entryPointsTop]}>
                      {entry.points}
                      <Text style={styles.ptsSuffix}> pts</Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Reset confirm */}
          {confirmReset && (
            <View style={styles.confirmBox}>
              <Ionicons name="warning-outline" size={22} color={colors.danger} />
              <Text style={styles.confirmText}>
                Reset all Sidequest points? This cannot be undone.
              </Text>
              <View style={styles.confirmBtns}>
                <Pressable
                  onPress={() => setConfirmReset(false)}
                  style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleReset}
                  style={({ pressed }) => [styles.confirmResetBtn, { opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.confirmResetBtnText}>Confirm Reset</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 300,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000088',
  },
  panel: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    paddingTop: spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.sidequest + '18',
    borderWidth: 1,
    borderColor: colors.sidequest + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.md,
  },
  toggleCardOn: {
    borderColor: colors.sidequest + '55',
    backgroundColor: colors.sidequest + '0E',
    ...glow(colors.sidequest, 0.08),
  },
  toggleLabel: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  toggleSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 2,
  },
  togglePill: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  togglePillOn: {
    backgroundColor: colors.sidequest,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textFaint,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 2.5,
    color: colors.sidequest,
  },
  resetLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.textMuted,
  },
  emptySub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textFaint,
    textAlign: 'center',
    lineHeight: 20,
  },
  leaderboardList: {
    gap: spacing.sm,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  leaderboardRowTop: {
    borderColor: '#FFD70033',
    backgroundColor: '#FFD70008',
    ...glow('#FFD700', 0.06),
  },
  rankCell: {
    width: 28,
    alignItems: 'center',
  },
  rankNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textFaint,
  },
  entryName: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textMuted,
  },
  entryNameTop: {
    color: colors.text,
  },
  entryPoints: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.textMuted,
  },
  entryPointsTop: {
    color: colors.sidequest,
  },
  ptsSuffix: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  confirmBox: {
    marginTop: spacing.lg,
    backgroundColor: colors.danger + '14',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.danger + '44',
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 21,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: colors.textMuted,
  },
  confirmResetBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  confirmResetBtnText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
