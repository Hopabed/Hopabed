export default function HostTermsPage() {
  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="mb-4 text-4xl font-bold text-ink-soft">Host Terms & Hosting Agreement</h1>
      <p className="mb-4 text-sm font-semibold text-brand">Designed to support compliance with applicable Indian commercial, tax, and hospitality regulation guidelines.</p>
      <p className="mb-8 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">[LEGAL CONTENT PENDING: Business Owner Review Required]</p>
        <p className="mt-1 text-xs text-yellow-700">This document contains placeholder structural information and requires final business and legal verification prior to marketing launch.</p>
      </div>      <div className="prose prose-slate space-y-8 text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink-soft">1. Host Registration & Verification</h2>
          <p className="mt-2 leading-relaxed text-muted">
            All hosts registering property listings on Hopebed must complete mandatory identity verification (e-KYC) and provide valid property ownership or operational authorization documents. Unverified host listings will not be published publicly.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink-soft">2. Listing Accuracy & Safety Standards</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Hosts guarantee that property photos, pricing, amenities, room counts, and house rules are accurate and up-to-date. Properties must comply with local fire safety, sanitation, and municipal regulations.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink-soft">3. Payouts & Settlement</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Guest payments are collected by Hopebed as a marketplace payment aggregator and remitted to the host net of applicable platform commission fees within 24 to 48 hours post guest check-in.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink-soft">4. Guest Check-in & Stay Pass</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Hosts are required to verify the guest&apos;s digital Hopebed Stay Pass QR code and government-issued ID upon check-in before granting property access.
          </p>
        </section>
      </div>
    </div>
  );
}
