import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSession } from '@/features/auth/session/SessionContext';
import { ApiError } from '@/services/apiClient';
import { listMeditations, type Meditation } from './meditationService';

type MeditationsResult = { userId: string; meditations: Meditation[] | null };

export function useMeditations() {
  const { token, user, logout } = useSession();
  const userId = user?.id ?? null;
  const [result, setResult] = useState<MeditationsResult | null>(null);

  const load = useCallback(
    (isCurrent: () => boolean) => {
      if (!token || !userId) {
        return;
      }

      listMeditations(token)
        .then((meditations) => {
          if (isCurrent()) {
            setResult({ userId, meditations });
          }
        })
        .catch((error: unknown) => {
          if (!isCurrent()) {
            return;
          }

          if (error instanceof ApiError && error.status === 401) {
            setResult(null);
            void logout();
            return;
          }

          setResult({ userId, meditations: null });
        });
    },
    [token, userId, logout],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      load(() => active);

      return () => {
        active = false;
      };
    }, [load]),
  );

  const retry = useCallback(() => {
    setResult(null);
    load(() => true);
  }, [load]);

  const current = result?.userId === userId ? result : null;

  return {
    meditations: current?.meditations ?? null,
    isLoading: token !== null && current === null,
    hasError: current !== null && current.meditations === null,
    retry,
  };
}
