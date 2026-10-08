/**
 * PORTFOLIO COMPANIES: CMS content type
 * ---------------------------------------------------------------------------
 * Maps 1:1 to a WordPress custom post type `portfolio_company`.
 * Field names below are the intended ACF/meta keys. Nothing in this file is
 * invented: every `name`, `description` and `website` is taken verbatim from
 * kofahealthcare.com. `shortDescription` and `category` are editorial
 * summaries of that same source copy, both are CMS-editable.
 *
 * Fields deliberately left `undefined` (status, location, investmentYear) are
 * NOT published on KOFA's current site. They render only when supplied.
 */

export type HealthcareCategory =
  | "Women's Health"
  | "Cardiovascular"
  | "Diagnostics"
  | "Orthopedics"
  | "Digital Health";

/** Whether KOFA currently holds the investment or has exited it. */
export type PortfolioStatus = "Active" | "Exits";

/**
 * COMPANY MEDIA
 * ---------------------------------------------------------------------------
 * One real device, platform, assay or clinical visual per company, sourced
 * from the company's own official site (see public/media/CREDITS.md). It is
 * the single source of truth for what renders in `CompanyVisual`.
 *
 *   kind      "image" or "video". A video always carries a `poster` still, so
 *             cards and motion-off sessions never touch the video file.
 *   fit       "cover" for photography/renders that fill the frame; "contain"
 *             for product shots that arrive on their own transparent/white
 *             ground and must not be cropped.
 *   position  object-position for a cover crop, e.g. "center", "50% 35%".
 *   ground    Tailwind class for the surface behind a "contain" asset. Omit
 *             to take the house light ground.
 */
export interface CompanyMedia {
  kind: "image" | "video";
  /** Local path under /public. Never a remote URL. */
  src: string;
  /** Video poster / still; required for kind: "video". */
  poster?: string;
  fit?: "cover" | "contain";
  position?: string;
  ground?: string;
  /** What the visual depicts, for alt text. */
  alt: string;
  /** The official page the asset came from. */
  source?: string;
}

export interface PortfolioCompany {
  /** cms: post_title */
  name: string;
  /** cms: post_name */
  slug: string;
  /** cms: field_logo, media library */
  logo: string;
  /**
   * The logo file's width divided by its height, measured on the file as it
   * ships (the supplied artwork with its blank margin trimmed away, nothing
   * else changed). components/portfolio/CompanyLogo.tsx sizes every logo to
   * the same visual area from this, so update it whenever a logo file is
   * replaced: open the file, divide width by height.
   */
  logoAspect: number;
  /** cms: field_featured_image, optional; omitted rather than faked */
  featuredImage?: string;
  /** Real company media (image or video). Falls back to the generative field. */
  media?: CompanyMedia;
  /** cms: field_description, long form, verbatim from company/KOFA copy */
  description: string;
  /** cms: field_short_description, card + meta description */
  shortDescription: string;
  /** cms: field_website */
  website: string;
  /** cms: field_healthcare_category, taxonomy term */
  category: HealthcareCategory;
  /** cms: field_portfolio_status, taxonomy term */
  portfolioStatus: PortfolioStatus;
  /** cms: field_status, e.g. "Acquired by Organon". Omit when unknown. */
  status?: string;
  /** cms: field_location, omit when unknown */
  location?: string;
  /** cms: field_investment_year, omit when unknown */
  investmentYear?: number;
  /** cms: field_featured, surfaces on the homepage */
  featured: boolean;
  /** cms: menu_order */
  sortOrder: number;
  /** Editorial: the clinical problem, in one line. Derived from source copy. */
  focus: string;
}

export const HEALTHCARE_CATEGORIES: HealthcareCategory[] = [
  "Cardiovascular",
  "Women's Health",
  "Diagnostics",
  "Orthopedics",
  "Digital Health",
];

