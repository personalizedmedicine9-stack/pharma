import { NextRequest, NextResponse } from 'next/server';
import { generateDrugPDF, generateHerbPDF } from '@/lib/pdf-generate-server';
import type { StudyResult, FdaDrugData, PharmacologyAction, PharmacologyCompound } from '@/lib/types';

// Sample data for testing PDF generation
const sampleStudy: StudyResult = {
  title: 'Warfarin-Ginkgo Interaction: A Systematic Review of Pharmacokinetic and Pharmacodynamic Mechanisms',
  source: 'PubMed',
  pubmedLink: 'https://pubmed.ncbi.nlm.nih.gov/38964625/',
  pmid: '38964625',
  doi: '10.1016/j.ejphar.2024.176123',
  doiLink: 'https://doi.org/10.1016/j.ejphar.2024.176123',
  journal: 'European Journal of Pharmacology',
  pubYear: '2024',
  authors: ['Zhang Y', 'Wang L', 'Chen X'],
  abstract: 'This systematic review evaluated the clinical evidence for interactions between warfarin and Ginkgo biloba extracts. Our analysis of 12 clinical trials and 8 preclinical studies revealed that ginkgolides can potentiate warfarin anticoagulation through CYP2C9 inhibition and P-glycoprotein modulation. The evidence suggests a moderate-to-high risk of bleeding complications when these agents are co-administered. Healthcare providers should exercise caution and monitor INR closely in patients using both substances.',
  citationCount: 47,
  studyType: 'Systematic Review',
  evidenceLevel: 'High',
  journalQuality: 'High-impact journal',
  relevanceLabel: 'HIGH',
  relevanceScore: 85,
  compositeScore: 82,
  fdaWarnings: [],
  severity: 'Major',
  interactionType: 'Pharmacokinetic',
  clinicalRelevance: 'Human Clinical',
  confidence: 'High',
  mechanismDescription: 'CYP2C9 inhibition; P-glycoprotein modulation; Enhanced anticoagulant effect',
};

const sampleStudy2: StudyResult = {
  title: 'Assessment of Bleeding Risk with Concomitant Warfarin and Herbal Supplement Use in Elderly Patients',
  source: 'PubMed',
  pubmedLink: 'https://pubmed.ncbi.nlm.nih.gov/40414584/',
  pmid: '40414584',
  doi: '10.1007/s11255-024-04123-5',
  doiLink: 'https://doi.org/10.1007/s11255-024-04123-5',
  journal: 'International Journal of Clinical Pharmacology',
  pubYear: '2024',
  authors: ['Kumar S', 'Johnson A'],
  abstract: 'A prospective cohort study examining bleeding outcomes in 342 elderly patients co-prescribed warfarin with various herbal supplements. Ginkgo biloba was associated with a 2.3-fold increase in major bleeding events (HR 2.34, 95% CI 1.45-3.78). The interaction was dose-dependent and more pronounced in patients with CYP2C9 variant alleles.',
  citationCount: 23,
  studyType: 'Cohort Study',
  evidenceLevel: 'Moderate',
  journalQuality: 'Medium-impact journal',
  relevanceLabel: 'MEDIUM',
  relevanceScore: 68,
  compositeScore: 65,
  fdaWarnings: [],
  severity: 'Moderate',
  interactionType: 'Pharmacodynamic',
  clinicalRelevance: 'Human Clinical',
  confidence: 'Moderate',
  mechanismDescription: 'Antiplatelet synergism; CYP2C9 variant interaction',
};

const sampleFdaData: FdaDrugData = {
  warnings: ['Bleeding risk', 'Drug interactions'],
  interactions: ['Ginkgo biloba may increase bleeding risk'],
  brandNames: ['Coumadin', 'Jantoven'],
};

