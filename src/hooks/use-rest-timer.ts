"use client";
import { useCallback, useEffect, useRef, useState } from "react";

interface RestTimerState {
  active: boolean;
  remaining: number;
  total: number;
}

export function useRestTimer(defaultSeconds = 90) {
  const [rest, setRest] = useState<RestTimerState>({ active: false, remaining: 0, total: defaultSeconds });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };

  const start = useCallback((sec = defaultSeconds) => {
    clear();
    setRest({ active: true, remaining: sec, total: sec });
    intervalRef.current = setInterval(() => {
      setRest((r) => {
        const remaining = r.remaining - 1;
        if (remaining <= 0) { clear(); return { ...r, active: false, remaining: 0 }; }
        return { ...r, remaining };
      });
    }, 1000);
  }, [defaultSeconds]);

  const add = useCallback((sec = 15) =>
    setRest((r) => ({ ...r, remaining: r.remaining + sec, total: r.total + sec })), []);

  const skip = useCallback(() => { clear(); setRest((r) => ({ ...r, active: false, remaining: 0 })); }, []);

  useEffect(() => clear, []);

  const mm = Math.floor(rest.remaining / 60);
  const ss = String(rest.remaining % 60).padStart(2, "0");
  return {
    rest, start, add, skip, label: `${mm}:${ss}`,
    progress: rest.total ? (rest.remaining / rest.total) * 100 : 0,
  };
}
