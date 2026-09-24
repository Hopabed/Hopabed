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
            By accessing or using the Hopebed Technologies Private Limited platform (&ldquo;Hopebed&rdquo;), you agree to be bound by these Terms. 
            <strong>Age Policy:</strong> Guests must be at least 18 years of age to register an account and make bookings independently. Minors must be accompanied by a parent or legal guardian.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">2. Guest Bookings & Payments</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Bookings are subject to real-time property availability. Payments are processed securely via PCI-DSS compliant gateways. A digital QR Stay Pass is generated upon payment verification and presented at check-in.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">3. Host Obligations & Verification</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Property hosts must submit accurate property details and undergo identity verification. For complete hosting guidelines and payout terms, please refer to the <a href="/host-terms" className="text-brand hover:underline">Host Terms</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">4. Cancellations & Refunds</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Cancellations are governed by the property cancellation policy specified during booking. Please view our full <a href="/refunds" className="text-brand hover:underline">Refund & Cancellation Policy</a> for timelines and processing rules.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink-soft">5. Marketplace Responsibilities & Grievances</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Hopebed operates as a technology marketplace connecting guests with verified accommodation providers. In compliance with Consumer Protection Rules, customer grievances will be acknowledged within 48 hours and redressed within 30 days.
          </p>
          <p className="mt-2 leading-relaxed text-muted">
            <strong>Grievance Officer:</strong> Sharukh Mithagari<br/>
            <strong>Email:</strong> grievance@hopebed.in<br/>
            You can also submit a complaint directly via our <a href="/grievance" className="text-brand hover:underline">Grievance Portal</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
