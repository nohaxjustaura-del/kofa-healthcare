# KOFA Healthcare website

A redesign of kofahealthcare.com built as a Next.js prototype, structured so its
content maps one-to-one onto WordPress custom post types.

```bash
npm install
npm run dev     # http://localhost:3200
npm run build   # 89 static pages
npm start       # production server: test here, not just in dev
```

> **Test in production, and test on touch.** Several of the worst defects in
> §9 were invisible in `next dev`, and two more were invisible on a desktop
> viewport. They only appeared under real touch emulation, where hover does
> not exist. Verify both before shipping.

---

## 1. Content provenance

**Nothing on this site is invented.** That constraint shaped the architecture, so
it is worth being precise about where every piece of content came from.

### Verbatim from kofahealthcare.com

- All 16 portfolio company names, long descriptions and website URLs
- The fund description and the "we invest in…" sector sentence
- `info@kofahealthcare.com`
- Alydia Health's acquisition by Organon

### Verified from primary sources

`data/news.ts` holds **60 news items**. Each was found by search, then
independently re-fetched and checked against its source URL before inclusion:
headline, date and publisher all confirmed. Items that could not be verified were
dropped rather than softened. Coverage is all 16 companies plus 4 items about
KOFA itself (its participation in the Axon, CorFlow, Venova and IllumiCell
rounds).

The site links out to each publisher rather than republishing article text, so
`body` is empty on all 60. It exists for posts KOFA writes itself, which then
render as full internal articles at `/news/[slug]`.

### Written for this build (editorial, not factual)

- `shortDescription` on each company: a one-line compression of KOFA's own
  longer copy, for cards and meta descriptions
- Category assignment per company, derived from the published descriptions
- Section headings and connective copy, drawn from the brief

### Explicitly marked as needing KOFA input

Each of these is either a visibly labelled slot or withheld from the page
entirely. Nothing here renders as filler that could be mistaken for real
content, and nothing renders as a note from the build to the client:

| What | Where | Note |
|---|---|---|
| Team roster | `/team` | Only Jing Lin (Founder & Managing Director) is public record. Her biography is a marked placeholder; two empty slots follow it. Set `OPEN_TEAM_SLOTS = 0` in `data/team.ts` once the real roster lands. |
| Team portraits | `/team` | Initials plate with "Portrait to be supplied". Swaps for a photo the moment `portrait` is set. |
| Geography, check size, ownership target | `/fund` | KOFA does not publish these, so the rows do not render at all. They live in `CRITERIA` (`app/fund/page.tsx`) with `confirmed: false` and are filtered out; supply a value and flip the flag and each row returns with no code change. Three rows reading "To be confirmed" beside a dashed "CMS field" badge made the fund look undecided about what it invests in. |
| Privacy policy | `/privacy` | Deliberately unwritten: it is a legal document. The page and its typography are ready for KOFA's existing text. |
| Company photography | portfolio | No stock imagery is used anywhere. See §3. |
| LinkedIn | footer | Omitted; no profile is published on the current site. |
| Contact reason categories | `/contact` | Still awaiting KOFA sign-off, but the form no longer says so: the "categories pending approval" line under the radio pills was a note to the client shipping to real visitors. Edit the list in `components/ui/ContactForm.tsx`. |

---

## 2. Routes

| Route | Notes |
|---|---|
| `/` | Hero, purpose, logo strip, portfolio preview, investment process, featured story, portfolio news, KOFA news, CTA |
| `/fund` | Who we are · where we invest · perspective · areas of interest (expandable) |
| `/team` | Editorial profiles opening into a side panel |
| `/portfolio` | Filterable grid, URL-synced (`?category=`) |
| `/portfolio/[slug]` | 16 pages. Company detail + auto-populated "Latest from…" + prev/next |
| `/news` | Filter by type (KOFA / Portfolio) and by company |
| `/news/[slug]` | 60 pages. 800px reading measure |
| `/contact` | Validated form → `/api/contact` |
| `/privacy`, `/sitemap.xml`, `/robots.txt`, 404 | |

**Contact form delivery:** `app/api/contact/route.ts` validates and forwards to
`KOFA_CONTACT_WEBHOOK` (any URL accepting a JSON POST, e.g. a WPForms/Gravity Forms
endpoint, an email provider, a CRM). With nothing configured it returns 501 and
the client falls back to opening a pre-filled mail composer. It never reports
success for a message that went nowhere.

---

## 3. Imagery

KOFA supplied logos, not photography, and the brief rules out stock doctors and
fake laboratory scenes. So every company and news visual is generated
deterministically from the company slug, using the same living-network motif as the
hero, seeded so each company reads as its own specimen while the set stays
visibly one system. Category tilts the geometry (`components/portfolio/CompanyVisual.tsx`).

