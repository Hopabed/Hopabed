"use client";

import { AuthProvider as AppAuthProvider } from "@/context/AuthContext";
import { BookingProvider } from "@/context/BookingContext";
import { AuthProvider as LegacyAuthProvider } from "./AuthProvider";
import { WishlistProvider } from "./WishlistProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LegacyAuthProvider>
      <AppAuthProvider>
        <BookingProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
        </BookingProvider>
      </AppAuthProvider>
    </LegacyAuthProvider>
  );
}
