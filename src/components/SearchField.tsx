import type { ReactNode } from "react";

type SearchFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function SearchField({ label, children, className = "flex-1", onClick }: SearchFieldProps) {
  return (
    <label 
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col justify-center px-6 lg:px-8 py-3.5 hover:bg-white/40 lg:rounded-full transition-all ${className}`}
    >
      <span className="text-[12px] font-extrabold tracking-wide text-gray-900">{label}</span>
      <div className="mt-0.5">
        {children}
      </div>
    </label>
  );
}