Set `featuredImage` on a company and the real photograph takes over; nothing else
changes.

The 16 logos in `public/logos/` are KOFA's own files. They arrive as mixed
JPEG/PNG/WebP on white backgrounds, so `.logo-mono` multiplies the white away
against ivory and unifies them; hover restores each brand's colour.

**The KOFA mark** (`components/ui/LogoMark.tsx`) was traced from the artwork on
the live site to 99.7% of the original in 389 path characters, so it stays crisp
at any size and inherits `currentColor`. It is presented monochrome because the
source artwork is red, which sits outside the ivory/ink/teal system. That is a
standard single-colour application and it is reversible. Pass
`className="text-[#D61318]"` to restore the red.

---

## 4. CMS mapping

Every content file declares its intended WordPress field in a comment.

**`portfolio_company`**: Company Name, Slug, Logo, Featured Image, Description,
Short Description, Website, Healthcare Category (taxonomy), Status, Location,
Investment Year, Featured (bool), Sort Order.

**`team_member`**: Name, Role, Portrait, Biography, LinkedIn, Sort Order.

**`news`**: Title, Slug, Type (taxonomy: *KOFA News* / *Portfolio News*), Date,
Hero Image, Excerpt, Body, External Source, External URL, **Associated Portfolio
Company** (relationship).

That last relationship is what powers "Latest from [Company]" on every company
page. It is derived, never hand-wired. Fields left undefined (status, location,
investment year) simply do not render, so partial data never produces an empty
row.

---

## 5. Design system

`app/globals.css` holds the whole thing.

**Type**: Fraunces for display and editorial statements only; Geist for
navigation, body, buttons, labels and metadata. Both self-hosted: **zero external
font requests.** Three body tiers (`.type-body` 16px / `-sm` 15px / `-xs` 14px),
each carrying its own leading and tracking. Pick a tier; never override the size.

**Optical sizing.** Display tracking and leading are clamped alongside font-size
rather than fixed per class. A serif at 100px wants materially tighter letterfit
than the same face at 46px, and one em value cannot serve both ends of that
range. Each clamp is solved so the ratio lands on target at both extremes:
`.type-display` measures **-0.008em / 1.08** at 46px and **-0.019em / 1.00** at
100px, verified in the browser rather than judged by eye. Those figures belong
to the face: the set they replaced was solved for Instrument Serif and ran
roughly 35% more negative, which on Fraunces collided descenders with the caps
of the next line. See "RETUNED FOR FRAUNCES" in `app/globals.css` before
changing them.

**Colour**: ivory `#F7F8F4`, alt sage `#F1F5F2`, ink `#121A18`, teal `#176D67`.
Roughly 80% of the interface is neutral; teal marks interaction and hierarchy.

One deliberate deviation from the brief: the metadata grey was specified lighter,
but at 11px it measured **2.96:1** against ivory: a clear AA failure. It is now
`#636D69`, tuned against the *darkest* ground it ever sits on (5.0:1 on ivory,
4.6:1 on sage-deep). Hierarchy comes from size, case and tracking instead of a
washed-out colour.

**Motion**: one easing curve (`cubic-bezier(0.22, 1, 0.36, 1)`); 150-250ms
micro, 500-800ms entrances, 26-78s ambient.

Five behaviours carry most of the character:

| Where | What | Why |
|---|---|---|
| Header | Retracts on scroll down past the hero, returns on scroll up | Hands back the full viewport on a 14,000px page. A 6px dead zone stops trackpad jitter from flickering it. Reduced motion keeps the behaviour and drops the travel. |
| Hero rail | The three facts arrive 90ms apart | The rail then reads left to right, the way it is meant to |
| Hero scroll cue | Fades out over the first fifth of the hero | It answers one question; once answered it stops asking |
| Conviction figures | Rise from behind their own rule | Reuses the headline masked reveal rather than inventing a counter, which the brief rules out |
| Section rules | `AnimatedDivider` draws left to right on entry | Used on three major rules only, so it stays an accent |

**Punctuation.** There are no em dashes anywhere in this project, in copy,
comments or documentation. Page titles separate with a middle dot
(`Portfolio · KOFA Healthcare`). Where a dash carried real grammar the sentence
was rewritten rather than character-swapped: a colon for an elaboration, a
comma for an appositive, parentheses for an aside, a full stop where two
sentences were hiding in one. One instance sits inside copy quoted verbatim
from kofahealthcare.com (Axena Health); there the dashes became parentheses so
the sense is untouched. En dashes are gone too: numeric ranges use a plain
hyphen (500-800ms).

