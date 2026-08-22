# Assets to supply

Every image slot on the site, in the order that buying/collecting them
improves the page most. Nothing here is required for the site to work — every
slot already has a designed fallback rather than a broken box — so treat this
as a shopping list, not a punch list.

Two rules that apply to everything below:

- **Supply the largest version you have.** Next.js resizes down and serves
  AVIF/WebP automatically. It will never resize *up*, so a small source is
  small forever.
- **Subjects go in the middle.** Most slots crop with `object-cover` at
  several different aspect ratios from one file. Anything important near an
  edge will be cut off in at least one of them.

---

## 1 — Portfolio logos (highest impact)

**16 files, in `public/logos/`. Some already exist and want replacing.**

This is the biggest single win, because the homepage now leads with
`components/portfolio/PartnerMarquee.tsx` — a run of white plates where the
logo *is* the card. Every weakness in a logo file is now shown at four times
the size the old thin strip showed it.

**Spec:** SVG if the company has one. Otherwise transparent PNG, **≥ 800px on
the long edge**, **trimmed hard to the ink** with no built-in padding, and the
**horizontal lockup** rather than the stacked one where both exist.

The trim matters more than the pixel count. The logo is drawn into a box about
200 × 56 px and fitted with `object-contain`, so a logo delivered on a big
padded canvas fits its *canvas* to that box and the mark inside it lands much
smaller than its neighbours. Four of the current files are scraped social-share
cards, which is why they look undersized in the row.

| Replace | Have now | Problem |
| --- | --- | --- |
| Eyenuk | 137 × 24 PNG | far too small, visibly soft |
| Biospectal | 150 × 56 PNG | too small |
| CorFlow | 150 × 150 WebP | too small, square lockup |
| RIVANNA Medical | 196 × 30 PNG | too small |
| IllumiCell AI | 200 × 200 JPEG | too small, square, no transparency |
| Marrow Access | 400 × 257 JPEG | no transparency |
| Zafrens | 533 × 468 JPEG | no transparency, stacked lockup |
| Axena Health | 466 × 108 PNG | borderline at 2× displays |
| Alydia Health | 1200 × 627 JPEG | social card: mark sits small in a padded canvas |
| Axon Therapies | 1364 × 714 JPEG | same |
| Caretaker Medical | 2088 × 1096 JPEG | same |
| Cerapedics | 1496 × 785 JPEG | same |

**Already fine, leave alone:** Aria CV, Nectero Medical, Venova Medical,
Raydiant Oximetry.

---

## 2 — Team portraits

**~~1 needed now~~ SUPPLIED for the founder. One per further profile arriving
with the roster.**

Jing Lin's portrait is in place at `public/team/jing-lin.png` (800 x 800). It
holds up at the size /team renders it, but it is the smallest asset on the site
that carries a face — if a larger original exists, it is worth swapping in.

- **Ratio:** 4 : 5 portrait
- **Size:** 1200 × 1500 px or larger
- **Where:** the /team grid and its expanded panel
- **Field:** `portrait` in `data/team.ts`

Until one lands, the plate carries the person's initials in the display serif
over sage and says what belongs there, so an empty slot reads as designed
rather than missing.

The new homepage team section does **not** use portraits — its columns are
built on numerals — so a portrait is only ever needed once per person, for
/team.

---

## 3 — Portfolio company imagery

**Up to 16, one per company. Entirely optional, per company.**

- **Ratio:** supply one wide master at **16 : 9 or 3 : 2**, **≥ 2400px wide**
- **Where one file is cropped to:** 21 : 9 on the company page hero, 5 : 4 in
  the homepage story, and 16 : 11 / 4 : 3 / 3 : 2 on the index cards
- **Field:** `featuredImage` in `data/portfolio.ts`

Product shots, device photography, the team at work, clinical setting — not
another copy of the logo, which the page already shows separately.

Currently every company falls back to an abstract field generated from its own
slug, so the set looks deliberate rather than empty, and the company page
prints a line saying real imagery renders there when supplied. Adding these one
at a time is fine; the two treatments coexist without looking broken.

---

## 4 — Replacements for the two open-licence placeholders

Both currently ship with clean CC0 / public-domain files (see `CREDITS.md`).
They only want replacing when KOFA has its own.

| Slot | Spec | Where |
| --- | --- | --- |
| `operating-theatre.jpg` | 16 : 10, ≥ 1600 × 1000 px | the plate closing the homepage Purpose section |
| `lab-loop.webm` | 10–20s, silent, 1920 × 1080, MP4 (H.264) **and** WebM | the homepage film band, cropped to a 21 : 9 letterbox |

The footage is the only moving picture on the site. It is silent, loops, and
has no controls, so it wants to be something that reads at a glance and has no
obvious cut point — a slow push through a lab, hands working, an instrument
running. Keep it under about 6 MB per file.

If either is replaced with KOFA's own material, delete the printed credit line
beside it: `components/home/FundIntro.tsx` for the still,
`components/home/FilmBand.tsx` for the footage.

---

## 5 — News hero images

**Up to 60, one per news item. Lowest priority, genuinely optional.**

- **Ratio:** 16 : 10, **≥ 1600 × 1000 px**
- **Field:** `heroImage` in `data/news.ts`

Sixty images is a large ask for a section where the generative fallback
already works, and a half-filled news index looks worse than an empty one. Do
these as a set or not at all — and if as a set, the recent items are the ones
worth it.

---

## Not needed — already handled in code

Listed so nobody spends time on them:

- **Favicon** — generated at build from the brand glyph, `app/icon.tsx`
- **Social share card** — generated at build, `app/opengraph-image.tsx`, and
  it restyles itself automatically when `data/site.ts` changes
- **KOFA logo** — drawn as an inline SVG path in `components/ui/LogoMark.tsx`,
  now filled with the official brand red (#D61319, sampled from the supplied
  artwork). The artwork itself is kept at `public/brand/kofa-mark.png` as the
  reference original; nothing renders it, because the path is sharper at every
  size and has no baked-in white background. (`public/kofa-logo.png` is an
  older leftover and is referenced by nothing.)
- **Hero artwork** — the homepage hero is a live canvas field plus a drawn
  cellular form, not a photograph
- **Section backgrounds, dividers, icons** — all drawn

---

## Would need a small code change first

Not upload-only, so worth deciding before collecting anything:

- **Interior page heroes** (/fund, /team, /portfolio, /news, /contact) are
  type-only today. `components/ui/PageHero.tsx` has no image slot; adding one
  would want five images at roughly 21 : 9, ≥ 2400px wide.
- **A photographic or video hero** on the homepage, replacing or sitting
  behind the generative field.

Ask before shooting for either — both change the character of the site more
than any single file above.
