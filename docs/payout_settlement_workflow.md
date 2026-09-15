# Host Payout Settlement Workflow (Phase 14)

This document defines the business logic and operational workflow for transferring earnings from Hopebed to the Property Hosts after a successful booking.

## 1. Financial Math & Ledger
When a guest books a property, the amount is processed via PayU into the Hopebed business bank account.
The components of the payment are:
- **Subtotal:** `Room Price × Nights × Rooms`
- **Guest Service Fee:** `5% of Subtotal` (Hopebed Revenue)
- **Taxes:** `5% of (Subtotal + Service Fee)`
- **Total Amount:** The total amount authorized and captured via PayU.

### Host Payout Calculation (MVP)
For the MVP, Hopebed will take a **0% Commission** from the Host's Subtotal to attract early adopters.
- **Host Earning = Subtotal**
- **Hopebed Earning = Guest Service Fee**

## 2. Payout Trigger Conditions
Payouts are **not** instantaneous. To protect against fraud and guest disputes, payouts enter a holding period.
- **Eligibility:** A booking becomes eligible for payout **24 hours after the Check-Out date** (assuming no dispute has been raised by the guest).
- **Status Shift:** Once 24 hours pass, the internal ledger marks the booking payout as `READY`.

## 3. Operational Workflow (MVP: Manual Batching)
Before implementing a fully automated integration (like RazorpayX or Stripe Connect), Hopebed will use a manual batching process for payouts to maintain cash-flow visibility.

1. **Generation (Cron Job):** At 10:00 AM IST every Monday and Thursday, a backend script queries all `Booking` records where `status = 'completed'` (or `checked_in` + checkout date has passed by 24 hours) and `hostPayoutStatus = 'UNPAID'`.
2. **Review:** An admin downloads the generated CSV from the Admin Dashboard.
3. **Disbursement:** The admin uploads the CSV to the corporate bank portal (e.g., ICICI/HDFC Bulk NEFT transfer) to initiate the payments directly to the Host's provided bank details.
4. **Reconciliation:** The admin clicks "Mark as Paid" in the Admin Dashboard, which updates the `hostPayoutStatus` to `PAID` and adds a reference number to the Booking.

## 4. Future Automation (Post-Launch)
- Integrate **Razorpay Route** or **Stripe Connect** to automatically split the payment at the time of checkout.
- The Host's share will be automatically routed to a connected account and settled according to standard T+2 or T+3 rolling schedules without manual Admin CSV uploads.
