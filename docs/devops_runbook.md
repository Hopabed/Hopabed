# DevOps & Go-Live Runbook

Because these configurations require access to your personal cloud accounts (Cloudflare, MongoDB, etc.), follow this guide to complete the infrastructure setup.

## Phase 2: DNS & Cloudflare Setup

1. **Log in to Cloudflare** and add `hopebed.in` as a site.
2. Update your Domain Registrar's Nameservers to the ones Cloudflare provides.
3. **Frontend DNS:**
   - Add a `CNAME` record for `@` (root) pointing to your Vercel/Pages deployment URL (e.g., `hopebed-frontend.vercel.app`).
   - Add a `CNAME` record for `www` pointing to the same URL.
4. **Backend DNS:**
   - Add an `A` record for `api.hopebed.in` pointing to your Backend Server's IP address.
5. **SSL/TLS:**
   - Go to `SSL/TLS -> Overview` and set the mode to **Full (Strict)**.
   - Go to `Edge Certificates` and turn on **Always Use HTTPS**.

## Phase 10: MongoDB Atlas Backups

1. Log into your **MongoDB Atlas** Dashboard.
2. Go to your `hopebed-cluster`.
3. Click the **Backup** tab.
4. If not enabled, click **Enable Cloud Backups**.
5. Set the backup policy to take a snapshot daily and retain it for 7 days.
6. *Restore Test:* Click **Restore**, select a snapshot from yesterday, and choose "Restore to new cluster" to verify it works.

## Phase 11: Monitoring & Alerts

1. Create a free account on **UptimeRobot** (or a similar tool).
2. Add a new **HTTP(s) Monitor**:
   - URL: `https://api.hopebed.in/api/health`
   - Interval: 5 minutes.
3. Go to `Alert Contacts` in UptimeRobot and link your Email or a Slack Webhook.
4. Now, if your server crashes and the health endpoint fails, you will be instantly notified.

## Final Go-Live Sign Off

1. Ensure the backend `.env` file has `NODE_ENV=production` and a real `SENDGRID_API_KEY`.
2. Visit `https://hopebed.in` in an incognito window.
3. Test a complete signup and booking flow.
4. Welcome to launch!
