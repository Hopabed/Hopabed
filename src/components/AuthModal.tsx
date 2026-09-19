"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Lock, User as UserIcon, Sparkles, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

function parseGoogleJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup, googleLogin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(() => {
    return typeof window !== "undefined" && Boolean(window.google?.accounts?.id);
  });

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "790859697143-rc3tgtgejdhoeoaqi300nbbnbj4sjetq.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setGoogleReady(true);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (!isAuthModalOpen || !googleClientId || !googleButtonRef.current) return;
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    try {
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          try {
            setError(null);
            await googleLogin(credential);
          } catch (err: any) {
            setError(err.message || "Google sign-in failed");
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 340,
      });
    } catch (err) {
      console.warn("[Google Auth Modal Warning] Error rendering Google button:", err);
    }
  }, [googleClientId, googleReady, isAuthModalOpen, googleLogin]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      if (mode === "signup") {
        if (!name) {
          setError("Please enter your full name");
          return;
        }
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleGoogleClick = () => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            try {
              setError(null);
              await googleLogin(credential);
            } catch (err: any) {
              setError(err.message || "Google sign-in failed");
            }
          },
        });
        window.google.accounts.id.prompt();
      } catch (err: any) {
        setError(err.message || "Please try again.");
      }
    } else {
      setError("Google Sign-In script is loading. Please try again in a moment.");
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => setGoogleReady(true)}
        strategy="afterInteractive"
      />

      <div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        onClick={closeAuthModal}
      >
        <div
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-brand via-blue-600 to-brand-dark p-6 text-white text-center relative">
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-2">
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <h2 className="text-xl font-extrabold">{mode === "login" ? "Welcome Back to Hopebed" : "Create Your Hopebed Account"}</h2>
            <p className="text-xs text-blue-100 mt-1">Verified stays across India. Fast & secure.</p>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Google OAuth Button Section */}
            <div className="space-y-3">
              <div className="w-full flex justify-center min-h-[44px]">
                <div ref={googleButtonRef} />
              </div>

              {!googleReady && (
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400 font-semibold">Or with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-brand py-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
              >
                {mode === "login" ? "Sign In to Account" : "Create Account"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center text-xs text-gray-600 border-t border-gray-100 pt-3">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-bold text-brand hover:underline"
                  >
                    Sign Up Free
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-bold text-brand hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
