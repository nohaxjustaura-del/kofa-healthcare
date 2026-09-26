/**
 * IMAGE CREDITS
 * ---------------------------------------------------------------------------
 * Attribution for the openly licensed medical imagery on the homepage
 * (its hero film and its stills) and on /focus-areas, rendered publicly at
 * /credits and linked from every page's footer. Every licence below
 * requires attribution; the Creative Commons ShareAlike files also require
 * that our edited versions carry the same licence, which they do (the files
 * in public/media/home and public/media/film are the adapted works, and this
 * list says so).
 *
 * Keep this list and public/media/CREDITS.md in step: this is the public
 * record, that file carries the working notes (why each image was chosen and
 * exactly how it was edited). Replacing an image means updating both.
 *
 * Company logos and product media remain the property of their companies
 * and are used under KOFA's portfolio relationships.
 */

export type ImageCredit = {
  /** What the image shows, as used on this site. */
  subject: string;
  /** Where it appears. */
  usedOn: string;
  /** The source's own title for the work. */
  title: string;
  author: string;
  source: { label: string; href: string };
  license: { label: string; href: string };
  /** Changes made for this site. ShareAlike licences require this. */
  changes: string;
};

export const imageCredits: readonly ImageCredit[] = [
  /* ---- the homepage film, in the order it plays ---- */
  {
    subject: "Röntgen’s radiograph of a hand, 1895",
    usedOn: "Homepage film, 1895",
    title: "First medical X-ray by Wilhelm Röntgen of his wife Anna Bertha Ludwig’s hand - 18951222",
    author: "Wilhelm Röntgen",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:First_medical_X-ray_by_Wilhelm_R%C3%B6ntgen_of_his_wife_Anna_Bertha_Ludwig%27s_hand_-_18951222.jpg",
    },
    license: { label: "Public domain", href: "https://creativecommons.org/publicdomain/mark/1.0/" },
    changes: "Cropped to the radiograph, inverted to the modern convention and toned.",
  },
  {
    subject: "Coronary catheterization (cine angiography)",
    usedOn: "Homepage film, 1929",
    title: "CAG+PTCA 67Yrs Male 10FPS (2)",
    author: "Suyash Dwivedi",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:CAG%2BPTCA_67Yrs_Male_10FPS_(2).webm",
    },
    license: { label: "CC BY-SA 4.0", href: "https://creativecommons.org/licenses/by-sa/4.0/" },
    changes:
      "Trimmed, cropped to the fluoroscopy field, frame-averaged, inverted, lightly sharpened, toned and re-encoded at 30 fps by frame blending. The adapted clip is licensed CC BY-SA 4.0.",
  },
  {
    subject: "Fetal ultrasound at 21 weeks",
    usedOn: "Homepage film, 1958",
    title: "Fetus playin with fingers ecografia ultrasuoni Dr. Wolfgang Moroder",
    author: "Dr. Wolfgang Moroder",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:Fetus_playin_with_fingers_ecografia_ultrasuoni_Dr._Wolfgang_Moroder.ogv",
    },
    license: { label: "CC BY-SA 3.0", href: "https://creativecommons.org/licenses/by-sa/3.0/" },
    changes:
      "Trimmed, cropped (the scanner’s on-screen text falls outside the crop), toned and re-encoded at 30 fps. The adapted clip is licensed CC BY-SA 3.0.",
  },
  {
    subject: "Starr-Edwards ball-and-cage heart valve",
    usedOn: "Homepage film, 1960",
    title: "Prosthetic heart valve, Starr Edwards",
    author: "Wellcome Collection",
    source: { label: "Wellcome Collection", href: "https://wellcomecollection.org/works/z7jrgqf7" },
    license: { label: "CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
    changes: "Set into a wider frame of its own background, backdrop darkened with a tone curve, and toned.",
  },
  {
    subject: "Balloon angioplasty (cine angiography)",
    usedOn: "Homepage film, 1977",
    title: "CAG+PTCA 67Yrs Male 10FPS (16)",
    author: "Suyash Dwivedi",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:CAG%2BPTCA_67Yrs_Male_10FPS_(16).webm",
    },
    license: { label: "CC BY-SA 4.0", href: "https://creativecommons.org/licenses/by-sa/4.0/" },
    changes:
      "Trimmed, cropped in on the balloon, frame-averaged, inverted, locally tone-mapped, lightly sharpened, toned and re-encoded at 30 fps by frame blending. The adapted clip is licensed CC BY-SA 4.0.",
  },
  {
    subject: "A self-expanding transcatheter heart valve opening, on a test bench",
    usedOn: "Homepage film, today",
    title:
      "Comparison of Two Generations of Self-Expandable Transcatheter Heart Valves in Nine Surgical Valves: An In Vitro Study, Video S2",
    author: "Najla Sadat, Michael Scharfschwerdt, Stephan Ensminger and Buntaro Fujita",
    source: {
      label: "Journal of Cardiovascular Development and Disease",
      href: "https://doi.org/10.3390/jcdd11080244",
    },
    license: { label: "CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
    changes:
      "Trimmed, cropped to one of the two valves shown (the video’s labels are cropped out or fall in the darkened surround), the test lighting’s flicker evened out, its orange cast partly neutralized, brightened, set into a black surround, toned and re-encoded.",
  },
  {
    subject: "Live 3D ultrasound of a fetus yawning",
    usedOn: "Homepage film, today",
    title: "Fetal yawning 4D ultrasound ecografia 4D Dr. Wolfgang Moroder",
    author: "Dr. Wolfgang Moroder",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:Fetal_yawning_4D_ultrasound_ecografia_4D_Dr._Wolfgang_Moroder.theora.ogv",
    },
    license: { label: "CC BY-SA 3.0", href: "https://creativecommons.org/licenses/by-sa/3.0/" },
    changes:
      "Trimmed, cropped (the scanner’s on-screen text falls outside the crop), toned and re-encoded at 30 fps by frame blending. The adapted clip is licensed CC BY-SA 3.0.",
  },
  {
    subject: "Super-resolution ultrasound of a brain’s microvessels, with flow direction",
    usedOn: "Homepage film, today",
    title: "ULM of the rat brain with flow directions",
    author: "CoutureOlivier",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:ULM_of_the_rat_brain_with_flow_directions.jpg",
    },
    license: { label: "CC BY-SA 4.0", href: "https://creativecommons.org/licenses/by-sa/4.0/" },
    changes:
      "Cropped, the scale bar and its label removed (they sat on plain black), darks deepened with a tone curve, and toned. The adapted image is licensed CC BY-SA 4.0.",
  },

  /* ---- the stills ---- */
  {
    subject: "Carpentier-Edwards tissue heart valve",
    usedOn: "Homepage, portfolio introduction",
    title: "Prosthetic heart valve, Carpentier Edwards",
    author: "Wellcome Collection",
    source: { label: "Wellcome Collection", href: "https://wellcomecollection.org/works/sae682d6" },
    license: { label: "CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
    changes: "Set into a square of its own black background, deepened slightly, and toned.",
  },
  {
    subject: "Electrophysiology catheter tips",
    usedOn: "Homepage and Focus Areas, Cardiovascular Innovation",
    title: "Cardiac ablation",
    author: "Wellcome Collection",
    source: { label: "Wellcome Collection", href: "https://wellcomecollection.org/works/qxts5pgx" },
    license: { label: "CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
    changes: "Cropped and toned.",
  },
  {
    subject: "Fetal ultrasound at twelve weeks",
    usedOn: "Homepage and Focus Areas, Advancing Women’s Health",
    title: "CRL Crown rump length 12 weeks ecografia Dr. Wolfgang Moroder",
    author: "Dr. Wolfgang Moroder",
    source: {
      label: "Wikimedia Commons",
      href: "https://commons.wikimedia.org/wiki/File:CRL_Crown_rump_length_12_weeks_ecografia_Dr._Wolfgang_Moroder.jpg",
    },
    license: { label: "CC BY-SA 3.0", href: "https://creativecommons.org/licenses/by-sa/3.0/" },
    changes:
      "Cropped, on-screen measurement calipers and scanner text removed, and toned. The adapted image is licensed CC BY-SA 3.0.",
  },
  {
    subject: "3D-printed model of the brain’s blood vessels",
    usedOn: "Homepage and Focus Areas, Beyond Our Core",
    title: "Brain blood vessels, suspected meningitis, 3D printed nylon",
    author: "Dave Farnham",
    source: { label: "Wellcome Collection", href: "https://wellcomecollection.org/works/sq3uzant" },
    license: { label: "CC BY 4.0", href: "https://creativecommons.org/licenses/by/4.0/" },
    changes: "Cropped and toned.",
  },
];
