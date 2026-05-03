import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadFromStorage() {
  const token = localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  const user = raw ? (JSON.parse(raw) as AuthUser) : null;
  return { user, token };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadFromStorage);

  function login(user: AuthUser, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({ user, token });
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, token: null });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
