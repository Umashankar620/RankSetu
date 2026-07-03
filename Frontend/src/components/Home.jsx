'use client';

import React, { useState } from 'react';
import {
  BarChart2, Target, TrendingUp, BookOpen,
  Layers, Calendar, GraduationCap, Leaf,
  ArrowRight, ShieldCheck, Database, Clock, MapPin,
  CheckCircle, Star, Users, FileText, Zap, Info,
  Building2, Search, Compass, Mail, Quote, ChevronDown,
  HelpCircle, Layers3,
} from 'lucide-react';

const PRIMARY     = '#1A3C6E';
const INTERACTIVE = '#2563EB';

// ── Feature cards config ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Building2,
    title: 'College Directory',
    desc: 'Browse every NEET UG medical college with its own dedicated page — cutoffs, fee structure, seat matrix, and admission details, all in one place.',
    howTo: 'Filter by state or college type, or search by name. Click any college to see its full cutoff history, fees, and seat breakdown.',
    view: 'college-info',
    badge: 'New',
    badgeColor: '#2563EB',
    color: '#2563EB',
    category: 'Colleges',
  },
  {
    icon: BarChart2,
    title: 'MCC Cutoff Explorer',
    desc: 'Year-wise, round-wise opening & closing ranks for every MCC college — AIQ, AIIMS, JIPMER, and Deemed universities.',
    howTo: 'Select year, round, and category. Filter by college or branch to see exact rank ranges.',
    view: 'mcc',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Cutoff Data',
  },
  {
    icon: Leaf,
    title: 'Ayush Cutoff Explorer',
    desc: 'Opening & closing ranks for BAMS, BHMS, BUMS and BSMS programs under AACC and State Ayush counselling.',
    howTo: 'Choose AYUSH course type and filter by state or college to compare rank trends across years.',
    view: 'ayush',
    badge: 'New',
    badgeColor: '#16A34A',
    color: '#16A34A',
    category: 'Cutoff Data',
  },
  {
    icon: Target,
    title: 'Choice Optimizer',
    desc: 'AI-powered tool that analyses your rank and recommends the optimal college ordering for your NEET UG choice filling.',
    howTo: 'Enter your rank and category. The optimizer ranks colleges by your real admission probability from historical data.',
    view: 'optimizer',
    badge: 'AI',
    badgeColor: INTERACTIVE,
    color: INTERACTIVE,
    category: 'Smart Tools',
  },
  {
    icon: TrendingUp,
    title: 'Upgrade Probability',
    desc: 'Understand your chances of getting a better college in subsequent counselling rounds based on historical seat movement.',
    howTo: 'Input your current allotted college and rank. See probability of upgrade in Round 2 based on seat-movement patterns.',
    view: 'upgrade',
    badge: 'Beta',
    badgeColor: '#EA580C',
    color: '#EA580C',
    category: 'Smart Tools',
  },
  {
    icon: Layers,
    title: 'Choice List Builder',
    desc: 'Build, reorder and audit your final preference list — detect sequence conflicts and export before submitting on the MCC portal.',
    howTo: 'Add colleges and drag to reorder. The AI flags risky orderings and helps you lock the safest sequence.',
    view: 'lab',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Smart Tools',
  },
  {
    icon: BookOpen,
    title: 'Counselling Guide',
    desc: 'Complete NEET UG counselling guide — quota codes, category benefits, round strategy and choice filling tips explained clearly.',
    howTo: 'Browse sections by topic — from registration to reporting. Use it step-by-step during the actual counselling window.',
    view: 'counselling',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Resources',
  },
  {
    icon: Calendar,
    title: 'Counselling Timeline',
    desc: 'Track every important MCC counselling date — registration, choice filling, allotment results and reporting deadlines.',
    howTo: 'Check the timeline before each round. Never miss a registration or reporting deadline.',
    view: 'timeline',
    badge: null,
    badgeColor: null,
    color: '#D97706',
    category: 'Resources',
  },
  {
    icon: GraduationCap,
    title: 'AIIMS Hub',
    desc: 'Dedicated section for all AIIMS campus cutoff data — filter by round, category, and program across all AIIMS campuses.',
    howTo: 'Select an AIIMS campus and category. Compare closing ranks across years to understand admission difficulty.',
    view: 'aiims-hub',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Cutoff Data',
  },
  {
    icon: MapPin,
    title: 'State Quota Cutoffs',
    desc: 'Opening & closing ranks for state government quota seats — filtered by state, authority and college, covering every state including UP.',
    howTo: 'Pick your state and authority. Filter by college or course to see state quota rank ranges.',
    view: 'state',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Cutoff Data',
  },
];

