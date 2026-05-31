import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { expandHerb, ACTIVE_COMPOUNDS, HIGH_IMPACT_JOURNALS, MEDIUM_IMPACT_JOURNALS, PHARM_ACTIONS, MECH_KEYWORDS } from '@/lib/knowledge-base';
import { scoreEvidenceSet, classifyStudyType, assessJournalQuality, computeAggregateScore } from '@/lib/evidence-scoring';
import { classifyMechanism, normalizeSeverity, normalizeInteractionType, extractMechanisms, generateMechanismDescription } from '@/lib/mechanism-taxonomy';
import { correctAndNormalize } from '@/lib/spell-corrector';
import type { StudyResult, FdaDrugData, SpellingCorrection } from '@/lib/types';
import { isSupabaseActive, saveInteractionReport } from '@/lib/supabase';
import { withRetry, dedupedFetch, handleApiError, getCachedResults, setCachedResults } from '@/lib/api-cache';

/**
 * Build spelling correction object for client with full canonical info.
 */
function buildCorrection(correction: ReturnType<typeof correctAndNormalize>): SpellingCorrection | null {
  if (!correction.wasCorrected && !correction.synonymApplied && !correction.suggestion) return null;
  return {
    original: correction.original,
    corrected: correction.corrected,
    canonical: correction.canonical !== correction.corrected ? correction.canonical : undefined,
    synonymApplied: correction.synonymApplied,
    wasAutoCorrected: correction.wasCorrected,
  };
}

/**
 * Generate confidence reasoning from scored results.
 */
function generateConfidenceReasoning(
  results: StudyResult[],
  scores: ReturnType<typeof scoreEvidenceSet>,
): string {
  if (results.length === 0) return 'No evidence available for assessment.';

  const humanCount = results.filter(r => r.clinicalRelevance === 'Human Clinical').length;
  const animalCount = results.filter(r => r.clinicalRelevance === 'Animal/In Vitro').length;
  const highEvidence = results.filter(r => r.evidenceLevel === 'High').length;
  const modEvidence = results.filter(r => r.evidenceLevel === 'Moderate').length;
  const lowEvidence = results.filter(r => r.evidenceLevel === 'Low').length;
  const hasContradictions = scores.some(s => s.breakdown.contradictionPenalty > 0);
  const metaCount = results.filter(r => r.studyType === 'Meta-analysis' || r.studyType === 'Systematic Review').length;
  const rctCount = results.filter(r => r.studyType === 'Randomized Controlled Trial').length;

  const parts: string[] = [];

  // Evidence composition
  if (metaCount > 0) {
    parts.push(`${metaCount} meta-analysis/systematic review${metaCount > 1 ? 's' : ''} provide${metaCount === 1 ? 's' : ''} high-tier evidence`);
  }
  if (rctCount > 0) {
    parts.push(`${rctCount} RCT${rctCount > 1 ? 's' : ''} contribute${rctCount === 1 ? 's' : ''} clinical validation`);
  }

  // Validation profile
  if (humanCount > 0 && animalCount > 0) {
    parts.push(`evidence includes ${humanCount} human clinical stud${humanCount === 1 ? 'y' : 'ies'} and ${animalCount} animal/in vitro stud${animalCount === 1 ? 'y' : 'ies'}`);
  } else if (humanCount > 0) {
    parts.push(`${humanCount} human clinical stud${humanCount === 1 ? 'y' : 'ies'} support${humanCount === 1 ? 's' : ''} these findings`);
  } else if (animalCount > 0) {
    parts.push(`limited to ${animalCount} animal/in vitro stud${animalCount === 1 ? 'y' : 'ies'} — preclinical evidence may support mechanistic plausibility but does not establish clinical significance`);
  }

  // Evidence quality distribution
  parts.push(`evidence distribution: ${highEvidence} high, ${modEvidence} moderate, ${lowEvidence} low quality`);

  // Contradiction detection
  if (hasContradictions) {
    parts.push('contradictory findings detected across studies, reducing overall confidence and precluding definitive conclusions');
  }

  // Mechanistic vs clinical
  const mechanisticCount = results.filter(r => r.studyType === 'Mechanistic Study' || r.studyType === 'In Vitro' || r.studyType === 'Animal Study').length;
  const clinicalCount = results.filter(r => r.clinicalRelevance === 'Human Clinical').length;
  if (mechanisticCount > clinicalCount) {
    parts.push('predominance of mechanistic and preclinical evidence over clinical validation; findings remain hypothesis-generating');
  }

  // Pharmacovigilance caution
  const hasFdaSignal = results.some(r => r.fdaWarnings && r.fdaWarnings.length > 0);
  if (hasFdaSignal) {
    parts.push('pharmacovigilance signals detected — signals do not establish causality and should not be interpreted as confirmed clinical harm');
  }

  return parts.join('; ') + '.';
}

