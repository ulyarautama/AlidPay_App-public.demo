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
import {
  clearAccountSelectionRequirement,
  isAccountSelectionRequired,
} from "../lib/accountSelection";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  public_id?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "pembeli" | "penjual";
  auth_provider?: "manual" | "google";
  balance: number;
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
  if (pathname === "/account/switch") return false;

  return protectedUserRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

type SessionStatus = "unchecked" | "authenticated" | "guest";

let currentUserRequest: Promise<User | null> | null = null;

function loadCurrentUser() {
  if (currentUserRequest) return currentUserRequest;

  currentUserRequest = api
    .get("/api/me", { timeout: 8000 })
    .then((res) => res.data.user as User)
    .catch(() => null)
    .finally(() => {
      currentUserRequest = null;
    });

  return currentUserRequest;
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
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("unchecked");
  const loading = needsUserAuth && sessionStatus === "unchecked";

  const refreshUser = useCallback(async () => {
    const authenticatedUser = await loadCurrentUser();
    if (authenticatedUser) clearAccountSelectionRequirement();
    setUser(authenticatedUser);
    setSessionStatus(authenticatedUser ? "authenticated" : "guest");
  }, []);

  useEffect(() => {
    if (!needsUserAuth || sessionStatus !== "unchecked") return;

    let active = true;

    loadCurrentUser()
      .then((authenticatedUser) => {
        if (active) {
          if (authenticatedUser) clearAccountSelectionRequirement();
          setUser(authenticatedUser);
          setSessionStatus(authenticatedUser ? "authenticated" : "guest");
        }
      });

    return () => {
      active = false;
    };
  }, [needsUserAuth, sessionStatus]);

  useEffect(() => {
    const revalidateRestoredPage = (event: PageTransitionEvent) => {
      if (event.persisted && needsUserAuth) void refreshUser();
    };
    window.addEventListener("pageshow", revalidateRestoredPage);
    return () => window.removeEventListener("pageshow", revalidateRestoredPage);
  }, [needsUserAuth, refreshUser]);

  useEffect(() => {
    if (loading || user) return;

    const authEntryRoute = pathname === "/login"
      || pathname === "/register"
      || pathname === "/verify-email";

    if (
      isAccountSelectionRequired()
      && pathname !== "/account/switch"
      && !authEntryRoute
      && !pathname.startsWith("/admin")
    ) {
      router.replace("/account/switch?required=1");
      return;
    }

    if (protectedRoute) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, protectedRoute, router, user]);

  function login(user: User) {
    clearAccountSelectionRequirement();
    setUser(user);
    setSessionStatus("authenticated");
  }

  function logout() {
    setUser(null);
    setSessionStatus("guest");
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
