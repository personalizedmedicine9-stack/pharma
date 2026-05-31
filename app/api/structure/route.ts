import { NextRequest, NextResponse } from 'next/server';
import { COMPOUND_SEARCH_ALIASES, expandHerb } from '@/lib/knowledge-base';
import { correctAndNormalize } from '@/lib/spell-corrector';
import type { CompoundStructure, SpellingCorrection } from '@/lib/types';

/**
 * Chemical Structure API Route
 *
 * Retrieves chemical structure data for ANY compound from trusted scientific sources:
 *   1. PubChem PUG REST — compound search, structure, SMILES, InChI, molecular formula/weight
 *      Supports: compound name, CAS number, SMILES, InChI, InChIKey, PubChem CID
 *   2. ChEBI (EBI) — biochemical ontology, source organism, compound classification
 *   3. NPAtlas — natural product-specific metadata, source organism taxonomy
 *
 * Search input detection:
 *   - CAS Number:  \d{2,7}-\d{2}-\d  → PubChem name search (CAS is a synonym)
 *   - InChIKey:    [A-Z]{14}-[A-Z]{10}-[A-Z]  → PubChem InChIKey search
 *   - InChI:       InChI=...  → PubChem identity POST search
 *   - SMILES:      contains C/c/n/o/O/N/\[  → PubChem identity POST search
 *   - CID:         pure digits  → PubChem CID property fetch
 *   - Name:        everything else  → PubChem name search + synonym fallback
 *
 * Follows the same resilient pattern as /api/pharmacology:
 *   - Spelling correction & synonym normalization
 *   - AbortSignal timeouts on all fetches
 *   - Graceful fallback if any source is unavailable
 */

// ─── Search input type detection ───

type SearchInputType = 'name' | 'cas' | 'smiles' | 'inchi' | 'inchikey' | 'cid';

function detectSearchInputType(query: string): SearchInputType {
  const trimmed = query.trim();

  // CID: pure digits (1–9 digits, PubChem CIDs are in the 1–999999999 range)
  if (/^\d{1,9}$/.test(trimmed)) return 'cid';

  // InChIKey: 14 uppercase letters - 10 uppercase letters - 1 uppercase letter
  if (/^[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(trimmed)) return 'inchikey';

  // InChI: starts with "InChI="
  if (/^InChI=/i.test(trimmed)) return 'inchi';

  // CAS Number: XXXXX-XX-X
  if (/^\d{2,7}-\d{2}-\d$/.test(trimmed)) return 'cas';

  // SMILES detection: if it contains common SMILES characters like [ ] / \ @ # and
  // carbon/oxygen/nitrogen atoms in a pattern, treat as SMILES
  // A very simple heuristic: if the string contains typical SMILES bond/bracket notation
  if (/[\[\]\\\/=#@]/.test(trimmed) || /^[A-Za-z0-9@\[\]\\\/#+-=.()]+$/.test(trimmed)) {
    // But exclude simple chemical names like "Curcumin" or "H2O"
    // If it has numbers adjacent to letters (like C1=CC), likely SMILES
    if (/[CNcnOSoos]\d|[CNcnOSoos]\(|\([CNcnOSoos]/.test(trimmed) ||
        trimmed.includes('=') ||
        trimmed.includes('#') ||
        trimmed.includes('@@') ||
        trimmed.includes('\\') ||
        (trimmed.includes('[') && trimmed.includes(']'))) {
      return 'smiles';
    }
  }

  return 'name';
}

// ─── PubChem PUG REST helpers ───

interface PubChemPropertyResult {
  CID: number;
  MolecularFormula?: string;
  MolecularWeight?: string;
  IsomericSMILES?: string;
  CanonicalSMILES?: string;
  SMILES?: string;
  InChI?: string;
  InChIKey?: string;
  IUPACName?: string;
  Title?: string;
}

/**
 * Search PubChem by compound name (or CAS — CAS is just another name synonym),
 * return up to `maxResults` CIDs.
 */
async function searchPubChemByName(query: string, maxResults: number = 10): Promise<number[]> {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/JSON?MaxRecords=${maxResults}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.IdentifierList?.CID ?? [];
}

/**
 * Search PubChem by InChIKey.
 */
async function searchPubChemByInChIKey(inchiKey: string): Promise<number[]> {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchikey/${encodeURIComponent(inchiKey)}/cids/JSON`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.IdentifierList?.CID ?? [];
}

/**
 * Search PubChem by SMILES or InChI using identity (fast) or similarity endpoint.
 * Uses the PUG REST "fastidentity" endpoint for exact structure matching.
 */
async function searchPubChemByIdentity(smilesOrInchi: string): Promise<number[]> {
  // Determine if this is SMILES or InChI
  const isSMILES = !smilesOrInchi.trim().toLowerCase().startsWith('inchi=');
  const body = isSMILES
    ? { smarts: smilesOrInchi }  // Use smarts for SMILES
    : { inchi: smilesOrInchi };

  try {
    // Try fastidentity first (exact match)
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastidentity/${isSMILES ? 'smiles' : 'inchi'}/cids/JSON?identity_type=same_tautomer`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, MaxRecords: 10 }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const data = await res.json();
      const cids = data?.IdentifierList?.CID ?? [];
      if (cids.length > 0) return cids;
    }

    // Fallback: try the /compound/smiles or /compound/inchi endpoint
    const fallbackUrl = isSMILES
      ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smilesOrInchi)}/cids/JSON`
      : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchi/${encodeURIComponent(smilesOrInchi)}/cids/JSON`;
    const fallbackRes = await fetch(fallbackUrl, { signal: AbortSignal.timeout(12000) });
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      return fallbackData?.IdentifierList?.CID ?? [];
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Get PubChem CIDs by searching synonyms.
 * This is useful when the name search fails but a synonym might match.
 */
async function searchPubChemBySynonym(query: string, maxResults: number = 5): Promise<number[]> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/JSON?MaxRecords=${maxResults}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.IdentifierList?.CID ?? [];
  } catch {
    return [];
  }
}

