'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-14 text-center">
        <p className="text-xs text-gray-500 font-medium tracking-wide">
          © 2026 PharmaInsight. All content and platform design rights reserved. Data sources: NCBI, CrossRef, OpenAlex, OpenFDA. Research and educational use only.
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link
            href="/privacy"
            className="text-[17px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Privacy Policy
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/terms"
            className="text-[17px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Terms of Use
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/disclaimer"
            className="text-[17px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Disclaimer
          </Link>
        </div>
        <p className="text-[13px] text-gray-400 mt-2 italic font-medium">
          Designed and Developed by Dr. Mahmoud Mostafa
        </p>
      </div>
    </footer>
  );
}
