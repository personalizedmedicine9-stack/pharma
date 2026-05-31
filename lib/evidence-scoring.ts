// Study Type Weights (max 40)
const STUDY_TYPE_SCORES: Record<string, number> = {
  'meta-analysis': 40,
  'systematic review': 35,
  'rct': 30,
  'randomized controlled trial': 30,
  'cohort': 20,
  'case report': 10,
  'in vitro': 5,
  'animal study': 8,
};

// Journal Quality Weights (max 20)
const JOURNAL_QUALITY_SCORES = {
  Q1: 20,
  Q2: 10,
  low: 3,
} as const;

// Validation Type Weights (max 20)
const VALIDATION_SCORES = {
  human: 20,
  animal: 10,
  computational: 3,
} as const;

// Contradictory Evidence Penalties (proportional)
const CONTRADICTION_PENALTY_STRONG = 20;   // Strong contradictions (>60% minority)
const CONTRADICTION_PENALTY_MODERATE = 12; // Moderate contradictions (30-60%)
const CONTRADICTION_PENALTY_WEAK = 5;      // Weak contradictions (<30%)

// High impact journals list
const HIGH_IMPACT_JOURNALS = [
  'new england journal of medicine', 'nejm', 'lancet', 'jama', 'bmj',
  'nature', 'science', 'cell', 'annals of internal medicine', 'circulation',
  'journal of the american college of cardiology', 'clinical pharmacology',
  'british journal of clinical pharmacology', 'phytomedicine',
  'journal of ethnopharmacology', 'drug safety',
  'european journal of clinical pharmacology', 'drug metabolism',
  'pharmacotherapy', 'journal of clinical pharmacology',
  'clinical pharmacokinetics', 'british journal of pharmacology',
];

const MEDIUM_IMPACT_JOURNALS = [
  'plos', 'evidence-based complementary', 'frontiers in pharmacology',
  'molecules', 'nutrients', 'complementary therapies', 'alternative medicine',
  'integrative medicine', 'herbal medicine', 'natural product',
  'phytotherapy', 'pharmacognosy', 'biomedicines',
  'international journal of molecular sciences',
];

export interface EvidenceInput {
  studyType: string;
  title: string;
  abstract: string;
  journal: string;
  citationCount: number;
}

export interface ScoreBreakdown {
  studyTypeScore: number;
  journalQualityScore: number;
  validationScore: number;
  contradictionPenalty: number;
}

export interface ScoredEvidence {
  rawScore: number;
  normalizedScore: number;
  evidenceLevel: 'High' | 'Moderate' | 'Low';
  confidenceCategory: 'Strong' | 'Moderate' | 'Weak';
  breakdown: ScoreBreakdown;
  rationale: string;
  /** True when this study is a meta-analysis or multi-center RCT — exempt from the single-study inflation ceiling */
  isLargeScaleSingleSource: boolean;
}

export interface AggregateScore {
  aggregateScore: number;
  evidenceLevel: string;
  confidence: string;
  rationale: string;
}

/**
 * Classify study type from title, abstract, and reported type.
 */
export function classifyStudyType(title: string, abstract: string, reportedType: string): string {
  const safeTitle = title || '';
  const safeAbstract = abstract || '';
  const safeReportedType = reportedType || '';
  const text = (safeTitle + ' ' + safeAbstract).toLowerCase();
  const rt = safeReportedType.toLowerCase();

  if (rt.includes('meta-analysis') || text.includes('meta-analysis') || text.includes('meta analysis')) return 'meta-analysis';
  if (rt.includes('systematic review') || text.includes('systematic review')) return 'systematic review';
  if (rt.includes('randomized controlled') || rt.includes('rct') || /\brct\b/.test(text) || text.includes('randomized controlled trial')) return 'rct';
  if (rt.includes('cohort') || text.includes('cohort study') || text.includes('prospective study')) return 'cohort';
  if (rt.includes('case report') || text.includes('case report') || text.includes('case series')) return 'case report';
  if (rt.includes('in vitro') || text.includes('in vitro') || text.includes('cell line')) return 'in vitro';
  if (rt.includes('animal') || /\brat\b/.test(text) || /\bmice\b/.test(text) || /\bin vivo\b/.test(text)) return 'animal study';

  return reportedType || 'unknown';
}

