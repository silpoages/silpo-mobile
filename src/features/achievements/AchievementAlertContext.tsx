import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { useGlobalSearchParams, usePathname } from 'expo-router';
import { AchievementToast } from '@/components/achievements/AchievementToast';
import { useSession } from '@/features/auth/session/SessionContext';
import {
  acknowledgeAchievement,
  getPendingAchievements,
  type Achievement,
} from './achievementsService';
import { SUPPORT_ORIGIN } from './supportOrigin';

/** Espera o modal da ação (ex.: confirmar emoção) fechar antes de mostrar o aviso. */
const SHOW_DELAY_MS = 400;

type AlertQueue = { ownerId: string | null; items: Achievement[] };

type AchievementAlertContextValue = {
  /**
   * Procura desbloqueios ainda não vistos e os coloca na fila de avisos.
   * Chamar só depois que a API confirmar a ação principal. Nunca lança: uma falha da API de
   * conquistas não pode atrapalhar o resto do app.
   */
  checkForNewAchievements: () => void;
};

const AchievementAlertContext = createContext<AchievementAlertContextValue | null>(null);

/** Apoio e respiração aberta pelo Apoio: o aviso espera o usuário sair desses fluxos. */
function isSupportFlow(pathname: string, origin: string | string[] | undefined): boolean {
  return pathname === '/apoio' || (pathname === '/respiracao' && origin === SUPPORT_ORIGIN);
}

export function AchievementAlertProvider({ children }: { children: ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const { origem } = useGlobalSearchParams<{ origem?: string }>();

  const token = session.token;
  const userId = session.user?.id ?? null;

  /** Fila de avisos e a conta dona dela: ao trocar de usuário, a fila anterior some sozinha. */
  const [queueState, setQueueState] = useState<AlertQueue>({ ownerId: null, items: [] });
  const queue = queueState.ownerId === userId ? queueState.items : [];
  /** Avisos já mostrados nesta sessão: não voltam nem se o acknowledge falhar. */
  const handledIdsRef = useRef(new Set<string>());
  /** Usuário dono das respostas em andamento; respostas de outra conta são descartadas. */
  const currentUserIdRef = useRef(userId);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const checkForNewAchievements = useCallback(() => {
    if (!token || !userId) {
      return;
    }

    async function check(requestToken: string, requestUserId: string) {
      try {
        const pending = await getPendingAchievements(requestToken);
        if (currentUserIdRef.current !== requestUserId || pending.length === 0) {
          return;
        }

        const timeout = setTimeout(() => {
          if (currentUserIdRef.current !== requestUserId) {
            return;
          }
          setQueueState((state) => {
            const current = state.ownerId === requestUserId ? state.items : [];
            const queuedIds = new Set(current.map((item) => item.id));
            const fresh = pending.filter(
              (item) => !queuedIds.has(item.id) && !handledIdsRef.current.has(item.id),
            );
            return fresh.length > 0
              ? { ownerId: requestUserId, items: [...current, ...fresh] }
              : state;
          });
        }, SHOW_DELAY_MS);
        timeoutsRef.current.push(timeout);
      } catch {
        // Sem rede ou API fora: os avisos ficam pendentes e voltam na próxima verificação.
      }
    }

    void check(token, userId);
  }, [token, userId]);

  // Troca de usuário (login, logout ou outra conta): descarta a fila da conta anterior.
  useEffect(() => {
    currentUserIdRef.current = userId;
    handledIdsRef.current = new Set();
    clearTimeouts();
  }, [userId, clearTimeouts]);

  // Ao entrar (ou abrir o app já logado), mostra o que ficou pendente.
  useEffect(() => {
    checkForNewAchievements();
  }, [checkForNewAchievements]);

  // Ao voltar para o app, procura desbloqueios que ficaram para trás (ex.: falha de rede).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkForNewAchievements();
      }
    });
    return () => subscription.remove();
  }, [checkForNewAchievements]);

  useEffect(() => clearTimeouts, [clearTimeouts]);

  const current = queue[0] ?? null;

  // Estável por aviso: o toast reinicia o tempo de exibição se o callback mudar.
  const handleDismiss = useCallback(() => {
    if (!current) {
      return;
    }

    handledIdsRef.current.add(current.id);
    setQueueState((state) => ({
      ...state,
      items: state.items.filter((item) => item.id !== current.id),
    }));

    if (token) {
      // Se falhar, o aviso não volta nesta sessão; o backend o devolve só num próximo login.
      acknowledgeAchievement(token, current.id).catch(() => undefined);
    }
  }, [current, token]);

  const value = useMemo(() => ({ checkForNewAchievements }), [checkForNewAchievements]);
  const isVisible = current !== null && token !== null && !isSupportFlow(pathname, origem);

  return (
    <AchievementAlertContext.Provider value={value}>
      {children}
      {/* Um aviso por vez: o próximo da fila entra quando o atual termina de sair. */}
      {current && isVisible ? (
        <AchievementToast
          key={current.id}
          name={current.name}
          icon={current.icon}
          onDismiss={handleDismiss}
        />
      ) : null}
    </AchievementAlertContext.Provider>
  );
}

export function useAchievementAlerts(): AchievementAlertContextValue {
  const context = useContext(AchievementAlertContext);
  if (!context) {
    throw new Error('useAchievementAlerts precisa estar dentro de AchievementAlertProvider.');
  }
  return context;
}
