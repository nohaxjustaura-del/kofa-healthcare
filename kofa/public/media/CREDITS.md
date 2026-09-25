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

**Real photographs, as of September 23, 2026.** The three images that stood
here before were AI-generated, and the client's review said so in one line:
"the pictures look AI". They were replaced outright, not retouched. The six
generated files (`clinical-collaboration`, `device-research`,
`healthy-longevity`, each with a `-v2`) are deleted; recover them from commit
`4a3c04e` if they are ever needed for reference.

All three replacements are from Unsplash. The Unsplash Licence grants free
commercial use, with modification, and does not require attribution or
permission; credits are recorded here as good practice, not obligation.

| File | Unsplash ID | Photographer | Subject |
| --- | --- | --- | --- |
| `home/hero-lab-research.jpg` | `k9a7H43zhP4` (`photo-1581093577421`) | ThisisEngineering | Researcher at a laboratory bench. The hero. |
| `home/portfolio-microscope.jpg` | `bcqDxjddPGk` (`photo-1581091007718`) | ThisisEngineering | Gloved hand placing a petri dish under a microscope. The portfolio introduction. |
| `home/focus-clinician.jpg` | (`photo-1638202993928`) | Unsplash contributor | Clinician with a stethoscope. The Focus Areas introduction. |

Two notes on the selection, because both were deliberate:

- **`portfolio-microscope.jpg` is already KOFA's.** The same photograph runs
  on kofahealthcare.com today, as
  `thisisengineering-raeng-bcqDxjddPGk-unsplash-1.jpg`. It is the one image
  on the page the client has already accepted in another context.
- **Nothing uploaded after 2021 was considered.** Unsplash now carries a
  great deal of AI-generated work, and an Unsplash URL is no guarantee of a
  camera. Unsplash encodes the upload time in the image path
  (`photo-1581093577421` is a millisecond timestamp, February 2020), so the
  shortlist was filtered to pre-2022 uploads before anything was looked at.
  **Apply the same rule to any replacement**, or the problem the client
  raised comes straight back.

Sources were downscaled and cropped to the shapes the page needs (hero
2400x1067; the two circular crops 1500x1500) and re-encoded as progressive
mozjpeg at quality 86. No generative editing of any kind was applied.

None of these are photographs of KOFA staff, portfolio teams, or actual
patients. No visible photo credit is rendered on the website.

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
