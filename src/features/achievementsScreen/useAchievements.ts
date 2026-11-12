import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSession } from '@/features/auth/session/SessionContext';
import { getAchievements, type Achievement } from '@/features/achievements/achievementsService';
import { ApiError } from '@/services/apiClient';

/** `achievements` nulo significa que a última busca falhou. */
type AchievementsResult = { userId: string; achievements: Achievement[] | null };

/**
 * Carrega as conquistas e as recarrega sempre que a tela volta a ficar em foco.
 * O resultado fica guardado junto do usuário que o pediu: ao trocar de conta, a lista
 * anterior deixa de valer e a tela volta ao carregamento.
 */
export function useAchievements() {
  const { token, user, logout } = useSession();
  const userId = user?.id ?? null;
  const [result, setResult] = useState<AchievementsResult | null>(null);

  const load = useCallback(
    (isCurrent: () => boolean) => {
      if (!token || !userId) {
        return;
      }

      getAchievements(token)
        .then((achievements) => {
          if (isCurrent()) {
            setResult({ userId, achievements });
          }
        })
        .catch((error: unknown) => {
          if (!isCurrent()) {
            return;
          }

          // Token inválido ou expirado: encerra a sessão em vez de mostrar um erro de rede.
          if (error instanceof ApiError && error.status === 401) {
            setResult(null);
            void logout();
            return;
          }

          setResult({ userId, achievements: null });
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

  /** Descarta o erro e mostra o carregamento enquanto busca de novo. */
  const retry = useCallback(() => {
    setResult(null);
    load(() => true);
  }, [load]);

  const current = result?.userId === userId ? result : null;

  return {
    achievements: current?.achievements ?? null,
    isLoading: token !== null && current === null,
    hasError: current !== null && current.achievements === null,
    retry,
  };
}
