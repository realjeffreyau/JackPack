import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../PrimaryButton';
import { BackButton } from '../BackButton';
import { colors, fonts, glow, radius, spacing } from '../../theme/theme';
import type { Sidequest } from '../../sidequests/types';

type Outcome = 'completed' | 'failed' | 'caught';
type Screen = 'choice' | 'catcher' | 'result';

interface Props {
  sidequest: Sidequest;
  playerName: string;
  otherPlayers: string[];
  onResolve: (outcome: Outcome, catcherName?: string) => void;
}

function ResultScreen({
  outcome,
  catcherName,
}: {
  outcome: Outcome;
  catcherName?: string;
}) {
  const isCompleted = outcome === 'completed';
  const isCaught = outcome === 'caught';

  const icon = isCompleted ? 'star' : isCaught ? 'alert-circle' : 'close-circle';
  const iconColor = isCompleted ? colors.success : isCaught ? colors.danger : colors.textFaint;

  const message = isCompleted
    ? '+100 Sidequest points!'
    : isCaught
    ? `${catcherName} caught you!\n+200 pts to ${catcherName}.`
    : 'Sidequest failed.\nNo points this time.';

  const label = isCompleted
    ? 'Completed!'
    : isCaught
    ? 'Caught!'
    : 'Failed';

  return (
    <View style={result.root}>
      <Ionicons name={icon} size={64} color={iconColor} />
      <Text style={[result.label, { color: iconColor }]}>{label}</Text>
      <Text style={result.message}>{message}</Text>
    </View>
  );
}

const result = StyleSheet.create({
  root: { alignItems: 'center', gap: spacing.lg },
  label: { fontFamily: fonts.display, fontSize: 32 },
  message: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export function SidequestCheckModal({ sidequest, playerName: _playerName, otherPlayers, onResolve }: Props) {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('choice');
  const [selectedCatcher, setSelectedCatcher] = useState<string | null>(null);
  const [resolvedOutcome, setResolvedOutcome] = useState<Outcome | null>(null);
  const [resolvedCatcher, setResolvedCatcher] = useState<string | undefined>(undefined);

  function handleChoice(outcome: Outcome) {
    if (outcome === 'caught') {
      setScreen('catcher');
      return;
    }
    setResolvedOutcome(outcome);
    setResolvedCatcher(undefined);
    setScreen('result');
  }

  function handleCatcherSubmit() {
    if (!selectedCatcher) return;
    setResolvedOutcome('caught');
    setResolvedCatcher(selectedCatcher);
    setScreen('result');
  }

  function handleContinue() {
    if (!resolvedOutcome) return;
    onResolve(resolvedOutcome, resolvedCatcher);
  }

  const padStyle = {
    paddingTop: insets.top + spacing.xl,
    paddingBottom: insets.bottom + spacing.xl,
  };

  if (screen === 'result' && resolvedOutcome) {
    return (
      <View style={[styles.overlay, padStyle]}>
        <View style={styles.content}>
          <ResultScreen outcome={resolvedOutcome} catcherName={resolvedCatcher} />
          <View style={styles.buttonArea}>
            <PrimaryButton label="Continue" color={colors.sidequest} onPress={handleContinue} />
          </View>
        </View>
        <BackButton onPress={() => setScreen('choice')} />
      </View>
    );
  }

  if (screen === 'catcher') {
    return (
      <View style={[styles.overlay, padStyle]}>
        <View style={styles.content}>
          <View style={styles.iconRing}>
            <Ionicons name="alert-circle" size={28} color={colors.danger} />
          </View>
          <Text style={styles.eyebrow}>WHO CAUGHT YOU?</Text>
          <Text style={styles.sub}>Select the player who spotted your Sidequest.</Text>
          <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.pickerList}>
              {otherPlayers.map((name) => {
                const active = selectedCatcher === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => setSelectedCatcher(name)}
                    style={({ pressed }) => [
                      styles.catcherChip,
                      active && styles.catcherChipActive,
                      { opacity: pressed && !active ? 0.7 : 1 },
                    ]}
                  >
                    <Text style={[styles.catcherChipText, active && styles.catcherChipTextActive]}>
                      {name}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={colors.danger} />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.buttonArea}>
            <PrimaryButton
              label="Confirm"
              color={colors.danger}
              disabled={!selectedCatcher}
              onPress={handleCatcherSubmit}
            />
          </View>
        </View>
        <BackButton onPress={() => setScreen('choice')} />
      </View>
    );
  }

  return (
    <View style={[styles.overlay, padStyle]}>
      <View style={styles.content}>
        <View style={styles.iconRing}>
          <Ionicons name="compass" size={28} color={colors.sidequest} />
        </View>
        <Text style={styles.eyebrow}>SIDEQUEST CHECK</Text>
        <View style={styles.taskCard}>
          <Text style={styles.task}>{sidequest.text}</Text>
        </View>
        <Text style={styles.sub}>How did it go?</Text>

        <View style={styles.outcomeRow}>
          <Pressable
            onPress={() => handleChoice('completed')}
            style={({ pressed }) => [styles.outcomeBtn, styles.outcomeBtnCompleted, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Ionicons name="star" size={24} color={colors.success} />
            <Text style={[styles.outcomeBtnLabel, { color: colors.success }]}>Completed</Text>
            <Text style={styles.outcomeBtnPts}>+100 pts</Text>
          </Pressable>

          <Pressable
            onPress={() => handleChoice('failed')}
            style={({ pressed }) => [styles.outcomeBtn, styles.outcomeBtnFailed, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Ionicons name="close-circle-outline" size={24} color={colors.textFaint} />
            <Text style={[styles.outcomeBtnLabel, { color: colors.textMuted }]}>Failed</Text>
            <Text style={styles.outcomeBtnPts}>0 pts</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => handleChoice('caught')}
          style={({ pressed }) => [styles.outcomeBtnCaught, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="alert-circle-outline" size={22} color={colors.danger} />
          <View>
            <Text style={[styles.outcomeBtnLabel, { color: colors.danger }]}>Caught</Text>
            <Text style={[styles.outcomeBtnPts, { color: colors.textFaint }]}>Catcher gets +200 pts</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sidequest + '18',
    borderWidth: 1.5,
    borderColor: colors.sidequest + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bodyExtra,
    fontSize: 12,
    letterSpacing: 3,
    color: colors.sidequest,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  taskCard: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.sidequest + '2A',
    padding: spacing.lg,
  },
  task: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 25,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  outcomeBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 2,
  },
  outcomeBtnCompleted: {
    backgroundColor: colors.success + '18',
    borderColor: colors.success + '66',
    ...glow(colors.success, 0.1),
  },
  outcomeBtnFailed: {
    backgroundColor: colors.bgElevated,
    borderColor: colors.border,
  },
  outcomeBtnLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  outcomeBtnPts: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textFaint,
  },
  outcomeBtnCaught: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.danger + '14',
    borderWidth: 2,
    borderColor: colors.danger + '44',
  },
  pickerScroll: {
    width: '100%',
    maxHeight: 260,
  },
  pickerList: {
    gap: spacing.sm,
  },
  catcherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  catcherChipActive: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '14',
  },
  catcherChipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: colors.textMuted,
  },
  catcherChipTextActive: {
    color: colors.danger,
  },
  buttonArea: {
    width: '100%',
  },
});
