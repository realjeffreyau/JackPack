import { useCallback, useRef } from 'react';

/** Fisher–Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * A self-refilling "deck": draws items in random order with no repeats until
 * the whole list has been used, then reshuffles and starts over.
 */
export function useDeck<T>(items: readonly T[]): () => T {
  const pile = useRef<T[]>(shuffle(items));

  return useCallback(() => {
    if (pile.current.length === 0) {
      pile.current = shuffle(items);
    }
    return pile.current.pop() as T;
  }, [items]);
}
