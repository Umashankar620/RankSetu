


'use client';

import React, { useState } from "react";

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

const IcCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
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
    {open ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
  </svg>
);

const MCC_SCOPE = [
  "15% All India Quota (AIQ) seats — MBBS/BDS in all Government Medical Colleges across India (J&K included from 2022)",
  "100% seats — All AIIMS campuses across India",
  "100% seats — JIPMER Puducherry & JIPMER Karaikal",
  "100% MBBS/BDS seats — Banaras Hindu University (BHU), Varanasi",
  "100% seats — Aligarh Muslim University (AMU), Aligarh",
  "85% of State Quota seats — Delhi University (UCMS), VMMC & Safdarjung Hospital, ABVIMS & RML Hospital",
  "85% of State Quota seats — IP University (GGSIPU) affiliated medical colleges in Delhi",
  "100% seats — Faculty of Dentistry, Jamia Millia Islamia + 5% internal Jamia student quota",
  "15% IP Quota seats — ESIC Medical Colleges across India",
  "100% seats — All Deemed Universities (both Govt. Deemed & private Deemed)",
];

export default function CutoffInfoBanner({ darkMode: dm = false, onLearnMore }) {
  const [scopeOpen, setScopeOpen] = useState(false);

  return (
    <div className="mt-8 space-y-5 font-sans">
      
      {/* ── 1. DATA AUTHENTICITY HIGHLIGHT ────────────────────────────── */}
      <div className={`rounded-lg border p-5 flex items-start gap-4
        ${dm ? 'bg-primary/5 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
        <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border
          ${dm ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-primary/10 border-primary/30 text-primary'}`}>
          <IcShield />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h3 className={`text-base md:text-lg font-bold ${dm ? 'text-white' : 'text-primary'}`}>
              100% Authentic Data — Directly from MCC Official Website
            </h3>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full border
              ${dm ? 'border-primary/40 bg-primary/15 text-primary' : 'border-primary/30 bg-primary/10 text-primary'}`}>
              ✓ Verified
            </span>
          </div>
          <p className={`text-sm leading-relaxed mb-4 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
            All Opening &amp; Closing Rank data shown on this website — year-wise and round-wise — has been 
            extracted directly from the <strong>official MCC (Medical Counselling Committee) seat allotment 
            result PDFs</strong> published on <strong>mcc.nic.in</strong>. These are the same PDFs released by 
            the Government of India after every counselling round. No estimates, no approximations — 
            this is the exact same data that MCC uses for seat allotment.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "📄 Source: mcc.nic.in",
              "📅 Years 2020–2024",
              "🔄 All Rounds (R1,R2,R3,Stray)",
              "🏥 AIQ + AIIMS + JIPMER + Deemed",
              "✓ Zero manual estimation",
            ].map(t => (
              <span key={t} className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-1 rounded-full border
                ${dm ? 'border-primary/30 bg-primary/5 text-primary' : 'border-primary/20 bg-primary/5 text-primary'}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. HOW OPEN QUOTA vs CATEGORY QUOTA WORKS ────────────────── */}
      <div className={`rounded-lg border overflow-hidden ${dm ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center gap-3 ${dm ? 'bg-primary/10 border-slate-700' : 'bg-primary/5 border-slate-100'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border
            ${dm ? 'border-primary/40 bg-primary/15 text-primary' : 'border-primary/30 bg-primary/10 text-primary'}`}>
            <IcLight />
          </div>
          <h3 className={`text-base md:text-lg font-bold ${dm ? 'text-white' : 'text-primary'}`}>
            How Open Seat Quota &amp; Category Quota Work
          </h3>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Step 1 - Open Quota */}
          <div className={`p-4 rounded-lg border-l-4 border-primary ${dm ? 'bg-slate-800/40 border-primary' : 'bg-slate-50 border-primary'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-bold uppercase tracking-wide px-2.5 py-1 rounded-full
                ${dm ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                Step 1
              </span>
              <span className={`text-sm font-bold ${dm ? 'text-primary' : 'text-primary'}`}>
                Open Seat Quota (SO)
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              MCC <strong>first tries to fill Open Seats</strong> (unrestricted seats available to any candidate regardless of category). 
              If your AIR qualifies for an Open Seat, you get it — your reserved category seat stays vacant for another candidate.
            </p>
          </div>

          {/* Step 2 - Category Quota */}
          <div className={`p-4 rounded-lg border-l-4 border-primary ${dm ? 'bg-slate-800/40 border-primary' : 'bg-slate-50 border-primary'}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-sm font-bold uppercase tracking-wide px-2.5 py-1 rounded-full
                ${dm ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                Step 2
              </span>
              <span className={`text-sm font-bold ${dm ? 'text-primary' : 'text-primary'}`}>
                Your Category Seat (OBC / SC / ST / EWS / PwD)
              </span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              If an Open Seat is <strong>not available at your AIR</strong>, MCC checks your reserved category seats. 
              Category closing ranks are always higher (more relaxed) than Open/UR ranks — meaning your actual chance 
              is often better than the Open rank suggests.
            </p>
          </div>

          {/* Pro Tip */}
          <div className={`p-4 rounded-lg border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
            <div className={`flex items-center gap-2 mb-2 ${dm ? 'text-primary' : 'text-primary'}`}>
              <span className="text-base">💡</span>
              <span className="text-sm font-bold uppercase tracking-wide">Critical Tip for Choice Filling</span>
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              <strong>Always fill your college choices in order of your genuine preference.</strong> MCC allocates 
              your highest-preference college where a seat is available (Open first, then Category). 
              Use the <strong>Category filter on this page</strong> to see actual closing ranks for your specific category.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. MCC SCOPE — WHAT SEATS DOES MCC HANDLE ─────────────────── */}
      <div className={`rounded-lg border overflow-hidden ${dm ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
        <button
          onClick={() => setScopeOpen(!scopeOpen)}
          className="w-full flex items-center justify-between gap-3 p-4 cursor-pointer bg-transparent border-none hover:bg-primary/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border
              ${dm ? 'border-primary/40 bg-primary/15 text-primary' : 'border-primary/30 bg-primary/10 text-primary'}`}>
              <IcInfo />
            </div>
            <h3 className={`text-base md:text-lg font-bold ${dm ? 'text-white' : 'text-primary'}`}>
              Which Seats Does MCC Handle? (UG Counselling Scope)
            </h3>
          </div>
          <IcChevron open={scopeOpen} />
        </button>

        {scopeOpen && (
          <div className={`p-5 border-t ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
            <p className={`text-sm mb-4 leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              MCC conducts centralised online counselling for the following seats:
            </p>
            <div className="space-y-2">
              {MCC_SCOPE.map((item, i) => (
                <div key={i} className={`flex gap-3 p-2 rounded ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}>
                  <span className={`w-6 h-6 rounded shrink-0 flex items-center justify-center text-sm font-bold border
                    ${dm ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                    {i + 1}
                  </span>
                  <span className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item}</span>
                </div>
              ))}
            </div>
            <div className={`text-xs mt-4 p-3 rounded leading-relaxed ${dm ? 'bg-primary/5 text-primary' : 'bg-primary/5 text-primary'}`}>
              <strong>Note:</strong> 85% State Quota seats of government colleges and 100% seats of private colleges 
              are handled by respective <strong>State/UT Counselling Authorities</strong>, not by MCC.
            </div>
          </div>
        )}
      </div>

      {/* ── 4. CTA — FULL GUIDE LINK ─────────────────────────────────── */}
      {onLearnMore && (
        <div className={`flex items-center justify-between flex-wrap gap-4 p-4 rounded-lg border
          ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div>
            <p className={`text-sm font-bold ${dm ? 'text-white' : 'text-primary'}`}>
              📖 Want to understand all Quotas, Categories &amp; Rounds in detail?
            </p>
            <p className={`text-xs mt-1 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              Read our complete MCC Counselling Guide — all quota codes, category benefits, and round-wise strategy explained.
            </p>
          </div>
          <button
            onClick={onLearnMore}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-interactive text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Read Full Guide <IcArrow />
          </button>
        </div>
      )}

    </div>
  );
}