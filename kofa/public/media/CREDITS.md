# Media credits

Two kinds of media live under `public/`:

1. **Homepage imagery**: the hero film's shots in `public/media/film/`, and
   the four real medical stills on the homepage and `/focus-areas` in
   `public/media/home/`.
2. **Portfolio company media** (`public/portfolio/`), one real device,
   platform, assay or clinical visual per company, sourced from each company's
   own official website (or the current official product owner's site). These
   are used on the strength of KOFA's portfolio relationship with the company;
   swap any file for a KOFA- or company-approved asset with no code change.

Nothing here carries a watermark or a stock-subscription licence.

## Homepage imagery

**Real medical imaging and an original drawn film, as of September 24,
2026.** Two rounds of client review decide this section:

- **September 22:** "the pictures look AI". They were generated, and were
  replaced with real Unsplash photographs (commit `f3f4f7b`).
- **September 24**, on those photographs: no people. Instead, "one silent
  looping animation on an evolution of a medical equipment / medical field"
  for the hero, and "still images of medical tools ... catheter tip,
  angiogram images, fetus ultrasound, and vascular flow" elsewhere.
- **September 25**, on the film: "one or two additional images or clips to
  the 'Today' section, in addition to the live 3D ultrasound" (her ideas: "a
  modern angiogram, AI-enabled microvascular imaging, and a futuristic scene
  that represents the types of technologies we are backing"), and "speed up
  the video slightly so the overall sequence feels more dynamic". Two were
  added: a transcatheter valve, the kind of device KOFA backs, and a
  super-resolution map of microvessels, the microvascular imaging.

The Unsplash set (`hero-lab-research.jpg`, `portfolio-microscope.jpg`,
`focus-clinician.jpg`) is deleted; recover it from commit `f3f4f7b` if ever
needed. The generated set before it is in commit `4a3c04e`.

### The hero film

`components/home/EvolutionReel.tsx` plays real clinical imaging in the
order the technology arrived. It went through three cuts: line drawing
("make the animations way more realistic"), then real footage inside a
glowing lens with a timeline ring and a teal duotone ("way too vibe coded
and generated"), then this one, shot like a documentary title sequence:
full-bleed on the near-black of a clinical display, natural tones, slow
dissolves and camera drift, film grain, one quiet caption, and nothing
drawn over the pictures. The milestone dates are the published firsts; the
footage shows each technique as practised, except 1895, which is the actual
first.

| File (`public/media/film/`) | Milestone | Source | Author | Licence |
| --- | --- | --- | --- | --- |
| `1895-x-ray.jpg` | 1895, X-ray imaging | [Commons, Röntgen's radiograph of Anna Bertha Ludwig's hand, 22 Dec 1895](https://commons.wikimedia.org/wiki/File:First_medical_X-ray_by_Wilhelm_R%C3%B6ntgen_of_his_wife_Anna_Bertha_Ludwig%27s_hand_-_18951222.jpg) | Wilhelm Röntgen | Public domain |
| `1929-catheterization.*` | 1929, cardiac catheterization | [Commons, "CAG+PTCA 67Yrs Male 10FPS (2)"](https://commons.wikimedia.org/wiki/File:CAG%2BPTCA_67Yrs_Male_10FPS_(2).webm) | Suyash Dwivedi | CC BY-SA 4.0 |
| `1958-obstetric-ultrasound.*` | 1958, obstetric ultrasound | [Commons, "Fetus playin with fingers ecografia ultrasuoni Dr. Wolfgang Moroder"](https://commons.wikimedia.org/wiki/File:Fetus_playin_with_fingers_ecografia_ultrasuoni_Dr._Wolfgang_Moroder.ogv) | Dr. Wolfgang Moroder | CC BY-SA 3.0 |
| `1960-heart-valve.jpg` | 1960, mechanical heart valve | [Wellcome Collection, "Prosthetic heart valve, Starr Edwards"](https://wellcomecollection.org/works/z7jrgqf7) (image N0009646) | Wellcome Collection | CC BY 4.0 |
| `1977-balloon-angioplasty.*` | 1977, balloon angioplasty | [Commons, "CAG+PTCA 67Yrs Male 10FPS (16)"](https://commons.wikimedia.org/wiki/File:CAG%2BPTCA_67Yrs_Male_10FPS_(16).webm) | Suyash Dwivedi | CC BY-SA 4.0 |
| `today-transcatheter-valve.*` | Today, transcatheter heart valve | [Sadat N, Scharfschwerdt M, Ensminger S, Fujita B, "Comparison of Two Generations of Self-Expandable Transcatheter Heart Valves in Nine Surgical Valves: An In Vitro Study", *J. Cardiovasc. Dev. Dis.* 2024, 11(8), 244](https://doi.org/10.3390/jcdd11080244), Video S2 (from its supplementary zip on [PMC11354675](https://pmc.ncbi.nlm.nih.gov/articles/PMC11354675/)) | Najla Sadat, Michael Scharfschwerdt, Stephan Ensminger, Buntaro Fujita | CC BY 4.0 |
| `today-live-3d-ultrasound.*` | Today, live 3D ultrasound | [Commons, "Fetal yawning 4D ultrasound ecografia 4D Dr. Wolfgang Moroder"](https://commons.wikimedia.org/wiki/File:Fetal_yawning_4D_ultrasound_ecografia_4D_Dr._Wolfgang_Moroder.theora.ogv) | Dr. Wolfgang Moroder | CC BY-SA 3.0 |
| `today-super-resolution-ultrasound.jpg` | Today, super-resolution ultrasound | [Commons, "ULM of the rat brain with flow directions"](https://commons.wikimedia.org/wiki/File:ULM_of_the_rat_brain_with_flow_directions.jpg) (own work, from the open data of Heiles et al., *Nature Biomedical Engineering* 6, 605–616, 2022) | CoutureOlivier | CC BY-SA 4.0 |
| `grain.png` | film grain tile | generated noise (seeded Gaussian), not an image of anything | — | — |

Clips are 900 x 900, H.264 MP4 (CRF 23 to 27, `-tune film`) and VP9 WebM
(CRF 33 to 38), each with a JPEG poster; the whole film is about 2.2 MB of
WebM, fetched one shot at a time as each approaches.

The pacing (September 25, then made faster again): each shot holds 2.4 to
3.2 s, with 0.8 s dissolves (they were 5 to 6 s and 1.4 s), so a shot
arrives every 3.2 to 4 s and the loop runs about 29 s. The angiograms and
ultrasounds play at 1.25x; the transcatheter valve, already slowed
high-speed footage, at 1.15x. A clip must outlast its time on screen at its
rate, rate x (hold + 2 x dissolve), or it would loop mid-shot; the rates
are set per clip in `EvolutionReel.tsx` to fit.

How each was made, exactly:

- **The grade.** Greyscale sources (the X-ray, angiograms and 2D
  ultrasound) go through one neutral "silver" curve: blacks land exactly
  on the hero ground `#050d13`, mid-greys stay neutral, whites are a warm
  `#f3efe7`, with a gentle S-curve. Colour sources (the valve, the 3D
  ultrasound) keep their colour, trimmed about 15 to 20% in saturation,
  with the same black point. There is deliberately no duotone.
- **Every clip** fades to that black at its border, so a shot shown smaller
  than its frame never reveals an edge. 10 fps sources (the angiograms and
  the 3D ultrasound) are brought to 30 fps by frame blending, which reads
  like a fluoroscope's persistence rather than inventing motion; the 2D
  ultrasound is 19 fps. A light temporal denoise (hqdn3d) runs before
  encoding, and a mild unsharp mask after the Lanczos resize.
- **Angiograms:** each frame averaged with its neighbours (as a cath-lab
  monitor does), inverted so contrast-filled vessels read light, and a
  modest local-contrast lift. The anatomy is kept; an earlier pass
  subtracted the background and made neon vessels on a flat field, which
  read as CG. The area outside the round fluoroscopy field is masked to
  black. The balloon clip is cropped inside the field, about 2x in on the
  balloon, and locally tone-mapped so a broad bright heart shadow is
  compressed while the small bright balloon is not.
- **Ultrasounds:** cropped so the scanner's on-screen text falls outside
  the frame. The 3D render sits in a box whose straight edges are faded
  out just inside.
- **Röntgen's radiograph:** a sepia print on which bone and the ring print
  dark; inverted so they read light, the modern convention. The frame is
  widened to the left with blank card (which inverts to black) so the hand
  sits right of the headline; nothing of the hand is cut, and the image is
  never mirrored (a flipped radiograph would be a falsified anatomy).
- **The valve:** a 1960s-type Starr-Edwards studio photograph, set into a
  wider square of its own studio darkness so it has room around it, with
  the grey table crushed by a tone curve rather than a spatial mask, so
  the object keeps its true edges.
- **The transcatheter valve:** the paper's Video S2 shows two valves side
  by side, each seated in a surgical valve in a pulse duplicator and filmed
  down its axis. The shot is its first segment (0 to 7.4 s, "in
  Trifecta"), the right-hand panel only, the Evolut PRO: a 600 px square
  from x 670, y 72 of the 1280 x 720 frame, taken just under the panel's
  "Evolut PRO" label, so the valve frame's topmost cells are cut and fade
  out along the crop's edge. Nothing is painted out; the file name burned
  in at the panel's bottom left falls in the surround that goes to black.
  The high-speed recording was lit by mains lighting, so the slowed-down
  footage pulses at 5 Hz by about +-8%: each frame is divided by its own
  brightness gain, measured on the static rig around the valve against a
  13-frame moving median (a deflicker; the 5 Hz component falls about
  88%). The rig's orange light is taken halfway back toward neutral
  (per-channel gains 0.81, 1.11, 1.25 from the surround), the picture is
  lifted about a stop, and the colour grade and black point are the
  film's. The crop is set, centred on the valve, into a 780 px square of
  black, and the surround falls off radially outside the valve's own
  frame, so the device sits whole in darkness like the 1960 valve at any
  hero height. It is seen closed for the first 1.9 s, then opens.
- **Super-resolution ultrasound:** ultrasound localization microscopy (ULM)
  of a rat brain, 8000 x 7802; red and blue encode flow direction. The
  yellow "0.1 mm" scale bar and its label sat on plain black and were
  painted black (the only pixels changed). Cropped to the 6400 px square
  from x 800, y 0 (the cortex's penetrating vessels, the midline and the
  deep network), Lanczos to 1600 px so the shot's push-in stays sharp, and
  a tone curve with no spatial component deepens the faint capillary haze
  while the bright vessels barely move, then the film's colour grade. It is
  captioned "Super-resolution ultrasound", not "AI-enabled": this map was
  made by localizing and tracking microbubbles, not by machine learning.

The ShareAlike files are adapted works and are licensed under the same
terms (CC BY-SA 4.0 and 3.0), as `/credits` states. The transcatheter valve
(CC BY 4.0) needs attribution only. The September 24 search found no openly
licensed footage of a transcatheter valve, and a surgical valve shown under
a transcatheter label would have been wrong, so the film had none; the
September 25 search found this bench study's supplementary video. The Starr-Edwards valve is shown
under 1960, the year the first one was implanted.

Considered for the September 25 additions and left out: a rotating CT
angiogram of the chest (Commons, Hellerhoff; only 15 frames over 180°, so
it stutters or doubles when blended), 4D-flow MRI pathline films from
open-access papers (colour bars, time stamps and axis glyphs burned in, at
600 to 800 px), and an ultrasound localization animation (368 px tall).
The CT angiogram would make a fine still if a modern angiogram is wanted.

### The four stills

All four are real, openly licensed medical imagery or photographs of real
devices. None shows a person;
none was generated or generatively edited. The public attribution the
licences require is at `/credits`, from `data/credits.ts`, which is linked
from the footer of every page. Keep the two lists in step.

| File | Shows | Source | Author | Licence |
| --- | --- | --- | --- | --- |
| `home/tissue-heart-valve.jpg` | Carpentier-Edwards tissue heart valve; homepage portfolio circle | [Wellcome Collection, "Prosthetic heart valve, Carpentier Edwards"](https://wellcomecollection.org/works/sae682d6) (image N0009644) | Wellcome Collection | CC BY 4.0 |
| `home/catheter-tips.jpg` | Three electrophysiology ablation catheter tips; Cardiovascular Innovation | [Wellcome Collection, "Cardiac ablation"](https://wellcomecollection.org/works/qxts5pgx) (image N0013829) | Wellcome Collection | CC BY 4.0 |
| `home/fetal-ultrasound.jpg` | Fetal ultrasound at 12 weeks; Advancing Women's Health | [Wikimedia Commons, "CRL Crown rump length 12 weeks ecografia Dr. Wolfgang Moroder"](https://commons.wikimedia.org/wiki/File:CRL_Crown_rump_length_12_weeks_ecografia_Dr._Wolfgang_Moroder.jpg) | Dr. Wolfgang Moroder | CC BY-SA 3.0 |
| `home/vessel-model.jpg` | 3D-printed model of the brain's blood vessels; Beyond Our Core | [Wellcome Collection, "Brain blood vessels, suspected meningitis, 3D printed nylon"](https://wellcomecollection.org/works/sq3uzant) (image B0010185) | Dave Farnham | CC BY 4.0 |

What was done to each, exactly:

- **The three Focus Area stills** were mapped from luminance onto one
  gradient in the site's own colours (deep navy `#041f2d`, hero navy
  `#0a3a50`, muted teal `#4f8c98`, ice `#eef7f8`), so three imaging
  modalities read as a single series. Exported as progressive mozjpeg,
  quality 90, 4:4:4.
- **Tissue valve (portfolio circle):** kept in natural colour with the hero
  film's grade and black point, set into a square of its own black
  background centred on the valve, its blacks deepened slightly by a tone
  curve; 1000 x 1000. It replaced a heavily processed coronary angiogram
  after the review note that you could not tell what was going on in it.
- **Catheter tips:** cropped to 1200 x 750.
- **Fetal ultrasound:** cropped to the fetus; the scanner's on-screen text
  falls outside the crop. The yellow measurement calipers and the dotted
  line between them crossed the fetus, so they were removed: the scan is
  pure greyscale, so every pixel with a yellow cast is overlay, and each was
  refilled with real neighbouring speckle mirrored across the thin line (a
  clone-stamp, not synthesis). Lanczos-resampled from 640 x 400 to 960 x 600.
- **Vessel model:** cropped to 1900 x 1188 and resampled to 1440 x 900.

The ShareAlike still (the fetal ultrasound) is an adapted work, and the
adapted file is licensed under the same terms (CC BY-SA 3.0), as `/credits`
states.

**A courtesy owed:** Dr. Moroder's file pages ask users of his images to
credit him as author (done, at `/credits`) *and to send him a message*. The
site now uses three of his works (the 12-week still and two clips). The
message is a request, not a licence condition, but it should be sent before
launch. His contact is on his Commons user page
(`User:Wolfgang Moroder`) and at ecofetale.com.

Sources for the working files (full-resolution originals and the grading
script) were kept outside the repository; the table above is enough to
re-fetch any original.

**Replacing a still:** use real imaging, not generated work. Open archives
with explicit licences (Wikimedia Commons, Wellcome Collection, NIH/NLM)
state the author and licence per file, which a stock search does not. Avoid
anything licensed NC (non-commercial): KOFA is a commercial site. Update
`data/credits.ts` and this table in the same change.

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
- **A film clip**: grade it the same way (see "The hero film" above), drop
  the `.webm`, `.mp4` and poster `.jpg` in `public/media/film/`, and point
  the milestone in `components/home/EvolutionReel.tsx` at it.
- **A homepage still**: see "Replacing a still" above.
