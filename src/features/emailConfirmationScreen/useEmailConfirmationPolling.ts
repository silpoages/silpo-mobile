import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { Credentials, SignInResult } from '@/features/auth/services/authService';
import { signIn } from '@/features/auth/services/authService';

const POLL_INTERVAL_MS = 5000;

export function useEmailConfirmationPolling(credentials: Credentials | null): SignInResult | null {
  const [confirmedResult, setConfirmedResult] = useState<SignInResult | null>(null);

  useEffect(() => {
    if (credentials === null || confirmedResult !== null) {
      return;
    }

    const currentCredentials = credentials;
    let isActive = true;
    let isChecking = false;

    async function checkConfirmation() {
      if (isChecking) {
        return;
      }

      isChecking = true;

      try {
        const result = await signIn(currentCredentials);

        if (isActive && result.isEmailConfirmed) {
          setConfirmedResult(result);
        }
      } catch {
        // ainda não confirmou (403), sem rede ou erro do servidor: tenta de novo depois
      } finally {
        isChecking = false;
      }
    }

    checkConfirmation();

    const interval = setInterval(checkConfirmation, POLL_INTERVAL_MS);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkConfirmation();
      }
    });

    return () => {
      isActive = false;
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [credentials, confirmedResult]);

  return confirmedResult;
}
