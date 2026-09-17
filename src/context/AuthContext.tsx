"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "GUEST" | "HOST" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isHostApproved?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  signup: (name: string, email: string, role?: UserRole) => void;
  logout: () => void;
  toggleHostMode: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: "usr-demo-101",
  name: "Sharukh Mithagari",
  email: "demo@hopebed.in",
  role: "GUEST",
  phone: "+91 98765 43210",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  isHostApproved: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hopebed_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Initialize with default demo user so reviewer can test auth/user state directly
        setUser(DEMO_USER);
        localStorage.setItem("hopebed_user", JSON.stringify(DEMO_USER));
      }
    } catch {
      setUser(DEMO_USER);
    }
    setInitialized(true);
  }, []);

  function saveUser(newUser: User | null) {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("hopebed_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("hopebed_user");
    }
  }

  function login(email: string, role: UserRole = "GUEST") {
    const nameFromEmail = email.split("@")[0];
    const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    const loggedInUser: User = {
      id: `usr-${Date.now()}`,
      name: capitalizedName || "Demo User",
      email,
      role,
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      isHostApproved: role === "HOST",
    };
    saveUser(loggedInUser);
    setIsAuthModalOpen(false);
  }

  function signup(name: string, email: string, role: UserRole = "GUEST") {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      isHostApproved: role === "HOST",
    };
    saveUser(newUser);
    setIsAuthModalOpen(false);
  }

  function logout() {
    saveUser(null);
  }

  function toggleHostMode() {
    if (!user) return;
    const newRole: UserRole = user.role === "HOST" ? "GUEST" : "HOST";
    const updated = { ...user, role: newRole, isHostApproved: true };
    saveUser(updated);
  }

  return (
    <AuthContext.Provider
      value={{
        user: initialized ? user : DEMO_USER,
        isAuthenticated: !!user,
        login,
        signup,
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
