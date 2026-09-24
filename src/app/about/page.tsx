import Link from "next/link";
import { ShieldCheck, Sparkles, Building2, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="container-page max-w-4xl">


        <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> About Hopebed
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Building India&apos;s Smartest Verified Stay Network
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Hopebed connects travelers and long-stay guests with physically inspected, 100% verified hotels, PGs, and homestays across Navi Mumbai and major destinations in India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-b border-gray-100 py-8">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">100% Verified</h3>
              <p className="text-xs text-gray-500">Every property physically inspected by on-site auditors.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Hotels, PGs & Homestays</h3>
              <p className="text-xs text-gray-500">Short stays or long-term monthly co-living options.</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">Curated Locations</h3>
              <p className="text-xs text-gray-500">Hand-picked stays near key transit and commercial hubs.</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/stays"
              className="inline-flex rounded-2xl bg-brand px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all"
            >
              Explore Verified Stays
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
