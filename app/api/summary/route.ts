import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ═══════════════════════════════════════════════════════════════════════════
// PHARMAINSIGHT — AI EVIDENCE SYNTHESIS ENGINE v3.0
// Publication-grade scientific reporting with z-ai-web-dev-sdk
// ═══════════════════════════════════════════════════════════════════════════

type StudyTier = 'Meta-analysis' | 'Systematic Review' | 'Randomized Clinical Trial' | 'Cohort Study' | 'Case Report' | 'Animal Study' | 'In Vitro Study' | 'Mechanistic Study';

function classifyStudyTier(studyType: string, title: string, abstract: string): StudyTier {
  const t = (title + ' ' + abstract).toLowerCase();
  const st = studyType.toLowerCase();
  if (st.includes('meta-analysis') || t.includes('meta-analysis') || t.includes('meta analysis')) return 'Meta-analysis';
  if (st.includes('systematic review') || t.includes('systematic review')) return 'Systematic Review';
  if (st.includes('randomized controlled') || st.includes('rct') || /\brct\b/.test(t)) return 'Randomized Clinical Trial';
  if (st.includes('cohort') || t.includes('cohort study')) return 'Cohort Study';
  if (st.includes('case report') || t.includes('case report')) return 'Case Report';
  if (st.includes('animal') || /\brat\b/.test(t) || /\bmice\b/.test(t)) return 'Animal Study';
  if (st.includes('in vitro') || t.includes('in vitro')) return 'In Vitro Study';
  return 'Mechanistic Study';
}

function buildEvidenceProfile(tiers: StudyTier[]) {
  return {
    human: tiers.filter(t => ['Randomized Clinical Trial', 'Cohort Study', 'Case Report'].includes(t)).length,
    animal: tiers.filter(t => t === 'Animal Study').length,
    mechanistic: tiers.filter(t => ['In Vitro Study', 'Mechanistic Study'].includes(t)).length,
    reviews: tiers.filter(t => ['Meta-analysis', 'Systematic Review'].includes(t)).length,
  };
}

function assessOverallEvidence(tiers: StudyTier[], evidenceLevels: string[]): string {
  const profile = buildEvidenceProfile(tiers);
  const highCount = evidenceLevels.filter(e => e === 'High').length;
  const modCount = evidenceLevels.filter(e => e === 'Moderate').length;
  if (profile.reviews >= 1 && (highCount >= 1 || modCount >= 3)) return 'Strong';
  if (profile.reviews >= 1) return 'Moderate';
  if (profile.human >= 3 && (highCount >= 1 || modCount >= 2)) return 'Moderate';
  if (profile.human >= 1) return 'Limited';
  if (profile.animal >= 2 || profile.mechanistic >= 3) return 'Limited';
  return 'Very Limited';
}

function scrubAbstractStyle(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/^(BACKGROUND|OBJECTIVE|METHODS?|RESULTS?|CONCLUSIONS?|AIM|PURPOSE|INTRODUCTION|DISCUSSION):\s*/gim, '');
  cleaned = cleaned.replace(/\b(?:we|our|us)\s+(?:present|report|describe|investigated|examined|evaluated|assessed|analyzed|conducted|performed|observed|found|show|demonstrate|confirm|propose|suggest)\b/gi, 'the study');
  cleaned = cleaned.replace(/\bthis is the (?:first|initial) (?:study|report|case|investigation) (?:to |that )?/gi, '');
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned;
}

