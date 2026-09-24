import React from "react";
import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-slate-50 min-h-screen py-24 flex items-center justify-center">
      <div className="mx-auto max-w-md text-center space-y-6 px-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-[#0b8f3c] font-black text-3xl shadow-sm">
          404
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          The video, category, or page you are looking for doesn&apos;t exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto rounded-full bg-[#0b8f3c] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" /> Return to Homepage
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4 text-[#0b8f3c]" /> Search Videos
          </Link>
        </div>
      </div>
    </main>
  );
}
