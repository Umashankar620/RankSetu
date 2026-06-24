'use client';

import React, { useState } from 'react';
import {
  BarChart2, Target, TrendingUp, BookOpen,
  Layers, FlaskConical, Calendar, GraduationCap, Leaf,
  ArrowRight, ShieldCheck, Database, Clock, MapPin,
  CheckCircle, Star, Users, FileText, Zap, Info,
} from 'lucide-react';

const PRIMARY     = '#1A3C6E';
const INTERACTIVE = '#2563EB';

// ── Feature cards config ───────────────────────────────────────────────────
const FEATURES = [
  {
    icon: BarChart2,
    title: 'MCC Cutoff Explorer',
    desc: 'Year-wise, round-wise opening & closing ranks for every MCC college — AIQ, AIIMS, JIPMER, and Deemed universities.',
    howTo: 'Select year, round, and category. Filter by college or branch to see exact rank ranges.',
    view: 'analytics',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Cutoff Data',
  },
  {
    icon: Leaf,
    title: 'AYUSH Cutoffs',
    desc: 'Opening & closing ranks for BAMS, BHMS, BUMS and BSMS programs under MCC and Ayush counselling.',
    howTo: 'Choose AYUSH course type and filter by state or college to compare rank trends across years.',
    view: 'ayush',
    badge: null,
    badgeColor: null,
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
    title: 'AI Choice Lab',
    desc: 'Organise your final preference list, detect sequence conflicts, and export before submitting on the MCC portal.',
    howTo: 'Build your list by dragging colleges. The AI flags risky orderings and helps you lock the safest sequence.',
    view: 'lab',
    badge: null,
    badgeColor: null,
    color: PRIMARY,
    category: 'Smart Tools',
  },
  {
    icon: FlaskConical,
    title: 'Choice Sandbox',
    desc: 'Simulate your counselling choice list in a risk-free environment and resolve ordering conflicts before the window opens.',
    howTo: 'Add colleges to your sandbox list and run simulations to test different ordering strategies without risk.',
    view: 'sandbox',
    badge: null,
    badgeColor: null,
    color: INTERACTIVE,
    category: 'Smart Tools',
  },
  {
    icon: BookOpen,
    title: 'Counselling Guide',
    desc: 'Complete MCC UG counselling guide — quota codes, category benefits, round strategy and choice filling tips explained clearly.',
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
];

// ── Trust Indicators ────────────────────────────────────────────────────────
const TRUST = [
  { icon: Database,    label: '6 Lakh+',   sub: 'Rank Coverage'      },
  { icon: ShieldCheck, label: '100%',       sub: 'Official MCC Data' },
  { icon: Clock,       label: '2021–2025',  sub: 'Years Covered'     },
  { icon: BarChart2,   label: 'All Rounds', sub: 'R1, R2, R3, Stray, Special, Stray' },
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
    desc: 'All data sourced directly from MCC seat allotment PDFs on mcc.nic.in.',
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
const CATEGORIES = ['All', 'Cutoff Data', 'Smart Tools', 'Resources'];

export default function Home({ setCurrentView, showToast, darkMode }) {
  const dm = darkMode;
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedCard, setExpandedCard] = useState(null);

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
        <p
          className="text-[11px] font-black uppercase tracking-[0.18em] mb-3"
          style={{ color: PRIMARY }}
        >
          How It Works
        </p>
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

      {/* ── Quick Stats Banner ───────────────────────────────────────── */}
      <div className={`mt-8 grid grid-cols-3 gap-3 p-5 rounded-2xl border ${
        dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {[
          { value: '700+', label: 'Medical Colleges Mapped', icon: MapPin },
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

      {/* ── Data source note ─────────────────────────────────────────── */}
      <div
        className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${
          dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
        <p className={`text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
          <strong className={dm ? 'text-white' : 'text-slate-900'}>100% Authentic Data:</strong>{' '}
          All Opening & Closing Rank data is extracted directly from official MCC seat allotment result PDFs
          published on <strong>mcc.nic.in</strong>. No estimates, no approximations.
        </p>
      </div>
    </div>
  );
}