"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "../lib/axios";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  public_id?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "pembeli" | "penjual";
  auth_provider?: "manual" | "google";
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

const protectedUserRoutes = [
  "/create-transaction",
  "/notifications",
  "/requests",
  "/transaction",
  "/account",
];

function isProtectedUserRoute(pathname: string) {
  return protectedUserRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

async function loadCurrentUser() {
  return api
    .get("/api/me", { timeout: 8000 })
    .then((res) => res.data.user as User)
    .catch(() => null);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const needsUserAuth = !pathname.startsWith("/admin")
    && pathname !== "/privasi"
    && pathname !== "/ketentuan"
    && pathname !== "/bantuan";
  const protectedRoute = isProtectedUserRoute(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [sessionCheckedPath, setSessionCheckedPath] = useState<string | null>(null);
  const loading = needsUserAuth && sessionCheckedPath !== pathname;

  const refreshUser = useCallback(async () => {
    setUser(await loadCurrentUser());
    setSessionCheckedPath(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!needsUserAuth) return;

    let active = true;

    loadCurrentUser()
      .then((authenticatedUser) => {
        if (active) setUser(authenticatedUser);
      })
      .finally(() => {
        if (active) setSessionCheckedPath(pathname);
      });

    return () => {
      active = false;
    };
  }, [needsUserAuth, pathname]);

  useEffect(() => {
    const revalidateRestoredPage = () => void refreshUser();
    window.addEventListener("pageshow", revalidateRestoredPage);
    return () => window.removeEventListener("pageshow", revalidateRestoredPage);
  }, [refreshUser]);

  useEffect(() => {
    if (!loading && protectedRoute && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, protectedRoute, router, user]);

  function login(user: User) {
    setUser(user);
  }

  function logout() {
    setUser(null);
    setSessionCheckedPath(pathname);
  }

  if (protectedRoute && (loading || !user)) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center bg-[#F5EFE6] text-[#181715]"
      >
        <div className="text-center">
          <p className="text-3xl font-black tracking-[-0.06em]">
            Alid<span className="text-[#C85A28]">Pay</span>
          </p>
          <div className="mx-auto mt-4 h-1 w-24 overflow-hidden rounded-full bg-[#E0DDD5]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#C85A28]" />
          </div>
          <span className="sr-only">Memeriksa sesi akun...</span>
        </div>
      </div>
    );
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
