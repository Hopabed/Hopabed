"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  verifyStayPass,
  markStayPassCheckedIn,
  type VerifiedStayPass,
} from "@/lib/api";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Home,
  CreditCard,
  Printer,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";

export default function VerifyPassPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [pass, setPass] = useState<VerifiedStayPass | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    verifyStayPass(id)
      .then((data) => {
        setPass(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load stay pass details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheckIn = async () => {
    if (!id || !pass) return;
    try {
      setCheckingIn(true);
      await markStayPassCheckedIn(id);
      setPass({ ...pass, status: "checked_in" });
      setCheckInSuccess(true);
    } catch (err: any) {
      alert(err.message || "Could not update check-in status.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7fbf8] via-[#f0f6f1] to-[#eaf3eb] py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#0b8f3c] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Hopebed Home
          </Link>
          <div className="flex items-center gap-1.5 rounded-full bg-[#0b8f3c]/10 px-3 py-1 text-xs font-bold text-[#0b8f3c]">
            <ShieldCheck className="h-4 w-4" />
            OFFICIAL VERIFICATION PORTAL
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-xl border border-gray-100 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#0b8f3c] mb-4" />
            <h2 className="text-lg font-bold text-[#111111]">Verifying Stay Pass...</h2>
            <p className="text-xs text-[#59615c] mt-1">
              Fetching property and guest record from Hopebed system.
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-3xl bg-white p-8 shadow-xl border border-red-100 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <XCircle className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-red-600">Invalid or Expired Stay Pass</h2>
            <p className="mt-2 text-sm text-[#59615c]">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/bookings"
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
              >
                Go to My Bookings
              </Link>
            </div>
          </div>
        )}

        {/* Pass Details Display */}
        {!loading && pass && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 animate-in fade-in duration-300">
            {/* Verification Banner */}
            {pass.status === "cancelled" || pass.status === "rejected" ? (
              <div className="bg-red-600 p-6 text-white text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 mb-2">
                  <XCircle className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">STAY PASS CANCELLED</h1>
                <p className="text-xs text-red-100 mt-1">
                  This booking pass has been cancelled or rejected.
                </p>
              </div>
            ) : pass.paymentStatus === "PAID" ? (
              <div className="bg-gradient-to-r from-[#0b8f3c] to-[#06752f] p-6 text-white text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 mb-2">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">STAY PASS VERIFIED & VALID</h1>
                <p className="text-xs text-emerald-100 mt-1">
                  Official Hopebed Guest Verification • Authentic Reservation
                </p>
              </div>
            ) : (
              <div className="bg-amber-500 p-6 text-white text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20 mb-2">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight">PAYMENT PENDING</h1>
                <p className="text-xs text-amber-100 mt-1">
                  This booking has not been paid yet. Pass is unverified.
                </p>
              </div>
            )}

            {/* Check-in Toast Success Alert */}
            {checkInSuccess && (
              <div className="m-4 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-xs font-medium">
                <CheckCircle2 className="h-5 w-5 text-[#0b8f3c] flex-shrink-0" />
                <span>Guest status updated to <strong>CHECKED IN</strong> successfully!</span>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Reference Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#59615c]">
                    BOOKING REFERENCE
                  </span>
                  <p className="font-mono text-base font-bold text-[#111111]">#{pass.id}</p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      pass.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment: {pass.paymentStatus}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      pass.status === "checked_in"
                        ? "bg-blue-100 text-blue-800"
                        : pass.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {pass.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-2xl bg-[#f7fbf8] p-4 border border-emerald-900/5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0b8f3c]/10 text-[#0b8f3c]">
                    <Home className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111111]">{pass.propertyTitle}</h3>
                    {(pass.propertyAddress || pass.locality || pass.city) && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#59615c]">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[#0b8f3c]" />
                        {[pass.propertyAddress, pass.locality, pass.city]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    <p className="mt-2 text-xs font-semibold text-[#0b8f3c]">
                      Room: {pass.roomName} ({pass.roomCount} room{pass.roomCount > 1 ? "s" : ""})
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest Details */}
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#59615c] mb-3">
                  Guest Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#0b8f3c]" />
                    <span className="font-semibold text-[#111111]">{pass.guestName}</span>
                  </div>
                  {pass.guestEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#59615c]" />
                      <span className="text-[#59615c] truncate">{pass.guestEmail}</span>
                    </div>
                  )}
                  {pass.guestPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#59615c]" />
                      <span className="text-[#59615c]">{pass.guestPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[#59615c]">Guests:</span>
                    <span className="font-semibold text-[#111111]">{pass.guests} Person(s)</span>
                  </div>
                </div>
              </div>

              {/* Stay Dates Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#59615c] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#0b8f3c]" /> Check-In
                  </span>
                  <p className="mt-1 text-sm font-bold text-[#111111]">
                    {new Date(pass.checkIn).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#59615c] flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#0b8f3c]" /> Check-Out
                  </span>
                  <p className="mt-1 text-sm font-bold text-[#111111]">
                    {new Date(pass.checkOut).toLocaleDateString(undefined, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="flex justify-between items-center rounded-2xl bg-[#0b8f3c]/5 p-4 border border-[#0b8f3c]/10">
                <div>
                  <span className="text-xs text-[#59615c]">Total Amount ({pass.currency}):</span>
                  <p className="text-xl font-extrabold text-[#0b8f3c]">₹{pass.totalAmount}</p>
                </div>
                <div className="text-right text-xs text-[#59615c]">
                  Nights: <span className="font-bold text-[#111111]">{pass.nights}</span>
                </div>
              </div>

              {/* Property Staff / Host Actions */}
              <div className="pt-2 space-y-3">
                {pass.status !== "checked_in" && pass.status !== "cancelled" && (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0b8f3c] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#0b8f3c]/20 hover:bg-[#06752f] transition-all disabled:opacity-50"
                  >
                    {checkingIn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                    Mark Guest Checked-In
                  </button>
                )}

                <button
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 px-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Printer className="h-4 w-4" /> Print / Save Verification Record
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-[11px] text-[#59615c]">
                  Verified live against Hopebed Central Database System.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
