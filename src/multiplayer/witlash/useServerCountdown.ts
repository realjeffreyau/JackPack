import { useEffect, useState } from 'react';

function computeRemaining(endsAtIso: string | null): number {
  if (!endsAtIso) return 0;
  const remainingMs = new Date(endsAtIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

/** Ticks a local 1s interval, computing remaining seconds from a server timestamp. No Supabase writes. */
export function useServerCountdown(endsAtIso: string | null): number {
  const [timeLeft, setTimeLeft] = useState(() => computeRemaining(endsAtIso));

  useEffect(() => {
    setTimeLeft(computeRemaining(endsAtIso));
    if (!endsAtIso) return undefined;

    const id = setInterval(() => {
      setTimeLeft(computeRemaining(endsAtIso));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAtIso]);

  return timeLeft;
}
