import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { AUTH_STORAGE_KEY } from '../config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Set auth headers on every render so they're ready before any child effect runs (avoids 401 race).
  api.setAuthHeaders(user ? { 'X-User-Id': user.email } : {});

  const signIn = useCallback((email, password) => {
    const u = { email, name: email.split('@')[0] };
    setUser(u);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
  }, []);

  const signUp = useCallback((email, password, name) => {
    const u = { email, name: name || email.split('@')[0] };
    setUser(u);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    api.setAuthHeaders(user ? { 'X-User-Id': user.email } : {});
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
