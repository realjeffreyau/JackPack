import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../../theme/theme';

interface Props {
  onDone: (prompts: string[]) => void;
}

export function CustomPromptInput({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState('');
  const [prompts, setPrompts] = useState<string[]>([]);

  function addPrompt() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setPrompts((prev) => [...prev, trimmed]);
    setInput('');
  }

  function removePrompt(index: number) {
    setPrompts((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <Text style={styles.title}>Your Prompts</Text>
      <Text style={styles.sub}>
        Add questions about the group (e.g. "Who would survive a horror movie?")
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a prompt…"
          placeholderTextColor={colors.textFaint}
          returnKeyType="done"
          onSubmitEditing={addPrompt}
        />
        <Pressable
          onPress={addPrompt}
          disabled={!input.trim()}
          style={({ pressed }) => [
            styles.addBtn,
            { opacity: !input.trim() ? 0.4 : pressed ? 0.7 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add prompt"
        >
          <Ionicons name="add" size={24} color={colors.lime} />
        </Pressable>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {prompts.map((p, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={2}>
              {p}
            </Text>
            <Pressable
              onPress={() => removePrompt(i)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove prompt: ${p}`}
            >
              <Ionicons name="close-circle" size={20} color={colors.textFaint} />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      <PrimaryButton
        label={`Continue (${prompts.length} prompt${prompts.length !== 1 ? 's' : ''})`}
        color={colors.lime}
        onPress={() => onDone(prompts)}
        disabled={prompts.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  addBtn: {
    padding: spacing.sm,
  },
  list: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  listContent: {
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lime + '44',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chipText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },
});
