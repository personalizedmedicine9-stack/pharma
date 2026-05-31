'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface InteractionPdfParams {
  results: Record<string, unknown>[];
  drug: string;
  herb: string;
  sourcesUsed: string[];
  fdaData: Record<string, unknown> | null;
  topCitationCount: number;
  aiSummary?: string | null;
  aiStructured?: Record<string, string> | null;
  scores?: Record<string, unknown>[];
  confidenceReasoning?: string | null;
}

interface PharmacologyPdfParams {
  herb: string;
  pharmacologicalActions: Record<string, unknown>[];
  activeCompounds: Record<string, unknown>[];
  evidenceLevel: string;
  confidence: string;
  sourcesUsed: string[];
  confidenceReasoning?: string | null;
  aiSummary?: string | null;
  aiStructured?: Record<string, string> | null;
}

export function usePdfExport() {
  const [loading, setLoading] = useState(false);

  const downloadInteractionPdf = useCallback(async (params: InteractionPdfParams) => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interaction',
          data: {
            results: params.results,
            drug: params.drug,
            herb: params.herb,
            sourcesUsed: params.sourcesUsed,
            fdaData: params.fdaData,
            topCitationCount: params.topCitationCount,
            aiSummary: params.aiSummary,
            aiStructured: params.aiStructured,
            scores: params.scores,
            confidenceReasoning: params.confidenceReasoning,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate PDF');
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `PharmaInsight-${params.drug}-${params.herb}-Interaction-Report.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"'\n]+)/i);
        if (match) filename = decodeURIComponent(match[1]);
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadPharmacologyPdf = useCallback(async (params: PharmacologyPdfParams) => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'pharmacology',
          data: {
            herb: params.herb,
            pharmacologicalActions: params.pharmacologicalActions,
            activeCompounds: params.activeCompounds,
            evidenceLevel: params.evidenceLevel,
            confidence: params.confidence,
            sourcesUsed: params.sourcesUsed,
            confidenceReasoning: params.confidenceReasoning,
            aiSummary: params.aiSummary,
            aiStructured: params.aiStructured,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate PDF');
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `PharmaInsight-${params.herb}-Pharmacology-Report.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"'\n]+)/i);
        if (match) filename = decodeURIComponent(match[1]);
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, downloadInteractionPdf, downloadPharmacologyPdf };
}
