# KOFA Healthcare visual direction

## Authority

The user rejected the previous ivory, serif-led design and explicitly requested a much closer OrbiMed reference. This is a replacement visual direction with the approved information architecture and content preserved. OrbiMed's current desktop pages were inspected directly on September 15, 2026. The homepage reference has a white approximately 110px header, a full-width photographic hero, a light sans-serif headline around 54px, white introductory copy, a teal rule, an asymmetric curved transition, generous white sections, and simple teal outlined actions.

## Translation for KOFA

Use the same composed institutional vocabulary with KOFA's prominent red logo. The client's September 22 and 24 reviews set the imagery: nothing generated, and no people. The hero is one silent looping film of medtech's evolution made entirely of real clinical imaging and real devices: Röntgen's 1895 radiograph, cardiac catheterization, obstetric ultrasound, a 1960 Starr-Edwards heart valve, balloon angioplasty and live 3D ultrasound. Elsewhere, real stills: a tissue heart valve beside the portfolio introduction, and catheter tips, a fetal ultrasound and a 3D-printed vessel model on the three Focus Area cards. The homepage must still have only the four requested sections; OrbiMed's metrics, portfolio stories, and homepage news are not part of KOFA's brief.

## Tokens

- Primary surface: white `#ffffff`.
- Supporting surface: pale ice `#edf6f7`.
- Main ink: navy `#12394b`; body ink: slate `#4d626c`.
- Accent: teal `#008979`, with a darker accessible foreground variant for small text.
- Hero surface: deep navy `#073449` with white foreground.
- Brand red: supplied logo artwork, unchanged.
- Typography: OrbiMed's face is Graphik (Commercial Type), a paid licence. General Sans (ITF Free Font Licence) stands in, self-hosted, at OrbiMed's weights and -0.02em display tracking; "Graphik" leads the font stack so a licensed copy takes over with one `@font-face`. Display 36 to 64px at weight 300, line height 1.2. Section titles 30 to 52px. Body 16 to 22px, line height 1.5, as OrbiMed sets it. No decorative serif, exaggerated tracking, or tiny navigation.
- Layout: centered content about 1200px wide, 24px mobile gutters, 40 to 64px desktop gutters; section spacing roughly 72 to 104px.
- Rules: subtle cool gray. Cards use one quiet border or a very soft shadow, not both. Buttons have modest radii and visible focus.

## Composition

A solid white header carries the supplied stacked KOFA lockup (the artwork itself, not a typeset imitation) with straightforward navigation. The first viewport is a near-black hero, the black of a clinical display, with calm left-aligned white copy. From xl the film is the hero's full-bleed background, its picture set right and dissolving into the black, like OrbiMed's photographic hero; a small caption gives the year and milestone. Footage keeps natural tones (silver for X-ray and ultrasound, true colour otherwise) with slow dissolves, a slow camera drift and film grain; nothing is drawn over it. Below xl the film is a square above the copy. A shallow white curved edge connects it to the portfolio section.

The homepage portfolio is the revolving strip the client asked to keep: every company as a white plate with its name and one-line focus, drifting sideways, pausing on hover or focus, and wrapping into a static grid with motion off. Company names carry no checkmarks. `/portfolio` keeps the Active and Exits filters. A circular photograph of a tissue heart valve on black, in the hero film's natural grade, supports the introduction: a device, legible at a glance. Focus areas use the three supplied names and descriptions; each card leads with its still, edge to edge, with the outline icon in a badge straddling the image's lower edge. The three Focus Area stills share one navy duotone so different imaging modalities read as a series. Contact closes the homepage with the supplied invitation in a confident, uncluttered band. Interior pages share the same sans-serif scale and clear content layouts.

## Interaction and accessibility

Keep headings and content visible in server HTML. Remove masking, arrival curtains, scroll-dependent reveals, and ornamental progress rails from the active experience. Respect reduced motion. Tabs support keyboard navigation, selected state, and panel associations. Portfolio filters on the homepage operate in place. Navigation must fit at desktop widths and offer a usable mobile menu.

## Assets and verification

The supplied logo is the brand authority. The homepage stills are in `public/media/home/`, with sources, licences and edits in `public/media/CREDITS.md` and the required public attributions at `/credits` (`data/credits.ts`). Public third-party components must have source attribution and applicable licenses retained. Verify the whole reference-driven result at desktop and phone widths in one batch, fix material findings together, and run one final confirmation. Production build and content/filter acceptance checks remain required.
