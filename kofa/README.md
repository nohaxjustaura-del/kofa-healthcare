# KOFA Healthcare website

This is the Next.js 15 application for the KOFA Healthcare website. Approved
firm, portfolio, team, and editorial content is managed in code. A daily GitHub
Actions workflow can add source-linked portfolio announcements from three
allowlisted official company feeds.

## Run locally

The application directory is `kofa/` within the repository. From that
directory:

```powershell
npm ci
npm run dev
```

The development server uses <http://localhost:3200>. From the repository root,
`npm run setup` installs the locked application dependencies and `npm run dev`
starts the same server.

Use `npm run typecheck` for TypeScript, `npm run test:news` for the offline news
parser tests, and `npm run test:contact` for contact delivery tests against a
loopback mock sink. The contact test does not send a real message.

Use `npm run build` for the production build, then `npm start` to serve it on
port 3200. Stop the development server before starting the production server on
that port.

## Contact form delivery

`POST /api/contact` validates name, email, optional website, and message
content. It rate-limits relayable submissions per IP address and sends a
validated submission through every configured destination. A submission succeeds
when at least one destination accepts it.

Set these names in `.env.local` for local work or in the deployment platform's
environment-variable settings. Keep their values out of source control.

| Name | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Enables Resend email delivery when paired with `CONTACT_FROM_EMAIL`. |
| `CONTACT_FROM_EMAIL` | Verified Resend sender; required with `RESEND_API_KEY`. |
| `CONTACT_TO_EMAIL` | Optional destination inbox. It otherwise uses the public KOFA address in `data/site.ts`. |
| `KOFA_CONTACT_WEBHOOK` | Optional JSON POST endpoint for a CRM or other relay. |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical public origin for metadata, sitemap, robots, and Open Graph URLs. |

With no delivery destination configured, the route returns `501`; the browser
form opens a pre-filled mailto link instead of claiming the message was sent.
Invalid submissions return `422`, rate-limited requests return `429`, a failure
across every configured destination returns `502`, and an all-channel timeout
returns `504`.

The webhook receives `name`, `email`, `company`, `website`, `reason`,
`message`, and `receivedAt` as JSON. Resend delivery uses the visitor's email as
the reply-to address. Configure at least one real destination before launch and
test it in that environment with a controlled recipient.

## Automatic sourced news

`npm run news:sync` refreshes `data/news.generated.json` from official RSS
feeds for RIVANNA, Nectero Therapeutics, and Caretaker Medical. The synchronizer
accepts only HTTPS article links on the configured official hosts, strips markup
from titles, rejects invalid or future dates, limits response size and item
count, and retains the previous snapshot for a source when that source fails.
Curated records in `data/news.ts` win when URLs or slugs overlap.

Generated entries contain only source metadata and the neutral excerpt “Read
the original announcement from [source].” Article cards and pages link to the
original publisher; the site does not copy article bodies or generate factual
summaries.

`.github/workflows/news-refresh.yml` is enabled on GitHub and scheduled daily
at 14:23 UTC; it can also be started manually. Its first scheduled run has not
yet been verified. It runs on the repository default branch, installs locked
dependencies, type-checks, runs the offline parser tests, refreshes the snapshot,
builds the site, and commits only a changed snapshot. The automation becomes
active after this repository is pushed to GitHub with Actions enabled and the
hosting project is connected to the repository. Branch protection must allow
runs. The GitHub Actions bot must be allowed to update the default branch. GitHub may delay scheduled
runs and can disable schedules after prolonged inactivity in a public
repository.

## Deployment and launch

`vercel.json` identifies this folder as a Next.js project. Deploy this `kofa/`
directory, or configure `kofa` as the project root in the hosting provider.
The prepared default is Vercel with its project root set to `kofa`. Connect the
GitHub repository so a committed news snapshot triggers the normal production
build. Add the required contact-delivery variables in the Vercel dashboard and
set `NEXT_PUBLIC_SITE_URL` to the production origin. Deployment is not performed
by this repository.

