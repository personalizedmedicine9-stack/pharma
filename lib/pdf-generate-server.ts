import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { InteractionPDFDocument, PharmacologyPDFDocument } from './pdf-export';
import type { StructuredAiReport } from './types';

export async function generateDrugPDF(params: Parameters<typeof InteractionPDFDocument>[0]) {
  const doc = React.createElement(InteractionPDFDocument, params);
  const blob = await pdf(doc).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}

export async function generateHerbPDF(params: Parameters<typeof PharmacologyPDFDocument>[0]) {
  const doc = React.createElement(PharmacologyPDFDocument, params);
  const blob = await pdf(doc).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