/**
 * Get synonyms for a compound name from PubChem (for auto-suggest / fallback).
 */
async function getPubChemAutoComplete(query: string): Promise<string[]> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.autocomplete?.suggestions?.map((s: { name: string }) => s.name) ?? [];
  } catch {
    return [];
  }
}

/**
 * Get compound properties for given CIDs from PubChem.
 */
async function getPubChemProperties(cids: number[]): Promise<PubChemPropertyResult[]> {
  if (cids.length === 0) return [];
  const cidStr = cids.join(',');
  const props = 'MolecularFormula,MolecularWeight,IsomericSMILES,CanonicalSMILES,InChI,InChIKey,IUPACName,Title';
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cidStr}/property/${props}/JSON`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.PropertyTable?.Properties ?? [];
}

/**
 * Get synonyms and CAS numbers for a PubChem CID.
 */
async function getPubChemSynonyms(cid: number): Promise<{ casNumber: string; synonyms: string[] }> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/TXT`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { casNumber: '', synonyms: [] };
    const text = await res.text();
    const synonyms = text.split('\n').map(s => s.trim()).filter(Boolean);
    // Find CAS number (format: XXXXX-XX-X)
    const casRegex = /\b\d{2,7}-\d{2}-\d\b/;
    const casMatch = synonyms.find(s => casRegex.test(s));
    return { casNumber: casMatch || '', synonyms: synonyms.slice(0, 20) };
  } catch {
    return { casNumber: '', synonyms: [] };
  }
}

// ─── ChEBI helpers ───

interface ChEBIResult {
  chebiId: string;
  chebiAsciiName: string;
  sourceOrganism?: string;
  compoundClass?: string;
}

/**
 * Search ChEBI for a compound name, return the best match.
 */
