import AsyncStorage from '@react-native-async-storage/async-storage';

export const OOTL_TOPIC_HISTORY_KEY = 'jackpack:ootl-recent-topics';

// Rolling window — big enough that the whole topic bank cycles before a
// topic can repeat on this device, small enough it doesn't grow unbounded.
const MAX_HISTORY = 40;

export async function loadRecentTopics(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(OOTL_TOPIC_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Appends a newly-used topic to the rolling history, trimmed to the most recent MAX_HISTORY. */
export async function recordUsedTopic(previous: string[], newlyUsed: string): Promise<void> {
  try {
    const merged = [...previous, newlyUsed];
    const trimmed = merged.slice(Math.max(0, merged.length - MAX_HISTORY));
    await AsyncStorage.setItem(OOTL_TOPIC_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}
