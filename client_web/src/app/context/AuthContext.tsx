"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "pembeli" | "penjual"
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.get("/api/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshUser().finally(() => {
        setLoading(false);
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function login(user: User) {
    setUser(user);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        refreshUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
