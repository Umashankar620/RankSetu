'use client';

// =============================================================================
// components/AyushPage.jsx
// =============================================================================
// AYUSH Opening & Closing Ranks page.
// Reuses the existing FilterBar and CutoffTable components exactly as-is.
// Adds a "Counseling Type" sub-tab (MCC / Ayush) at the top.
// Data comes from the `ayush_cutoffs` MySQL table via /api/ayush/* endpoints.
// =============================================================================

import React, { useState, useCallback, useEffect } from 'react';
import FilterBar from '@/components/FilterBar';
import CutoffTable from '@/components/CutoffTable';
import TrendModal from '@/components/Graphd';
import CutoffInfoBanner from '@/components/CutoffInfoBanner';
import { fetchAyushCutoffs, fetchAyushFilters } from '@/utils/api';

// ── Icons ────────────────────────────────────────────────────────────────────
const LeafIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const MccIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// ── Constants ────────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  year: '', round: '', category: '', quota: '',
  program: '', institute: '', gender: '', type: '',
};

const EMPTY_FILTERS = {
  years:             [],
  rounds:            [],
  categories:        [],
  quotas:            [],
  programs:          [],
  institutes:        [],
  genders:           [],
  types:             [],
  counselingTypes:   [],
  quotaInstituteMap: {},
};

// Counseling type tab config
const COUNSELING_TABS = [
  { key: '',      label: 'All Types', icon: null,    color: 'slate' },
  { key: 'MCC',   label: 'MCC',       icon: MccIcon, color: 'blue'  },
  { key: 'Ayush', label: 'Ayush',     icon: LeafIcon,color: 'green' },
];

