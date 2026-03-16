import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/api/auth";
import { getMe } from "@/api/auth";
import {
  getAuthToken,
  setAuthToken as persistToken,
  clearAuthToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from "@/constants";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isReady: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    persistToken(newToken);
    setStoredUser(newUser as unknown as Record<string, unknown>);
    setTokenState(newToken);
    setUserState(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    clearStoredUser();
    setTokenState(null);
    setUserState(null);
  }, []);

  useEffect(() => {
    const t = getAuthToken();
    if (!t) {
      setTokenState(null);
      setUserState(null);
      setIsReady(true);
      return;
    }
    setTokenState(t);
    setUserState(getStoredUser() as AuthUser | null);
    setIsLoading(true);
    getMe()
      .then((u) => {
        setUserState(u);
        setStoredUser(u as unknown as Record<string, unknown>);
      })
      .catch(() => {
        clearAuthToken();
        clearStoredUser();
        setTokenState(null);
        setUserState(null);
      })
      .finally(() => {
        setIsLoading(false);
        setIsReady(true);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isReady,
      login,
      logout,
      setUser: setUserState,
    }),
    [user, token, isLoading, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