// ─── INTERACTION SYSTEM PROMPT (Comprehensive Scientific Standards) ──────
const INTERACTION_SYSTEM_PROMPT = `You are PharmaInsight, a scientifically rigorous evidence-synthesis and pharmacological reporting system specialized in drug-herb interactions, pharmacovigilance, and biomedical literature analysis.

Your primary role is to generate structured, publication-oriented scientific reports derived from biomedical literature, pharmacological databases, mechanistic evidence, and clinically relevant scientific sources.

PRIORITY: Prioritize scientific caution, methodological transparency, and evidence hierarchy over persuasive or promotional language. Write as a scientific analyst, pharmacology reviewer, or academic editor.

GENERAL PRINCIPLES:
- Write in formal academic English.
- Maintain a neutral, evidence-based, and analytically cautious tone.
- Avoid marketing language, exaggeration, certainty inflation, and unsupported conclusions.
- Prefer scientific precision over rhetorical emphasis.
- Use terminology consistently throughout the report.
- Avoid unnecessary repetition, verbose disclaimers, and decorative language.
- Ensure all sections remain logically coherent and publication-oriented.

SCIENTIFIC WRITING REQUIREMENTS:
- Use academically cautious language.
- Distinguish clearly between confirmed clinical evidence, mechanistic plausibility, pharmacovigilance signals, observational associations, preclinical findings, and hypothesis-generating evidence.
- Avoid causal claims unless supported by strong evidence.
- Use cautious scientific phrasing such as: suggests, indicates, may be associated with, is consistent with, warrants further investigation, remains preliminary, demonstrates limited evidence.
- Explicitly acknowledge uncertainty when evidence is limited, inconsistent, indirect, or heterogeneous.
- Do not overstate clinical significance from mechanistic findings alone.
- Do not convert theoretical or in vitro findings into clinical conclusions.

EVIDENCE HIERARCHY:
- Highest priority: systematic reviews, meta-analyses, randomized controlled trials, controlled human clinical studies.
- Moderate priority: observational studies, cohort studies, case-control studies.
- Lower priority: case reports, animal studies, in vitro studies, mechanistic studies, computational predictions.
- Do not increase evidence confidence solely because multiple low-quality studies report similar findings.

EVIDENCE INTERPRETATION:
- Separate evidence quality from clinical severity.
- Distinguish pharmacodynamic from pharmacokinetic interactions.
- Distinguish mechanistic plausibility from clinically validated interactions.
- Explain whether findings represent confirmed interactions, possible interactions, theoretical concerns, pharmacovigilance signals, or indirect mechanistic hypotheses.
- If evidence is contradictory, state this explicitly.
- If evidence is weak, state this clearly.
- If evidence is absent, state that directly without speculation.
- If evidence is preliminary, emphasize the provisional nature of conclusions.

PHARMACOVIGILANCE RULES:
- Pharmacovigilance signals do not establish causality.
- Spontaneous reports and safety databases may contain reporting bias, incomplete clinical information, confounding variables, and uncertain causality.
- Present safety signals cautiously and contextually.
- Do not interpret signal detection as proof of clinical harm.

MECHANISTIC INTERPRETATION:
- Do not infer molecular mechanisms not explicitly supported by cited literature or validated pharmacological databases.
- Do not generalize isolated compound findings to whole plant extracts unless extract-level relevance is supported.
- Clearly distinguish transporter-mediated interactions, CYP-mediated metabolism, receptor-mediated effects, pharmacodynamic overlap, additive toxicities, and immunological modulation.
- Avoid speculative pathway expansion.

SCORING SYSTEM RULES:
- Preserve existing evidence scoring systems and thresholds.
- Maintain consistent evidence categories and classification logic.
- Briefly explain scoring methodology when relevant.
- Ensure evidence scores remain aligned with actual evidence quality.
- Avoid arbitrary score inflation.

ANTI-FABRICATION CLAUSE:
Do not fabricate mechanistic pathways, study outcomes, statistical significance, dosage data, patient outcomes, or clinical recommendations when such information is absent from the cited evidence. If the evidence does not explicitly support a claim, state that the information is unavailable, inconclusive, or not established.

CITATION-GROUNDING ENFORCEMENT:
All mechanistic claims, interaction claims, and clinical interpretations must remain traceable to cited evidence or validated pharmacological knowledge sources. Do not present unsupported inferences as established findings.

EXTRACT AND MATERIAL TYPE DISTINCTION:
Differentiate standardized extracts, isolated compounds, crude plant materials, commercial formulations, and dose forms when interpreting pharmacological evidence. Do not generalize findings from one material type to another unless the literature explicitly supports that inference.

TRANSLATIONAL CAUTION:
Preclinical findings should not be interpreted as evidence of therapeutic efficacy in humans without appropriate clinical validation. Animal, in vitro, and computational findings may support mechanistic plausibility, but they do not establish human clinical benefit.

STATISTICAL CAUTION:
Avoid implying statistical robustness when study size, reproducibility, or methodological quality is insufficient. Do not overstate confidence in small, single-center, underpowered, or poorly controlled studies.

DOSE-DEPENDENCY CAUTION:
Do not assume that observed interactions apply uniformly across all doses, formulations, durations of exposure, or administration routes. Where dosage information is limited or absent, explicitly acknowledge this limitation.

POPULATION-SPECIFIC INTERPRETATION:
Avoid generalizing findings across populations when evidence is derived from specific demographic, genetic, disease-specific, or geographically restricted cohorts.

NEGATIVE AND NULL EVIDENCE HANDLING:
Negative, null, or non-confirmatory findings should be represented fairly when available and should not be omitted solely because positive findings exist.

MULTI-MECHANISM INTERPRETATION:
When multiple hypothetical mechanisms are reported, distinguish established mechanisms from speculative or incompletely validated pathways. Do not merge separate mechanisms into a single unsupported conclusion.

SCIENTIFIC TONE ENFORCEMENT:
Avoid sensational, alarming, absolute, or commercially persuasive language. Use measured phrasing that reflects uncertainty where appropriate and avoids overstatement.

DRUG-HERB INTERACTION REPORT RULES:
- Clearly identify the drug, the herb, and the interaction category.
- Separate pharmacokinetic mechanisms, pharmacodynamic mechanisms, transporter-related effects, CYP-related metabolism, and overlapping toxicities.
- Clarify whether evidence represents an established clinical interaction, potential interaction, mechanistic concern, or theoretical possibility.
- Discuss monitoring implications cautiously.
- Avoid direct medical recommendations unless strongly evidence-supported.

OUTPUT FORMAT — Return a JSON object with exactly these fields:
{
  "executiveSummary": "2-3 paragraph analytical summary of the interaction, its clinical significance, and evidence quality",
  "evidenceSynthesis": "3-5 paragraph detailed synthesis of the available evidence, integrating findings across studies with evidence hierarchy awareness",
  "mechanisticInterpretation": "2-3 paragraph analysis of the molecular/pharmacological mechanisms, distinguishing confirmed from theoretical",
  "clinicalRelevance": "2-3 paragraph assessment of clinical relevance, population considerations, and dose-dependency",
  "discussion": "3-4 paragraph critical interpretation comparing stronger and weaker evidence, identifying inconsistencies and gaps, contextualizing mechanistic findings, discussing methodological weaknesses",
  "limitations": "2-3 paragraph explicit acknowledgment of evidence limitations, indirect evidence, sample size issues, inconsistent findings, lack of clinical validation, methodological heterogeneity",
  "conclusion": "1-2 paragraph concise evidence-based conclusion that summarizes only what the evidence supports and acknowledges uncertainty"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no commentary outside the JSON.`;

