import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Home, MailCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Thank You | Hopebed",
  description: "Your request has been submitted successfully. Our team will contact you shortly.",
};

export default function ThankYouPage() {
  return (
    <main className="bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-xl text-center">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 shadow-xl shadow-gray-100/50 space-y-6">
          {/* Brand Logo */}
          <div className="flex justify-center mb-2">
            <Logo />
          </div>

          {/* Success Icon Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="h-12 w-12" />
          </div>

          {/* Heading & Messages */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Request Confirmed
            </div>
            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl tracking-tight">
              Thank You!
            </h1>
            <p className="text-lg font-bold text-gray-800">
              Your request has been submitted successfully.
            </p>
            <p className="text-sm font-medium text-gray-600 max-w-md mx-auto leading-relaxed">
              Our team will contact you shortly.
            </p>
          </div>

          {/* SLA Info Pill */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50/80 border border-blue-100 px-4 py-2.5 text-xs font-semibold text-brand">
            <MailCheck className="h-4 w-4 shrink-0 text-brand" />
            <span>Our support specialists usually respond within 2 hours.</span>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:shadow-brand/40 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
              aria-label="Back to Homepage"
            >
              <Home className="h-4 w-4" />
              <span>Back to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
