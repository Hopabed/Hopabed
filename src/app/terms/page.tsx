export default function TermsPage() {
  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="mb-4 text-4xl font-bold text-ink-soft">Terms of Service</h1>
      <p className="mb-4 text-sm font-semibold text-brand">Designed to support compliance with applicable Indian data protection, consumer protection and information technology requirements.</p>
      <p className="mb-8 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="prose prose-slate space-y-8 text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink-soft">1. Acceptance of Terms & Age Policy</h2>
          <p className="mt-2 leading-relaxed text-muted">
            By accessing or using the [PLACEHOLDER_LEGAL_ENTITY_NAME] platform (&ldquo;Hopebed&rdquo;), you agree to be bound by these Terms. 
            <strong>Age Policy:</strong> [PLACEHOLDER_AGE_POLICY].
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">2. Guest Bookings & Payments</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Bookings are subject to availability. Payments are processed securely. A digital QR Stay Pass is issued to the guest for check-in.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">3. Host Obligations & Verification</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Property owners must provide accurate property information. For explicit host rules, please refer to the <a href="/host-terms" className="text-brand hover:underline">Host Terms</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">4. Cancellations & Refunds</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Cancellations are governed by the property policy specified during booking. Please view our full <a href="/refunds" className="text-brand hover:underline">Refund & Cancellation Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">5. Marketplace Responsibilities & Grievances</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Hopebed serves as a technology marketplace. For consumer grievances, complaints will be acknowledged within 48 hours and redressed within one month.
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            <strong>Grievance Officer:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_NAME]<br/>
            <strong>Email:</strong> [PLACEHOLDER_GRIEVANCE_OFFICER_EMAIL]<br/>
            You can also submit a complaint directly via our <a href="/grievance" className="text-brand hover:underline">Grievance Portal</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
