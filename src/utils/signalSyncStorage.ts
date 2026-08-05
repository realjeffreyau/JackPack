import AsyncStorage from '@react-native-async-storage/async-storage';

export const SIGNAL_SYNC_BEST_KEY = 'jackpack:signal-sync-best';
export const SIGNAL_SYNC_PROMPT_HISTORY_KEY = 'jackpack:signal-sync-recent-prompts';

const MAX_HISTORY = 60;

export interface SignalSyncBest {
  bestAccuracy: number;
  lastScore: number;
  lastMax: number;
}

/** Returns null when nothing has been stored yet. */
export async function loadSignalSyncBest(): Promise<SignalSyncBest | null> {
  try {
    const raw = await AsyncStorage.getItem(SIGNAL_SYNC_BEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as SignalSyncBest : null;
  } catch {
    return null;
  }
}

/** Records a completed game, preserving the highest accuracy achieved. */
export async function recordSignalSyncResult(score: number, max: number): Promise<void> {
  try {
    if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return;
    const previous = await loadSignalSyncBest();
    const accuracy = Math.min(1, Math.max(0, score / max));
    const result: SignalSyncBest = {
      bestAccuracy: Math.max(previous?.bestAccuracy ?? 0, accuracy),
      lastScore: score,
      lastMax: max,
    };
    await AsyncStorage.setItem(SIGNAL_SYNC_BEST_KEY, JSON.stringify(result));
  } catch {}
}

/** Loads recently used spectrum ids, or an empty list when unavailable. */
export async function loadRecentSpectrumIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(SIGNAL_SYNC_PROMPT_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Appends spectrum ids to the rolling history, trimmed to the most recent MAX_HISTORY. */
export async function recordUsedSpectrumIds(ids: string[]): Promise<void> {
  try {
    const prev = await loadRecentSpectrumIds();
    const merged = [...prev, ...ids];
    const trimmed = merged.slice(Math.max(0, merged.length - MAX_HISTORY));
    await AsyncStorage.setItem(SIGNAL_SYNC_PROMPT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}
