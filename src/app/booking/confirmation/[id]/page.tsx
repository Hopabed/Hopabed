"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { formatInr } from "@/data/properties";
import { CheckCircle2, Calendar, MapPin, Printer, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { bookings } = useBooking();

  const booking = bookings.find((b) => b.id === params.id) || bookings[0];

  if (!booking) {
    return (
      <main className="container-page py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Booking Confirmation Not Found</h2>
        <Link href="/bookings" className="mt-4 inline-block text-sm font-bold text-brand hover:underline">
          Go to My Bookings →
        </Link>
      </main>
    );
  }

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <div className="container-page max-w-3xl">
        {/* Success Banner */}
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl space-y-4 mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <span className="inline-block rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Booking Confirmed & Guaranteed
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900">Thank you, {booking.guestName}!</h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your reservation is confirmed. We have dispatched your booking receipt and voucher to{" "}
            <span className="font-bold text-gray-900">{booking.guestEmail}</span>.
          </p>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-extrabold text-gray-800">
            <span>Booking Reference ID:</span>
            <span className="text-brand font-mono text-base">{booking.id}</span>
          </div>
        </div>

        {/* Receipt Details Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-md space-y-6">
          <div className="flex items-start justify-between border-b border-gray-100 pb-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-gray-100 shrink-0">
                {booking.propertyImage && (
                  <Image src={booking.propertyImage} alt={booking.propertyName} fill className="object-cover" />
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-gray-900">{booking.propertyName}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-brand" /> {booking.city}, India
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Hopebed Verified Voucher
                </span>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Printer className="h-4 w-4" /> Print Voucher
            </button>
          </div>

          {/* Reservation Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-500 block font-medium">Check-in</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">{booking.checkIn}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-500 block font-medium">Check-out</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">{booking.checkOut}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-500 block font-medium">Guests & Rooms</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                {booking.guests} Guests, {booking.rooms} Room
              </span>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <span className="text-gray-500 block font-medium">Duration</span>
              <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                {booking.totalNights} Night{booking.totalNights > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Guest Contact Details */}
          <div className="border-t border-gray-100 pt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Primary Guest Info</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
              <div>
                <span className="text-gray-400 block">Name:</span>
                <span className="font-bold text-gray-900 text-sm">{booking.guestName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Email:</span>
                <span className="font-bold text-gray-900 text-sm">{booking.guestEmail}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Phone:</span>
                <span className="font-bold text-gray-900 text-sm">{booking.guestPhone}</span>
              </div>
            </div>
          </div>

          {/* Total Paid */}
          <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 block font-semibold">Total Paid (Taxes Included)</span>
              <span className="text-2xl font-extrabold text-brand">{formatInr(booking.totalPrice)}</span>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                Payment Status: SUCCESS
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/bookings"
            className="w-full sm:w-auto rounded-2xl bg-brand px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="h-4 w-4" /> View My Bookings Dashboard
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto rounded-2xl border border-gray-300 bg-white px-6 py-3.5 text-center text-sm font-bold text-gray-800 hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            Explore More Stays <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
