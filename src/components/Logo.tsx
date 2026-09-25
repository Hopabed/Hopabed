"use client";

import Link from "next/link";
import Image from "next/image";

export interface LogoProps {
  variant?: "light" | "dark";
  inverted?: boolean;
  compact?: boolean;
  className?: string;
}

export function Logo({
  variant = "light",
  inverted = false,
  compact = false,
  className = "",
}: LogoProps) {
  const heightClass = compact ? "h-9 sm:h-10" : "h-12 sm:h-14 lg:h-16";

  return (
    <Link href="/" className={`inline-flex items-center group shrink-0 ${className}`}>
      <Image
        src="/brand/hopabed-wordmark.jpg"
        alt="Hopebed Logo"
        width={240}
        height={65}
        className={`${heightClass} w-auto object-contain transition-transform duration-200 group-hover:scale-105`}
        priority
      />
    </Link>
  );
}

