'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { InteractionPDFDocument, PharmacologyPDFDocument } from './pdf-export';
import type { StudyResult, FdaDrugData, PharmacologyAction, PharmacologyCompound } from './types';

interface EvidenceBreakdown {
  studyTypeScore: number;
  journalQualityScore: number;
  validationScore: number;
  contradictionPenalty: number;
}

interface PharmResult {
  herb: string;
  pharmacological_actions: PharmacologyAction[];
  active_compounds: PharmacologyCompound[];
  evidence_level: string;
  confidence: string;
  sourcesUsed: string[];
  confidenceReasoning?: string;
}

export function InteractionPDFDownloadLink({
  results, drug, herb, sourcesUsed, fdaData, topCitationCount, aiSummary, scores, confidenceReasoning, children,
}: {
  results: StudyResult[];
  drug: string;
  herb: string;
  sourcesUsed: string[];
  fdaData: FdaDrugData | null;
  topCitationCount: number;
  aiSummary?: string | null;
  scores?: { normalizedScore: number; evidenceLevel: string; breakdown: EvidenceBreakdown }[];
  confidenceReasoning?: string | null;
  children: React.ReactNode;
}) {
  return (
    <PDFDownloadLink
      document={<InteractionPDFDocument results={results} drug={drug} herb={herb} sourcesUsed={sourcesUsed} fdaData={fdaData} topCitationCount={topCitationCount} aiSummary={aiSummary} scores={scores} confidenceReasoning={confidenceReasoning} />}
      fileName={`PharmaInsight-${drug}-${herb}-Interaction-Report.pdf`}
    >
      {children}
    </PDFDownloadLink>
  );
}

export function PharmacologyPDFDownloadLink({
  result, aiSummary, children,
}: {
  result: PharmResult;
  aiSummary?: string | null;
  children: React.ReactNode;
}) {
  return (
    <PDFDownloadLink
      document={<PharmacologyPDFDocument result={result} aiSummary={aiSummary} />}
      fileName={`PharmaInsight-${result.herb}-Pharmacology-Report.pdf`}
    >
      {children}
    </PDFDownloadLink>
  );
}
