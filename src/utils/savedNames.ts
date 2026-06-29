import AsyncStorage from '@react-native-async-storage/async-storage';

export const PLAYER_NAMES_KEY = 'jackpack:player-names';
export const TEAM_NAMES_KEY = 'jackpack:team-names';

export async function loadSavedNames(key: string): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function persistNames(key: string, names: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(names));
  } catch {}
}

export async function clearSavedNames(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}
