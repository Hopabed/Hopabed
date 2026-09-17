"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Lock, User as UserIcon, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (mode === "signup") {
      if (!name) {
        setError("Please enter your full name");
        return;
      }
      signup(name, email, "GUEST");
    } else {
      login(email, "GUEST");
    }
  };

  const handleQuickDemoUser = () => {
    login("demo@hopebed.in", "GUEST");
  };

  const handleQuickDemoHost = () => {
    login("host@hopebed.in", "HOST");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand to-blue-700 p-6 text-white text-center relative">
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-2">
            <Sparkles className="h-6 w-6 text-amber-300" />
          </div>
          <h2 className="text-2xl font-extrabold">{mode === "login" ? "Welcome Back to Hopebed" : "Create Your Hopebed Account"}</h2>
          <p className="text-xs text-blue-100 mt-1">Verified stays across India. Fast & secure.</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

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

          {/* Quick Demo Logins for Review */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2">
              One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoUser}
                className="rounded-xl border border-gray-200 bg-gray-50 py-2 px-3 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-brand" /> Demo Guest
              </button>
              <button
                type="button"
                onClick={handleQuickDemoHost}
                className="rounded-xl border border-gray-200 bg-blue-50 py-2 px-3 text-xs font-bold text-brand hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5 text-brand" /> Demo Host
              </button>
            </div>
          </div>

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
  );
}