Before production launch, configure at least one live contact destination and
prove delivery with a controlled recipient. A successful mock test proves the
application behavior, not inbox delivery, sender-domain verification, webhook
authorization, or production DNS.

## Edit approved site content

The live content is stored in TypeScript files, not a CMS:

| Change | Location |
| --- | --- |
| Firm name, navigation, focus areas, contact reasons, public email | `data/site.ts` |
| Portfolio records | `data/portfolio.ts` |
| Curated news records | `data/news.ts` |
| Generated source snapshot | `data/news.generated.json` |
| Official feed configuration and sanitization | `scripts/sync-news.mjs` |
| Team names, roles, biographies, portraits, LinkedIn links | `data/team.ts` |
| Contact form fields and mailto fallback | `components/ui/ContactForm.tsx` |
| Contact validation and delivery | `app/api/contact/route.ts` |
| Homepage hero film (shots, timing) | `components/home/EvolutionReel.tsx`, media in `public/media/film/` |
| Homepage and Focus Areas stills | `public/media/home/`, referenced from `data/site.ts` and `app/page.tsx` |
| Public image attributions (`/credits`) | `data/credits.ts` |

Per the client's September 24 note there are no people in the homepage
imagery. The hero is a silent, looping film of real clinical imaging in the
order the technology arrived: Röntgen's 1895 radiograph, catheterization,
ultrasound, a 1960 heart valve, angioplasty and live 3D ultrasound, shown
full-bleed and cinematic. Clips load one shot at a time, pause off-screen,
and give way to a still of the 1895 radiograph when a visitor turns motion
off. The four stills (a tissue heart valve, catheter tips, a fetal
ultrasound, and a 3D-printed vessel model) are real, openly licensed medical
imagery as well. Their licences require the
attribution published at `/credits`. Read `public/media/CREDITS.md` before
replacing one, and update `data/credits.ts` in the same change.

## Inputs still needed before launch

- KOFA-approved privacy-policy copy. The visitor page currently provides only
  a contact address for privacy questions; it makes no unapproved legal claims.
- Approved biographies and portraits for Renee Masi and Dr. Meng Deng. Their
  entries in `data/team.ts` remain marked as forthcoming.
- Confirmation of the contact reason categories in `data/site.ts`.
- A configured and tested contact delivery destination.

## Handoff status

The codebase is prepared for client review. Production Vercel deployments of
commit `4a3c04e` were verified Ready in September 2026 at
`kofa-healthcare.vercel.app` and `kofa-eight.vercel.app`; the GitHub news
schedule is enabled. A completed scheduled refresh and real email/webhook
delivery have not yet been verified. The items above under “Inputs still needed
before launch” remain client dependencies, and live contact readiness requires
the controlled delivery proof described above.

Fresh handoff verification on September 19, 2026:

- `npm run news:sync` fetched 10 valid records from each of the three official
  feeds. The 30-record snapshot adds 20 unique article routes after curated URL
  deduplication.
- `npm run test:news` passed 6 offline parser, safety, dedupe, retention, and
  outage tests. `npm run test:contact` passed mocked success, provider failure,
  and timeout delivery paths without sending a real message.
- `npm run typecheck`, `npm run build`, and `git diff --check` passed. The build
  generated 116 pages, including 82 news article routes.
- `npm audit --omit=dev` reported zero vulnerabilities after the compatible
  Next.js 15.5.25, PostCSS 8.5.28, and Sharp 0.35.4 updates.
- Desktop browser checks covered primary navigation, portfolio filters and a
  company profile, news filters and an original-source link, the team dialog,
  contact validation, and horizontal overflow. An independent 390 by 844
  Playwright run covered the mobile menu and route navigation, portfolio Active
  and Exits filters, contact validation, and homepage/contact overflow.
