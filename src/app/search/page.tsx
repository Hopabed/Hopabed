"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFilters, FilterState } from "@/components/PropertyFilters";
import { PropertySort, SortOption } from "@/components/PropertySort";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { searchProperties, SearchProperty } from "@/lib/api";

export default function SearchPage() {
  return (
    <main className="bg-gray-50 min-h-screen pb-16">
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand/60" /></div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}

function SearchContent() {
  const query = useSearchParams();
  const destinationParam = query.get("destination") || "";
  const typeParam = query.get("type") || query.get("propertyType") || "";
  const amenitiesParam = query.getAll("amenities");
  const pageParam = Number(query.get("page")) || 1;
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
    amenities: amenitiesParam,
  });
  const [sort, setSort] = useState<SortOption>("RECOMMENDED");
  const [properties, setProperties] = useState<SearchProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasApiError, setHasApiError] = useState(false);
  const [page, setPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: destinationParam,
      types: typeParam ? [typeParam] : prev.types,
      amenities: amenitiesParam.length > 0 ? amenitiesParam : prev.amenities,
    }));
  }, [destinationParam, typeParam]);

  useEffect(() => {
    let active = true;
    const fetchProps = async () => {
      setLoading(true);
      setHasApiError(false);
      try {
        const params = new URLSearchParams();
        if (filters.city) params.set("destination", filters.city);
        if (filters.types.length > 0) params.set("propertyType", filters.types[0]);
        if (filters.minPrice > 0) params.set("minPrice", filters.minPrice.toString());
        if (filters.maxPrice < 15000) params.set("maxPrice", filters.maxPrice.toString());
        if (checkInParam) params.set("checkIn", checkInParam);
        if (checkOutParam) params.set("checkOut", checkOutParam);
        params.set("guests", guestsParam.toString());
        
        if (filters.amenities.length > 0) {
          filters.amenities.forEach(a => params.append("amenities", a));
        }
        params.set("page", page.toString());
        params.set("limit", "12");

        const result = await searchProperties(params);
        if (active) {
          if (result && Array.isArray(result.properties)) {
            const sorted = [...result.properties].sort((a, b) => {
              if (sort === "PRICE_ASC") return a.pricePerNight - b.pricePerNight;
              if (sort === "PRICE_DESC") return b.pricePerNight - a.pricePerNight;
              if (sort === "RATING_DESC") return (b.rating || 0) - (a.rating || 0);
              return 0;
            });
            
            setProperties(sorted);
            if (result.pagination) {
              setTotalPages(result.pagination.totalPages);
            }
          } else {
            setHasApiError(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch search results:", err);
        if (active) setHasApiError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProps();
    return () => { active = false; };
  }, [filters, checkInParam, checkOutParam, guestsParam, sort, page]);

  function handleResetFilters() {
    setFilters({
      minPrice: 0,
      maxPrice: 15000,
      types: [],
      city: "",
      verifiedOnly: false,
      amenities: [],
    });
    setPage(1);
  }

  return (
    <>
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
              Showing verified stays available
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
              onChange={(f) => { setFilters(f); setPage(1); }}
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
                  onChange={(f) => { setFilters(f); setPage(1); }}
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
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-brand/60" />
              </div>
            ) : hasApiError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-12 text-center shadow-sm">
                <h3 className="text-lg font-bold text-rose-900">Unable to load properties</h3>
                <p className="mt-2 text-sm text-rose-700 max-w-md mx-auto">
                  We encountered an issue connecting to our servers. Please try adjusting your filters or try again later.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-6 rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition-all"
                >
                  Reset & Try Again
                </button>
              </div>
            ) : properties.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property as any} />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-200">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium text-gray-600 px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