// ─── PHARMACOLOGY SYSTEM PROMPT (Comprehensive Scientific Standards) ─────
const PHARMACOLOGY_SYSTEM_PROMPT = `You are PharmaInsight, a scientifically rigorous evidence-synthesis and pharmacological reporting system specialized in pharmacology, phytochemistry, herb-drug interactions, pharmacovigilance, translational therapeutics, and biomedical literature analysis.

Your primary role is to generate structured, publication-oriented scientific reports derived from biomedical literature, pharmacological databases, mechanistic evidence, and clinically relevant scientific sources.

PRIORITY: Prioritize scientific caution, methodological transparency, and evidence hierarchy over persuasive or promotional language. Write as a scientific analyst, pharmacology reviewer, or academic editor.

GENERAL PRINCIPLES:
- Write in formal academic English.
- Maintain a neutral, evidence-based, and analytically cautious tone.
- Avoid marketing language, exaggeration, certainty inflation, and unsupported conclusions.
- Prefer scientific precision over rhetorical emphasis.
- Use terminology consistently throughout the report.
- Avoid unnecessary repetition, verbose disclaimers, and decorative language.
- Ensure all sections remain logically coherent and publication-oriented.

SCIENTIFIC WRITING REQUIREMENTS:
- Use academically cautious language.
- Distinguish clearly between confirmed clinical evidence, mechanistic plausibility, pharmacovigilance signals, observational associations, preclinical findings, and hypothesis-generating evidence.
- Avoid causal claims unless supported by strong evidence.
- Use cautious scientific phrasing: suggests, indicates, may be associated with, is consistent with, warrants further investigation, remains preliminary, demonstrates limited evidence.
- Explicitly acknowledge uncertainty when evidence is limited, inconsistent, indirect, or heterogeneous.
- Do not overstate clinical significance from mechanistic findings alone.
- Do not convert theoretical or in vitro findings into clinical conclusions.

EVIDENCE HIERARCHY:
- Highest priority: systematic reviews, meta-analyses, randomized controlled trials, controlled human clinical studies.
- Moderate priority: observational studies, cohort studies, case-control studies.
- Lower priority: case reports, animal studies, in vitro studies, mechanistic studies, computational predictions.
- Do not increase evidence confidence solely because multiple low-quality studies report similar findings.

EVIDENCE INTERPRETATION:
- Separate evidence quality from clinical significance.
- Distinguish mechanistic plausibility from clinical efficacy.
- If evidence is contradictory, state this explicitly.
- If evidence is weak, state this clearly.
- If evidence is absent, say so explicitly.
- If evidence is preliminary, frame conclusions conservatively.

MECHANISTIC INTERPRETATION:
- Do not infer molecular mechanisms not explicitly supported by cited literature.
- Do not generalize isolated compound findings to whole plant extracts unless extract-level relevance is supported.
- Clearly distinguish receptor-mediated effects, enzyme inhibition/induction, ion channel modulation, gene expression changes, and signaling pathway alterations.
- Avoid speculative pathway expansion.

ANTI-FABRICATION CLAUSE:
Do not fabricate mechanistic pathways, study outcomes, statistical significance, dosage data, or clinical recommendations when such information is absent from the cited evidence.

CITATION-GROUNDING ENFORCEMENT:
All pharmacological claims and clinical interpretations must remain traceable to cited evidence or validated pharmacological knowledge sources.

EXTRACT AND MATERIAL TYPE DISTINCTION:
Differentiate standardized extracts, isolated compounds, crude plant materials, commercial formulations, and dose forms when interpreting pharmacological evidence.

TRANSLATIONAL CAUTION:
Preclinical findings should not be interpreted as evidence of therapeutic efficacy in humans without appropriate clinical validation. Animal, in vitro, and computational findings may support mechanistic plausibility, but they do not establish human clinical benefit.

STATISTICAL CAUTION:
Avoid implying statistical robustness when study size, reproducibility, or methodological quality is insufficient.

DOSE-DEPENDENCY CAUTION:
Do not assume that observed pharmacological effects apply uniformly across all doses, formulations, durations, or administration routes.

POPULATION-SPECIFIC INTERPRETATION:
Avoid generalizing findings across populations when evidence is derived from specific demographic or disease-specific cohorts.

PHARMACOLOGICAL PROFILE REPORT RULES:
- Organize findings by pharmacological activity.
- Prioritize higher-quality evidence.
- Distinguish active compounds from hypothesized constituents.
- Connect mechanisms to supporting literature.
- Avoid presenting exploratory findings as established therapeutics.
- Separate experimentally validated effects from speculative mechanisms.

OUTPUT FORMAT — Return a JSON object with exactly these fields:
{
  "executiveSummary": "2-3 paragraph analytical summary of the pharmacological profile, key bioactive compounds, and evidence quality",
  "evidenceSynthesis": "3-5 paragraph detailed synthesis of pharmacological evidence, integrating findings with evidence hierarchy awareness",
  "mechanisticInterpretation": "2-3 paragraph analysis of molecular mechanisms, distinguishing confirmed from theoretical, compound-specific vs extract-level effects",
  "clinicalRelevance": "2-3 paragraph assessment of clinical translatability, population considerations, and formulation differences",
  "discussion": "3-4 paragraph critical interpretation comparing stronger and weaker evidence, identifying inconsistencies and gaps, discussing reproducibility, biological plausibility, and translational limitations",
  "limitations": "2-3 paragraph explicit acknowledgment of evidence limitations, small sample sizes, methodological heterogeneity, lack of clinical validation, incomplete mechanistic characterization",
  "conclusion": "1-2 paragraph concise evidence-based conclusion that summarizes only what the evidence supports and acknowledges uncertainty"
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no commentary outside the JSON.`;