/**
 * Assess journal quality tier.
 */
export function assessJournalQuality(journal: string): 'Q1' | 'Q2' | 'low' {
  const j = (journal || '').toLowerCase();
  if (HIGH_IMPACT_JOURNALS.some(hj => j.includes(hj))) return 'Q1';
  if (MEDIUM_IMPACT_JOURNALS.some(mj => j.includes(mj))) return 'Q2';
  return 'low';
}

/**
 * Determine validation type from title and abstract.
 */
export function determineValidationType(title: string, abstract: string): 'human' | 'animal' | 'computational' {
  const text = ((title || '') + ' ' + (abstract || '')).toLowerCase();

  const humanSignals = ['clinical trial', 'patient', 'human', 'randomized', 'cohort', 'placebo', 'double-blind', 'volunteer'];
  const animalSignals = ['rat', 'mice', 'murine', 'canine', 'porcine', 'in vivo', 'animal model', 'rodent'];

  if (humanSignals.some(s => text.includes(s))) return 'human';
  if (animalSignals.some(s => text.includes(s))) return 'animal';
  return 'computational';
}

/**
 * Detect contradictions and return severity level.
 */
export function detectContradictions(results: EvidenceInput[]): { hasContradictions: boolean; severity: 'none' | 'weak' | 'moderate' | 'strong' } {
  const positiveSignals = ['increase', 'enhance', 'potentiate', 'synergis', 'induce', 'elevate', 'accelerate'];
  const negativeSignals = ['decrease', 'reduce', 'inhibit', 'suppress', 'antagoniz', 'diminish', 'attenuate'];

  let posCount = 0;
  let negCount = 0;

  for (const r of results) {
    const text = ((r.title || '') + ' ' + (r.abstract || '')).toLowerCase();
    if (positiveSignals.some(s => text.includes(s))) posCount++;
    if (negativeSignals.some(s => text.includes(s))) negCount++;
  }

  if (posCount === 0 || negCount === 0) return { hasContradictions: false, severity: 'none' };

  const ratio = Math.min(posCount, negCount) / Math.max(posCount, negCount);

  if (ratio > 0.6) return { hasContradictions: true, severity: 'strong' };
  if (ratio > 0.3) return { hasContradictions: true, severity: 'moderate' };
  if (ratio > 0) return { hasContradictions: true, severity: 'weak' };

  return { hasContradictions: false, severity: 'none' };
}

/**
 * Determine whether a study qualifies as a large-scale single source
 * (meta-analysis or multi-center RCT) that is exempt from the inflation ceiling.
 */
export function isLargeScaleSingleSource(classifiedStudyType: string, title: string, abstract: string): boolean {
  const text = ((title || '') + ' ' + (abstract || '')).toLowerCase();
  if (classifiedStudyType === 'meta-analysis') return true;
  if (text.includes('meta-analysis') || text.includes('meta analysis')) return true;
  if (text.includes('multi-center') || text.includes('multicenter')) return true;
  return false;
}

/**
 * Generate rationale string for a scored evidence item.
 */