async function searchChEBI(query: string): Promise<ChEBIResult | null> {
  try {
    const url = `https://www.ebi.ac.uk/chebi/api/data/search?query=${encodeURIComponent(query)}&maxResults=1&stars=3`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data?.searchResults?.[0];
    if (!hit) return null;

    // Get detailed ChEBI entry for source organism and compound class
    let sourceOrganism = '';
    let compoundClass = '';
    try {
      const detailUrl = `https://www.ebi.ac.uk/chebi/api/data/completeEntity?chebiId=${hit.chebiId}`;
      const detailRes = await fetch(detailUrl, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (detailRes.ok) {
        const detail = await detailRes.json();
        // Extract source organism from CompoundOrigins
        const origins = detail?.CompoundOrigins ?? [];
        if (origins.length > 0) {
          const org = origins[0];
          sourceOrganism = org?.speciesText || org?.species || org?.source || '';
        }
        // Extract compound class from OntologyParents
        const parents = detail?.OntologyParents ?? [];
        if (parents.length > 0) {
          compoundClass = parents
            .map((p: { chebiAsciiName?: string }) => p.chebiAsciiName || '')
            .filter(Boolean)
            .slice(0, 3)
            .join(', ');
        }
      }
    } catch {
      // ChEBI detail fetch failed — continue without it
    }

    return {
      chebiId: hit.chebiId || '',
      chebiAsciiName: hit.chebiAsciiName || '',
      sourceOrganism,
      compoundClass,
    };
  } catch {
    return null;
  }
}

// ─── NPAtlas helpers ───

interface NPAtlasResult {
  name: string;
  sourceOrganism: string;
  compoundClass: string;
  smiles: string;
  inchiKey: string;
  reference: string;
}

/**
 * Search NPAtlas for natural product compounds.
 */
async function searchNPAtlas(query: string): Promise<NPAtlasResult[]> {
  try {
    const url = `https://www.npatlas.org/api/v1/compounds?name=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((item: Record<string, unknown>) => ({
      name: (item.name as string) || '',
      sourceOrganism: (item.origin_organism as string) || '',
      compoundClass: (item.molecule_type as string) || '',
      smiles: (item.smiles as string) || '',
      inchiKey: (item.inchikey as string) || '',
      reference: (item.doi as string) || '',
    }));
  } catch {
    return [];
  }
}

// ─── PubMed reference helper ───

/**
 * Get up to 5 PMIDs related to a compound name from PubMed.
 */
async function getCompoundPubmedRefs(compoundName: string): Promise<string[]> {
  try {
    const query = `"${compoundName}"[Title/Abstract] AND (natural product[Title/Abstract] OR phytochemistry[Title/Abstract] OR structure[Title/Abstract])`;
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json&sort=relevance&tool=PharmaInsight&email=research@pharmainsight.dev`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.esearchresult?.idlist ?? [];
  } catch {
    return [];
  }
}

// ─── 3D Conformer helper ───

/**
 * Get the first 3D conformer ID for a PubChem CID.
 * PubChem stores 3D conformers for many compounds.
 */
async function get3DConformerId(cid: number): Promise<string> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/conformers/JSON?max_records=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return '';
    const data = await res.json();
    const conformerIds = data?.ConformerList?.ConformerID ?? [];
    return conformerIds.length > 0 ? String(conformerIds[0]) : '';
  } catch {
    return '';
  }
}

