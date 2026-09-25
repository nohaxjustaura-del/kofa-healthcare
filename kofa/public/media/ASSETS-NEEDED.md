# Assets to supply

Every image slot on the site, in the order that collecting them improves the
page most. Nothing here is required for the site to work: every slot already
has a designed fallback rather than a broken box, so treat this as a shopping
list, not a punch list.

Two rules that apply to everything below:

- **Supply the largest version you have.** Next.js resizes down and serves
  AVIF/WebP automatically. It will never resize *up*, so a small source is
  small forever.
- **Subjects go in the middle.** Most slots crop with `object-cover` at
  several different aspect ratios from one file. Anything important near an
  edge will be cut off in at least one of them.

---

## 1. Portfolio logos (highest impact)

**16 files, in `public/logos/`. All exist; several want replacing.**

This is the biggest single win. The homepage portfolio grid and the
`/portfolio` cards are white tiles where the logo *is* the card, so every
weakness in a logo file is shown at full size with nothing beside it.

**Spec:** SVG if the company has one. Otherwise transparent PNG, **≥ 800px on
the long edge**, **trimmed hard to the ink** with no built-in padding, and the
**horizontal lockup** rather than the stacked one where both exist.

The trim matters more than the pixel count. The logo is drawn into a box of
about 190 × 64 px and fitted with `object-contain`, so a logo delivered on a
big padded canvas fits its *canvas* to that box and the mark inside it lands
much smaller than its neighbours. Several of the current files are scraped
social-share cards, which is why they look undersized in the grid.

| Replace | Have now | Problem |
| --- | --- | --- |
| Nectero | `nectero-medical.png` | **Wrong name.** The company is now Nectero Therapeutics; the file is the old Nectero Medical wordmark. Needs the current logo. (Keep the filename and the `nectero-medical` slug: they are the live URL and the key six news items join on.) |
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

**Already fine, leave alone:** Aria CV, Venova Medical, Raydiant Oximetry.

---

## 2. Team portraits and biographies

**2 portraits and 2 biographies needed.**

`/team` renders Renee Masi, Jing Lin and Dr. Meng Deng, in that order. Jing's
portrait and biography are in place. The other two carry a marked placeholder
that says what belongs there, so the slots read as designed rather than
missing, but they are the most visible gap on the site.

| Person | Portrait | Biography |
| --- | --- | --- |
| Renee Masi, Senior Managing Director | needed | needed |
| Jing Lin, Managing Director | supplied, `public/team/jing-lin.png`, 800 × 800 | supplied |
| Dr. Meng Deng, Managing Director | needed | needed |

- **Ratio:** 4 : 5 portrait
- **Size:** 1200 × 1500 px or larger
- **Where:** the `/team` grid and its expanded panel, about 460 × 570
- **Fields:** `portrait` and `biography` in `data/team.ts`. Delete that
  entry's `bioStatus: "placeholder"` when the real copy lands.

Jing's 800 × 800 file holds up at the size `/team` renders it; if a larger
original exists it is worth swapping in, but it is not urgent.

Nothing is written for Renee or Meng until KOFA supplies it. Credentials are
not something to approximate.

---

## 3. Portfolio company imagery

**Up to 16, one per company. Entirely optional, per company.**

- **Ratio:** one wide master at **16 : 9 or 3 : 2**, **≥ 2400px wide**
- **Where one file is cropped to:** the company page hero and the index cards
- **Field:** `featuredImage` in `data/portfolio.ts`

Product shots, device photography, the team at work, a clinical setting. Not
another copy of the logo, which the page already shows separately.

Most companies already carry a real device or platform visual taken from their
own official site (see `CREDITS.md`); the rest fall back to an abstract field
generated from the company slug, so the set looks deliberate rather than
empty. Adding these one at a time is fine, the two treatments coexist.

---

## 4. News hero images

**Up to 60, one per news item. Lowest priority, genuinely optional.**

- **Ratio:** 16 : 10, **≥ 1600 × 1000 px**
- **Field:** `heroImage` in `data/news.ts`

Sixty images is a large ask for a section where the fallback already works,
and a half-filled news index looks worse than an empty one. Do these as a set
or not at all, and if as a set, the recent items are the ones worth it.

---

## Not needed, already handled in code

Listed so nobody spends time on them:

- **Illustration, section backgrounds, icons and dividers.** All drawn by
  `components/visuals/plates.tsx`. There are no image files behind any of it
  and no licences to track. See `docs/illustration-system.md`.
- **Favicon**, generated at build from the brand glyph, `app/icon.tsx`.
- **Social share card**, generated at build, `app/opengraph-image.tsx`; it
  restyles itself when `data/site.ts` changes.
- **The KOFA logo.** No longer an approximation. The header and footer
  render `public/brand/kofa-lockup.png`, which is
  `kofa-stacked-supplied.png` cropped to its own ink and otherwise
  untouched, so the letterforms, the arrangement and the gap between mark
  and name are the supplied artwork's rather than ours. Nothing is typeset.
  `kofa-symbol-trimmed.png` is the hexagon alone, cut from the same master.

  A vector of the lockup would still be a small win — sharper at very large
  sizes, smaller on the wire — but it is no longer needed for accuracy.
  `public/kofa-logo.png`, `public/brand/kofa-mark.png` and
  `public/brand/kofa-symbol-supplied.png` are leftovers that nothing
  renders now.

---

## Would need a small code change first

Not upload-only, so worth deciding before collecting anything:

- **Photographic interior page headers.** `components/ui/PageHero.tsx` is
  type and linework only, by design. Adding an image slot would want one
  image per page at roughly 21 : 9, ≥ 2400px wide.
- **A homepage video**, if specifically requested in a future brief. The current photographic hero and supporting photographs are restored and require no supplied replacement assets.

Interior photographic headers and a homepage video remain optional. The
September 19 request already authorizes the restored homepage photographs.
