# PharmaInsight Premium v1.0 — 4-Pillar Refactoring Worklog

**Date**: 2026-05-30  
**Version**: v30.0 → v32.0  
**Engine**: pdf-export.tsx Typesetting Engine  

---

## PILLAR 1: Legal Safeguards & Brand Alignment

### 1a. PDF AboutBlock Update (`pdf-export.tsx`)
- **Changed** platform description from "designed to evaluate drug-herb interactions" → "designed to deliver structured evidence intelligence for scientific and professional review"
- **Changed** bullet "clinical severity assessment" → "evidence-based severity assessment"
- **Changed** bullet "clinical pharmacologists" → "pharmacologists"
- **Changed** bullet "clinical relevance tracking" → "research relevance tracking"
- **Added** Team sub-section with two member cards:
  - Dr. Mahmoud Mostafa: "Founder & Scientific Systems Architect" with ORCID link (0000-0002-2117-6588)
  - Dr. Rwaida Alhaidari: "Scientific Review and Methodology Advisor" with ORCID link (0000-0002-4855-5288)

### 1b. PDF Disclaimer Update (`pdf-export.tsx` line 168)
- **Changed** "clinical decision-making" → "clinical or therapeutic decision-making"

### 1c. MethodologyBlock "Clinical Relevance" label (`pdf-export.tsx`)
- **Changed** criterion label 'Clinical Relevance' → 'Research Relevance'
- **Changed** description "animal/in vitro evidence weighted lower" → "preclinical and in vitro evidence weighted lower"

### 1d. UI Component Updates
- **ScientificDisclaimer.tsx**: Changed "clinical decision-making" → "clinical or therapeutic decision-making"
- **ConsentPopup.tsx**: Changed "clinical decision-making" → "clinical or therapeutic decision-making"

---

## PILLAR 2: Algorithmic Calibration

### 2a. Pharmacology Engine — Author/Year Extraction (`route.ts`)
- **Added** `authors: string[]` and `pubYear: string` fields to the articles array
- **Added** XML parsing for `<AuthorList><Author>` blocks extracting LastName + ForeName/Initials
- **Added** XML parsing for `<PubDate><Year>` and `<MedlineDate>` fallback
- **Added** `references` field to API response containing full academic metadata per article

### 2b. Evidence Inflation Ceiling
- **Verified** already correct: single-study cap at 49/100, aggregate cap at 49/100, `isLargeScaleSingleSource()` exemption — NO changes needed

### 2c. Chemical Structure Engine "0 major" Bug Fix
- **Root cause**: PDF line 1053 used `c.is_major` (snake_case) but API returns `isMajor` (camelCase)
- **Fixed** AssessmentTable row: `c.is_major` → `c.is_major || c.isMajor` for both filter conditions
- **Verified** ACTIVE_COMPOUNDS names match MAJOR_BIOACTIVE_MARKERS keys after split('(') processing (e.g., "Hypericin" → "hypericin" matches marker)

### 2d. Types Update (`types.ts`)
- **Added** `PharmacologyReference` interface with pmid, title, authors[], journal, pubYear, doi
- **Added** `references?: PharmacologyReference[]` to `PharmacologyResponse`

---

## PILLAR 3: Redundancy Elimination (PDF Template)

### 3a. Section Restructuring
- **Removed** old S4 "Pharmacological Evidence Profile" — was redundant with S6
- **Renumbered**: S5 (Active Compounds) → S4, S6 (Actions & Mechanisms) → S5

### 3b. Merged Evidence Matrix (new S5)
- **Created** "Pharmacological Evidence Matrix" with proper table header: Action | Mechanism (Study-Conditional) | Score | Level
- **Each row** shows action name, mechanism with study-conditional PMIDs, score, and evidence level badge
- **Study-conditional**: Each mechanism shows its specific PMIDs from the `proximate` filter results
- **Default**: "Not explicitly characterized" for actions with no proximate mechanisms

### 3c. Deleted Raw PMID Dumps
- **Removed** the "Supporting Literature: PMID:xxx / PMID:yyy" block from S6 (old lines 1184-1190)
- PMIDs are now referenced inline in the evidence matrix mechanism cells and in the References section

### 3d. Section Label Updates
- S2: "Clinical Evidence Assessment" → "Research Evidence Assessment"
- S8 (AI section): "Clinical Relevance Assessment" → "Research Relevance Assessment"
- TOC updated with new numbering and labels

---

## PILLAR 4: PDF Typesetting & Formatting

### 4a. Reference Parsing Template Overhaul
- **Pharmacology PDF references** now use the enriched `result.references` data from the API
- **Full academic format**: "Authors. Title. *Journal*. Year. DOI:XXX · PMID:XXXXX"
- **Compact format** (fallback when metadata incomplete): "Title (Year). *Journal*. PMID:XXXXX"
- **Author truncation**: >3 authors → "First3, et al."
- **PMID deduplication**: references deduplicated by PMID before rendering
- **Legacy fallback**: if no references data, falls back to action-level PMID references

### 4b. Table Cell Auto-Wrap Fix
- **MethodologyBlock**: Removed `wrap={false}` from methodology description column, added `paddingRight: 4` to all cells
- **DataSourcesBlock**: Changed URL column from `width: 140` to `flex: 1`, removed `wrap={false}` from text cells, added `paddingRight: 4` and `alignItems: 'flex-start'`
- **AssessmentTable**: Comment updated from "Clinical Assessment" → "Research Assessment"

### 4c. Version Update
- Header comment updated from v30.0 → v32.0

---

## Build Verification
- `npx next build` — ✓ Compiled successfully, no type errors
- Dev server running on port 3000 — ✓ Verified
- Lint errors are pre-existing (require-style imports for font registration, alt-text on PDF Image components)

---

## Files Modified
1. `/home/z/my-project/src/lib/pdf-export.tsx` — Primary PDF typesetting engine (v30.0 → v32.0)
2. `/home/z/my-project/src/app/api/pharmacology/route.ts` — Added authors/pubYear extraction, references in response
3. `/home/z/my-project/src/lib/types.ts` — Added PharmacologyReference interface and references field
4. `/home/z/my-project/src/components/pharma/ScientificDisclaimer.tsx` — "clinical or therapeutic" update
5. `/home/z/my-project/src/components/pharma/ConsentPopup.tsx` — "clinical or therapeutic" update

## Files Verified (No Changes Needed)
- `/home/z/my-project/src/lib/evidence-scoring.ts` — Inflation ceiling already correct
- `/home/z/my-project/src/app/about/page.tsx` — Team titles already correct
- `/home/z/my-project/src/lib/knowledge-base.ts` — ACTIVE_COMPOUNDS naming matches MAJOR_BIOACTIVE_MARKERS
