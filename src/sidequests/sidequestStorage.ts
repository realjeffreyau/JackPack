import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LeaderboardEntry } from './types';

const ENABLED_KEY = 'jackpack:sidequests-enabled';
const LEADERBOARD_KEY = 'jackpack:sidequest-leaderboard';

export async function loadSidequestsEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ENABLED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function saveSidequestsEnabled(v: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(ENABLED_KEY, v ? 'true' : 'false');
  } catch {}
}

export async function loadSidequestLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export async function saveSidequestLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {}
}

export async function clearSidequestLeaderboard(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LEADERBOARD_KEY);
  } catch {}
}