**The hero eyebrow** reads "Evergreen healthcare venture fund", not "KOFA
Healthcare". The logo lockup directly above it already says the name, and the
most valuable line on the page should not spend itself repeating the second
most valuable one.

---

## 6. What the references contributed

Neither reference is cloned; each contributed one idea, rebuilt as KOFA's own.

**fahrenheit.ch** drives a `data-lag` attribute, per-element scroll lag, which
is what gives that site its weight. Rebuilt here as `components/motion/Lag.tsx`:
travel is a fraction of the element's own scroll distance rather than a fixed
pixel offset, and a spring keeps it moving for a beat after the wheel stops.
That trailing settle is the whole effect. Used twice, on the two largest
editorial visuals. (It also pairs PP Editorial New with Euclid Flex, the same
serif + geometric-sans logic as Fraunces + Geist.)

**biofarma.com.ar** commits to a deep teal `#01373D` as a full background, and
sets large display figures in a light weight. Rebuilt as
`components/home/Conviction.tsx`: the page's single inverted moment, in KOFA's
own hue. It carries **KOFA's real tagline**, "Empower Innovations to Advance
Global Health" is the h1 of the current site, and the redesign had demoted it to
a `<title>` tag. Four checkable figures sit beside it at weight 300. The dark
block is **9.4% of the page**, inside the brief's 80%-neutral constraint, and
deleting one line in `app/page.tsx` removes it.

---

## 7. Accessibility

Measured, not assumed, every text/background pair on every page was computed:

- **0 contrast failures** site-wide
- **0 non-exempt targets under 24px** (WCAG 2.2 SC 2.5.8). The one remaining
  small link is inline within a sentence, which the SC explicitly exempts
- Single `h1` per page, ordered headings, semantic landmarks, skip link first in
  tab order, no positive `tabindex`
- Mobile menu and team panel: Escape to close, focus trap, scroll lock, focus
  returned to the trigger, and both verified to actually unmount (see §9.2)
- Both filter bars implement the WAI-ARIA Tabs pattern: ←/→/↑/↓ with wrap,
  Home/End, roving tabindex, and a real `role="tabpanel"`. Declaring
  `role="tablist"` without arrow-key support tells a screen-reader user there
  are six tabs and then gives them one reachable stop
- Full `prefers-reduced-motion` support. The dev browser used for verification
  reports `reduce`, so the static fallback is the path that got the most testing,
  the site is designed to be beautiful with every animation off
- The marquee's duplicate track renders as inert `div`s, so `aria-hidden` contains
  no focusable content

**`<noscript>` fallback:** entrance animations render their `initial` state into
the server HTML, so 47 elements ship as `opacity: 0`. If JS fails, a `noscript`
rule in `app/layout.tsx` un-hides everything carrying `data-reveal`. The full text
is in the HTML either way.

---

## 8. Performance

- 89 pages prerendered; ~150-178 kB First Load JS
- The hero canvas runs 26-34 nodes, pauses via `IntersectionObserver` and on
  hidden tabs, caps DPR at 2, pre-renders its halo sprite rather than building
  gradients per frame, and eases down to a low baseline after ~2.6s without
  pointer movement. Measured coverage: 16.6% of pixels at mean alpha 8/255
- Canvas 2D throughout rather than WebGL: at this node count the visual result is
  identical for a fraction of the cost

---

## 9. Defects found by running it

Four of these were invisible to type-checking, to a clean build, and to reading
the code. They only appeared by driving the actual page.

**1, The site was blank for reduced-motion visitors.** *(critical)*
Entrance animations render their hidden `initial` state into the server HTML and
rely on the animation library to reveal them. Under `prefers-reduced-motion` the
library declines to animate at all, so nothing was ever revealed: **47 of 56
elements stayed at `opacity: 0`**, including the entire hero. Fixed by making
reduced motion a CSS guarantee, `[data-reveal]` / `[data-lag]` are pinned to
`opacity: 1; transform: none` inside the media query, which no inline style can
override. Content never depends on an animation running in order to exist.

**2, Dismissed overlays never unmounted, freezing the page.** *(critical)*
Same root cause, opposite direction: `AnimatePresence` waits for an exit
animation to finish before unmounting, and under reduced motion that animation
never ran. Closing the team panel left the dialog in the DOM with
`aria-modal="true"` **and a full-viewport overlay still intercepting every
click**, the page looked normal and was completely inert. Fixed by dropping
`exit` under reduced motion, which makes the unmount immediate; those subtrees
never server-render, so branching there is safe.

