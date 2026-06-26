import { useCallback, useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { playExplosionSound, playFastTickSound, playTickSound } from './sounds';

/**
 * Urgency stage derived from the fraction of hidden time remaining. Drives both
 * the ticking cadence and the on-screen tension — but never reveals the clock.
 *   0: 100%–50% left   1: 50%–25% left   2: 25%–10% left   3: final 10%
 */
export type BombStage = 0 | 1 | 2 | 3;

function stageForFraction(f: number): BombStage {
  if (f > 0.5) return 0;
  if (f > 0.25) return 1;
  if (f > 0.1) return 2;
  return 3;
}

/** Tick interval (ms) for a stage — slow early, panic at the end. */
const STAGE_INTERVAL: Record<BombStage, number> = {
  0: 2500,
  1: 1500,
  2: 750,
  3: 350,
};

interface BombTimerOptions {
  /** Fired whenever the urgency stage advances (for visuals). */
  onStage: (stage: BombStage) => void;
  /** Fired exactly once when the hidden timer hits zero. */
  onExplode: () => void;
}

interface BombTimerControls {
  /** Begin a fresh bomb cycle with a hidden duration (ms). */
  start: (durationMs: number) => void;
  /** Freeze the hidden countdown (e.g. while editing teams). */
  pause: () => void;
  /** Resume a paused countdown from where it froze. */
  resume: () => void;
  /** Cancel everything — no explosion fires. */
  stop: () => void;
}

/**
 * Self-scheduling bomb timer. Each fire decrements the remaining time by the
 * real elapsed delta, so pausing is just "stop scheduling" and the clock never
 * needs to be displayed. The tick cadence speeds up as a percentage of the
 * randomized duration, so a 40s bomb and a 95s bomb both feel natural.
 */
export function useBombTimer({ onStage, onExplode }: BombTimerOptions): BombTimerControls {
  const durationRef = useRef(0);
  const remainingRef = useRef(0);
  const lastRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);

  // Keep callbacks fresh without re-creating the scheduler each render.
  const onStageRef = useRef(onStage);
  const onExplodeRef = useRef(onExplode);
  onStageRef.current = onStage;
  onExplodeRef.current = onExplode;

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    remainingRef.current -= now - lastRef.current;
    lastRef.current = now;

    if (remainingRef.current <= 0) {
      clearTimer();
      Vibration.vibrate([0, 400, 120, 400]); // strong, distinct explosion buzz
      playExplosionSound();
      onExplodeRef.current();
      return;
    }

    const fraction = remainingRef.current / durationRef.current;
    const stage = stageForFraction(fraction);
    onStageRef.current(stage);
    Vibration.vibrate(stage >= 3 ? 45 : 18); // light tick haptic
    if (stage >= 3) playFastTickSound();
    else playTickSound();

    const delay = Math.min(STAGE_INTERVAL[stage], remainingRef.current);
    timeoutRef.current = setTimeout(tick, delay);
  }, [clearTimer]);

  const start = useCallback(
    (durationMs: number) => {
      clearTimer();
      durationRef.current = durationMs;
      remainingRef.current = durationMs;
      lastRef.current = Date.now();
      pausedRef.current = false;
      onStageRef.current(0);
      timeoutRef.current = setTimeout(tick, STAGE_INTERVAL[0]);
    },
    [clearTimer, tick],
  );

  const pause = useCallback(() => {
    if (pausedRef.current || timeoutRef.current === null) return;
    remainingRef.current -= Date.now() - lastRef.current;
    pausedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!pausedRef.current) return;
    pausedRef.current = false;
    lastRef.current = Date.now();
    const remaining = Math.max(0, remainingRef.current);
    const fraction = durationRef.current > 0 ? remaining / durationRef.current : 0;
    timeoutRef.current = setTimeout(tick, Math.min(STAGE_INTERVAL[stageForFraction(fraction)], remaining));
  }, [tick]);

  const stop = useCallback(() => {
    clearTimer();
    pausedRef.current = false;
  }, [clearTimer]);

  // Clean up any pending timeout if the engine unmounts mid-bomb.
  useEffect(() => clearTimer, [clearTimer]);

  return { start, pause, resume, stop };
}
