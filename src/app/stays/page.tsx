import { PROPERTIES } from "@/data/properties";
import { stayTypes } from "@/data/stayTypes";
import { PropertyCard } from "@/components/PropertyCard";
import { PromotionalAds } from "@/components/PromotionalAds";
import { GoogleAds } from "@/components/GoogleAds";
import { searchProperties } from "@/lib/api";
import Link from "next/link";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default async function StaysPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; city?: string }>;
}) {
  const { type, city } = await searchParams;
  const currentCategory = stayTypes.find((item) => item.id.toLowerCase() === type?.toLowerCase());
  const heading = currentCategory?.title ?? (city ? `Stays in ${city}` : "All Verified Stays in India");

  const queryParams = new URLSearchParams();
  if (type) queryParams.set("type", type);
  if (city) queryParams.set("city", city);

  let propertiesList: any[] = [];
  try {
    const apiProps = await searchProperties(queryParams);
    if (apiProps && apiProps.length > 0) {
      propertiesList = apiProps;
    }
  } catch (err) {
    console.warn("[Hopebed API Warning] searchProperties failed, falling back to mock properties:", err);
  }

  if (propertiesList.length === 0) {
    propertiesList = PROPERTIES.filter((p) => {
      if (type) {
        const normType = type.toLowerCase();
        const pType = (p.type || p.propertyType || "").toLowerCase();
        if (normType === "homestays") {
          if (pType !== "homestays" && pType !== "villas") return false;
        } else if (pType !== normType) {
          return false;
        }
      }
      if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
      return true;
    });
  }

  return (
    <section className="bg-gray-50 min-h-screen py-10">
      <div className="container-page">
        {/* Category Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b8f3c] uppercase tracking-wider mb-1">
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
            style={{ color: !type ? "#ffffff" : "#0f172a" }}
            className={`shrink-0 rounded-full px-4.5 py-2 text-xs font-bold transition-all ${
              !type
                ? "bg-[#0b8f3c] shadow-md"
                : "bg-white border border-gray-300 hover:bg-gray-100 shadow-2xs"
            }`}
          >
            <span style={{ color: !type ? "#ffffff" : "#0f172a" }}>
              All Categories{propertiesList.length > 0 ? ` (${propertiesList.length})` : ""}
            </span>
          </Link>
          {stayTypes.map((st) => {
            const isSelected = type?.toLowerCase() === st.id.toLowerCase();
            return (
              <Link
                key={st.id}
                href={`/stays?type=${st.id}`}
                style={{ color: isSelected ? "#ffffff" : "#0f172a" }}
                className={`shrink-0 rounded-full px-4.5 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#0b8f3c] shadow-md"
                    : "bg-white border border-gray-300 hover:bg-gray-100 shadow-2xs"
                }`}
              >
                <span style={{ color: isSelected ? "#ffffff" : "#0f172a" }}>
                  {st.title}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 3 Featured Promotional Ads (Near Top) */}
        <div className="mb-8">
          <PromotionalAds limit={3} />
        </div>

        {/* Properties Grid with Google Ads in Middle */}
        {propertiesList.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-gray-500">No properties currently found in this category.</p>
            <Link href="/stays" className="mt-4 inline-block font-bold text-[#0b8f3c] hover:underline">
              View all properties →
            </Link>
          </div>
        ) : (
          <>
            {/* Top Property Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
              {propertiesList.slice(0, Math.min(6, propertiesList.length)).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* 3 Sponsored Google Ads in Middle */}
            <div className="my-10 pt-4 border-t border-gray-200">
              <GoogleAds />
            </div>

            {/* Remaining Property Cards */}
            {propertiesList.length > 6 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
                {propertiesList.slice(6).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