**3, Every reduced-motion visitor hit a hydration mismatch.** *(high)*
`useReducedMotion()` returns false on the server and true on such a client, so
`if (reduced) return <div>` produced two different trees and React discarded the
server HTML on every page load. Fixed across 15 call sites by never branching
`initial`, it is the only motion prop that reaches the DOM. `animate`,
`exit` and `transition` may branch freely. The rule is documented at the top of
`components/motion/Reveal.tsx`; `components/motion/useMounted.ts` covers the
cases that genuinely need a browser-only value.

**4, `/portfolio` and `/news` shipped no content.** *(high)*
`useSearchParams()` on a statically prerendered route forces its whole Suspense
boundary to be client-rendered. The portfolio HTML contained **zero companies**
- 53 KB of shell, and the grid existed only after JavaScript ran. The brief
requires crawlable content. Fixed by reading the query string in an effect
instead: the full grid and all 60 articles now server-render (portfolio HTML is
326 KB), and `?category=` / `?type=` deep links apply one tick after mount.

**5, Six paragraphs were unreachable on every phone.** *(high)*
The homepage investment-area descriptions were collapsed to `max-height: 0` /
`opacity: 0` until hovered. A touch device has no hover, so on mobile that copy
did not exist, measured at `renderedHeight: 0` under real touch emulation.
Fixed with an `@media (hover: none)` rule that pins `[data-hover-reveal]` open.
`(hover: none)` is the right test rather than a width query: a narrow laptop
window still hovers and a large tablet still does not. The team card's "View
profile" cue is covered by the same rule, since on touch there was otherwise no
hint the card opened anything.

**6, Every full-width card overflowed its gutter below ~400px.** *(medium)*
A `grid-cols-12` with `gap-x-8` needs eleven 32px gaps, **352px of gap before
any content**, against a 327px content box at 375px. The columns collapsed to
zero via `minmax(0,1fr)` and every `col-span-12` item rendered 352px wide, sitting
flush to the screen edge with the right gutter gone. Fixed on eight grids by
dropping the horizontal gap below `sm`, where every item is full-width anyway
and the gap does nothing. Cards now measure 327px with symmetric 24px gutters.

Also fixed: `Section` silently swallowed `aria-labelledby`; nested `.map()`
calls raised React key warnings; the contextual portfolio cursor's rAF loop
never idled and fought a CSS transform transition (that component has since
been deleted, along with the drawn global cursor that generalised it);
`LineReveal` produced `"capitalfor"` in
`textContent`; and three tap targets sat just under the 24px minimum (the
mobile-menu email link, and the "All portfolio" / "All news" back links).

### Mobile verification

Measured under real touch emulation (Pixel 8 UA, `hover: none`,
`pointer: coarse`) at **320 / 375 / 430 / 768px**, on every page:

| Check | Result |
|---|---|
| Horizontal scroll | none at any width |
| Content past the body edge | none |
| Contrast failures | 0 |
| Tap targets under 24px | 0 |
| Elements stuck hidden | 0 |
| Cards | one column, 327px, symmetric 24px gutters at 375px; two-up at 768px |
| Mobile menu | 44×44 trigger, full-screen, numbered 01-05 at 78px each, scroll-locked, Escape unmounts and returns focus |
| Team panel | full-width, scrollable, unmounts cleanly |
| Contact form | single column, **17px inputs so iOS does not zoom on focus**, 41px radio targets, 48px submit |
| Filters | horizontally scrollable, work on tap |

---

## 10. Known gaps

1. **Three review lenses did not complete.** An automated adversarial review ran
   six lenses; the accessibility, responsive and correctness agents failed partway
   on an account spend limit. Those three areas were verified by hand instead
   (contrast computed per element, breakpoints measured at 375/768/1046,
   hydration determinism and listener cleanup checked), but they did not get the
   independent second pass the design and performance lenses received.
2. **Viewports above ~1046px were not tested live.** The preview pane cannot
   exceed the host window. Layout above that width is governed by a
   `max-w-[100rem]` container and capped `clamp()` values, so behaviour is
   predictable, but 1440px and 1728px should be eyeballed on real hardware.
3. **Animated path under-tested.** The verification browser forces reduced
   motion. That turned out to be a gift, it is how §9.1 and §9.2 were caught,
   but it means the full-motion path (entrance timing, the hero parallax, the
   `Lag` spring) has been reasoned about and measured, not watched. Worth one
   pass on a machine with motion enabled.
4. **Portfolio categories are an editorial judgement.** KOFA names four sectors;
   the five used here were derived from the published portfolio and should be
   confirmed.
