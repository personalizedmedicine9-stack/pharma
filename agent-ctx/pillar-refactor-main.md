# Task: PharmaInsight Premium v1.0 — 4-Pillar PDF & Engine Overhaul

## Agent: Main Orchestrator
## Status: COMPLETED

## Summary
Successfully completed all 4 pillars of the PharmaInsight Premium v1.0 refactoring, upgrading the PDF typesetting engine from v30.0 to v32.0.

## Changes Made

### Pillar 1: Legal Safeguards & Brand Alignment
- Updated PDF AboutBlock description and bullets for brand alignment
- Added Team sub-section with ORCID links for Dr. Mahmoud Mostafa and Dr. Rwaida Alhaidari
- Changed "clinical decision-making" → "clinical or therapeutic decision-making" across PDF disclaimer, ScientificDisclaimer, and ConsentPopup
- Changed "Clinical Relevance" → "Research Relevance" in MethodologyBlock
- Changed "animal/in vitro" → "preclinical and in vitro" in methodology description

### Pillar 2: Algorithmic Calibration
- Added authors[] and pubYear extraction from PubMed XML in pharmacology API route
- Added references field to API response with full academic metadata
- Fixed "0 major" bug: PDF used c.is_major (snake_case) but API returns isMajor (camelCase)
- Added PharmacologyReference interface to types.ts
- Verified evidence inflation ceiling is correct (no changes needed)
- Verified ACTIVE_COMPOUNDS names match MAJOR_BIOACTIVE_MARKERS keys

### Pillar 3: Redundancy Elimination
- Removed redundant S4 (Pharmacological Evidence Profile)
- Created new S5 "Pharmacological Evidence Matrix" with table header: Action | Mechanism (Study-Conditional) | Score | Level
- Deleted raw PMID dumps ("Supporting Literature: PMID:xxx / PMID:yyy")
- Renumbered all sections and updated TOC
- Renamed "Clinical Evidence Assessment" → "Research Evidence Assessment"
- Renamed "Clinical Relevance Assessment" → "Research Relevance Assessment"

### Pillar 4: PDF Typesetting & Formatting
- Overhauled pharmacology references to use full academic metadata: "Authors. Title. Journal. Year. DOI. PMID"
- Author truncation for >3 authors ("et al.")
- PMID deduplication in references
- Legacy fallback for references without full metadata
- DataSourcesBlock URL column changed from fixed width 140 to flex with wrapping
- MethodologyBlock description column: removed wrap={false}, added paddingRight
- Version updated from v30.0 to v32.0

## Build Verification
- `npx next build` — ✓ Compiled successfully
- Dev server running on port 3000 — ✓ Verified
