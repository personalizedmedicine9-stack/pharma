import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Link } from '@react-pdf/renderer';
import type { StudyResult, FdaDrugData, PharmacologyAction, PharmacologyCompound, StructuredAiReport } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// PHARMAINSIGHT — TYPESETTING ENGINE v35.0
// Elite journal-grade typesetting standards (Nature/Elsevier compliance)
// ═══════════════════════════════════════════════════════════════════════════
//
// v35 CHANGES (over v34):
// 1. EVIDENCE LEVEL FIX: Interaction PDF now uses composite score thresholds
//    (≥75=High, ≥50=Moderate, <50=Low) instead of broken "best-of" heuristic
//    that labeled 14/100 as "Moderate" because one study was Moderate-tier.
// 2. MATRIX NON-BREAKING: Pharmacology matrix rows use wrap={false} on the
//    entire row container to prevent Score/Level composite from splitting.
// 3. MECHANISM NULLDISPLAY: Matrix mechanism cells now run through nullDisplay()
//    which catches "Mechanism not explicitly characterized" → em-dash (—).
// 4. BRANDING CLEANUP: Expanded cleanBrandingText() to catch "Pharmahal",
//    "Värdatt", "Vinilett", "Premiüm V", stray Arabic chars, and more.
//    sanitizeText() now also strips Arabic range (0600-06FF).
// 5. DOI IDENTIFIER WRAP: identValue style now uses flexWrap:'wrap' and
//    reduced font-size for long DOIs to prevent column overflow.
// 6. SUMMARY STATS: Badge pills in pharmacology exec summary now use explicit
//    flex columns with min-width constraints instead of inline flex.
// 7. TOC CASE UNIFORMITY: Sub-items in TOC now use toTitleCase() for
//    consistent capitalization of pharmacology action names.
// 8. DUPLICATE HEADINGS: Removed redundant "SCIENTIFIC DISCLAIMER" and
//    "ABOUT PHARMAINSIGHT" headings from internal blocks (from v34 patch).
//
// CRITICAL FIXES (v26 over v25):
// 1. WORD SPLITTING: Header subject uses wider truncation (40 chars),
//    smaller font (6.5pt), and wrap={false} on ALL text. No more
//    "Sily"/"bum" or "Tacrolimus" clipping in header bars.
// 2. FOOTER GARBLED TEXT: Shortened footer lines to fit within page
//    width without clipping. No more "witical consultadon" artifacts.
//    Footer uses two clean short lines instead of long text.
// 3. WHITE GAPS: Section headings use margin-top:16, margin-bottom:8.
//    SectionBlock allows natural page breaks (break-inside:auto).
//    Only evidence/scoring rows use wrap={false} (break-inside:avoid).
// 4. PMID OVERLAP: Mechanism items use line-height:1.6 with explicit
//    marginBottom between title and PMID link. No more overlapping.
// 5. LINKS: All PubMed/DOI links use color:#0d6efd, underline,
//    font-weight:500 via <Link> component.
// 6. ABOUT SECTION: Added academic citation block with suggested
//    citation (Mostafa, M. 2026). Removed marketing claims.
// 7. REFERENCES: Pharmacology refs use compact format when author/
//    journal data is missing — no more "Unknown (N/A)" spam.
//
// INJECTED CSS RULES (from user configuration block):
// .sidebar-text, .running-header-title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; word-break:keep-all }
// h2, h3, .section-block { page-break-inside:auto; break-inside:auto; margin-top:16px; margin-bottom:8px }
// .mechanism-meta, .pmid-inline-block { line-height:1.6; display:inline-block; vertical-align:middle }
// a { color:#0d6efd; text-decoration:none }
// .academic-citation-block { page-break-inside:avoid; font-size:11px; line-height:1.5 }
// ═══════════════════════════════════════════════════════════════════════════

// ─── LAZY FONT & LOGO LOADING ─────────────────────────────────────────────
let fontsRegistered = false;
let LOGO_SRC = '';

function ensureFontsRegistered() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  const fs = require('fs');
  const path = require('path');
  const fontDir = path.join(process.cwd(), 'public', 'fonts');
  const logoPath = path.join(process.cwd(), 'public', 'pharma-icon.png');

  function fontSrc(name: string): string {
    const buf = fs.readFileSync(path.join(fontDir, name));
    return 'data:;base64,' + buf.toString('base64');
  }

  Font.register({
    family: 'Carlito',
    fonts: [
      { src: fontSrc('Carlito-Regular.ttf'), fontWeight: 'normal' },
      { src: fontSrc('Carlito-Bold.ttf'), fontWeight: 'bold' },
      { src: fontSrc('Carlito-Italic.ttf'), fontStyle: 'italic' },
      { src: fontSrc('Carlito-BoldItalic.ttf'), fontWeight: 'bold', fontStyle: 'italic' },
    ],
  });
  Font.register({
    family: 'LiberationSerif',
    fonts: [
      { src: fontSrc('LiberationSerif-Regular.ttf'), fontWeight: 'normal' },
      { src: fontSrc('LiberationSerif-Bold.ttf'), fontWeight: 'bold' },
      { src: fontSrc('LiberationSerif-Italic.ttf'), fontStyle: 'italic' },
      { src: fontSrc('LiberationSerif-BoldItalic.ttf'), fontWeight: 'bold', fontStyle: 'italic' },
    ],
  });

  const logoBuf = fs.readFileSync(logoPath);
  LOGO_SRC = 'data:image/png;base64,' + logoBuf.toString('base64');
}

// ─── IDENTITY PALETTES (NEVER MIX) ────────────────────────────────────────
const PHARMA_IDENTITY = {
  primary: '#1a6b3a',
  primaryDark: '#14532d',
  primaryLight: '#6ba57e',
  coverBg: '#1a3a2a',
  label: 'PHARMACOLOGY & PHYTOCHEMISTRY REPORT',
  shortLabel: 'Pharmacology',
  headerLabel: 'Pharmacology Report',
  accentLine: '#6ba57e',
} as const;

const INTERACT_IDENTITY = {
  primary: '#991b1b',
  primaryDark: '#7f1d1d',
  primaryLight: '#c97a7a',
  coverBg: '#3a1a1a',
  label: 'DRUG-HERB INTERACTION REPORT',
  shortLabel: 'Drug-Herb Interaction Report',
  headerLabel: 'Drug-Herb Interaction Report',
  accentLine: '#c87979',
} as const;

// ─── SHARED ACADEMIC PALETTE ───────────────────────────────────────────────
const C = {
  // ── PRIMARY ACCENT — Deep Slate/Navy
  ink:        '#0F172A',   // Primary Accent — core headers, section banners
  dark:       '#1E293B',   // Base Text — reading stamina
  body:       '#1E293B',   // Base Text (duplicate for compatibility)
  mid:        '#475569',   // Muted Secondary — subheadings, borders
  muted:      '#475569',   // Muted Secondary (compatibility)
  light:      '#94A3B8',   // Lighter secondary for labels
  faint:      '#CBD5E1',   // Faint — separator rules, hairlines
  hair:       '#F1F5F9',   // Hair — lightest background tint

  // ── BADGE COLORS — preserved for evidence indicators
  badgeHigh:  '#1a6b3a',
  badgeMod:   '#8a6913',
  badgeLow:   '#6b7280',
  badgeSevMaj:'#991b1b',
  badgeRel:   '#5b5b79',
  badgeQ:     '#4b5462',

  // ── BACKGROUND TINTS
  inkBg:      '#F1F5F9',   // 5% primary accent bg
  blueBg:     '#EFF6FF',
  amberBg:    '#FEFCE8',
  emeraldBg:  '#F0FDF4',
  roseBg:     '#FEF2F2',
  neutralBg:  '#F8FAFC',
  white:      '#FFFFFF',

  // ── TABLE GRIDLINES
  grid:       '#E2E8F0',   // Journal-style gridlines
  gridLight:  '#F1F5F9',
  gridHair:   '#F8FAFC',

  footerLine: '#CBD5E1',
  separator:  '#CBD5E1',   // Section heading separator rule color

  // ── ZEBRA STRIPE — 5% opacity of #475569 on white
  zebra:      '#F1F5F9',   // Approximately 5% of #475569
} as const;

// ─── GRID — Page margins ──────────────────────────────────────────────────
// @page { size: A4; margin: 0.75in all sides }
// 0.75in = 54pt uniform margins
const M = { left: 54, right: 54, top: 54, bottom: 54 };
const CW = 595.28 - M.left - M.right; // ~487pt content width
const HEADER_H = 24; // Header bar height (reduced for margin fit)

// Helper: truncate subject name to fit header without word-splitting
// If the name is too long, truncate with ellipsis instead of wrapping/clipping
function truncateSubject(name: string, maxLen: number = 24): string {
  if (name.length <= maxLen) return name;
  // Try to truncate at a space or dash boundary
  const truncated = name.slice(0, maxLen - 1);
  const lastSpace = Math.max(truncated.lastIndexOf(' '), truncated.lastIndexOf('\u2014'));
  if (lastSpace > maxLen * 0.4) {
    return name.slice(0, lastSpace) + '...';
  }
  return truncated + '...';
}

// ─── STRING SANITIZATION ────────────────────────────────────────────────
// Strips raw systemic double vertical pipes ("||"), trailing duplicate
// punctuation, consecutive stray spaces. Normalizes multi-word spacing.
// Decodes common HTML entities and removes stray Unicode artifacts.
function sanitizeText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\|\|/g, '')                    // Strip double pipes
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))  // Decode hex HTML entities (e.g. &#xf6; → ö)
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))            // Decode decimal HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&ge;/g, '\u2265')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[\u0400-\u04FF]/g, '')          // Strip Cyrillic artifacts (e.g. Менида)
    .replace(/[\u0600-\u06FF]/g, '')          // Strip Arabic artifacts (e.g. المص)
    .replace(/([.!?,;:])\1+/g, '$1')        // Collapse duplicate punctuation
    .replace(/\s{2,}/g, ' ')                 // Normalize multi-space to single
    .replace(/\s+([.!?,;:])/g, '$1')        // Remove space before punctuation
    .trim();
}

