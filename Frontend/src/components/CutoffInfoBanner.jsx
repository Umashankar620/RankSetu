'use client';

import React, { useState } from 'react';

// ── Icons ────────────────────────────────────────────────────────────────
const IcShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IcInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);
const IcArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcLight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IcChevron = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    {open
      ? <polyline points="18 15 12 9 6 15"/>
      : <polyline points="6 9 12 15 18 9"/>}
  </svg>
);

const MCC_SCOPE = [
  '15% All India Quota (AIQ) seats — MBBS/BDS in all Government Medical Colleges across India (J&K included from 2022)',
  '100% seats — All AIIMS campuses across India',
  '100% seats — JIPMER Puducherry & JIPMER Karaikal',
  '100% MBBS/BDS seats — Banaras Hindu University (BHU), Varanasi',
  '100% seats — Aligarh Muslim University (AMU), Aligarh',
  '85% of State Quota seats — Delhi University (UCMS), VMMC & Safdarjung Hospital, ABVIMS & RML Hospital',
  '85% of State Quota seats — IP University (GGSIPU) affiliated medical colleges in Delhi',
  '100% seats — Faculty of Dentistry, Jamia Millia Islamia + 5% internal Jamia student quota',
  '15% IP Quota seats — ESIC Medical Colleges across India',
  '100% seats — All Deemed Universities (both Govt. Deemed & private Deemed)',
];

// Brand colors as inline styles (avoids Tailwind purge issues with dynamic classes)
const brand = {
  primary:     '#1A3C6E',
  interactive: '#2563EB',
};

// Dark-mode-safe accent helpers — navy/interactive blue read poorly as TEXT on dark
// backgrounds, so dark mode swaps in lighter, higher-contrast blues for any
// foreground (text/icon/border) use, while light mode keeps the original brand colors.
const accent  = (dm) => (dm ? '#7DB8FF' : brand.primary);
const accent2 = (dm) => (dm ? '#93C5FD' : brand.interactive);

