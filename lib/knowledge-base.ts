export interface ActiveCompound {
  name: string;
  herbs: string[];
  category: string;
}

export const ACTIVE_COMPOUNDS: ActiveCompound[] = [
  { name: "Curcumin", herbs: ["turmeric", "curcuma longa"], category: "Curcuminoids" },
  { name: "Turmerone", herbs: ["turmeric", "curcuma longa"], category: "Sesquiterpenes" },
  { name: "Gingerol", herbs: ["ginger", "zingiber officinale"], category: "Phenols" },
  { name: "Shogaol", herbs: ["ginger", "zingiber officinale"], category: "Phenols" },
  { name: "Zingerone", herbs: ["ginger", "zingiber officinale"], category: "Phenols" },
  { name: "Hypericin", herbs: ["st. john's wort", "hypericum perforatum"], category: "Anthraquinones" },
  { name: "Hyperforin", herbs: ["st. john's wort", "hypericum perforatum"], category: "Phthalides" },
  { name: "Ginsenosides (Rb1, Rg1)", herbs: ["ginseng", "panax ginseng"], category: "Saponins" },
  { name: "Allicin", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds" },
  { name: "S-allyl cysteine", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds" },
  { name: "Silymarin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans" },
  { name: "Silibinin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans" },
  { name: "Ginkgolides", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids" },
  { name: "Bilobalide", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids" },
  { name: "Quercetin", herbs: ["onion", "apple", "capers", "berries"], category: "Flavonoids" },
  { name: "Rutin", herbs: ["apple", "buckwheat", "citrus"], category: "Flavonoids" },
  { name: "Epigallocatechin gallate (EGCG)", herbs: ["green tea", "camellia sinensis"], category: "Catechins" },
  { name: "L-theanine", herbs: ["green tea", "camellia sinensis"], category: "Amino Acids" },
  { name: "Berberine", herbs: ["berberine", "berberis vulgaris", "goldenseal"], category: "Alkaloids" },
  { name: "Withanolides", herbs: ["ashwagandha", "withania somnifera"], category: "Steroidal Lactones" },
  { name: "Withaferin A", herbs: ["ashwagandha", "withania somnifera"], category: "Steroidal Lactones" },
  { name: "Kavalactones", herbs: ["kava", "piper methysticum"], category: "Lactones" },
  { name: "Glycyrrhizin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Saponins" },
  { name: "Glabridin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Flavonoids" },
  { name: "Echinacoside", herbs: ["echinacea", "echinacea purpurea"], category: "Phenylpropanoids" },
  { name: "Valerenic acid", herbs: ["valerian", "valeriana officinalis"], category: "Sesquiterpenes" },
  { name: "Vincamine", herbs: ["valerian", "vinca minor"], category: "Alkaloids" },
  { name: "Flavonoids", herbs: ["*"], category: "Polyphenols" },
  { name: "Alkaloids", herbs: ["*"], category: "Alkaloids" },
  { name: "Terpenes", herbs: ["*"], category: "Terpenoids" },
  { name: "Tannins", herbs: ["*"], category: "Polyphenols" },
  { name: "Essential Oils", herbs: ["*"], category: "Volatile Compounds" },
];

export const HERB_ALIASES: Record<string, string[]> = {
  "ginkgo biloba": ["ginkgo", "EGb 761"],
  "ginseng": ["panax ginseng", "asian ginseng", "korean ginseng", "american ginseng", "ginsenoside"],
  "curcumin": ["curcumin", "turmeric", "curcuma longa", "diferuloylmethane"],
  "st. john's wort": ["hypericum perforatum", "saint john's wort", "hypericin", "hyperforin", "st john wort"],
  "garlic": ["allium sativum", "allicin"],
  "echinacea": ["echinacea purpurea", "echinacea angustifolia", "coneflower"],
  "valerian": ["valeriana officinalis"],
  "milk thistle": ["silybum marianum", "silymarin"],
  "kava": ["piper methysticum", "kavalactone"],
  "black cohosh": ["actaea racemosa", "cimicifuga"],
  "ginger": ["zingiber officinale", "gingerol"],
  "licorice": ["glycyrrhiza glabra", "glycyrrhizin"],
  "green tea": ["camellia sinensis", "epigallocatechin", "egcg"],
  "berberine": ["berberis vulgaris"],
  "ashwagandha": ["withania somnifera", "withanolide"],
};

export const HIGH_IMPACT_JOURNALS = [
  "new england journal of medicine", "nejm", "lancet", "jama", "bmj",
  "nature", "science", "cell", "annals of internal medicine", "circulation",
  "journal of the american college of cardiology", "clinical pharmacology",
  "british journal of clinical pharmacology", "european journal of clinical pharmacology",
  "drug metabolism", "pharmacotherapy", "journal of clinical pharmacology",
  "phytomedicine", "journal of ethnopharmacology", "clinical pharmacokinetics",
  "drug safety", "british journal of pharmacology",
];

export const MEDIUM_IMPACT_JOURNALS = [
  "plos", "evidence-based complementary", "complementary therapies",
  "alternative medicine", "integrative medicine", "herbal medicine",
  "natural product", "phytotherapy", "pharmacognosy",
  "frontiers in pharmacology", "molecules", "nutrients",
  "international journal of molecular sciences", "biomedicines",
];

export const PHARM_ACTIONS = [
  "anti-inflammatory", "antioxidant", "antimicrobial", "antifungal", "antiviral",
  "anticoagulant", "antiplatelet", "antidiabetic", "antihypertensive", "anticancer",
  "hepatoprotective", "neuroprotective", "cardioprotective", "immunomodulatory",
  "anxiolytic", "sedative", "analgesic", "antipyretic", "adaptogenic",
  "antispasmodic", "diuretic", "expectorant", "astringent", "estrogenic",
];

export const MECH_KEYWORDS = [
  "nf-kb", "nf-κb", "cyp3a4", "cyp2d6", "cyp2c9", "cyp2c19", "cyp1a2",
  "p-glycoprotein", "cox-2", "cox-1", "tnf-alpha", "il-6", "il-1",
  "mtor", "pi3k", "mapk", "erk", "jak-stat", "nrf2", "apoptosis", "autophagy",
  "oxidative stress", "free radical", "ros", "nitric oxide", "no synthase",
  "serotonin reuptake", "monoamine oxidase", "acetylcholinesterase",
  "hmg-coa", "ppar", "amp kinase", "ampk",
];

export const EXAMPLE_SEARCHES = [
  { drug: "Warfarin", herb: "St. John's Wort" },
  { drug: "Cyclosporine", herb: "Ginkgo biloba" },
  { drug: "Metformin", herb: "Ginseng" },
  { drug: "Atorvastatin", herb: "Garlic" },
  { drug: "Tacrolimus", herb: "Curcumin" },
];

export const EXAMPLE_HERBS = [
  "St. John's Wort",
  "Ginkgo biloba",
  "Turmeric",
  "Ginseng",
  "Milk Thistle",
  "Garlic",
];

export const API_SOURCES = [
  { name: "PubMed", desc: "Biomedical Literature", color: "bg-blue-500" },
  { name: "CrossRef", desc: "DOI Resolution", color: "bg-indigo-500" },
  { name: "OpenAlex", desc: "Citation Metrics", color: "bg-violet-500" },
  { name: "OpenFDA", desc: "Drug Safety Labels", color: "bg-amber-500" },
  { name: "PubChem", desc: "Chemical Structures", color: "bg-cyan-500" },
  { name: "ChEBI", desc: "Biochemical Ontology", color: "bg-teal-500" },
  { name: "NPAtlas", desc: "Natural Product Atlas", color: "bg-lime-500" },
];

// ─── Chemical Structure Feature ───

/** Quick example compounds for the Chemical Structure page */
export const EXAMPLE_COMPOUNDS = [
  "Curcumin",
  "Quercetin",
  "Berberine",
  "EGCG",
  "Paclitaxel",
  "Aspirin",
  "Artemisinin",
  "Caffeine",
  "Resveratrol",
  "Morphine",
];

/** Map common natural product / drug queries to PubChem-friendly search terms */
export const COMPOUND_SEARCH_ALIASES: Record<string, string> = {
  // Herbs → main active compound
  "egcg": "Epigallocatechin gallate",
  "st. john's wort": "Hypericin",
  "turmeric": "Curcumin",
  "ginseng": "Ginsenoside Rb1",
  "garlic": "Allicin",
  "milk thistle": "Silymarin",
  "ginkgo": "Ginkgolide A",
  "ginkgo biloba": "Ginkgolide A",
  "ginger": "Gingerol",
  "licorice": "Glycyrrhizin",
  "green tea": "Epigallocatechin gallate",
  "ashwagandha": "Withaferin A",
  "kava": "Kavain",
  "echinacea": "Echinacoside",
  "valerian": "Valerenic acid",
  "black cohosh": "Actein",
  // Additional herbs & plants
  "rosemary": "Carnosic acid",
  "cinnamon": "Cinnamaldehyde",
  "pepper": "Piperine",
  "black pepper": "Piperine",
  "chili": "Capsaicin",
  "cayenne": "Capsaicin",
  "lavender": "Linalool",
  "chamomile": "Apigenin",
  "peppermint": "Menthol",
  "saffron": "Crocin",
  "aloe": "Aloe-emodin",
  "aloe vera": "Aloe-emodin",
  "neem": "Azadirachtin",
  "basil": "Ursolic acid",
  "thyme": "Thymol",
  "cloves": "Eugenol",
  "clove": "Eugenol",
  "coffee": "Caffeine",
  "cocoa": "Theobromine",
  "grapefruit": "Naringenin",
  "soy": "Genistein",
  "soybean": "Genistein",
  "broccoli": "Sulforaphane",
  "blueberry": "Anthocyanin",
  "pomegranate": "Ellagic acid",
  "red wine": "Resveratrol",
  "grapes": "Resveratrol",
  "olive oil": "Oleuropein",
  "willow": "Salicin",
  "willow bark": "Salicin",
  "opium": "Morphine",
  "opium poppy": "Morphine",
  "coca": "Cocaine",
  "cinchona": "Quinine",
  "foxglove": "Digoxin",
  "yew": "Paclitaxel",
  "pacific yew": "Paclitaxel",
  "sweet wormwood": "Artemisinin",
  "madagascar periwinkle": "Vinblastine",
  // Common drug abbreviations
  "tylenol": "Acetaminophen",
  "paracetamol": "Acetaminophen",
  "advil": "Ibuprofen",
  "motrin": "Ibuprofen",
  "aspirin": "Acetylsalicylic acid",
  "lipitor": "Atorvastatin",
  "zocor": "Simvastatin",
  "penicillin g": "Benzylpenicillin",
  "vitamin c": "Ascorbic acid",
  "vitamin e": "Alpha-tocopherol",
  "vitamin d": "Cholecalciferol",
  "vitamin a": "Retinol",
  "vitamin b1": "Thiamine",
  "vitamin b12": "Cyanocobalamin",
  "vitamin k": "Phylloquinone",
};

/**
 * Expand herb name into all known aliases.
 */
export function expandHerb(herb: string): string[] {
  const lower = (herb || '').toLowerCase();
  for (const [canonical, aliases] of Object.entries(HERB_ALIASES)) {
    if (lower.includes(canonical) || aliases.some((a) => lower.includes((a || '').toLowerCase()))) {
      return [canonical, ...aliases];
    }
  }
  return [herb];
}
