export default function RefundsPage() {
  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="mb-4 text-4xl font-bold text-ink-soft">Refund & Cancellation Policy</h1>
      <p className="mb-4 text-sm font-semibold text-brand">Designed to support compliance with applicable Indian Consumer Protection rules and transparent payment gateway refund timelines.</p>
      <p className="mb-8 text-sm text-muted">Last updated: {new Date().toLocaleDateString("en-IN")}</p>

      <div className="mb-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm font-semibold text-yellow-800">[LEGAL CONTENT PENDING: Business Owner Review Required]</p>
        <p className="mt-1 text-xs text-yellow-700">This document contains placeholder structural information and requires final business and legal verification prior to marketing launch.</p>
      </div>      <div className="prose prose-slate space-y-8 text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink-soft">1. Free Cancellation Window</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Guests are entitled to 100% full refund if a booking is cancelled at least 48 hours prior to the scheduled check-in date and time.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink-soft">2. Late Cancellations & No-Shows</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Cancellations made less than 48 hours prior to check-in or guest no-shows are subject to a cancellation fee equivalent to the first night&apos;s stay rate plus applicable taxes. The remaining balance will be refunded.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink-soft">3. Refund Processing Timelines</h2>
          <p className="mt-2 leading-relaxed text-muted">
            Approved refunds are processed automatically to the guest&apos;s original payment method (UPI, Netbanking, Credit/Debit Card) via Razorpay/PayU within 5 to 7 business days from the cancellation request date.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-ink-soft">4. Host Cancellations & Property Service Guarantees</h2>
          <p className="mt-2 leading-relaxed text-muted">
            If a host cancels a confirmed booking or if a property fails to match verified quality standards upon arrival, Hopebed will provide 100% instant full refund or re-book the guest into an equivalent or upgraded verified stay at no extra charge.
          </p>
        </section>
      </div>
    </div>
  );
}
