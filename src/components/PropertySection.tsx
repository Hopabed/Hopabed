"use client";

import { searchProperties, SearchProperty } from "@/lib/api";
import { ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PropertyCard } from "./PropertyCard";

export function PropertySection() {
  const [properties, setProperties] = useState<SearchProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const result = await searchProperties(new URLSearchParams());
        setProperties(result.properties.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch properties:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  if (!loading && properties.length === 0) {
    return (
      <section className="bg-canvas py-12 sm:py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-ink-soft sm:text-3xl">Featured verified stays</h2>
              <p className="mt-2 text-muted">Book properties with confidence.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 p-10 text-center shadow-xs">
            <h3 className="text-base font-bold text-gray-800">No verified stays currently featured</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
              Explore all categories to discover available verified hotels, PGs, and homestays.
            </p>
            <Link href="/stays" className="mt-4 inline-block font-bold text-[#0b8f3c] hover:underline text-xs">
              Explore All Stays →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-canvas py-12 sm:py-16">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink-soft sm:text-3xl">Featured verified stays</h2>
            <p className="mt-2 text-muted">Book properties with confidence.</p>
          </div>
          <Link href="/search" className="hidden text-sm font-semibold text-brand transition hover:text-brand-dark sm:block">
            View all →
          </Link>
        </div>
        
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand/60" />
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 no-scrollbar snap-x sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
            <Link
              href="/search"
              className="absolute -right-5 top-1/3 hidden h-12 w-12 items-center justify-center rounded-full border border-border bg-white shadow-md transition hover:scale-105 hover:shadow-lg lg:flex"
              aria-label="See more stays"
            >
              <ChevronRight className="h-5 w-5 text-ink-soft" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