// ─── Main handler ───

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Compound name, CAS number, SMILES, InChI, InChIKey, or CID is required.' }, { status: 400 });
    }

    const rawQuery = query.trim();

    // Detect the type of search input
    const inputType = detectSearchInputType(rawQuery);

    // For name/CAS searches, apply spelling correction and alias expansion
    let searchTerm = rawQuery;
    let spellingCorrection: SpellingCorrection | null = null;
    let chebiSearchTerm = rawQuery; // For ChEBI/NPAtlas, prefer the compound name

    if (inputType === 'name' || inputType === 'cas') {
      // Apply spelling correction only (not herb synonym expansion for structure search)
      const correction = correctAndNormalize(rawQuery);
      // For structure search, prefer the corrected term over the herb canonical
      // because "Curcumin" should search for the compound, not "curcuma longa" (the plant)
      searchTerm = correction.corrected;

      // Check if the search term maps to a known compound alias
      const lowerTerm = searchTerm.toLowerCase();
      if (COMPOUND_SEARCH_ALIASES[lowerTerm]) {
        searchTerm = COMPOUND_SEARCH_ALIASES[lowerTerm];
      } else {
        // Also try expanding as a herb name
        const herbTerms = expandHerb(searchTerm);
        for (const term of herbTerms) {
          if (COMPOUND_SEARCH_ALIASES[term.toLowerCase()]) {
            searchTerm = COMPOUND_SEARCH_ALIASES[term.toLowerCase()];
            break;
          }
        }
      }

      chebiSearchTerm = searchTerm;

      // Build spelling correction info
      spellingCorrection =
        (correction.wasCorrected || correction.synonymApplied || correction.suggestion)
          ? {
              original: correction.original,
              corrected: correction.corrected,
              canonical: correction.canonical !== correction.corrected ? correction.canonical : undefined,
              synonymApplied: correction.synonymApplied,
              wasAutoCorrected: correction.wasCorrected,
            }
          : null;
    }

    const sourcesUsed: string[] = [];
    let cids: number[] = [];

    // 1. Search PubChem based on input type
    switch (inputType) {
      case 'cid':
        cids = [parseInt(rawQuery, 10)];
        break;
      case 'inchikey':
        cids = await searchPubChemByInChIKey(rawQuery);
        break;
      case 'inchi':
      case 'smiles':
        cids = await searchPubChemByIdentity(rawQuery);
        break;
      case 'cas':
      case 'name':
      default:
        cids = await searchPubChemByName(searchTerm, 8);
        break;
    }

    // If no results from primary search, try synonym/autocomplete fallback for name searches
    if (cids.length === 0 && (inputType === 'name' || inputType === 'cas')) {
      // Try PubChem autocomplete for suggestions
      const suggestions = await getPubChemAutoComplete(searchTerm);
      for (const suggestion of suggestions.slice(0, 3)) {
        const suggestedCids = await searchPubChemBySynonym(suggestion, 3);
        if (suggestedCids.length > 0) {
          cids = suggestedCids;
          chebiSearchTerm = suggestion;
          // Add auto-correction info
          if (!spellingCorrection) {
            spellingCorrection = {
              original: rawQuery,
              corrected: suggestion,
              wasAutoCorrected: true,
            };
          }
          break;
        }
      }
    }

    let pubchemProps: PubChemPropertyResult[] = [];
    if (cids.length > 0) {
      pubchemProps = await getPubChemProperties(cids);
      sourcesUsed.push('PubChem');
    }

    // 2. Search ChEBI (use compound name for better ChEBI matching)
    const chebiPromise = searchChEBI(chebiSearchTerm);

    // 3. Search NPAtlas
    const npatlasPromise = searchNPAtlas(chebiSearchTerm);

    // Wait for ChEBI + NPAtlas
    const [chebiResult, npatlasResults] = await Promise.all([chebiPromise, npatlasPromise]);

    if (chebiResult) sourcesUsed.push('ChEBI');
    if (npatlasResults.length > 0) sourcesUsed.push('NPAtlas');

    // 4. Build CompoundStructure results from PubChem data
    const compounds: CompoundStructure[] = [];

    for (const prop of pubchemProps) {
      // Get CAS number from synonyms
      const { casNumber } = await getPubChemSynonyms(prop.CID);

      // Try to find matching NPAtlas entry for source organism
      const npatlasMatch = npatlasResults.find(
        np => np.inchiKey === prop.InChIKey || np.name.toLowerCase() === (prop.Title || '').toLowerCase()
      );

      // Try to find ChEBI source organism if NPAtlas doesn't have it
      let sourceOrganism = npatlasMatch?.sourceOrganism || chebiResult?.sourceOrganism || '';
      let compoundClass = npatlasMatch?.compoundClass || chebiResult?.compoundClass || '';

      // Derive compound class from name patterns if still empty
      if (!compoundClass) {
        const nameLower = (prop.Title || '').toLowerCase();
        // Natural product classes
        if (nameLower.includes('curcumin')) compoundClass = 'Curcuminoids';
        else if (nameLower.includes('ginsenoside')) compoundClass = 'Saponins';
        else if (nameLower.includes('quercetin') || nameLower.includes('rutin') || nameLower.includes('kaempferol') || nameLower.includes('luteolin') || nameLower.includes('apigenin') || nameLower.includes('myricetin') || nameLower.includes('fisetin') || nameLower.includes('baicalein')) compoundClass = 'Flavonoids';
        else if (nameLower.includes('berberine') || nameLower.includes('vincamine') || nameLower.includes('vinblastine') || nameLower.includes('vincristine') || nameLower.includes('camptothecin') || nameLower.includes('quinine') || nameLower.includes('morphine') || nameLower.includes('codeine') || nameLower.includes('caffeine') || nameLower.includes('nicotine') || nameLower.includes('atropine') || nameLower.includes('cocaine') || nameLower.includes('ephedrine') || nameLower.includes('strychnine') || nameLower.includes('colchicine') || nameLower.includes('papaverine') || nameLower.includes('reserpine') || nameLower.includes('emetine') || nameLower.includes('galantamine')) compoundClass = 'Alkaloids';
        else if (nameLower.includes('allicin') || nameLower.includes('diallyl')) compoundClass = 'Sulfur Compounds';
        else if (nameLower.includes('gingerol') || nameLower.includes('shogaol') || nameLower.includes('capsaicin') || nameLower.includes('piperine') || nameLower.includes('zingerone') || nameLower.includes('paradol')) compoundClass = 'Phenols';
        else if (nameLower.includes('hypericin') || nameLower.includes('hyperforin') || nameLower.includes('emodin') || nameLower.includes('rhein') || nameLower.includes('chrysophanol') || nameLower.includes('physcion') || nameLower.includes('aloe-emodin')) compoundClass = 'Anthraquinones';
        else if (nameLower.includes('silymarin') || nameLower.includes('silibinin') || nameLower.includes('silychristin') || nameLower.includes('silydianin')) compoundClass = 'Flavonolignans';
        else if (nameLower.includes('ginkgolide') || nameLower.includes('bilobalide') || nameLower.includes('taxol') || nameLower.includes('paclitaxel') || nameLower.includes('artemisinin') || nameLower.includes('menthol') || nameLower.includes('limonene') || nameLower.includes('pinene') || nameLower.includes('linalool') || nameLower.includes('carvone') || nameLower.includes('thymol') || nameLower.includes('carnosic acid') || nameLower.includes('ursolic acid') || nameLower.includes('oleanolic acid') || nameLower.includes('betulinic acid') || nameLower.includes('glycyrrhetinic')) compoundClass = 'Terpenoids';
        else if (nameLower.includes('egcg') || nameLower.includes('epigallocatechin') || nameLower.includes('catechin') || nameLower.includes('epicatechin') || nameLower.includes('theaflavin')) compoundClass = 'Catechins';
        else if (nameLower.includes('withaferin') || nameLower.includes('withanolide')) compoundClass = 'Steroidal Lactones';
        else if (nameLower.includes('kavalactone') || nameLower.includes('kavain') || nameLower.includes('yangonin')) compoundClass = 'Lactones';
        else if (nameLower.includes('glycyrrhizin')) compoundClass = 'Saponins';
        else if (nameLower.includes('resveratrol') || nameLower.includes('pterostilbene') || nameLower.includes('combretastatin')) compoundClass = 'Stilbenes';
        else if (nameLower.includes('genistein') || nameLower.includes('daidzein') || nameLower.includes('glycitein') || nameLower.includes('formononetin') || nameLower.includes('biochanin')) compoundClass = 'Isoflavones';
        else if (nameLower.includes('lignan') || nameLower.includes('podophyllotoxin') || nameLower.includes('sesamin') || nameLower.includes('silychristin')) compoundClass = 'Lignans';
        else if (nameLower.includes('coumarin') || nameLower.includes('esculetin') || nameLower.includes('umbelliferone') || nameLower.includes('scopoletin') || nameLower.includes('bergapten') || nameLower.includes('xanthotoxin') || nameLower.includes('psoralen')) compoundClass = 'Coumarins/Furanocoumarins';
        else if (nameLower.includes('tannin') || nameLower.includes('gallic acid') || nameLower.includes('ellagic acid') || nameLower.includes('proanthocyanidin')) compoundClass = 'Tannins/Polyphenols';
        else if (nameLower.includes('glucosinolate') || nameLower.includes('sulforaphane') || nameLower.includes('isothiocyanate')) compoundClass = 'Glucosinolates';
        else if (nameLower.includes('polysaccharide') || nameLower.includes('beta-glucan') || nameLower.includes('pectin') || nameLower.includes('inulin')) compoundClass = 'Polysaccharides';
        else if (nameLower.includes('steroid') || nameLower.includes('cholesterol') || nameLower.includes('sitosterol') || nameLower.includes('campesterol') || nameLower.includes('stigmasterol') || nameLower.includes('ergosterol') || nameLower.includes('diosgenin')) compoundClass = 'Steroids/Phytosterols';
        else if (nameLower.includes('fatty acid') || nameLower.includes('linoleic') || nameLower.includes('oleic') || nameLower.includes('palmitic') || nameLower.includes('stearic') || nameLower.includes('omega-3') || nameLower.includes('eicosapentaenoic') || nameLower.includes('docosahexaenoic')) compoundClass = 'Fatty Acids';
        else if (nameLower.includes('vitamin') || nameLower.includes('ascorbic') || nameLower.includes('tocopherol') || nameLower.includes('retinol') || nameLower.includes('thiamine') || nameLower.includes('riboflavin') || nameLower.includes('niacin') || nameLower.includes('pyridoxine') || nameLower.includes('cobalamin') || nameLower.includes('folate')) compoundClass = 'Vitamins';
        else if (nameLower.includes('amino acid') || nameLower.includes('theanine') || nameLower.includes('tryptophan') || nameLower.includes('tyrosine') || nameLower.includes('arginine') || nameLower.includes('glutamine')) compoundClass = 'Amino Acids';
        else if (nameLower.includes('peptide') || nameLower.includes('cyclosporine') || nameLower.includes('vancomycin') || nameLower.includes('bleomycin')) compoundClass = 'Peptides/Cyclic Peptides';
        // Drug/Pharma classes
        else if (nameLower.includes('penicillin') || nameLower.includes('amoxicillin') || nameLower.includes('ampicillin') || nameLower.includes('cephalosporin') || nameLower.includes('vancomycin') || nameLower.includes('tetracycline') || nameLower.includes('streptomycin') || nameLower.includes('erythromycin') || nameLower.includes('azithromycin')) compoundClass = 'Antibiotics';
        else if (nameLower.includes('statin') || nameLower.includes('atorvastatin') || nameLower.includes('simvastatin') || nameLower.includes('lovastatin') || nameLower.includes('pravastatin') || nameLower.includes('rosuvastatin')) compoundClass = 'Statins';
        else if (nameLower.includes('nsaid') || nameLower.includes('ibuprofen') || nameLower.includes('aspirin') || nameLower.includes('diclofenac') || nameLower.includes('naproxen') || nameLower.includes('celecoxib') || nameLower.includes('indomethacin')) compoundClass = 'NSAIDs';
        else if (nameLower.includes('warfarin') || nameLower.includes('heparin') || nameLower.includes('clopidogrel') || nameLower.includes('enoxaparin')) compoundClass = 'Anticoagulants/Antiplatelets';
        else if (nameLower.includes('prednisone') || nameLower.includes('dexamethasone') || nameLower.includes('cortisone') || nameLower.includes('hydrocortisone') || nameLower.includes('betamethasone')) compoundClass = 'Corticosteroids';
        else if (nameLower.includes('methotrexate') || nameLower.includes('doxorubicin') || nameLower.includes('cisplatin') || nameLower.includes('5-fluorouracil') || nameLower.includes('tamoxifen') || nameLower.includes('imatinib')) compoundClass = 'Chemotherapeutics';
        else if (nameLower.includes('insulin') || nameLower.includes('metformin') || nameLower.includes('glipizide') || nameLower.includes('glyburide') || nameLower.includes('sitagliptin') || nameLower.includes('pioglitazone')) compoundClass = 'Antidiabetics';
        else compoundClass = 'Chemical Compound';
      }

      // Get PubMed references for this compound
      const pubmedRefs = await getCompoundPubmedRefs(prop.Title || searchTerm);
      if (pubmedRefs.length > 0 && !sourcesUsed.includes('PubMed')) {
        sourcesUsed.push('PubMed');
      }

      // Get 3D conformer ID (non-blocking — don't wait too long)
      const conformerId3D = await get3DConformerId(prop.CID);

      compounds.push({
        name: prop.Title || searchTerm,
        iupacName: prop.IUPACName || '',
        molecularFormula: prop.MolecularFormula || '',
        molecularWeight: prop.MolecularWeight ? parseFloat(prop.MolecularWeight) : 0,
        smiles: prop.IsomericSMILES || prop.CanonicalSMILES || prop.SMILES || '',
        inchi: prop.InChI || '',
        inchiKey: prop.InChIKey || '',
        casNumber,
        cid: prop.CID,
        chebiId: chebiResult?.chebiId || '',
        imageUrl2D: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${prop.CID}/PNG?image_size=large`,
        conformerId3D,
        sourceOrganism,
        compoundClass,
        pubmedReferences: pubmedRefs,
      });
    }

    // 5. If PubChem returned nothing but NPAtlas has results, build from NPAtlas
    if (compounds.length === 0 && npatlasResults.length > 0) {
      for (const np of npatlasResults) {
        const pubmedRefs = await getCompoundPubmedRefs(np.name);
        compounds.push({
          name: np.name || searchTerm,
          iupacName: '',
          molecularFormula: '',
          molecularWeight: 0,
          smiles: np.smiles,
          inchi: '',
          inchiKey: np.inchiKey,
          casNumber: '',
          cid: 0,
          chebiId: '',
          imageUrl2D: np.smiles
            ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(np.smiles)}/PNG?image_size=large`
            : '',
          conformerId3D: '',
          sourceOrganism: np.sourceOrganism,
          compoundClass: np.compoundClass || 'Natural Product',
          pubmedReferences: pubmedRefs,
        });
      }
    }

    // 6. Build response
    const totalResults = compounds.length;
    const noResultsMessage = totalResults === 0
      ? `No chemical structure data found for "${searchTerm}" in PubChem, ChEBI, or NPAtlas. Try a different name, CAS number, SMILES string, InChI, or PubChem CID.`
      : undefined;

    // Confidence reasoning
    let confidenceReasoning = '';
    if (totalResults > 0) {
      const parts: string[] = [];
      parts.push(`${totalResults} compound structure${totalResults > 1 ? 's' : ''} retrieved`);
      const withSmiles = compounds.filter(c => c.smiles).length;
      const withInchi = compounds.filter(c => c.inchi).length;
      const withSource = compounds.filter(c => c.sourceOrganism).length;
      const withRefs = compounds.filter(c => c.pubmedReferences.length > 0).length;
      if (withSmiles > 0) parts.push(`${withSmiles} with SMILES notation`);
      if (withInchi > 0) parts.push(`${withInchi} with InChI identifier`);
      if (withSource > 0) parts.push(`${withSource} with source organism data`);
      if (withRefs > 0) parts.push(`${withRefs} linked to PubMed references`);
      parts.push(`sources: ${sourcesUsed.join(', ')}`);
      confidenceReasoning = parts.join('; ') + '.';
    } else {
      confidenceReasoning = 'No structural data available from any queried source.';
    }

    return NextResponse.json({
      query: searchTerm,
      compounds,
      totalResults,
      sourcesUsed,
      noResultsMessage,
      spellingCorrection,
      confidenceReasoning,
    });
  } catch (error) {
    console.error('Structure search error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
