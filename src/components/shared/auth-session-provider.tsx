"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { AuthApiError, logoutUser, refreshSession } from "@/lib/auth-api";

const AUTH_STATUS_COOKIE = "meetrix-auth-status";

type AuthStatus = "guest" | "authenticated";

type AuthSessionContextValue = {
  status: AuthStatus;
  markAuthenticated: () => void;
  markGuest: () => void;
  logout: () => Promise<void>;
};

const AuthSessionContext = React.createContext<AuthSessionContextValue | null>(
  null
);

function persistAuthStatus(status: AuthStatus) {
  document.cookie = `${AUTH_STATUS_COOKIE}=${status}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function AuthSessionProvider({
  children,
  initialStatus,
}: {
  children: React.ReactNode;
  initialStatus: AuthStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState<AuthStatus>(initialStatus);

  React.useEffect(() => {
    let isActive = true;

    const resolveSession = async () => {
      try {
        await refreshSession();
        if (isActive) {
          setStatus("authenticated");
          persistAuthStatus("authenticated");
        }
      } catch {
        if (isActive) {
          setStatus("guest");
          persistAuthStatus("guest");
        }
      }
    };

    void resolveSession();

    return () => {
      isActive = false;
    };
  }, []);

  const markAuthenticated = React.useCallback(() => {
    setStatus("authenticated");
    persistAuthStatus("authenticated");
  }, []);

  const markGuest = React.useCallback(() => {
    setStatus("guest");
    persistAuthStatus("guest");
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      if (!(error instanceof AuthApiError) || error.status !== 401) {
        throw error;
      }
    }

    setStatus("guest");
    persistAuthStatus("guest");
    router.replace("/");
    router.refresh();
  }, [router]);

  return (
    <AuthSessionContext.Provider
      value={{ status, markAuthenticated, markGuest, logout }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

function useAuthSession() {
  const context = React.useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used within an AuthSessionProvider");
  }

  return context;
}

export { AUTH_STATUS_COOKIE, AuthSessionProvider, useAuthSession };
