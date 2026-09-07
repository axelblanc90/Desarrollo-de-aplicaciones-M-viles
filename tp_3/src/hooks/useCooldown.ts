import { useState, useEffect, useCallback, useRef } from 'react';

export const useCooldown = (defaultSeconds = 60) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startCooldown = useCallback((duration: number = defaultSeconds) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setSecondsLeft(duration);

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [defaultSeconds]);

  const resetCooldown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setSecondsLeft(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    startCooldown,
    resetCooldown,
  };
};