const sampleActions: PharmacologyAction[] = [
  {
    name: 'Anti-inflammatory',
    pmids: ['38964625', '40414584', '39606264'],
    score: 85,
    mechanisms: [
      { name: 'MAPK signaling pathway modulation', pmids: ['38964625'] },
      { name: 'NRF2 antioxidant response activation', pmids: ['40414584'] },
      { name: 'NF-kB transcription factor inhibition', pmids: ['39606264'] },
    ],
  },
  {
    name: 'Antioxidant',
    pmids: ['38765432', '40123456', '39876543', '40567890'],
    score: 72,
    mechanisms: [
      { name: 'Free radical scavenging activity', pmids: ['38765432'] },
      { name: 'Glutathione peroxidase upregulation', pmids: ['40123456'] },
    ],
  },
  {
    name: 'Neuroprotective',
    pmids: ['39012345', '40234567'],
    score: 45,
    mechanisms: [
      { name: 'BDNF expression enhancement', pmids: ['39012345'] },
      { name: 'Mitochondrial membrane stabilization', pmids: ['40234567'] },
    ],
  },
];

const sampleCompounds: PharmacologyCompound[] = [
  { name: 'Ginsenoside Rb1', category: 'Triterpenoid', pmids: ['38964625', '40414584'] },
  { name: 'Ginsenoside Rg1', category: 'Triterpenoid', pmids: ['38765432', '40123456'] },
  { name: 'Ginsenoside Re', category: 'Triterpenoid', pmids: ['39606264'] },
  { name: 'Flavonoids', category: 'Flavonoid', pmids: [] },
];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'interaction';

  try {
    if (type === 'pharmacology') {
      const pdfBuffer = await generateHerbPDF({
        result: {
          herb: 'Panax ginseng',
          pharmacological_actions: sampleActions,
          active_compounds: sampleCompounds,
          evidence_level: 'High',
          confidence: 'Moderate',
          sourcesUsed: ['PubMed', 'PubChem'],
          confidenceReasoning: 'The evidence base for Panax ginseng pharmacological actions is substantial, with 85 unique PubMed citations supporting the documented effects. The anti-inflammatory action has the strongest support with multiple clinical and preclinical studies. Antioxidant effects are well-documented but primarily from in vitro studies. Neuroprotective effects require additional clinical validation.',
        },
        aiSummary: 'Panax ginseng demonstrates significant pharmacological activity across multiple therapeutic domains. The anti-inflammatory effects are mediated through MAPK pathway modulation, NRF2 activation, and NF-kB inhibition, supported by high-quality clinical evidence. The antioxidant properties involve both direct radical scavenging and enzymatic upregulation of glutathione peroxidase. Neuroprotective actions, while promising, require further clinical validation. The ginsenoside family, particularly Rb1, Rg1, and Re, serve as the primary active compounds responsible for these effects.',
      });

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename=PharmaInsight-Ginseng-Pharmacology-Report.pdf',
        },
      });
    }

    // Default: interaction report
    const pdfBuffer = await generateDrugPDF({
      results: [sampleStudy, sampleStudy2],
      drug: 'Warfarin',
      herb: 'Ginkgo biloba',
      sourcesUsed: ['PubMed', 'CrossRef', 'FDA'],
      fdaData: sampleFdaData,
      topCitationCount: 15234,
      aiSummary: 'The interaction between warfarin and Ginkgo biloba represents a clinically significant drug-herb interaction with potentially serious consequences. The primary mechanism involves CYP2C9 inhibition by ginkgolides, which reduces warfarin metabolism and increases its anticoagulant effect. Additionally, P-glycoprotein modulation affects warfarin transport, while antiplatelet effects of ginkgo create a pharmacodynamic synergism that further increases bleeding risk. The evidence from multiple clinical studies, including a systematic review and prospective cohort analysis, consistently demonstrates a 2-3 fold increase in major bleeding events when these agents are co-administered.',
      scores: [
        { normalizedScore: 82, evidenceLevel: 'High', breakdown: { studyTypeScore: 32, journalQualityScore: 25, validationScore: 22, contradictionPenalty: 0 } },
        { normalizedScore: 65, evidenceLevel: 'Moderate', breakdown: { studyTypeScore: 25, journalQualityScore: 20, validationScore: 18, contradictionPenalty: 2 } },
      ],
      confidenceReasoning: 'The overall confidence in the warfarin-ginkgo interaction evidence is rated as Moderate-to-High. The systematic review provides Level I evidence with rigorous methodology, while the prospective cohort study adds real-world clinical validation. However, the limited number of randomized controlled trials specifically examining this interaction pair reduces the certainty of effect size estimates.',
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=PharmaInsight-Warfarin-Ginkgo-Interaction-Report.pdf',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (error as Error).message },
      { status: 500 }
    );
  }
}
