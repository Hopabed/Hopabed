"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters, FilterState } from "@/components/PropertyFilters";
import { PropertySort, SortOption } from "@/components/PropertySort";
import { PROPERTIES, Property } from "@/data/properties";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="container-page py-16">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const query = useSearchParams();
  const destinationParam = query.get("destination") || "";
  const typeParam = query.get("type") || query.get("propertyType") || "";
  const checkInParam = query.get("checkIn") || "";
  const checkOutParam = query.get("checkOut") || "";
  const guestsParam = Number(query.get("guests")) || 2;
  const roomsParam = Number(query.get("rooms")) || 1;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 15000,
    types: typeParam ? [typeParam] : [],
    city: destinationParam,
    verifiedOnly: false,
  });
  const [sort, setSort] = useState<SortOption>("RECOMMENDED");

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: destinationParam,
      types: typeParam ? [typeParam] : prev.types,
    }));
  }, [destinationParam, typeParam]);

  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter((p) => {
      // City search match
      if (
        filters.city &&
        !p.city.toLowerCase().includes(filters.city.toLowerCase()) &&
        !p.name.toLowerCase().includes(filters.city.toLowerCase()) &&
        !p.location.toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }

      // Price filter
      if (p.pricePerNight < filters.minPrice || p.pricePerNight > filters.maxPrice) {
        return false;
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(p.type)) {
        return false;
      }

      // Verified filter
      if (filters.verifiedOnly && !p.isVerified) {
        return false;
      }

      // Guest count filter
      if (p.maxGuests < guestsParam) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sort === "PRICE_ASC") return a.pricePerNight - b.pricePerNight;
      if (sort === "PRICE_DESC") return b.pricePerNight - a.pricePerNight;
      if (sort === "RATING_DESC") return b.rating - a.rating;
      return 0;
    });
  }, [filters, sort, guestsParam]);

  function handleResetFilters() {
    setFilters({
      minPrice: 0,
      maxPrice: 15000,
      types: [],
      city: "",
      verifiedOnly: false,
    });
  }

  return (
    <section className="bg-gray-50 min-h-screen pb-16">
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container-page">
          <SearchBar
            defaultDestination={destinationParam}
            defaultCheckIn={checkInParam}
            defaultCheckOut={checkOutParam}
            defaultGuests={guestsParam}
            defaultRooms={roomsParam}
          />
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {destinationParam ? `Stays in "${destinationParam}"` : "Discover Stays in India"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredProperties.length} verified stays available
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-800 shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
            <PropertySort value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block md:col-span-1 sticky top-24">
            <PropertyFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Modal */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm md:hidden">
              <div className="relative ml-auto h-full w-4/5 max-w-xs bg-white p-6 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <h3 className="font-bold text-gray-900">Filter Stays</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <PropertyFilters
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                />
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="mt-6 w-full rounded-xl bg-brand py-3 text-center text-sm font-bold text-white shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="md:col-span-3">
            {filteredProperties.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-bold text-gray-900">No properties found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try clearing your filters or searching for a different destination city like Mumbai, Goa, or Manali.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-dark transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