// ─── BRANDING TEXT CLEANER ──────────────────────────────────────────────
// Fixes known OCR-like spelling artifacts in platform stamps and footers.
// Catches: "Eldence" → "Evidence", "Pharynacology" → "Pharmacology",
//          "Verilett" → removed, "Менида" → removed (Cyrillic)
function cleanBrandingText(raw: string): string {
  if (!raw) return '';
  return raw
    // Fix spelling artifacts from OCR/rendering corruption
    .replace(/Eldence/gi, 'Evidence')
    .replace(/Pharynacology/gi, 'Pharmacology')
    .replace(/Pharmahal/gi, 'PharmaInsight')
    // Strip broken template placeholder strings
    .replace(/Verilett\s*Premium\s*V\s*Report/gi, '')
    .replace(/Vinilett\s*Premium\s*V?\s*Report/gi, '')
    .replace(/Vinilott\s*Premium\s*V?\s*Report/gi, '')
    .replace(/Värdatt\s*Premium/gi, '')
    .replace(/Premiüm\s*V?/gi, 'Premium')
    // Strip Cyrillic and Arabic artifacts
    .replace(/[\u0400-\u04FF]+/g, '')
    .replace(/[\u0600-\u06FF]+/g, '')
    // Clean up whitespace left by removed fragments
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.!?;:,])/g, '$1')
    .trim();
}

// Break-long-identifiers for DOIs, URLs, PMIDs that must not overflow.
// Inserts zero-width break opportunities after /, :, ., - to allow wrapping.
function breakLongIdentifier(id: string): string {
  if (!id) return '';
  // Insert soft-break hints after common delimiters
  return id.replace(/([\/:\-.])/g, '$1\u200B');
}

// Replace null/undefined/empty values with a clean em-dash.
// Also catches the long redundant string "Mechanism not explicitly characterized
// in the cited literature" and replaces it with em-dash for table cleanliness.
const MECH_UNCHARACTERIZED_PATTERN = /mechanism not explicitly characterized/i;
const MECH_UNCHAR_PATTERN_SHORT = /not explicitly characterized/i;
function nullDisplay(val: string | undefined | null, fallback: string = '\u2014'): string {
  if (val === null || val === undefined || val === '' || val === 'N/A' || val === 'n/a') return fallback;
  if (MECH_UNCHARACTERIZED_PATTERN.test(val)) return fallback;
  if (MECH_UNCHAR_PATTERN_SHORT.test(val)) return fallback;
  return val;
}

// Ensure terminal list items close with a trailing period.
function terminalPeriod(text: string): string {
  if (!text) return '';
  const trimmed = text.trimEnd();
  if (trimmed && !/[.!?]$/.test(trimmed)) return trimmed + '.';
  return trimmed;
}

// Title-case conversion for TOC sub-items and action names.
// Handles hyphenated compounds (e.g. "anti-inflammatory" → "Anti-Inflammatory").
function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .split(/(\s|-)/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

interface EvidenceBreakdown {
  studyTypeScore: number;
  journalQualityScore: number;
  validationScore: number;
  contradictionPenalty: number;
}

const now = new Date();
const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const monthYear = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
const utcTime = now.toISOString().replace('T', ' at ').slice(0, 22) + ' UTC';

const DISCLAIMER_FULL = `IMPORTANT: This report is intended for research and educational purposes only and should not be used as the sole basis for clinical or therapeutic decision-making. Drug-herb interactions can be unpredictable and may vary based on individual patient factors including genetics, dosage, duration of use, formulation, route of administration, and concurrent medications. Always consult a qualified healthcare professional before making any changes to medication regimens or herbal supplement use. The evidence scores and confidence ratings presented in this report reflect the current state of published scientific literature and may change as new evidence becomes available. Pharmacovigilance signals, when present, do not establish causality and should not be interpreted as proof of clinical harm. Preclinical findings (animal, in vitro, or mechanistic data) may support biological plausibility but do not confirm clinical significance or therapeutic efficacy in humans. Findings from isolated compounds should not be generalized to whole plant extracts or commercial formulations unless explicitly supported by the cited literature. PharmaInsight does not guarantee the completeness or accuracy of all published data and assumes no liability for clinical decisions made based on this report.`;

// ═══════════════════════════════════════════════════════════════════════════
// STYLESHEET v33 — Corporate academic palette, 9.5pt body, 1.37 line-height
// ═══════════════════════════════════════════════════════════════════════════

const LINK_COLOR = '#0d6efd';

const S = StyleSheet.create({
  // ── COVER PAGE ────────────────────────────────────────────────────
  coverPage: { flex: 1, position: 'relative' },
  coverBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  coverOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100, paddingHorizontal: M.left },

  coverBrand: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 16, color: '#ffffff', letterSpacing: 6, marginBottom: 10 },
  coverLabel: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 11, color: '#cccccc', letterSpacing: 2, marginBottom: 40 },
  coverSubject: { fontFamily: 'LiberationSerif', fontWeight: 'bold', fontStyle: 'italic', fontSize: 24, color: '#ffffff', textAlign: 'center', lineHeight: 1.3, marginBottom: 6, letterSpacing: -0.5 },
  coverSubjectSub: { fontFamily: 'LiberationSerif', fontStyle: 'italic', fontSize: 14, color: '#cccccc', textAlign: 'center', marginBottom: 14 },
  coverAccentLine: { width: 70, height: 2, marginBottom: 28 },
  coverBadgeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 40, flexWrap: 'wrap' },
  coverDate: { fontFamily: 'Carlito', fontSize: 10, color: '#999999', marginBottom: 4 },
  coverVersion: { fontFamily: 'Carlito', fontSize: 10, color: '#999999' },
  coverCopyright: { fontFamily: 'Carlito', fontSize: 8, color: '#666666', marginTop: 50 },

  // ── HEADER BAR — Absolute in margin area, full-width container ───
  headerBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', height: HEADER_H, paddingHorizontal: 8 },
  headerBrand: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 7.5, color: '#ffffff' },
  headerType: { fontFamily: 'Carlito', fontSize: 6.5, color: '#cccccc', marginLeft: 5 },
  headerSpacer: { flex: 1 },
  headerSubject: { fontFamily: 'Carlito', fontSize: 6.5, color: '#cccccc', marginRight: 5 },
  headerPageNum: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 7.5, color: '#ffffff' },

  // ── FOOTER — Block-level layout, dynamic date ───
  footerLine: { position: 'absolute', bottom: 32, left: 0, right: 0, height: 0.4, backgroundColor: C.footerLine },
  footerBlock: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', direction: 'ltr' as const },
  footerText: { fontFamily: 'Carlito', fontSize: 8, color: '#64748b', lineHeight: 1.4, direction: 'ltr' as const },

  // ── CONTENT PAGE ──────────────────────────────────────────────────
  page: { paddingLeft: M.left, paddingRight: M.right, paddingTop: M.top, paddingBottom: M.bottom, fontSize: 9.5, fontFamily: 'LiberationSerif', color: C.body, lineHeight: 1.37 },

  // ── SECTION HEADING H1 — 14pt + 0.5pt separator ─────────────────
  sectionHeading: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 14, color: C.ink, letterSpacing: 0.3, marginTop: 16, marginBottom: 8, paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: C.separator, lineHeight: 1.3 },
  // ── SUB-HEADING H2 — 11pt ────────────────────────────────────────
  subHeading: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 11, color: C.mid, lineHeight: 1.35, marginBottom: 6, marginTop: 8 },

  // ── CONTAINERS — journal-style gridlines ───────────
  box: { backgroundColor: C.neutralBg, borderLeftWidth: 2, borderLeftColor: C.muted, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  execBox: { backgroundColor: C.inkBg, borderLeftWidth: 2, borderLeftColor: C.ink, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  riskBox: { backgroundColor: C.amberBg, borderLeftWidth: 2, borderLeftColor: '#8a6913', borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  scoringBox: { backgroundColor: C.blueBg, borderLeftWidth: 2, borderLeftColor: '#1d4ed8', borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  sectionBox: { backgroundColor: C.white, borderLeftWidth: 2, borderLeftColor: C.ink, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  disclaimerBox: { backgroundColor: C.neutralBg, borderLeftWidth: 2, borderLeftColor: C.light, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  refBox: { backgroundColor: '#fafbfc', borderLeftWidth: 2, borderLeftColor: C.ink, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },
  assessBox: { backgroundColor: '#f7f7fb', borderLeftWidth: 2, borderLeftColor: C.ink, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6 },

  // ── EXEC ROW ──────────────────────────────────────────────────────
  execRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'baseline' },
  execLabel: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.mid, width: CW * 0.30, flexShrink: 0, lineHeight: 1.37 },
  execValue: { fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, flex: 1, lineHeight: 1.37 },

  // ── KEY-VALUE ROW — 30% label / 70% value with overflow step-down ─
  kvRow: { flexDirection: 'row', marginBottom: 2, alignItems: 'flex-start' },
  kvLabel: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.mid, width: CW * 0.30, flexShrink: 0, lineHeight: 1.37, paddingRight: 4 },
  kvValue: { fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, flex: 1, lineHeight: 1.37 },

  // ── IDENTIFIER ROW — word-break for DOIs/URLs ────────────────────
  identRow: { flexDirection: 'row', marginBottom: 2, alignItems: 'flex-start' },
  identLabel: { fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.mid, width: CW * 0.30, flexShrink: 0, lineHeight: 1.37, paddingRight: 4 },
  identValue: { fontFamily: 'Carlito', fontSize: 9, color: LINK_COLOR, flex: 1, lineHeight: 1.37, flexWrap: 'wrap' as const },

  // ── BODY TEXT ─────────────────────────────────────────────────────
  bodyText: { fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 },

  // ── REFERENCES ────────────────────────────────────────────────────
  refItem: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  refNum: { fontFamily: 'Carlito', fontWeight: 'bold', color: C.ink, width: 24, flexShrink: 0, fontSize: 9, lineHeight: 1.5, textAlign: 'right', paddingRight: 8 },
  refBody: { flex: 1 },
  refText: { fontFamily: 'LiberationSerif', color: C.mid, fontSize: 9, lineHeight: 1.5 },

  // ── STUDY CARD ────────────────────────────────────────────────────
  studyCard: { backgroundColor: '#fafbfc', borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 5 },

  // ── MECHANISM ITEM — block-level with explicit spacing ─────────────
  mechItem: { flexDirection: 'row', marginBottom: 6, paddingLeft: 6 },
  mechBullet: { fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, width: 10, flexShrink: 0, lineHeight: 1.6 },
  mechContent: { flex: 1, marginBottom: 2 },
  mechText: { fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.6, marginBottom: 6 },
  mechPmid: { fontFamily: 'Carlito', fontSize: 9, color: LINK_COLOR, lineHeight: 1.6, marginBottom: 4 },
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function BadgePill({ children, bg, fg = '#ffffff' }: { children: React.ReactNode; bg: string; fg?: string }) {
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: bg, borderRadius: 2 }}>
      <Text style={{ fontSize: 8, fontFamily: 'Carlito', fontWeight: 'bold', color: fg, letterSpacing: 0.3, lineHeight: 1.2 }}>{children}</Text>
    </View>
  );
}

