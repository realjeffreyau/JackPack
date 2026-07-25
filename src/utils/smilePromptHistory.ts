import AsyncStorage from '@react-native-async-storage/async-storage';

export const SMILE_PROMPT_HISTORY_KEY = 'jackpack:smile-recent-prompts';

// Rolling window — big enough that the whole prompt bank cycles before a
// prompt can repeat on this device, small enough it doesn't grow unbounded.
const MAX_HISTORY = 150;

export async function loadRecentPrompts(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SMILE_PROMPT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Appends a newly-drawn prompt to the rolling history, trimmed to the most recent MAX_HISTORY. */
export async function recordUsedPrompt(prompt: string): Promise<void> {
  try {
    const prev = await loadRecentPrompts();
    const merged = [...prev, prompt];
    const trimmed = merged.slice(Math.max(0, merged.length - MAX_HISTORY));
    await AsyncStorage.setItem(SMILE_PROMPT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}
