"use client";

import React, { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { formatInr } from "@/data/properties";
import { Calendar, MapPin, Printer, ShieldCheck, UserCheck, XCircle, ArrowRight, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AuthModal } from "@/components/AuthModal";

export default function UserBookingsDashboard() {
  const { bookings, cancelBooking } = useBooking();
  const { user, openAuthModal, logout } = useAuth();
  const [filterTab, setFilterTab] = useState<"ALL" | "CONFIRMED" | "COMPLETED" | "CANCELLED">("ALL");

  if (!user) {
    return (
      <main className="container-page py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand mb-4">
          <UserCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Sign in to view your bookings</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Access your confirmed stay reservations, booking receipts, and host contact details.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 rounded-2xl bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition-all"
        >
          Sign In / Register
        </button>
        <AuthModal />
      </main>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === "ALL") return true;
    return b.status === filterTab;
  });

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="container-page">
        {/* User Welcome Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-brand/10 border-2 border-brand text-brand flex items-center justify-center text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-900">Hello, {user.name}!</h1>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-brand uppercase">
                  {user.role} Account
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{user.email} • {user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-dark transition-all flex items-center gap-1.5"
            >
              <Building className="h-4 w-4" /> Book New Stay
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Tabs & Filters */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">My Reservations ({bookings.length})</h2>
          <div className="flex items-center gap-2">
            {(["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab
                    ? "bg-brand text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-bold text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven&apos;t placed any bookings under this filter yet.</p>
            <Link
              href="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-dark transition-all"
            >
              Explore Destinations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Property Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                      {booking.propertyImage && (
                        <Image src={booking.propertyImage} alt={booking.propertyName} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-extrabold text-brand bg-blue-50 px-2.5 py-0.5 rounded-md">
                          {booking.id}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                            booking.status === "CONFIRMED"
                              ? "bg-emerald-100 text-emerald-800"
                              : booking.status === "CANCELLED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{booking.propertyName}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-brand" /> {booking.city}, India
                      </p>
                    </div>
                  </div>

                  {/* Middle Dates & Pricing */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-gray-700 bg-gray-50 rounded-2xl p-4">
                    <div>
                      <span className="text-gray-400 block">Check-in</span>
                      <span className="font-bold text-gray-900 text-sm">{booking.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Check-out</span>
                      <span className="font-bold text-gray-900 text-sm">{booking.checkOut}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Guests / Rooms</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {booking.guests} Guests ({booking.rooms} Room)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Total Price Paid</span>
                      <span className="font-extrabold text-brand text-sm">{formatInr(booking.totalPrice)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Booked On</span>
                      <span className="font-semibold text-gray-900">{booking.createdAt}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-end">
                    <Link
                      href={`/booking/confirmation/${booking.id}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      <Printer className="h-3.5 w-3.5" /> Receipt
                    </Link>

                    {booking.status === "CONFIRMED" && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
}