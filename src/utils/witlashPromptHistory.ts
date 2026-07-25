import AsyncStorage from '@react-native-async-storage/async-storage';

export const WITLASH_PROMPT_HISTORY_KEY = 'jackpack:witlash-recent-prompts';

// Rolling window — big enough that the whole 300-prompt bank cycles before a
// prompt can repeat on this device, small enough it doesn't grow unbounded.
const MAX_HISTORY = 200;

export async function loadRecentPromptIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(WITLASH_PROMPT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Appends newly-used ids to the rolling history, trimmed to the most recent MAX_HISTORY. */
export async function recordUsedPromptIds(previous: string[], newlyUsed: string[]): Promise<void> {
  try {
    const merged = [...previous, ...newlyUsed];
    const trimmed = merged.slice(Math.max(0, merged.length - MAX_HISTORY));
    await AsyncStorage.setItem(WITLASH_PROMPT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}
