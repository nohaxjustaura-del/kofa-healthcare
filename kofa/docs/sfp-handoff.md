# SFP hosting handoff — October 16, 2026

## Repository and ownership

Repository: https://github.com/nohaxjustaura-del/kofa-healthcare

Michael's account is `sfp2`. A collaborator invitation was sent on October 16;
acceptance remains pending. Jing confirmed October 12 that services should stay
with SFP. The existing site is WordPress/Divi; this application is separate.

## Framework and backend

The application root is `kofa/`. It uses Next.js 15 App Router, React 19,
TypeScript, Tailwind CSS 4 and GSAP. The backend consists of Next.js Node.js
route handlers, including partner sessions/content and contact delivery.
There is no separate Express server or relational database.

Partner publishing persists JSON in this GitHub repository through a restricted
server-side GitHub token. Public pages merge the baseline content, automated
news snapshot, and partner overrides. See `partner-admin.md` and `.env.example`.
WordPress/Divi does not execute this application; SFP must confirm a Node.js
hosting target or propose a separately scoped WordPress integration.

## Build and serve

Use Node.js 22 (the version used by the news workflow). In `kofa/`:

1. `npm ci`
2. Configure server-only environment variables.
3. `npm run build`
4. `npm start` (listens on port 3200; proxy HTTPS traffic to that port).

Preserve `public/`, `.next/`, the package/lock files, runtime dependencies
and the checked-in data with the deployment. Run the app as a supervised
process. It requires runtime Node.js routes; a static-only export omits the
admin and contact backend.

## Environment and launch checks

- `NEXT_PUBLIC_SITE_URL=https://www.kofahealthcare.com`
- Partner access: `KOFA_ADMIN_PASSWORD`, `KOFA_ADMIN_SESSION_SECRET`.
- Content storage: `KOFA_CONTENT_REPOSITORY`,
  `KOFA_CONTENT_BRANCH`, `KOFA_CONTENT_GITHUB_TOKEN`. Follow the restricted
  Contents read/write setup in `partner-admin.md`; transfer values privately.
- Contact delivery: either Resend with a verified sender
  (`RESEND_API_KEY` + `CONTACT_FROM_EMAIL`), or `KOFA_CONTACT_WEBHOOK`.
  `CONTACT_TO_EMAIL` optionally overrides the public inbox.

Before DNS cutover, SFP should provide a staging URL and confirm:
partner sign-in, draft/save/publish persistence, public article visibility,
logo uploads, contact delivery to a controlled recipient, HTTPS, and a
recoverable rollback. Preserve existing mail-related DNS records.
The Vercel preview sign-in page is live; authenticated publishing on the SFP
host has not been tested. The final hostname, cost, cutover date, deployment
trigger after content/news commits, and secret-transfer method remain to agree
with SFP. Content reads are cached for one minute; automatic news snapshots
require a deploy/rebuild on SFP after snapshot commits.

## News-refresh incident

October 16 run:
https://github.com/nohaxjustaura-del/kofa-healthcare/actions/runs/38944878128

GitHub reports: the job was not started because recent account payments failed
or the spending limit needs increasing. No checkout, tests, feeds or build ran.
The owner must resolve the Billing & plans restriction before rerunning.
No payment, plan or spending-limit change was made during this follow-up.
Do not treat this as a parser failure or suppress it with a workflow change.

The daily job watches four configured official sources, rather than every
portfolio company. Manual article publishing is available in the admin.
Existing published data is retained while automatic refresh is blocked.
