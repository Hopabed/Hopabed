"use client";

import { getPropertyDetails, type PropertyDetails } from "@/lib/api";
import { CheckCircle2, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StayDetailPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getPropertyDetails(params.id).then(setProperty).catch((reason: Error) => setError(reason.message)); }, [params.id]);
  if (error) return <main className="container-page py-16 text-center"><p className="text-muted">{error}</p><Link href="/search" className="mt-4 inline-flex rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">Back to search</Link></main>;
  if (!property) return <main className="container-page py-16"><div className="h-96 animate-pulse rounded-2xl bg-mint" /></main>;
  return <main className="container-page py-10 pb-32 lg:pb-10">
    {property ? (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            "name": property.title,
            "description": property.description,
            "image": property.primaryImage,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": property.address,
              "addressLocality": property.locality,
              "addressRegion": property.city,
              "addressCountry": "IN"
            },
            "amenityFeature": property.amenities.map(a => ({
              "@type": "LocationFeatureSpecification",
              "name": a,
              "value": true
            }))
          }),
        }}
      />
    ) : null}
    <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
      <section><div className="relative h-80 overflow-hidden rounded-2xl bg-mint sm:h-[440px]">{property.primaryImage ? <Image src={property.primaryImage} alt={property.title} fill className="object-cover" priority /> : null}</div><div className="mt-6 flex items-start justify-between gap-4"><div>{property.isVerified ? <div className="flex items-center gap-2 text-sm font-semibold text-brand"><CheckCircle2 className="h-4 w-4" /> Verified property</div> : null}<h1 className="mt-2 text-3xl font-bold text-ink-soft">{property.title}</h1><p className="mt-2 flex items-center gap-2 text-muted"><MapPin className="h-4 w-4 text-brand" />{property.address}</p></div>{property.rating ? <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-brand text-brand" />{property.rating.toFixed(1)}</span> : null}</div><p className="mt-6 leading-7 text-muted">{property.description}</p><div className="mt-8"><h2 className="text-xl font-semibold text-ink-soft">Amenities</h2><div className="mt-3 flex flex-wrap gap-2">{property.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-mint px-3 py-1.5 text-sm text-ink-soft">{amenity}</span>)}</div></div></section>
      <aside className="fixed bottom-0 left-0 right-0 z-40 lg:relative lg:z-0 lg:h-fit rounded-t-2xl lg:rounded-2xl border-t lg:border border-border bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:shadow-sm"><p className="hidden lg:block text-sm text-muted">Available rooms</p><div className="mt-2 lg:mt-4 space-y-3 max-h-[40vh] overflow-y-auto lg:max-h-none">{property.rooms.map((room) => <div key={room.id} className="rounded-xl border border-border p-4"><div className="flex justify-between gap-3"><div><h2 className="font-semibold text-ink-soft">{room.name}</h2><p className="mt-1 text-sm text-muted">Up to {room.capacity} guests · {room.inventory} available</p></div><p className="font-bold text-ink-soft">₹{room.pricePerNight.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted">/night</span></p></div><Link href={`/booking?property=${property.id}&room=${room.id}`} className="mt-4 flex h-10 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white hover:bg-brand-dark">Select room</Link></div>)}{property.rooms.length === 0 ? <p className="text-sm text-muted">No rooms are currently available.</p> : null}</div></aside>
    </div>
  </main>;
}
