import { useCallback, useEffect, useRef, useState } from "react";

type UseRateLimitOptions = {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
};

type UseRateLimitReturn = {
  isLocked: boolean;
  remainingSeconds: number;
  recordAttempt: () => boolean;
  reset: () => void;
};

export function useRateLimit({
  maxAttempts = 5,
  windowMs = 60000,
  lockoutMs = 30000,
}: Partial<UseRateLimitOptions> = {}): UseRateLimitReturn {
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const attemptsRef = useRef<number[]>([]);
  const lockoutEndRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const interval = setInterval(() => {
      if (lockoutEndRef.current) {
        const remaining = Math.ceil(
          (lockoutEndRef.current - Date.now()) / 1000,
        );
        if (remaining <= 0) {
          setIsLocked(false);
          setRemainingSeconds(0);
          lockoutEndRef.current = null;
          attemptsRef.current = [];
        } else {
          setRemainingSeconds(remaining);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked]);

  const recordAttempt = useCallback((): boolean => {
    if (isLocked) {
      return false;
    }

    const now = Date.now();
    attemptsRef.current = attemptsRef.current.filter(
      (timestamp) => now - timestamp < windowMs,
    );
    attemptsRef.current.push(now);

    if (attemptsRef.current.length >= maxAttempts) {
      lockoutEndRef.current = now + lockoutMs;
      setIsLocked(true);
      setRemainingSeconds(Math.ceil(lockoutMs / 1000));
      return false;
    }

    return true;
  }, [isLocked, maxAttempts, windowMs, lockoutMs]);

  const reset = useCallback(() => {
    setIsLocked(false);
    setRemainingSeconds(0);
    lockoutEndRef.current = null;
    attemptsRef.current = [];
  }, []);

  return { isLocked, remainingSeconds, recordAttempt, reset };
}