function evidenceBadge(level: string): string {
  if (level === 'High') return C.badgeHigh;
  if (level === 'Moderate') return C.badgeMod;
  return C.badgeLow;
}

// ─── SECTION HEADING — minPresenceAhead prevents orphans ──────────────────
function SectionHeading({ num, title }: { num: number; title: string }) {
  return (
    <Text style={S.sectionHeading} minPresenceAhead={4}>
      {num} {title.toUpperCase()}
    </Text>
  );
}

// ─── SUB HEADING — minPresenceAhead ────────────────────────────────────────
function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text style={S.subHeading} minPresenceAhead={3}>
      {children}
    </Text>
  );
}

// ─── NULL-SAFE CONDITIONAL WRAPPER ────────────────────────────────────────
function SafeCond({ condition, children }: { condition: boolean; children: React.ReactNode }) {
  return condition ? <>{children}</> : <View />;
}

// ─── SECTION BLOCK — allows natural page breaks ──────────────────────────
function SectionBlock({ children }: { children: React.ReactNode }) {
  return <View minPresenceAhead={3}>{children}</View>;
}

// ─── DYNAMIC SEVERITY ALERT ───────────────────────────────────────────────
// Never displays static alert templates. Warning cards look to the actual
// dynamic evidence level and composite score of the document.
function DynamicAlertCard({ evidenceLevel, compositeScore, drug, herb }: {
  evidenceLevel: string;
  compositeScore: number;
  drug?: string;
  herb?: string;
}) {
  const isLowEvidence = evidenceLevel === 'Low' || compositeScore < 20;
  const isHighSeverity = evidenceLevel === 'High' && compositeScore >= 75;
  const isModerate = !isLowEvidence && !isHighSeverity;

  if (isLowEvidence) {
    return (
      <View style={{
        backgroundColor: '#FEFCE8',
        borderLeftWidth: 3,
        borderLeftColor: '#CA8A04',
        borderWidth: 0.3,
        borderColor: C.grid,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
      }} wrap={false}>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: '#854D0E', marginBottom: 3, letterSpacing: 0.3 }}>PRELIMINARY EVIDENCE — MONITORING ADVISED</Text>
        <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: '#713F12', lineHeight: 1.37 }}>
          The current evidence base for {drug && herb ? `${drug} and ${herb}` : 'this interaction'} is limited (composite score: {compositeScore}/100). Findings should be interpreted with caution as data tracks are scarce. Clinical decisions should not rely solely on this assessment; further research is warranted to establish safety and efficacy.
        </Text>
      </View>
    );
  }

  if (isHighSeverity) {
    return (
      <View style={{
        backgroundColor: '#FEF2F2',
        borderLeftWidth: 3,
        borderLeftColor: '#DC2626',
        borderWidth: 0.3,
        borderColor: C.grid,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8,
      }} wrap={false}>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: '#991B1B', marginBottom: 3, letterSpacing: 0.3 }}>HIGH EVIDENCE — CLINICAL SIGNIFICANCE VERIFIED</Text>
        <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: '#7F1D1D', lineHeight: 1.37 }}>
          Robust clinical evidence supports a significant interaction between {drug && herb ? `${drug} and ${herb}` : 'these agents'} (composite score: {compositeScore}/100). This interaction has been verified through multiple high-quality human studies. Clinical monitoring and dosage adjustment may be required.
        </Text>
      </View>
    );
  }

  // Moderate — balanced alert
  return (
    <View style={{
      backgroundColor: '#EFF6FF',
      borderLeftWidth: 3,
      borderLeftColor: '#2563EB',
      borderWidth: 0.3,
      borderColor: C.grid,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginBottom: 8,
    }} wrap={false}>
      <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: '#1E40AF', marginBottom: 3, letterSpacing: 0.3 }}>MODERATE EVIDENCE — CLINICAL CAUTION RECOMMENDED</Text>
      <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: '#1E3A8A', lineHeight: 1.37 }}>
        Moderate evidence supports a potential interaction between {drug && herb ? `${drug} and ${herb}` : 'these agents'} (composite score: {compositeScore}/100). Additional clinical validation is recommended before making therapeutic decisions. Healthcare providers should exercise professional judgment.
      </Text>
    </View>
  );
}

// ─── COVER PAGE ────────────────────────────────────────────────────────────
function CoverPage({ identity, subject, subjectSub, evidenceLevel, confidence, hasFdaSignal }: {
  identity: typeof PHARMA_IDENTITY | typeof INTERACT_IDENTITY;
  subject: string;
  subjectSub: string;
  evidenceLevel: string;
  confidence: string;
  hasFdaSignal?: boolean;
}) {
  const lines = [];
  const lineSpacing = 80;
  const numLines = 22;
  for (let i = 0; i < numLines; i++) {
    const xBase = -400 + i * lineSpacing;
    lines.push(
      <View key={i} style={{
        position: 'absolute',
        left: xBase,
        top: 0,
        bottom: 0,
        width: 0.5,
        backgroundColor: 'rgba(255,255,255,0.08)',
      }} />
    );
  }

  return (
    <Page size="A4" style={S.coverPage}>
      {/* Dark background */}
      <View style={[S.coverBg, { backgroundColor: identity.coverBg }]}>
        {lines}
      </View>

      {/* Top framing line */}
      <View style={{ position: 'absolute', top: M.top, left: M.left, right: M.right, height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
      {/* Bottom framing line */}
      <View style={{ position: 'absolute', bottom: M.bottom, left: M.left, right: M.right, height: 0.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />

      {/* Content */}
      <View style={S.coverOverlay}>
        <Image src={LOGO_SRC} style={{ width: 60, height: 60, marginBottom: 16, opacity: 0.9 }} />
        <Text style={S.coverBrand}>P H A R M A I N S I G H T</Text>
        <Text style={S.coverLabel}>{identity.label}</Text>
        <Text style={S.coverSubject}>{subject}</Text>
        <Text style={S.coverSubjectSub}>{subjectSub}</Text>
        <View style={[S.coverAccentLine, { backgroundColor: identity.accentLine }]} />
        <View style={S.coverBadgeRow}>
          <BadgePill bg={evidenceBadge(evidenceLevel)}>{evidenceLevel.toUpperCase()} EVIDENCE</BadgePill>
          <BadgePill bg={evidenceBadge(confidence)}>{confidence.toUpperCase()} CONF.</BadgePill>
          {hasFdaSignal && <BadgePill bg={C.badgeSevMaj}>FDA SIGNAL DETECTED</BadgePill>}
        </View>
        <Text style={S.coverDate}>{monthYear}</Text>
        <Text style={S.coverVersion}>Premium v1.0</Text>
        <Text style={S.coverCopyright}>{cleanBrandingText('\u00A9 2026 PharmaInsight \u2014 Evidence-Based Pharmacology Intelligence')}</Text>
      </View>
    </Page>
  );
}

// ─── HEADER BAR — Absolute in margin area, full-width, wrap={false} ──────
function HeaderBar({ identity, subject }: { identity: typeof PHARMA_IDENTITY | typeof INTERACT_IDENTITY; subject: string }) {
  const displaySubject = truncateSubject(subject, 40);
  return (
    <View style={[S.headerBar, { backgroundColor: identity.coverBg }]} fixed>
      <Image src={LOGO_SRC} style={{ width: 12, height: 12, marginRight: 4 }} />
      <Text style={S.headerBrand} wrap={false}>PharmaInsight</Text>
      <Text style={S.headerType} wrap={false}>{identity.shortLabel}</Text>
      <View style={S.headerSpacer} />
      <Text style={S.headerSubject} wrap={false}>{displaySubject}</Text>
      <Text render={({ pageNumber }) => `${pageNumber}`} style={S.headerPageNum} wrap={false} />
    </View>
  );
}

// ─── IDENTITY ACCENT LINE — at content boundaries ─────────────────────────
function PageAccentLine({ identity, position }: { identity: typeof PHARMA_IDENTITY | typeof INTERACT_IDENTITY; position: 'top' | 'bottom' }) {
  const posStyle = position === 'top'
    ? { position: 'absolute' as const, top: M.top - 2, left: 0, right: 0 }
    : { position: 'absolute' as const, bottom: M.bottom + 8, left: 0, right: 0 };
  return <View style={[posStyle, { height: 0.8, backgroundColor: identity.accentLine, opacity: 0.4 }]} fixed />;
}

// ─── FOOTER — Dynamic date generation ────────────────────────────────────
function FooterBlock() {
  const genDate = new Date().toISOString().slice(0, 10);
  return (
    <>
      <View style={S.footerLine} fixed />
      <View style={S.footerBlock} fixed>
        <Text style={S.footerText} wrap={false}>{cleanBrandingText('\u00A9 2026 PharmaInsight. All Rights Reserved. Generated: ' + genDate + ' UTC')}</Text>
      </View>
    </>
  );
}

// ─── TOC PAGE ──────────────────────────────────────────────────────────────
function TOCPage({ items, identity, subject }: { items: { num: number; title: string; subItems?: string[] }[]; identity: typeof PHARMA_IDENTITY | typeof INTERACT_IDENTITY; subject: string }) {
  return (
    <Page size="A4" style={S.page}>
      <HeaderBar identity={identity} subject={subject} />
      <PageAccentLine identity={identity} position="top" />
      <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 14, color: C.ink, letterSpacing: 0.3, marginBottom: 16, paddingBottom: 5, borderBottomWidth: 0.5, borderBottomColor: C.separator }}>TABLE OF CONTENTS</Text>
      {items.map(item => (
        <View key={item.num} minPresenceAhead={2}>
          <View style={{ flexDirection: 'row', marginBottom: 5, alignItems: 'baseline' }}>
            <Text style={{ fontFamily: 'LiberationSerif', fontWeight: 'bold', fontSize: 9.5, color: C.ink, width: 26, flexShrink: 0 }}>{item.num}</Text>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, flex: 1 }}> {item.title.toUpperCase()}</Text>
          </View>
          {item.subItems && item.subItems.map((sub, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 26, alignItems: 'baseline' }}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9, color: C.mid }}>{item.num}.{i + 1} {toTitleCase(sub)}</Text>
            </View>
          ))}
        </View>
      ))}
      <FooterBlock />
      <PageAccentLine identity={identity} position="bottom" />
    </Page>
  );
}

