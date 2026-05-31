'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import StructureEngine from '@/components/pharma/StructureEngine';
import AuthModal from '@/components/pharma/AuthModal';
import ConsentPopup from '@/components/pharma/ConsentPopup';
import ScientificDisclaimer from '@/components/pharma/ScientificDisclaimer';
import type { StructureResponse } from '@/lib/types';

export default function StructurePage() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const stored = localStorage.getItem('pharmainsight-consent');
      if (stored === 'true') {
        queueMicrotask(() => setConsentGiven(true));
      }
    }
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem('pharmainsight-consent', 'true');
    setConsentGiven(true);
  };

  const handleStructureSearch = async (query: string): Promise<StructureResponse | null> => {
    try {
      const res = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!consentGiven && <ConsentPopup onAccept={handleAcceptConsent} />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased flex flex-col">
        <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
          <StructureEngine onSearch={handleStructureSearch} onSignInRequired={() => setAuthModalOpen(true)} />
        </main>

        <ScientificDisclaimer />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
