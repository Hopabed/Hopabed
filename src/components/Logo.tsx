"use client";

import Link from "next/link";

interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export function Logo({ variant = "light", className = "" }: LogoProps) {
  const isDark = variant === "dark";
  const textColor = isDark ? "#ffffff" : "#07100c";
  const brandColor = "#0b8f3c";

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Brand Icon Badge */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0b8f3c] to-[#06752f] shadow-sm transition-transform duration-200 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-white"
        >
          {/* House Roof & Body */}
          <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10z" />
          {/* Bed & Pillow */}
          <path d="M7 14h10" />
          <path d="M7 17h10" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center text-xl font-extrabold tracking-tight leading-none">
          <span style={{ color: textColor }}>Hope</span>
          <span style={{ color: brandColor }}>bed</span>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
          style={{ color: isDark ? "#a1a1aa" : "#59615c" }}
        >
          Stay Smart. Verified.
        </span>
      </div>
    </Link>
  );
}
