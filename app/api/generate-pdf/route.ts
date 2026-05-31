import { NextRequest, NextResponse } from 'next/server';
import { generateDrugPDF, generateHerbPDF } from '@/lib/pdf-generate-server';

// POST /api/generate-pdf — Server-side PDF generation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data' },
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer;
    let filename: string;

    if (type === 'interaction') {
      pdfBuffer = await generateDrugPDF({
        results: data.results,
        drug: data.drug,
        herb: data.herb,
        sourcesUsed: data.sourcesUsed || [],
        fdaData: data.fdaData || null,
        topCitationCount: data.topCitationCount || 0,
        aiSummary: data.aiSummary || null,
        aiStructured: data.aiStructured || null,
        scores: data.scores || [],
        confidenceReasoning: data.confidenceReasoning || null,
      });
      filename = `PharmaInsight-${data.drug}-${data.herb}-Interaction-Report.pdf`;
    } else if (type === 'pharmacology') {
      pdfBuffer = await generateHerbPDF({
        result: {
          herb: data.herb,
          pharmacological_actions: data.pharmacologicalActions || [],
          active_compounds: data.activeCompounds || [],
          evidence_level: data.evidenceLevel || 'Low',
          confidence: data.confidence || 'Low',
          sourcesUsed: data.sourcesUsed || [],
          confidenceReasoning: data.confidenceReasoning || null,
        },
        aiSummary: data.aiSummary || null,
        aiStructured: data.aiStructured || null,
      });
      filename = `PharmaInsight-${data.herb}-Pharmacology-Report.pdf`;
    } else {
      return NextResponse.json(
        { error: 'Invalid report type. Use "interaction" or "pharmacology".' },
        { status: 400 }
      );
    }

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[Generate PDF] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: (error as Error).message },
      { status: 500 }
    );
  }
}
