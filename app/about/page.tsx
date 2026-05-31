'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Shield,
  FlaskConical,
  Users,
  Award,
  Globe,
  Linkedin,
  BookOpen,
  Microscope,
  Building2,
  Network,
  Target,
  AlertTriangle,
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
// ABOUT PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased">
      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
        <div className="space-y-12">

          {/* ═══ OUR TEAM HERO ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-10 md:py-14 px-6 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[12px] font-extrabold mb-5 tracking-[0.2em] shadow-md">
                <Users size={12} /> OUR TEAM
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-3 tracking-tight leading-tight">
                The Minds Behind PharmaInsight
              </h1>
              <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed mb-4 text-sm md:text-base font-medium">
                PharmaInsight is developed through an interdisciplinary scientific framework integrating expertise in pharmacology, pharmacognosy, biomedical literature analysis, computational systems design, and evidence-based evaluation.
              </p>
              <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                Our mission is to support transparent, evidence-informed assessment of pharmacological, phytochemical, and drug–herb interaction data through structured analytical methodologies and scientific reporting standards.
              </p>
            </div>
          </motion.div>

          {/* ═══ FOUNDER — DR. MAHMOUD MOSTAFA ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600">
                <Award size={18} />
              </div>
              <div>
                <h2 className="font-extrabold tracking-tight text-amber-600">Founder</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform Architect & Scientific Lead</p>
              </div>
              <div className="flex-1 h-px border-amber-200 ml-2" />
            </div>

            <motion.div
              variants={cardVariants}
              className="bg-white rounded-2xl border border-amber-200/80 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="relative w-28 h-28 rounded-xl overflow-hidden ring-2 ring-amber-200 ring-offset-2">
                      <Image
                        src="/team/mahmoud.webp"
                        alt="Dr. Mahmoud Mostafa"
                        fill
                        className="object-cover"
                        sizes="112px"
                        priority
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-[#0f172a] tracking-tight leading-tight">
                      Dr. Mahmoud Mostafa
                    </h3>
                    <p className="font-bold mt-0.5 text-amber-600 text-sm leading-snug">
                      Founder & Scientific Systems Architect
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      Associate Professor of Pharmacognosy and Natural Products
                    </p>

                    {/* ORCID */}
                    <a
                      href="https://orcid.org/0000-0002-2117-6588"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3"
                    >
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 256 256" fill="none">
                          <path d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" fill="#A6CE39"/>
                          <path d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-120c-5.7 0-10.3-4.6-10.3-10.3S73 45.6 78.6 45.6c5.7 0 10.3 4.6 10.3 10.3 0 5.7-4.6 10.3-10.3 10.3zm55.8 120h-15.4V79.1h14.8v10.5h0.2c5-8 13.6-12.5 23.2-12.5 19.5 0 31.4 13.7 31.4 34.5v74.6h-15.4v-70.5c0-14.8-6.7-22.8-19.3-22.8-13.4 0-22.5 10.3-22.5 25.1v68.2z" fill="#fff"/>
                        </svg>
                        <span className="text-[10px] font-bold text-green-700 tracking-wide">
                          0000-0002-2117-6588
                        </span>
                      </div>
                    </a>

                    {/* Areas of Interest */}
                    <div className="mt-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                        Areas of Interest
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Personalized Medicine', 'Drug–Herb Interactions', 'Pharmacovigilance', 'Evidence-Based Phytotherapy'].map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 tracking-wide"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Core Responsibilities */}
                    <div className="mt-4">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                        Core Responsibilities
                      </p>
                      <ul className="space-y-1.5">
                        {[
                          'Platform architecture and scientific systems development',
                          'Design and maintenance of evidence assessment and scoring methodologies',
                          'Development of structured scientific reporting and publication-oriented output frameworks',
                          'Pharmacological interaction modeling and biomedical evidence integration',
                          'Oversight of scientific content strategy and analytical workflows',
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-1.5">
                            <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-amber-400" />
                            <span className="text-xs text-gray-600 leading-relaxed font-medium">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Professional Profiles */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                        Professional Profiles
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href="https://www.linkedin.com/in/mahmoud-mostafa-607b2121"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[10px] font-bold"
                        >
                          <Linkedin size={11} />
                          LinkedIn
                        </a>
                        <a
                          href="https://orcid.org/0000-0002-2117-6588"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-[10px] font-bold"
                        >
                          <svg width="11" height="11" viewBox="0 0 256 256" fill="none">
                            <path d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" fill="#A6CE39"/>
                            <path d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-120c-5.7 0-10.3-4.6-10.3-10.3S73 45.6 78.6 45.6c5.7 0 10.3 4.6 10.3 10.3 0 5.7-4.6 10.3-10.3 10.3zm55.8 120h-15.4V79.1h14.8v10.5h0.2c5-8 13.6-12.5 23.2-12.5 19.5 0 31.4 13.7 31.4 34.5v74.6h-15.4v-70.5c0-14.8-6.7-22.8-19.3-22.8-13.4 0-22.5 10.3-22.5 25.1v68.2z" fill="#fff"/>
                          </svg>
                          ORCID
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ═══ SCIENTIFIC REVIEW — DR. RWAIDA ALHAIDARI ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="font-extrabold tracking-tight text-emerald-600">Scientific Review</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Methodology & Evidence Assessment</p>
              </div>
              <div className="flex-1 h-px border-emerald-200 ml-2" />
            </div>

            <motion.div
              variants={cardVariants}
              className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
              <div className="p-6 md:p-8">
                {/* Name and title — no avatar */}
                <h3 className="text-xl font-black text-[#0f172a] tracking-tight leading-tight">
                  Dr. Rwaida Alhaidari
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Associate Professor of Pharmacognosy and Natural Products
                </p>
                <p className="font-bold mt-0.5 text-emerald-600 text-sm leading-snug">
                  Scientific Review and Methodology Advisor
                </p>

                {/* ORCID */}
                <a
                  href="https://orcid.org/0000-0002-9229-8216"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3"
                >
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 256 256" fill="none">
                      <path d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" fill="#A6CE39"/>
                      <path d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-120c-5.7 0-10.3-4.6-10.3-10.3S73 45.6 78.6 45.6c5.7 0 10.3 4.6 10.3 10.3 0 5.7-4.6 10.3-10.3 10.3zm55.8 120h-15.4V79.1h14.8v10.5h0.2c5-8 13.6-12.5 23.2-12.5 19.5 0 31.4 13.7 31.4 34.5v74.6h-15.4v-70.5c0-14.8-6.7-22.8-19.3-22.8-13.4 0-22.5 10.3-22.5 25.1v68.2z" fill="#fff"/>
                    </svg>
                    <span className="text-[10px] font-bold text-green-700 tracking-wide">
                      0000-0002-9229-8216
                    </span>
                  </div>
                </a>
{/* Professional Profiles */}
<div className="mt-4 pt-3 border-t border-gray-100">
  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
    Professional Profiles
  </p>
  <div className="flex items-center gap-2">
    <a
      href="https://www.linkedin.com/in/dr-rwaida-al-haidari-29652850/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-[10px] font-bold"
    >
      <Linkedin size={11} />
      LinkedIn
    </a>
    <a
      href="https://orcid.org/0000-0002-9229-8216"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-[10px] font-bold"
    >
     <svg width="11" height="11" viewBox="0 0 256 256" fill="none">
  <path d="M256 128c0 70.7-57.3 128-128 128S0 198.7 0 128 57.3 0 128 0s128 57.3 128 128z" fill="#A6CE39"/>
  <path d="M86.3 186.2H70.9V79.1h15.4v107.1zm-7.7-120c-5.7 0-10.3-4.6-10.3-10.3S73 45.6 78.6 45.6c5.7 0 10.3 4.6 10.3 10.3 0 5.7-4.6 10.3-10.3 10.3zm55.8 120h-15.4V79.1h14.8v10.5h0.2c5-8 13.6-12.5 23.2-12.5 19.5 0 31.4 13.7 31.4 34.5v74.6h-15.4v-70.5c0-14.8-6.7-22.8-19.3-22.8-13.4 0-22.5 10.3-22.5 25.1v68.2z" fill="#fff"/>
</svg>
      ORCID
    </a>
  </div>
</div>
                {/* Areas of Interest */}
                <div className="mt-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                    Areas of Interest
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Scientific Review', 'Methodological Assessment', 'Evidence Evaluation', 'Clinical Literature Appraisal'].map((item) => (
                      <span
                        key={item}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 tracking-wide"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Core Responsibilities */}
                <div className="mt-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">
                    Core Responsibilities
                  </p>
                  <ul className="space-y-1.5">
                    {[
                      'Review of scientific methodologies used within evidence reports',
                      'Assessment of literature quality and evidence consistency',
                      'Evaluation of classification frameworks and interpretation standards',
                      'Support for scientific accuracy, terminology consistency, and methodological transparency',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-emerald-400" />
                        <span className="text-xs text-gray-600 leading-relaxed font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ═══ MEMBERSHIP & ACADEMIC COLLABORATION ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[12px] font-extrabold mb-4 tracking-[0.2em] shadow-md">
                <Building2 size={12} /> MEMBERSHIP & ACADEMIC COLLABORATION
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight mb-2">
                Institutional & Research Partnerships
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Institutional Membership Program */}
              <motion.div
                variants={cardVariants}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#0f172a] rounded-lg flex items-center justify-center text-white">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-sm tracking-tight">
                      Institutional Membership Program
                    </h3>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Planned Release Q4 2026
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mb-3">
                  Potential features include:
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Multi-user access management',
                    'Advanced reporting workflows',
                    'API integration options',
                    'Evidence export capabilities',
                    'Collaborative research support',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-[#0f172a]" />
                      <span className="text-xs text-gray-600 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Contributing Researcher Network */}
              <motion.div
                variants={cardVariants}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Network size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0f172a] text-sm tracking-tight">
                      Contributing Researcher Network
                    </h3>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Open for Collaboration
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mb-2">
                  Fields: Clinical Pharmacology, Pharmacognosy, Toxicology, Pharmaceutical Sciences, Ethnopharmacology, Biomedical Research
                </p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mb-1">
                  Contributors may participate in:
                </p>
                <ul className="space-y-1.5">
                  {[
                    'Scientific content review',
                    'Evidence curation initiatives',
                    'Methodological assessment activities',
                    'Research collaboration opportunities',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-emerald-400" />
                      <span className="text-xs text-gray-600 leading-relaxed font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* ═══ SCIENTIFIC FOCUS AREAS ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-[0.2em] shadow-md">
                <Target size={12} /> SCIENTIFIC FOCUS AREAS
              </div>
            </div>
            <h2 className="text-xl font-black text-[#0f172a] tracking-tight mb-4">
              Core Analytical Domains
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                'Drug–Herb Interaction Assessment',
                'Polypharmacy Evidence Review',
                'CYP450 and Drug Transporter Mapping',
                'Pharmacovigilance Signal Evaluation',
                'Hepatic and Renal Safety Assessment',
                'Pharmacological Profiling',
                'Phytochemical Characterization',
                'Biomedical Literature Synthesis',
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 tracking-wide hover:bg-gray-100 transition-colors"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ═══ PROFESSIONAL USE NOTICE ═══ */}
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
              <div>
                <h3 className="font-extrabold text-[#0f172a] text-sm tracking-tight mb-2">
                  Professional Use Notice
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  PharmaInsight is intended to support scientific evaluation, literature review, and evidence-informed interpretation of biomedical information. The platform does not provide medical diagnosis, individualized treatment recommendations, prescribing decisions, or emergency clinical guidance. All outputs should be interpreted within the context of the underlying evidence base, methodological limitations, and professional judgment.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
