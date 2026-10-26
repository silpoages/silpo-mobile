import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSession } from '@/features/auth/session/SessionContext';
import { ApiError } from '@/services/apiClient';
import { getJourney, type JourneyData } from './journeyService';

/** `journey` nulo significa que a última busca falhou. */
type JourneyResult = { userId: string; journey: JourneyData | null };

/**
 * Carrega o resumo da Jornada e o recarrega sempre que a tela volta a ficar em foco.
 * O resultado é guardado junto do usuário que o pediu: ao trocar de conta, o resumo
 * anterior deixa de valer e a tela volta ao carregamento.
 */
export function useJourney() {
  const { token, user, logout } = useSession();
  const userId = user?.id ?? null;
  const [result, setResult] = useState<JourneyResult | null>(null);

  const load = useCallback(
    (isCurrent: () => boolean) => {
      if (!token || !userId) {
        return;
      }

      getJourney(token)
        .then((journey) => {
          if (isCurrent()) {
            setResult({ userId, journey });
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

          setResult({ userId, journey: null });
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

  /** Busca de novo sem trocar a tela por um carregamento (mantém o último resumo). */
  const refresh = useCallback(() => load(() => true), [load]);

  /** Descarta o erro e mostra o carregamento enquanto busca de novo. */
  const retry = useCallback(() => {
    setResult(null);
    load(() => true);
  }, [load]);

  // Respostas atrasadas de outra conta ficam guardadas com o `userId` antigo e são ignoradas aqui.
  const current = result?.userId === userId ? result : null;

  return {
    journey: current?.journey ?? null,
    isLoading: token !== null && current === null,
    hasError: current !== null && current.journey === null,
    refresh,
    retry,
  };
}
