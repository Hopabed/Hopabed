"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, authenticateWithPassword, authenticateWithGoogle, logoutUser } from "@/lib/api";

export type UserRole = "GUEST" | "HOST" | "ADMIN" | "guest" | "host" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleHostMode: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u as User))
      .catch(() => setUser(null))
      .finally(() => setInitialized(true));
  }, []);

  async function login(email: string, password: string) {
    const res = await authenticateWithPassword({ email, password, mode: "login" });
    setUser(res.data.user as User);
    setIsAuthModalOpen(false);
  }

  async function signup(name: string, email: string, password: string) {
    const res = await authenticateWithPassword({ name, email, password, mode: "signup" });
    setUser(res.data.user as User);
    setIsAuthModalOpen(false);
  }

  async function googleLogin(credential: string) {
    const res = await authenticateWithGoogle(credential);
    setUser(res.data.user as User);
    setIsAuthModalOpen(false);
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  function toggleHostMode() {
    if (!user) return;
    setUser({ ...user, role: String(user.role).toUpperCase() === "HOST" ? "GUEST" : "HOST" });
  }

  return (
    <AuthContext.Provider
      value={{
        user: initialized ? user : null,
        isAuthenticated: !!user,
        login,
        signup,
        googleLogin,
        logout,
        toggleHostMode,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
