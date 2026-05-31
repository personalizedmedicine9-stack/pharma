'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  FlaskConical,
  Shield,
  Atom,
  Database,
  AlertTriangle,
  Microscope,
  Target,
  Beaker,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// METHODOLOGY PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased">
      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
        <div className="space-y-12">

          {/* ═══ HERO ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-10 md:py-14 px-6 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold mb-5 tracking-[0.2em] shadow-md">
                <Microscope size={12} /> METHODOLOGY
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-3 tracking-tight leading-tight">
                How PharmaInsight Works
              </h1>
              <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                PharmaInsight is an evidence-based scientific intelligence platform designed to support the structured evaluation of pharmacological, phytochemical, and drug–herb interaction evidence. The platform integrates biomedical literature analysis, evidence classification methodologies, pharmacological knowledge frameworks, and computational assessment tools to generate transparent, publication-oriented reports.
              </p>
            </div>
          </motion.div>

          {/* ═══ DATA SOURCES ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-[0.2em] shadow-md">
                <Database size={12} /> DATA SOURCES
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">
              PharmaInsight utilizes publicly available scientific and biomedical resources, including but not limited to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Peer-reviewed biomedical literature' },
                { label: 'Indexed scientific journals' },
                { label: 'Pharmacology databases' },
                { label: 'Pharmacovigilance resources' },
                { label: 'Drug information repositories' },
                { label: 'Regulatory safety communications' },
                { label: 'Biomedical abstracts and metadata sources' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl"
                >
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#0f172a]" />
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Priority is given to higher-quality evidence sources, including systematic reviews, meta-analyses, randomized controlled trials, and controlled clinical studies whenever available.
            </p>
          </motion.div>

          {/* ═══ EVIDENCE EVALUATION FRAMEWORK ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-[0.2em] shadow-md">
                <Target size={12} /> EVIDENCE EVALUATION FRAMEWORK
              </div>
            </div>

            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-6">
              Evidence is evaluated according to methodological quality, clinical relevance, reproducibility, and consistency across independent sources.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* High-Level Evidence */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Shield size={16} />
                  </div>
                  <h3 className="font-extrabold text-emerald-700 text-sm tracking-tight">
                    High-Level Evidence
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {['Systematic Reviews', 'Meta-Analyses', 'Randomized Controlled Trials', 'Controlled Human Clinical Studies'].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-emerald-400" />
                      <span className="text-xs text-gray-600 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Moderate-Level Evidence */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                    <FlaskConical size={16} />
                  </div>
                  <h3 className="font-extrabold text-amber-700 text-sm tracking-tight">
                    Moderate-Level Evidence
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {['Cohort Studies', 'Case-Control Studies', 'Observational Research'].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-amber-400" />
                      <span className="text-xs text-gray-600 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Preliminary Evidence */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center text-white">
                    <Microscope size={16} />
                  </div>
                  <h3 className="font-extrabold text-gray-700 text-sm tracking-tight">
                    Preliminary Evidence
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {['Case Reports', 'Animal Studies', 'In Vitro Investigations', 'Mechanistic Studies', 'Computational Models'].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-gray-400" />
                      <span className="text-xs text-gray-600 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 leading-relaxed font-medium italic">
                *Note: The presence of multiple low-quality studies does not automatically increase evidence certainty.
              </p>
            </div>
          </motion.div>

          {/* ═══ DRUG–HERB INTERACTION ASSESSMENT ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-[0.2em] shadow-md">
                <Beaker size={12} /> DRUG–HERB INTERACTION ASSESSMENT
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">
              Interaction assessments consider available evidence regarding:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                'Pharmacokinetic interactions',
                'Pharmacodynamic interactions',
                'CYP450 enzyme involvement',
                'Drug transporter activity',
                'Potential overlapping toxicities',
                'Pharmacovigilance safety signals',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl"
                >
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-400" />
                  <span className="text-xs font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Interactions are classified according to the strength and quality of available evidence rather than theoretical plausibility alone.
            </p>
          </motion.div>

          {/* ═══ PHARMACOLOGICAL AND PHYTOCHEMICAL ANALYSIS ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-[0.2em] shadow-md">
                <FlaskConical size={12} /> PHARMACOLOGICAL AND PHYTOCHEMICAL ANALYSIS
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">
              Pharmacological profiles are generated through structured review of:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                'Active constituents',
                'Phytochemical classes',
                'Reported biological activities',
                'Mechanistic evidence',
                'Clinical and preclinical findings',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl"
                >
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-400" />
                  <span className="text-xs font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Findings are interpreted according to the level of supporting evidence and are not presented as established clinical outcomes unless supported by appropriate human data.
            </p>
          </motion.div>

          {/* ═══ METHODOLOGICAL LIMITATIONS ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-[#0f172a] text-sm tracking-tight mb-2">
                  Methodological Limitations
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium mb-3">
                  Scientific evidence may contain limitations including:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {[
                    'Publication bias',
                    'Small sample sizes',
                    'Heterogeneous methodologies',
                    'Conflicting findings',
                    'Incomplete reporting',
                    'Limited clinical validation',
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-1.5 px-2 py-1.5 bg-white/60 border border-amber-100 rounded-lg"
                    >
                      <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0 bg-amber-400" />
                      <span className="text-[11px] font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  Accordingly, all platform outputs should be interpreted within the context of the underlying evidence base and its inherent limitations.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
