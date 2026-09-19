"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Property, formatInr, FALLBACK_PROPERTY_IMAGE, getValidImageUrl } from "@/data/properties";
import {
  ShieldCheck,
  MapPin,
  Star,
  Users,
  Bed,
  Wifi,
  Tv,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowLeft,
  Share2,
  Heart,
} from "lucide-react";
import { useWishlist } from "@/components/WishlistProvider";

type PropertyDetailClientProps = {
  property: Property;
};

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const router = useRouter();
  const { has, toggle } = useWishlist();
  const isSaved = has(property.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [rooms, setRooms] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const [bookingType, setBookingType] = useState<"nightly" | "monthly">("nightly");
  const [messOption, setMessOption] = useState<boolean>(Boolean(property.messIncluded));

  // Date difference calculation
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  
  let unitRate = property.pricePerNight;
  let subtotal = 0;

  if (bookingType === "monthly" && (property.pricePerMonth || property.pricePerNight * 20)) {
    unitRate = property.pricePerMonth || Math.round(property.pricePerNight * 20);
    const months = Math.max(1, Math.round(nights / 30));
    subtotal = unitRate * months * rooms;
  } else {
    subtotal = unitRate * nights * rooms;
  }

  if (messOption) {
    const messFee = property.messMonthlyFee || 3500;
    const months = Math.max(1, Math.round(nights / 30));
    subtotal += messFee * months * rooms;
  }

  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const handleBookNow = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    params.set("rooms", String(rooms));
    params.set("bookingType", bookingType);
    params.set("messOption", String(messOption));
    router.push(`/booking/${property.id}?${params.toString()}`);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const images = property.images && property.images.length > 0 ? property.images : [property.image];

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container-page flex items-center justify-between">
          <Link
            href="/search"
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-brand transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Search Results
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" /> {copied ? "Copied Link!" : "Share"}
            </button>
            <button
              onClick={() => toggle(property.id)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
              {isSaved ? "Saved" : "Wishlist"}
            </button>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {property.isVerified && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" /> Hopebed Verified Property
              </span>
            )}
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-brand capitalize">
              {property.type || property.propertyType}
            </span>
            {property.badge && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                {property.badge}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 lg:text-4xl">{property.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1 font-bold text-gray-900">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {property.rating.toFixed(1)} ({property.reviewCount} reviews)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-brand" /> {property.address}
            </span>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
          <div className="relative aspect-[16/10] lg:col-span-2 overflow-hidden rounded-2xl bg-gray-200 shadow-md">
            <img
              src={getValidImageUrl(images[activeImageIndex] || property.image)}
              alt={property.name}
              className="h-full w-full object-cover transition-all duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_PROPERTY_IMAGE;
              }}
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {images.slice(0, 3).map((imgUrl, index) => (
              <button
                key={imgUrl + index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative aspect-[16/10] overflow-hidden rounded-xl border-2 transition-all ${
                  activeImageIndex === index ? "border-brand ring-2 ring-brand/30 scale-[1.02]" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <img
                  src={getValidImageUrl(imgUrl)}
                  alt={`${property.name} ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_PROPERTY_IMAGE;
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Specs */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Capacity</p>
                  <p className="text-sm font-bold text-gray-900">Up to {property.maxGuests} Guests</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-brand">
                  <Bed className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Bedrooms / Rooms</p>
                  <p className="text-sm font-bold text-gray-900">{property.roomsCount} Rooms Available</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase">Verification</p>
                  <p className="text-sm font-bold text-emerald-700">100% On-site Verified</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What this stay offers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-800">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gray-200 border-2 border-brand">
                  <Image
                    src={property.hostAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt={property.hostName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">Hosted by {property.hostName}</h3>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                      Superhost
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Hopebed Verified Host • Responds within 1 hour</p>
                </div>
              </div>

              {property.houseRules && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">House Rules</h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                    {property.houseRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
              <div className="flex items-baseline justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-2xl font-extrabold text-brand">{formatInr(property.pricePerNight)}</span>
                  <span className="text-xs text-gray-500"> / night</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {property.rating.toFixed(1)}
                </div>
              </div>

              <form onSubmit={handleBookNow} className="space-y-4">
                {/* PG Rate & Stay Type Selector */}
                {(property.isMonthlyAvailable || property.propertyType?.toLowerCase() === "pg" || property.pricePerMonth) && (
                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 space-y-2">
                    <span className="text-[11px] font-bold text-brand uppercase tracking-wider block">Stay Type</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingType("nightly")}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          bookingType === "nightly" ? "bg-brand text-white shadow-sm" : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Nightly Stay
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingType("monthly")}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          bookingType === "monthly" ? "bg-brand text-white shadow-sm" : "bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Monthly PG ({formatInr(property.pricePerMonth || Math.round(property.pricePerNight * 20))}/mo)
                      </button>
                    </div>

                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={messOption}
                        onChange={(e) => setMessOption(e.target.checked)}
                        className="rounded text-brand focus:ring-brand h-4 w-4"
                      />
                      <span className="text-xs font-semibold text-gray-800">
                        Include Daily Mess / Food (+{formatInr(property.messMonthlyFee || 3500)}/mo)
                      </span>
                    </label>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-200 p-2 bg-gray-50">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 block px-1">Check-in</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none"
                    />
                  </div>
                  <div className="border-l border-gray-200 pl-2">
                    <label className="text-[10px] font-extrabold uppercase text-gray-500 block px-1">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full bg-transparent text-xs font-bold text-gray-900 outline-none"
                    />
                  </div>
                </div>

                {/* Guests & Rooms */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-800 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} Guest{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">Rooms</label>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-800 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} Room{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>
                      {formatInr(property.pricePerNight)} × {nights} night{nights > 1 ? "s" : ""} × {rooms} room{rooms > 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-gray-900">{formatInr(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST & Hopebed Service Fee (12%)</span>
                    <span className="font-semibold text-gray-900">{formatInr(taxes)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-extrabold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-brand">{formatInr(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:scale-[1.01] active:scale-[0.99]"
                >
                  Reserve Stay Now
                </button>
              </form>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-brand" /> 100% Free Cancellation up to 48h before check-in
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
