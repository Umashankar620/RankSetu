'use client';

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ""));
    let start = null;
    const run = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(p < 1 ? Math.floor(e * num) : num);
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [active, target]);
  return val;
}

function useVisible(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, dm, active, delay = 0 }) {
  const suffix = String(value).replace(/[0-9.]/g, "");
  const prefix = String(value).match(/^[^0-9]*/)?.[0] || "";
  const count  = useCountUp(value, active);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className={`flex-1 min-w-[130px] p-6 pb-5 text-center relative overflow-hidden transition-all duration-300 border rounded-xl
      ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}
    `}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#1A3C6E]" />
      <div className="text-3xl font-bold tracking-tight text-[#1A3C6E] mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className={`text-xs font-semibold uppercase tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: IconComponent, title, desc, dm }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`p-6 rounded-xl border transition-all duration-200 cursor-default
        ${dm
          ? 'bg-slate-800/30 border-slate-700 hover:border-[#1A3C6E]/50 hover:bg-slate-800/50'
          : 'bg-white border-slate-200 hover:border-[#1A3C6E]/30 hover:bg-slate-50 hover:shadow-sm'
        }
        ${hov ? '-translate-y-0.5 shadow-md' : ''}
      `}
    >
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 transition-colors border
        ${dm ? 'bg-[#1A3C6E]/10 text-[#1A3C6E] border-[#1A3C6E]/20' : 'bg-[#1A3C6E]/5 text-[#1A3C6E] border-[#1A3C6E]/15'}
      `}>
        <IconComponent className="w-5 h-5" />
      </div>
      <h4 className={`font-bold text-base mb-2 ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>{title}</h4>
      <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{desc}</p>
    </div>
  );
}

// ─── Process Step ─────────────────────────────────────────────────────────────
function ProcessStep({ num, title, desc, dm, last, isActive, onClick }) {
  return (
    <div onClick={onClick} className={`flex gap-4 cursor-pointer ${last ? '' : 'pb-2'}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-12 h-12 rounded-lg shrink-0 flex items-center justify-center border-2 transition-all
          ${isActive
            ? 'bg-[#1A3C6E] border-[#1A3C6E] text-white'
            : dm
              ? 'bg-slate-700 border-slate-600 text-slate-300'
              : 'bg-slate-100 border-slate-300 text-slate-600'
          }
        `}>
          <span className="font-bold text-base">{num}</span>
        </div>
        {!last && (
          <div className={`w-px flex-1 min-h-8 mt-2 transition-all
            ${isActive ? 'bg-[#1A3C6E]' : (dm ? 'bg-slate-700' : 'bg-slate-200')}
          `} />
        )}
      </div>
      <div className={`flex-1 ${last ? '' : 'pb-6'} pt-2`}>
        <h4 className={`font-bold text-base mb-1.5 transition-colors
          ${isActive ? 'text-[#1A3C6E]' : (dm ? 'text-slate-200' : 'text-slate-700')}
        `}>{title}</h4>
        <p className={`text-sm leading-relaxed transition-all duration-300
          ${isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
          ${dm ? 'text-slate-400' : 'text-slate-600'}
        `}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, dm }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border
      ${dm
        ? 'bg-[#1A3C6E]/10 border-[#1A3C6E]/30 text-[#93B4DC]'
        : 'bg-[#1A3C6E]/5 border-[#1A3C6E]/20 text-[#1A3C6E]'
      }
    `}>
      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
      {children}
    </span>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ eyebrow, title, highlight, subtitle, dm, center = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : 'text-left'}`}>
      <div className="mb-3"><Badge dm={dm}>{eyebrow}</Badge></div>
      <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3
        ${dm ? 'text-white' : 'text-[#1A3C6E]'}
      `}>
        {title} {highlight && <span>{highlight}</span>}
      </h2>
      {subtitle && (
        <p className={`text-base max-w-lg ${center ? 'mx-auto' : ''} ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Story Timeline (moved from HeroSlider) ───────────────────────────────────
const STORY_STEPS = [
  {
    year: "2023",
    label: "The Problem",
    heading: "Confusion During Counselling",
    body: "Like thousands of NEET aspirants, the founder faced a wall of scattered government PDFs, contradictory advice, and zero clarity on which college to choose — at the highest-stakes moment of his life.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
      </svg>
    ),
  },
  {
    year: "2024",
    label: "The Decision",
    heading: "Building the Bridge",
    body: "Instead of accepting the chaos, he decided to build what didn't exist — a single, reliable platform that aggregates MCC cutoffs, AYUSH data, college databases, and counselling guidance in one place.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    year: "2024",
    label: "The Launch",
    heading: "RankSetu Goes Live",
    body: "RankSetu launched with real MCC Opening & Closing rank data, a Choice Optimizer, and an Upgrade Checker. Within months, over 1.4 lakh aspirants used it to make informed counselling decisions.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    year: "2025–26",
    label: "The Mission",
    heading: "Clarity for Every Aspirant",
    body: "Today RankSetu covers 600+ colleges, 21 AIIMS, state quotas across 28 states, AYUSH counselling, a rank predictor, and a live timeline — 100% free. Every feature exists because a student genuinely needed it.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

// ─── Story Section Component ───────────────────────────────────────────────────
function StorySection({ dm }) {
  return (
    <div className={`mb-14 rounded-xl overflow-hidden border shadow-sm
      ${dm ? 'bg-[#0D1829] border-slate-700' : 'bg-white border-slate-200'}`}>
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#1A3C6E] via-[#2563EB] to-[#1A3C6E]" />

      <div className="px-8 md:px-12 py-10">
        {/* Section heading */}
        <div className="mb-10">
          <div className="mb-3"><Badge dm={dm}>Our Origin Story</Badge></div>
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3
            ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            The Story Behind <span className="text-[#2563EB]">RankSetu</span>
          </h2>
          <p className={`text-base leading-relaxed max-w-2xl ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            Every platform has a beginning. Ours started with frustration, a government PDF, and a student who refused to accept that counselling had to be this hard.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — desktop */}
          <div className={`hidden lg:block absolute left-[7.5rem] top-0 bottom-0 w-px
            ${dm ? 'bg-white/8' : 'bg-[#1A3C6E]/10'}`} />

          <div className="space-y-0">
            {STORY_STEPS.map((step, idx) => (
              <div key={idx} className={`relative flex flex-col lg:flex-row lg:items-start
                ${idx < STORY_STEPS.length - 1
                  ? dm ? 'border-b border-white/5' : 'border-b border-[#1A3C6E]/06'
                  : ''
                }`}>

                {/* Year label — left column on desktop */}
                <div className="lg:w-[120px] lg:flex-shrink-0 flex lg:flex-col items-center lg:items-end lg:pr-8 gap-3 lg:gap-1 pt-6 lg:pt-8 pb-2 lg:pb-8">
                  <span className={`text-xs font-black tracking-[0.15em] uppercase font-mono
                    ${dm ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                    {step.year}
                  </span>
                  <span className={`text-[10px] font-bold tracking-widest uppercase
                    ${dm ? 'text-slate-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>

                {/* Timeline dot — desktop only */}
                <div className="hidden lg:flex absolute left-[7.5rem] -translate-x-1/2 items-center justify-center mt-8">
                  <div className={`w-3 h-3 border-2 flex-shrink-0
                    ${idx === STORY_STEPS.length - 1
                      ? dm ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-[#1A3C6E] border-[#1A3C6E]'
                      : dm ? 'bg-[#0D1829] border-[#2563EB]/60' : 'bg-white border-[#1A3C6E]/40'
                    }`} />
                </div>

                {/* Content — right column */}
                <div className="flex-1 lg:pl-12 pb-8 lg:pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`flex-shrink-0 ${dm ? 'text-[#60A5FA]' : 'text-[#1A3C6E]'}`}>
                      {step.icon}
                    </span>
                    <h3 className={`text-base font-bold ${dm ? 'text-white' : 'text-[#0D1F3C]'}`}
                      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                      {step.heading}
                    </h3>
                  </div>
                  <p className={`text-sm leading-relaxed max-w-2xl
                    ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founder quote — the central belief statement */}
        <div className={`mt-10 border-l-4 pl-6 py-1
          ${dm ? 'border-[#2563EB]' : 'border-[#1A3C6E]'}`}>
          <svg className={`h-6 w-6 mb-3 ${dm ? 'text-[#2563EB]/50' : 'text-[#1A3C6E]/25'}`}
            viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <blockquote className={`text-base sm:text-lg font-medium leading-relaxed italic max-w-3xl
            ${dm ? 'text-slate-200' : 'text-slate-700'}`}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            "RankSetu was born from my own confusion during NEET counselling — scattered PDFs, no clarity, and very high stakes.
            I built this platform so no aspirant has to navigate their future blindly.
            Every feature here exists because a student once genuinely needed it."
          </blockquote>
          <div className="flex items-center gap-3 mt-5">
            <div className={`w-8 h-px ${dm ? 'bg-[#2563EB]/60' : 'bg-[#1A3C6E]/40'}`} />
            <span className={`text-xs font-bold tracking-[0.18em] uppercase
              ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              Umashankar · Founder, RankSetu · 2024
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AboutUs ═══════════════════════════════════════════════════════════════
export default function AboutUs({ darkMode: dm = false }) {
  const [statsRef, statsVis] = useVisible();
  const [activeStep, setActiveStep] = useState(0);

  // ─── Inline SVG icons ──────────────────────────────────────────────────────
  const IconHeart  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  const IconEye    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const IconLock   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  const IconShield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  const IconBar    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20V14"/></svg>;
  const IconTarget = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const IconFile   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>;
  const IconZap    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const IconCheck  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
  const IconStar   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
  const IconFlag   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;

  const FEATURES = [
    { icon: IconHeart,  title: "100% Free, Always",       desc: "Every feature — cutoff data, college predictor, counselling guide — is completely free. No hidden costs, ever." },
    { icon: IconEye,    title: "Zero Ads, Zero Noise",     desc: "Pure, distraction-free experience. No pop-ups, no sponsored results — just the information you need." },
    { icon: IconLock,   title: "No Login Required",        desc: "Access the entire platform instantly. No sign-up, no account, no data harvesting." },
    { icon: IconShield, title: "Verified Official Data",   desc: "Sourced and verified directly from MCC, NMC, and State Counselling Authorities." },
    { icon: IconBar,    title: "Visual Analytics",         desc: "Year-wise, round-wise charts that turn complex government PDFs into instant visual intelligence." },
    { icon: IconTarget, title: "Smart Rank Predictor",     desc: "Cross-references your rank with historical data to generate your exact best-fit college shortlist." },
    { icon: IconFile,   title: "Step-by-Step Guidance",    desc: "Every stage of MCC counselling in plain language — from registration to final allotment." },
    { icon: IconZap,    title: "Instant Results",          desc: "High-performance engine delivers accurate cutoff results in milliseconds. Every time." },
  ];

  const STEPS = [
    { num: "01", title: "Enter Your NEET Rank",      desc: "Input your rank and category. Get an instant landscape of every opportunity available across all of India — no guesswork, no confusion." },
    { num: "02", title: "Filter Your Top Colleges",  desc: "No more 500-page PDFs. Surface your top 20–30 best-fit colleges matched precisely to your rank, category, and state preferences." },
    { num: "03", title: "Strategic Choice Filling",  desc: "The right choice order is the real game of counselling. We guide the exact sequence that maximises your chances at the best possible seat." },
    { num: "04", title: "Secure Your Seat",          desc: "From rank to admission — navigate every round, upgrade opportunity, and deadline with complete confidence and clarity." },
  ];

  const BADGES = ["100% Free Forever", "No Login Required", "Zero Ads", "Verified Data"];

  const STATS = [
    { value: "140000", label: "Aspirants Helped", suffix: "+" },
    { value: "600",    label: "Colleges Mapped",  suffix: "+" },
    { value: "6",      label: "Lakh+ Rank Records", suffix: "" },
    { value: "2024",   label: "Founded",           suffix: "" },
  ];

  const VALUES = [
    { icon: IconHeart,  title: "Student-First",     desc: "Every decision is made with one question: does this genuinely help the student?" },
    { icon: IconShield, title: "Integrity",          desc: "Data is sourced directly from official authorities. We never publish unverified information." },
    { icon: IconEye,    title: "Transparency",       desc: "No hidden agendas, no paid rankings, no sponsored placements — ever." },
    { icon: IconStar,   title: "Excellence",         desc: "We hold ourselves to the highest standard of accuracy because a student's future depends on it." },
  ];

  return (
    <div className={`min-h-screen ${dm ? 'bg-[#0A0F19]' : 'bg-[#F9FAFC]'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">

        {/* ── 1. PAGE HERO — Who We Are ───────────────────────────────── */}
        <div className={`mb-10 pb-10 border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-3 text-[#2563EB]">
            About Us · RankSetu
          </p>
          <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight
            ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            Built for aspirants.<br />
            <span className="text-[#2563EB]">By an aspirant.</span>
          </h1>
          <p className={`text-base leading-relaxed max-w-2xl mb-6 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            RankSetu was built by a NEET aspirant who experienced firsthand how difficult it was to navigate
            counselling without a single reliable source. This page tells you who we are, what we stand for,
            and why every feature on this platform was built with students — not profit — in mind.
          </p>

          {/* Mission banner */}
          <div className={`rounded-xl border ${dm ? 'border-[#1A3C6E]/30 bg-[#1A3C6E]/5' : 'border-[#1A3C6E]/20 bg-[#1A3C6E]/5'}`}>
            <div className="p-5 md:px-8 flex items-center gap-5 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-[#1A3C6E] flex items-center justify-center text-white text-xl shadow-sm shrink-0">
                ⚡
              </div>
              <p className={`text-base md:text-lg font-medium leading-relaxed flex-1 ${dm ? 'text-slate-200' : 'text-slate-700'}`}>
                Our Mission —{" "}
                <em className="italic">Quality guidance is a right, not a privilege.</em>{" "}
                Every feature on{" "}
                <span className="font-bold text-[#2563EB]">RankSetu</span>{" "}
                is{" "}
                <span className="font-bold text-[#2563EB]">free, forever.</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── 2. STATS ─────────────────────────────────────────────────── */}
        <div ref={statsRef} className="flex flex-wrap gap-4 mb-14">
          {STATS.map((s, i) => (
            <StatCard key={s.label} value={s.value} label={s.label} dm={dm} active={statsVis} delay={i * 100} />
          ))}
        </div>

        {/* ── 3. MISSION & VISION CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {/* Mission */}
          <div className={`relative p-8 rounded-xl border overflow-hidden
            ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1A3C6E] to-[#2563EB]" />
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 border
              ${dm ? 'bg-[#1A3C6E]/15 border-[#1A3C6E]/30 text-[#60A5FA]' : 'bg-[#1A3C6E]/8 border-[#1A3C6E]/20 text-[#1A3C6E]'}`}>
              <IconFlag />
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dm ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
              Our Mission
            </p>
            <h3 className={`text-xl font-bold mb-3 leading-snug ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>
              Clarity for every aspirant. Free. Always.
            </h3>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              To make NEET counselling data transparent, accessible, and free — so that no student is left behind
              due to lack of information. Every tool, every cutoff, every guide on RankSetu is available to anyone,
              without cost or condition.
            </p>
          </div>

          {/* Vision */}
          <div className={`relative p-8 rounded-xl border overflow-hidden
            ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2563EB] to-[#1A3C6E]" />
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 border
              ${dm ? 'bg-[#1A3C6E]/15 border-[#1A3C6E]/30 text-[#60A5FA]' : 'bg-[#1A3C6E]/8 border-[#1A3C6E]/20 text-[#1A3C6E]'}`}>
              <IconStar />
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${dm ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
              Our Vision
            </p>
            <h3 className={`text-xl font-bold mb-3 leading-snug ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>
              India's most trusted NEET counselling platform.
            </h3>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              To become the single most reliable resource for every NEET aspirant in India — a platform where
              students come for data and leave with confidence. Built on authenticity, powered by transparency,
              and sustained by the trust of the students it serves.
            </p>
          </div>
        </div>

        {/* ── 4. THE STORY ─────────────────────────────────────────────── */}
        <StorySection dm={dm} />

        {/* ── 5. VALUES ────────────────────────────────────────────────── */}
        <div className="mb-14">
          <SectionTitle
            eyebrow="What We Stand For"
            title="Our Core"
            highlight="Values"
            subtitle="The principles that guide every decision we make — from what data we publish to how we build every feature."
            dm={dm}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map((v, idx) => <FeatureCard key={idx} {...v} dm={dm} />)}
          </div>
        </div>

        {/* ── 6. WHY RANKSETU / WHAT MAKES US DIFFERENT ───────────────── */}
        <div className="mb-14">
          <SectionTitle
            eyebrow="Our Commitment"
            title="Why Choose"
            highlight="RankSetu?"
            subtitle="We bridge the gap between complex government data and student needs — here's what sets us apart."
            dm={dm}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, idx) => <FeatureCard key={idx} {...f} dm={dm} />)}
          </div>
        </div>

        {/* ── 7. HOW IT WORKS ──────────────────────────────────────────── */}
        <div className={`p-8 md:p-12 rounded-xl mb-14 border shadow-sm
          ${dm ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}
        `}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <SectionTitle
                eyebrow="Our Process"
                title="From Rank"
                highlight="to Reality."
                subtitle="Four steps that turn counselling complexity into clarity, and confusion into confidence."
                dm={dm}
              />
              <div className={`p-4 rounded-lg border-l-4 border-[#1A3C6E] ${dm ? 'bg-[#1A3C6E]/5' : 'bg-[#1A3C6E]/5'}`}>
                <p className={`text-sm italic leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                  "Choosing the right order of preferences is the real game of counselling — and it's where most students lose their dream seat."
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1 rounded-sm cursor-pointer transition-all flex-1 ${
                      i === activeStep ? 'bg-[#1A3C6E]' : (dm ? 'bg-slate-600' : 'bg-slate-200')
                    }`}
                    style={{ flex: i === activeStep ? 2 : 1 }}
                  />
                ))}
              </div>
            </div>
            <div className="pt-2">
              {STEPS.map((s, i) => (
                <ProcessStep
                  key={s.num}
                  {...s}
                  dm={dm}
                  last={i === STEPS.length - 1}
                  isActive={i === activeStep}
                  onClick={() => setActiveStep(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── 8. FOUNDER MESSAGE ───────────────────────────────────────── */}
        <div className={`rounded-xl overflow-hidden border shadow-sm ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
          {/* Top accent */}
          <div className="h-[3px] bg-gradient-to-r from-[#1A3C6E] via-[#2563EB] to-[#1A3C6E]" />

          <div className={`p-8 md:p-12 ${dm ? 'bg-slate-800/30' : 'bg-white'}`}>
            <div className="mb-8"><Badge dm={dm}>Meet the Founder</Badge></div>

            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 lg:gap-16">

              {/* Photo column */}
              <div>
                {/*
                  ── FOUNDER PHOTO ──────────────────────────────────────
                  Replace the src below with your founder image path.
                  The image is displayed in a 3:3.5 aspect ratio container.
                  Recommended: WebP or JPEG, minimum 560×653px for sharpness.
                  ──────────────────────────────────────────────────────
                */}
                <div className={`relative rounded-xl overflow-hidden border shadow-sm mb-5 aspect-[3/3.5]
                  ${dm ? 'border-slate-600 bg-slate-700' : 'border-slate-200 bg-slate-100'}`}>
                  <Image
                    src="/founder-umashankar-ranksetu.webp"
                    alt="Umashankar, Founder and CEO of RankSetu - NEET UG Counselling Platform"
                    fill
                    sizes="(max-width: 768px) 90vw, 400px"
                    className="object-cover"
                    priority
                  />
                  {/* Subtle gradient at bottom for name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Name card below image */}
                <div className={`p-4 rounded-lg text-center border
                  ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`font-bold text-lg mb-1 ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>
                    UMASHANKAR
                  </p>
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
                    Founder &amp; CEO
                  </p>
                  <p className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                    RankSetu · Since 2024
                  </p>
                </div>
              </div>

              {/* Message column */}
              <div className="pt-2">
                <h2 className={`text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5
                  ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}
                  style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                  A Message from<br />the Founder
                </h2>
                <div className="w-16 h-0.5 rounded-full bg-[#1A3C6E] mb-6" />

                <div className={`pl-5 border-l-2 border-[#1A3C6E] mb-6 space-y-4`}>
                  {[
                    "RankSetu was built for every student who ever got lost in a government PDF at midnight, trying to understand if they have a chance at their dream college.",
                    "My vision is a platform that is 100% authentic, free, and intuitive. We don't just show data — we translate it into decisions you can trust.",
                    "Your dreams are entirely yours. The path to them is now ours to light.",
                  ].map((q, i) => (
                    <p key={i} className={`text-sm italic leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{q}"
                    </p>
                  ))}
                </div>

                {/* Founder signature card */}
                <div className={`flex items-center gap-4 p-4 rounded-xl mb-6 border
                  ${dm ? 'bg-[#1A3C6E]/5 border-[#1A3C6E]/20' : 'bg-[#1A3C6E]/5 border-[#1A3C6E]/15'}`}>
                  <div className="w-10 h-10 rounded-lg bg-[#1A3C6E] flex items-center justify-center text-white text-lg shadow-sm shrink-0">
                    ❤
                  </div>
                  <div>
                    <p className={`font-bold text-base ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>
                      Umashankar
                    </p>
                    <p className="text-sm font-medium text-[#2563EB]">
                      Founder, RankSetu — Empowering Every NEET Aspirant
                    </p>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-2">
                  {BADGES.map(b => (
                    <span key={b} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border
                      ${dm ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600'}
                    `}>
                      <IconCheck /> {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}