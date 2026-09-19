/**
 * NEWS: CMS content type
 * ---------------------------------------------------------------------------
 * Maps 1:1 to a WordPress custom post type `news` with a `news_type`
 * taxonomy ("KOFA News" / "Portfolio News") and a relationship field pointing
 * at a `portfolio_company`. That relationship is what powers the "Latest
 * from [Company]" block on each company page, nothing there is hand-wired.
 *
 * PROVENANCE: every entry below was found by search, then independently
 * re-fetched and checked against its source URL before being included. None of
 * it is generated. Items link out to the original publisher rather than
 * reproducing article text, so `body` is empty on all of them; it exists for
 * posts KOFA writes itself, which will then render as full internal articles.
 *
 * Generated 2026-08-18, last swept 2026-09-18. Dates are the publication
 * or dateline date given by the source.
 */

export type NewsType = "KOFA News" | "Portfolio News";

export interface NewsItem {
  /** cms: post_name */
  slug: string;
  /** cms: post_title */
  title: string;
  /** cms: taxonomy news_type */
  type: NewsType;
  /** cms: post_date, ISO yyyy-mm-dd */
  date: string;
  /** cms: field_excerpt */
  excerpt: string;
  /** cms: field_external_source, publication name */
  source?: string;
  /** cms: field_external_url */
  externalUrl?: string;
  /** cms: field_hero_image, omitted rather than faked */
  heroImage?: string;
  /** cms: field_body, full article text for KOFA-authored posts */
  body?: string;
  /** cms: field_related_company, portfolio company slug */
  company?: string;
  /** cms: field_subheadline */
  subheadline?: string;
}