function generateRationale(
  studyType: string,
  journalQuality: 'Q1' | 'Q2' | 'low',
  validationType: 'human' | 'animal' | 'computational',
  contradictionPenalty: number,
  normalizedScore: number,
): string {
  const parts: string[] = [];

  const studyTypeLabel = STUDY_TYPE_SCORES[studyType] ? studyType : 'unknown';
  const studyScore = STUDY_TYPE_SCORES[studyType] ?? 5;
  parts.push(`${studyTypeLabel} study (+${studyScore})`);

  parts.push(`${journalQuality} journal (+${JOURNAL_QUALITY_SCORES[journalQuality]})`);

  const validationLabel = validationType === 'human' ? 'Human-validated' : validationType === 'animal' ? 'Animal model' : 'Computational/predicted';
  parts.push(`${validationLabel} (+${VALIDATION_SCORES[validationType]})`);

  if (contradictionPenalty > 0) {
    parts.push(`contradictory evidence detected (-${contradictionPenalty})`);
  }

  parts.push(`Normalized: ${normalizedScore}/100`);

  return parts.join('; ');
}

/**
 * Score a single evidence item.
 */
export function scoreEvidence(input: EvidenceInput): ScoredEvidence {
  const studyType = classifyStudyType(input.title, input.abstract, input.studyType);
  const journalQuality = assessJournalQuality(input.journal);
  const validationType = determineValidationType(input.title, input.abstract);

  const studyTypeScore = STUDY_TYPE_SCORES[studyType] ?? 5;
  const journalQualityScore = JOURNAL_QUALITY_SCORES[journalQuality];
  const validationScore = VALIDATION_SCORES[validationType];

  const rawScore = studyTypeScore + journalQualityScore + validationScore;
  const maxPossible = 40 + 20 + 20; // 80
  const normalizedScore = Math.min(100, Math.round((rawScore / maxPossible) * 100));

  // v30: Thresholds aligned with PDF Scoring Guide: ≥75=High, 50-74=Moderate, <50=Low
  let evidenceLevel: 'High' | 'Moderate' | 'Low';
  if (normalizedScore >= 75) evidenceLevel = 'High';
  else if (normalizedScore >= 50) evidenceLevel = 'Moderate';
  else evidenceLevel = 'Low';

  let confidenceCategory: 'Strong' | 'Moderate' | 'Weak';
  if (normalizedScore >= 75) confidenceCategory = 'Strong';
  else if (normalizedScore >= 50) confidenceCategory = 'Moderate';
  else confidenceCategory = 'Weak';

  const rationale = generateRationale(studyType, journalQuality, validationType, 0, normalizedScore);

  const largeScale = isLargeScaleSingleSource(studyType, input.title, input.abstract);

  return {
    rawScore,
    normalizedScore,
    evidenceLevel,
    confidenceCategory,
    breakdown: {
      studyTypeScore,
      journalQualityScore,
      validationScore,
      contradictionPenalty: 0,
    },
    rationale,
    isLargeScaleSingleSource: largeScale,
  };
}

/**
 * Score a set of evidence items, applying proportional contradiction detection.
 */
export function scoreEvidenceSet(inputs: EvidenceInput[]): ScoredEvidence[] {
  const { hasContradictions, severity } = detectContradictions(inputs);

  const penaltyMap = {
    none: 0,
    weak: CONTRADICTION_PENALTY_WEAK,
    moderate: CONTRADICTION_PENALTY_MODERATE,
    strong: CONTRADICTION_PENALTY_STRONG,
  };

  const contradictionPenalty = penaltyMap[severity];

  const scoredResults = inputs.map(input => {
    const scored = scoreEvidence(input);
    if (hasContradictions && contradictionPenalty > 0) {
      scored.breakdown.contradictionPenalty = contradictionPenalty;
      const adjustedRaw = Math.max(0, scored.rawScore - contradictionPenalty);
      const maxPossible = 80;
      scored.rawScore = adjustedRaw;
      scored.normalizedScore = Math.min(100, Math.round((adjustedRaw / maxPossible) * 100));

      // v30: Thresholds aligned with PDF Scoring Guide
      if (scored.normalizedScore >= 75) scored.evidenceLevel = 'High';
      else if (scored.normalizedScore >= 50) scored.evidenceLevel = 'Moderate';
      else scored.evidenceLevel = 'Low';

      if (scored.normalizedScore >= 75) scored.confidenceCategory = 'Strong';
      else if (scored.normalizedScore >= 50) scored.confidenceCategory = 'Moderate';
      else scored.confidenceCategory = 'Weak';

      // Update rationale
      scored.rationale = generateRationale(
        classifyStudyType(input.title, input.abstract, input.studyType),
        assessJournalQuality(input.journal),
        determineValidationType(input.title, input.abstract),
        contradictionPenalty,
        scored.normalizedScore,
      );
    }
    return scored;
  });

  // Evidence Inflation Ceiling: single-study evidence capped at 49/100 unless exempt
  if (scoredResults.length === 1) {
    const single = scoredResults[0];
    if (!single.isLargeScaleSingleSource && single.normalizedScore > 49) {
      single.normalizedScore = 49;
      single.evidenceLevel = 'Low';
      single.confidenceCategory = 'Weak';
      single.rationale += '; Evidence inflation ceiling applied: single-study evidence capped at 49/100';
    }
  }

  return scoredResults;
}

