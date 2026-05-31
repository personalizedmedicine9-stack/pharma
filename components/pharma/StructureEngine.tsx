'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, Search, Leaf, AlertTriangle, Info, Copy, ExternalLink, ChevronDown, ChevronUp, Bookmark, BookmarkCheck, Atom, Beaker, CheckCircle, Database, Box, RotateCcw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import type { StructureResponse, CompoundStructure, SpellingCorrection } from '@/lib/types';
import { EXAMPLE_COMPOUNDS } from '@/lib/knowledge-base';

interface StructureEngineProps {
  onSearch: (query: string) => Promise<StructureResponse | null>;
  onSignInRequired: () => void;
}

export default function StructureEngine({ onSearch, onSignInRequired }: StructureEngineProps) {
  const { isAuthenticated, user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StructureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [spellingCorrection, setSpellingCorrection] = useState<SpellingCorrection | null>(null);
  const [confidenceReasoning, setConfidenceReasoning] = useState<string | null>(null);
  const [reportSaved, setReportSaved] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  // Hydration-safe: only compute dynamic disabled state after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(false);
    setSpellingCorrection(null);
    setReportSaved(false);
    setConfidenceReasoning(null);
    setExpandedCards(new Set());
    setQuery(searchQuery);

    try {
      const data = await onSearch(searchQuery.trim());
      if (!data) {
        setError('Search failed. Please try again.');
      } else {
        setResult(data);
        if (data.spellingCorrection) setSpellingCorrection(data.spellingCorrection);
        if (data.confidenceReasoning) setConfidenceReasoning(data.confidenceReasoning);
        if (data.compounds.length > 0) {
          setExpandedCards(new Set([0]));
        }
      }
    } catch {
      setError('Search failed. Please try again.');
    }

    setLoading(false);
    setSearched(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(query);
  };

  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  // Compute disabled state — always true before mount to avoid hydration mismatch
  const isSubmitDisabled = mounted ? (loading || !query.trim()) : true;

  return (
    <div className="space-y-6">
      {/* Search form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center flex-shrink-0">
            <Hexagon size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-800">Chemical Structure Search</h2>
            <p className="text-slate-400 text-xs md:text-sm">Search any compound by name, CAS number, SMILES, InChI, InChIKey, or PubChem CID</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-slate-600 uppercase tracking-wide">
              <Atom size={15} className="text-cyan-500" />
              Compound Name, CAS, SMILES, InChI, or CID
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Curcumin, 458-37-7, CC1=CC=C(C=C1), InChI=1S/C21H20O6…"
              required
              className="w-full px-4 py-3 md:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-cyan-200 hover:shadow-lg hover:shadow-cyan-200 active:scale-[0.98] text-sm md:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching Chemical Structures…
              </>
            ) : (
              <>
                <Search size={18} />
                Search Chemical Structure
              </>
            )}
          </button>
        </form>

        <div className="mt-5">
          <p className="text-[11px] md:text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_COMPOUNDS.map((c) => (
              <button
                key={c}
                onClick={() => handleSubmit(c)}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
              >
                <Atom size={12} className="text-cyan-400" />
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-xl shadow-xl">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-white mt-0.5 flex-shrink-0" />
            <div className="text-xs md:text-sm text-gray-300 leading-relaxed">
              <span className="font-extrabold text-white">Data Sources: </span>
              Enter a <strong className="text-white">compound name</strong> (Curcumin, Aspirin), <strong className="text-white">CAS number</strong> (458-37-7), <strong className="text-white">SMILES</strong> (CC1=CC=C), <strong className="text-white">InChI/InChIKey</strong>, or <strong className="text-white">PubChem CID</strong>. View <strong className="text-white">2D structures</strong> (PubChem PNG) and <strong className="text-white">3D conformers</strong> (interactive rotation/zoom from PubChem 3D data).
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertTriangle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-rose-700 text-sm md:text-base">{error}</p>
        </motion.div>
      )}

      {/* Results */}
      {searched && result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">

          {/* Spelling Correction */}
          {spellingCorrection && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs md:text-sm text-amber-800 font-medium">
                {spellingCorrection.wasAutoCorrected
                  ? <>Corrected <strong>{spellingCorrection.original}</strong> to <strong>{spellingCorrection.canonical || spellingCorrection.corrected}</strong></>
                  : <>Showing results for <strong>{spellingCorrection.canonical || spellingCorrection.corrected}</strong></>
                }
                {spellingCorrection.synonymApplied && spellingCorrection.canonical && (
                  <span className="text-amber-600 ml-1 text-xs">(scientific synonym)</span>
                )}
              </p>
            </div>
          )}

          {/* Confidence Reasoning */}
          {confidenceReasoning && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider mb-1">Confidence Assessment</h4>
              <p className="text-xs md:text-sm text-blue-900 leading-relaxed">{confidenceReasoning}</p>
            </div>
          )}

          {/* No results */}
          {result.compounds.length === 0 && result.noResultsMessage && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <AlertTriangle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-500 text-sm md:text-base">{result.noResultsMessage}</p>
            </div>
          )}

          {/* Results header */}
          {result.compounds.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hexagon size={18} className="text-cyan-600" />
                    <h3 className="text-base md:text-lg font-extrabold text-slate-800">{result.query}</h3>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm">Chemical structure data — {result.totalResults} compound{result.totalResults > 1 ? 's' : ''} found</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {result.sourcesUsed.map(src => (
                    <span key={src} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold bg-cyan-600 text-white">
                      <Database size={10} /> {src}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <button
                  onClick={async () => {
                    if (!isAuthenticated) {
                      onSignInRequired();
                      return;
                    }
                    try {
                      const res = await fetch('/api/saved-reports', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          reportId: `structure_${result.query}_${Date.now()}`,
                          reportType: 'structure',
                          herbName: result.query,
                          reportData: result,
                          userId: user?.id,
                          authMode: user?.authMode || 'local',
                        }),
                      });
                      if (res.ok) {
                        setReportSaved(true);
                        toast.success('Structure report saved successfully!');
                      } else {
                        toast.error('Failed to save report. Please try again.');
                      }
                    } catch {
                      toast.error('Network error. Please try again.');
                    }
                  }}
                  disabled={reportSaved}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 hover:border-cyan-500 disabled:border-cyan-400 rounded-xl text-sm font-bold text-gray-700 hover:text-cyan-700 disabled:text-cyan-600 transition-all shadow-sm"
                >
                  {reportSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {reportSaved ? 'Saved' : 'Save Report'}
                </button>
              </div>

              {/* Compound cards */}
              <div className="space-y-4">
                {result.compounds.map((compound, index) => (
                  <CompoundCard
                    key={`${compound.cid}-${compound.name}`}
                    compound={compound}
                    index={index}
                    expanded={expandedCards.has(index)}
                    onToggle={() => toggleCard(index)}
                    onCopy={copyToClipboard}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Initial state — before search */}
      {!searched && !loading && !error && (
        <div className="space-y-8 mt-4">
          <div className="text-center py-12 md:py-16 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-cyan-700 text-white px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-extrabold mb-6 md:mb-8 tracking-widest shadow-sm">
                2D &amp; 3D CHEMICAL STRUCTURE RETRIEVAL
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight leading-tight">
                Any Compound.<br />2D &amp; 3D Structures.
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 text-sm md:text-lg font-medium">
                Search by compound name, CAS number, SMILES, InChI, InChIKey, or PubChem CID. View 2D chemical structures and interactive 3D conformer models with rotation &amp; zoom.
              </p>
              <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                <span className="px-4 md:px-5 py-2 md:py-2.5 bg-cyan-700 text-white rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest shadow-sm">100M+ COMPOUNDS</span>
                <span className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest">2D + 3D VIEWER</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Compound Card Component ───

interface CompoundCardProps {
  compound: CompoundStructure;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, label: string) => void;
}

function CompoundCard({ compound, index, expanded, onToggle, onCopy }: CompoundCardProps) {
  const pubchemUrl = compound.cid
    ? `https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`
    : '';
  const chebiUrl = compound.chebiId
    ? `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${compound.chebiId}`
    : '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Beaker size={16} className="text-cyan-700" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-slate-800">{compound.name}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {compound.molecularFormula && (
                <span className="text-[11px] md:text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {compound.molecularFormula}
                </span>
              )}
              {compound.molecularWeight > 0 && (
                <span className="text-[11px] md:text-xs text-slate-500">
                  MW: {compound.molecularWeight.toFixed(2)}
                </span>
              )}
              {compound.compoundClass && (
                <span className="text-[11px] md:text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  {compound.compoundClass}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {compound.cid > 0 && (
            <a
              href={pubchemUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] md:text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
            >
              PubChem <ExternalLink size={10} />
            </a>
          )}
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-5 pt-1 border-t border-slate-100">
              <StructureViewer compound={compound} onCopy={onCopy} pubchemUrl={pubchemUrl} chebiUrl={chebiUrl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 2D / 3D Structure Viewer with Tabs ───

type ViewMode = '2d' | '3d';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Viewer3D = any;

interface StructureViewerProps {
  compound: CompoundStructure;
  onCopy: (text: string, label: string) => void;
  pubchemUrl: string;
  chebiUrl: string;
}

function StructureViewer({ compound, onCopy, pubchemUrl, chebiUrl }: StructureViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [image2dLoaded, setImage2dLoaded] = useState(false);
  const [image2dError, setImage2dError] = useState(false);
  const viewer3dContainerRef = useRef<HTMLDivElement>(null);
  const viewer3dRef = useRef<Viewer3D>(null);
  const [viewer3dState, setViewer3dState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [viewer3dError, setViewer3dError] = useState<string>('');

  // ─── Initialize 3D viewer when switching to 3D tab ───
  useEffect(() => {
    if (viewMode !== '3d' || !compound.cid || compound.cid === 0) return;

    let cancelled = false;
    setViewer3dState('loading');
    setViewer3dError('');

    const init3D = async () => {
      try {
        // 1. Import 3Dmol from npm package (client-side only)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let $3Dmol: any = null;
        try {
          const mod = await import('3dmol');
          $3Dmol = mod.default || mod;
          // Some bundles export under $3Dmol property
          if (!$3Dmol.createViewer && $3Dmol.$3Dmol) {
            $3Dmol = $3Dmol.$3Dmol;
          }
        } catch (importErr) {
          console.error('[3D Viewer] npm import failed:', importErr);
          // Fallback: check if already loaded via script tag
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $3Dmol = (window as any).$3Dmol;
        }

        if (!$3Dmol || !$3Dmol.createViewer) {
          // Last resort: try loading from CDN
          console.log('[3D Viewer] Trying CDN fallback...');
          const cdnLoaded = await new Promise<boolean>((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = window as any;
            if (w.$3Dmol) { resolve(true); return; }
            const existing = document.getElementById('3dmol-script');
            if (existing) {
              const check = setInterval(() => {
                if (w.$3Dmol) { clearInterval(check); resolve(true); }
              }, 100);
              setTimeout(() => { clearInterval(check); resolve(false); }, 10000);
              return;
            }
            const script = document.createElement('script');
            script.id = '3dmol-script';
            script.src = 'https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js';
            script.async = true;
            script.onload = () => setTimeout(() => resolve(!!w.$3Dmol), 100);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
          });

          if (cdnLoaded) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            $3Dmol = (window as any).$3Dmol;
          }
        }

        if (!$3Dmol || !$3Dmol.createViewer || cancelled) {
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('3Dmol.js library could not be loaded. Try refreshing the page.');
          }
          return;
        }

        // 2. Fetch SDF data through our server-side proxy
        let sdfData = '';
        let is3dData = false;

        try {
          const proxyRes = await fetch('/api/structure/sdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cid: compound.cid, record_type: '3d' }),
            signal: AbortSignal.timeout(30000),
          });

          if (proxyRes.ok) {
            const data = await proxyRes.json();
            if (data.sdf && data.sdf.trim().length > 50) {
              sdfData = data.sdf;
              is3dData = data.recordType === '3d';
            }
          } else {
            console.warn('[3D Viewer] SDF proxy HTTP error:', proxyRes.status);
          }
        } catch (err) {
          console.warn('[3D Viewer] SDF proxy fetch failed:', err instanceof Error ? err.message : String(err));
        }

        if (!sdfData || cancelled) {
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('Could not fetch structure data. The compound may not have 3D conformer data in PubChem.');
          }
          return;
        }

        // 3. Wait for the container to be fully laid out
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

        if (cancelled) return;

        // 4. Create the viewer
        const container = viewer3dContainerRef.current;
        if (!container) {
          if (!cancelled) { setViewer3dState('error'); setViewer3dError('Viewer container not available.'); }
          return;
        }

        // Ensure container has dimensions
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const rect2 = container.getBoundingClientRect();
          if (rect2.width === 0 || rect2.height === 0) {
            if (!cancelled) { setViewer3dState('error'); setViewer3dError('Viewer container has no dimensions.'); }
            return;
          }
        }

        // 5. Create viewer and add model
        let viewer = null;
        try {
          viewer = $3Dmol.createViewer(container, {
            backgroundColor: '#ffffff',
            antialias: true,
          });
        } catch (viewerErr) {
          console.error('[3D Viewer] createViewer threw:', viewerErr);
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('3Dmol.js createViewer failed: ' + (viewerErr instanceof Error ? viewerErr.message : String(viewerErr)));
          }
          return;
        }

        if (!viewer || cancelled) {
          if (!cancelled) { setViewer3dState('error'); setViewer3dError('3Dmol.js createViewer returned null.'); }
          return;
        }

        viewer3dRef.current = viewer;

        try {
          viewer.addModel(sdfData, 'sdf');

          if (is3dData) {
            viewer.setStyle({}, { stick: { radius: 0.12 }, sphere: { scale: 0.25 } });
          } else {
            viewer.setStyle({}, { stick: { radius: 0.15 } });
          }

          viewer.zoomTo();
          viewer.render();
          if (is3dData) viewer.spin(true);
        } catch (modelErr) {
          console.error('[3D Viewer] Error rendering model:', modelErr);
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('Error rendering 3D model: ' + (modelErr instanceof Error ? modelErr.message : String(modelErr)));
          }
          return;
        }

        if (!cancelled) setViewer3dState('ready');
      } catch (err) {
        console.error('[3D Viewer] Unexpected error:', err);
        if (!cancelled) {
          setViewer3dState('error');
          setViewer3dError(err instanceof Error ? err.message : 'Unknown error initializing 3D viewer');
        }
      }
    };

    init3D();

    return () => {
      cancelled = true;
      if (viewer3dRef.current) {
        try { viewer3dRef.current.clear(); } catch { /* ignore */ }
        try {
          const container = viewer3dContainerRef.current;
          if (container) container.innerHTML = '';
        } catch { /* ignore */ }
        viewer3dRef.current = null;
      }
    };
  }, [viewMode, compound.cid]);

  // ─── 3D Controls ───
  const handleResetView = () => {
    if (viewer3dRef.current) {
      try { viewer3dRef.current.zoomTo(); viewer3dRef.current.render(); } catch { /* */ }
    }
  };
  const handleZoomIn = () => {
    if (viewer3dRef.current) {
      try { viewer3dRef.current.zoom(1.2); viewer3dRef.current.render(); } catch { /* */ }
    }
  };
  const handleZoomOut = () => {
    if (viewer3dRef.current) {
      try { viewer3dRef.current.zoom(0.8); viewer3dRef.current.render(); } catch { /* */ }
    }
  };

  const has3D = compound.cid > 0;

  // Build 2D image URL — use PubChem PNG endpoint
  const image2dUrl = compound.cid > 0
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/PNG?image_size=large`
    : compound.imageUrl2D;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Structure Viewer */}
      <div>
        {/* 2D / 3D Toggle Tabs */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Hexagon size={12} /> 2D Structure
          </button>
          <button
            onClick={() => { if (has3D) setViewMode('3d'); }}
            disabled={!has3D}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-cyan-600 text-white shadow-sm'
                : has3D
                  ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Box size={12} /> 3D Conformer
          </button>
          {!has3D && (
            <span className="text-[10px] text-slate-400 italic">3D not available</span>
          )}
        </div>

        {/* 2D Viewer */}
        {viewMode === '2d' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-[280px]">
            {image2dUrl && !image2dError ? (
              <>
                {!image2dLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={image2dUrl}
                  alt={`2D chemical structure of ${compound.name}`}
                  className="max-w-full max-h-[320px] object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImage2dLoaded(true)}
                  onError={() => { setImage2dError(true); setImage2dLoaded(true); }}
                />
              </>
            ) : (
              <div className="text-center text-slate-400">
                <Hexagon size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">
                  {image2dError ? 'Could not load 2D structure image' : '2D structure not available'}
                </p>
                {compound.cid > 0 && (
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-600 hover:underline mt-1 inline-block"
                  >
                    View on PubChem instead
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3D Viewer */}
        {viewMode === '3d' && (
          <div className="relative" style={{ height: '420px' }}>
            <div
              ref={viewer3dContainerRef}
              className="bg-white border border-slate-200 rounded-xl"
              style={{ width: '100%', height: '100%', position: 'relative' }}
            />
            {/* 3D Controls */}
            {viewer3dState === 'ready' && (
              <div className="absolute top-2 right-2 flex gap-1 bg-white/90 rounded-lg border border-slate-200 p-1 shadow-sm z-10">
                <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom In">
                  <ZoomIn size={14} className="text-slate-600" />
                </button>
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom Out">
                  <ZoomOut size={14} className="text-slate-600" />
                </button>
                <button onClick={handleResetView} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Reset View">
                  <RotateCcw size={14} className="text-slate-600" />
                </button>
                <button
                  onClick={() => {
                    if (viewer3dContainerRef.current?.requestFullscreen) {
                      viewer3dContainerRef.current.requestFullscreen();
                    }
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 size={14} className="text-slate-600" />
                </button>
              </div>
            )}
            {/* Loading overlay */}
            {viewer3dState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl pointer-events-none z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading 3D conformer…</p>
                  <p className="text-[10px] text-slate-400 mt-1">Fetching structure data from PubChem</p>
                </div>
              </div>
            )}
            {/* Error overlay */}
            {viewer3dState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                <div className="text-center text-slate-400">
                  <Box size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">3D conformer not available</p>
                  {viewer3dError && (
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">{viewer3dError}</p>
                  )}
                  {!viewer3dError && (
                    <p className="text-[10px] text-slate-400 mt-1">This compound may not have 3D data in PubChem</p>
                  )}
                  {compound.cid > 0 && (
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-cyan-600 hover:underline mt-1 inline-block"
                    >
                      View on PubChem
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* Spin hint */}
            {viewer3dState === 'ready' && (
              <div className="absolute bottom-2 left-2 bg-white/90 rounded-md px-2 py-1 border border-slate-200 z-10">
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <RotateCcw size={10} /> Drag to rotate · Scroll to zoom
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick identifiers below structure */}
        <div className="flex flex-wrap gap-2 mt-2">
          {compound.cid > 0 && (
            <a
              href={pubchemUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-cyan-50 border border-cyan-200 rounded text-[11px] font-bold text-cyan-700 hover:bg-cyan-100"
            >
              <Database size={10} /> CID: {compound.cid}
            </a>
          )}
          {compound.chebiId && (
            <a
              href={chebiUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-teal-50 border border-teal-200 rounded text-[11px] font-bold text-teal-700 hover:bg-teal-100"
            >
              <Database size={10} /> {compound.chebiId}
            </a>
          )}
        </div>
      </div>

      {/* Molecular Properties */}
      <div>
        <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle size={12} className="text-emerald-500" /> Molecular Properties
        </h5>
        <div className="space-y-2">
          {compound.iupacName && (
            <PropertyRow label="IUPAC Name" value={compound.iupacName} copyable onCopy={onCopy} />
          )}
          {compound.molecularFormula && (
            <PropertyRow label="Molecular Formula" value={compound.molecularFormula} copyable onCopy={onCopy} />
          )}
          {compound.molecularWeight > 0 && (
            <PropertyRow label="Molecular Weight" value={`${compound.molecularWeight.toFixed(2)} g/mol`} />
          )}
          {compound.smiles && (
            <PropertyRow label="SMILES" value={compound.smiles} copyable mono onCopy={onCopy} />
          )}
          {compound.inchi && (
            <PropertyRow label="InChI" value={compound.inchi} copyable mono onCopy={onCopy} />
          )}
          {compound.inchiKey && (
            <PropertyRow label="InChI Key" value={compound.inchiKey} copyable mono onCopy={onCopy} />
          )}
          {compound.casNumber && (
            <PropertyRow label="CAS Number" value={compound.casNumber} copyable onCopy={onCopy} />
          )}
          {compound.sourceOrganism && (
            <PropertyRow label="Source Organism" value={compound.sourceOrganism} />
          )}
          {compound.compoundClass && (
            <PropertyRow label="Compound Class" value={compound.compoundClass} />
          )}
        </div>

        {/* PubMed References */}
        {compound.pubmedReferences.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Leaf size={12} className="text-emerald-500" /> PubMed References
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {compound.pubmedReferences.map(pmid => (
                <a
                  key={pmid}
                  href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] md:text-xs underline text-emerald-700 hover:text-emerald-900"
                >
                  PMID:{pmid}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        <div className="mt-4">
          <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ExternalLink size={12} className="text-slate-400" /> External Links
          </h5>
          <div className="flex flex-wrap gap-2">
            {compound.cid > 0 && (
              <a
                href={pubchemUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-50 border border-cyan-200 rounded-lg text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-colors"
              >
                <Database size={12} /> PubChem
              </a>
            )}
            {compound.chebiId && (
              <a
                href={chebiUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
              >
                <Database size={12} /> ChEBI
              </a>
            )}
            {compound.inchiKey && (
              <a
                href={`https://www.npatlas.org/api/v1/compounds?inchikey=${compound.inchiKey}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-lime-50 border border-lime-200 rounded-lg text-xs font-bold text-lime-700 hover:bg-lime-100 transition-colors"
              >
                <Database size={12} /> NPAtlas
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Property Row Component ───

interface PropertyRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  onCopy?: (text: string, label: string) => void;
}

function PropertyRow({ label, value, copyable, mono, onCopy }: PropertyRowProps) {
  return (
    <div className="flex items-start gap-2 py-1.5 px-2 bg-slate-50 rounded-lg">
      <span className="text-[11px] font-bold text-slate-500 min-w-[100px] md:min-w-[120px] flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-[11px] md:text-xs text-slate-800 break-all flex-1 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
      {copyable && onCopy && (
        <button
          onClick={() => onCopy(value, label)}
          className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
          title={`Copy ${label}`}
        >
          <Copy size={12} className="text-slate-400" />
        </button>
      )}
    </div>
  );
}