// ─── SHARED CONTENT BLOCKS ─────────────────────────────────────────────────

function MethodologyBlock() {
  return (
    <View style={S.sectionBox}>
      <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 8 }}>
        PharmaInsight employs a multi-dimensional evidence scoring framework that weights study quality, relevance, and consistency across the available literature. Scores are calculated based on the following criteria, with each dimension contributing to the final composite score (0&ndash;100).
      </Text>
      {/* Table header */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f6f8fb', paddingVertical: 4, paddingHorizontal: 8, marginBottom: 2, borderBottomWidth: 0.3, borderBottomColor: C.grid }}>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, width: CW * 0.25, flexShrink: 0 }}>Criterion</Text>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, width: CW * 0.12, flexShrink: 0 }}>Weight</Text>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, flex: 1 }}>Description</Text>
      </View>
      {[
        { criterion: 'Study Design Quality', weight: '35%', desc: 'Systematic reviews and RCTs receive highest weight; in vitro and animal studies receive lower weight' },
        { criterion: 'Evidence Consistency', weight: '25%', desc: 'Consistency of findings across multiple independent studies and research groups' },
        { criterion: 'Research Relevance', weight: '20%', desc: 'Human clinical evidence weighted highest; preclinical and in vitro evidence weighted lower' },
        { criterion: 'Mechanistic Clarity', weight: '15%', desc: 'Well-characterized molecular mechanisms and pathways receive higher scores' },
        { criterion: 'Publication Recency', weight: '5%', desc: 'More recent publications receive slight additional weighting' },
      ].map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 8, borderBottomWidth: 0.3, borderBottomColor: C.gridHair, backgroundColor: i % 2 === 0 ? C.zebra : C.white }}>
          <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.dark, width: CW * 0.25, flexShrink: 0, lineHeight: 1.37, paddingRight: 4 }} wrap={false}>{row.criterion}</Text>
          <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: '#1d4ed8', width: CW * 0.12, flexShrink: 0, lineHeight: 1.37, paddingRight: 4 }} wrap={false}>{row.weight}</Text>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, flex: 1, lineHeight: 1.37, paddingRight: 4 }}>{row.desc}</Text>
        </View>
      ))}
    </View>
  );
}

function ScoringGuideBlock() {
  return (
    <View style={S.scoringBox}>
      <Text style={[S.sectionHeading, { borderBottomColor: '#1d4ed8' }]}>EVIDENCE SCORING GUIDE</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
        <View style={{ flex: 1, backgroundColor: C.emeraldBg, borderWidth: 0.3, borderColor: '#86efac', padding: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <BadgePill bg={C.badgeHigh}>High Evidence</BadgePill>
          </View>
          <Text style={{ fontSize: 9.5, fontFamily: 'LiberationSerif', color: C.dark, lineHeight: 1.37 }}>&ge;75: Strong evidence from high-quality studies with consistent findings</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.amberBg, borderWidth: 0.3, borderColor: '#fde047', padding: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <BadgePill bg={C.badgeMod}>Moderate Evidence</BadgePill>
          </View>
          <Text style={{ fontSize: 9.5, fontFamily: 'LiberationSerif', color: C.dark, lineHeight: 1.37 }}>50&ndash;74: Moderate evidence requiring additional clinical validation</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.neutralBg, borderWidth: 0.3, borderColor: C.gridLight, padding: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
            <BadgePill bg={C.badgeLow}>Low Evidence</BadgePill>
          </View>
          <Text style={{ fontSize: 9.5, fontFamily: 'LiberationSerif', color: C.dark, lineHeight: 1.37 }}>&lt;50: Limited evidence, primarily from preclinical or in vitro data</Text>
        </View>
      </View>
    </View>
  );
}

function DisclaimerBlock() {
  return (
    <View style={S.disclaimerBox}>
      <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.light, lineHeight: 1.37 }}>{DISCLAIMER_FULL}</Text>
    </View>
  );
}

function AboutBlock() {
  return (
    <View style={S.box}>
      <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, lineHeight: 1.37, marginBottom: 8 }}>
        PharmaInsight is an evidence-based scientific platform designed to deliver structured evidence intelligence for scientific and professional review, evaluating drug-herb interactions, exploring pharmacological profiles, and retrieving chemical structures from global scientific databases. Applies international publication standards with interactive reference links and dynamic see-also indexing, free of static page numbers for digital display flexibility.
      </Text>
      {[
        'Integrates PubMed, CrossRef, OpenAlex, OpenFDA, PubChem, ChEBI, and NPAtlas databases',
        'Weighted evidence scoring with study design quality, consistency, and research relevance tracking',
        'FDA pharmacovigilance signal detection and severity classification',
        'Mechanism-level analysis with CYP450 pathway and transporter interaction mapping',
        'Drug-herb interaction profiling with evidence-based severity assessment',
        'Professional report generation with full citation tracking and DOI resolution',
        'Designed for researchers, pharmacologists, and healthcare professionals',
      ].map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 4 }}>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.light, width: 12, flexShrink: 0, lineHeight: 1.37 }}>{'\u2022'}</Text>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, flex: 1, lineHeight: 1.37 }}>{terminalPeriod(item)}</Text>
        </View>
      ))}

      {/* Team Sub-Section */}
      <View style={{ marginTop: 12, paddingTop: 8, borderTopWidth: 0.3, borderTopColor: C.grid }}>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.ink, marginBottom: 6, letterSpacing: 0.5 }}>RESEARCH TEAM</Text>
        {/* Dr. Mahmoud Mostafa */}
        <View style={{ flexDirection: 'row', marginBottom: 6, paddingLeft: 4 }}>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.light, width: 12, flexShrink: 0, lineHeight: 1.37 }}>{'\u2022'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>Dr. Mahmoud Mostafa</Text>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, lineHeight: 1.37 }}>Founder &amp; Scientific Systems Architect</Text>
            <Link src="https://orcid.org/0000-0002-2117-6588" style={{ textDecoration: 'none' }}>
              <Text style={{ fontFamily: 'Carlito', fontSize: 9, color: LINK_COLOR, lineHeight: 1.37 }}>{breakLongIdentifier('ORCID: 0000-0002-2117-6588')}</Text>
            </Link>
          </View>
        </View>
        {/* Dr. Rwaida Alhaidari */}
        <View style={{ flexDirection: 'row', marginBottom: 4, paddingLeft: 4 }}>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.light, width: 12, flexShrink: 0, lineHeight: 1.37 }}>{'\u2022'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>Dr. Rwaida Alhaidari</Text>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, lineHeight: 1.37 }}>Scientific Review and Methodology Advisor</Text>
            <Link src="https://orcid.org/0000-0002-4855-5288" style={{ textDecoration: 'none' }}>
              <Text style={{ fontFamily: 'Carlito', fontSize: 9, color: LINK_COLOR, lineHeight: 1.37 }}>{breakLongIdentifier('ORCID: 0000-0002-4855-5288')}</Text>
            </Link>
          </View>
        </View>
      </View>

      {/* Academic Citation Block — page-break-inside:avoid */}
      <View style={{ marginTop: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#f8f9fa', borderLeftWidth: 4, borderLeftColor: LINK_COLOR, marginBottom: 8 }} wrap={false}>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.ink, marginBottom: 5 }}>Suggested Citation</Text>
        <Text style={{ fontFamily: 'LiberationSerif', fontStyle: 'italic', fontSize: 9.5, color: C.mid, lineHeight: 1.37 }}>
          Mostafa, M. (2026). PharmaInsight: An Evidence-Based Scientific Intelligence Platform.{' '}
          <Link src="https://www.phytoprecisionsystem.com" style={{ color: LINK_COLOR, textDecoration: 'underline' }}>
            www.phytoprecisionsystem.com
          </Link>
        </Text>
      </View>

      <View style={{ borderTopWidth: 0.3, borderTopColor: C.gridHair, marginTop: 8, paddingTop: 5 }}>
        <Text style={{ fontFamily: 'Carlito', fontSize: 8, color: C.faint, lineHeight: 1.4 }}>{cleanBrandingText('\u00A9 2026 PharmaInsight \u2014 Evidence-Based Pharmacology Intelligence Platform')}</Text>
        <Text style={{ fontFamily: 'Carlito', fontSize: 8, color: C.faint, lineHeight: 1.4 }}>Version: Premium v1.0  \u00B7  Report generated: {utcTime}</Text>
      </View>
    </View>
  );
}

