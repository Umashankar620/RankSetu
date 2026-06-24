'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import Footer from '@/components/Footer';
import ComingSoon from '@/components/ComingSoon';
import AiimsHub from '@/components/AiimsHub';
import ChoiceLab from '@/components/ChoiceLab';
import CounsellingGuidePage from '@/components/CounsellingGuidePage';
import FilterBar from '@/components/FilterBar';
import CutoffTable from '@/components/CutoffTable';
import UpgradeProbability from '@/components/UpgradeProbability';
import TrendModal from '@/components/Graphd';
import CutoffInfoBanner from '@/components/CutoffInfoBanner';
import AyushPage from '@/components/AyushPage';
import PageHeader from '@/components/PageHeader';
import ChoiceOptimizer from '@/components/ChoiceOptimizer';
import CounsellingTimeline from '@/components/CounsellingTimeline';
import ChoiceSandbox from '@/components/ChoiceSandbox';
import ShareCard from '@/components/ShareCard';
import Home from '@/components/Home';
import AboutUsFull from '@/components/AboutUs';
import {
  BarChart2, BookOpen, TrendingUp, GraduationCap,
  Layers, Calendar, FlaskConical, Target, Leaf,
} from 'lucide-react';

import { fetchCutoffs, fetchFilters } from '@/utils/api';

// ── Route <-> View mapping ─────────────────────────────────────────────────
const SLUG_TO_VIEW = {
  '':                'home',
  'analytics':       'analytics',
  'state-analytics': 'state-analytics',
  'optimizer':       'optimizer',
  'aiims-hub':       'aiims-hub',
  'counselling':     'counselling',
  'about-us':        'about-us',
  'upgrade':         'upgrade',
  'choice-lab':      'lab',
  'sandbox':         'sandbox',
  'college-db':      'college-db',
  'predictor':       'predictor',
  'timeline':        'timeline',
  'share-card':      'share-card',
  'ayush':           'ayush',
};

const VIEW_TO_PATH = {
  'home':            '/',
  'analytics':       '/analytics',
  'state-analytics': '/state-analytics',
  'optimizer':       '/optimizer',
  'aiims-hub':       '/aiims-hub',
  'counselling':     '/counselling',
  'about-us':        '/about-us',
  'upgrade':         '/upgrade',
  'lab':             '/choice-lab',
  'sandbox':         '/sandbox',
  'college-db':      '/college-db',
  'predictor':       '/predictor',
  'timeline':        '/timeline',
  'share-card':      '/share-card',
  'ayush':           '/ayush',
};

const INITIAL_FORM = {
  year: '', round: '', category: '', quota: '',
  program: '', institute: '', gender: '', type: '',
};

const EMPTY_FILTERS = {
  years: [], rounds: [], categories: [], quotas: [],
  programs: [], institutes: [], genders: [], types: [],
  quotaInstituteMap: {},
};

// ── Stats Overview ─────────────────────────────────────────────────────────
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

