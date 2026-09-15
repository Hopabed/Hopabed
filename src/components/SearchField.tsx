"use client";

import type { LucideIcon } from "lucide-react";

type SearchFieldProps = {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function SearchField({ icon: Icon, label, children, className = "" }: SearchFieldProps) {
  return (
    <label className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-3 lg:gap-4 lg:px-6 lg:py-5 ${className}`}>
      <Icon className="h-5 w-5 lg:h-6 lg:w-6 shrink-0 text-brand" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] lg:text-sm font-semibold text-[#111111]">{label}</span>
        <div className="mt-1">
          {children}
        </div>
      </span>
    </label>
  );
}