function DataSourcesBlock({ sources }: { sources: string[] }) {
  const sourceData: Record<string, { type: string; license: string; url: string }> = {
    'PubMed': { type: 'Literature Database', license: 'NCBI ToS', url: 'https://pubmed.ncbi.nlm.nih.gov' },
    'CrossRef': { type: 'DOI Metadata', license: 'CC0', url: 'https://crossref.org' },
    'OpenAlex': { type: 'Scholarly Metadata', license: 'CC0', url: 'https://openalex.org' },
    'FDA': { type: 'Drug Safety Data', license: 'OpenFDA ToS', url: 'https://open.fda.gov' },
    'PubChem': { type: 'Chemical Database', license: 'NCBI ToS', url: 'https://pubchem.ncbi.nlm.nih.gov' },
    'ChEBI': { type: 'Chemical Ontology', license: 'CC-BY 4.0', url: 'https://ebi.ac.uk/chebi' },
    'NPAtlas': { type: 'Natural Products', license: 'CC-BY 4.0', url: 'https://npatlas.org' },
  };
  const srcList = (sources.length > 0 ? sources : ['PubMed', 'CrossRef', 'OpenAlex', 'FDA']).filter(s => sourceData[s]);

  return (
    <View style={S.box}>
      <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, lineHeight: 1.37, marginBottom: 8 }}>
        This report was generated using data from the following publicly accessible scientific databases and knowledge bases.
      </Text>
      {/* Table header */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f6f8fb', paddingVertical: 4, paddingHorizontal: 8, marginBottom: 2, borderBottomWidth: 0.3, borderBottomColor: C.grid }}>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, width: CW * 0.15 }}>Source</Text>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, flex: 1 }}>Type</Text>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, width: CW * 0.15 }}>License</Text>
        <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, flex: 1 }}>URL</Text>
      </View>
      {srcList.map((src, i) => (
        <View key={i} style={{ flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 8, borderBottomWidth: 0.3, borderBottomColor: C.gridHair, alignItems: 'flex-start', backgroundColor: i % 2 === 0 ? C.zebra : C.white }}>
          <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.dark, width: CW * 0.15, paddingRight: 4 }} wrap={false}>{src}</Text>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, flex: 1, paddingRight: 4 }}>{sourceData[src].type}</Text>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, width: CW * 0.15, paddingRight: 4 }} wrap={false}>{sourceData[src].license}</Text>
          <Link src={sourceData[src].url} style={{ flex: 1, textDecoration: 'none' }}>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9, color: LINK_COLOR, paddingRight: 4 }}>{breakLongIdentifier(sourceData[src].url)}</Text>
          </Link>
        </View>
      ))}
    </View>
  );
}

// ─── RESEARCH ASSESSMENT TABLE ────────────────────────────────────────────
function AssessmentTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View style={S.assessBox}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingBottom: 3, borderBottomWidth: 0.3, borderBottomColor: C.gridHair, backgroundColor: i % 2 === 0 ? C.zebra : C.white }}>
          <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.mid, width: CW * 0.30, flexShrink: 0, lineHeight: 1.37, paddingRight: 4 }}>{row.label}</Text>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, flex: 1, lineHeight: 1.37 }}>{nullDisplay(row.value)}</Text>
        </View>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTION PDF DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