export async function POST(req: NextRequest) {
  try {
    const { drug, herb } = await req.json();
    if (!drug?.trim() || !herb?.trim()) {
      return NextResponse.json({ error: 'Drug and herb names are required.' }, { status: 400 });
    }

    // Apply spelling correction and synonym normalization
    const drugCorrection = correctAndNormalize(drug.trim());
    const herbCorrection = correctAndNormalize(herb.trim());

    // Use canonical (fully normalized) term for search
    const drugName = drugCorrection.canonical || drugCorrection.corrected;
    const herbName = herbCorrection.canonical || herbCorrection.corrected;

    // Build full spelling correction info for client
    const spellingCorrections = {
      drug: buildCorrection(drugCorrection),
      herb: buildCorrection(herbCorrection),
    };

    const cacheKey = `${drugName.toLowerCase()}::${herbName.toLowerCase()}`;

    // ─── Supabase cache check (additional layer BEFORE Prisma) ───
    const supabaseCached = await getCachedResults(cacheKey);
    if (supabaseCached && typeof supabaseCached === 'object' && 'results' in (supabaseCached as Record<string, unknown>)) {
      const cachedRow = supabaseCached as Record<string, unknown>;
      const cachedResults = cachedRow.results;
      return NextResponse.json({
        results: cachedResults,
        total: (cachedRow as Record<string, unknown>).result_count ?? (Array.isArray(cachedResults) ? cachedResults.length : 0),
        sourcesUsed: (cachedRow as Record<string, unknown>).sources_used ?? ['PubMed'],
        fdaData: null,
        topCitationCount: 0,
        fromCache: true,
        spellingCorrections,
      });
    }

    // ─── Prisma cache check (resilient — skip if DB unavailable) ───
    let cached = null;
    try {
      cached = await db.cachedResult.findUnique({ where: { cacheKey } });
    } catch (dbErr) {
      console.warn('[Search] Prisma cache lookup failed (DB may not be set up):', (dbErr as Error).message);
    }
    if (cached && cached.expiresAt > new Date()) {
      const cachedData = {
        results: JSON.parse(cached.results),
        total: cached.total,
        sourcesUsed: JSON.parse(cached.sourcesUsed),
        fdaData: cached.fdaData ? JSON.parse(cached.fdaData) : null,
        topCitationCount: cached.topCitationCount,
        fromCache: true,
        spellingCorrections,
      };
      return NextResponse.json(cachedData);
    }

    const sourcesUsed: string[] = ['PubMed'];
    let fdaData: FdaDrugData | null = null;

    // Expand herb aliases
    const herbTerms = expandHerb(herbName);
    const herbQuery = herbTerms.map(t => `"${t}"[Title/Abstract]`).join(' OR ');

    // Build PubMed queries — multi-strategy for relevance
    const drugQuery = `"${drugName}"[Title/Abstract]`;

    // Strategy 1: Drug AND Herb AND (interaction/effect terms) — highest relevance
    const interactionTerms = '(interaction[Title/Abstract] OR effect[Title/Abstract] OR influence[Title/Abstract] OR modulation[Title/Abstract] OR inhibit[Title/Abstract] OR induc[Title/Abstract] OR metabolism[Title/Abstract] OR pharmacokinetic[Title/Abstract] OR co-administration[Title/Abstract] OR combination[Title/Abstract] OR concomitant[Title/Abstract])';
    const priorityQuery = `(${drugQuery}) AND (${herbQuery}) AND ${interactionTerms}`;

    // Strategy 2: Drug AND Herb — broader fallback
    const broadQuery = `(${drugQuery}) AND (${herbQuery})`;

    // 1. Search PubMed — run both strategies, merge results
    let allIds: string[] = [];
    const priorityIds: string[] = [];
    const broadOnlyIds: string[] = [];

    // Helper: fetch PubMed IDs for a query
    async function fetchPubmedIds(query: string, retmax: number): Promise<string[]> {
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${retmax}&retmode=json&sort=relevance&tool=PharmaInsight&email=research@pharmainsight.dev`;
      try {
        const data = await withRetry(
          () => dedupedFetch(`pubmed-search:${query.slice(0, 80)}`, async () => {
            const res = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
            if (!res.ok) throw new Error(`PubMed search failed: ${res.status}`);
            return res.json();
          }),
          { maxRetries: 1 }
        );
        return data?.esearchresult?.idlist ?? [];
      } catch {
        return [];
      }
    }

    // Run priority query first, then broad query to fill remaining slots
    const pIds = await fetchPubmedIds(priorityQuery, 20);
    priorityIds.push(...pIds);
    allIds.push(...pIds);

    // Broad query: only add IDs not already found by priority query
    if (allIds.length < 20) {
      const bIds = await fetchPubmedIds(broadQuery, 30);
      for (const id of bIds) {
        if (!allIds.includes(id)) {
          broadOnlyIds.push(id);
          allIds.push(id);
          if (allIds.length >= 25) break;
        }
      }
    }

    const ids = allIds;

    if (ids.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
        sourcesUsed: ['PubMed'],
        fdaData: null,
        topCitationCount: 0,
        fromCache: false,
        noEvidenceMessage: 'No studies found for this combination.',
        spellingCorrections,
      });
    }

    // 2. Fetch article details
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml&tool=PharmaInsight&email=research@pharmainsight.dev`;
    const fetchRes = await fetch(fetchUrl, { signal: AbortSignal.timeout(15000) });
    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'PubMed fetch failed.' }, { status: 502 });
    }
    const xml = await fetchRes.text();

    // Parse articles
    const articles: { pmid: string; title: string; abstract: string; journal: string; pubYear: string; authors: string[]; doi?: string }[] = [];
    const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g;
    let match;
    while ((match = articleRegex.exec(xml)) !== null) {
      const chunk = match[0];
      const pmid = chunk.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] ?? '';
      const title = chunk.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
      const journal = chunk.match(/<ISOAbbreviation>([\s\S]*?)<\/ISOAbbreviation>/)?.[1]?.replace(/<[^>]+>/g, '').trim()
        ?? chunk.match(/<Journal>[\s\S]*?<Title>([\s\S]*?)<\/Title>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
      const abstract = [...chunk.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).join(' ');
      const pubYear = chunk.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1]
        ?? chunk.match(/<MedlineDate>(\d{4})/)?.[1] ?? '';
      const authors = [...chunk.matchAll(/<Author[\s\S]*?<LastName>([^<]+)<\/LastName>[\s\S]*?<ForeName>([^<]+)<\/ForeName>/g)].map(m => `${m[2]} ${m[1]}`);
      const doi = chunk.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)?.[1]
        ?? chunk.match(/<ElocationID.*?EIdType="doi".*?>([^<]+)<\/ElocationID>/)?.[1];

      if (pmid && title) {
        articles.push({ pmid, title, abstract, journal, pubYear, authors, doi });
      }
    }

    // 3. Resolve DOIs via CrossRef (with timeout)
    const doiMap: Record<string, string> = {};
    await Promise.allSettled(
      articles.filter(a => a.doi).map(async (a) => {
        try {
          const crRes = await fetch(`https://api.crossref.org/works/${encodeURIComponent(a.doi!)}`, {
            headers: { 'User-Agent': 'PharmaInsight/1.0 (mailto:research@pharmainsight.dev)' },
            signal: AbortSignal.timeout(8000),
          });
          if (crRes.ok) {
            const crData = await crRes.json();
            const resolvedDoi = crData?.message?.DOI;
            if (resolvedDoi) doiMap[a.pmid] = resolvedDoi;
          }
        } catch { /* ignore */ }
      })
    );
    if (Object.keys(doiMap).length > 0 && !sourcesUsed.includes('CrossRef')) sourcesUsed.push('CrossRef');

    // 4. Get citation counts from OpenAlex (with timeout)
    const citationMap: Record<string, number> = {};
    await Promise.allSettled(
      articles.map(async (a) => {
        try {
          const oaUrl = `https://api.openalex.org/works/doi:${encodeURIComponent(a.doi || a.pmid)}?mailto=research@pharmainsight.dev`;
          const oaRes = await fetch(oaUrl, { signal: AbortSignal.timeout(8000) });
          if (oaRes.ok) {
            const oaData = await oaRes.json();
            if (oaData?.cited_by_count) citationMap[a.pmid] = oaData.cited_by_count;
          }
        } catch { /* ignore */ }
      })
    );
    if (Object.keys(citationMap).length > 0 && !sourcesUsed.includes('OpenAlex')) sourcesUsed.push('OpenAlex');

    // 5. Check OpenFDA (with retry)
    try {
      const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drugName)}"&limit=1`;
      const fdaJson = await withRetry(
        () => dedupedFetch(`openfda:${drugName.toLowerCase()}`, async () => {
          const res = await fetch(fdaUrl, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) return null;
          return res.json();
        }),
        { maxRetries: 1 }
      );
      if (fdaJson) {
        const label = (fdaJson as Record<string, unknown>)?.results
          ? ((fdaJson as Record<string, unknown[]>).results as Record<string, unknown>[])?.[0]
          : undefined;
        if (label) {
          const warnings: string[] = [];
          const interactions: string[] = [];
          const brandNames: string[] = (label?.openfda as Record<string, string[]>)?.brand_name ?? [];

          if ((label?.warnings as string[])?.length) warnings.push(...(label.warnings as string[]).slice(0, 3));
          if ((label?.drug_interactions as string[])?.length) interactions.push(...(label.drug_interactions as string[]).slice(0, 3));

          if (warnings.length > 0 || interactions.length > 0 || brandNames.length > 0) {
            fdaData = { warnings, interactions, brandNames };
            if (!sourcesUsed.includes('OpenFDA')) sourcesUsed.push('OpenFDA');
          }
        }
      }
    } catch { /* ignore FDA errors */ }

    // 6. Apply evidence scoring and build results
    const evidenceInputs = articles.map(a => ({
      studyType: classifyStudyType(a.title, a.abstract, ''),
      title: a.title,
      abstract: a.abstract,
      journal: a.journal,
      citationCount: citationMap[a.pmid] || 0,
    }));

    const scores = scoreEvidenceSet(evidenceInputs);

    const results: StudyResult[] = articles.map((a, i) => {
      const score = scores[i];
      const jLower = (a.journal || '').toLowerCase();
      let journalQuality: StudyResult['journalQuality'] = 'Low/uncertain quality';
      if (HIGH_IMPACT_JOURNALS.some(j => jLower.includes(j))) journalQuality = 'High-impact journal';
      else if (MEDIUM_IMPACT_JOURNALS.some(j => jLower.includes(j))) journalQuality = 'Medium-impact journal';

      const text = ((a.title || '') + ' ' + (a.abstract || '')).toLowerCase();

      // Study type classification
      let studyType = 'Mechanistic Study';
      if (text.includes('meta-analysis') || text.includes('meta analysis')) studyType = 'Meta-analysis';
      else if (text.includes('systematic review')) studyType = 'Systematic Review';
      else if (text.includes('randomized controlled') || /\brct\b/.test(text)) studyType = 'Randomized Controlled Trial';
      else if (text.includes('cohort study') || text.includes('prospective study')) studyType = 'Cohort Study';
      else if (text.includes('case report') || text.includes('case series')) studyType = 'Case Report';
      else if (text.includes('in vitro') || text.includes('cell line')) studyType = 'In Vitro';
      else if (/\brat\b/.test(text) || /\bmice\b/.test(text) || /\bin vivo\b/.test(text)) studyType = 'Animal Study';

      // ─── Normalized severity (never "Unknown") ───
      const severity = normalizeSeverity(a.title, a.abstract);

      // ─── Normalized interaction type (never "Unknown") ───
      const interactionType = normalizeInteractionType(a.title, a.abstract);

      // ─── Normalized mechanism description ───
      const mechanismDescription = generateMechanismDescription(a.title, a.abstract);

      let clinicalRelevance: StudyResult['clinicalRelevance'] = 'Unknown';
      if (text.includes('clinical trial') || text.includes('patient') || text.includes('human')) clinicalRelevance = 'Human Clinical';
      else if (text.includes('rat') || text.includes('mice') || text.includes('in vitro') || text.includes('cell line')) clinicalRelevance = 'Animal/In Vitro';

      // ─── Enhanced Relevance Scoring ───
      // Multi-factor relevance assessment to filter out tangential studies.
      // A study about corticosteroids that merely mentions tacrolimus
      // in passing should NOT appear in a Tacrolimus-Curcuma report.
      let relevanceScore = 0;
      const titleLower = (a.title || '').toLowerCase();
      const drugLower = drugName.toLowerCase();
      const drugMentioned = text.includes(drugLower);
      const herbMentioned = herbTerms.some(t => text.includes(t.toLowerCase()));
      const drugInTitle = titleLower.includes(drugLower);
      const herbInTitle = herbTerms.some(t => titleLower.includes(t.toLowerCase()));

      // Core relevance: both drug AND herb must be mentioned in text
      if (drugMentioned && herbMentioned) {
        relevanceScore += 30;
        // Strong bonus if both appear in the TITLE (primary subject of the study)
        if (drugInTitle && herbInTitle) relevanceScore += 25;
        else if (drugInTitle || herbInTitle) relevanceScore += 10;
      } else {
        // If only one agent is mentioned, this study is likely tangential
        if (drugMentioned) relevanceScore += 5;
        if (herbMentioned) relevanceScore += 5;
      }

      // Interaction-specific signals — studies that explicitly discuss
      // drug-herb interaction mechanisms are far more relevant
      const interactionSignals = ['interaction', 'co-administration', 'coadministration',
        'concomitant', 'combination therapy', 'drug-herb', 'herb-drug',
        'pharmacokinetic interaction', 'pharmacodynamic interaction',
        'drug interaction', 'adverse effect', 'drug level', 'blood level',
        'bioavailability', 'clearance', 'metabolism'];
      const interactionHits = interactionSignals.filter(s => text.includes(s)).length;
      relevanceScore += Math.min(interactionHits * 5, 20);

      // Mechanism-specific signals boost (CYP, P-gp, transporter)
      const mechanismSignals = ['cyp3a4', 'cyp2d6', 'cyp2c9', 'p-glycoprotein', 'p-gp',
        'efflux transporter', 'pglycoprotein', 'cytochrome p450'];
      if (mechanismSignals.some(s => text.includes(s))) relevanceScore += 8;

      // Priority query bonus — studies from the interaction-focused query
      // are inherently more relevant than broad-query-only results
      if (priorityIds.includes(a.pmid)) relevanceScore += 10;

      // Penalty: drug class mismatch detection
      // If the study is clearly about a different drug class, penalize it
      const mismatchPenalties: [RegExp, string[]][] = [
        // Corticosteroid-specific terms that are NOT about tacrolimus/immunosuppressants
        [/[\b]corticosteroid[s]?\b/i, ['prednisone', 'prednisolone', 'dexamethasone', 'methylprednisolone', 'hydrocortisone', 'betamethasone']],
        // Statin-specific terms
        [/\bstatin[s]?\b/i, ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin']],
        // Antibiotic-specific terms
        [/\bantibiotic[s]?\b/i, ['amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline']],
      ];
      for (const [pattern, drugClassMembers] of mismatchPenalties) {
        if (pattern.test(text) && drugClassMembers.some(d => text.includes(d)) && !drugLower.includes(drugClassMembers.find(d => drugLower.includes(d)) || '___')) {
          // The study prominently features a different drug class — penalize
          if (!drugInTitle) relevanceScore -= 15; // Severe penalty if drug not even in title
          else relevanceScore -= 5; // Mild penalty even if drug is in title (might be a comparison)
        }
      }

      relevanceScore = Math.max(0, Math.min(100, relevanceScore));

      let relevanceLabel: StudyResult['relevanceLabel'] = 'LOW';
      if (relevanceScore >= 50) relevanceLabel = 'HIGH';
      else if (relevanceScore >= 20) relevanceLabel = 'MEDIUM';

      const compositeScore = Math.round(score.normalizedScore * 0.6 + relevanceScore * 0.4);

      const fdaWarnings: string[] = [];
      if (fdaData) {
        const herbLower = herbName.toLowerCase();
        for (const w of fdaData.warnings) {
          if (w.toLowerCase().includes(herbLower) || w.toLowerCase().includes(drugName.toLowerCase())) {
            fdaWarnings.push(w.substring(0, 200));
          }
        }
        for (const inter of fdaData.interactions) {
          if (inter.toLowerCase().includes(herbLower) || inter.toLowerCase().includes(drugName.toLowerCase())) {
            fdaWarnings.push(inter.substring(0, 200));
          }
        }
      }

      const resolvedDoi = doiMap[a.pmid] || a.doi;

      return {
        title: a.title,
        source: 'PubMed' as const,
        pubmedLink: `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`,
        pmid: a.pmid,
        doi: resolvedDoi,
        doiLink: resolvedDoi ? `https://doi.org/${resolvedDoi}` : undefined,
        journal: a.journal,
        pubYear: a.pubYear,
        authors: a.authors,
        abstract: a.abstract,
        citationCount: citationMap[a.pmid] || 0,
        studyType,
        evidenceLevel: score.evidenceLevel,
        journalQuality,
        relevanceLabel,
        relevanceScore,
        compositeScore,
        fdaWarnings,
        severity,
        interactionType,
        clinicalRelevance,
        confidence: score.confidenceCategory,
        rationale: score.rationale,
        mechanismDescription,
      };
    });

    // Sort by composite score, then filter out low-relevance noise
    results.sort((a, b) => b.compositeScore - a.compositeScore);

    // Relevance gate: remove studies with very low relevance scores
    // that are tangential mentions (e.g., a corticosteroid study that
    // merely mentions tacrolimus in a comparison table)
    const MIN_RELEVANCE_SCORE = 10;
    const filteredResults = results.filter(r => r.relevanceScore >= MIN_RELEVANCE_SCORE);

    // If filtering removed everything, fall back to top 5 unfiltered
    // (better to show something than nothing)
    const finalResults = filteredResults.length > 0 ? filteredResults : results.slice(0, 5);

    const topCitationCount = Math.max(...finalResults.map(r => r.citationCount), 0);

    // Cache results (using filtered set)
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.cachedResult.upsert({
        where: { cacheKey },
        create: {
          cacheKey,
          drug: drugName,
          herb: herbName,
          results: JSON.stringify(finalResults),
          sourcesUsed: JSON.stringify(sourcesUsed),
          fdaData: fdaData ? JSON.stringify(fdaData) : null,
          total: finalResults.length,
          topCitationCount,
          expiresAt,
        },
        update: {
          drug: drugName,
          herb: herbName,
          results: JSON.stringify(finalResults),
          sourcesUsed: JSON.stringify(sourcesUsed),
          fdaData: fdaData ? JSON.stringify(fdaData) : null,
          total: finalResults.length,
          topCitationCount,
          expiresAt,
        },
      });
    } catch { /* ignore cache errors */ }

    // ─── Save to Supabase cache (additional layer) ───
    await setCachedResults(
      cacheKey,
      'interaction',
      finalResults,
      sourcesUsed,
      24
    );

    // Generate confidence reasoning (using filtered results and matching scores)
    const finalScores = finalResults.map(r => scores.find((s, i) => articles[i]?.pmid === r.pmid) || scores[0]).filter(Boolean);
    const confidenceReasoning = generateConfidenceReasoning(finalResults, finalScores);

    return NextResponse.json({
      results: finalResults,
      total: finalResults.length,
      sourcesUsed,
      fdaData,
      topCitationCount,
      fromCache: false,
      spellingCorrections,
      confidenceReasoning,
    });
  } catch (error) {
    console.error('[Search API] Full error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Internal server error: ${message}` }, { status: 500 });
  }
}
