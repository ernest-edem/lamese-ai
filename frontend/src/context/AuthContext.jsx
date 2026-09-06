import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSession,
  login,
  logout,
  subscribeToAuthChanges,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const currentSession = await getSession();

        if (mounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error("Failed to restore authentication session:", error);

        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = subscribeToAuthChanges((currentSession) => {
      if (mounted) {
        setSession(currentSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const authenticatedSession = await login(email, password);

    setSession(authenticatedSession.session);

    return authenticatedSession;
  }

  async function signOut() {
    await logout();
    setSession(null);
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      loading,
      signIn,
      signOut,
    }),
    [session, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider.",
    );
  }

  return context;
}