// ─── FALLBACK: Interaction Summary ──────────────────────────────────────
function generateLocalInteractionSummary(
  studies: { title: string; abstract: string; pmid: string; tier: StudyTier; evidenceLevel: string }[],
  drug: string,
  herb: string
): Record<string, string> {
  const profile = buildEvidenceProfile(studies.map(s => s.tier));
  const overallStrength = assessOverallEvidence(studies.map(s => s.tier), studies.map(s => s.evidenceLevel));

  let executiveSummary = '';
  if (profile.reviews > 0 && profile.human > 0) {
    executiveSummary += `The interaction between ${drug} and ${herb} has been examined in ${profile.reviews} review(s) alongside ${profile.human} human clinical study/studies, providing a moderately characterized evidence base. `;
  } else if (profile.human > 0) {
    executiveSummary += `Available evidence for the interaction between ${drug} and ${herb} comprises ${profile.human} human clinical study/studies${profile.animal > 0 ? ` and ${profile.animal} animal investigation(s)` : ''}, though the overall literature remains limited. `;
  } else if (profile.animal > 0 || profile.mechanistic > 0) {
    executiveSummary += `Direct human clinical evidence for the interaction between ${drug} and ${herb} is currently lacking; the available literature consists primarily of ${profile.animal > 0 ? `${profile.animal} animal study/studies` : ''}${profile.animal > 0 && profile.mechanistic > 0 ? ' and ' : ''}${profile.mechanistic > 0 ? `${profile.mechanistic} mechanistic investigation(s)` : ''}, which may support mechanistic plausibility but does not establish clinical significance. `;
  } else {
    executiveSummary += `The current literature provides limited directly relevant evidence for the interaction between ${drug} and ${herb}. `;
  }

  let conclusion = '';
  if (overallStrength === 'Very Limited' || overallStrength === 'Limited') {
    conclusion = `The current evidence base remains insufficient for definitive conclusions regarding the clinical significance of the interaction between ${drug} and ${herb}, and well-designed clinical studies are needed to clarify the nature and relevance of this potential interaction.`;
  } else if (overallStrength === 'Moderate') {
    conclusion = `While the available evidence provides some insight into the interaction between ${drug} and ${herb}, additional rigorous clinical studies would further clarify the interaction profile, dose-dependency, and clinical implications.`;
  } else if (overallStrength === 'Strong') {
    conclusion = `The evidence base for the interaction between ${drug} and ${herb} is relatively robust, though heterogeneity in study designs and populations warrants consideration when interpreting the clinical applicability of these findings.`;
  }

  executiveSummary = scrubAbstractStyle(executiveSummary);
  conclusion = scrubAbstractStyle(conclusion);

  return {
    executiveSummary,
    evidenceSynthesis: `The available PubMed literature for the interaction between ${drug} and ${herb} encompasses ${studies.length} studies, of which ${profile.human} are human clinical investigations, ${profile.animal} are animal studies, ${profile.mechanistic} are mechanistic/in vitro studies, and ${profile.reviews} are systematic reviews or meta-analyses. The evidence profile indicates a ${overallStrength.toLowerCase()} overall evidence base. The findings should be interpreted with appropriate caution given the methodological limitations and heterogeneity inherent in the available literature.`,
    mechanisticInterpretation: `The mechanistic basis for the interaction between ${drug} and ${herb} remains incompletely characterized. Available evidence suggests possible pharmacokinetic and/or pharmacodynamic mechanisms; however, the precise molecular pathways and their clinical relevance have not been fully established. Further investigation is warranted to clarify the mechanistic underpinnings of this interaction.`,
    clinicalRelevance: `The clinical relevance of the interaction between ${drug} and ${herb} depends on multiple factors including dosage, duration of co-administration, patient-specific characteristics, and formulation differences. The current evidence does not permit definitive clinical recommendations, and healthcare providers should exercise caution when considering concurrent use.`,
    discussion: `The evidence regarding the interaction between ${drug} and ${herb} presents several methodological considerations. The heterogeneity of study designs, varying quality of evidence across studies, and limited direct clinical data all constrain the confidence with which conclusions can be drawn. The discrepancy between mechanistic plausibility and clinical validation remains a significant gap in the literature. Publication bias, small sample sizes, and the observational nature of much of the evidence further limit the interpretability of the available data.`,
    limitations: `Key limitations of the current evidence base include: (1) limited direct human clinical evidence for the specific interaction between ${drug} and ${herb}; (2) methodological heterogeneity across studies; (3) potential publication bias favoring positive findings; (4) incomplete mechanistic characterization; (5) uncertainty regarding dose-dependency and formulation-specific effects; and (6) lack of population-specific data for many demographic and clinical subgroups. These limitations should be considered when interpreting the findings of this report.`,
    conclusion,
  };
}

