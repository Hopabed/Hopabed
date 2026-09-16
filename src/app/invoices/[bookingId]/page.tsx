"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBookingInvoice, type InvoiceData } from "@/lib/api";
import {
  Printer,
  Share2,
  ArrowLeft,
  Loader2,
  Check,
  ShieldCheck,
} from "lucide-react";

export default function InvoicePage() {
  const params = useParams();
  const bookingId = Array.isArray(params.bookingId)
    ? params.bookingId[0]
    : params.bookingId;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    getBookingInvoice(bookingId)
      .then((data) => setInvoice(data))
      .catch((err) => setError(err.message || "Failed to load invoice."))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleShare = async () => {
    const shareData = {
      title: `Hopebed Invoice ${invoice?.invoiceNumber || ""}`,
      text: `View tax invoice for ${invoice?.propertyTitle || "Hopebed Stay"}:`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert(`Share Invoice Link: ${window.location.href}`);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8f6] py-8 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
      <div className="mx-auto max-w-3xl">
        {/* Navigation & Action Bar (Hidden when printing) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/profile?tab=payments"
            className="flex items-center gap-2 text-xs font-bold text-[#0b8f3c] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Payments
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#111111] shadow-xs hover:bg-gray-50 transition-all"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-[#0b8f3c]" /> Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-[#59615c]" /> Share Invoice
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-[#0b8f3c] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#06752f] transition-all"
            >
              <Printer className="h-4 w-4" /> Print / Download PDF
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-md border border-gray-100 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#0b8f3c] mb-4" />
            <h2 className="text-base font-bold text-[#111111]">Loading Tax Invoice...</h2>
            <p className="text-xs text-[#59615c] mt-1">Retrieving verified booking invoice details.</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-3xl bg-white p-8 shadow-md border border-red-100 text-center">
            <h2 className="text-lg font-bold text-red-600">Invoice Not Available</h2>
            <p className="mt-2 text-xs text-[#59615c]">{error}</p>
            <Link
              href="/profile?tab=bookings"
              className="mt-4 inline-block rounded-xl bg-[#0b8f3c] px-5 py-2.5 text-xs font-bold text-white"
            >
              Return to Profile
            </Link>
          </div>
        )}

        {/* Invoice Printable Document */}
        {!loading && invoice && (
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 shadow-xl border border-gray-200 print:shadow-none print:border-none print:p-4">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between border-b border-gray-200 pb-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b8f3c] text-white font-extrabold text-base">
                    H
                  </span>
                  <span className="text-2xl font-black tracking-tight text-[#111111]">
                    Hopebed<span className="text-[#0b8f3c]">.in</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#59615c] mt-1">
                  Official Accommodation & Stay Verification Receipt
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-1">
                  TAX INVOICE & RECEIPT
                </span>
                <p className="font-mono text-sm font-bold text-[#111111]">{invoice.invoiceNumber}</p>
                <p className="text-[11px] text-[#59615c]">
                  Date: {new Date(invoice.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* Billed To & Billed By Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
              <div className="rounded-2xl bg-[#f7fbf8] p-4 border border-emerald-900/10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0b8f3c]">
                  BILLED TO (GUEST)
                </span>
                <p className="mt-1 font-bold text-sm text-[#111111]">{invoice.guestName}</p>
                {invoice.guestEmail && <p className="text-[#59615c]">{invoice.guestEmail}</p>}
                {invoice.guestPhone && <p className="text-[#59615c]">{invoice.guestPhone}</p>}
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#59615c]">
                  PROPERTY & STAY DETAILS
                </span>
                <p className="mt-1 font-bold text-sm text-[#111111]">{invoice.propertyTitle}</p>
                <p className="text-[#59615c]">
                  {[invoice.propertyAddress, invoice.locality, invoice.city].filter(Boolean).join(", ")}
                </p>
                <p className="mt-1 font-semibold text-[#0b8f3c]">Room: {invoice.roomName}</p>
              </div>
            </div>

            {/* Stay Meta Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl bg-gray-50 p-4 text-xs mb-6 border border-gray-100">
              <div>
                <span className="text-[10px] text-[#59615c] block uppercase font-bold">Check-In</span>
                <span className="font-bold text-[#111111]">
                  {new Date(invoice.checkIn).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#59615c] block uppercase font-bold">Check-Out</span>
                <span className="font-bold text-[#111111]">
                  {new Date(invoice.checkOut).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#59615c] block uppercase font-bold">Duration</span>
                <span className="font-bold text-[#111111]">{invoice.nights} Night(s)</span>
              </div>
              <div>
                <span className="text-[10px] text-[#59615c] block uppercase font-bold">Payment ID</span>
                <span className="font-mono text-[11px] font-bold text-[#111111] truncate block">{invoice.paymentId}</span>
              </div>
            </div>

            {/* Invoice Line Items Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[#59615c] uppercase text-[10px] font-extrabold tracking-wider bg-gray-50">
                    <th className="py-3 px-4 rounded-l-xl">Description</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4 text-right">Rate</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Amount ({invoice.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-4 px-4 font-semibold text-[#111111]">
                      {invoice.propertyTitle} - {invoice.roomName} ({invoice.nights} Night{invoice.nights > 1 ? "s" : ""})
                    </td>
                    <td className="py-4 px-4">{invoice.roomCount} Room(s)</td>
                    <td className="py-4 px-4 text-right">₹{invoice.subtotal}</td>
                    <td className="py-4 px-4 text-right font-bold text-[#111111]">₹{invoice.subtotal}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-[#59615c]">Hopebed Service & Platform Fee</td>
                    <td className="py-3 px-4">1</td>
                    <td className="py-3 px-4 text-right">₹{invoice.serviceFee}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#111111]">₹{invoice.serviceFee}</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-[#59615c]">Goods & Services Tax (GST 18%)</td>
                    <td className="py-3 px-4">18%</td>
                    <td className="py-3 px-4 text-right">₹{invoice.taxes}</td>
                    <td className="py-3 px-4 text-right font-semibold text-[#111111]">₹{invoice.taxes}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total Calculation Card */}
            <div className="flex justify-end border-t border-gray-200 pt-4">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-[#59615c]">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#59615c]">
                  <span>Service Fee & Taxes:</span>
                  <span>₹{invoice.serviceFee + invoice.taxes}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-extrabold text-[#111111]">
                  <span>Total Amount Paid:</span>
                  <span className="text-[#0b8f3c]">₹{invoice.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Footer Verification Seal */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-[#59615c]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0b8f3c]" />
                <span>
                  Electronically generated invoice. Verified by <strong>Hopebed Digital Systems</strong>.
                </span>
              </div>
              <div className="text-right text-[10px] text-gray-400">
                Booking Reference ID: #{invoice.bookingId}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
