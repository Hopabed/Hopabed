export default function PrivacyPolicyPage() {
  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="mb-4 text-4xl font-bold text-ink-soft">Privacy Policy</h1>
      <p className="mb-4 text-sm font-semibold text-brand">Designed to support compliance with applicable Indian data protection, consumer protection and information technology requirements.</p>
      <p className="mb-8 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">[LEGAL CONTENT PENDING: Business Owner Review Required]</p>
        <p className="mt-1 text-xs text-yellow-700">This document contains placeholder structural information and requires final business and legal verification prior to marketing launch.</p>
      </div>
      <div className="prose prose-slate space-y-8 text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink-soft">1. Overview & Commitment to Privacy</h2>
          <p className="mt-2 leading-relaxed text-muted">
            At Hopebed Technologies Private Limited (&quot;Hopebed&quot;), maintaining a safe, transparent, and trustworthy marketplace for guests and hosts is our priority. This Privacy Policy details our data processing practices.
          </p>
          <p className="mt-2 leading-relaxed text-muted font-medium">
            Based on Hopebed&apos;s current pilot-stage scale and information presently available, Hopebed does not currently appear to meet the criteria for designation as a Significant Data Fiduciary under the Digital Personal Data Protection Act (DPDP Act 2023). This assessment will be periodically reviewed as platform scale evolves.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">2. Owner Identity & Document Handling</h2>
          <p className="mt-2 leading-relaxed text-muted">
            To ensure host authenticity, we verify government-issued identification via compliant e-KYC providers. 
            Hopebed does <strong>NOT</strong> store raw Aadhaar numbers or unmasked ID images. We retain strictly required verification metadata.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">3. Data Retention</h2>
          <p className="mt-2 leading-relaxed text-muted">
            We retain data only as long as necessary for the purpose it was collected or as required under applicable Indian laws.
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted space-y-1">
            <li><strong>Bookings:</strong> Retained for 7 years as required by the Indian Income Tax Act and accounting regulations.</li>
            <li><strong>Invoices:</strong> Retained for 7 years for GST audit and statutory compliance.</li>
            <li><strong>Refunds:</strong> Retained for 7 years alongside financial transaction history.</li>
            <li><strong>Host KYC Data:</strong> Retained for 7 years post account deactivation.</li>
            <li><strong>Property Verification Docs:</strong> Retained for the duration of listing active status plus 3 years.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">4. Data Principal Rights & Account Deletion</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Users can access, correct, update, or request the erasure of their personal data via the Data & Privacy section in their account profile or by contacting support. Upon deletion, legally required operational records (like financial invoices) will be anonymised or retained according to the schedule above, while personal identifiers will be permanently removed.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-ink-soft">5. Grievance Officer</h2>
          <p className="mt-2 leading-relaxed text-muted">
            In accordance with the Consumer Protection (E-Commerce) Rules and Information Technology Act rules, you may contact our Grievance Officer:
          </p>
          <ul className="mt-2 list-none text-sm text-muted space-y-1 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <li><strong>Name:</strong> Sharukh Mithagari</li>
            <li><strong>Designation:</strong> Nodal Grievance & Compliance Officer</li>
            <li><strong>Address:</strong> Hopebed Technologies, Sector 17, Vashi, Navi Mumbai, Maharashtra 400703, India</li>
            <li><strong>Email:</strong> grievance@hopebed.in</li>
            <li><strong>Phone:</strong> +91 9930467576</li>
            <li><strong>Regulatory Contact:</strong> support@hopebed.in</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">6. Corporate Information</h2>
          <p className="mt-2 leading-relaxed text-muted">
            <strong>Registered Entity:</strong> Hopebed Technologies Private Limited<br />
            <strong>Registered Address:</strong> Sector 17, Vashi, Navi Mumbai, Maharashtra 400703, India
          </p>
        </section>
      </div>
    </div>
  );
}
