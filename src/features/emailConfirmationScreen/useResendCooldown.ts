import { useCallback, useEffect, useState } from 'react';

export function useResendCooldown(cooldownSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timeout = setTimeout(() => setSecondsLeft((current) => current - 1), 1000);

    return () => clearTimeout(timeout);
  }, [secondsLeft]);

  const restart = useCallback(() => setSecondsLeft(cooldownSeconds), [cooldownSeconds]);

  return { secondsLeft, isCoolingDown: secondsLeft > 0, restart };
}