export default function CutoffInfoBanner({ darkMode: dm = false, onLearnMore }) {
  const [scopeOpen, setScopeOpen] = useState(false);

  // Reusable token helpers
  const iconBox = `w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border`;
  const sectionCard = `rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`;

  return (
    <div className="mt-8 space-y-5 font-sans">

      {/* ── 1. DATA AUTHENTICITY ───────────────────────────────────────── */}
      <div
        className={`rounded-xl border p-5 flex items-start gap-4 ${dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white shadow-sm'}`}
        style={{ borderLeft: `3px solid ${accent(dm)}` }}
      >
        <div
          className={`${iconBox}`}
          style={{
            backgroundColor: dm ? 'rgba(26,60,110,0.2)' : 'rgba(26,60,110,0.08)',
            borderColor:     dm ? 'rgba(26,60,110,0.4)' : 'rgba(26,60,110,0.2)',
            color: accent(dm),
          }}
        >
          <IcShield />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
              100% Authentic Data — Directly from MCC Official Website
            </h3>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: dm ? 'rgba(26,60,110,0.2)' : 'rgba(26,60,110,0.08)',
                borderColor:     dm ? 'rgba(26,60,110,0.4)' : 'rgba(26,60,110,0.2)',
                color: accent(dm),
              }}
            >
              ✓ Verified
            </span>
          </div>
          <p className={`text-sm leading-relaxed mb-4 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            All Opening &amp; Closing Rank data shown on this website — year-wise and round-wise — has been
            extracted directly from the <strong className={dm ? 'text-white' : 'text-slate-900'}>official MCC seat allotment result PDFs</strong> published
            on <strong className={dm ? 'text-white' : 'text-slate-900'}>mcc.nic.in</strong>. No estimates, no approximations — this is the exact same
            data that MCC uses for seat allotment.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              '📄 Source: mcc.nic.in',
              '📅 Years 2020–2025',
              '🔄 All Rounds (R1, R2, R3, Stray)',
              '🏥 AIQ + AIIMS + JIPMER + Deemed',
              '✓ Zero manual estimation',
            ].map((t) => (
              <span
                key={t}
                className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${dm ? 'border-slate-600 bg-slate-700/50 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. HOW OPEN QUOTA vs CATEGORY QUOTA WORKS ────────────────── */}
      <div className={sectionCard}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center gap-3 ${dm ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
          <div
            className={iconBox}
            style={{
              backgroundColor: dm ? 'rgba(26,60,110,0.2)' : 'rgba(26,60,110,0.08)',
              borderColor:     dm ? 'rgba(26,60,110,0.4)' : 'rgba(26,60,110,0.2)',
              color: accent(dm),
            }}
          >
            <IcLight />
          </div>
          <h3 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
            How Open Seat Quota &amp; Category Quota Work
          </h3>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Step 1 */}
          <div
            className={`p-4 rounded-xl border-l-4 ${dm ? 'bg-slate-800/40' : 'bg-slate-50'}`}
            style={{ borderLeftColor: accent(dm) }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ backgroundColor: dm ? 'rgba(59,130,246,0.18)' : 'rgba(26,60,110,0.12)', color: accent(dm) }}
              >
                Step 1
              </span>
              <span className={`text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
                Open Seat Quota (SO)
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              MCC <strong className={dm ? 'text-white' : 'text-slate-900'}>first tries to fill Open Seats</strong> — unrestricted seats available to any candidate regardless of category.
              If your AIR qualifies for an Open Seat, you get it, and your reserved category seat stays vacant for another candidate.
            </p>
          </div>

          {/* Step 2 */}
          <div
            className={`p-4 rounded-xl border-l-4 ${dm ? 'bg-slate-800/40' : 'bg-slate-50'}`}
            style={{ borderLeftColor: accent2(dm) }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className="text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ backgroundColor: dm ? 'rgba(96,165,250,0.18)' : 'rgba(37,99,235,0.1)', color: accent2(dm) }}
              >
                Step 2
              </span>
              <span className={`text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
                Your Category Seat (OBC / SC / ST / EWS / PwD)
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              If an Open Seat is <strong className={dm ? 'text-white' : 'text-slate-900'}>not available at your AIR</strong>, MCC checks your reserved category seats.
              Category closing ranks are always higher (more relaxed) than Open/UR ranks — your actual chance is often better than the Open rank suggests.
            </p>
          </div>

          {/* Pro Tip */}
          <div className={`p-4 rounded-xl border ${dm ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
            <div className={`flex items-center gap-2 mb-2 font-black text-sm ${dm ? 'text-amber-400' : 'text-amber-800'}`}>
              <span>💡</span>
              Critical Tip for Choice Filling
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-amber-200/80' : 'text-amber-900'}`}>
              <strong>Always fill your college choices in order of your genuine preference.</strong> MCC allocates
              your highest-preference college where a seat is available (Open first, then Category).
              Use the <strong>Category filter</strong> on this page to see actual closing ranks for your specific category.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. MCC SCOPE ─────────────────────────────────────────────── */}
      <div className={sectionCard}>
        <button
          onClick={() => setScopeOpen(!scopeOpen)}
          className={`w-full flex items-center justify-between gap-3 p-4 cursor-pointer border-none transition-colors
            ${dm ? 'text-white hover:bg-slate-700/30' : 'text-slate-900 hover:bg-slate-50'}`}
          style={{ background: 'transparent' }}
        >
          <div className="flex items-center gap-3">
            <div
              className={iconBox}
              style={{
                backgroundColor: dm ? 'rgba(26,60,110,0.2)' : 'rgba(26,60,110,0.08)',
                borderColor:     dm ? 'rgba(26,60,110,0.4)' : 'rgba(26,60,110,0.2)',
                color: accent(dm),
              }}
            >
              <IcInfo />
            </div>
            <h3 className={`text-base font-black text-left ${dm ? 'text-white' : 'text-slate-900'}`}>
              Which Seats Does MCC Handle? (UG Counselling Scope)
            </h3>
          </div>
          <span className={dm ? 'text-slate-400' : 'text-slate-500'}>
            <IcChevron open={scopeOpen} />
          </span>
        </button>

        {scopeOpen && (
          <div className={`p-5 border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
            <p className={`text-sm mb-4 leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              MCC conducts centralised online counselling for the following seats:
            </p>
            <div className="space-y-2">
              {MCC_SCOPE.map((item, i) => (
                <div
                  key={i}
                  className={`flex gap-3 p-2.5 rounded-lg ${
                    i % 2 === 1
                      ? (dm ? 'bg-slate-800/40' : 'bg-slate-50')
                      : ''
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-xs font-black border mt-0.5"
                    style={{
                      backgroundColor: dm ? 'rgba(26,60,110,0.2)' : 'rgba(26,60,110,0.08)',
                      borderColor:     dm ? 'rgba(26,60,110,0.4)' : 'rgba(26,60,110,0.2)',
                      color: accent(dm),
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{item}</span>
                </div>
              ))}
            </div>
            <div
              className={`text-xs mt-4 p-3 rounded-lg leading-relaxed ${dm ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}
            >
              <strong className={dm ? 'text-slate-300' : 'text-slate-700'}>Note:</strong> 85% State Quota seats of government colleges and 100% seats of private colleges
              are handled by respective <strong className={dm ? 'text-slate-300' : 'text-slate-700'}>State/UT Counselling Authorities</strong>, not by MCC.
            </div>
          </div>
        )}
      </div>

      {/* ── 4. CTA ───────────────────────────────────────────────────── */}
      {onLearnMore && (
        <div
          className={`flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl border ${dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white shadow-sm'}`}
        >
          <div>
            <p className={`text-sm font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
              📖 Want to understand all Quotas, Categories &amp; Rounds in detail?
            </p>
            <p className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              Read our complete MCC Counselling Guide — all quota codes, category benefits, and round-wise strategy explained.
            </p>
          </div>
          <button
            onClick={onLearnMore}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 shrink-0"
            style={{ backgroundColor: brand.primary }}
          >
            Read Full Guide <IcArrow />
          </button>
        </div>
      )}
    </div>
  );
}