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
import PageHeader from '@/components/PageHeader';
import { Leaf } from 'lucide-react';
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
  years: [], rounds: [], categories: [], quotas: [],
  programs: [], institutes: [], genders: [], types: [],
  counselingTypes: [], quotaInstituteMap: {},
};

const COUNSELING_TABS = [
  { key: '',      label: 'All Types', icon: null,    colorActive: '#1A3C6E' },
  { key: 'MCC',   label: 'MCC',       icon: MccIcon, colorActive: '#2563EB' },
  { key: 'Ayush', label: 'Ayush',     icon: LeafIcon,colorActive: '#16A34A' },
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

  const [activeCounselingType, setActiveCounselingType] = useState('');
  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [formState, setFormState]           = useState(INITIAL_FORM);
  const [userRank, setUserRank]             = useState('');
  const [cutoffShift, setCutoffShift]       = useState(0);
  const [results, setResults]               = useState([]);
  const [totalItems, setTotalItems]         = useState(0);
  const [totalPages, setTotalPages]         = useState(0);
  const [currentPage, setCurrentPage]       = useState(1);
  const [searchLoading, setSearchLoading]   = useState(false);
  const [searchError, setSearchError]       = useState('');
  const [hasSearched, setHasSearched]       = useState(false);
  const [isTrendOpen, setIsTrendOpen]       = useState(false);
  const [selectedTrendCollege, setSelectedTrendCollege] = useState('');

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

  useEffect(() => {
    setResults([]);
    setTotalItems(0);
    setTotalPages(0);
    setCurrentPage(1);
    setHasSearched(false);
    setSearchError('');
  }, [activeCounselingType]);

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

  return (
    <div>
      {/* Professional Page Header */}
      <PageHeader
        icon={Leaf}
        eyebrow="AYUSH Counselling"
        title="Opening & Closing"
        accent="Ranks"
        description="Explore BAMS, BHMS, BUMS, and BSMS opening and closing ranks from MCC and Ayush counselling rounds. Filter by program, category, quota, and counselling type to find cutoffs relevant to your profile."
        darkMode={dm}
        onBack={() => setCurrentView('home')}
        badge={{ text: 'AYUSH Data', tone: 'success' }}
      />

      {/* Counseling Type Tabs */}
      <div className={`mb-5 p-4 rounded-xl border ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className={`text-xs font-black uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Counselling Type
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {COUNSELING_TABS.map((tab) => {
              const isActive = activeCounselingType === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCounselingType(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-bold transition-all duration-150 cursor-pointer
                    ${isActive
                      ? dm ? 'text-white border-transparent' : 'text-white border-transparent'
                      : dm ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500' : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                    }`}
                  style={isActive ? { backgroundColor: tab.colorActive } : {}}
                >
                  {tab.icon && <tab.icon />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active indicator */}
          {activeCounselingType && (
            <div
              className="ml-auto flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: activeCounselingType === 'MCC'
                  ? (dm ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.08)')
                  : (dm ? 'rgba(22,163,74,0.12)' : 'rgba(22,163,74,0.08)'),
                color: activeCounselingType === 'MCC'
                  ? (dm ? '#60A5FA' : '#1D4ED8')
                  : (dm ? '#4ADE80' : '#15803D'),
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: activeCounselingType === 'MCC' ? '#2563EB' : '#16A34A',
                }}
              />
              Showing {activeCounselingType === 'MCC' ? 'MCC counselling' : 'Ayush counselling'} data only
            </div>
          )}
        </div>
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

      {/* Trend Modal */}
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