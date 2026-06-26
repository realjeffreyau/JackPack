import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, spacing } from '../../../theme/theme';

interface Props {
  accent: string;
  onShowPrompt: () => void;
}

export function AllAssigned({ accent, onShowPrompt }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      <View style={styles.center}>
        <Ionicons name="checkmark-done-circle" size={72} color={accent} />
        <Text style={styles.title}>All agendas assigned</Text>
        <Text style={styles.body}>Everyone has their secret objective. Time to discuss the prompt.</Text>
      </View>
      <PrimaryButton label="Show Prompt" icon="arrow-forward" color={accent} onPress={onShowPrompt} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.text, textAlign: 'center', marginTop: spacing.md },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.md },
});