// ── Trust Indicators ────────────────────────────────────────────────────────
const TRUST = [
  { icon: Database,    label: '6 Lakh+',   sub: 'Rank Coverage'      },
  { icon: ShieldCheck, label: '100%',       sub: 'Official Data'      },
  { icon: Clock,       label: '2021–2025',  sub: 'Years Covered'     },
  { icon: BarChart2,   label: 'All Rounds', sub: 'R1, R2, R3, Stray & Special' },
];

// ── All-in-One Coverage — MCC, AACC, and every state's NEET & AYUSH ────────
const COVERAGE = [
  { tag: 'MCC · All India Quota  & Nursing', desc: 'MBBS & BDS AIQ BSc Nursing — 15% AIQ seats, AIIMS & JIPMER' },
  { tag: 'AACC · AYUSH', desc: 'BAMS, BHMS, BUMS counselling' },
  { tag: 'All 28 States · NEET UG', desc: 'State quota MBBS/BDS for every state' },
  { tag: 'All States · AYUSH', desc: 'State-level AYUSH counselling' },
];

// ── Platform Highlights ─────────────────────────────────────────────────────
const HIGHLIGHTS = [
  {
    icon: CheckCircle,
    title: 'No Login Needed',
    desc: 'Access every tool and dataset instantly — no account, no sign-up required.',
    color: '#16A34A',
  },
  {
    icon: Zap,
    title: '100% Free, Always',
    desc: 'Every feature on RankSetu is free. No premium tiers, no paywalls.',
    color: INTERACTIVE,
  },
  {
    icon: ShieldCheck,
    title: 'Verified Official Data',
    desc: 'All data is sourced directly from official MCC, AACC, and State seat allotment PDFs.',
    color: PRIMARY,
  },
  {
    icon: Users,
    title: 'Student-First',
    desc: 'Designed to make NEET counselling simpler and more transparent.',
    color: '#D97706',
  },
];

// ── Quick How-To Steps ──────────────────────────────────────────────────────
const HOW_TO = [
  { num: '01', title: 'Enter Your NEET Rank', desc: 'Input your rank and category to instantly see your opportunities across all of India.' },
  { num: '02', title: 'Explore Cutoffs & Colleges', desc: 'Browse year-wise, round-wise cutoffs and filter by college, category, or state.' },
  { num: '03', title: 'Build Your Choice List', desc: 'Use the AI Choice Optimizer to create a ranked preference list in the safest order.' },
  { num: '04', title: 'Track & Confirm', desc: 'Monitor the counselling timeline, check upgrade probability, and secure your seat.' },
];

// ── Category grouping ───────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Colleges', 'Cutoff Data', 'Smart Tools', 'Resources'];

// ── Popular quick searches — jump straight into a pre-scoped tool ──────────
const POPULAR_SEARCHES = [
  { label: 'AIIMS Cutoffs',        view: 'aiims-hub' },
  { label: 'MCC Round 1 Cutoffs',  view: 'mcc' },
  { label: 'OBC Category Cutoffs', view: 'mcc' },
  { label: 'State Quota Colleges', view: 'state' },
  { label: 'Ayush BAMS Cutoffs',   view: 'ayush' },
  { label: 'Choice List Order',    view: 'lab' },
];

// ── Homepage quick FAQ — short answers; the deep FAQ lives on the
// How-to-Use page (setCurrentView('how-to-use') links out to it) ───────────
const HOME_FAQS = [
  { q: 'Is RankSetu free?', a: 'Yes — every tool and dataset is 100% free, with no login required.' },
  { q: 'Does RankSetu cover only MCC, or AYUSH too?', a: 'Both — and more. RankSetu covers MCC All-India Quota, AACC AYUSH & Nursing counselling, and every state\u2019s NEET and AYUSH counselling, including UP NEET and UP AYUSH, all in one place.' },
  { q: 'Where does the cutoff data come from?', a: 'Directly from official MCC, AACC, and State seat allotment PDFs — no estimates.' },
  { q: 'Do I submit my choices through RankSetu?', a: 'No. RankSetu helps you plan and order your choices — the actual submission still happens on the official MCC, AACC, or State counselling portal.' },
  { q: 'I\u2019m new here — where do I start?', a: 'Head to the "How to Use RankSetu" guide for a full walkthrough of every tool, step by step.' },
];

