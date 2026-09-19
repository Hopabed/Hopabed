"use client";

import { useAuth, User } from "@/context/AuthContext";

export type AuthUser = User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useAuthModal() {
  const auth = useAuth();
  return {
    isOpen: auth.isAuthModalOpen,
    isOwnerFlow: false,
    openAuth: (_options?: { isOwnerFlow?: boolean }) => {
      auth.openAuthModal();
    },
    closeAuth: () => {
      auth.closeAuthModal();
    },
    user: auth.user,
    setSession: () => {},
    logout: () => {
      auth.logout();
    },
  };
}

