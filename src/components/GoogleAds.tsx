"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { ExternalLink, Info } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export type GoogleAdProps = {
  slotId?: string;
  format?: "auto" | "fluid" | "rectangle";
  className?: string;
  adTitle?: string;
  adDescription?: string;
  adUrl?: string;
  adBadge?: string;
};

const DEFAULT_GOOGLE_ADS = [
  {
    slotId: "9871071378",
    adTitle: "Google Travel — Compare Flights & Stays",
    adDescription: "Find exclusive flight deals & hotel discounts across 500+ destinations on Google Travel.",
    adUrl: "https://www.google.com/travel",
    adBadge: "Google Sponsored Ad",
    gradient: "from-zinc-900 via-blue-950 to-zinc-900",
    border: "border-blue-500/30",
  },
  {
    slotId: "9871071378",
    adTitle: "Google Pay — Fast 1-Tap UPI Rewards",
    adDescription: "Pay for your Hopebed stay using Google Pay and earn up to ₹500 instant cashback scratch cards.",
    adUrl: "https://pay.google.com",
    adBadge: "Google Pay Offer",
    gradient: "from-zinc-900 via-emerald-950 to-zinc-900",
    border: "border-emerald-500/30",
  },
  {
    slotId: "9871071378",
    adTitle: "Google Maps — Verified Location Routes",
    adDescription: "Navigate directly to your verified Hopebed hotel or homestay with 3D Street View and live traffic.",
    adUrl: "https://maps.google.com",
    adBadge: "Google Maps Partner",
    gradient: "from-zinc-900 via-amber-950 to-zinc-900",
    border: "border-amber-500/30",
  },
];

export function SingleGoogleAdUnit({
  adClient,
  adSlot,
  ad,
  scriptLoaded,
}: {
  adClient: string;
  adSlot: string;
  ad: (typeof DEFAULT_GOOGLE_ADS)[0];
  scriptLoaded: boolean;
}) {
  useEffect(() => {
    if (!scriptLoaded) return;
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn("[Google AdSense] Push error:", err);
    }
  }, [scriptLoaded]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${ad.border} bg-gradient-to-br ${ad.gradient} p-5 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between group min-h-[220px]`}>
      {/* Real Google AdSense Container */}
      <ins
        className="adsbygoogle block w-full text-center"
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on"
        style={{ display: "block", minHeight: "100px" }}
      />

      {/* Google Ads Visual Preview Container */}
      <div className="space-y-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
            <Info className="h-3 w-3 text-blue-400" />
            {ad.adBadge}
          </span>
          <span className="text-[10px] font-semibold text-gray-400">Ads by Google</span>
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-white group-hover:text-blue-300 transition-colors">
            {ad.adTitle}
          </h4>
          <p className="mt-1 text-xs text-gray-300 leading-relaxed">
            {ad.adDescription}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-mono text-gray-400">{adClient}</span>
          <a
            href={ad.adUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#ffffff" }}
            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1 text-xs font-bold !text-white transition-all shadow-sm"
          >
            <span>Visit Link</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function GoogleAds({ clientPublisherId, slotId }: { clientPublisherId?: string; slotId?: string }) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const adClient = clientPublisherId || process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID || "ca-pub-5507783627988593";
  const defaultSlot = slotId || process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SLOT_ID || "9871071378";

  return (
    <>
      {/* Load Official Google AdSense Script */}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="my-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Sponsored Google Ads (3)
            </p>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
            <Info className="h-3 w-3 text-gray-400" /> Powered by Google Ads Network
          </span>
        </div>

        {/* Exactly 3 Google Ad Units Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_GOOGLE_ADS.map((ad) => (
            <SingleGoogleAdUnit
              key={ad.slotId + ad.adBadge}
              adClient={adClient}
              adSlot={defaultSlot}
              ad={ad}
              scriptLoaded={scriptLoaded}
            />
          ))}
        </div>
      </div>
    </>
  );
}
