# Media credits

Two kinds of media live under `public/`:

1. **Homepage art direction** (`public/media/home/`), the curated science
   visuals for the hero and the editorial "visual break" sections.
2. **Portfolio company media** (`public/portfolio/`), one real device,
   platform, assay or clinical visual per company, sourced from each company's
   own official website (or the current official product owner's site). These
   are used on the strength of KOFA's portfolio relationship with the company;
   swap any file for a KOFA- or company-approved asset with no code change.

Nothing here carries a watermark or a stock-subscription licence.

## Homepage art direction, drawn rather than photographed

The site's illustration is now a set of drawn technical plates in
`components/visuals/plates.tsx`, not image files. There is nothing in this
section to licence, credit or re-clear, and nothing to download: the plates
are SVG generated at build time from the geometry in that file. See
[docs/illustration-system.md](../../docs/illustration-system.md).

This replaced a library of science photography and video on the client's
instruction of September 15 2026: "They don't like the current pictures.
Maybe let's keep it simple," with the stated direction being technical
drawings and subtle patent illustrations, abstract forms suggesting movement,
flow and precision, and natural images suggesting longevity and quality of
life.

Deleted with that change, all of them unreferenced by then:

| File | What it was |
| --- | --- |
| `home/hero-blood-cells.mp4`, `home/blood-cells.jpg` | Erythrocyte field, the old hero loop and its poster |
| `home/heart-cinematic.jpg` | 3D anatomical heart, the "conviction" break |
| `home/fetal-ultrasound.jpg` | Fetal ultrasound, the women's-health break |
| `home/researchers-lab.jpg` | Researchers at a bench, the fund-intro plate |
| `home/precision-flow.png` | Abstract filament hero artwork |
| `operating-theatre.jpg` | Surgical team under theatre lights (StockSnap, CC0) |
| `lab-loop.webm`, `lab-loop-poster.jpg` | Hematology lab footage (Wikimedia, public domain) |
| `home/clinical-collaboration.png` | Two clinicians at a laptop, the old homepage hero |
| `home/device-research.png` | A bench researcher, the old portfolio-intro circle |
| `home/healthy-longevity.png` | Two women on a park path, the old focus-areas circle |

Together they were about 16 MB of the repository. `public/media/` now holds
nothing but these two documents.

The last three were generated illustrative scenes of fictional people rather
than stock-library photographs, so nothing was ever licensed and there is no
subscription to cancel. They went when the homepage moved to `FlowPlate`,
`LatticePlate` and `LongevityPlate`; their provenance note went with them.

## Portfolio company media, `public/portfolio/`

One asset per company, taken from the company's own official site. Videos are
trimmed, muted, stripped of audio and re-encoded to web weight; each has a
still poster so the grid never loads video and the detail page falls back
cleanly when autoplay is refused.

| Company | File(s) | Official source |
| --- | --- | --- |
| Axon Therapies | `axon-therapies.png` | axontherapies.com, Satera Ablation System illustration |
| Venova Medical | `venova-medical.png` | venovamedical.com, Velocity System render |
| CorFlow Therapeutics | `corflow.mp4` + `corflow.jpg` | corflow.com, CoFI console product loop (trimmed, muted) |
| Zafrens | `zafrens.jpg` | zafrens.com, optimized still from the official Z-Screen cellular-assay animation |
| IllumiCell AI | `illumicell-ai.mp4` + `illumicell-ai.jpg` | illumicell.ai, cellular microscopy loop (muted) |
| Aria CV | `aria-cv.jpg` | Aria CV device photograph (balloon, anchor, catheter and reservoir), credited to Aria CV via implantable-device.com; official technology page: ariacv.com/technology |
| Axena Health | `axena-health.jpg` | levacares.com, Leva wand sensors |
| BioSpectal | `biospectal.png` | biospectal.com, OptiBP phone mockups |
| Eyenuk | `eyenuk.jpg` | eyenuk.com, EyeArt retinal exam in use (AVIF converted to JPG) |
| Raydiant Oximetry | `raydiant-oximetry.png` | raydiantoximetry.com, Lumerah technology visual |
| Marrow Access Technologies | `marrow-access.png` | marrowaccess.com, SmartShot device-in-hand |
| CareTaker Medical | `caretaker-medical.webp` | caretakermedical.net, VitalStream system |
| Nectero Medical | `nectero-medical.mp4` + `nectero-medical.jpg` | necterotherapeutics.com, EAST System animation (trimmed to the occlusion-balloon segment, muted) |
| Alydia Health | `alydia-health.png` | laborie.com, JADA System (current official product owner) |
| Rivanna Medical | `rivanna-medical.png` | rivannamedical.com, Accuro 3S system render |
| Cerapedics | `cerapedics.png` | cerapedics.com, P-15 mechanism-of-action frame |

All 16 companies now have a real company-specific visual. The built-in
generative "living network" remains as a graceful fallback if any local asset
is removed or an additional company is added before approved imagery arrives.

## Replacing any of these

- **A company still**: drop the file in `public/portfolio/` and point the
  company's `media` entry in `data/portfolio.ts` at it.
- **A company video**: add `mp4` + a `poster` still, muted and audio-stripped,
  and set `kind: "video"` on that company's `media` entry.
- **The hero**: replace `hero-blood-cells.mp4` (keep it muted and short) and,
  if the poster should change, `blood-cells.jpg`.
