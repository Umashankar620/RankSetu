'use client';
// =============================================================================
// components/CollegeDetailPageClient.jsx — NEW, ADDITIVE ONLY
// =============================================================================
// Thin client wrapper so the actual Next.js route file (app/college/[slug]/page.jsx)
// can stay a server component (required for generateMetadata / generateStaticParams),
// while still getting darkMode from the existing AppContext AND the site's
// Header + Footer, same as every other view rendered through ClientWrapper.
// Mirrors the CollegeInfoPageClient.jsx pattern exactly.
// =============================================================================
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CollegeDetailPage from '@/components/CollegeDetailPage';

// Same slug -> path map ClientWrapper.jsx uses for its top-level views,
// duplicated here (read-only, tiny) so this file doesn't need to import
// anything from ClientWrapper itself.
const VIEW_TO_PATH = {
  home: '/',
  mcc: '/mcc-cutoffs',
  ayush: '/ayush-cutoffs',
  state: '/state-cutoffs',
  'college-info': '/college-info',
};

export default function CollegeDetailPageClient({ data }) {
  const router = useRouter();
  const { darkMode, setDarkMode, showToast } = useApp();

  // Header/Footer expect a `setCurrentView(view)` callback (they don't know
  // this page lives outside the ClientWrapper SPA switcher) — so give them
  // one that just pushes the matching route.
  const navigate = (view) => {
    router.push(VIEW_TO_PATH[view] || `/${view}`);
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        darkMode ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Header
        currentView="college-info"
        setCurrentView={navigate}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        showToast={showToast}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CollegeDetailPage data={data} darkMode={darkMode} />
        </div>
      </main>

      <Footer darkMode={darkMode} showToast={showToast} setCurrentView={navigate} />
    </div>
  );
}