export const portfolio: PortfolioCompany[] = [
  {
    name: "Axon Therapies",
    slug: "axon-therapies",
    logo: "/company-logos/axon-therapies.jpg",
    logoAspect: 2.607,
    description:
      "The Satera Ablation System unilaterally ablates the Greater Splanchnic Nerve to calm sympathetic activity with the goal of normalizing volume balance, increasing cardiac functional capacity and improving symptoms for HF patients.",
    shortDescription:
      "Splanchnic nerve ablation to relieve congestion and improve functional capacity in heart failure.",
    focus: "Heart failure",
    website: "https://axontherapies.com/",
    category: "Cardiovascular",
    portfolioStatus: "Active",
    featured: true,
    sortOrder: 1,
    media: {
      kind: "image",
      src: "/portfolio/axon-therapies.png",
      fit: "cover",
      position: "center",
      alt: "The Satera catheter, Axon Therapies' splanchnic nerve ablation device.",
      source: "https://axontherapies.com/savm/",
    },
  },
  {
    name: "Venova Medical",
    slug: "venova-medical",
    logo: "/company-logos/venova-medical.png",
    logoAspect: 3.08,
    description:
      "Venova is developing the Velocity System, a next generation percutaneous AVF technology designed to reduce the need for reinterventions to achieve fistula maturation and improve vascular access outcomes while reducing costs.",
    shortDescription:
      "A percutaneous arteriovenous fistula system built to improve vascular access outcomes.",
    focus: "Vascular access",
    website: "https://venovamedical.com/",
    category: "Cardiovascular",
    portfolioStatus: "Active",
    featured: true,
    sortOrder: 2,
    media: {
      kind: "image",
      src: "/portfolio/venova-medical.png",
      fit: "cover",
      position: "center",
      alt: "A render of Venova Medical's Velocity System percutaneous fistula.",
      source: "https://venovamedical.com/",
    },
  },
  {
    name: "CorFlow Therapeutics",
    slug: "corflow",
    logo: "/company-logos/corflow.webp",
    logoAspect: 4.667,
    description:
      "CorFlow is developing a medical device that will be the first to diagnose MVO in real-time during PCI and serve as a treatment platform in the cath lab.",
    shortDescription:
      "Real-time diagnosis of microvascular obstruction during percutaneous coronary intervention.",
    focus: "Microvascular obstruction",
    website: "https://corflow.com/",
    category: "Cardiovascular",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 3,
    media: {
      kind: "video",
      src: "/portfolio/corflow.mp4",
      poster: "/portfolio/corflow.jpg",
      fit: "contain",
      position: "center",
      alt: "CorFlow's CoFI console, the platform for real-time diagnosis during PCI.",
      source: "https://corflow.com/",
    },
  },
  {
    name: "Zafrens",
    slug: "zafrens",
    logo: "/company-logos/zafrens.jpeg",
    logoAspect: 1.135,
    description:
      "Zafrens uses nanofabrication to analyze and manipulate cells at the highest resolution and throughput possible.",
    shortDescription:
      "Nanofabrication for cell analysis and manipulation at high resolution and throughput.",
    focus: "Cell analysis",
    website: "https://www.zafrens.com/",
    category: "Diagnostics",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 4,
    media: {
      kind: "image",
      src: "/portfolio/zafrens.jpg",
      fit: "cover",
      position: "center",
      alt: "Cellular assay wells and single-cell imaging from Zafrens' Z-Screen platform.",
      source: "https://www.zafrens.com/technology",
    },
  },
  {
    name: "IllumiCell AI",
    slug: "illumicell-ai",
    logo: "/company-logos/illumicell-ai.jpeg",
    logoAspect: 1.0,
    description:
      "Our device empowers doctors with advanced tools to offer comprehensive guidance, make complex fertility assessments simple, accurate, and accessible.",
    shortDescription:
      "Clinician tools that make complex fertility assessment simpler and more accessible.",
    focus: "Fertility assessment",
    website: "https://www.illumicell.ai/",
    category: "Women's Health",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 5,
    media: {
      kind: "video",
      src: "/portfolio/illumicell-ai.mp4",
      poster: "/portfolio/illumicell-ai.jpg",
      fit: "cover",
      position: "center",
      alt: "Cellular microscopy from IllumiCell AI's fertility diagnostics platform.",
      source: "https://www.illumicell.ai/fertility",
    },
  },
  {
    name: "Aria CV",
    slug: "aria-cv",
    logo: "/company-logos/aria-cv.png",
    logoAspect: 4.521,
    description:
      "Aria's device is designed to treat a form of PH called World Health Organization (WHO) Group 1 PH, also known as Pulmonary Arterial Hypertension (PAH).",
    shortDescription:
      "An implantable system for WHO Group 1 pulmonary arterial hypertension.",
    focus: "Pulmonary arterial hypertension",
    website: "https://ariacv.com/",
    category: "Cardiovascular",
    portfolioStatus: "Exits",
    featured: false,
    sortOrder: 6,
    media: {
      kind: "image",
      src: "/portfolio/aria-cv.jpg",
      fit: "cover",
      position: "center",
      alt: "Aria CV's balloon, catheter, anchor and subcutaneous gas reservoir.",
      source: "https://ariacv.com/technology/",
    },
  },
  {
    name: "Axena Health",
    slug: "axena-health",
    logo: "/company-logos/axena-health.png",
    logoAspect: 4.315,
    description:
      "Axena Health is a women-led company dedicated to improving the lives of women with pelvic floor disorders and is unapologetically focused on helping them live their best lives by harnessing the power of digital technology. Axena's Leva® Pelvic Health System helps women train and strengthen their pelvic floor muscles (at home, in just five minutes a day) to treat their stress, mixed and mild-to-moderate-urgency urinary incontinence (including overactive bladder) and chronic fecal incontinence.",
    shortDescription:
      "The Leva® Pelvic Health System: at-home pelvic floor training for urinary and fecal incontinence.",
    focus: "Pelvic floor disorders",
    website: "https://www.levatherapy.com/",
    category: "Women's Health",
    portfolioStatus: "Active",
    featured: true,
    sortOrder: 7,
    media: {
      kind: "image",
      src: "/portfolio/axena-health.jpg",
      fit: "cover",
      position: "center",
      alt: "The Leva wand, Axena Health's at-home pelvic floor training device.",
      source: "https://levacares.com/for-women/how-leva-works/",
    },
  },
  {
    name: "BioSpectal",
    slug: "biospectal",
    logo: "/company-logos/biospectal.png",
    logoAspect: 2.679,
    description:
      "We are working relentlessly to democratize blood pressure management at global scale using breakthrough transdermal optical biosensing in mobile devices.",
    shortDescription:
      "Transdermal optical biosensing that turns a smartphone into a blood pressure monitor.",
    focus: "Blood pressure management",
    website: "https://biospectal.com/",
    category: "Digital Health",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 8,
    media: {
      kind: "image",
      src: "/portfolio/biospectal.png",
      fit: "contain",
      position: "center",
      alt: "BioSpectal's OptiBP app measuring blood pressure on a smartphone.",
      source: "https://biospectal.com/",
    },
  },
  {
    name: "Eyenuk",
    slug: "eyenuk",
    logo: "/company-logos/eyenuk.png",
    logoAspect: 5.708,
    description:
      "EyeArt is the first FDA cleared AI technology for autonomous detection of both more than mild and vision-threatening diabetic retinopathy. The EyeArt® AI Eye Screening System is the most extensively validated autonomous AI technology, tested on over half a million patient visits globally with over two million images collected in real-world clinical environments.",
    shortDescription:
      "EyeArt®: the first FDA-cleared autonomous AI for diabetic retinopathy detection.",
    focus: "Diabetic retinopathy",
    website: "https://www.eyenuk.com/us-en/",
    category: "Diagnostics",
    portfolioStatus: "Active",
    featured: true,
    sortOrder: 9,
    media: {
      kind: "image",
      src: "/portfolio/eyenuk.jpg",
      fit: "cover",
      position: "right center",
      alt: "A patient undergoing an EyeArt autonomous retinal screening.",
      source: "https://www.eyenuk.com/en/solutions",
    },
  },
  {
    name: "Raydiant Oximetry",
    slug: "raydiant-oximetry",
    logo: "/company-logos/raydiant-oximetry.png",
    logoAspect: 1.038,
    description:
      "In developing Lumerah™, a noninvasive sensor technology that directly measures fetal oxygen levels, Raydiant Oximetry aims to profoundly reduce the rising mortality and morbidity rates among mothers and babies during childbirth.",
    shortDescription:
      "Lumerah™: noninvasive sensing of fetal oxygen levels during childbirth.",
    focus: "Fetal monitoring",
    website: "https://www.raydiantoximetry.com/",
    category: "Women's Health",
    portfolioStatus: "Active",
    featured: true,
    sortOrder: 10,
    media: {
      kind: "image",
      src: "/portfolio/raydiant-oximetry.png",
      fit: "cover",
      position: "left center",
      alt: "A mother holding her newborn, from Raydiant Oximetry's Lumerah.",
      source: "https://raydiantoximetry.com/technology/",
    },
  },
  {
    name: "Marrow Access Technologies",
    slug: "marrow-access",
    logo: "/company-logos/marrow-access.jpg",
    logoAspect: 2.752,
    description:
      "Marrow Access Technologies was founded to develop natural biologic solutions for use in the knee, hip, ankle, spine, elbow, and shoulder.",
    shortDescription:
      "Natural biologic solutions for the knee, hip, ankle, spine, elbow and shoulder.",
    focus: "Orthopedic biologics",
    website: "https://marrowaccess.com/",
    category: "Orthopedics",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 11,
    media: {
      kind: "image",
      src: "/portfolio/marrow-access.png",
      fit: "contain",
      position: "center",
      alt: "A gloved hand holding Marrow Access Technologies' SmartShot device.",
      source: "https://marrowaccess.com/",
    },
  },
  {
    name: "CareTaker Medical",
    slug: "caretaker-medical",
    logo: "/company-logos/caretaker-medical.jpg",
    logoAspect: 5.381,
    description:
      "CareTaker has developed the VitalStream monitoring system that sets a new standard in portability, simplicity, and medical-grade wearable wireless vital signs monitoring. VitalStream uses a small, comfortable finger cuff to accurately measure continuous, non-invasive beat-by-beat Blood Pressure (“cNIBP”), ECG-Accurate Heart Rate, and Respiration Rate. It can also be used to monitor Blood Volume (for hemorrhage detection), Arterial Stiffness, and other hemodynamic parameters.",
    shortDescription:
      "VitalStream: wearable, medical-grade continuous vital signs monitoring from a finger cuff.",
    focus: "Vital signs monitoring",
    website: "https://caretakermedical.net/",
    category: "Digital Health",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 12,
    media: {
      kind: "image",
      src: "/portfolio/caretaker-medical.webp",
      fit: "contain",
      position: "center",
      alt: "CareTaker's VitalStream wearable monitor and A-Line dock.",
      source: "https://caretakermedical.net/vitalstream/",
    },
  },
  {
    /* The company now trades as Nectero Therapeutics; Nectero Medical, Inc.
       remains the legal entity, which is why the slug, and therefore the
       /portfolio/nectero-medical URL and every `company: "nectero-medical"`
       key in data/news.ts, is deliberately left alone. Rename the slug and
       you break inbound links and silently orphan six news items. */
    name: "Nectero Therapeutics",
    slug: "nectero-medical",
    logo: "/company-logos/nectero-medical.png",
    logoAspect: 4.209,
    description:
      "Nectero Therapeutics is developing a novel treatment to stabilize growth and prevent rupture of mid-sized abdominal aortic aneurysms (AAA). The Nectero EAST®, or Endovascular Aneurysm Stabilization Treatment System, delivers a compound with a proprietary molecule known as a Stabilizer Agent to the site of the aneurysm.",
    shortDescription:
      "The Nectero EAST® system, designed to stabilize mid-sized abdominal aortic aneurysms.",
    focus: "Abdominal aortic aneurysm",
    website: "https://necterotherapeutics.com/",
    category: "Cardiovascular",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 13,
    media: {
      kind: "video",
      src: "/portfolio/nectero-medical.mp4",
      poster: "/portfolio/nectero-medical.jpg",
      fit: "cover",
      position: "center",
      alt: "Nectero's EAST System stabilizing an abdominal aortic aneurysm.",
      source: "https://necterotherapeutics.com/products/",
    },
  },
  {
    name: "Alydia Health",
    slug: "alydia-health",
    logo: "/company-logos/alydia-health.jpg",
    logoAspect: 2.472,
    description:
      "Alydia Health is a commercial-stage medical device company focused on preventing maternal morbidity and mortality caused by postpartum hemorrhage (PPH) or abnormal postpartum uterine bleeding.",
    shortDescription:
      "A commercial-stage device company preventing maternal harm from postpartum hemorrhage.",
    focus: "Postpartum hemorrhage",
    website:
      "https://www.merck.com/news/merck-announces-acquisition-of-alydia-health-on-behalf-of-its-planned-spinoff-of-organon/",
    category: "Women's Health",
    portfolioStatus: "Exits",
    status: "Acquired by Organon",
    featured: false,
    sortOrder: 14,
    media: {
      kind: "image",
      src: "/portfolio/alydia-health.png",
      fit: "contain",
      position: "center",
      alt: "The JADA System, Alydia Health's device for postpartum hemorrhage.",
      source: "https://www.laborie.com/product/jada-system/",
    },
  },
  {
    name: "Rivanna Medical",
    slug: "rivanna-medical",
    logo: "/company-logos/rivanna-medical.png",
    logoAspect: 6.533,
    description:
      "RIVANNA develops and commercializes world-first, imaging-based medical technologies. Our automated clinician-assistance solutions help improve decision-making, clinician workflows, health outcomes, and patient satisfaction.",
    shortDescription:
      "World-first imaging technologies that automate clinician assistance at the point of care.",
    focus: "Imaging guidance",
    website: "https://rivannamedical.com/",
    category: "Diagnostics",
    portfolioStatus: "Active",
    featured: false,
    sortOrder: 15,
    media: {
      kind: "image",
      src: "/portfolio/rivanna-medical.png",
      fit: "contain",
      position: "center",
      alt: "RIVANNA's Accuro 3S imaging-based clinician assistance system.",
      source: "https://rivannamedical.com/accuro-3s/",
    },
  },
  {
    name: "Cerapedics",
    slug: "cerapedics",
    logo: "/company-logos/cerapedics.jpg",
    logoAspect: 4.596,
    description:
      "Cerapedics is a global, commercial-stage ortho-biologics company that aspires to transform the standard of care for bone repair, healing bones faster and at higher rates, without compromising safety, so that patients can live their healthiest lives.",
    shortDescription:
      "Global commercial-stage ortho-biologics transforming the standard of care for bone repair.",
    focus: "Bone repair",
    website: "https://cerapedics.com/i-factor-and-p-15",
    category: "Orthopedics",
    portfolioStatus: "Active",
    featured: true,
    sortOrder: 16,
    media: {
      kind: "image",
      src: "/portfolio/cerapedics.png",
      fit: "cover",
      position: "center",
      alt: "Cerapedics' P-15 peptide binding to bone, from its mechanism of action.",
      source: "https://www.cerapedics.com/science/p-15",
    },
  },
];

