import React from "react";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { getPropertyById } from "@/data/properties";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ stay?: string; status?: string; reason?: string; bookingId?: string }>;
}) {
  const { stay, status, reason, bookingId } = await searchParams;
  const property = stay ? getPropertyById(stay) : undefined;

  const isRejected = status === "rejected" || status === "failed" || status === "cancelled";

  if (isRejected) {
    return (
      <main className="bg-gray-50 min-h-screen py-16">
        <div className="container-page max-w-2xl">
          <div className="rounded-3xl border-2 border-rose-200 bg-white p-8 shadow-xl text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600 shadow-sm">
              <XCircle className="h-12 w-12" />
            </div>

            <div className="space-y-2">
              <span className="inline-block rounded-full bg-rose-100 px-4 py-1 text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                Payment Rejected / Cancelled
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900">Payment Was Not Completed</h1>
              <p className="text-sm font-medium text-gray-600 max-w-md mx-auto leading-relaxed">
                {reason || "The Razorpay payment window was closed or the transaction was declined by the issuing bank. No funds were debited."}
              </p>
            </div>

            {bookingId && (
              <div className="inline-block rounded-2xl bg-gray-100 px-4 py-2 text-xs font-mono font-bold text-gray-700">
                Booking Reference ID: {bookingId}
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={stay ? `/booking/${stay}` : "/search"}
                className="w-full sm:w-auto rounded-2xl bg-brand px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Try Booking Again
              </Link>
              <Link
                href="/search"
                className="w-full sm:w-auto rounded-2xl border border-gray-300 bg-white px-6 py-3.5 text-center text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Explore Other Stays
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="container-page max-w-2xl text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Hopebed Payment Center</h1>
        <p className="text-sm text-gray-600">All payments are securely processed through Razorpay PCI-DSS certified gateway.</p>
        <Link href="/search" className="inline-block rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white">
          Explore Stays →
        </Link>
      </div>
    </main>
  );
}
