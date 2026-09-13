import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const TOKEN_STORAGE_KEY = 'silpo.session.token';
const USER_STORAGE_KEY = 'silpo.session.user';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  onboardingCompleted: boolean;
};

type SessionContextValue = {
  token: string | null;
  user: SessionUser | null;
  isAuthenticated: boolean;
  /** `true` enquanto a sessão persistida ainda está sendo carregada do storage. */
  isLoading: boolean;
  login: (token: string, user: SessionUser) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as SessionUser);
        }
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(newToken: string, newUser: SessionUser) {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken),
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      AsyncStorage.removeItem(USER_STORAGE_KEY),
    ]);
    setToken(null);
    setUser(null);
  }

  const value = useMemo<SessionContextValue>(
    () => ({ token, user, isAuthenticated: token !== null, isLoading, login, logout }),
    [token, user, isLoading],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession precisa ser usado dentro de um SessionProvider');
  }

  return context;
}