// ── Stats Overview ───────────────────────────────────────────────────────────
function StatsOverview({ metrics, darkMode: dm }) {
  if (!metrics) return null;
  return (
    <div className="grid grid-cols-3 gap-3 my-4">
      {[
        { label: 'Highest Closing',  value: metrics.highestClosing },
        { label: 'Most Competitive', value: metrics.mostCompetitive },
        { label: 'Total Results',    value: metrics.totalOptions?.toLocaleString('en-IN') || '0' },
      ].map(({ label, value }) => (
        <div key={label} className={`p-3 rounded-xl border text-center ${dm ? 'bg-slate-800/60 border-slate-700/60' : 'bg-white border-slate-200'}`}>
          <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
          <div className={`text-sm font-black truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AyushPage({ darkMode = false, showToast, setCurrentView }) {
  const dm = darkMode;

  // ── Counseling type sub-tab ──────────────────────────────────────────────
  const [activeCounselingType, setActiveCounselingType] = useState('');

  // ── Filters ──────────────────────────────────────────────────────────────
  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // ── Form / search state ──────────────────────────────────────────────────
  const [formState, setFormState]         = useState(INITIAL_FORM);
  const [userRank, setUserRank]           = useState('');
  const [cutoffShift, setCutoffShift]     = useState(0);
  const [results, setResults]             = useState([]);
  const [totalItems, setTotalItems]       = useState(0);
  const [totalPages, setTotalPages]       = useState(0);
  const [currentPage, setCurrentPage]     = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError]     = useState('');
  const [hasSearched, setHasSearched]     = useState(false);

  // ── Trend modal ──────────────────────────────────────────────────────────
  const [isTrendOpen, setIsTrendOpen]                   = useState(false);
  const [selectedTrendCollege, setSelectedTrendCollege] = useState('');

  // ── Load Ayush filters on mount ──────────────────────────────────────────
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetchAyushFilters();
        if (response?.data?.success) setFilters(response.data.filters);
      } catch (e) {
        console.error('Ayush filter fetch error:', e);
      } finally {
        setFiltersLoading(false);
      }
    };
    loadFilters();
  }, []);

  // ── Reset results when counseling type tab changes ───────────────────────
  useEffect(() => {
    setResults([]);
    setTotalItems(0);
    setTotalPages(0);
    setCurrentPage(1);
    setHasSearched(false);
    setSearchError('');
  }, [activeCounselingType]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFormChange = (field, value) =>
    setFormState((prev) => ({ ...prev, [field]: value }));

  const handleSearch = useCallback(async (page = 1) => {
    setSearchError('');
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const payload = {
        year:           formState.year      || undefined,
        round:          formState.round     || undefined,
        category:       formState.category  || undefined,
        quota:          formState.quota     || undefined,
        program:        formState.program   || undefined,
        institute:      formState.institute || undefined,
        counselingType: activeCounselingType || undefined,
        page,
      };
      const response = await fetchAyushCutoffs(payload);
      if (response?.data?.success) {
        const factor = 1 - (cutoffShift / 100);
        const data   = (response.data.data || []).map((item) => ({
          ...item,
          openRank:  item.openRank  ? Math.round(Number(item.openRank)  * factor) : 0,
          closeRank: item.closeRank ? Math.round(Number(item.closeRank) * factor) : 0,
        }));
        setResults(data);
        setTotalItems(response.data.totalItems || 0);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.currentPage || 1);
      } else {
        setSearchError(response?.data?.message || 'Search failed.');
        setResults([]);
      }
    } catch (e) {
      setSearchError(e.message || 'Server error. Please try again.');
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [formState, cutoffShift, activeCounselingType]);

  const handleReset = () => {
    setFormState(INITIAL_FORM);
    setResults([]);
    setTotalItems(0);
    setTotalPages(0);
    setCurrentPage(1);
    setHasSearched(false);
    setSearchError('');
    setUserRank('');
    setCutoffShift(0);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    if (typeof window !== 'undefined') window.scrollTo({ top: 400, behavior: 'smooth' });
    handleSearch(page);
  };

  const openTrendModal = useCallback((instituteName) => {
    setSelectedTrendCollege(instituteName);
    setIsTrendOpen(true);
  }, []);

  const dashboardMetrics = {
    highestClosing:
      results.length > 0
        ? Math.max(...results.map((r) => r.closeRank || 0)).toLocaleString('en-IN')
        : 'N/A',
    mostCompetitive:
      results.length > 0
        ? results.reduce((a, b) =>
            (a.openRank || 999999) < (b.openRank || 999999) ? a : b
          ).institute?.split('(')[0] || 'N/A'
        : 'N/A',
    totalOptions: totalItems,
  };

  // ── Tab styling helpers ──────────────────────────────────────────────────
  const getTabCls = (tab) => {
    const isActive = activeCounselingType === tab.key;
    if (tab.key === 'MCC') {
      return isActive
        ? dm
          ? 'bg-blue-600/20 text-blue-400 border-blue-500/50'
          : 'bg-blue-600 text-white border-blue-600'
        : dm
          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-600/50 hover:text-blue-400'
          : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600';
    }
    if (tab.key === 'Ayush') {
      return isActive
        ? dm
          ? 'bg-green-600/20 text-green-400 border-green-500/50'
          : 'bg-green-600 text-white border-green-600'
        : dm
          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-green-600/50 hover:text-green-400'
          : 'bg-white text-slate-600 border-slate-300 hover:border-green-400 hover:text-green-600';
    }
    // All Types
    return isActive
      ? dm
        ? 'bg-primary/20 text-primary border-primary/50'
        : 'bg-primary text-white border-primary'
      : dm
        ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-primary/50 hover:text-primary'
        : 'bg-white text-slate-600 border-slate-300 hover:border-primary/40 hover:text-primary';
  };

  return (
    <div>
      {/* Back link */}
      <button
        onClick={() => setCurrentView('home')}
        className="mb-4 text-xs font-bold uppercase text-indigo-500 hover:underline cursor-pointer flex items-center gap-1"
      >
        ← Back to Dashboard
      </button>

      {/* Page header */}
      <div className={`mb-5 p-4 rounded-xl border ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${dm ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
              <LeafIcon />
            </div>
            <div>
              <h1 className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
                AYUSH Opening &amp; Closing Ranks
              </h1>
              <p className={`text-xs font-medium mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                MCC &amp; Ayush counselling cutoff data from the Ayush database
              </p>
            </div>
          </div>

          {/* Counseling Type Tabs */}
          <div className="flex items-center gap-2">
            {COUNSELING_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCounselingType(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-bold transition-all duration-150 ${getTabCls(tab)}`}
              >
                {tab.icon && <tab.icon />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active type indicator */}
        {activeCounselingType && (
          <div className={`mt-3 flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg w-fit
            ${activeCounselingType === 'MCC'
              ? dm ? 'bg-blue-600/10 text-blue-400' : 'bg-blue-50 text-blue-700'
              : dm ? 'bg-green-600/10 text-green-400' : 'bg-green-50 text-green-700'
            }`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activeCounselingType === 'MCC' ? 'bg-blue-400' : 'bg-green-400'}`} />
            Showing {activeCounselingType === 'MCC' ? 'MCC counselling' : 'Ayush counselling'} data only
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        formState={formState}
        onChange={handleFormChange}
        onSearch={() => handleSearch(1)}
        onReset={handleReset}
        loading={searchLoading}
        userRank={userRank}
        setUserRank={setUserRank}
        cutoffShift={cutoffShift}
        setCutoffShift={setCutoffShift}
        darkMode={dm}
      />

      {/* Stats */}
      <StatsOverview metrics={dashboardMetrics} darkMode={dm} />

      {/* Error */}
      {searchError && (
        <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
          {searchError}
        </div>
      )}

      {/* Results Table */}
      <CutoffTable
        data={results}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        loading={searchLoading}
        hasSearched={hasSearched}
        userRank={userRank}
        cutoffShift={cutoffShift}
        darkMode={dm}
        onOpenTrendModal={openTrendModal}
        selectedColleges={[]}
        setSelectedColleges={() => {}}
        setCurrentView={setCurrentView}
      />

      {/* Info Banner */}
      <CutoffInfoBanner
        darkMode={dm}
        onLearnMore={() => setCurrentView('counselling')}
      />

      {/* Trend Modal — source="ayush" → hits /api/ayush/trends endpoint */}
      <TrendModal
        isOpen={isTrendOpen}
        onClose={() => setIsTrendOpen(false)}
        instituteName={selectedTrendCollege}
        darkMode={dm}
        source="ayush"
      />
    </div>
  );
}