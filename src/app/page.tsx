import { Hero } from "@/components/Hero";
import { TrustSection } from "@/components/TrustSection";
import { StayTypeSection } from "@/components/StayTypeSection";
import { DestinationsSection } from "@/components/DestinationsSection";
import { PropertySection } from "@/components/PropertySection";
import { HostBanner } from "@/components/HostBanner";
import { PromotionalAds } from "@/components/PromotionalAds";
import { GoogleAds } from "@/components/GoogleAds";

export default function HomePage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://hopebed.in/#organization",
                "name": "Hopebed",
                "url": "https://hopebed.in",
                "logo": "https://hopebed.in/logo.png",
                "description": "Hopebed is building a smarter way to find, book and verify stays in India."
              },
              {
                "@type": "WebSite",
                "@id": "https://hopebed.in/#website",
                "url": "https://hopebed.in",
                "name": "Hopebed",
                "publisher": {
                  "@id": "https://hopebed.in/#organization"
                },
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://hopebed.in/search?destination={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          }),
        }}
      />
      <Hero />
      <TrustSection />

      {/* 3 Featured Promotional Ads (Near Top) */}
      <section className="bg-canvas py-8 border-y border-border/60 mb-6">
        <div className="container-page">
          <PromotionalAds limit={3} />
        </div>
      </section>

      <StayTypeSection />
      <DestinationsSection />

      {/* 3 Sponsored Google Ads (Middle Section) */}
      <section className="bg-gray-50 py-10 my-8 border-y border-gray-200">
        <div className="container-page">
          <GoogleAds />
        </div>
      </section>

      <PropertySection />
      <HostBanner />
    </main>
  );
}
