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

export interface PortfolioCompany {
  /** cms: post_title */
  name: string;
  /** cms: post_name */
  slug: string;
  /** cms: field_logo, media library */
  logo: string;
  /** cms: field_featured_image, optional; omitted rather than faked */
  featuredImage?: string;
  /** cms: field_description, long form, verbatim from company/KOFA copy */
  description: string;
  /** cms: field_short_description, card + meta description */
  shortDescription: string;
  /** cms: field_website */
  website: string;
  /** cms: field_healthcare_category, taxonomy term */
  category: HealthcareCategory;
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
    logo: "/logos/axon-therapies.jpg",
    description:
      "The Satera Ablation System unilaterally ablates the Greater Splanchnic Nerve to calm sympathetic activity with the goal of normalizing volume balance, increasing cardiac functional capacity and improving symptoms for HF patients.",
    shortDescription:
      "Splanchnic nerve ablation to relieve congestion and improve functional capacity in heart failure.",
    focus: "Heart failure",
    website: "https://axontherapies.com/",
    category: "Cardiovascular",
    featured: true,
    sortOrder: 1,
  },
  {
    name: "Venova Medical",
    slug: "venova-medical",
    logo: "/logos/venova-medical.png",
    description:
      "Venova is developing the Velocity System, a next generation percutaneous AVF technology designed to reduce the need for reinterventions to achieve fistula maturation and improve vascular access outcomes while reducing costs.",
    shortDescription:
      "A percutaneous arteriovenous fistula system built to improve vascular access outcomes.",
    focus: "Vascular access",
    website: "https://venovamedical.com/",
    category: "Cardiovascular",
    featured: true,
    sortOrder: 2,
  },
  {
    name: "CorFlow Therapeutics",
    slug: "corflow",
    logo: "/logos/corflow.webp",
    description:
      "CorFlow is developing a medical device that will be the first to diagnose MVO in real-time during PCI and serve as a treatment platform in the cath lab.",
    shortDescription:
      "Real-time diagnosis of microvascular obstruction during percutaneous coronary intervention.",
    focus: "Microvascular obstruction",
    website: "https://corflow.com/",
    category: "Cardiovascular",
    featured: false,
    sortOrder: 3,
  },
  {
    name: "Zafrens",
    slug: "zafrens",
    logo: "/logos/zafrens.jpeg",
    description:
      "Zafrens uses nanofabrication to analyze and manipulate cells at the highest resolution and throughput possible.",
    shortDescription:
      "Nanofabrication for cell analysis and manipulation at high resolution and throughput.",
    focus: "Cell analysis",
    website: "https://www.zafrens.com/",
    category: "Diagnostics",
    featured: false,
    sortOrder: 4,
  },
  {
    name: "IllumiCell AI",
    slug: "illumicell-ai",
    logo: "/logos/illumicell-ai.jpeg",
    description:
      "Our device empowers doctors with advanced tools to offer comprehensive guidance, make complex fertility assessments simple, accurate, and accessible.",
    shortDescription:
      "Clinician tools that make complex fertility assessment simpler and more accessible.",
    focus: "Fertility assessment",
    website: "https://www.illumicell.ai/",
    category: "Women's Health",
    featured: false,
    sortOrder: 5,
  },
  {
    name: "Aria CV",
    slug: "aria-cv",
    logo: "/logos/aria-cv.png",
    description:
      "Aria's device is designed to treat a form of PH called World Health Organization (WHO) Group 1 PH, also known as Pulmonary Arterial Hypertension (PAH).",
    shortDescription:
      "An implantable system for WHO Group 1 pulmonary arterial hypertension.",
    focus: "Pulmonary arterial hypertension",
    website: "https://ariacv.com/",
    category: "Cardiovascular",
    featured: false,
    sortOrder: 6,
  },
  {
    name: "Axena Health",
    slug: "axena-health",
    logo: "/logos/axena-health.png",
    description:
      "Axena Health is a women-led company dedicated to improving the lives of women with pelvic floor disorders and is unapologetically focused on helping them live their best lives by harnessing the power of digital technology. Axena's Leva® Pelvic Health System helps women train and strengthen their pelvic floor muscles (at home, in just five minutes a day) to treat their stress, mixed and mild-to-moderate-urgency urinary incontinence (including overactive bladder) and chronic fecal incontinence.",
    shortDescription:
      "The Leva® Pelvic Health System: at-home pelvic floor training for urinary and fecal incontinence.",
    focus: "Pelvic floor disorders",
    website: "https://www.levatherapy.com/",
    category: "Women's Health",
    featured: true,
    sortOrder: 7,
  },
  {
    name: "BioSpectal",
    slug: "biospectal",
    logo: "/logos/biospectal.png",
    description:
      "We are working relentlessly to democratize blood pressure management at global scale using breakthrough transdermal optical biosensing in mobile devices.",
    shortDescription:
      "Transdermal optical biosensing that turns a smartphone into a blood pressure monitor.",
    focus: "Blood pressure management",
    website: "https://biospectal.com/",
    category: "Digital Health",
    featured: false,
    sortOrder: 8,
  },
  {
    name: "Eyenuk",
    slug: "eyenuk",
    logo: "/logos/eyenuk.png",
    description:
      "EyeArt is the first FDA cleared AI technology for autonomous detection of both more than mild and vision-threatening diabetic retinopathy. The EyeArt® AI Eye Screening System is the most extensively validated autonomous AI technology, tested on over half a million patient visits globally with over two million images collected in real-world clinical environments.",
    shortDescription:
      "EyeArt®: the first FDA-cleared autonomous AI for diabetic retinopathy detection.",
    focus: "Diabetic retinopathy",
    website: "https://www.eyenuk.com/us-en/",
    category: "Diagnostics",
    featured: true,
    sortOrder: 9,
  },
  {
    name: "Raydiant Oximetry",
    slug: "raydiant-oximetry",
    logo: "/logos/raydiant-oximetry.png",
    description:
      "In developing Lumerah™, a noninvasive sensor technology that directly measures fetal oxygen levels, Raydiant Oximetry aims to profoundly reduce the rising mortality and morbidity rates among mothers and babies during childbirth.",
    shortDescription:
      "Lumerah™: noninvasive sensing of fetal oxygen levels during childbirth.",
    focus: "Fetal monitoring",
    website: "https://www.raydiantoximetry.com/",
    category: "Women's Health",
    featured: true,
    sortOrder: 10,
  },
  {
    name: "Marrow Access Technologies",
    slug: "marrow-access",
    logo: "/logos/marrow-access.jpg",
    description:
      "Marrow Access Technologies was founded to develop natural biologic solutions for use in the knee, hip, ankle, spine, elbow, and shoulder.",
    shortDescription:
      "Natural biologic solutions for the knee, hip, ankle, spine, elbow and shoulder.",
    focus: "Orthopedic biologics",
    website: "https://marrowaccess.com/",
    category: "Orthopedics",
    featured: false,
    sortOrder: 11,
  },
  {
    name: "CareTaker Medical",
    slug: "caretaker-medical",
    logo: "/logos/caretaker-medical.jpg",
    description:
      "CareTaker has developed the VitalStream monitoring system that sets a new standard in portability, simplicity, and medical-grade wearable wireless vital signs monitoring. VitalStream uses a small, comfortable finger cuff to accurately measure continuous, non-invasive beat-by-beat Blood Pressure (“cNIBP”), ECG-Accurate Heart Rate, and Respiration Rate. It can also be used to monitor Blood Volume (for hemorrhage detection), Arterial Stiffness, and other hemodynamic parameters.",
    shortDescription:
      "VitalStream: wearable, medical-grade continuous vital signs monitoring from a finger cuff.",
    focus: "Vital signs monitoring",
    website: "https://caretakermedical.net/",
    category: "Digital Health",
    featured: false,
    sortOrder: 12,
  },
  {
    name: "Nectero Medical",
    slug: "nectero-medical",
    logo: "/logos/nectero-medical.png",
    description:
      "Nectero Medical is developing a novel treatment to stabilize growth and prevent rupture of mid-sized abdominal aortic aneurysms (AAA). The Nectero EAST®, or Endovascular Aneurysm Stabilization Treatment System, delivers a compound with a proprietary molecule known as a Stabilizer Agent to the site of the aneurysm.",
    shortDescription:
      "The Nectero EAST® system, designed to stabilize mid-sized abdominal aortic aneurysms.",
    focus: "Abdominal aortic aneurysm",
    website: "https://necteromedical.com/",
    category: "Cardiovascular",
    featured: false,
    sortOrder: 13,
  },
  {
    name: "Alydia Health",
    slug: "alydia-health",
    logo: "/logos/alydia-health.jpg",
    description:
      "Alydia Health is a commercial-stage medical device company focused on preventing maternal morbidity and mortality caused by postpartum hemorrhage (PPH) or abnormal postpartum uterine bleeding.",
    shortDescription:
      "A commercial-stage device company preventing maternal harm from postpartum hemorrhage.",
    focus: "Postpartum hemorrhage",
    website:
      "https://www.merck.com/news/merck-announces-acquisition-of-alydia-health-on-behalf-of-its-planned-spinoff-of-organon/",
    category: "Women's Health",
    status: "Acquired by Organon",
    featured: false,
    sortOrder: 14,
  },
  {
    name: "Rivanna Medical",
    slug: "rivanna-medical",
    logo: "/logos/rivanna-medical.png",
    description:
      "RIVANNA develops and commercializes world-first, imaging-based medical technologies. Our automated clinician-assistance solutions help improve decision-making, clinician workflows, health outcomes, and patient satisfaction.",
    shortDescription:
      "World-first imaging technologies that automate clinician assistance at the point of care.",
    focus: "Imaging guidance",
    website: "https://rivannamedical.com/",
    category: "Diagnostics",
    featured: false,
    sortOrder: 15,
  },
  {
    name: "Cerapedics",
    slug: "cerapedics",
    logo: "/logos/cerapedics.jpg",
    description:
      "Cerapedics is a global, commercial-stage ortho-biologics company that aspires to transform the standard of care for bone repair, healing bones faster and at higher rates, without compromising safety, so that patients can live their healthiest lives.",
    shortDescription:
      "Global commercial-stage ortho-biologics transforming the standard of care for bone repair.",
    focus: "Bone repair",
    website: "https://cerapedics.com/i-factor-and-p-15",
    category: "Orthopedics",
    featured: true,
    sortOrder: 16,
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

export function categoryCount(cat: HealthcareCategory): number {
  return portfolio.filter((c) => c.category === cat).length;
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
