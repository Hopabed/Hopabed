"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Building, ShieldCheck, TrendingUp, Users, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

export default function HostLandingPage() {
  const { user, toggleHostMode, openAuthModal } = useAuth();

  const handleStartHosting = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (user.role !== "HOST") {
      toggleHostMode();
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-dark via-brand to-blue-600 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="container-page relative z-10 text-center max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md text-amber-300">
            <Sparkles className="h-4 w-4" /> Become a Hopebed Host
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Turn Your Property into a Thriving Verified Stay
          </h1>
          <p className="mt-4 text-base sm:text-lg text-blue-100 leading-relaxed max-w-2xl mx-auto">
            Join thousands of hotel owners, villa hosts, and homestay proprietors across India. List your stay, reach millions of travelers, and enjoy guaranteed payouts.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user?.role === "HOST" ? (
              <Link
                href="/host/dashboard"
                className="w-full sm:w-auto rounded-2xl bg-amber-400 px-8 py-4 text-base font-extrabold text-gray-900 shadow-xl hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
              >
                Go to Host Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <button
                onClick={handleStartHosting}
                className="w-full sm:w-auto rounded-2xl bg-amber-400 px-8 py-4 text-base font-extrabold text-gray-900 shadow-xl hover:bg-amber-300 transition-all flex items-center justify-center gap-2"
              >
                {user ? "Enable Host Features" : "Register as Host"} <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container-page py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Why Host on Hopebed?</h2>
          <p className="mt-2 text-sm text-gray-500">
            Everything you need to list, market, and manage your properties with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Hopebed Verified Badge</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Get your property physically verified by our team. Verified listings receive 3x more bookings and higher trust.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Guaranteed Instant Payouts</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Receive payouts directly into your bank account via UPI or Razorpay on check-in day without delays.
            </p>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Host Dashboard Tools</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Add new properties, edit nightly rates, manage photo galleries, and update room availability in real time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-page">
        <div className="rounded-3xl bg-gray-900 p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold">Ready to welcome your first guest?</h3>
            <p className="text-sm text-gray-400 mt-1">Setup takes less than 5 minutes. No upfront fees.</p>
          </div>
          <Link
            href="/host/dashboard"
            onClick={handleStartHosting}
            className="shrink-0 rounded-2xl bg-brand px-8 py-4 text-center text-sm font-extrabold text-white shadow-lg hover:bg-brand-dark transition-all"
          >
            Access Host Dashboard →
          </Link>
        </div>
      </section>

      <AuthModal />
    </main>
  );
}