# Media credits

Two kinds of media live under `public/`:

1. **Homepage art direction** (`public/media/home/`) — the curated science
   visuals for the hero and the editorial "visual break" sections.
2. **Portfolio company media** (`public/portfolio/`) — one real device,
   platform, assay or clinical visual per company, sourced from each company's
   own official website (or the current official product owner's site). These
   are used on the strength of KOFA's portfolio relationship with the company;
   swap any file for a KOFA- or company-approved asset with no code change.

Nothing here carries a watermark or a stock-subscription licence.

## Homepage art direction — `public/media/home/`

| File | What it is | Source | Notes |
| --- | --- | --- | --- |
| `hero-blood-cells.mp4` | The looping hero. A slow, seamless drift across a field of erythrocytes, built here from the still below (12s zoom, mirrored to 24s so the loop never cuts). | Derived from `blood-cells.jpg` | H.264, muted, `playsInline`, ~2.6 MB. Poster + reduced-motion fallback is the still. |
| `blood-cells.jpg` | Red blood cells, scanning-electron-microscope style, false-coloured red. | Client-supplied science image | Hero poster and motion-off fallback. |
| `heart-cinematic.jpg` | High-resolution, medically accurate 3D anatomical heart on a deep-teal, red-lit ground. | Original AI-assisted art direction produced for KOFA | The cardiovascular "conviction" break; composed with negative space for the statement. |
| `fetal-ultrasound.jpg` | Fetal ultrasound, grayscale. | Client-supplied science image | The women's-health "story" break. |
| `researchers-lab.jpg` | Two researchers at the bench in a clean laboratory. | Client-supplied science image | The fund-intro plate. |
| `operating-theatre.jpg` | Surgical team under theatre lights. | [StockSnap.io](https://stocksnap.io/photo/ET9TSSX4H6), CC0 | Legacy fund-intro plate, retained as a spare. |
| `lab-loop.webm` / `lab-loop-poster.jpg` | Hematology lab footage. | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Stock_lab_footage.webm), public domain (U.S. federal work) | Legacy film band, retained as a spare. |

The four science stills are the client's chosen art direction (blood cells,
3D heart, fetal ultrasound, laboratory). The hero loop is generated from the
blood-cell still rather than hotlinked, so first paint never waits on a remote
file and the clip is guaranteed to loop seamlessly.

## Portfolio company media — `public/portfolio/`

One asset per company, taken from the company's own official site. Videos are
trimmed, muted, stripped of audio and re-encoded to web weight; each has a
still poster so the grid never loads video and the detail page falls back
cleanly when autoplay is refused.

| Company | File(s) | Official source |
| --- | --- | --- |
| Axon Therapies | `axon-therapies.png` | axontherapies.com — Satera Ablation System illustration |
| Venova Medical | `venova-medical.png` | venovamedical.com — Velocity System render |
| CorFlow Therapeutics | `corflow.mp4` + `corflow.jpg` | corflow.com — CoFI console product loop (trimmed, muted) |
| Zafrens | `zafrens.jpg` | zafrens.com — optimized still from the official Z-Screen cellular-assay animation |
| IllumiCell AI | `illumicell-ai.mp4` + `illumicell-ai.jpg` | illumicell.ai — cellular microscopy loop (muted) |
| Aria CV | `aria-cv.jpg` | Aria CV device photograph (balloon, anchor, catheter and reservoir), credited to Aria CV via implantable-device.com; official technology page: ariacv.com/technology |
| Axena Health | `axena-health.jpg` | levacares.com — Leva wand sensors |
| BioSpectal | `biospectal.png` | biospectal.com — OptiBP phone mockups |
| Eyenuk | `eyenuk.jpg` | eyenuk.com — EyeArt retinal exam in use (AVIF converted to JPG) |
| Raydiant Oximetry | `raydiant-oximetry.png` | raydiantoximetry.com — Lumerah technology visual |
| Marrow Access Technologies | `marrow-access.png` | marrowaccess.com — SmartShot device-in-hand |
| CareTaker Medical | `caretaker-medical.webp` | caretakermedical.net — VitalStream system |
| Nectero Medical | `nectero-medical.mp4` + `nectero-medical.jpg` | necterotherapeutics.com — EAST System animation (trimmed to the occlusion-balloon segment, muted) |
| Alydia Health | `alydia-health.png` | laborie.com — JADA System (current official product owner) |
| Rivanna Medical | `rivanna-medical.png` | rivannamedical.com — Accuro 3S system render |
| Cerapedics | `cerapedics.png` | cerapedics.com — P-15 mechanism-of-action frame |

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