// ─── FALLBACK: Pharmacology Summary ─────────────────────────────────────
function generateLocalPharmacologySummary(
  actions: { name: string; score?: number; pmids?: string[]; mechanisms?: { name: string; pmids?: string[] }[] }[],
  herb: string
): Record<string, string> {
  const strong = actions.filter(a => (a.score ?? 0) >= 75);
  const moderate = actions.filter(a => (a.score ?? 0) >= 50 && (a.score ?? 0) < 75);
  const weak = actions.filter(a => (a.score ?? 0) < 50);
  const totalRefs = new Set(actions.flatMap(a => a.pmids ?? [])).size;

  let executiveSummary = '';
  if (strong.length > 0) {
    executiveSummary += `The pharmacological profile of ${herb} is supported by a relatively substantial evidence base spanning ${actions.length} documented action(s) across ${totalRefs} PubMed reference(s). The most well-characterized activities include ${strong.map(a => a.name).join(', ')}. `;
    if (moderate.length > 0) {
      executiveSummary += `Moderately supported activities include ${moderate.map(a => a.name).join(', ')}, though these findings require further clinical validation. `;
    }
  } else if (moderate.length > 0) {
    executiveSummary += `The PubMed literature documents ${actions.length} pharmacological action(s) for ${herb} across ${totalRefs} reference(s). Moderately supported activities include ${moderate.map(a => a.name).join(', ')}, though the evidence base remains insufficient for definitive therapeutic conclusions. `;
  } else {
    executiveSummary += `The available PubMed literature identifies ${actions.length} pharmacological action(s) for ${herb}, though the current evidence base remains predominantly preliminary and does not establish clinical efficacy. `;
  }

  if (weak.length > 0) {
    executiveSummary += `Preliminary evidence suggests possible ${weak.slice(0, 3).map(a => a.name).join(', ')} activity; however, these findings remain hypothesis-generating and require further rigorous validation before clinical extrapolation. `;
  }

  executiveSummary = scrubAbstractStyle(executiveSummary);

  const strength = strong.length >= 2 ? 'Strong' : moderate.length >= 1 ? 'Moderate' : 'Limited';

  return {
    executiveSummary,
    evidenceSynthesis: `The pharmacological evidence base for ${herb} comprises ${actions.length} documented pharmacological action(s) with ${totalRefs} PubMed reference(s). Of these, ${strong.length} action(s) demonstrate strong evidence support (score >= 75), ${moderate.length} demonstrate moderate support (score 50-74), and ${weak.length} show preliminary evidence only (score < 50). The overall evidence strength is assessed as ${strength}. It is important to note that the quality and consistency of evidence varies substantially across different pharmacological actions, and the overall assessment should not be interpreted as uniformly applicable to all reported activities.`,
    mechanisticInterpretation: `The molecular mechanisms underlying the pharmacological actions of ${herb} involve multiple bioactive compounds acting through diverse pathways. However, the precise mechanistic characterization remains incomplete for many reported activities. Where mechanisms have been proposed, they are often based on in vitro or animal studies, and their relevance to human clinical effects has not been established in all cases. Findings from isolated compounds should not be generalized to whole plant extracts or commercial formulations without explicit supporting evidence.`,
    clinicalRelevance: `The clinical translatability of the pharmacological findings for ${herb} requires careful consideration. Preclinical evidence, while suggestive of biological activity, does not establish therapeutic efficacy in humans. Factors including dose-response relationships, bioavailability, formulation differences, and population-specific effects remain incompletely characterized. Healthcare providers should exercise caution in extrapolating the available evidence to clinical practice.`,
    discussion: `The pharmacological evidence for ${herb} presents both strengths and notable limitations. The strongest evidence supports ${strong.length > 0 ? strong.map(a => a.name).join(' and ') : 'none of the reported activities'} with direct clinical validation, while other reported activities rely predominantly on preclinical data. Methodological heterogeneity across studies, variation in extract types and standardization, and the frequent absence of dose-response data limit the interpretability of the findings. The potential for publication bias favoring positive results should also be considered when evaluating the overall evidence landscape.`,
    limitations: `Key limitations include: (1) reliance on preclinical evidence for many reported pharmacological actions; (2) methodological heterogeneity in study designs and outcome measures; (3) incomplete characterization of dose-response relationships; (4) variability in extract standardization and formulation across studies; (5) limited population-specific data; (6) potential publication bias; and (7) the challenge of generalizing findings from isolated compounds to whole plant preparations. These limitations should be carefully considered when interpreting the clinical significance of the reported pharmacological activities.`,
    conclusion: `The pharmacological profile of ${herb} is supported by ${strength.toLowerCase()} evidence, with ${strong.length > 0 ? 'some activities demonstrating well-characterized effects' : 'most activities remaining at the preliminary evidence stage'}. While the available data suggest biological plausibility for several pharmacological actions, definitive clinical conclusions cannot be drawn for all reported activities without further rigorous clinical validation. The evidence base would benefit from well-designed randomized controlled trials with standardized preparations and clearly defined clinical endpoints.`,
  };
}

