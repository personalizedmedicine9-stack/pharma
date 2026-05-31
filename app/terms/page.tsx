'use client';

import { motion } from 'framer-motion';
import { FileText, Scale, Shield, AlertTriangle, BookOpen, FlaskConical, Lock, Globe, Mail } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

// ═══════════════════════════════════════════════════════════════════════════
// TERMS OF USE PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased">
      <main className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
        <div className="space-y-10">

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
                <FileText size={12} /> TERMS OF USE
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-3 tracking-tight leading-tight">
                Terms of Use
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                Last updated: January 2026
              </p>
            </div>
          </motion.div>

          {/* ═══ ACCEPTANCE OF TERMS ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white">
                <Scale size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Acceptance of Terms</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              By accessing or using PharmaInsight (&quot;the Platform&quot;), you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must discontinue use of the Platform immediately. Your continued use of PharmaInsight constitutes acceptance of these terms and any future modifications.
            </p>
          </motion.div>

          {/* ═══ DESCRIPTION OF SERVICE ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <FlaskConical size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Description of Service</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              PharmaInsight is an evidence-based scientific intelligence platform that provides structured evaluation of pharmacological, phytochemical, and drug–herb interaction evidence. The platform integrates biomedical literature analysis, evidence classification methodologies, pharmacological knowledge frameworks, and computational assessment tools to generate scientific reports. Services include interaction assessment, pharmacological profiling, chemical structure retrieval, and publication-oriented report generation.
            </p>
          </motion.div>

          {/* ═══ PROFESSIONAL USE ONLY ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                <Shield size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Professional Use Only</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              PharmaInsight is intended for use by researchers, healthcare professionals, academics, regulatory professionals, and other qualified individuals. The platform is designed to support scientific evaluation, literature review, and evidence-informed decision-making. It is not intended for use by the general public as a self-diagnosis or self-treatment tool.
            </p>
          </motion.div>

          {/* ═══ NO MEDICAL ADVICE ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">No Medical Advice</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              The platform does not provide medical advice, diagnosis, or treatment recommendations. All outputs represent structured summaries and evaluations of published scientific evidence. No information provided through PharmaInsight should be considered a substitute for professional medical consultation, clinical judgment, or individualized patient care. Healthcare decisions must be made by qualified professionals in the context of each patient&apos;s specific circumstances.
            </p>
          </motion.div>

          {/* ═══ INTELLECTUAL PROPERTY ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                <Lock size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Intellectual Property</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              All content, design, algorithms, scoring methodologies, and software comprising PharmaInsight are the intellectual property of Dr. Mahmoud Mostafa and are protected by applicable copyright and intellectual property laws. Scientific data retrieved from external databases remains the property of their respective owners and is used in accordance with their terms of service. Users may not reproduce, distribute, modify, or create derivative works from the platform&apos;s proprietary components without explicit written permission.
            </p>
          </motion.div>

          {/* ═══ LIMITATION OF LIABILITY ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white">
                <Scale size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Limitation of Liability</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              To the fullest extent permitted by applicable law, PharmaInsight, its developers, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from or related to the use of or inability to use the platform, including but not limited to damages for loss of data, professional opportunities, or health outcomes. The platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied.
            </p>
          </motion.div>

          {/* ═══ MODIFICATIONS TO TERMS ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white">
                <BookOpen size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Modifications to Terms</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              We reserve the right to modify these Terms of Use at any time. Changes will be posted on this page with an updated revision date. Continued use of the Platform following any modifications constitutes your acceptance of the revised terms. We encourage users to review these terms periodically for any changes.
            </p>
          </motion.div>

          {/* ═══ GOVERNING LAW ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white">
                <Globe size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Governing Law</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              These Terms of Use shall be governed by and construed in accordance with the laws of the jurisdiction in which the platform operator is based, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved through appropriate legal channels in the applicable jurisdiction.
            </p>
          </motion.div>

          {/* ═══ CONTACT INFORMATION ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                <Mail size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Contact Information</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-3">
              For questions or concerns regarding these Terms of Use, please contact us at:
            </p>
            <a
              href="mailto:contact@phytoprecisionsystem.com"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            >
              <Mail size={12} className="text-gray-400" />
              contact@phytoprecisionsystem.com
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
