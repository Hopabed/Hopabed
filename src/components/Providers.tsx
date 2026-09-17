"use client";

import { AuthProvider as AppAuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { AuthProvider as LegacyAuthProvider } from "./AuthProvider";
import { WishlistProvider } from "./WishlistProvider";
import { AuthModal } from "./AuthModal";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LegacyAuthProvider>
      <AppAuthProvider>
        <BookingProvider>
          <WishlistProvider>
            {children}
            <AuthModal />
          </WishlistProvider>
        </BookingProvider>
      </AppAuthProvider>
    </LegacyAuthProvider>
  );
}
