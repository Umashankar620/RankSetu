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
import CutoffTable from '@/components/CutoffTable';
import UpgradeProbability from '@/components/UpgradeProbability';
import TrendModal from '@/components/Graphd';
import CutoffInfoBanner from '@/components/CutoffInfoBanner';
import PageHeader from '@/components/PageHeader';
import CutoffPage from '@/components/CutoffPage';
import ChoiceOptimizer from '@/components/ChoiceOptimizer';
import CounsellingTimeline from '@/components/CounsellingTimeline';
import ShareCard from '@/components/ShareCard';
import Home from '@/components/Home';
import AboutUsFull from '@/components/AboutUs';
import HowToUsePage from '@/components/HowToUsePage';
import {
  BookOpen, TrendingUp, GraduationCap,
  Layers, Calendar, Target, Compass,
} from 'lucide-react';




// ── Route <-> View mapping ─────────────────────────────────────────────────
const SLUG_TO_VIEW = {
  '':                'home',
  'mcc-cutoffs':     'mcc',
  'ayush-cutoffs':   'ayush',
  'state-cutoffs':   'state',
  'cutoffs':         'mcc',          // legacy link fallback
  'analytics':       'mcc',          // legacy link fallback
  'state-analytics': 'state',        // legacy link fallback
  'optimizer':       'optimizer',
  'aiims-hub':       'aiims-hub',
  'counselling':     'counselling',
  'about-us':        'about-us',
  'upgrade':         'upgrade',
  'choice-lab':      'lab',
  'college-db':      'college-db',
  'predictor':       'predictor',
  'timeline':        'timeline',
  'share-card':      'share-card',
  'how-to-use':      'how-to-use',
};

const VIEW_TO_PATH = {
  'home':        '/',
  'mcc':         '/mcc-cutoffs',
  'ayush':       '/ayush-cutoffs',
  'state':       '/state-cutoffs',
  'optimizer':   '/optimizer',
  'aiims-hub':   '/aiims-hub',
  'counselling': '/counselling',
  'about-us':    '/about-us',
  'upgrade':     '/upgrade',
  'lab':         '/choice-lab',
  'college-db':  '/college-db',
  'predictor':   '/predictor',
  'timeline':    '/timeline',
  'share-card':  '/share-card',
  'how-to-use':  '/how-to-use',
};




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

  // selectedColleges must survive navigation from a cutoff page (e.g.
  // /mcc-cutoffs) to /choice-lab — these are separate Next.js routes, so
  // router.push() mounts a fresh ClientWrapper and a plain useState([])
  // would reset back to empty right as the list arrives. sessionStorage
  // bridges that gap (same pattern already used for shareCardData below).
  // The write happens synchronously inside the setter — not in a useEffect
  // — so it's guaranteed to land before router.push() swaps the page.
  const SELECTED_COLLEGES_KEY = 'ranksetu_choice_lab_list';
  // IMPORTANT: always start from [] on BOTH server and client. Reading
  // sessionStorage inside the useState initializer caused a hydration
  // mismatch — server always renders [] (no window), but if sessionStorage
  // already had items from a previous navigation, the client's FIRST render
  // would already show N items. React compares those two trees on hydrate
  // and throws "Text content does not match server-rendered HTML" (this is
  // what surfaced inside ChoiceLab's PrefList — its item count/props simply
  // differed between server and client passes).
  // Fix: keep the initial render identical everywhere ([]), then hydrate
  // the real value from sessionStorage in a useEffect — which only ever
  // runs on the client, AFTER hydration has already completed.
  const [selectedColleges, setSelectedCollegesState] = useState([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SELECTED_COLLEGES_KEY);
      if (raw) setSelectedCollegesState(JSON.parse(raw));
    } catch (_) { /* ignore corrupt storage */ }
  }, []);

  const setSelectedColleges = useCallback((updater) => {
    setSelectedCollegesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { sessionStorage.setItem(SELECTED_COLLEGES_KEY, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  }, []);

  const openTrendModal = useCallback(() => {}, []); // kept for ChoiceLab compat

  const handleShareCard = (data) => {
    try { sessionStorage.setItem('ranksetu_share_data', JSON.stringify(data)); } catch (_) {}
    setShareCardData(data);
    navigate('share-card');
  };

  const dm = darkMode;

  // Pages that do NOT show the hero slider
  const noSliderViews = ['share-card', 'mcc', 'ayush', 'state', 'optimizer',
    'aiims-hub', 'counselling', 'about-us', 'upgrade', 'lab',
    'college-db', 'predictor', 'timeline', 'how-to-use'];

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

      // ── How to Use RankSetu ──────────────────────────────────────────────
      case 'how-to-use':
        return (
          <>
            <PageHeader
              icon={Compass}
              eyebrow="Start Here"
              title="How to Use"
              accent="RankSetu"
              description="A complete, beginner-friendly walkthrough of every tool on the platform — what it does, who it's for, and exactly how to use it."
              darkMode={dm}
              onBack={() => navigate('home')}
              badge={{ text: 'Guide', tone: 'new' }}
            />
            <HowToUsePage darkMode={dm} setCurrentView={navigate} />
          </>
        );

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
              onBack={() => navigate('mcc')}
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

      // ── Cutoff Explorer — MCC ────────────────────────────────────────────
      case 'mcc':
        return (
          <CutoffPage
            darkMode={dm}
            showToast={showToast}
            setCurrentView={navigate}
            initialType="MCC"
            pageTitle="MCC Cutoff Explorer"
            treeList={selectedColleges}
            setTreeList={setSelectedColleges}
          />
        );

      // ── Cutoff Explorer — Ayush ───────────────────────────────────────────
      case 'ayush':
        return (
          <CutoffPage
            darkMode={dm}
            showToast={showToast}
            setCurrentView={navigate}
            initialType="AYUSH"
            pageTitle="Ayush Cutoff Explorer"
            treeList={selectedColleges}
            setTreeList={setSelectedColleges}
          />
        );

      // ── Cutoff Explorer — State Quota ─────────────────────────────────────
      case 'state':
        return (
          <CutoffPage
            darkMode={dm}
            showToast={showToast}
            setCurrentView={navigate}
            initialType="STATE"
            pageTitle="State Quota Cutoff Explorer"
            treeList={selectedColleges}
            setTreeList={setSelectedColleges}
          />
        );

      // ── Default fallback ──────────────────────────────────────────────────
      default:
        return (
          <CutoffPage
            darkMode={dm}
            showToast={showToast}
            setCurrentView={navigate}
            treeList={selectedColleges}
            setTreeList={setSelectedColleges}
          />
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