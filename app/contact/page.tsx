'use client';

import { motion } from 'framer-motion';
import { Mail, Shield, AlertTriangle } from 'lucide-react';

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
// CONTACT PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function ContactPage() {
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
                <Mail size={12} /> CONTACT US
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-3 tracking-tight leading-tight">
                Connect with PharmaInsight
              </h1>
              <p className="text-gray-500 max-w-3xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                Whether you are a researcher, healthcare professional, academic institution, regulatory organization, or technology partner, we welcome inquiries, scientific collaboration opportunities, and professional partnerships.
              </p>
            </div>
          </motion.div>

          {/* ═══ CONTACT CARDS ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Academic & Editorial Inquiries */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-[#0f172a] rounded-lg flex items-center justify-center mb-4 text-white">
                <Mail size={18} />
              </div>
              <h3 className="font-extrabold text-[#0f172a] mb-1 text-sm tracking-tight">
                Academic & Editorial Inquiries
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium mb-3">
                Scientific content questions, editorial correspondence, and literature review inquiries.
              </p>
              <a
                href="mailto:contact@phytoprecisionsystem.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
              >
                <Mail size={12} className="text-gray-400" />
                contact@phytoprecisionsystem.com
              </a>
            </motion.div>

            {/* Technical Infrastructure & API Support */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center mb-4 text-white">
                <Shield size={18} />
              </div>
              <h3 className="font-extrabold text-[#0f172a] mb-1 text-sm tracking-tight">
                Technical Infrastructure & API Support
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium mb-3">
                Platform technical issues, API integration questions, and system performance inquiries.
              </p>
              <a
                href="mailto:contact@phytoprecisionsystem.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
              >
                <Mail size={12} className="text-gray-400" />
                contact@phytoprecisionsystem.com
              </a>
            </motion.div>

            {/* Institutional Partnerships & Licensing */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center mb-4 text-white">
                <Mail size={18} />
              </div>
              <h3 className="font-extrabold text-[#0f172a] mb-1 text-sm tracking-tight">
                Institutional Partnerships & Licensing
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium mb-3">
                Institutional membership, licensing agreements, and strategic partnership discussions.
              </p>
              <a
                href="mailto:partnerships@phytoprecisionsystem.com"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
              >
                <Mail size={12} className="text-gray-400" />
                partnerships@phytoprecisionsystem.com
              </a>
            </motion.div>
          </div>

          {/* ═══ PROFESSIONAL NOTICE ═══ */}
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
                  Professional Notice
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  PharmaInsight is an evidence-based scientific intelligence platform designed to support literature assessment, pharmacological analysis, and evidence-informed scientific review. Communications submitted through this platform do not establish a clinical relationship and should not be used for medical emergencies or urgent healthcare decisions.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
