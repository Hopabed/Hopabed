"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Tag, ShieldCheck, ArrowRight, Gift, CheckCircle2, X } from "lucide-react";

export type AdItem = {
  id: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  icon: typeof Sparkles;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  gradientBg: string;
  borderColor: string;
  code?: string;
};

export const PROMOTIONAL_ADS: AdItem[] = [
  {
    id: "ad-1",
    badge: "INSTANT DISCOUNT",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    badgeColor: "text-emerald-400",
    icon: Tag,
    title: "Get 20% Off Your First Verified Stay",
    description: "Book any verified hotel or villa today. Use promo code HOPE20 at checkout for instant 20% savings.",
    code: "HOPE20",
    ctaText: "Claim Discount",
    ctaHref: "/stays",
    gradientBg: "from-zinc-900 via-emerald-950 to-zinc-900",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "ad-2",
    badge: "HOST SPECIAL",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    badgeColor: "text-blue-400",
    icon: ShieldCheck,
    title: "List Property with 0% Commission",
    description: "Register your hotel, PG, or homestay on Hopebed and keep 100% of your earnings for 30 days.",
    ctaText: "List Property Free",
    ctaHref: "/host",
    gradientBg: "from-zinc-900 via-blue-950 to-zinc-900",
    borderColor: "border-blue-500/30",
  },
  {
    id: "ad-3",
    badge: "MONTHLY OFFER",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    badgeColor: "text-amber-400",
    icon: Gift,
    title: "Save up to ₹5,000/mo on Long Stays",
    description: "Verified executive PGs & co-living spaces with daily meals, high-speed WiFi & housekeeping included.",
    ctaText: "Explore PGs",
    ctaHref: "/stays?type=pg",
    gradientBg: "from-zinc-900 via-amber-950 to-zinc-900",
    borderColor: "border-amber-500/30",
  },
];

export function PromotionalAds({ limit = 3 }: { limit?: number }) {
  const displayedAds = PROMOTIONAL_ADS.slice(0, limit);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAdAction = (ad: AdItem, e: React.MouseEvent) => {
    if (ad.code) {
      e.preventDefault();
      try {
        if (typeof window !== "undefined") {
          navigator.clipboard.writeText(ad.code);
          localStorage.setItem("hopebed_claimed_promo", ad.code);
          localStorage.setItem("hopebed_discount_percent", "20");
        }
      } catch {
        // ignore
      }
      setToastMessage(`🎉 Code ${ad.code} Copied! 20% Discount applied for your checkout.`);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <div className="mb-10 space-y-3 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 rounded-2xl bg-emerald-950 border border-emerald-500/50 px-5 py-3.5 text-sm font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 max-w-md w-full mx-auto">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="flex-1 text-xs sm:text-sm leading-tight">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded-full p-1 text-emerald-300 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#0b8f3c] animate-pulse" />
          <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
            Featured Deals & Promotions ({displayedAds.length})
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedAds.map((ad) => {
          const Icon = ad.icon;
          return (
            <div
              key={ad.id}
              onClick={(e) => handleAdAction(ad, e)}
              className={`relative overflow-hidden rounded-2xl border ${ad.borderColor} bg-gradient-to-br ${ad.gradientBg} p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group cursor-pointer`}
            >
              {/* Top Row */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${ad.badgeBg}`}
                  >
                    <Icon className="h-3 w-3" />
                    {ad.badge}
                  </span>
                  {ad.code && (
                    <span className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 animate-pulse">
                      CODE: {ad.code}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-emerald-300 transition-colors">
                  {ad.title}
                </h3>
                <p className="mt-1.5 text-xs text-gray-300 leading-relaxed">
                  {ad.description}
                </p>
              </div>

              {/* Bottom CTA */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-400">
                  {ad.code ? "Click to Claim 20% Off" : "Verified Sponsor Offer"}
                </span>
                <Link
                  href={ad.ctaHref}
                  onClick={(e) => {
                    if (ad.code) handleAdAction(ad, e);
                  }}
                  style={{ color: "#ffffff" }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-3.5 py-1.5 text-xs font-bold !text-white transition-all group-hover:bg-[#0b8f3c] group-hover:border-[#0b8f3c]"
                >
                  <span>{ad.ctaText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
