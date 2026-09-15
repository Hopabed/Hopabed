# Disaster Recovery & Rollback Plan (Phase 17)

This document outlines the standard operating procedures for responding to a critical production failure.

## 1. Zero-Downtime Rollback (Frontend & Backend)

### Frontend (Next.js via Cloudflare Pages / Vercel)
If a critical UI bug or build error affects users:
1. Navigate to your hosting provider dashboard (Cloudflare Pages or Vercel).
2. Go to **Deployments**.
3. Select the previous stable deployment from the list.
4. Click **Rollback** or **Promote to Production**. The domain will switch to the stable build instantly (within 10 seconds).

### Backend (Docker & PM2)
If the backend crashes repeatedly or introduces a fatal database regression:
1. SSH into the production server.
2. Checkout the previous stable Git commit: `git checkout <previous_stable_commit_hash>`
3. Rebuild the Docker container: `docker build -t hopebed-api:stable .`
4. Restart PM2 with zero-downtime reload: `pm2 reload ecosystem.config.cjs`

## 2. Database Disaster Recovery (MongoDB Atlas)

If the database is corrupted (e.g., accidental deletion of host records, or corrupted booking statuses):
1. **Freeze Traffic:** Temporarily stop the backend server or return a `503 Service Unavailable` flag to prevent new corrupted data from entering.
2. **Access Atlas:** Log into the MongoDB Atlas Dashboard.
3. **Point-In-Time Recovery:** Navigate to `Clusters -> Backup -> Restore`.
4. Select **Point In Time Recovery** and choose the exact minute *before* the corruption occurred.
5. Restore to the current cluster.
6. **Reconciliation:** Once restored, manually cross-reference PayU logs to identify any real payments that occurred *during* the downtime, and manually insert those `Booking` and `Payment` records.

## 3. Incident Communication Protocol

1. **Status Page:** Update the public status page to "Under Maintenance".
2. **Host Communication:** Send an automated email via SendGrid to all active hosts informing them that Check-in verification might be temporarily unavailable, advising them to manually verify guest IDs.
3. **Post-Mortem:** After resolution, document the root cause and add defensive code (e.g., stronger Zod schemas, tighter MongoDB locks) to prevent recurrence.
