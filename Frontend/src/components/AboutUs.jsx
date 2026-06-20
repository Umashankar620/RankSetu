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
  const count = useCountUp(value, active);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div className={`flex-1 min-w-[130px] p-6 pb-5 text-center relative overflow-hidden transition-all duration-300 border
      ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}
    `}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
      <div className="text-3xl font-bold tracking-tight text-primary mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wide text-text-body">
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
      className={`p-6 rounded border transition-all duration-200 cursor-default
        ${dm ? 'bg-slate-800/30 border-slate-700 hover:border-primary/50 hover:bg-slate-800/50' : 'bg-white border-slate-200 hover:border-primary/30 hover:bg-slate-50'}
        ${hov ? '-translate-y-0.5 shadow-md' : ''}
      `}>
      <div className={`w-12 h-12 rounded flex items-center justify-center mb-4 transition-colors
        ${dm ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary'}
      `}>
        <IconComponent className="w-5 h-5" />
      </div>
      <h4 className={`font-bold text-base mb-2 ${dm ? 'text-white' : 'text-primary'}`}>{title}</h4>
      <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{desc}</p>
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
            ? 'bg-primary border-primary text-white' 
            : (dm ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600')
          }
        `}>
          <span className="font-bold text-base">{num}</span>
        </div>
        {!last && (
          <div className={`w-px flex-1 min-h-8 mt-2 transition-all
            ${isActive ? 'bg-primary' : (dm ? 'bg-slate-700' : 'bg-slate-200')}
          `} />
        )}
      </div>
      <div className={`flex-1 ${last ? '' : 'pb-6'} pt-2`}>
        <h4 className={`font-bold text-base mb-1.5 transition-colors
          ${isActive ? 'text-primary' : (dm ? 'text-slate-300' : 'text-slate-700')}
        `}>{title}</h4>
        <p className={`text-sm leading-relaxed transition-all duration-300
          ${isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
          ${dm ? 'text-slate-400' : 'text-text-body'}
        `}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, dm }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border
      ${dm ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}
    `}>
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

