import { PROPERTIES } from "@/data/properties";
import { stayTypes } from "@/data/stayTypes";
import { PropertyCard } from "@/components/PropertyCard";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; city?: string }>;
}) {
  const { type, city } = await searchParams;
  const currentCategory = stayTypes.find((item) => item.id === type);
  const heading = currentCategory?.title ?? (city ? `Stays in ${city}` : "All Verified Stays in India");

  const filteredProperties = PROPERTIES.filter((p) => {
    if (type && p.type !== type && p.propertyType !== type) return false;
    if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="bg-gray-50 min-h-screen py-10">
      <div className="container-page">
        {/* Category Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" /> Handpicked Indian Properties
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{heading}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {currentCategory?.description || "Explore verified hotels, luxury villas, homestays, and apartments across India."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Hopebed Verified
            </span>
          </div>
        </div>

        {/* Category Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <Link
            href="/stays"
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              !type ? "bg-brand text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Categories{PROPERTIES.length > 0 ? ` (${PROPERTIES.length})` : ""}
          </Link>
          {stayTypes.map((st) => (
            <Link
              key={st.id}
              href={`/stays?type=${st.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                type === st.id ? "bg-brand text-white shadow-md" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {st.title}
            </Link>
          ))}
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">No properties currently found in this category.</p>
            <Link href="/stays" className="mt-4 inline-block font-bold text-brand hover:underline">
              View all properties →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
