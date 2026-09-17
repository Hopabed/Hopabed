"use client";

import { Heart, Star, ShieldCheck, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "./WishlistProvider";
import { Property, formatInr } from "@/data/properties";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";

export function PropertyCard({ property }: { property: Partial<Property> & { id: string } }) {
  const { has, toggle } = useWishlist();
  const saved = has(property.id);

  const title = property.name || property.title || "Luxury Stay";
  const city = property.city || "India";
  const locality = property.locality || property.location || city;
  const image = property.primaryImage || property.image || (property.images && property.images[0]) || FALLBACK_IMAGE;
  const price = property.pricePerNight || 3000;
  const rating = property.rating || 4.5;
  const isVerified = property.isVerified ?? true;
  const propType = property.type || property.propertyType || "stay";

  return (
    <article className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
        <Link href={`/stays/${property.id}`} className="block h-full">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Verified Badge */}
        {isVerified && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified Stay
          </span>
        )}

        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur-md transition-transform hover:scale-110 hover:bg-white"
          aria-label={saved ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
          onClick={() => toggle(property.id)}
        >
          <Heart className={`h-4 w-4 ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
        
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium capitalize text-white backdrop-blur-md">
          {propType}
        </span>
      </div>
      
      <div className="flex flex-col px-1 pb-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/stays/${property.id}`} className="font-bold text-gray-900 line-clamp-1 hover:text-brand transition-colors">
            {title}
          </Link>
          <p className="flex shrink-0 items-center gap-1 text-xs font-bold text-gray-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </p>
        </div>
        
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 truncate">
          <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
          {locality}, {city}
        </p>

        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] text-gray-400 font-medium py-0.5">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-baseline justify-between border-t border-gray-100 pt-2.5">
          <p className="text-base font-extrabold text-brand">
            {formatInr(price)}
            <span className="text-xs font-normal text-gray-500"> / night</span>
          </p>
          <Link
            href={`/stays/${property.id}`}
            className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition-all"
          >
            View Stay
          </Link>
        </div>
      </div>
    </article>
  );
}
