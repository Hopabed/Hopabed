"use client";

import React, { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export type GoogleAdsProps = {
  clientPublisherId?: string;
  slotId?: string;
};

export function SingleGoogleAdUnit({
  adClient,
  adSlot,
}: {
  adClient: string;
  adSlot: string;
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn("[Google AdSense] Push error:", err);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-white p-3 border border-gray-200 shadow-xs min-h-[250px] flex items-center justify-center">
      {/* Pure Google AdSense Tag */}
      <ins
        className="adsbygoogle block w-full text-center"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function GoogleAds({ clientPublisherId, slotId }: GoogleAdsProps) {
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
      />

      <div className="my-10 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Sponsored Ads (3)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-400">
            Ads by Google
          </span>
        </div>

        {/* 3 Pure Google AdSense Units */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((idx) => (
            <SingleGoogleAdUnit
              key={idx}
              adClient={adClient}
              adSlot={defaultSlot}
            />
          ))}
        </div>
      </div>
    </>
  );
}
