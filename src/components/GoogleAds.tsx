"use client";

import React, { useEffect, useState } from "react";
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
  scriptLoaded,
}: {
  adClient: string;
  adSlot: string;
  scriptLoaded: boolean;
}) {
  const [adPushed, setAdPushed] = useState(false);

  useEffect(() => {
    if (adPushed) return;
    const timer = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setAdPushed(true);
        }
      } catch (err) {
        console.warn("[Google AdSense] Push error:", err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [scriptLoaded, adPushed]);

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gray-900/90 p-4 border border-gray-700/50 shadow-md min-h-[250px] flex flex-col justify-between text-white relative">
      {/* Pure Google AdSense Tag */}
      <ins
        className="adsbygoogle block w-full text-center"
        style={{ display: "block", minHeight: "220px" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        data-adtest="on"
      />
    </div>
  );
}

export function GoogleAds({ clientPublisherId, slotId }: GoogleAdsProps) {
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Sponsored Ads (3)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-gray-400">
            Ads by Google ({adClient})
          </span>
        </div>

        {/* 3 Pure Google AdSense Units */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((idx) => (
            <SingleGoogleAdUnit
              key={idx}
              adClient={adClient}
              adSlot={defaultSlot}
              scriptLoaded={scriptLoaded}
            />
          ))}
        </div>
      </div>
    </>
  );
}
