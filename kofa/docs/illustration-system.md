# Illustration system

All of KOFA's illustration is drawn by `components/visuals/plates.tsx`. There
are no image files behind it, no licences to track, nothing to re-clear if the
site moves, and nothing to download at runtime: every plate is SVG resolved at
build time and shipped as markup in the page.

## Why it exists

The client's note of September 15 2026, in full:

> They don't like the current pictures... Maybe let's keep it simple? Please
> give it a shot and we will offer more specific feedback. (BTW, I asked
> ChatGPT about this and here's what it says: For KOFA, the website should
> feel clinically credible, founder-friendly and quietly institutional, not
> like a hospital, pharmaceutical company or traditional wealth-management
> firm.) Some ideas: maybe technical drawings or subtle patent illustrations;
> abstract forms suggesting movement, flow and precision; natural images
> suggesting longevity and quality of life.

The site before this had clinical stock photography: two clinicians at a
laptop, a bench researcher, two older women on a park path, a 3D heart, a
fetal ultrasound, a blood-cell video loop. That is the hospital-brochure
register the note rules out, and it was about 11 MB of the repository.

## What replaced it

Engineering-drawing conventions: hairline strokes, dash-dot centrelines,
dimension ticks with arrow barbs, numbered leader lines, and a great deal of
empty space. Restraint is the point; a plate should be the second thing you
notice on a page, never the first.

| Export | Where it goes | What it draws |
| --- | --- | --- |
| `FlowPlate` | Homepage hero | Streamlines of flow past a body, with the two stagnation points marked and a diameter dimension |
| `LatticePlate` | Homepage, beside "Backing the Devices That Change Care" | A cylindrical strut lattice in axonometric projection, near wall over far wall |
| `LongevityPlate` | Homepage Focus Areas | Growth rings with a radial sight line and season ticks |
| `FocusGlyph` | Focus-area cards, homepage and `/focus-areas` | One mark per area: vessel and pressure trace, measured aperture, path leaving a boundary |
| `FieldPlate` | Interior page headers, closing CTA | A sparse contour field, background furniture only |

## Two of them are real

`FlowPlate` does not draw a squiggle that looks like flow. It solves the
stream function for ideal flow past a cylinder,

```
ψ = y · (1 − a²/(x² + y²))
```

for a set of ψ values, by Newton iteration at each station, seeded from the
previous one. The lines crowd where the flow accelerates over the body
because that is what the equation says they do.

`LatticePlate` projects a real cylindrical strut lattice. Each strut is
subdivided and projected through an ellipse, so it curves around the wall
instead of cutting across it, and the struts are painted far wall first with
the near wall heavier on top. It is the geometry an expandable scaffold
actually has.

This costs a few lines of arithmetic and buys the one thing a decorative mark
cannot: the drawing survives being looked at by a clinician or a device
engineer, which is most of the audience.

## Conventions if you add one

- **Colour comes from the parent.** Every stroke is `currentColor`; the
  caller sets a `text-*` class. There is no light and dark variant to keep in
  sync.
- **Server components.** No `"use client"`, no hooks, no animation. The
  geometry resolves once at build time.
- **`aria-hidden` and `focusable="false"`.** These carry no information the
  adjacent copy does not already carry, so they are not described and they are
  not tab stops.
- **No claims.** A plate must not depict a named product, a portfolio
  company's device, or a clinical outcome. `FocusGlyph` selects on the
  `glyph` field of `focusAreas` in `data/site.ts`, whose copy is verbatim
  from the supplied content document; the mark adds nothing to it.
- **Size the detail to the display size.** The glyphs are drawn on a 64-unit
  box at stroke weights three to four times the plates', because a 0.7 stroke
  on a 120-unit box lands at half a device pixel at 90px and disappears. If a
  plate will be shown small, draw it small.