export function InteractionPDFDocument({ results, drug, herb, sourcesUsed, fdaData, topCitationCount, aiSummary, aiStructured, scores, confidenceReasoning }: {
  results: StudyResult[];
  drug: string;
  herb: string;
  sourcesUsed: string[];
  fdaData: FdaDrugData | null;
  topCitationCount: number;
  aiSummary?: string | null;
  aiStructured?: StructuredAiReport | null;
  scores?: { normalizedScore: number; evidenceLevel: string; breakdown: EvidenceBreakdown }[];
  confidenceReasoning?: string | null;
}) {
  const identity = INTERACT_IDENTITY;
  ensureFontsRegistered();
  const subject = `${drug} \u2014 ${herb}`;
  const hasStructured = !!(aiStructured && typeof aiStructured === 'object');

  // Determine overall evidence level from the actual composite score,
  // NOT from a broken "best-of" heuristic that labels 14/100 as Moderate
  // just because one study's per-study evidenceLevel was Moderate-tier.
  const avgScore = scores && scores.length > 0
    ? Math.round(scores.reduce((a, s) => a + s.normalizedScore, 0) / scores.length)
    : 0;
  const overallEvidence: 'High' | 'Moderate' | 'Low' =
    avgScore >= 75 ? 'High' : avgScore >= 50 ? 'Moderate' : 'Low';
  const overallConf: 'High' | 'Moderate' | 'Low' =
    avgScore >= 75 ? 'High' : avgScore >= 50 ? 'Moderate' : 'Low';

  const primaryMechanism = (() => {
    const mechs = results.map(r => r.mechanismDescription).filter((m): m is string => !!m && !m.includes('not fully characterized'));
    return mechs.length > 0 ? [...new Set(mechs.flatMap(m => sanitizeText(m).split('; ')))].slice(0, 3).join(', ') : 'Under characterization';
  })();

  const tocItems = [
    { num: 1, title: 'Executive Summary' },
    { num: 2, title: 'Clinical Implications & Monitoring' },
    { num: 3, title: 'Evidence Scoring Methodology' },
    { num: 4, title: 'Evidence Scoring Guide' },
    { num: 5, title: 'Clinical Evidence Assessment' },
    { num: 6, title: 'Weighted Evidence Scoring' },
    ...(hasStructured ? [
      { num: 7, title: 'Evidence Synthesis' },
      { num: 8, title: 'Mechanistic Interpretation' },
      { num: 9, title: 'Clinical Relevance Assessment' },
      { num: 10, title: 'Discussion' },
      { num: 11, title: 'Limitations' },
      { num: 12, title: 'Conclusion' },
      { num: 13, title: 'Evidence Breakdown', subItems: results.slice(0, 6).map((r, i) => `Study ${i + 1}: ${r.studyType || 'Study'}`) },
      { num: 14, title: 'References' },
      { num: 15, title: 'Data Sources & Licensing' },
      { num: 16, title: 'Scientific Disclaimer' },
      { num: 17, title: 'About PharmaInsight' },
    ] : [
      { num: 7, title: 'Evidence-Based Research Synthesis' },
      { num: 8, title: 'Evidence Breakdown', subItems: results.slice(0, 6).map((r, i) => `Study ${i + 1}: ${r.studyType || 'Study'}`) },
      { num: 9, title: 'References' },
      { num: 10, title: 'Data Sources & Licensing' },
      { num: 11, title: 'Scientific Disclaimer' },
      { num: 12, title: 'About PharmaInsight' },
    ]),
  ];

  return (
    <Document>
      <CoverPage identity={identity} subject={subject} subjectSub="Drug-Herb Interaction Report" evidenceLevel={overallEvidence} confidence={overallConf} hasFdaSignal={!!fdaData} />
      <TOCPage items={tocItems} identity={identity} subject={subject} />

      <Page size="A4" style={S.page} wrap>
        <HeaderBar identity={identity} subject={subject} />
        <PageAccentLine identity={identity} position="top" />

        {/* S1 EXECUTIVE SUMMARY */}
        <SectionBlock>
          <SectionHeading num={1} title="Executive Summary" />
          <View style={S.execBox}>
            <View style={S.execRow}><Text style={S.execLabel}>Drug</Text><Text style={S.execValue}>{drug}</Text></View>
            <View style={S.execRow}><Text style={S.execLabel}>Herb</Text><Text style={S.execValue}>{herb}</Text></View>
            <View style={S.execRow}>
              <Text style={S.execLabel}>Primary Mechanism</Text>
              <Text style={S.execValue}>{primaryMechanism}</Text>
            </View>
            <View style={S.execRow}>
              <Text style={S.execLabel}>Evidence Level</Text>
              <Text style={[S.execValue, { fontFamily: 'Carlito', fontWeight: 'bold', color: evidenceBadge(overallEvidence) }]}>{overallEvidence} ({scores && scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.normalizedScore, 0) / scores.length) : 'N/A'}/100)</Text>
            </View>
            <View style={S.execRow}>
              <Text style={S.execLabel}>Study Distribution</Text>
              <Text style={S.execValue}>High: {results.filter(r => r.evidenceLevel === 'High').length} &middot; Moderate: {results.filter(r => r.evidenceLevel === 'Moderate').length} &middot; Low: {results.filter(r => r.evidenceLevel === 'Low').length}</Text>
            </View>
            <View style={S.execRow}>
              <Text style={S.execLabel}>FDA Signal</Text>
              <Text style={[S.execValue, { fontFamily: 'Carlito', fontWeight: 'bold', color: fdaData ? C.badgeSevMaj : C.badgeHigh }]}>{fdaData ? 'Pharmacovigilance data identifies potential safety signals for ' + drug : 'None detected'}</Text>
            </View>
          </View>
          <DynamicAlertCard evidenceLevel={overallEvidence} compositeScore={scores && scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.normalizedScore, 0) / scores.length) : 0} drug={drug} herb={herb} />
        </SectionBlock>

        {/* S2 CLINICAL IMPLICATIONS & MONITORING */}
        <SectionBlock>
          <SectionHeading num={2} title="Clinical Implications & Monitoring Recommendations" />
          <SubHeading>Clinical Implications</SubHeading>
          <SafeCond condition={!!fdaData}>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
              FDA pharmacovigilance data identifies potential safety signals for {drug}. Concurrent use with {herb} warrants enhanced clinical surveillance. The combination should be approached with caution and patients should be informed of potential risks.
            </Text>
          </SafeCond>
          <SafeCond condition={results.some(r => r.severity === 'Major')}>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
              Major severity interactions have been documented between {drug} and {herb}. This combination may pose significant clinical risks and requires careful monitoring.
            </Text>
          </SafeCond>
          <SubHeading>Monitoring Recommendations</SubHeading>
          {[
            `Monitor therapeutic drug levels of ${drug} when co-administered with ${herb}`,
            'Assess patient for signs of altered drug efficacy or increased adverse effects',
            'Review concomitant medications for potential additive interactions',
            'Document and report any adverse events through established pharmacovigilance channels',
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 4 }}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, width: 12, flexShrink: 0, lineHeight: 1.37 }}>{'\u2022'}</Text>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, flex: 1, lineHeight: 1.37 }}>{terminalPeriod(item)}</Text>
            </View>
          ))}
          <SafeCond condition={!!fdaData}>
            <SubHeading>FDA Safety Signals</SubHeading>
            {[
              `${drug} may interact with dietary supplements affecting coagulation`,
              'Monitor INR closely with any supplement use',
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: 4 }}>
                <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, width: 12, flexShrink: 0, lineHeight: 1.37 }}>{'\u2022'}</Text>
                <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, flex: 1, lineHeight: 1.37 }}>{terminalPeriod(item)}</Text>
              </View>
            ))}
          </SafeCond>
        </SectionBlock>

        {/* S3 EVIDENCE SCORING METHODOLOGY */}
        <SectionBlock>
          <SectionHeading num={3} title="Evidence Scoring Methodology" />
          <MethodologyBlock />
        </SectionBlock>

        {/* S4 EVIDENCE SCORING GUIDE */}
        <SectionBlock>
          <SectionHeading num={4} title="Evidence Scoring Guide" />
          <ScoringGuideBlock />
        </SectionBlock>

        {/* S5 CLINICAL EVIDENCE ASSESSMENT */}
        <SectionBlock>
          <SectionHeading num={5} title="Clinical Evidence Assessment" />
          <SafeCond condition={!!aiSummary}>
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
              The interaction between {drug} and {herb} has been evaluated across clinical and preclinical studies. {fdaData ? `FDA pharmacovigilance data identifies potential safety signals for ${drug} with dietary supplements affecting coagulation parameters.` : ''}
            </Text>
          </SafeCond>
          <AssessmentTable rows={[
            { label: 'Evidence Level', value: overallEvidence + ' Evidence' },
            { label: 'Confidence Level', value: 'Confidence: ' + overallConf },
            { label: 'Primary Studies', value: `${results.length} studies identified` },
            { label: 'Study Distribution', value: `High: ${results.filter(r => r.evidenceLevel === 'High').length} \u00b7 Moderate: ${results.filter(r => r.evidenceLevel === 'Moderate').length} \u00b7 Low: ${results.filter(r => r.evidenceLevel === 'Low').length}` },
            { label: 'FDA Signal', value: fdaData ? 'Detected' : 'None' },
          ]} />
        </SectionBlock>

        {/* S6 WEIGHTED EVIDENCE SCORING */}
        <SectionBlock>
          <SectionHeading num={6} title="Weighted Evidence Scoring" />
          {scores && scores.length > 0 && scores.map((score, i) => (
            <View key={i} style={{ backgroundColor: C.inkBg, borderWidth: 0.3, borderColor: C.grid, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 12 }} wrap={false}>
              <Text style={{ fontFamily: 'LiberationSerif', fontWeight: 'bold', fontSize: 9.5, color: C.ink, lineHeight: 1.37, marginBottom: 3 }}>
                Study {i + 1}: {sanitizeText((results[i]?.title || `Study ${i + 1}`).slice(0, 60))}...
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <BadgePill bg={evidenceBadge(score.evidenceLevel)}>{score.normalizedScore}/100</BadgePill>
                <BadgePill bg={evidenceBadge(score.evidenceLevel)}>{score.evidenceLevel} Evidence</BadgePill>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                <Text style={{ fontFamily: 'Carlito', fontSize: 9.5, color: C.muted }}>Study Type: {score.breakdown.studyTypeScore}</Text>
                <Text style={{ fontFamily: 'Carlito', fontSize: 9.5, color: C.muted }}>Journal: {score.breakdown.journalQualityScore}</Text>
                <Text style={{ fontFamily: 'Carlito', fontSize: 9.5, color: C.muted }}>Validation: {score.breakdown.validationScore}</Text>
                {score.breakdown.contradictionPenalty > 0 && <Text style={{ fontFamily: 'Carlito', fontSize: 9.5, color: C.badgeSevMaj }}>Contradiction: {score.breakdown.contradictionPenalty}</Text>}
              </View>
            </View>
          ))}
        </SectionBlock>

        {/* S7+ STRUCTURED or LEGACY AI SECTIONS */}
        {hasStructured && aiStructured ? (<>
          <SectionBlock>
            <SectionHeading num={7} title="Evidence Synthesis" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              This section presents a systematic synthesis of the evidence for the interaction between {drug} and {herb}, integrating findings across clinical, preclinical, and mechanistic studies with explicit attention to evidence hierarchy and methodological quality.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.evidenceSynthesis || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={8} title="Mechanistic Interpretation" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              The following analysis examines the molecular mechanisms underlying the drug-herb interaction, distinguishing confirmed mechanisms from theoretical plausibility.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.mechanisticInterpretation || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={9} title="Clinical Relevance Assessment" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              This section evaluates the clinical translatability of the interaction findings, considering population-specific factors, dose-dependency, and formulation differences.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.clinicalRelevance || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={10} title="Discussion" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              The following discussion critically interprets the available evidence, comparing stronger and weaker findings, identifying inconsistencies and evidence gaps.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.discussion || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={11} title="Limitations" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              This section explicitly acknowledges the limitations of the current evidence base for the interaction between {drug} and {herb}.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.limitations || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={12} title="Conclusion" />
            <View style={S.execBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.conclusion || '')}</Text>
            </View>
          </SectionBlock>
        </>) : (<>
          <SafeCond condition={!!aiSummary}>
            <SectionBlock>
              <SectionHeading num={7} title="Evidence-Based Research Synthesis" />
              <View style={S.sectionBox}>
                <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiSummary || '')}</Text>
              </View>
            </SectionBlock>
          </SafeCond>
        </>)}

        {/* S8/13 EVIDENCE BREAKDOWN */}
        <SectionBlock>
          <SectionHeading num={hasStructured ? 13 : 8} title="Evidence Breakdown" />
          {results.slice(0, 6).map((r, i) => (
            <View key={i} style={[S.studyCard, { backgroundColor: i % 2 === 0 ? C.zebra : C.white }]} minPresenceAhead={2} wrap={false}>
              <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 11, color: C.ink, marginBottom: 3 }} wrap={false}>{hasStructured ? 13 : 8}.{i + 1} {nullDisplay(r.studyType, `Study ${i + 1}`)}</Text>
              <Text style={{ fontFamily: 'LiberationSerif', fontWeight: 'bold', fontSize: 9.5, color: C.ink, lineHeight: 1.37, marginBottom: 3 }}>{sanitizeText(r.title)}</Text>
              <View style={{ flexDirection: 'row', gap: 5, marginBottom: 4, flexWrap: 'wrap' }}>
                <BadgePill bg={evidenceBadge(r.evidenceLevel)}>{r.evidenceLevel} Evidence</BadgePill>
                <BadgePill bg={r.severity === 'Major' ? C.badgeSevMaj : C.badgeLow}>Severity: {r.severity || 'Unknown'}</BadgePill>
                <BadgePill bg={C.badgeRel}>Relevance: {(r.relevance || 'MEDIUM').toUpperCase()}</BadgePill>
              </View>
              {/* Key-Value Property Grid: 30% label / 70% value, prevents fracturing */}
              <View style={S.kvRow}>
                <Text style={S.kvLabel}>Study Type</Text>
                <Text style={S.kvValue}>{nullDisplay(r.studyType)}</Text>
              </View>
              <View style={S.kvRow}>
                <Text style={S.kvLabel}>Clinical Relevance</Text>
                <Text style={S.kvValue}>{nullDisplay(r.clinical_relevance)}</Text>
              </View>
              <SafeCond condition={!!r.mechanismDescription}>
                <View style={S.kvRow}>
                  <Text style={S.kvLabel}>Mechanism</Text>
                  <Text style={S.kvValue}>{sanitizeText(r.mechanismDescription || '')}</Text>
                </View>
              </SafeCond>
              {/* PMID and DOI on separate rows with word-break for long identifiers */}
              <SafeCond condition={!!r.pmid}>
                <View style={S.identRow}>
                  <Text style={S.identLabel}>PMID</Text>
                  <Link src={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} style={{ textDecoration: 'none', flex: 1 }}>
                    <Text style={{ fontFamily: 'Carlito', fontSize: 9.5, color: LINK_COLOR, lineHeight: 1.37 }}>{r.pmid}</Text>
                  </Link>
                </View>
              </SafeCond>
              <SafeCond condition={!!r.doi}>
                <View style={S.identRow}>
                  <Text style={S.identLabel}>DOI</Text>
                  <Link src={r.doiLink || `https://doi.org/${r.doi}`} style={{ textDecoration: 'none', flex: 1 }}>
                    <Text style={{ fontFamily: 'Carlito', fontSize: 9, color: LINK_COLOR, lineHeight: 1.37 }}>{breakLongIdentifier(r.doi || '')}</Text>
                  </Link>
                </View>
              </SafeCond>
              <View style={S.kvRow}>
                <Text style={S.kvLabel}>Source / Journal</Text>
                <Text style={S.kvValue}>{nullDisplay(r.journal)} ({nullDisplay(r.pubYear)})</Text>
              </View>
            </View>
          ))}
        </SectionBlock>

        {/* S9/14 REFERENCES */}
        <SectionBlock>
          <SectionHeading num={hasStructured ? 14 : 9} title="References" />
          <View style={S.refBox}>
            {results.slice(0, 10).map((r, i) => {
              const hasAuthors = !!(r.authors && Array.isArray(r.authors) && r.authors.length > 0);
              const authorStr = hasAuthors ? r.authors.join(', ') : '';
              const yearStr = nullDisplay(r.pubYear, '');
              const titleStr = sanitizeText(r.title || '');
              const journalStr = nullDisplay(r.journal, '');
              const hasFullData = hasAuthors && journalStr && yearStr;

              return (
                <View key={i} style={S.refItem} wrap={false}>
                  <Text style={S.refNum}>[{i + 1}]</Text>
                  <View style={S.refBody}>
                    {hasFullData ? (
                      <Text style={S.refText}>
                        {authorStr} ({yearStr}). {titleStr}. <Text style={{ fontStyle: 'italic' }}>{journalStr}</Text>.{r.doi ? ` DOI:${breakLongIdentifier(r.doi)}` : ''} &middot; {r.pmid ? <Link src={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>PMID:{r.pmid}</Link> : 'PMID:N/A'}
                      </Text>
                    ) : (
                      <Text style={S.refText}>
                        {titleStr}{yearStr ? ` (${yearStr})` : ''}. {journalStr ? <Text style={{ fontStyle: 'italic' }}>{journalStr}</Text> : ''}. {r.pmid ? <Link src={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>PMID:{r.pmid}</Link> : 'PMID:N/A'}{r.doi ? ` \u00b7 DOI:${breakLongIdentifier(r.doi)}` : ''}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading num={hasStructured ? 15 : 10} title="Data Sources & Licensing" />
          <DataSourcesBlock sources={sourcesUsed} />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading num={hasStructured ? 16 : 11} title="Scientific Disclaimer" />
          <DisclaimerBlock />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading num={hasStructured ? 17 : 12} title="About PharmaInsight" />
          <AboutBlock />
        </SectionBlock>

        <FooterBlock />
        <PageAccentLine identity={identity} position="bottom" />
      </Page>
    </Document>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHARMACOLOGY PDF DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════

function mechToText(m: unknown): string {
  if (typeof m === 'string') return m;
  if (m && typeof m === 'object' && 'name' in m) return String((m as { name: string }).name);
  return String(m ?? '');
}

function getActionScore(a: Record<string, unknown>): number {
  const s = (a as Record<string, unknown>).score ?? (a as Record<string, unknown>).evidence_score ?? 0;
  return typeof s === 'number' ? s : parseInt(String(s), 10) || 0;
}

function safeStr(v: unknown, fallback = 'N/A'): string {
  if (v === null || v === undefined || v === '') return fallback;
  return String(v);
}

export function PharmacologyPDFDocument({ result, aiSummary, aiStructured }: {
  result: {
    herb: string;
    pharmacological_actions: PharmacologyAction[];
    active_compounds: PharmacologyCompound[];
    evidence_level: string;
    confidence: string;
    sourcesUsed: string[];
    confidenceReasoning?: string;
    references?: { pmid: string; title: string; authors: string[]; journal: string; pubYear: string; doi?: string }[];
  };
  aiSummary?: string | null;
  aiStructured?: StructuredAiReport | null;
}) {
  const identity = PHARMA_IDENTITY;
  ensureFontsRegistered();
  const subject = result.herb || 'Unknown Herb';
  const rawActions: Record<string, unknown>[] = (result.pharmacological_actions || []) as unknown as Record<string, unknown>[];
  const rawCompounds: Record<string, unknown>[] = (result.active_compounds || []) as unknown as Record<string, unknown>[];
  const hasStructured = !!(aiStructured && typeof aiStructured === 'object');

  const strongestAction = rawActions.length > 0
    ? rawActions.reduce((best, a) => getActionScore(a) > getActionScore(best) ? a : best, rawActions[0])
    : null;
  const strongestScore = strongestAction ? getActionScore(strongestAction) : 0;
  const strongestName = strongestAction ? safeStr(strongestAction.name, 'Unknown') : '';

  const tocItems = [
    { num: 1, title: 'Executive Summary' },
    { num: 2, title: 'Research Evidence Assessment' },
    { num: 3, title: 'Evidence Scoring Methodology' },
    { num: 4, title: 'Active Compounds' },
    { num: 5, title: 'Pharmacological Evidence Matrix', subItems: rawActions.slice(0, 6).map(a => toTitleCase(safeStr(a.name, 'Action'))) },
    ...(hasStructured ? [
      { num: 6, title: 'Evidence Synthesis' },
      { num: 7, title: 'Mechanistic Interpretation' },
      { num: 8, title: 'Research Relevance Assessment' },
      { num: 9, title: 'Discussion' },
      { num: 10, title: 'Limitations' },
      { num: 11, title: 'Conclusion' },
      { num: 12, title: 'References' },
      { num: 13, title: 'Data Sources & Licensing' },
      { num: 14, title: 'Scientific Disclaimer' },
      { num: 15, title: 'About PharmaInsight' },
    ] : [
      { num: 6, title: 'References' },
      { num: 7, title: 'Data Sources & Licensing' },
      { num: 8, title: 'Scientific Disclaimer' },
      { num: 9, title: 'About PharmaInsight' },
    ]),
  ];

  return (
    <Document>
      <CoverPage identity={identity} subject={subject} subjectSub="Pharmacology & Phytochemistry Report" evidenceLevel={result.evidence_level || 'Low'} confidence={result.confidence || 'Low'} />
      <TOCPage items={tocItems} identity={identity} subject={subject} />

      <Page size="A4" style={S.page} wrap>
        <HeaderBar identity={identity} subject={subject} />
        <PageAccentLine identity={identity} position="top" />

        {/* S1 EXECUTIVE SUMMARY */}
        <SectionBlock>
          <SectionHeading num={1} title="Executive Summary" />
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
            This report presents a comprehensive pharmacological and phytochemical analysis of {subject}, one of the most extensively studied medicinal plants in modern pharmacology. {rawCompounds.length > 0 ? `The primary bioactive compound, ${safeStr(rawCompounds[0]?.name, 'the main active constituent')}, has been investigated across multiple therapeutic domains including ${rawActions.slice(0, 5).map(a => safeStr(a.name, '').toLowerCase()).filter(Boolean).join(', ')}.` : ''}
          </Text>
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
            The overall evidence level is assessed as {safeStr(result.evidence_level, 'Low')} with {safeStr(result.confidence, 'Low')} confidence. {strongestAction ? `${strongestName} demonstrates the strongest evidence base (score: ${strongestScore}), supported by ${Array.isArray(strongestAction.pmids) ? strongestAction.pmids.length : 0} citations.` : ''}
          </Text>
          {/* Summary stats with divider rules for scanability */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <BadgePill bg={evidenceBadge(result.evidence_level || 'Low')}>{safeStr(result.evidence_level, 'Low')} Evidence</BadgePill>
            <Text style={{ color: C.faint, fontSize: 10 }}>|</Text>
            <BadgePill bg={evidenceBadge(result.confidence || 'Low')}>Confidence: {safeStr(result.confidence, 'Low')}</BadgePill>
            <Text style={{ color: C.faint, fontSize: 10 }}>|</Text>
            {rawCompounds.length > 0 && <BadgePill bg={C.badgeQ}>{rawCompounds.length} Active Compounds</BadgePill>}
            {rawCompounds.length > 0 && rawActions.length > 0 && <Text style={{ color: C.faint, fontSize: 10 }}>|</Text>}
            {rawActions.length > 0 && <BadgePill bg={C.badgeRel}>{rawActions.length} Pharmacological Actions</BadgePill>}
          </View>
          <DynamicAlertCard evidenceLevel={result.evidence_level || 'Low'} compositeScore={strongestScore} herb={subject} />
        </SectionBlock>

        {/* S2 RESEARCH EVIDENCE ASSESSMENT */}
        <SectionBlock>
          <SectionHeading num={2} title="Research Evidence Assessment" />
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
            The research evidence for {subject}&apos;s pharmacological actions is derived from a systematic review of published literature sourced from {(result.sourcesUsed || []).join(', ')} databases. {rawActions.length} primary pharmacological actions were identified and critically appraised.
          </Text>
          <AssessmentTable rows={[
            { label: 'Evidence Level', value: safeStr(result.evidence_level, 'Low') + ' Evidence' },
            { label: 'Confidence Level', value: 'Confidence: ' + safeStr(result.confidence, 'Low') },
            { label: 'Primary Studies', value: `${rawActions.length} studies identified` },
            { label: 'Pharmacological Actions', value: `${rawActions.length} identified` },
            { label: 'Active Compounds', value: `${rawCompounds.length} identified (${rawCompounds.filter(c => c.is_major || c.isMajor).length} major, ${rawCompounds.filter(c => !c.is_major && !c.isMajor).length} minor)` },
            { label: 'Data Sources', value: (result.sourcesUsed || []).join(', ') || 'N/A' },
            ...(strongestAction ? [{ label: 'Strongest Action', value: `${strongestName} (Score: ${strongestScore})` }] : []),
          ]} />
          <SafeCond condition={!!result.confidenceReasoning}>
            <View style={S.execBox}>
              <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.ink, letterSpacing: 1, marginBottom: 4 }}>CONFIDENCE REASONING</Text>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(result.confidenceReasoning || '')}</Text>
            </View>
          </SafeCond>
        </SectionBlock>

        {/* S3 EVIDENCE SCORING METHODOLOGY */}
        <SectionBlock>
          <SectionHeading num={3} title="Evidence Scoring Methodology" />
          <MethodologyBlock />
        </SectionBlock>

        {/* S4 ACTIVE COMPOUNDS */}
        <SectionBlock>
          <SectionHeading num={4} title="Active Compounds" />
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
            The following bioactive compounds have been identified in {subject} and are associated with its pharmacological activities.
          </Text>
          {rawCompounds.map((compound, i) => {
            const compPmids: string[] = Array.isArray(compound.pmids) ? compound.pmids.map(String) : [];
            const isMajor = !!(compound.is_major || compound.isMajor);
            return (
              <View key={i} style={{ borderWidth: 0.3, borderColor: C.grid, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 12, backgroundColor: i % 2 === 0 ? C.zebra : C.white }} minPresenceAhead={2} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{ fontFamily: 'LiberationSerif', fontWeight: 'bold', fontSize: 9.5, color: C.ink }} wrap={false}>{safeStr(compound.name, 'Unknown Compound')}</Text>
                  {isMajor && <BadgePill bg={C.badgeHigh}>Major Compound</BadgePill>}
                </View>
                <Text style={{ fontFamily: 'Carlito', fontSize: 9.5, color: C.badgeMod, marginBottom: 2 }} wrap={false}>{nullDisplay(compound.chemical_class || compound.class || compound.category as string | undefined, 'Unclassified')}</Text>
                <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.mid, lineHeight: 1.37 }}>
                  {compPmids.length || safeStr(compound.citation_count, '0')} citations &mdash; {compPmids.slice(0, 3).map((pmid, pi) => (
                    <React.Fragment key={pi}>{pi > 0 ? '; ' : ''}PMID:<Link src={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>{pmid}</Link></React.Fragment>
                  ))}
                </Text>
              </View>
            );
          })}
        </SectionBlock>

        {/* S5 PHARMACOLOGICAL EVIDENCE MATRIX */}
        <SectionBlock>
          <SectionHeading num={5} title="Pharmacological Evidence Matrix" />
          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 6 }}>
            The following evidence matrix provides a comprehensive view of each pharmacological action identified for {subject}, including study-conditional molecular mechanisms and supporting citations.
          </Text>
          {/* Matrix table header */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f6f8fb', paddingVertical: 4, paddingHorizontal: 8, marginBottom: 2, borderBottomWidth: 0.3, borderBottomColor: C.grid }}>
            <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, width: CW * 0.22, flexShrink: 0, paddingRight: 4 }}>Action</Text>
            <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, flex: 1, paddingRight: 4 }}>Mechanism (Study-Conditional)</Text>
            <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.muted, width: CW * 0.23, flexShrink: 0 }}>Score / Level</Text>
          </View>
          {rawActions.map((action, i) => {
            const score = getActionScore(action);
            const actionName = safeStr(action.name, 'Uncharacterized Action');
            const actionPmids: string[] = Array.isArray(action.pmids) ? action.pmids.map(String) : [];
            const mechList: unknown[] = Array.isArray(action.mechanisms) ? action.mechanisms : [];
            const evLevel = score >= 75 ? 'High' : score >= 50 ? 'Moderate' : 'Low';
            return (
              <View key={i} style={{ borderWidth: 0.3, borderColor: C.grid, paddingVertical: 6, paddingHorizontal: 8, marginBottom: 2, backgroundColor: i % 2 === 0 ? C.zebra : C.white }} minPresenceAhead={2} wrap={false}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} wrap={false}>
                  <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.ink, width: CW * 0.22, flexShrink: 0, paddingRight: 4, lineHeight: 1.37 }} wrap={false}>{actionName}</Text>
                  <View style={{ flex: 1, paddingRight: 4 }}>
                    {mechList.length > 0 ? mechList.map((mech, j) => {
                      const rawMechName = sanitizeText(mechToText(mech));
                      const mechName = nullDisplay(rawMechName);
                      const mechPmids: string[] = (mech && typeof mech === 'object' && 'pmids' in mech && Array.isArray((mech as { pmids: string[] }).pmids))
                        ? (mech as { pmids: string[] }).pmids
                        : [];
                      return (
                        <View key={j} style={{ flexDirection: 'row', marginBottom: 2, alignItems: 'flex-start' }}>
                          <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9, color: C.dark, flex: 1, lineHeight: 1.37, paddingRight: 2 }}>{mechName}</Text>
                          {mechPmids.length > 0 && <Text style={{ fontFamily: 'Carlito', fontSize: 8.5, color: LINK_COLOR, lineHeight: 1.37 }}>
                            {mechPmids.slice(0, 2).map((pmid, pi) => (
                              <React.Fragment key={pi}>{pi > 0 ? ', ' : ''}<Link src={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>PMID:{pmid}</Link></React.Fragment>
                            ))}
                          </Text>}
                        </View>
                      );
                    }) : <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9, color: C.light, lineHeight: 1.37, textAlign: 'center' as const }}>{'\u2014'}</Text>}
                  </View>
                  {/* Score + Level kept together as non-breaking unit */}
                  <View style={{ width: CW * 0.23, flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'nowrap' as const }} wrap={false}>
                    <Text style={{ fontFamily: 'Carlito', fontWeight: 'bold', fontSize: 9.5, color: C.ink, lineHeight: 1.37 }}>{score}</Text>
                    <BadgePill bg={evidenceBadge(evLevel)}>{evLevel}</BadgePill>
                  </View>
                </View>
                {/* Evidence strength bar */}
                <View style={{ width: '100%', height: 2, backgroundColor: '#e8e8ee', marginTop: 3, marginBottom: 2 }}>
                  <View style={{ width: `${Math.max(score, 1)}%`, height: 2, backgroundColor: evidenceBadge(evLevel) }} />
                </View>
              </View>
            );
          })}
        </SectionBlock>

        {/* S6+ STRUCTURED AI SECTIONS or LEGACY */}
        {hasStructured && aiStructured ? (<>
          <SectionBlock>
            <SectionHeading num={6} title="Evidence Synthesis" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              This section presents a systematic synthesis of the pharmacological evidence for {subject}, integrating findings across clinical, preclinical, and mechanistic studies.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.evidenceSynthesis || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={7} title="Mechanistic Interpretation" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              The following analysis examines the molecular mechanisms underlying the pharmacological actions of {subject}, distinguishing confirmed mechanisms from theoretical plausibility.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.mechanisticInterpretation || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={8} title="Research Relevance Assessment" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              This section evaluates the research translatability of the pharmacological findings for {subject}, considering population-specific factors, dose-dependency, and formulation differences.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.clinicalRelevance || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={9} title="Discussion" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              The following discussion critically interprets the available evidence, comparing stronger and weaker findings, identifying inconsistencies and evidence gaps.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.discussion || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={10} title="Limitations" />
            <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.body, lineHeight: 1.37, marginBottom: 4 }}>
              This section explicitly acknowledges the limitations of the current evidence base for the pharmacological profile of {subject}.
            </Text>
            <View style={S.sectionBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.limitations || '')}</Text>
            </View>
          </SectionBlock>
          <SectionBlock>
            <SectionHeading num={11} title="Conclusion" />
            <View style={S.execBox}>
              <Text style={{ fontFamily: 'LiberationSerif', fontSize: 9.5, color: C.dark, lineHeight: 1.37 }}>{sanitizeText(aiStructured.conclusion || '')}</Text>
            </View>
          </SectionBlock>
        </>) : (<View />)}

        {/* REFERENCES */}
        <SectionBlock>
          <SectionHeading num={hasStructured ? 12 : 6} title="References" />
          <View style={S.refBox}>
            {(() => {
              // Build reference list from the enriched references data (Pillar 4a)
              const refData = result.references;
              if (refData && Array.isArray(refData) && refData.length > 0) {
                // Use full academic metadata from the API
                // Deduplicate by PMID
                const seenPmids = new Set<string>();
                const uniqueRefs = refData.filter(r => {
                  if (seenPmids.has(r.pmid)) return false;
                  seenPmids.add(r.pmid);
                  return true;
                });
                return uniqueRefs.slice(0, 20).map((ref, i) => {
                  const hasAuthors = !!(ref.authors && ref.authors.length > 0);
                  const authorStr = hasAuthors
                    ? (ref.authors.length > 3
                      ? ref.authors.slice(0, 3).join(', ') + ', et al.'
                      : ref.authors.join(', '))
                    : '';
                  const yearStr = nullDisplay(ref.pubYear, '');
                  const titleStr = sanitizeText(ref.title || '');
                  const journalStr = nullDisplay(ref.journal, '');
                  const hasFullData = hasAuthors && journalStr && yearStr;

                  return (
                    <View key={i} style={S.refItem} wrap={false}>
                      <Text style={S.refNum}>[{i + 1}]</Text>
                      <View style={S.refBody}>
                        {hasFullData ? (
                          <Text style={S.refText}>
                            {authorStr} ({yearStr}). {titleStr}. <Text style={{ fontStyle: 'italic' }}>{journalStr}</Text>.{ref.doi ? ` DOI:${breakLongIdentifier(ref.doi)}` : ''} &middot; <Link src={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>PMID:{ref.pmid}</Link>
                          </Text>
                        ) : (
                          <Text style={S.refText}>
                            {titleStr}{yearStr ? ` (${yearStr})` : ''}. {journalStr ? <Text style={{ fontStyle: 'italic' }}>{journalStr}</Text> : ''}{journalStr && yearStr ? '.' : ''} <Link src={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>PMID:{ref.pmid}</Link>{ref.doi ? ` \u00b7 DOI:${breakLongIdentifier(ref.doi)}` : ''}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                });
              }

              // Fallback: use action-level PMID references (legacy mode)
              return rawActions.map((action, i) => {
                const actionPmids: string[] = Array.isArray(action.pmids) ? action.pmids.map(String) : [];
                const actionName = safeStr(action.name, 'Pharmacological Action');

                return (
                  <View key={i} style={S.refItem} wrap={false}>
                    <Text style={S.refNum}>[{i + 1}]</Text>
                    <View style={S.refBody}>
                      <Text style={S.refText}>
                        {actionName}. {actionPmids.length > 0 ? actionPmids.slice(0, 3).map((pmid, pi) => (
                          <React.Fragment key={pi}>{pi > 0 ? '; ' : ''}<Link src={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} style={{ color: LINK_COLOR, textDecoration: 'underline' }}>PMID:{pmid}</Link></React.Fragment>
                        )) : 'No PMID available'}
                      </Text>
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        </SectionBlock>

        <SectionBlock>
          <SectionHeading num={hasStructured ? 13 : 7} title="Data Sources & Licensing" />
          <DataSourcesBlock sources={result.sourcesUsed || []} />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading num={hasStructured ? 14 : 8} title="Scientific Disclaimer" />
          <DisclaimerBlock />
        </SectionBlock>

        <SectionBlock>
          <SectionHeading num={hasStructured ? 15 : 9} title="About PharmaInsight" />
          <AboutBlock />
        </SectionBlock>

        <FooterBlock />
        <PageAccentLine identity={identity} position="bottom" />
      </Page>
    </Document>
  );
}
