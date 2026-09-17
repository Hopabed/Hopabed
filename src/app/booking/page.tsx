"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PROPERTIES } from "@/data/properties";

function BookingRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const propertyId = searchParams.get("property") || searchParams.get("id");
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";

  useEffect(() => {
    const targetPropId = propertyId || PROPERTIES[0].id;
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);

    router.replace(`/booking/${targetPropId}?${params.toString()}`);
  }, [propertyId, checkIn, checkOut, guests, router]);

  return (
    <main className="container-page py-16 text-center">
      <p className="text-gray-500 font-medium">Redirecting to checkout page...</p>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<main className="container-page py-16 text-center"><p className="text-gray-500">Loading checkout...</p></main>}>
      <BookingRedirect />
    </Suspense>
  );
}
