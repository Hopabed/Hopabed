"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logoutUser } from "@/lib/api";

export type AuthUser = { id: string; name: string; email: string; role: string; phone?: string; avatarUrl?: string };

type AuthContextValue = {
  isOpen: boolean;
  isOwnerFlow: boolean;
  openAuth: (options?: { isOwnerFlow?: boolean }) => void;
  closeAuth: () => void;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOwnerFlow, setIsOwnerFlow] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => {
      setUser(null);
    });
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      isOwnerFlow,
      openAuth: (options?: { isOwnerFlow?: boolean }) => {
        const isOwner = Boolean(options && typeof options === "object" && "isOwnerFlow" in options && options.isOwnerFlow);
        setIsOwnerFlow(isOwner);
        setIsOpen(true);
      },
      closeAuth: () => {
        setIsOpen(false);
        setIsOwnerFlow(false);
      },
      user,
      setSession: (_token: string, authenticatedUser: AuthUser) => {
        setUser(authenticatedUser);
      },
      logout: () => {
        logoutUser().catch(console.error);
        setUser(null);
      },
    }),
    [isOpen, isOwnerFlow, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthModal() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      isOpen: false,
      isOwnerFlow: false,
      openAuth: () => {},
      closeAuth: () => {},
      user: null,
      setSession: () => {},
      logout: () => {},
    };
  }
  return context;
}
