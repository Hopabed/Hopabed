export default function PrivacyPolicyPage() {
  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="mb-4 text-4xl font-bold text-ink-soft">Privacy Policy</h1>
      <p className="mb-4 text-sm font-semibold text-brand">Designed to support compliance with applicable Indian data protection, consumer protection and information technology requirements.</p>
      <p className="mb-8 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="prose prose-slate space-y-8 text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink-soft">1. Overview & Commitment to Privacy</h2>
          <p className="mt-2 leading-relaxed text-muted">
            At [PLACEHOLDER_LEGAL_ENTITY_NAME], maintaining a safe, transparent, and trustworthy marketplace for guests and hosts is our priority. This Privacy Policy details our data processing practices.
          </p>
          <p className="mt-2 leading-relaxed text-muted font-medium">
            Based on Hopebed&apos;s current pilot-stage scale and information presently available, Hopebed does not currently appear to meet the criteria for designation as a Significant Data Fiduciary. This assessment must be reassessed if Hopebed&apos;s scale, data processing, risk profile, or applicable government designation changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">2. Owner Identity & Document Handling</h2>
          <p className="mt-2 leading-relaxed text-muted">
            To ensure host authenticity, we verify government-issued identification via compliant e-KYC providers. 
            Hopebed does <strong>NOT</strong> store raw Aadhaar numbers or images. We retain strictly required metadata.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">3. Data Retention</h2>
          <p className="mt-2 leading-relaxed text-muted">
            We retain data only as long as necessary for the purpose it was collected or as required by law.
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted space-y-1">
            <li><strong>Bookings:</strong> [LEGAL_RETENTION_PERIOD_BOOKINGS]</li>
            <li><strong>Invoices:</strong> [LEGAL_RETENTION_PERIOD_INVOICES]</li>
            <li><strong>Refunds:</strong> [LEGAL_RETENTION_PERIOD_REFUNDS]</li>
            <li><strong>Host KYC Data:</strong> [PLACEHOLDER_HOST_RETENTION]</li>
            <li><strong>Property Verification Docs:</strong> [PLACEHOLDER_DOC_RETENTION]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">4. Data Principal Rights & Account Deletion</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Users can access, correct, update, or request the erasure of their personal data via the Data & Privacy section in their account profile. Upon deletion, legally required operational records (like financial invoices) will be anonymised or retained according to the schedule above, while personal identifiers will be removed.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-ink-soft">5. Grievance Officer</h2>
          <p className="mt-2 leading-relaxed text-muted">
            In accordance with the Consumer Protection (E-Commerce) Rules and applicable data protection laws, you may contact our Grievance Officer:
          </p>
          <ul className="mt-2 list-none text-sm text-muted space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <li><strong>Name:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_NAME]</li>
            <li><strong>Designation:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_DESIGNATION]</li>
            <li><strong>Address:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_ADDRESS]</li>
            <li><strong>Email:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_EMAIL]</li>
            <li><strong>Phone:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_PHONE]</li>
            <li><strong>Regulatory Contact:</strong> [PLACEHOLDER_REGULATORY_CONTACT]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">6. Corporate Information</h2>
          <p className="mt-2 leading-relaxed text-muted">
            <strong>Registered Entity:</strong> [PLACEHOLDER_LEGAL_ENTITY_NAME]<br />
            <strong>Registered Address:</strong> [PLACEHOLDER_REGISTERED_ADDRESS]
          </p>
        </section>
      </div>
    </div>
  );
}
