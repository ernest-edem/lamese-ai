import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login,
  logout,
  subscribeToAuthChanges,
} from "../services/authService";

import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = subscribeToAuthChanges((currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    const authenticatedSession = await login(
      email,
      password,
    );

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