/**
 * Compute aggregate score from a set of scored evidence.
 * Uses weighted average with evidence quality weighting.
 */
export function computeAggregateScore(scores: ScoredEvidence[]): AggregateScore {
  if (scores.length === 0) {
    return { aggregateScore: 0, evidenceLevel: 'Low', confidence: 'Weak', rationale: 'No evidence available' };
  }

  // Weight higher-quality evidence more heavily
  const weightedSum = scores.reduce((sum, s) => sum + s.normalizedScore * (s.normalizedScore / 100), 0);
  const weightTotal = scores.reduce((sum, s) => sum + (s.normalizedScore / 100), 0);

  const aggregateScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;

  // v30: Thresholds aligned with PDF Scoring Guide
  let evidenceLevel: string;
  if (aggregateScore >= 75) evidenceLevel = 'High';
  else if (aggregateScore >= 50) evidenceLevel = 'Moderate';
  else evidenceLevel = 'Low';

  let confidence: string;
  if (aggregateScore >= 75) confidence = 'Strong';
  else if (aggregateScore >= 50) confidence = 'Moderate';
  else confidence = 'Weak';

  // Generate aggregate rationale
  const highCount = scores.filter(s => s.evidenceLevel === 'High').length;
  const modCount = scores.filter(s => s.evidenceLevel === 'Moderate').length;
  const lowCount = scores.filter(s => s.evidenceLevel === 'Low').length;
  const hasContradictions = scores.some(s => s.breakdown.contradictionPenalty > 0);

  // Evidence Inflation Ceiling: single-study aggregate capped at 49/100 unless exempt
  let inflationCeilingApplied = false;
  let finalScore = aggregateScore;
  if (scores.length === 1 && !scores[0].isLargeScaleSingleSource && finalScore > 49) {
    finalScore = 49;
    inflationCeilingApplied = true;
  }

  // Re-classify with (possibly capped) finalScore
  if (finalScore >= 75) evidenceLevel = 'High';
  else if (finalScore >= 50) evidenceLevel = 'Moderate';
  else evidenceLevel = 'Low';

  if (finalScore >= 75) confidence = 'Strong';
  else if (finalScore >= 50) confidence = 'Moderate';
  else confidence = 'Weak';

  const rationaleParts = [
    `${scores.length} studies: ${highCount} High, ${modCount} Moderate, ${lowCount} Low`,
    `Aggregate weighted score: ${finalScore}/100`,
  ];
  if (hasContradictions) {
    rationaleParts.push('Contradictory evidence detected in at least one study');
  }
  if (inflationCeilingApplied) {
    rationaleParts.push('Evidence inflation ceiling applied: single-study evidence capped at 49/100');
  }
  rationaleParts.push(`Overall assessment: ${evidenceLevel} evidence, ${confidence} confidence`);

  return { aggregateScore: finalScore, evidenceLevel, confidence, rationale: rationaleParts.join('. ') + '.' };
}
