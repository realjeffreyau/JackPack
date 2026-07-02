import { Audio } from 'expo-av';

let _tick: Audio.Sound | null = null;
let _fastTick: Audio.Sound | null = null;
let _loaded = false;

/** Call once when the engine mounts. Safe to call repeatedly — no-ops if already loaded. */
export async function loadSounds(): Promise<void> {
  if (_loaded) return;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: false });
    const [a, b] = await Promise.all([
      Audio.Sound.createAsync(require('../../../assets/sounds/tick.wav'), { volume: 0.9 }),
      Audio.Sound.createAsync(require('../../../assets/sounds/fast-tick.wav'), { volume: 1.0 }),
    ]);
    _tick = a.sound;
    _fastTick = b.sound;
    _loaded = true;
  } catch {
    // Non-fatal — game still works without audio.
  }
}

/** Call when the engine unmounts to release native audio resources. */
export async function unloadSounds(): Promise<void> {
  try {
    await Promise.all([_tick?.unloadAsync(), _fastTick?.unloadAsync()]);
  } catch {
    // ignore
  } finally {
    _tick = null;
    _fastTick = null;
    _loaded = false;
  }
}

export function playTickSound(): void {
  _tick?.replayAsync().catch(() => {});
}

export function playFastTickSound(): void {
  _fastTick?.replayAsync().catch(() => {});
}
