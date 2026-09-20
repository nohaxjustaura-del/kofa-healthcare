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

## Homepage photography

Restored on September 19, 2026 in response to the user's explicit request for
healthcare photographs instead of the drawn placeholders. These original,
generated illustrative scenes were recovered from commit `0a063b1`:

- `home/clinical-collaboration.png`: two fictional clinicians collaborating;
  the homepage hero, composed with people on the right.
- `home/device-research.png`: a fictional researcher examining a device;
  the portfolio introduction.
- `home/healthy-longevity.png`: two fictional women walking outdoors;
  the Focus Areas introduction.

These are illustrative scenes, not photographs of KOFA staff, portfolio
teams, or actual patients. No visible photo credit or attribution label is
added to the website. This maintenance note records provenance only.

The shared technical linework remains available for interior page decoration;
Focus Areas uses simple consistent outline icons.

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
- **The hero**: replace `home/clinical-collaboration.png` with an approved image,
  keeping clear space on the left for the introductory copy.

## September 19 photo refinements

The built-in image-generation tool edited the restored originals into the active `-v2.png` files, improving headroom and circular-crop composition. The hero is 1881 x 836 pixels; supporting images are 1254 x 1254 pixels. These are native tool outputs, not claimed as 4K masters. The site serves responsive optimized images at quality 90. Full edit prompts are recorded in `docs/homepage-photo-prompts-2026-09-19.md`. No photo credits are rendered in the interface.