// ─── Parse AI response as structured JSON ───────────────────────────────
function parseStructuredResponse(raw: string): Record<string, string> | null {
  try {
    // Try direct JSON parse first
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.executiveSummary) {
      return parsed;
    }
  } catch {
    // Try to extract JSON from markdown code fences
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1].trim());
        if (parsed && typeof parsed === 'object' && parsed.executiveSummary) {
          return parsed;
        }
      } catch {
        // Continue to next extraction attempt
      }
    }

    // Try to find JSON object in the text
    const braceMatch = raw.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        const parsed = JSON.parse(braceMatch[0]);
        if (parsed && typeof parsed === 'object' && parsed.executiveSummary) {
          return parsed;
        }
      } catch {
        // Continue
      }
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    const { type, data, drug, herb } = await req.json();

    if (type === 'interaction') {
      const studies: { pmid: string; title: string; abstract: string; evidenceLevel: string; studyType: string }[] = data;
      const classified = studies.map(s => ({
        ...s,
        tier: classifyStudyTier(s.studyType, s.title, s.abstract),
      }));

      const profile = buildEvidenceProfile(classified.map(s => s.tier));
      const overallStrength = assessOverallEvidence(classified.map(s => s.tier), classified.map(s => s.evidenceLevel));

      const studyTexts = classified.slice(0, 10).map((s, i) => {
        const abs = s.abstract.length > 400 ? s.abstract.substring(0, 400) + ' [...]' : s.abstract;
        return `[${i + 1}] PMID:${s.pmid} | ${s.tier} | ${s.evidenceLevel} Evidence\nTitle: ${s.title}\nKey points: ${abs}`;
      });

      const userPrompt = `DRUG: ${drug}
HERB: ${herb}

EVIDENCE CONTEXT:
- Human Studies: ${profile.human}
- Animal Studies: ${profile.animal}
- Mechanistic Studies: ${profile.mechanistic}
- Reviews: ${profile.reviews}
- Overall Evidence Strength: ${overallStrength}

STUDIES:
${studyTexts.join('\n\n')}

Now generate the structured scientific report for this drug-herb interaction. Return ONLY valid JSON.`;

      // Try z-ai-web-dev-sdk
      try {
        const zai = await ZAI.create();
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: INTERACTION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const structured = parseStructuredResponse(content);
          if (structured) {
            // Scrub all text fields
            for (const key of Object.keys(structured)) {
              if (typeof structured[key] === 'string') {
                structured[key] = scrubAbstractStyle(structured[key]);
              }
            }
            return NextResponse.json({ text: structured, source: 'AI Evidence Synthesis (PharmaInsight Engine v3.0)', structured: true });
          }
          // If we got content but couldn't parse it as structured, return as plain text
          return NextResponse.json({ text: scrubAbstractStyle(content), source: 'AI Evidence Synthesis (PharmaInsight Engine v3.0)', structured: false });
        }
      } catch (aiError) {
        console.error('z-ai-web-dev-sdk error:', aiError);
      }

      // Fallback to rule-based synthesis
      const fallbackResult = generateLocalInteractionSummary(classified, drug || 'Unknown', herb || 'Unknown');
      return NextResponse.json({
        text: fallbackResult,
        source: 'Evidence-Based Summary (offline synthesis)',
        structured: true,
      });
    }

    if (type === 'pharmacology') {
      const actions: { name: string; score?: number; pmids?: string[]; mechanisms?: { name: string; pmids?: string[] }[] }[] = data;
      const herbName = herb || 'Unknown';

      const actionTexts = actions.slice(0, 12).map(a => {
        const strength = (a.score ?? 0) >= 75 ? 'Well-supported' : (a.score ?? 0) >= 50 ? 'Moderately supported' : 'Preliminary';
        const mechNames = (a.mechanisms ?? []).map(m => typeof m === 'string' ? m : m.name).join('; ');
        return `- ${a.name} [${strength}, score: ${a.score ?? 0}]${mechNames ? ` — Mechanisms: ${mechNames}` : ''}`;
      });

      const userPrompt = `NATURAL PRODUCT: ${herbName}

PHARMACOLOGICAL ACTIONS:
${actionTexts.join('\n')}

Now generate the structured scientific report for this pharmacological profile. Return ONLY valid JSON.`;

      // Try z-ai-web-dev-sdk
      try {
        const zai = await ZAI.create();
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: PHARMACOLOGY_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        });

        const content = completion.choices[0]?.message?.content;
        if (content) {
          const structured = parseStructuredResponse(content);
          if (structured) {
            for (const key of Object.keys(structured)) {
              if (typeof structured[key] === 'string') {
                structured[key] = scrubAbstractStyle(structured[key]);
              }
            }
            return NextResponse.json({ text: structured, source: 'AI Evidence Synthesis (PharmaInsight Engine v3.0)', structured: true });
          }
          return NextResponse.json({ text: scrubAbstractStyle(content), source: 'AI Evidence Synthesis (PharmaInsight Engine v3.0)', structured: false });
        }
      } catch (aiError) {
        console.error('z-ai-web-dev-sdk error:', aiError);
      }

      // Fallback to rule-based synthesis
      const fallbackResult = generateLocalPharmacologySummary(actions, herbName);
      return NextResponse.json({
        text: fallbackResult,
        source: 'Evidence-Based Summary (offline synthesis)',
        structured: true,
      });
    }

    return NextResponse.json({ error: 'Invalid summary type.' }, { status: 400 });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
  }
}
