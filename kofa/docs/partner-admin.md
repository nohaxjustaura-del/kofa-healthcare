# Partner admin

General partners open `/admin`, or choose **Partner sign-in** in the footer.
They sign in with the partner password. The session lasts 12 hours.

## Everyday use

In **Portfolio**, select a company to edit it or choose **Add company**. Enter
its name, website, focus area, investment status, clinical focus, short
description and full description. Location, investment year, an exit note and
a logo are optional. Upload a PNG, JPG or WebP logo up to 100 KB, or use an
HTTPS image address. Existing approved company photography and video remain
attached when a company is edited.

Choose **Save draft** to keep an entry private, then **Publish company** when
ready. An existing published entry uses **Save changes**. **Move to draft**
removes that entry from the public site without deleting it. Page addresses
can be changed before the first save; afterward they stay fixed to protect
shared links and news relationships.

In **News**, choose **Add article**. Set its headline, publication date, news
category and summary. Link an existing company to show the article on its
portfolio page as well. For external coverage, supply the article URL and
publisher; for an original KOFA article, enter its body with blank lines
between paragraphs. Text is rendered as text, not executable HTML.

Portfolio News stays visible for 12 months. KOFA News does not expire. Drafts
and future-dated stories are excluded from public pages. A future-dated story
must remain a draft until its publication date; there is no scheduled publisher.

## One-time production setup

1. Merge the feature and deploy the `kofa/` application to the existing Vercel
   project. The content file `kofa/data/content.admin.json` must exist on the
   configured content branch before enabling publishing.
2. In Vercel's production environment settings, set `KOFA_ADMIN_PASSWORD` to a
   strong password of at least 16 characters and `KOFA_ADMIN_SESSION_SECRET`
   to an independently generated random secret of at least 32 characters.
3. Set `KOFA_CONTENT_REPOSITORY` to `nohaxjustaura-del/kofa-healthcare`, and
   `KOFA_CONTENT_BRANCH` to the branch used for public content (normally `main`).
4. Create a fine-grained GitHub token restricted to this repository with
   **Contents: Read and write**, and set it as `KOFA_CONTENT_GITHUB_TOKEN`.
   Repository rules must permit its content commits. The application writes
   only the content JSON file. Do not use a broadly scoped personal token.
5. Redeploy after setting the environment values. Share the URL and password
   privately with the general partners, and bookmark the URL.

All secrets remain on the server. Without valid sign-in settings, sign-in is
disabled; without connected storage, editing/publishing is disabled. The
admin route is omitted from the sitemap and marked noindex. Changing either
the password or session secret invalidates existing sessions. Login attempts
are limited per server instance; platform-level rate limiting can supplement
this for distributed deployments.

Production content is committed to GitHub, providing persistent storage and
recoverable history. Public pages read the same content with a one-minute
cache; successful admin saves invalidate public content and page caches.
The homepage strip, portfolio filters/counts, company pages, news/company
relationships, article metadata and sitemap all use the shared content layer.
The existing Vercel Git connection can also rebuild the checked-in snapshot.
If the content service is unavailable, public pages fall back to the deployed
snapshot, while admin reads/saves fail visibly and preserve the form.

Simultaneous saves use the GitHub file revision as a lock. A stale save is
rejected with a reload instruction rather than overwriting another partner's
work. Reloading an entry asks before discarding unsaved form changes.

## Local preview

Set the password and session-secret values in `.env.local`, plus
`KOFA_CONTENT_LOCAL=1`, then run `npm run dev`. Local mode edits
`data/content.admin.json` in this checkout. It is deliberately ignored in
production. Local preview saves and production publishing both pass through
the same validation, authentication, draft handling and public content layer.

## Automatic news coverage

The daily synchronizer watches official sources for RIVANNA, Nectero,
Caretaker and Eyenuk. Eyenuk's redesigned site uses dated HTML news/blog
cards rather than its retired WordPress feed. The bot stores source metadata
and links, retains prior data during source outages, and does not copy bodies.
An explicit `KOFA Healthcare` mention in an RSS title or description is
classified as KOFA News. Manual edits take precedence and are stored separately
from the generated snapshot, so the daily refresh cannot overwrite them.

Axon's September 25, 2025 Series A announcement was already curated. Its
KOFA investor mention now correctly makes it KOFA News, retaining its original
page address and company relationship. Marrow Access's recorded announcements
are older than the portfolio window; its page explains the absence of recent
records and links to the company website. Automatic collection is limited to
the configured sources, so partners can manually add other coverage.