export const news: NewsItem[] = [
  {
    slug: "cms-establishes-first-icd-10-pcs-code-for-computer-aided-neuraxial",
    title:
      "CMS establishes the first ICD-10-PCS code for computer-aided neuraxial guidance",
    type: "Portfolio News",
    date: "2026-09-16",
    excerpt:
      "The Centers for Medicare & Medicaid Services created ICD-10-PCS code XEZU3HC, covering computer-aided intraprocedural navigation in the spinal canal by ultrasound with continuous needle tracking. Effective for inpatient discharges from October 1, 2026, it is the first dedicated inpatient coding category for the procedure, which until now had no separate reportability. The code describes the procedural category rather than any one product; RIVANNA's Accuro 3S is the first FDA-cleared, AI-enabled real-time ultrasound guidance system built for neuraxial anesthesia.",
    source: "RIVANNA Medical",
    externalUrl:
      "https://rivannamedical.com/rivanna-announces-new-cms-procedure-code-for-computer-aided-neuraxial-guidance/",
    company: "rivanna-medical",
  },
  {
    slug: "illumicell-ai-closes-regulation-crowdfunding-raise-led-by-medtech",
    title:
      "IllumiCell AI closes Regulation Crowdfunding raise led by MedTech Syndicates",
    type: "Portfolio News",
    date: "2026-07-16",
    excerpt:
      "IllumiCell AI completed a Regulation Crowdfunding offering with ICON Capital Group as broker-of-record and MedTech Syndicates as lead investor. Proceeds are earmarked for product development and commercialization of its AI cellular imaging and diagnostics platform.",
    source: "ICON Capital Group (via KOREWIRE syndication)",
    externalUrl:
      "https://www.voiceofalexandria.com/news/national_business_news/illumicell-ai-successfully-completes-regulation-crowdfunding-capital-raise/article_1834390c-4b85-52e6-9ae4-7c15215f55ef.html",
    company: "illumicell-ai",
  },
  {
    slug: "illumicell-ai-places-second-on-meet-the-drapers-season",
    title:
      "IllumiCell AI places second on Meet the Drapers Season 9 and receives $500,000 from Tim Draper",
    type: "Portfolio News",
    date: "2026-06-19",
    excerpt:
      "The company took second place in Season 9 of Meet the Drapers and secured a $500,000 investment from Tim Draper, who invited it to compete after an elevator pitch at HumanX in Las Vegas. Co-founder Michel Bielecki, MD, MPH is listed as CEO and Jeyla Sadikova as Chief Strategy Officer.",
    source: "EIN Presswire",
    externalUrl:
      "https://www.einpresswire.com/article/920741182/illumicell-ai-places-second-on-meet-the-drapers-season-9-receives-500-000-investment-from-tim-draper",
    company: "illumicell-ai",
  },
  {
    slug: "nectero-two-year-proximal-neck-dynamics-presented-at-vam-2026",
    title:
      "Two-year proximal neck data from Nectero's first-in-human AAA study presented at VAM 2026",
    type: "Portfolio News",
    date: "2026-06-25",
    excerpt:
      "Dr. Matthew Eagleton, Chief of Vascular and Endovascular Surgery at Mass General Brigham, presented two-year proximal neck dynamics from the 46-patient first-in-human study of the Nectero EAST System at the 2026 Vascular Annual Meeting in Boston. Forty-one patients completed two-year follow-up. Proximal neck diameters stayed stable and aortic anatomy was preserved, which matters because it keeps patients eligible for minimally invasive endovascular repair should they later need it.",
    source: "Nectero Therapeutics",
    externalUrl:
      "https://necterotherapeutics.com/data-presented-on-two-year-proximal-neck-dynamicsfrom-first-in-human-study-of-abdominal-aortic-aneurysm-treatment/",
    company: "nectero-medical",
  },
  {
    slug: "raydiant-oximetry-completes-enrollment-of-first-15-patients-in",
    title:
      "Raydiant Oximetry completes enrollment of first 15 patients in LSU Health Shreveport IDE pilot; FDA approves expansion to 30",
    type: "Portfolio News",
    date: "2026-06-15",
    excerpt:
      "The company completed enrollment and data collection for the first 15 patients in its IDE pilot study at Louisiana State University Health Shreveport, gathering over 40 hours of fetal pulse oximetry data via an investigational transvaginal sensor placed on the fetus's cheek during active labor. The FDA approved expanding the study to up to 30 patients.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/raydiant-oximetry-completes-enrollment-of-first-15-patients-in-ide-pilot-study-at-lsu-health-shreveport-302799511.html",
    company: "raydiant-oximetry",
  },
  {
    slug: "caretaker-medical-receives-ce-mark-for-vitalstream-multimodal-wireless",
    title:
      "Caretaker Medical receives CE Mark for VitalStream multimodal wireless monitoring platform",
    type: "Portfolio News",
    date: "2026-06-05",
    excerpt:
      "Caretaker Medical announced CE Mark approval for the VitalStream multimodal hemodynamic monitoring platform at the EuroAnesthesia 2026 Congress in Rotterdam, opening European access. The platform runs in both non-invasive (finger sensor) and minimally invasive (arterial line) configurations on one device.",
    source: "Caretaker Medical (company press release)",
    externalUrl:
      "https://caretakermedical.net/blog/caretaker-medical-receives-ce-mark-for-vitalstreamsup-sup-multimodal-wireless-patient-monitoring-platform/",
    company: "caretaker-medical",
  },
  {
    slug: "rivanna-receives-fda-510-k-clearance-for-the-accuro",
    title:
      "RIVANNA receives FDA 510(k) clearance for the Accuro XV musculoskeletal ultrasound imaging system",
    type: "Portfolio News",
    date: "2026-05-07",
    excerpt:
      "FDA cleared the Accuro XV diagnostic ultrasound system for musculoskeletal imaging in hospital and clinic settings. The system uses a conformable 3D volumetric probe with motorized linear translation to automate large field-of-view acquisition, with BoneEnhance and CADe/x AI capabilities still in multi-site validation.",
    source: "Rivanna Medical",
    externalUrl:
      "https://rivannamedical.com/rivanna-receives-fda-510k-clearance-for-accuro-xv-musculoskeletal-ultrasound-imaging-system/",
    company: "rivanna-medical",
  },
  {
    slug: "corflow-completes-moca-ii-phase-1-begins-phase-2",
    title:
      "CorFlow completes MOCA II Phase 1, begins Phase 2 enrollment, and gets approval to start the REVITALISE RCT in Europe",
    type: "Portfolio News",
    date: "2026-04-30",
    excerpt:
      "CorFlow completed Phase 1 of the MOCA II pivotal trial with 19 patients at eight sites (five US, three European), cleared by the independent DSMB, and enrolled the first Phase 2 patients at Cardiocentro Ticino in Lugano, Switzerland. The company also received approval to begin the REVITALISE randomized controlled trial of CoFI-delivered therapy in the UK: targeting at least 250 STEMI patients with early results expected in 2027, and added Dr. Rick Kuntz as board observer and Dr. Pedro Eerdmans as VP Clinical.",
    source: "BioSpace (CorFlow press release)",
    externalUrl:
      "https://www.biospace.com/press-releases/corflow-therapeutics-announces-successful-completion-of-phase-1-and-first-patients-enrolled-in-phase-2-of-the-moca-ii-pivotal-trial-approval-to-start-the-revitalise-rct-in-europe-and-strengthening-of-clinical-leadership",
    company: "corflow",
  },
  {
    slug: "cerapedics-signs-vizient-supplier-agreement-for-pearlmatrix-p-15",
    title:
      "Cerapedics signs Vizient supplier agreement for PearlMatrix P-15",
    type: "Portfolio News",
    date: "2026-04-24",
    excerpt:
      "Cerapedics added PearlMatrix P-15 to its existing supplier relationship with Vizient, the group purchasing organization that serves more than 65% of U.S. acute care providers and 97% of academic medical centers. i-FACTOR for cervical spine was already on the Vizient agreement.",
    source: "Cerapedics",
    externalUrl:
      "https://www.cerapedics.com/news/cerapedics-announces-supplier-agreement-vizient-pearlmatrixr-p-15-peptide-enhanced-bone-graft",
    company: "cerapedics",
  },
  {
    slug: "nectero-reports-two-year-first-in-human-data-showing",
    title:
      "Nectero reports two-year first-in-human data showing 1.0 mm/year median aneurysm growth after EAST treatment",
    type: "Portfolio News",
    date: "2026-04-23",
    excerpt:
      "Two-year data from the 46-patient first-in-human trial of the Nectero EAST System showed median aneurysm diameter growth of 1.00 mm per year, with nearly 90% of aneurysms growing less than historical expectations. There were no major adverse events through 30 days and no treatment-related adverse events after 30 days, with 100% technical success and average procedure duration under 45 minutes.",
    source: "Nectero Therapeutics",
    externalUrl:
      "https://necterotherapeutics.com/nectero-therapeutics-reports-two-year-safety-and-efficacy-data-from-first-in-human-trial-for-treatment-of-small-to-medium-sized-abdominal-aortic-aneurysms/",
    company: "nectero-medical",
  },
  {
    slug: "six-month-venos-2-outcomes-for-the-velocity-pavf",
    title:
      "Six-month VENOS-2 outcomes for the Velocity pAVF System presented as a late-breaker at SIR 2026",
    type: "Portfolio News",
    date: "2026-04-18",
    excerpt:
      "Bart Dolmatch, MD presented six-month outcomes from the VENOS-2 early feasibility study (NCT06712251) of the Velocity Percutaneous AVF System as a featured late-breaking abstract at the 2026 Society of Interventional Radiology annual scientific meeting in Toronto. The Velocity System remains investigational and has not received FDA market clearance.",
    source: "Venova Medical (company press release)",
    externalUrl:
      "https://venovamedical.com/2026/04/sir-2026/",
    company: "venova-medical",
  },
  {
    slug: "randomized-controlled-trial-in-urogynecology-finds-leva-effective-for",
    title:
      "Randomized controlled trial in Urogynecology finds Leva effective for fecal incontinence",
    type: "Portfolio News",
    date: "2026-04-16",
    excerpt:
      "A single-blind RCT of 38 women at the University of Wisconsin-Madison, published in Urogynecology, found 8-week and 16-week Leva treatment arms equivalently effective, with 63% symptom improvement sustained at 24-week follow-up. Mean treatment adherence was 75%.",
    source: "Axena Health (company press release)",
    externalUrl:
      "https://axenahealth.com/2026/04/randomized-controlled-trial-published-in-urogynecology-demonstrates-leva-pelvic-health-systems-efficacy-in-treating-fecal-incontinence/",
    company: "axena-health",
  },
  {
    slug: "real-world-evidence-study-shows-leva-improves-fecal-incontinence",
    title:
      "Real-world evidence study shows Leva improves fecal incontinence symptoms in women",
    type: "Portfolio News",
    date: "2026-03-09",
    excerpt:
      "A 214-woman real-world study published in Diseases of the Colon & Rectum reported that nearly 60% of participants achieved clinically meaningful symptom improvement after 8 weeks, with 73% reporting overall improvement and no serious safety concerns.",
    source: "Axena Health (company press release)",
    externalUrl:
      "https://axenahealth.com/2026/03/new-real-world-evidence-study-shows-leva-pelvic-health-system-significantly-improves-fecal-incontinence-symptoms-in-women/",
    company: "axena-health",
  },
  {
    slug: "organon-completes-divestiture-of-the-jada-system-to-laborie",
    title:
      "Organon completes divestiture of the Jada System to Laborie Medical Technologies",
    type: "Portfolio News",
    date: "2026-01-28",
    excerpt:
      "Organon closed the sale of the Jada System, the postpartum hemorrhage device it acquired with Alydia Health in 2021, to Laborie Medical Technologies. The deal included up to $25 million in contingent consideration tied to 2026 revenue targets.",
    source: "Organon",
    externalUrl:
      "https://www.organon.com/news/organon-completes-divestiture-of-jada-system-to-laborie/",
    company: "alydia-health",
  },
  {
    slug: "fda-expands-pearlmatrix-p-15-approval-to-all-major",
    title:
      "FDA expands PearlMatrix P-15 approval to all major lumbar interbody approaches and additional cage materials",
    type: "Portfolio News",
    date: "2026-01-13",
    excerpt:
      "FDA approved expanded indications for PearlMatrix P-15, adding ALIF, PLIF, OLIF and LLIF to the original TLIF approval, and adding titanium alloy and PEEK/titanium cages to the originally approved PEEK cages. Cerapedics said the supplemental application was approved within three months of submission.",
    source: "Cerapedics",
    externalUrl:
      "https://www.cerapedics.com/news/cerapedics-pearlmatrix-p-15-peptide-enhanced-bone-graft-first-and-only-proven-bone-growth",
    company: "cerapedics",
  },
  {
    slug: "axena-health-expands-mayo-clinic-collaboration-to-build-a",
    title:
      "Axena Health expands Mayo Clinic collaboration to build a new AI-enabled pelvic floor treatment platform",
    type: "Portfolio News",
    date: "2026-01-10",
    excerpt:
      "Building on the February 2025 collaboration, Axena Health and Mayo Clinic expanded their work to develop a new product separate from the flagship Leva system, initially targeting urinary incontinence and overactive bladder and intended to use AI for personalized care pathways. The new product will be developed and owned by Axena Health.",
    source: "Business Wire",
    externalUrl:
      "https://www.businesswire.com/news/home/20260110668088/en/Axena-Health-Expands-Collaboration-to-Improve-Treatment-Options-for-Women-with-Pelvic-Floor-Disorders",
    company: "axena-health",
  },
  {
    slug: "fda-clears-vitalstreamart-arterial-line-interface-adding-invasive-monitoring",
    title:
      "FDA clears VitalStreamART arterial line interface, adding invasive monitoring to the VitalStream platform",
    type: "Portfolio News",
    date: "2025-12-19",
    excerpt:
      "Caretaker Medical received FDA 510(k) clearance for the VitalStreamART Arterial Line Interface, letting clinicians get continuous hemodynamic data (pressure, volume, cardiac output, SVR, fluid response) from either a non-invasive finger sensor or an existing arterial line without disposables. Now available for ordering in the US.",
    source: "Caretaker Medical (company press release)",
    externalUrl:
      "https://caretakermedical.net/blog/caretaker-medical-achieves-fda-clearance-for-vitalstreamart-expanding-the-wireless-vitalstream-platform-to-deliver-both-invasive-and-non-invasive-multimodal-continuous-hemodynamic-monitoring/",
    company: "caretaker-medical",
  },
  {
    slug: "24-month-aspire-results-for-pearlmatrix-p-15-published",
    title:
      "24-month ASPIRE results for PearlMatrix P-15 published in Spine",
    type: "Portfolio News",
    date: "2025-12-17",
    excerpt:
      "Two papers in Spine reported 24-month outcomes from the ASPIRE pivotal study, showing PearlMatrix met statistically superior Composite Clinical Success versus local autograft and more than twice as many patients fused at six months. Safety was comparable to local autograft with no significant difference in serious device-related adverse events.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/cerapedics-announces-publication-in-spine-of-24-month-aspire-study-results-of-pearlmatrix-p-15-peptide-enhanced-bone-graft-302644264.html",
    company: "cerapedics",
  },
  {
    slug: "laborie-agrees-to-acquire-the-jada-system-from-organon",
    title:
      "Laborie agrees to acquire the Jada System from Organon for up to $465 million",
    type: "Portfolio News",
    date: "2025-11-07",
    excerpt:
      "Laborie Medical Technologies announced an agreement to acquire the Jada System for $440 million at closing plus up to $25 million contingent on 2026 revenue targets. Jada has launched in over 20 countries, is used in more than 2,000 U.S. hospitals, and has treated roughly 136,000 mothers.",
    source: "PR Newswire (Laborie)",
    externalUrl:
      "https://www.prnewswire.com/news-releases/laborie-announces-agreement-to-acquire-the-jada-system-from-organon-302608618.html",
    company: "alydia-health",
  },
  {
    slug: "venova-enrolls-first-subjects-in-the-venos-3-pivotal",
    title:
      "Venova enrolls first subjects in the VENOS-3 pivotal IDE study of the Velocity pAVF System",
    type: "Portfolio News",
    date: "2025-11-06",
    excerpt:
      "Venova Medical announced the first subjects enrolled in VENOS-3 (NCT07153939), a multi-center pivotal IDE trial expected to enroll up to 126 patients across approximately 40 US sites evaluating the Velocity System for percutaneous AVF creation for hemodialysis access. Initial procedures were performed at sites in Alabama and Florida.",
    source: "Venova Medical (company press release)",
    externalUrl:
      "https://venovamedical.com/2025/11/venos-3-enrollment/",
    company: "venova-medical",
  },
  {
    slug: "raydiant-oximetry-completes-35-patient-early-feasibility-study-at",
    title:
      "Raydiant Oximetry completes 35-patient Early Feasibility Study at Eastern Virginia Medical School",
    type: "Portfolio News",
    date: "2025-10-20",
    excerpt:
      "The EFS at EVMS at Old Dominion University collected fetal signals both transvaginally and transabdominally from women in active labor, with participating clinicians blinded to all pulse oximetry data. The data will support machine learning algorithm development for future commercial products.",
    source: "EIN Presswire",
    externalUrl:
      "https://www.einpresswire.com/article/859446282/raydiant-oximetry-successfully-completes-35-patient-early-feasibility-study-at-eastern-virginia-medical-school",
    company: "raydiant-oximetry",
  },
  {
    slug: "axon-therapies-closes-32m-oversubscribed-series-a-and-names",
    title:
      "Axon Therapies closes $32M oversubscribed Series A and names Zoar Engelman CEO",
    type: "Portfolio News",
    date: "2025-09-25",
    excerpt:
      "Axon Therapies raised $32 million in a Series A co-led by Earlybird Venture Capital and Santé Ventures, with participation from Deerfield Management, CD Capital and KOFA Healthcare. Proceeds fund two double-blinded randomized feasibility studies of its Satera Ablation System in HFpEF and HFrEF; co-founder Zoar Engelman was appointed CEO and the company opened a UK-based European headquarters.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/axon-therapies-raises-32m-in-oversubscribed-series-a-to-transform-heart-failure-treatment-302567496.html",
    company: "axon-therapies",
  },
  {
    slug: "eyenuk-lands-first-national-health-system-deployment-of-autonomous",
    title:
      "Eyenuk lands first national health system deployment of autonomous AI eye screening, in Norway",
    type: "Portfolio News",
    date: "2025-09-17",
    excerpt:
      "Eyenuk's EyeArt AI Eye Screening System was selected for deployment across South-Eastern Norway Regional Health Authority (Helse Sor-Ost RHF), covering 3.1 million people, following a competitive procurement run by Sykehusinnkjop HF. Norway aims to raise timely retinal exam coverage for people with diabetes from about 55% to over 95%.",
    source: "Eyenuk (press release, also distributed via GlobeNewswire)",
    externalUrl:
      "https://www.eyenuk.com/us-en/articles/news/eyenuk-secures-worlds-first-national-health-system-deployment-of-autonomous-ai-eye-screening-technology/",
    company: "eyenuk",
  },
  {
    slug: "raydiant-oximetry-names-michael-nagel-ceo-founder-neil-ray",
    title:
      "Raydiant Oximetry names Michael Nagel CEO; founder Neil Ray moves to advisory role",
    type: "Portfolio News",
    date: "2025-09-16",
    excerpt:
      "Michael Nagel, previously CEO of Vomaris Innovations (acquired by Arthrex), was appointed CEO to lead the company into device commercialization. Founder Neil P. Ray, MD transitioned to a strategic advisor role after eight years leading the company.",
    source: "EIN Presswire",
    externalUrl:
      "https://www.einpresswire.com/article/849323829/raydiant-oximetry-names-michael-nagel-to-lead-the-company-into-its-device-commercialization-stage-as-ceo",
    company: "raydiant-oximetry",
  },
  {
    slug: "fda-grants-ide-approval-for-venovas-venos-3-pivotal",
    title:
      "FDA grants IDE approval for Venova's VENOS-3 pivotal study of the Velocity pAVF System",
    type: "Portfolio News",
    date: "2025-08-21",
    excerpt:
      "The FDA approved an Investigational Device Exemption for VENOS-3, a prospective, multi-center, single-arm pivotal trial of up to 126 patients with advanced or end-stage kidney disease, following review of positive results from the VENOS-1 and VENOS-2 feasibility studies. VENOS-3 is intended as the primary clinical support for a future FDA marketing submission.",
    source: "Venova Medical (company press release)",
    externalUrl:
      "https://venovamedical.com/2025/08/venos-3-study-ide-approval/",
    company: "venova-medical",
  },
  {
    slug: "aria-cv-device-design-and-preclinical-early-human-data",
    title:
      "Aria CV device design and preclinical/early human data published in Pulmonary Circulation",
    type: "Portfolio News",
    date: "2025-07-29",
    excerpt:
      "A peer-reviewed paper led by Aria CV co-founder Karl Vollmers described development of the pulmonary endovascular device (a 20-cc implanted balloon, catheter and subcutaneous gas reservoir) and reported roughly 0.4 mL/mmHg augmentation of pulmonary arterial compliance, consistent with earlier human prototype results. In vitro, animal and 46-patient CT anatomic analyses supported the ASPIRE PH trial design.",
    source: "Pulmonary Circulation (PMC)",
    externalUrl:
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC12307243/",
    company: "aria-cv",
  },
  {
    slug: "barda-awards-rivanna-nearly-10-million-to-accelerate-the",
    title:
      "BARDA awards RIVANNA nearly $10 million to accelerate the CADe/x AI module for Accuro XV",
    type: "Portfolio News",
    date: "2025-07-28",
    excerpt:
      "BARDA awarded $9.92 million to fund development of CADe/x, an AI module for automated detection of anatomical abnormalities and bone fracture diagnosis on Accuro XV. The company said total contract funding exceeds $52 million to date, with potential to reach over $91 million if all options are exercised.",
    source: "Rivanna Medical",
    externalUrl:
      "https://rivannamedical.com/barda-awards-nearly-10-million-to-rivanna-to-accelerate-development-of-cade-x-ai-module-for-accuro-xv/",
    company: "rivanna-medical",
  },
  {
    slug: "fda-clears-rivannas-accuro-3s-ultrasound-system-and-spinenav",
    title:
      "FDA clears RIVANNA's Accuro 3S ultrasound system and SpineNav-AI software",
    type: "Portfolio News",
    date: "2025-07-15",
    excerpt:
      "FDA granted 510(k) clearance to the Accuro 3S portable ultrasound system and the SpineNav-AI machine-learning image processing software for anatomical guidance during needle or catheter placement. SpineNav-AI provides automated landmark detection, spinal anatomy identification and epidural space depth measurement.",
    source: "Rivanna Medical",
    externalUrl:
      "https://rivannamedical.com/rivannas-ultrasound-guidance-platform-and-ai-driven-imaging-software-receive-fda-510k-clearance/",
    company: "rivanna-medical",
  },
  {
    slug: "cerapedics-wins-fda-premarket-approval-for-pearlmatrix-p-15",
    title:
      "Cerapedics wins FDA premarket approval for PearlMatrix P-15 bone graft in lumbar fusion",
    type: "Portfolio News",
    date: "2025-06-23",
    excerpt:
      "FDA granted premarket approval (PMA) to PearlMatrix P-15 Peptide Enhanced Bone Graft as a Class III drug-device combination product for single-level transforaminal lumbar interbody fusion (TLIF) in adults with degenerative disc disease. Approval was supported by the ASPIRE pivotal IDE study across 33 U.S. centers and 293 patients, roughly 60% of whom were high risk for non-union.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/cerapedics-announces-fda-approval-of-pearlmatrix-p-15-peptide-enhanced-bone-graft-the-first-and-only-proven-bone-growth-accelerator-for-lumbar-fusion-302488379.html",
    company: "cerapedics",
  },
  {
    slug: "leva-pelvic-health-system-becomes-available-to-female-veterans",
    title:
      "Leva Pelvic Health System becomes available to female veterans through federal healthcare providers",
    type: "Portfolio News",
    date: "2025-05-21",
    excerpt:
      "Leva became accessible to female veterans via the Veterans Health Administration, VA Community Care Network and Military Health System, through the VA Federal Supply Schedule and DoD Distribution and Pricing Agreement in partnership with Lovell Government Services. Roughly 20% of female veterans experience urinary incontinence.",
    source: "Axena Health (company press release)",
    externalUrl:
      "https://axenahealth.com/2025/05/axena-healths-leva-pelvic-health-system-now-available-to-female-veterans-through-federal-healthcare-providers/",
    company: "axena-health",
  },
  {
    slug: "ge-healthcare-and-raydiant-oximetry-form-joint-development-initiative",
    title:
      "GE HealthCare and Raydiant Oximetry form joint development initiative on fetal oxygen saturation monitoring",
    type: "Portfolio News",
    date: "2025-05-13",
    excerpt:
      "The two companies announced a joint development initiative to co-develop solutions integrating Raydiant's Lumerah fetal pulse oximetry technology into GE HealthCare's fetal monitoring and digital perinatal surveillance platforms. Terms were not disclosed.",
    source: "Raydiant Oximetry / Business Wire",
    externalUrl:
      "https://raydiantoximetry.com/ge-healthcare-and-raydiant-oximetry-accelerate-innovation-in-fetal-oxygen-saturation-technology/",
    company: "raydiant-oximetry",
  },
  {
    slug: "corflow-appoints-former-waters-ceo-chris-oconnell-as-chairman",
    title:
      "CorFlow appoints former Waters CEO Chris O'Connell as Chairman of the Board",
    type: "Portfolio News",
    date: "2025-05-06",
    excerpt:
      "CorFlow named Chris O'Connell, a 21-year Medtronic veteran who served as EVP and President of the Restorative Therapies Group before becoming CEO of Waters Corporation, as Chairman of the Board, succeeding Rick Geoffrion, who remains a director. The appointment came as the company executed on its Series B objectives including the FDA IDE trial.",
    source: "BioSpace (CorFlow press release)",
    externalUrl:
      "https://www.biospace.com/press-releases/corflow-therapeutics-appoints-chris-oconnell-as-chairman-of-the-board-of-directors",
    company: "corflow",
  },
  {
    slug: "illumicell-ai-raises-2m-pre-seed-for-real-time",
    title:
      "IllumiCell AI raises $2M pre-seed for real-time AI male fertility diagnostics platform",
    type: "Portfolio News",
    date: "2025-04-10",
    excerpt:
      "The Boston-based startup raised $2 million pre-seed from investors including KOFA Healthcare, Harvard Phoenix Venture Fund and MedTechSyndicates to develop a portable lab scanner and AI platform for fluid-based diagnostics starting with semen analysis. The company reported over 400,000 datapoints collected and an FDA submission planned for 2026.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/illumicell-ai-raises-2m-pre-seed-to-launch-real-time-ai-platform-for-male-fertility-diagnostics-302425546.html",
    company: "illumicell-ai",
  },
  {
    slug: "kofa-healthcare-backs-illumicell-ais-2m-pre-seed-for",
    title:
      "KOFA Healthcare backs illumicell AI's $2M pre-seed for point-of-care male fertility diagnostics",
    type: "KOFA News",
    date: "2025-04-10",
    excerpt:
      "illumicell AI raised $2 million in pre-seed funding to build a portable lab scanner and real-time AI platform for fluid-based diagnostics, starting with male fertility. KOFA Healthcare is named as an investor alongside Harvard Phoenix Venture Fund and MedTechSyndicates.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/illumicell-ai-raises-2m-pre-seed-to-launch-real-time-ai-platform-for-male-fertility-diagnostics-302425546.html",
  },
  {
    slug: "zafrens-adds-imec-xpand-to-series-a-syndicate-bringing",
    title:
      "Zafrens adds imec.xpand to Series A syndicate, bringing total raised to $31 million",
    type: "Portfolio News",
    date: "2025-02-04",
    excerpt:
      "Zafrens welcomed imec.xpand into its Series A syndicate alongside existing investors Prime Movers Lab, KOFA Healthcare and Global Brain, bringing total capital raised to $31 million. Funds go toward expanding Z-Screen capacity and adding pharma partnerships across small molecules, cell therapies and antibodies.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/zafrens-expands-investor-syndicate-to-scale-revolutionary-drug-discovery-platform-302367633.html",
    company: "zafrens",
  },
  {
    slug: "kofa-healthcare-among-existing-investors-as-zafrens-expands-31m",
    title:
      "KOFA Healthcare among existing investors as Zafrens expands $31M Series A syndicate with imec.xpand",
    type: "KOFA News",
    date: "2025-02-04",
    excerpt:
      "Drug discovery platform company Zafrens announced that imec.xpand joined its Series A syndicate, bringing the round to USD 31 million. Kofa Healthcare is named as an existing investor alongside Prime Movers Lab and Global Brain.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/zafrens-expands-investor-syndicate-to-scale-revolutionary-drug-discovery-platform-302367633.html",
  },
  {
    slug: "caretaker-medical-wins-525-000-grand-prize-in-nih",
    title:
      "Caretaker Medical wins $525,000 grand prize in NIH RADx Tech for Maternal Health Challenge",
    type: "Portfolio News",
    date: "2024-10-18",
    excerpt:
      "The NIH awarded Caretaker Medical the $525,000 grand prize in its RADx Tech for Maternal Health Challenge for VitalStream's application to postpartum monitoring, covering heart rate, blood pressure, respiration, cardiac output and stroke volume to flag hypertension, hemorrhage and sepsis.",
    source: "Caretaker Medical (company press release)",
    externalUrl:
      "https://caretakermedical.net/blog/caretaker-medical-awarded-the-grand-prize-in-nih-radx-tech-for-maternal-health-challenge/",
    company: "caretaker-medical",
  },
  {
    slug: "kofa-healthcare-participates-in-corflow-therapeutics-eur-44m-series",
    title:
      "KOFA Healthcare participates in CorFlow Therapeutics' EUR 44M Series B",
    type: "KOFA News",
    date: "2024-09-10",
    excerpt:
      "Swiss medtech CorFlow Therapeutics closed a EUR 44 million Series B co-led by Broadview Ventures and Panakes Partners to fund the MOCA II pivotal study of its CoFI system for microvascular obstruction in heart attack patients. KOFA Healthcare is named in the participating syndicate.",
    source: "Business Wire",
    externalUrl:
      "https://www.businesswire.com/news/home/20240910783655/en/CorFlow-Therapeutics-AG-Completes-%E2%82%AC44-Million-Series-B-Financing-to-Support-the-Advancement-of-a-Novel-Diagnostic-and-Drug-Delivery-Platform-for-Microvascular-Obstruction-MVO-in-Heart-Attack-Patients",
  },
  {
    slug: "venova-medical-announces-30m-series-b-and-adds-catalysts",
    title:
      "Venova Medical announces $30M Series B and adds Catalyst's Darshana Zaveri to the board",
    type: "Portfolio News",
    date: "2024-09-04",
    excerpt:
      "Venova Medical announced a $30 million Series B co-led by Catalyst Health Ventures and an unnamed leading medical device company, with participation from ShangBay Capital, Mirae Asset Capital, KOFA Healthcare, Cadence Healthcare Ventures and Aphelion Capital. The capital funds development of the Velocity pAVF System and US clinical trials toward FDA approval; Darshana Zaveri of Catalyst joined the board.",
    source: "PRWeb",
    externalUrl:
      "https://www.prweb.com/releases/venova-medical-announces-30-million-series-b-financing-and-appointment-of-new-board-member-302237584.html",
    company: "venova-medical",
  },
  {
    slug: "kofa-healthcare-invests-in-venova-medicals-30m-series-b",
    title:
      "KOFA Healthcare invests in Venova Medical's $30M Series B for percutaneous AV fistula technology",
    type: "KOFA News",
    date: "2024-09-04",
    excerpt:
      "Venova Medical announced the initial close of a $30 million Series B co-led by Catalyst Health Ventures and an unnamed leading medical device company, funding US clinical studies of its Velocity System for hemodialysis vascular access. KOFA Healthcare is named among the participating investors.",
    source: "Venova Medical (company press release)",
    externalUrl:
      "https://venovamedical.com/2024/09/venova-series-b-financing/",
  },
  {
    slug: "virginia-catalyst-awards-caretaker-medical-800-000-grant-for",
    title:
      "Virginia Catalyst awards Caretaker Medical $800,000 grant for VitalStream AI development",
    type: "Portfolio News",
    date: "2024-07-15",
    excerpt:
      "Caretaker Medical received an $800,000 Virginia Catalyst (VBHRC) Round 16 grant to build physiological and biobehavioral AI models on the FDA-cleared VitalStream platform, in collaboration with researchers at UVA and Virginia Tech, aimed at reducing readmission risk.",
    source: "Caretaker Medical (company press release)",
    externalUrl:
      "https://caretakermedical.net/blog/virginia-catalyst-grant/",
    company: "caretaker-medical",
  },
  {
    slug: "nectero-closes-96-million-series-d-led-by-norwest",
    title:
      "Nectero closes $96 million Series D led by Norwest with Boston Scientific participating",
    type: "Portfolio News",
    date: "2024-04-11",
    excerpt:
      "Nectero completed a $96 million Series D led by Norwest Venture Partners with participation from Boston Scientific, BioStar Capital, Cadence Healthcare Ventures and Aphelion Capital. Proceeds fund execution of the Phase II/III stAAAble trial and an eventual NDA submission for the Nectero EAST System.",
    source: "BusinessWire",
    externalUrl:
      "https://necterotherapeutics.com/nectero-medical-announces-completion-of-96m-series-d-financing/",
    company: "nectero-medical",
  },
  {
    slug: "nectero-initiates-phase-ii-iii-staaable-trial-of-the",
    title:
      "Nectero initiates Phase II/III stAAAble trial of the EAST System in small- to medium-sized AAA",
    type: "Portfolio News",
    date: "2024-01-18",
    excerpt:
      "The stAAAble trial will randomize 400 patients across multiple U.S. sites to the Nectero EAST System versus active surveillance for infrarenal AAAs of 3.5-5.0 cm. Primary endpoints include a composite of AAA-related death, rupture and repair, with aneurysm diameter growth measured over 24 months and annual follow-up through year five.",
    source: "Nectero Therapeutics",
    externalUrl:
      "https://necterotherapeutics.com/nectero-medical-announces-initiation-of-phase-ii-iii-clinical-trial-of-the-nectero-east-system-for-treatment-of-small-to-medium-sized-abdominal-aortic-aneurysms/",
    company: "nectero-medical",
  },
  {
    slug: "zafrens-launches-out-of-stealth-with-23m-led-by",
    title:
      "Zafrens launches out of stealth with $23M led by Prime Movers Lab for its Z-Screen drug discovery platform",
    type: "Portfolio News",
    date: "2023-12-11",
    excerpt:
      "Zafrens emerged from stealth with $23 million led by Prime Movers Lab, with BlueYard Capital, KOFA Healthcare, Global Brains, FoundersX Ventures, Alix Ventures, Possible Ventures, Iaso Ventures and Hawktail participating. Z-Screen replaces the 96-well format with chips of 50,000-200,000 microwells carrying integrated imaging and single-cell multi-omic readout.",
    source: "Business Wire",
    externalUrl:
      "https://www.businesswire.com/news/home/20231211060698/en/Zafrens-Launches-with-$23M-in-Financing-to-Advance-Multiple-Stages-of-Drug-Discovery-in-a-Single-Experiment-at-Unprecedented-Scale",
    company: "zafrens",
  },
  {
    slug: "biospectal-optibp-receives-ce-mark-first-smartphone-only-blood",
    title:
      "Biospectal OptiBP receives CE Mark, first smartphone-only blood pressure monitoring app to do so",
    type: "Portfolio News",
    date: "2023-12-06",
    excerpt:
      "Biospectal secured European CE MDR Class IIa medical device certification for OptiBP, its optical fingertip blood pressure measurement app, described as the first software-only smartphone blood pressure solution to receive a CE Mark. An Android release for Switzerland, Germany, Austria and France was slated for early 2024.",
    source: "Business Wire",
    externalUrl:
      "https://www.businesswire.com/news/home/20231206304751/en/Biospectal-OptiBP-Receives-First-Ever-CE-Mark-for-a-Smartphone-Blood-Pressure-Monitoring-App",
    company: "biospectal",
  },
  {
    slug: "fda-grants-breakthrough-therapy-designation-to-the-nectero-east",
    title:
      "FDA grants Breakthrough Therapy designation to the Nectero EAST System for infrarenal AAA",
    type: "Portfolio News",
    date: "2023-11-01",
    excerpt:
      "FDA granted Breakthrough Therapy designation to the Nectero EAST System for patients with infrarenal AAAs measuring 3.5-5.0 cm, enabling more frequent FDA interaction and priority review eligibility. The designation followed Fast Track status granted in August 2023 and first-in-human data on single-dose pentagalloyl glucose (PGG).",
    source: "Nectero Therapeutics",
    externalUrl:
      "https://necterotherapeutics.com/nectero-medical-granted-breakthrough-therapy-designation-for-the-nectero-east-system-to-treat-infrarenal-aaa/",
    company: "nectero-medical",
  },
  {
    slug: "rebalance-hf-misses-in-overall-hfpef-population-but-identifies",
    title:
      "REBALANCE-HF misses in overall HFpEF population but identifies a responder subgroup",
    type: "Portfolio News",
    date: "2023-10-11",
    excerpt:
      "The sham-controlled REBALANCE-HF randomized trial of greater splanchnic nerve ablation showed no significant hemodynamic or clinical benefit in the overall HFpEF population, but roughly 55% of patients formed a responder subgroup with greater gains in exercise capacity. The procedure had a 98% treatment success rate with no difference in serious adverse events versus sham.",
    source: "TCTMD",
    externalUrl:
      "https://www.tctmd.com/news/rebalance-hf-uncovers-hfpef-group-responds-splanchnic-nerve-ablation",
    company: "axon-therapies",
  },
  {
    slug: "axon-presents-late-breaking-rebalance-hf-data-at-hfsa",
    title:
      "Axon presents late-breaking REBALANCE-HF data at HFSA characterizing likely SAVM responders",
    type: "Portfolio News",
    date: "2023-10-08",
    excerpt:
      "Axon reported 6-month REBALANCE-HF results showing the full cohort did not improve versus sham, while a responder subgroup of more than half of participants saw a 13-point KCCQ quality-of-life gain and a 36-meter improvement in six-minute walk distance. The Splanchnic Ablation for Volume Management procedure averaged 53 minutes with a 98% success rate and no excess adverse events.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/late-breaking-data-confirms-safety-of-axon-therapies-innovative-heart-failure-procedure-and-identifies-patients-most-likely-to-benefit-from-savm-therapy-301950021.html",
    company: "axon-therapies",
  },
  {
    slug: "first-real-world-observational-study-of-the-jada-system",
    title:
      "First real-world observational study of the Jada System published in ACOG's Obstetrics & Gynecology",
    type: "Portfolio News",
    date: "2023-09-14",
    excerpt:
      "The RUBY study of 800 patients across 16 U.S. hospitals reported treatment success of 92.5% in vaginal births and 83.7% in cesarean births, with three serious adverse device events (0.4% in each delivery group), all resolved. Lower pre-insertion blood loss correlated with reduced severe maternal morbidity.",
    source: "Organon",
    externalUrl:
      "https://www.organon.com/news/first-real-world-observational-study-of-the-jadasystem-a-medical-device-to-control-postpartum-hemorrhage-pph-published-in-acogs-obstetrics-gynecology/",
    company: "alydia-health",
  },
  {
    slug: "marrow-access-partners-with-spartan-medical-to-bring-smartshot",
    title:
      "Marrow Access partners with Spartan Medical to bring SmartShot to VA and DoD patients",
    type: "Portfolio News",
    date: "2023-08-29",
    excerpt:
      "Marrow Access signed a distribution agreement with Spartan Medical, a service-disabled veteran-owned business, to make the SmartShot Marrow Access Device available across the Veterans Health Administration and Department of Defense, a market serving over 9.1 million veterans. The release cited use in more than 1,500 patients at that point.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/marrow-access-technologies-partners-with-spartan-medical-to-provide-novel-cartilage-repair-therapy-to-us-veterans-and-department-of-defense-service-members-301911582.html",
    company: "marrow-access",
  },
  {
    slug: "barda-awards-rivanna-30-5-million-to-advance-the",
    title:
      "BARDA awards RIVANNA $30.5 million to advance the Accuro XV musculoskeletal imaging system",
    type: "Portfolio News",
    date: "2023-07-27",
    excerpt:
      "BARDA committed $30.5 million over 39 months, with options for up to $56.4 million more, to develop Accuro XV with AI-enabled fracture and soft tissue injury detection. The award was an early option exercise following an $11.6 million base contract from 2021 after RIVANNA hit base-stage milestones ahead of schedule.",
    source: "Rivanna Medical",
    externalUrl:
      "https://rivannamedical.com/rivanna-receives-30-5-million-from-barda-to-advance-the-accuro-xv-musculoskeletal-imaging-system/",
    company: "rivanna-medical",
  },
  {
    slug: "fda-clears-eyeart-v2-2-0-for-use-with",
    title:
      "FDA clears EyeArt v2.2.0 for use with Topcon NW400, making Eyenuk the first AI system cleared across multiple camera makers",
    type: "Portfolio News",
    date: "2023-06-22",
    excerpt:
      "Eyenuk received FDA clearance to use the Topcon NW400 retinal camera with EyeArt, adding to previously cleared Canon CR-2 AF and CR-2 Plus AF models. Clinical data cited 94.4% sensitivity and 91.1% specificity for more-than-mild diabetic retinopathy, with conclusive results in 90.4% of cases without dilation.",
    source: "Eyenuk (press release, also on PR Newswire)",
    externalUrl:
      "https://www.eyenuk.com/us-en/articles/news/eyenuk-fda-multiple-cameras/",
    company: "eyenuk",
  },
  {
    slug: "independent-global-health-study-finds-optibp-accurate-across-low",
    title:
      "Independent global health study finds OptiBP accurate across low-resource settings in South Africa, Tanzania and Bangladesh",
    type: "Portfolio News",
    date: "2023-05-25",
    excerpt:
      "An independent validation study published in npj Digital Medicine compared OptiBP smartphone readings against auscultatory cuff measurements across three countries, including pregnant participants in South Africa, and supported the app's accuracy in low-resource settings.",
    source: "Business Wire",
    externalUrl:
      "https://www.businesswire.com/news/home/20230525005374/en/Global-Health-Study-Validates-Biospectal-OptiBP-Mobile-Blood-Pressure-Measurement-App-Accuracy-Across-Diverse-Settings",
    company: "biospectal",
  },
  {
    slug: "axon-reports-6-month-durability-of-savm-benefit-in",
    title:
      "Axon reports 6-month durability of SAVM benefit in REBALANCE-HF roll-in cohort",
    type: "Portfolio News",
    date: "2023-03-22",
    excerpt:
      "In the 26-patient roll-in cohort of REBALANCE-HF, patients showed sustained reductions in exercise pulmonary capillary wedge pressure and continued gains in functional capacity and health status from month 1 through month 6, with a strong safety profile. Data were presented at THT 2023.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/axon-therapies-cohort-study-extends-benefit-to-6-months-with-early-clinical-data-from-rebalance-hf-randomized-clinical-trial-301778047.html",
    company: "axon-therapies",
  },
  {
    slug: "marrow-access-launches-smartshot-ankle-for-ankle-cartilage-repair",
    title:
      "Marrow Access launches SmartShot Ankle for ankle cartilage repair in the U.S.",
    type: "Portfolio News",
    date: "2023-03-22",
    excerpt:
      "Marrow Access released an ankle-specific configuration of the SmartShot marrow access device for cartilage lesions of the ankle joint. A University of Pennsylvania study cited in the release found the device 67% less disruptive to subchondral bone than traditional marrow stimulation techniques.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/marrow-access-technologies-announces-us-market-release-of-novel-cartilage-repair-solution-for-ankle-301778048.html",
    company: "marrow-access",
  },
  {
    slug: "eyenuk-raises-26-million-series-a-led-by-axa",
    title:
      "Eyenuk raises $26 million Series A led by AXA IM Alts",
    type: "Portfolio News",
    date: "2022-10-17",
    excerpt:
      "Eyenuk closed a $26 million Series A led by AXA IM Alts with participation from T&W Medical A/S and Kendall Capital Partners, bringing total funding above $43 million. The round added three board members, including Rob Binney as Board Chair.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/eyenuk-secures-26-million-series-a-funding-to-accelerate-global-access-to-ai-powered-eye-screening-technology-301650302.html",
    company: "eyenuk",
  },
  {
    slug: "biospectal-raises-4-3m-seed-round-led-by-seedlink",
    title:
      "Biospectal raises $4.3M seed round led by SeedLink",
    type: "Portfolio News",
    date: "2021-07-21",
    excerpt:
      "Biospectal closed $4.3 million in seed funding led by digital health investor SeedLink, with participation from LabCorp, Athensmed, Privilege Ventures and other European and US investors, to scale OptiBP globally.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/biospectal-raises-4-3m-seed-funding-led-by-digital-health-investor-seedlink-301338321.html",
    company: "biospectal",
  },
  {
    slug: "marrow-access-announces-full-u-s-market-release-of",
    title:
      "Marrow Access announces full U.S. market release of the SmartShot Marrow Access Device",
    type: "Portfolio News",
    date: "2021-07-07",
    excerpt:
      "Marrow Access moved SmartShot from limited to full U.S. market release at the AOSSM annual meeting, covering knee, shoulder, ankle, hip and elbow. The device creates 1 mm microneedle channels into bone to release blood and marrow stem cells and stimulate cartilage, ligament and tendon healing.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/marrow-access-technologies-announces-the-full-us-market-release-of-the-smartshot-marrow-access-device-301326683.html",
    company: "marrow-access",
  },
  {
    slug: "organon-completes-240-million-acquisition-of-alydia-health",
    title:
      "Organon completes $240 million acquisition of Alydia Health",
    type: "Portfolio News",
    date: "2021-06-16",
    excerpt:
      "Organon closed its acquisition of Alydia Health for total consideration of $240 million, comprising $215 million in cash ($50 million paid by Merck at signing in March 2021 and $165 million by Organon at close) plus a $25 million contingent milestone payment. The deal brought the FDA-cleared Jada System into Organon's portfolio.",
    source: "Organon",
    externalUrl:
      "https://www.organon.com/news/organon-completes-acquisition-of-alydia-health-a-medical-device-company-focused-on-postpartum-hemorrhage/",
    company: "alydia-health",
  },
  {
    slug: "gates-foundation-and-grand-challenges-canada-fund-two-independent",
    title:
      "Gates Foundation and Grand Challenges Canada fund two independent OptiBP validation studies in four countries",
    type: "Portfolio News",
    date: "2021-05-20",
    excerpt:
      "Biospectal announced two independent studies funded by the Bill & Melinda Gates Foundation and Grand Challenges Canada's Saving Lives at Birth, covering South Africa, Tanzania, Bangladesh and Indonesia, focused on routine blood pressure monitoring and hypertensive disorders of pregnancy.",
    source: "PR Newswire",
    externalUrl:
      "https://www.prnewswire.com/news-releases/biospectal-announces-two-independent-global-health-research-and-validation-studies-using-biospectal-optibp-blood-pressure-measurement-app-301295694.html",
    company: "biospectal",
  },
  {
    slug: "fda-clears-eyeart-as-first-autonomous-ai-system-to",
    title:
      "FDA clears EyeArt as first autonomous AI system to detect both more-than-mild and vision-threatening diabetic retinopathy in one test",
    type: "Portfolio News",
    date: "2020-08-05",
    excerpt:
      "Eyenuk received FDA 510(k) clearance for the EyeArt Autonomous AI System for diabetic retinopathy screening, the first cleared autonomous AI able to detect both mtmDR and vtDR in a single test, with results in under a minute in primary care and eye care settings.",
    source: "Eyenuk (press release, also on Business Wire)",
    externalUrl:
      "https://www.eyenuk.com/us-en/articles/news/eyenuk-announces-eyeart-fda-clearance",
    company: "eyenuk",
  },
  {
    slug: "aria-cv-raises-31m-series-b-to-fund-first",
    title:
      "Aria CV raises $31M Series B to fund first US clinical study of its PAH implant",
    type: "Portfolio News",
    date: "2020-02-27",
    excerpt:
      "Aria CV completed a $31 million Series B led by Xeraya Capital, with Longview Ventures, Catalyst Health Ventures, BioStar Ventures, Cedar Point Capital, Frontcourt Group and three strategic investors participating. The round funded the FDA early feasibility study of the Aria CV Pulmonary Hypertension System and followed the device's FDA Breakthrough Device Designation by about one week.",
    source: "Diagnostic and Interventional Cardiology (DAIC)",
    externalUrl:
      "https://www.dicardiology.com/content/aria-cv-pulmonary-hypertension-acquires-31-million-feasibility-study",
    company: "aria-cv",
  },
];

/* --- Selectors ----------------------------------------------------------- */

export const newsSorted = [...news].sort((a, b) =>
  a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
);

export const kofaNews = newsSorted.filter((n) => n.type === "KOFA News");
export const portfolioNews = newsSorted.filter(
  (n) => n.type === "Portfolio News",
);

export function getNews(slug: string): NewsItem | undefined {
  return news.find((n) => n.slug === slug);
}

/** Powers "Latest from [Company]" on each portfolio detail page. */
export function newsForCompany(companySlug: string): NewsItem[] {
  return newsSorted.filter((n) => n.company === companySlug);
}

/** Companies that actually have news, for the news-page filter. */
export function companiesWithNews(): string[] {
  return [...new Set(newsSorted.map((n) => n.company).filter(Boolean))] as string[];
}

export function relatedNews(item: NewsItem, limit = 3): NewsItem[] {
  const sameCompany = item.company
    ? newsSorted.filter((n) => n.company === item.company && n.slug !== item.slug)
    : [];
  const sameType = newsSorted.filter(
    (n) => n.type === item.type && n.slug !== item.slug && !sameCompany.includes(n),
  );
  return [...sameCompany, ...sameType].slice(0, limit);
}

export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