// ── Main ClientWrapper ─────────────────────────────────────────────────────
export default function ClientWrapper({ initialView }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { darkMode, setDarkMode, showToast } = useApp();

  const getViewFromPath = useCallback((path) => {
    const slug = path === '/' ? '' : path.replace(/^\//, '');
    return SLUG_TO_VIEW[slug] || slug;
  }, []);

  const [currentView, setCurrentViewState] = useState(
    initialView || getViewFromPath(pathname)
  );

  const navigate = useCallback((view) => {
    const path = VIEW_TO_PATH[view] || `/${view}`;
    router.push(path);
    setCurrentViewState(view);
  }, [router]);

  useEffect(() => {
    const derived = getViewFromPath(pathname);
    setCurrentViewState(derived);
  }, [pathname, getViewFromPath]);

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, [currentView]);

  const [shareCardData, setShareCardData]       = useState(null);
  const [filters, setFilters]                   = useState(EMPTY_FILTERS);
  const [filtersLoading, setFiltersLoading]     = useState(true);
  const [formState, setFormState]               = useState(INITIAL_FORM);
  const [userRank, setUserRank]                 = useState('');
  const [cutoffShift, setCutoffShift]           = useState(0);
  const [results, setResults]                   = useState([]);
  const [totalItems, setTotalItems]             = useState(0);
  const [totalPages, setTotalPages]             = useState(0);
  const [currentPage, setCurrentPage]           = useState(1);
  const [searchLoading, setSearchLoading]       = useState(false);
  const [searchError, setSearchError]           = useState('');
  const [hasSearched, setHasSearched]           = useState(false);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [isTrendOpen, setIsTrendOpen]           = useState(false);
  const [selectedTrendCollege, setSelectedTrendCollege] = useState('');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const response = await fetchFilters();
        if (response?.data?.success) setFilters(response.data.filters);
      } catch (e) {
        console.error('Filter fetch error:', e);
      } finally {
        setFiltersLoading(false);
      }
    };
    loadFilters();
  }, []);

  const openTrendModal = useCallback((instituteName) => {
    setSelectedTrendCollege(instituteName);
    setIsTrendOpen(true);
  }, []);

  const handleShareCard = (data) => {
    try { sessionStorage.setItem('ranksetu_share_data', JSON.stringify(data)); } catch (_) {}
    setShareCardData(data);
    navigate('share-card');
  };

  const handleSearch = useCallback(async (page = 1) => {
    setSearchError('');
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const payload = {
        year:      formState.year      || undefined,
        round:     formState.round     || undefined,
        category:  formState.category  || undefined,
        quota:     formState.quota     || undefined,
        program:   formState.program   || undefined,
        institute: formState.institute || undefined,
        gender:    formState.gender    || undefined,
        type:      formState.type      || undefined,
        page,
      };
      const response = await fetchCutoffs(payload);
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
  }, [formState, cutoffShift]);

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

  const handleFormChange = (field, value) =>
    setFormState((prev) => ({ ...prev, [field]: value }));

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    if (typeof window !== 'undefined') window.scrollTo({ top: 400, behavior: 'smooth' });
    handleSearch(page);
  };

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

  const dm = darkMode;

  // Pages that do NOT show the hero slider
  const noSliderViews = ['share-card', 'analytics', 'state-analytics', 'optimizer',
    'aiims-hub', 'counselling', 'about-us', 'upgrade', 'lab', 'sandbox',
    'college-db', 'predictor', 'timeline', 'ayush'];

  const renderPage = () => {
    switch (currentView) {
      // ── Home ──────────────────────────────────────────────────────────────
      case 'home':
        return (
          <Home
            setCurrentView={navigate}
            showToast={showToast}
            darkMode={dm}
          />
        );

      // ── About Us ──────────────────────────────────────────────────────────
      case 'about-us':
        return <AboutUsFull darkMode={dm} />;

      // ── Choice Optimizer ──────────────────────────────────────────────────
      case 'optimizer':
        return (
          <>
            <PageHeader
              icon={Target}
              eyebrow="AI-Powered"
              title="Choice"
              accent="Optimizer"
              description="Enter your NEET rank and preferences — our algorithm analyses historical MCC cutoffs to recommend the optimal college ordering for your choice filling, maximising your allotment probability."
              darkMode={dm}
              onBack={() => navigate('home')}
              badge={{ text: 'AI Active', tone: 'live' }}
            />
            <ChoiceOptimizer
              darkMode={dm}
              showToast={showToast}
              onShareCard={handleShareCard}
            />
          </>
        );

      // ── College DB ────────────────────────────────────────────────────────
      case 'college-db':
        return (
          <ComingSoon
            darkMode={dm}
            featureName="College Database"
            onBack={() => navigate('home')}
          />
        );

      // ── Rank Predictor ────────────────────────────────────────────────────
      case 'predictor':
        return (
          <ComingSoon
            darkMode={dm}
            featureName="Rank Predictor"
            onBack={() => navigate('home')}
          />
        );

      // ── Counselling Timeline ──────────────────────────────────────────────
      case 'timeline':
        return (
          <>
            <PageHeader
              icon={Calendar}
              eyebrow="MCC 2025"
              title="Counselling"
              accent="Timeline"
              description="Track every important date — registration windows, choice filling periods, seat allotment results, and reporting deadlines — for all MCC NEET UG counselling rounds."
              darkMode={dm}
              onBack={() => navigate('home')}
              badge={{ text: 'Live Schedule', tone: 'live' }}
            />
            <CounsellingTimeline darkMode={dm} />
          </>
        );

      // ── Sandbox ───────────────────────────────────────────────────────────
      case 'sandbox':
        return (
          <>
            <PageHeader
              icon={FlaskConical}
              eyebrow="Practice Tool"
              title="Choice Filling"
              accent="Sandbox"
              description="Simulate your NEET counselling choice list in a risk-free environment. Add colleges, reorder preferences, and detect sequence conflicts before the real choice filling window opens."
              darkMode={dm}
              onBack={() => navigate('home')}
            />
            <ChoiceSandbox darkMode={dm} />
          </>
        );

      // ── AIIMS Hub ─────────────────────────────────────────────────────────
      case 'aiims-hub':
        return (
          <>
            <PageHeader
              icon={GraduationCap}
              eyebrow="Specialised Data"
              title="AIIMS"
              accent="Hub"
              description="Dedicated section for all AIIMS campus cutoffs — opening and closing ranks for every AIIMS across India, filtered by round, category, and program."
              darkMode={dm}
              onBack={() => navigate('home')}
              badge={{ text: 'AIIMS Only', tone: 'new' }}
            />
            <AiimsHub darkMode={dm} />
          </>
        );

      // ── Counselling Guide ─────────────────────────────────────────────────
      case 'counselling':
        return (
          <>
            <PageHeader
              icon={BookOpen}
              eyebrow="Complete Guide"
              title="MCC Counselling"
              accent="Guide"
              description="Everything you need to know about NEET UG counselling — quota codes explained, category benefits, round-by-round strategy, choice filling tips, and what happens during seat allotment."
              darkMode={dm}
              onBack={() => navigate('home')}
            />
            <CounsellingGuidePage darkMode={dm} setCurrentView={navigate} />
          </>
        );

      // ── Share Card ────────────────────────────────────────────────────────
      case 'share-card':
        return (
          <ShareCard
            darkMode={dm}
            shareData={shareCardData}
            onBack={() => navigate('optimizer')}
            showToast={showToast}
          />
        );

      // ── Choice Lab ────────────────────────────────────────────────────────
      case 'lab':
        return (
          <>
            <PageHeader
              icon={Layers}
              eyebrow="Choice Filling"
              title="AI Choice"
              accent="Lab"
              description="Organise and audit your final choice list. Drag to reorder, detect sequence conflicts automatically, and export your preference list before submitting on the MCC portal."
              darkMode={dm}
              onBack={() => navigate('analytics')}
              backLabel="Back to Cutoffs"
            />
            <ChoiceLab
              treeList={selectedColleges}
              setTreeList={setSelectedColleges}
              setCurrentView={navigate}
              darkMode={dm}
            />
          </>
        );

      // ── Upgrade Probability ───────────────────────────────────────────────
      case 'upgrade':
        return (
          <>
            <PageHeader
              icon={TrendingUp}
              eyebrow="Round Analysis"
              title="Upgrade"
              accent="Probability"
              description="Analyse the likelihood of getting an upgraded allotment in subsequent MCC counselling rounds. Based on historical seat movement patterns across all NEET UG rounds."
              darkMode={dm}
              onBack={() => navigate('home')}
              badge={{ text: 'Beta', tone: 'new' }}
            />
            <UpgradeProbability darkMode={dm} showToast={showToast} />
          </>
        );

      // ── AYUSH ─────────────────────────────────────────────────────────────
      case 'ayush':
        return (
          <AyushPage
            darkMode={dm}
            showToast={showToast}
            setCurrentView={navigate}
          />
        );

      // ── Analytics (MCC Cutoffs) — default ────────────────────────────────
      default:
        return (
          <div>
            <PageHeader
              icon={BarChart2}
              eyebrow="MCC Official Data"
              title="Opening & Closing"
              accent="Ranks"
              description="Search year-wise, round-wise NEET UG cutoff data for all MCC colleges — AIIMS, JIPMER, government & deemed universities. Filter by category, quota, and gender to find ranks relevant to your profile."
              darkMode={dm}
              variant="explore"
              onBack={() => navigate('home')}
              badge={{ text: '2020–2025 Data', tone: 'success' }}
            />
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
            <StatsOverview metrics={dashboardMetrics} darkMode={dm} />
            {searchError && (
              <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
                {searchError}
              </div>
            )}
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
              selectedColleges={selectedColleges}
              setSelectedColleges={setSelectedColleges}
              setCurrentView={navigate}
            />
            <CutoffInfoBanner
              darkMode={dm}
              onLearnMore={() => navigate('counselling')}
            />
            <TrendModal
              isOpen={isTrendOpen}
              onClose={() => setIsTrendOpen(false)}
              instituteName={selectedTrendCollege}
              allData={results}
              darkMode={dm}
            />
          </div>
        );
    }
  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        dm ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Header
        currentView={currentView}
        setCurrentView={navigate}
        darkMode={dm}
        setDarkMode={setDarkMode}
        showToast={showToast}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero Slider — ONLY on Home page */}
          {currentView === 'home' && (
            <HeroSlider darkMode={dm} setCurrentView={navigate} />
          )}
          {renderPage()}
        </div>
      </main>

      <Footer darkMode={dm} showToast={showToast} setCurrentView={navigate} />
    </div>
  );
}