// ─── Section Title (single heading color, no accent in text) ──────────────────
function SectionTitle({ eyebrow, title, highlight, subtitle, dm, center = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : 'text-left'}`}>
      <div className="mb-3"><Badge dm={dm}>{eyebrow}</Badge></div>
      <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-3
        ${dm ? 'text-white' : 'text-primary'}
      `}>
        {title} {highlight && <span>{highlight}</span>}
      </h2>
      {subtitle && (
        <p className={`text-base max-w-lg ${center ? 'mx-auto' : ''} ${dm ? 'text-slate-300' : 'text-text-body'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AboutUs({ darkMode: dm = false }) {
  const [statsRef, statsVis] = useVisible();
  const [activeStep, setActiveStep] = useState(0);

  // Simple inline SVG icons
  const IconHeart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
  const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
  const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  const IconShield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
  const IconBar = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20V14"/></svg>;
  const IconTarget = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
  const IconFile = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>;
  const IconZap = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
  const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: dm ? '#0a0f19' : '#f9fafc' }}>
      <div className="max-w-6xl mx-auto px-6 pb-24">

        {/* ══════ MISSION BANNER ════════════════════════════════════════════ */}
        <div className={`mb-9 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className="p-5 md:px-8 flex items-center gap-5 flex-wrap">
            <div className="w-12 h-12 rounded bg-primary flex items-center justify-center text-white text-xl shadow-sm">
              ⚡
            </div>
            <p className={`text-base md:text-lg font-medium leading-relaxed flex-1 ${dm ? 'text-slate-200' : 'text-text-body'}`}>
              Our Mission — <em className="italic">Quality guidance is a right, not a privilege.</em>{" "}
              Every feature on <span className="font-bold text-accent">RankSetu</span> is{" "}
              <span className="font-bold text-accent">free, forever.</span>
            </p>
          </div>
        </div>

        {/* ══════ WHY RANKSETU ═════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionTitle
            eyebrow="Our Commitment"
            title="Why Choose"
            highlight="RankSetu?"
            subtitle="We bridge the gap between complex government data and student needs — here's what sets us apart."
            dm={dm}
          />
          <div className="au-grid">
            {FEATURES.map((f, idx) => <FeatureCard key={idx} {...f} dm={dm} />)}
          </div>
        </div>

        {/* ══════ HOW IT WORKS ══════════════════════════════════════════════ */}
        <div className={`p-8 md:p-12 rounded-lg mb-14 border shadow-sm
          ${dm ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}
        `}>
          <div className="au-two">
            <div>
              <SectionTitle
                eyebrow="Our Process"
                title="From Rank"
                highlight="to Reality."
                subtitle="Four steps that turn counselling complexity into clarity, and confusion into confidence."
                dm={dm}
              />
              <div className={`p-4 rounded border-l-4 border-primary ${dm ? 'bg-primary/5 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
                <p className={`text-sm italic leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                  "Choosing the right order of preferences is the real game of counselling — and it's where most students lose their dream seat."
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1 rounded-sm cursor-pointer transition-all flex-1 ${i === activeStep ? 'bg-primary' : (dm ? 'bg-slate-600' : 'bg-slate-200')}`}
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

        {/* ══════ FOUNDER SECTION ═══════════════════════════════════════════ */}
        <div className={`rounded-lg overflow-hidden border shadow-sm ${dm ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="h-1 bg-primary" />

          <div className={`p-8 md:p-12 ${dm ? 'bg-slate-800/30' : 'bg-white'}`}>
            <div className="mb-8"><Badge dm={dm}>Meet the Founder</Badge></div>

            <div className="au-founder-layout">
              {/* Photo column */}
              <div>
                <div className={`relative rounded-lg overflow-hidden border shadow-sm mb-5 aspect-[3/3.5] ${dm ? 'border-slate-600' : 'border-slate-200'} bg-slate-100 dark:bg-slate-700`}>
                  <Image
                    src="/founder-umashankar-ranksetu.webp"
                    alt="Umashankar, Founder and CEO of RankSetu - NEET UG Counselling Platform"
                    fill
                    sizes="(max-width: 768px) 90vw, 400px"
                    className="object-cover"
                    priority
                  />
                </div>
                <div className={`p-4 rounded text-center border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`font-bold text-lg mb-1 ${dm ? 'text-white' : 'text-primary'}`}>UMASHANKAR</p>
                  <p className={`text-sm font-semibold uppercase tracking-wide text-accent`}>Founder & CEO</p>
                </div>
              </div>

              {/* Message column */}
              <div className="pt-2">
                <h2 className={`text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-5 ${dm ? 'text-white' : 'text-primary'}`}>
                  A Message from the Founder
                </h2>
                <div className="w-16 h-0.5 rounded-full bg-primary mb-6" />

                <div className={`pl-5 border-l-2 border-primary mb-6 space-y-3`}>
                  {[
                    "RankSetu was built for every student who ever got lost in a government PDF at midnight, trying to understand if they have a chance at their dream college.",
                    "My vision is a platform that is 100% authentic, free, and intuitive. We don't just show data — we translate it into decisions you can trust.",
                    "Your dreams are entirely yours. The path to them is now ours to light.",
                  ].map((q, i) => (
                    <p key={i} className={`text-sm italic leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                      "{q}"
                    </p>
                  ))}
                </div>

                <div className={`flex items-center gap-4 p-4 rounded-lg mb-6 border ${dm ? 'bg-primary/5 border-primary/20' : 'bg-primary/5 border-primary/20'}`}>
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white text-lg shadow-sm">
                    ❤
                  </div>
                  <div>
                    <p className={`font-bold text-base ${dm ? 'text-white' : 'text-primary'}`}>Umashankar</p>
                    <p className={`text-sm font-medium text-accent`}>Founder, RankSetu — Empowering Every NEET Aspirant</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {BADGES.map(b => (
                    <span key={b} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border
                      ${dm ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-text-body'}
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