export default function Home({ setCurrentView, showToast, darkMode }) {
  const dm = darkMode;
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedCard, setExpandedCard] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    // Note: no backend endpoint is wired up yet — this just confirms intent
    // to the user. Hook this up to a real subscribe API before shipping.
    setNewsletterSubmitted(true);
    showToast?.('Thanks! We\u2019ll notify you at ' + newsletterEmail);
  };

  const filteredFeatures = activeCategory === 'All'
    ? FEATURES
    : FEATURES.filter(f => f.category === activeCategory);

  return (
    <div>
      {/* ── Trust bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TRUST.map(({ icon: Icon, label, sub }) => (
          <div
            key={sub}
            className={`flex items-center gap-3 p-3.5 rounded-xl border ${
              dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(26,60,110,0.1)', color: PRIMARY }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-sm font-black leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{label}</p>
              <p className={`text-[10px] font-bold leading-tight ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── All-in-One Coverage Banner — MCC + AACC + every state, NEET & AYUSH ── */}
      <div className={`mb-8 p-5 sm:p-6 rounded-2xl border ${
        dm ? 'bg-[#0D1829] border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Layers3 className="w-4 h-4" style={{ color: INTERACTIVE }} />
          <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: INTERACTIVE }}>
            One Platform. Everything Covered.
          </p>
        </div>
        <h2 className={`text-lg sm:text-xl font-black tracking-tight mb-4 ${dm ? 'text-white' : 'text-slate-900'}`}>
          Not just MCC. Not just AYUSH. <span style={{ color: INTERACTIVE }}>Everything, in one place.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COVERAGE.map((c) => (
            <div key={c.tag} className={`flex items-start gap-2.5 p-3.5 rounded-xl border ${
              dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: INTERACTIVE }} />
              <div>
                <p className={`text-xs font-black mb-0.5 ${dm ? 'text-white' : 'text-slate-900'}`}>{c.tag}</p>
                <p className={`text-[11px] leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── College Directory Banner — new flagship feature, called out on its own ── */}
      <button
        onClick={() => setCurrentView('college-info')}
        className={`w-full mb-8 text-left rounded-2xl border overflow-hidden relative group transition-all cursor-pointer ${
          dm
            ? 'bg-gradient-to-r from-[#102347] via-[#0F1E3D] to-[#0B0F19] border-blue-500/30 hover:border-blue-400/50'
            : 'bg-gradient-to-r from-[#EEF4FF] via-[#F4F8FF] to-white border-blue-200 hover:border-blue-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.3)', color: '#2563EB' }}
          >
            <Building2 className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
                Explore the College Directory
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.3)', color: '#2563EB' }}>
                New
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              991 medical colleges, each with its own page — cutoffs, fee structure, seat matrix and admission
              details, all in one place. Search by name or filter by state and college type.
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl text-white shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ backgroundColor: '#2563EB' }}
          >
            <Search className="w-4 h-4" />
            Browse Colleges
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* ── "How to Use RankSetu" Banner — first stop for new users ──── */}
      <button
        onClick={() => setCurrentView('how-to-use')}
        className={`w-full mb-8 text-left rounded-2xl border overflow-hidden relative group transition-all cursor-pointer ${
          dm
            ? 'bg-slate-800/40 border-slate-700 hover:border-blue-500/40'
            : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
            style={{ backgroundColor: 'rgba(26,60,110,0.08)', borderColor: 'rgba(26,60,110,0.2)', color: PRIMARY }}
          >
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className={`text-base font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
                New here? Read the full How-to-Use Guide
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.3)', color: '#2563EB' }}>
                New
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
              A beginner-friendly walkthrough of every tool — what it does, who it&rsquo;s for, and step-by-step guides for predicting, searching, and comparing colleges.
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl text-white shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ backgroundColor: PRIMARY }}
          >
            Read the Guide
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* ── Popular Searches ─────────────────────────────────────────── */}
      <div className="mb-8">
        <p className={`text-xs font-bold mb-2.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Popular searches</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map(({ label, view }) => (
            <button
              key={label}
              onClick={() => setCurrentView(view)}
              className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-colors cursor-pointer ${
                dm
                  ? 'border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <Search className="w-3 h-3 inline mr-1.5 -mt-0.5 opacity-60" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Platform Highlights ──────────────────────────────────────── */}
      <div className={`mb-8 p-5 rounded-2xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <p
          className="text-[11px] font-black uppercase tracking-[0.18em] mb-3"
          style={{ color: PRIMARY }}
        >
          Why RankSetu
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}18`, color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-sm font-black mb-0.5 ${dm ? 'text-white' : 'text-slate-900'}`}>{title}</p>
                <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em]"
            style={{ color: PRIMARY }}
          >
            How It Works
          </p>
          <button
            onClick={() => setCurrentView('how-to-use')}
            className="text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
            style={{ color: INTERACTIVE }}
          >
            View Full Guide <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOW_TO.map((step, idx) => (
            <div
              key={step.num}
              className={`relative p-4 rounded-xl border ${
                dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {idx < HOW_TO.length - 1 && (
                <ArrowRight
                  className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 hidden lg:block"
                  style={{ color: PRIMARY, opacity: 0.35 }}
                />
              )}
              <p
                className="text-2xl font-black mb-2 leading-none"
                style={{ color: `${PRIMARY}30` }}
              >
                {step.num}
              </p>
              <p className={`text-sm font-black mb-1 ${dm ? 'text-white' : 'text-slate-900'}`}>{step.title}</p>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section heading + category filter ───────────────────────── */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1">
          <p
            className="text-[11px] font-black uppercase tracking-[0.18em] mb-1"
            style={{ color: PRIMARY }}
          >
            All Tools
          </p>
          <h2 className={`text-2xl font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
            What would you like to do?
          </h2>
          <p className={`text-sm mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Select any tool below to get started with your NEET UG counselling preparation.
          </p>
        </div>
        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-black px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'border-transparent text-white'
                  : dm
                    ? 'border-slate-600 text-slate-300 hover:border-slate-500 bg-transparent'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
              }`}
              style={activeCategory === cat ? { backgroundColor: PRIMARY } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feature grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((f) => {
          const Icon = f.icon;
          const isExpanded = expandedCard === f.view;
          return (
            <div
              key={f.view}
              className={`group text-left rounded-2xl border transition-all duration-200 overflow-hidden ${
                dm
                  ? 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setCurrentView(f.view)}
                className="w-full text-left p-5 cursor-pointer"
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: `${f.color}14`,
                      borderColor: `${f.color}28`,
                      color: f.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Category tag */}
                    <span className={`text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                      dm ? 'border-slate-600 text-slate-400 bg-slate-700/50' : 'border-slate-200 text-slate-400 bg-slate-50'
                    }`}>
                      {f.category}
                    </span>
                    {f.badge && (
                      <span
                        className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${f.badgeColor}12`,
                          borderColor: `${f.badgeColor}28`,
                          color: f.badgeColor,
                        }}
                      >
                        {f.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Text */}
                <h3
                  className={`text-sm font-black mb-1.5 group-hover:underline decoration-2 underline-offset-2 ${dm ? 'text-white' : 'text-slate-900'}`}
                  style={{ textDecorationColor: f.color }}
                >
                  {f.title}
                </h3>
                <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                  {f.desc}
                </p>

                {/* Arrow */}
                <div
                  className="mt-3 flex items-center gap-1 text-xs font-black transition-all group-hover:gap-2"
                  style={{ color: f.color }}
                >
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* How-to expand toggle */}
              <div className={`border-t px-5 py-2.5 flex items-center justify-between ${
                dm ? 'border-slate-700' : 'border-slate-100'
              }`}>
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : f.view)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    dm ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Info className="w-3 h-3" />
                  {isExpanded ? 'Hide' : 'How to use'}
                </button>
              </div>

              {/* How-to panel */}
              {isExpanded && (
                <div
                  className={`px-5 pb-4 text-xs leading-relaxed border-t ${
                    dm ? 'border-slate-700 text-slate-300 bg-slate-800/60' : 'border-slate-100 text-slate-600 bg-slate-50/80'
                  }`}
                  style={{ borderTopWidth: 0 }}
                >
                  <p className={`pt-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{f.howTo}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Success Stories (placeholder — real testimonials go here) ──── */}

{/*       
      <div className="mt-10 mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: PRIMARY }}>
          Success Stories
        </p>
        <div
          className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left ${
            dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 mx-auto sm:mx-0"
            style={{ backgroundColor: dm ? 'rgba(37,99,235,0.15)' : 'rgba(26,60,110,0.08)' }}
          >
            <Quote className="w-6 h-6" style={{ color: INTERACTIVE }} />
          </div>
          <div>
            <p className={`text-sm font-bold mb-1 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              Student success stories are coming soon
            </p>
            <p className={`text-xs leading-relaxed ${dm ? 'text-slate-500' : 'text-slate-500'}`}>
              This space is reserved for real testimonials from students who used RankSetu during their
              counselling. Once a few are collected, they&rsquo;ll be featured here — no design changes needed.
            </p>
          </div>
        </div>
      </div>
 */}




      {/* ── Quick FAQ ──────────────────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: PRIMARY }}>
            Quick Questions
          </p>
          <button
            onClick={() => setCurrentView('how-to-use')}
            className="text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:underline"
            style={{ color: INTERACTIVE }}
          >
            More FAQs <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className={`rounded-2xl border overflow-hidden ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          {HOME_FAQS.map((f, i) => (
            <div key={f.q} className={`border-b last:border-b-0 ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left cursor-pointer"
              >
                <span className={`text-sm font-bold flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" style={{ color: PRIMARY }} />
                  {f.q}
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${dm ? 'text-slate-400' : 'text-slate-400'} ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className={`px-5 pb-3.5 pl-11 text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Stats Banner ───────────────────────────────────────── */}
      <div className={`mt-8 grid grid-cols-3 gap-3 p-5 rounded-2xl border ${
        dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {[
          { value: '991', label: 'Medical Colleges Mapped', icon: MapPin },
          // { value: '1.4L+', label: 'Students Guided', icon: Users },
          { value: 'Built For', label: 'NEET Aspirants', icon: Users },
          { value: '5 Yrs', label: 'Historical Cutoff Data', icon: FileText },
        ].map(({ value, label, icon: Icon }) => (
          <div key={label} className="text-center">
            <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: PRIMARY, opacity: 0.6 }} />
            <p className={`text-lg font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            <p className={`text-[10px] font-bold leading-tight ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Security & Privacy strip ─────────────────────────────────── */}
      <div className={`mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3`}>
        {[
          { icon: ShieldCheck, title: 'No Data Selling', desc: 'We never sell, rent, or share your personal data.', color: '#16A34A' },
          { icon: CheckCircle, title: 'No Login Needed', desc: 'Use every tool without creating an account.', color: INTERACTIVE },
          { icon: Database,    title: 'Verified Sources Only', desc: 'Every number traces back to an official PDF.', color: PRIMARY },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className={`flex items-start gap-3 p-4 rounded-xl border ${
            dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-sm font-black mb-0.5 ${dm ? 'text-white' : 'text-slate-900'}`}>{title}</p>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Data source note ─────────────────────────────────────────── */}
      <div
        className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
          dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
        <p className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
          <strong className={dm ? 'text-white' : 'text-slate-900'}>100% Authentic Data:</strong>{' '}
          All Opening & Closing Rank data is extracted directly from official MCC, AACC, and State seat
          allotment result PDFs published on <strong>mcc.nic.in</strong>, the AACC portal, and respective
          State Counselling Authority websites. No estimates, no approximations.
          <span className={`block mt-1 text-xs font-bold ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            Data last verified: 1 July 2026
          </span>
        </p>
      </div>

      {/* ── Newsletter signup ────────────────────────────────────────── */}

{/*       
      <div
        className={`mt-8 p-6 sm:p-8 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 ${
          dm ? 'bg-gradient-to-r from-[#102347] to-[#0B0F19] border-blue-500/30' : 'bg-gradient-to-r from-[#EEF4FF] to-white border-blue-200'
        }`}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: dm ? 'rgba(37,99,235,0.15)' : 'rgba(26,60,110,0.08)' }}
        >
          <Mail className="w-6 h-6" style={{ color: INTERACTIVE }} />
        </div>
        <div className="flex-1">
          <p className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
            Get counselling deadline reminders
          </p>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            One email when a new round opens or a key MCC deadline is near. No spam.
          </p>
        </div>
        {newsletterSubmitted ? (
          <div className={`flex items-center gap-2 text-sm font-bold shrink-0 ${dm ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <CheckCircle className="w-4 h-4" /> You&rsquo;re on the list
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="flex w-full sm:w-auto gap-2 shrink-0">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@email.com"
              className={`flex-1 sm:w-56 text-sm px-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-400/40 ${
                dm ? 'bg-slate-900/60 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            <button
              type="submit"
              className="text-sm font-black px-5 py-2.5 rounded-xl text-white cursor-pointer shrink-0"
              style={{ backgroundColor: PRIMARY }}
            >
              Notify Me
            </button>
          </form>
        )}
      </div> 

       */}

      {/* ── Founder credibility strip ────────────────────────────────── */}
      <button
        onClick={() => setCurrentView('about-us')}
        className={`w-full mt-4 text-left rounded-2xl border overflow-hidden group transition-all cursor-pointer ${
          dm
            ? 'bg-slate-800/40 border-slate-700 hover:border-blue-500/40'
            : 'bg-white border-slate-200 shadow-sm hover:border-blue-300'
        }`}
      >
        <div className="flex items-center gap-4 p-5">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 border text-sm font-black"
            style={{ backgroundColor: `${PRIMARY}14`, borderColor: `${PRIMARY}28`, color: PRIMARY }}
          >
            U
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
              Built for aspirants, by an aspirant.
            </p>
            <p className={`text-xs leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              RankSetu was founded by Umashankar after helping his own brother and friends through
              NEET counselling. Read the full story behind the platform.
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 text-xs font-black shrink-0 transition-transform group-hover:translate-x-0.5"
            style={{ color: INTERACTIVE }}
          >
            Meet the Founder <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </button>

      {/* ── Quick contact strip ──────────────────────────────────────── */}

      {/* <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
        dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
      }`}>
        <p className={`text-xs ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          Spotted an error in the data, or have feedback for us?
        </p>
        <a
          href="mailto:support@ranksetu.com"
          className="inline-flex items-center gap-1.5 text-xs font-black cursor-pointer hover:underline"
          style={{ color: INTERACTIVE }}
        >
          <Mail className="w-3.5 h-3.5" />
          support@ranksetu.com
        </a>
      </div> */}


      {/* ── SEO content block ────────────────────────────────────────── */}
      <div className={`mt-8 pt-6 border-t text-xs leading-relaxed ${dm ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
        <p>
          <strong className={dm ? 'text-slate-300' : 'text-slate-700'}>NEET UG Counselling</strong> is the
          centralised process through which MBBS, BDS, BAMS, BHMS, BUMS and BNYS seats across India are
          allotted based on NEET UG rank, category and quota eligibility. RankSetu brings together MCC All-India
          Quota cutoffs, AIIMS and JIPMER cutoffs, AACC AYUSH &amp; Nursing cutoffs, and every state&rsquo;s NEET
          and AYUSH counselling data — including UP NEET and UP AYUSH — in one place, along with an AI-powered
          choice optimizer and a choice list builder — helping NEET aspirants and parents make informed,
          data-backed decisions during MBBS/BDS/AYUSH admission and medical counselling.
        </p>
      </div>
      {/* ── Disclaimer ────────────────────────────────────────────────── */}
      <p className={`mt-6 text-[11px] leading-relaxed ${dm ? 'text-slate-600' : 'text-slate-400'}`}>
        RankSetu is an independent, student-run platform and is not affiliated with, endorsed by, or
        officially connected to MCC, NMC, AACC, DGHS, or any State Counselling Authority. Data shown is
        compiled from publicly available official sources for informational purposes — always cross-verify
        with the official portal before making final decisions.
      </p>
    </div>
  );
}