/* --- Selectors ------------------------------------------------------------ */

export const portfolioSorted = [...portfolio].sort(
  (a, b) => a.sortOrder - b.sortOrder,
);

export const featuredPortfolio = portfolioSorted.filter((c) => c.featured);

export function getCompany(slug: string): PortfolioCompany | undefined {
  return portfolio.find((c) => c.slug === slug);
}

/** Only categories actually represented in the portfolio are ever offered. */
export const activeCategories: HealthcareCategory[] =
  HEALTHCARE_CATEGORIES.filter((cat) =>
    portfolio.some((c) => c.category === cat),
  );

export const PORTFOLIO_STATUSES: PortfolioStatus[] = ["Active", "Exits"];

export type PortfolioFilter = PortfolioStatus | HealthcareCategory;

/** Status filters lead, followed by the existing healthcare taxonomy. */
export const portfolioFilters: PortfolioFilter[] = [
  ...PORTFOLIO_STATUSES,
  ...activeCategories,
];

export function categoryCount(cat: HealthcareCategory): number {
  return portfolio.filter((c) => c.category === cat).length;
}

export function portfolioFilterCount(filter: PortfolioFilter): number {
  return portfolio.filter((company) =>
    PORTFOLIO_STATUSES.includes(filter as PortfolioStatus)
      ? company.portfolioStatus === filter
      : company.category === filter,
  ).length;
}

export function matchesPortfolioFilter(
  company: PortfolioCompany,
  filter: PortfolioFilter,
): boolean {
  return PORTFOLIO_STATUSES.includes(filter as PortfolioStatus)
    ? company.portfolioStatus === filter
    : company.category === filter;
}

/** Neighbours for the prev / next footer on a company page. */
export function companyNeighbours(slug: string) {
  const i = portfolioSorted.findIndex((c) => c.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  const len = portfolioSorted.length;
  return {
    prev: portfolioSorted[(i - 1 + len) % len],
    next: portfolioSorted[(i + 1) % len],
  };
}
