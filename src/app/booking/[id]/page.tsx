"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { getPropertyById, formatInr, Property } from "@/data/properties";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { initRazorpayPayment, initRazorpayCheckout, verifyRazorpayPayment, getPropertyDetails } from "@/lib/api";
import { ShieldCheck, Calendar, Users, MapPin, CheckCircle2, ArrowLeft, Lock, Info, XCircle, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BookingCheckoutPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { addBooking } = useBooking();
  const { user, openAuthModal } = useAuth();

  const [property, setProperty] = useState<Property | undefined>(() => getPropertyById(params.id));
  const [isLoadingProperty, setIsLoadingProperty] = useState(!property);

  const initialCheckIn = searchParams.get("checkIn") || "";
  const initialCheckOut = searchParams.get("checkOut") || "";
  const initialGuests = Number(searchParams.get("guests")) || 2;
  const initialRooms = Number(searchParams.get("rooms")) || 1;

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState(initialRooms);

  const [guestName, setGuestName] = useState(user?.name || "");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment Error State & 5-Second Countdown
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "PROCESSING" | "REJECTED">("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (!property && params.id) {
      setIsLoadingProperty(true);
      getPropertyDetails(params.id)
        .then((details) => {
          setProperty({
            id: details.id,
            name: details.title,
            title: details.title,
            location: `${details.locality || details.city}, ${details.city}`,
            locality: details.locality || details.city,
            city: details.city,
            state: "India",
            rating: details.rating || 4.8,
            reviewCount: 18,
            pricePerNight: details.pricePerNight || (details.rooms?.[0]?.pricePerNight) || 2000,
            type: (details.propertyType?.toLowerCase() || "hotels") as any,
            propertyType: details.propertyType || "Hotel",
            image: details.primaryImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            images: [
              details.primaryImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            ],
            isVerified: details.isVerified !== false,
            description: details.description || "",
            address: details.address || "",
            amenities: details.amenities || [],
            maxGuests: details.rooms?.[0]?.capacity || 4,
            roomsCount: details.rooms?.length || 1,
            hostName: "Hopebed Verified Host",
          });
        })
        .catch((err) => console.error("Failed to load property details:", err))
        .finally(() => setIsLoadingProperty(false));
    }
  }, [params.id, property]);

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (user.email) setGuestEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (paymentStatus === "REJECTED" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentStatus, countdown]);

  if (isLoadingProperty) {
    return (
      <main className="container-page py-20 text-center flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand mb-4" />
        <p className="text-sm font-bold text-gray-700">Loading stay details...</p>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="container-page py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Property not found</h2>
        <p className="mt-2 text-sm text-gray-500">The property you are trying to book could not be found.</p>
        <Link href="/search" className="mt-4 inline-block font-bold text-brand hover:underline">
          Return to Search →
        </Link>
      </main>
    );
  }


  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const [promoCodeInput, setPromoCodeInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hopebed_claimed_promo") || "";
    }
    return "";
  });
  const [appliedPromo, setAppliedPromo] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("hopebed_claimed_promo") || null;
    }
    return null;
  });

  const nights = calculateNights();
  const rawSubtotal = property.pricePerNight * nights * rooms;
  const discountAmount = appliedPromo?.toUpperCase() === "HOPE20" ? Math.round(rawSubtotal * 0.2) : 0;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const taxes = Math.round(subtotal * 0.12);
  const totalPrice = subtotal + taxes;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCodeInput.trim().toUpperCase() === "HOPE20") {
      setAppliedPromo("HOPE20");
      if (typeof window !== "undefined") {
        localStorage.setItem("hopebed_claimed_promo", "HOPE20");
      }
    } else {
      alert("Invalid promo code. Use HOPE20 for 20% off your stay.");
    }
  };

  const triggerPaymentRejection = (reason: string) => {
    setIsSubmitting(false);
    setPaymentStatus("REJECTED");
    setErrorMessage(reason);
    setCountdown(5);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus("PROCESSING");
    setErrorMessage(null);

    try {
      const checkoutInit = await initRazorpayCheckout({
        propertyId: property.id,
        propertyTitle: property.name,
        checkIn: checkIn || new Date().toISOString().split("T")[0],
        checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
        guests,
        rooms,
        totalAmount: totalPrice,
        guestName: guestName || user.name || "Sharukh Mithagari",
        guestEmail: guestEmail || user.email || "hello@hopebed.in",
        guestPhone: guestPhone || user.phone || "+91 9876543210",
      });

      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: unknown) => { on: (evt: string, fn: (resp?: unknown) => void) => void; open: () => void } }).Razorpay;

      if (!RazorpayConstructor) {
        triggerPaymentRejection("Razorpay payment gateway SDK failed to load. Please check your connection.");
        return;
      }

      const options = {
        key: checkoutInit.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcPMDAMTJ2sUPh",
        amount: checkoutInit.amount,
        currency: checkoutInit.currency || "INR",
        name: "Hopebed Stays",
        description: `Stay Payment - ${property.name}`,
        order_id: checkoutInit.orderId,
        offer_id: (checkoutInit as { offerId?: string }).offerId || process.env.NEXT_PUBLIC_RAZORPAY_OFFER_ID || "offer_TdyZnF3E2TetT1",
        prefill: {
          name: guestName || user.name || "Sharukh Mithagari",
          email: guestEmail || user.email || "hello@hopebed.in",
          contact: guestPhone || user.phone || "+91 9876543210",
        },
        theme: {
          color: "#0b8f3c",
        },
        handler: async function (response: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) {
          if (response.razorpay_order_id && response.razorpay_payment_id && response.razorpay_signature) {
            try {
              await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: checkoutInit.bookingId,
              });
            } catch (err) {
              console.warn("Razorpay verification callback notice:", err);
            }
          }

          addBooking({
            propertyId: property.id,
            propertyName: property.name,
            propertyImage: property.image || property.images?.[0] || "",
            city: property.city,
            checkIn: checkIn || new Date().toISOString().split("T")[0],
            checkOut: checkOut || new Date(Date.now() + 86400000).toISOString().split("T")[0],
            guests,
            rooms,
            totalNights: nights,
            totalPrice,
            guestName: guestName || user.name || "Sharukh Mithagari",
            guestEmail: guestEmail || user.email || "hello@hopebed.in",
            guestPhone: guestPhone || user.phone || "+91 9876543210",
          });

          setIsSubmitting(false);
          setPaymentStatus("IDLE");
          router.push(`/booking/confirmation/${checkoutInit.bookingId}`);
        },
        modal: {
          ondismiss: function () {
            triggerPaymentRejection("Payment Rejected: You closed the Razorpay payment window before completing payment.");
          },
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.on("payment.failed", function (resp: any) {
        const failureReason = resp?.error?.description || "Payment was rejected or declined by bank.";
        triggerPaymentRejection(`Payment Rejected: ${failureReason}`);
      });
      rzp.open();
    } catch (err: any) {
      console.error("Failed to initialize Razorpay checkout:", err);
      triggerPaymentRejection(err.message || "Unable to reach Razorpay gateway server.");
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container-page flex items-center justify-between">
          <Link
            href={`/stays/${property.id}`}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-brand transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Stay Details
          </Link>
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Lock className="h-3.5 w-3.5" /> Secure Instant Booking
          </span>
        </div>
      </div>

      <div className="container-page py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Confirm and Pay for Your Stay</h1>

        {/* PAYMENT REJECTED / EXITED ERROR BANNER */}
        {paymentStatus === "REJECTED" && (
          <div className="mb-6 rounded-3xl border-2 border-rose-200 bg-rose-50/90 p-6 shadow-lg transition-all animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                <XCircle className="h-7 w-7" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-extrabold text-rose-950">Payment Rejected / Transaction Cancelled</h3>
                  <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-bold text-rose-900">
                    Status Active {countdown > 0 ? `(Auto-dismiss: ${countdown}s)` : ""}
                  </span>
                </div>
                <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                  {errorMessage || "The Razorpay payment process was exited or rejected before completion. No funds have been debited from your account."}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSubmitBooking}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`} /> Retry Razorpay Payment Now
                  </button>
                  <button
                    onClick={() => {
                      setPaymentStatus("IDLE");
                      setErrorMessage(null);
                    }}
                    className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-xs font-bold text-rose-900 hover:bg-rose-100 transition-colors"
                  >
                    Dismiss Error
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              {/* Trip Details */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">1. Your Trip Dates & Guests</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Check-out Date</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Number of Guests</label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-brand bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} Guest{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Rooms Needed</label>
                    <select
                      value={rooms}
                      onChange={(e) => setRooms(Number(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-brand bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} Room{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Guest Personal Information */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">2. Guest Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      placeholder="Enter full name"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      placeholder="your.email@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 block mb-1">Mobile Phone Number</label>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      required
                      placeholder="+91 9876543210"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-gray-700 block mb-1">Special Requests (Optional)</label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Early check-in requested, high floor room"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info Box */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-brand">
                  <Info className="h-5 w-5" /> Hopebed Guaranteed Instant Booking
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your payment is protected under Hopebed Guarantee. Free cancellation up to 48 hours prior to check-in.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-brand py-4 text-center text-base font-extrabold text-white shadow-xl shadow-brand/25 transition-all hover:bg-brand-dark disabled:opacity-50"
              >
                {isSubmitting ? "Processing Booking..." : user ? `Confirm Booking • ${formatInr(totalPrice)}` : "Sign In & Complete Booking"}
              </button>
            </form>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl space-y-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gray-200">
                <Image src={property.image || property.images?.[0] || ""} alt={property.name} fill className="object-cover" />
              </div>

              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified Stay
                </span>
                <h3 className="font-extrabold text-lg text-gray-900">{property.name}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-brand" /> {property.locality}, {property.city}
                </p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Nightly Rate</span>
                  <span className="font-bold text-gray-900">{formatInr(property.pricePerNight)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-bold text-gray-900">{nights} night{nights > 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rooms & Guests</span>
                  <span className="font-bold text-gray-900">{rooms} Room, {guests} Guests</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatInr(rawSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                    <span>Promo Discount (HOPE20 - 20% OFF)</span>
                    <span>-{formatInr(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes & Fees (12%)</span>
                  <span className="font-bold text-gray-900">{formatInr(taxes)}</span>
                </div>

                {/* Promo Code Box */}
                <form onSubmit={handleApplyPromo} className="pt-2 border-t border-gray-100">
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Have a Promo Code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="e.g. HOPE20"
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-mono font-bold text-gray-900 uppercase outline-none focus:border-[#0b8f3c]"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-[#0b8f3c] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#06752f] transition-colors cursor-pointer"
                    >
                      {appliedPromo ? "Applied" : "Apply"}
                    </button>
                  </div>
                </form>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-extrabold text-gray-900">
                  <span>Total Due</span>
                  <span className="text-[#0b8f3c]">{formatInr(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
