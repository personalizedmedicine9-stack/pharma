'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Cookie, Server, ExternalLink, AlertTriangle, Mail } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

// ═══════════════════════════════════════════════════════════════════════════
// PRIVACY POLICY PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function PrivacyPage() {
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
                <Shield size={12} /> PRIVACY POLICY
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-3 tracking-tight leading-tight">
                Privacy Policy
              </h1>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                Last updated: January 2026
              </p>
            </div>
          </motion.div>

          {/* ═══ OVERVIEW ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white">
                <Eye size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Overview</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              PharmaInsight (&quot;the Platform,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting any personal information you may provide while using our scientific evidence platform. This Privacy Policy outlines how we collect, use, and safeguard information when you visit or interact with PharmaInsight.
            </p>
          </motion.div>

          {/* ═══ INFORMATION WE MAY COLLECT ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <Server size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Information We May Collect</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-1">Usage Data</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  When you access PharmaInsight, we may automatically collect certain information about your visit, including your IP address, browser type, operating system, referring URLs, and pages viewed. This data is collected for analytics and platform improvement purposes only.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-1">Search Queries</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Search queries entered into the platform are processed in real time to retrieve scientific evidence. We do not permanently store individual search queries in association with personal identifiers.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-1">Account Information</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  If you create an account, we collect your email address and any other information you voluntarily provide during registration. This information is used solely for account management and platform functionality.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ═══ USE OF INFORMATION ═══ */}
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
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Use of Information</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-3">
              Information collected through PharmaInsight may be used for the following purposes:
            </p>
            <ul className="space-y-2">
              {[
                'Providing and improving platform services and functionality',
                'Generating scientific reports and evidence assessments',
                'Analyzing platform usage patterns for performance optimization',
                'Communicating account-related information or service updates',
                'Ensuring platform security and preventing unauthorized access',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 bg-amber-400" />
                  <span className="text-xs text-gray-600 leading-relaxed font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ═══ COOKIES AND ANALYTICS ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                <Cookie size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Cookies and Analytics</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              PharmaInsight may use cookies and similar tracking technologies to enhance user experience and analyze platform usage. These technologies help us understand how visitors interact with the platform, identify performance issues, and improve content delivery. You may configure your browser to reject cookies, though some platform features may be affected.
            </p>
          </motion.div>

          {/* ═══ DATA SECURITY ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                <Lock size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Data Security</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              We implement reasonable technical and organizational measures to protect information collected through PharmaInsight. However, no method of electronic transmission or storage is entirely secure, and we cannot guarantee absolute security. We encourage users to take appropriate precautions when sharing information online.
            </p>
          </motion.div>

          {/* ═══ THIRD-PARTY SERVICES ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white">
                <ExternalLink size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Third-Party Services</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              PharmaInsight integrates data from publicly available scientific databases and APIs, including PubMed, CrossRef, OpenAlex, OpenFDA, PubChem, ChEBI, and NPAtlas. These third-party services have their own privacy policies, and we are not responsible for their data practices. We do not share personal user information with these services beyond what is necessary to retrieve scientific data.
            </p>
          </motion.div>

          {/* ═══ CHANGES TO THIS POLICY ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Changes to This Policy</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised &quot;Last updated&quot; date. Continued use of PharmaInsight following any changes constitutes your acceptance of the updated policy.
            </p>
          </motion.div>

          {/* ═══ CONTACT ═══ */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-white">
                <Mail size={16} />
              </div>
              <h2 className="text-lg font-black text-[#0f172a] tracking-tight">Contact</h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              If you have questions or concerns about this Privacy Policy or your data, please contact us at:
            </p>
            <a
              href="mailto:contact@phytoprecisionsystem.com"
              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
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
