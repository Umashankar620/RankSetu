'use client';

import React, { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────
const IC = {
  shield:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  book:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  users:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  trophy:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  info:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  check:   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  db:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  chevD:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  chevU:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  eye:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  back:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
};

// ── QUOTAS DATA (keep your original data) ─────────────────────────────
const QUOTAS = [
  {
    code: "AI", fullName: "All India Quota (AIQ)", tag: "Govt. Medical Colleges",
    seats: "15% of Govt. seats", shortDesc: "15% seats in all Government Medical/Dental Colleges across India.",
    who: "Any NEET-qualified student from any state in India. No domicile restriction.",
    rank: "All India Rank (AIR) from NEET.", note: "AIQ only covers 15% of government college seats.",
  },
  // ... add all your other quota items here
];

// ── CATEGORIES DATA (keep your original data) ─────────────────────────
const CATEGORIES = [
  {
    code: "UR", fullName: "Unreserved (Open / General)", reservation: "No reservation",
    shortDesc: "All seats that are NOT reserved for any category. Highest competition.",
    who: "Any NEET-qualified student from any category.", note: "UR seats = Open competition seats.",
  },
  // ... add all your other category items here
];

// ── ROUNDS DATA (keep your original data) ─────────────────────────────
const ROUNDS = [
  { num: "R1", name: "Round 1", purpose: "First round of counselling. Maximum seats available.",
    strategy: "If your AIR is strong, this is your most important round.",
    important: "After R1 allotment, you must pay the acceptance fee and report to the college." },
  { num: "R2", name: "Round 2", purpose: "Seats vacated after Round 1 + new additions.",
    strategy: "You can participate with your R1 seat still secured. You may get an upgrade.",
    important: "Participate even if you have a seat from R1 — you can only move up, not down." },
  { num: "R3", name: "Round 3 (Mop-Up)", purpose: "Final mopping up of all remaining vacant seats.",
    strategy: "Closing ranks can be more relaxed here. Candidates without any seat must participate.",
    important: "Joining in R3 is compulsory if allotted." },
  { num: "SV", name: "Stray Vacancy", purpose: "Absolute last round. Very small seat count.",
    strategy: "Monitor MCC website carefully. Sometimes good seats appear here.",
    important: "Final chance. No further rounds after this." },
];

// ══════════════════════════════════════════════════════════════════════
// Detail Modal
// ══════════════════════════════════════════════════════════════════════
function DetailModal({ item, dm, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded border shadow-xl
        ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
        <div className="h-1 rounded-t bg-primary" />
        <div className={`flex items-start justify-between gap-3 p-5 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-11 h-11 rounded shrink-0 flex items-center justify-center text-xs font-bold border
              ${dm ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}`}>
              {item.code?.substring(0, 3)}
            </div>
            <div>
              <div className={`text-base font-bold ${dm ? 'text-white' : 'text-primary'}`}>{item.code}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-text-body'}`}>{item.fullName}</div>
              <div className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border
                ${dm ? 'border-primary/40 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
                {item.tag || item.reservation}
              </div>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded border ${dm ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
            {IC.close}
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item.shortDesc}</p>
          <div className={`p-3 rounded border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-400' : 'text-text-body'}`}>👤 Who Can Apply</div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item.who}</p>
          </div>
          {item.note && (
            <div className={`p-3 rounded border ${dm ? 'border-accent/30 bg-accent/5' : 'border-accent/30 bg-accent/5'}`}>
              <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 text-accent`}>⚠ Important Note</div>
              <p className={`text-sm leading-relaxed text-accent`}>{item.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, dm }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className={`w-10 h-10 rounded shrink-0 flex items-center justify-center border
        ${dm ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}`}>
        {icon}
      </div>
      <div>
        <h2 className={`text-lg font-bold ${dm ? 'text-white' : 'text-primary'}`}>{title}</h2>
        <p className={`text-xs mt-1 leading-relaxed ${dm ? 'text-slate-400' : 'text-text-body'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

// ── Small Card ────────────────────────────────────────────────────────
function SmallCard({ item, type, dm, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => onClick(item)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`p-4 rounded border cursor-pointer transition-all
        ${hov ? (dm ? 'bg-slate-700 border-primary/50 -translate-y-0.5 shadow' : 'bg-slate-50 border-primary/40 -translate-y-0.5 shadow') 
              : (dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200')}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full border
          ${dm ? 'border-primary/40 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>{item.code}</span>
        <span className={`text-[10px] font-mono ${dm ? 'text-slate-400' : 'text-text-body'}`}>{type === "quota" ? item.seats : item.reservation}</span>
      </div>
      <p className={`text-sm font-bold mb-1 leading-tight ${dm ? 'text-white' : 'text-primary'}`}>{item.fullName}</p>
      <p className={`text-xs leading-relaxed mb-2 ${dm ? 'text-slate-400' : 'text-text-body'}`}>
        {item.shortDesc.length > 80 ? item.shortDesc.substring(0, 80) + "…" : item.shortDesc}
      </p>
      <div className={`flex items-center gap-1 text-[11px] font-bold text-primary`}>{IC.eye} View full details</div>
    </div>
  );
}

// ── Round Card ────────────────────────────────────────────────────────
function RoundCard({ round, dm }) {
  return (
    <div className={`rounded border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`p-3 border-b flex items-center gap-2 ${dm ? 'bg-primary/5 border-slate-700' : 'bg-primary/5 border-slate-100'}`}>
        <div className={`w-9 h-9 rounded flex items-center justify-center text-xs font-bold border
          ${dm ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-primary/10 border-primary/30 text-primary'}`}>{round.num}</div>
        <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-primary'}`}>{round.name}</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-500' : 'text-text-body'}`}>What Happens</div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{round.purpose}</p>
        </div>
        <div className={`p-2 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wide mb-1 text-primary`}>💡 Strategy</div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{round.strategy}</p>
        </div>
        <div className={`p-2 rounded border ${dm ? 'border-accent/30 bg-accent/5' : 'border-accent/30 bg-accent/5'}`}>
          <p className={`text-xs leading-relaxed text-accent`}>⚠ {round.important}</p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function CounsellingGuidePage({ darkMode: dm = false, setCurrentView }) {
  const [modal, setModal] = useState(null);
  const openModal = (item) => setModal(item);
  const closeModal = () => setModal(null);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: dm ? '#0a0f19' : '#f9fafc' }}>
      {modal && <DetailModal item={modal} dm={dm} onClose={closeModal} />}
      
      <div className="max-w-6xl mx-auto px-5 py-8 pb-20">
        
        {/* PAGE HEADER */}
        <div className="mb-8">
          {setCurrentView && (
            <button onClick={() => setCurrentView("analytics")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 hover:text-primary transition-colors">
              {IC.back} Back to Cutoff Data
            </button>
          )}
          
          <div className={`relative rounded border p-6 md:p-8 overflow-hidden
            ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border mb-3
                  ${dm ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
                  {IC.shield} MCC Official Guide
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${dm ? 'text-white' : 'text-primary'}`}>
                  NEET UG Counselling — <span className="text-accent">Complete Guide</span>
                </h1>
                <p className={`text-sm mt-2 max-w-xl leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                  Every quota code, category benefit, and round strategy — explained in simple English with real numbers.
                  All data sourced from MCC's official information brochures and seat allotment PDFs (mcc.nic.in).
                </p>
              </div>
              <div className={`p-3 rounded border shrink-0 ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
                {["Source: mcc.nic.in", "Updated for 2024 Counselling", "All Rounds Covered", "All Quota Codes Explained"].map(t => (
                  <div key={t} className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-accent">{IC.check}</span>
                    <span className={dm ? 'text-slate-300' : 'text-text-body'}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* SECTION 1: MCC SCOPE */}
        <div className="mb-8">
          <SectionHeader icon={IC.db} title="What Does MCC Handle? — UG Counselling Scope"
            subtitle="MCC (Medical Counselling Committee) under DGHS conducts centralised online counselling for these seats" dm={dm} />
          
          <div className={`rounded border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            {[
              "15% All India Quota (AIQ) seats — MBBS/BDS in Government Medical Colleges across all states and UTs.",
              "100% MBBS/BDS seats — All 15 AIIMS campuses across India (Institutes of National Importance).",
              "100% seats — JIPMER Puducherry and JIPMER Karaikal (Institutes of National Importance).",
              "100% MBBS/BDS seats — Banaras Hindu University (BHU), Varanasi.",
              "100% MBBS/BDS seats — Aligarh Muslim University (AMU), Aligarh.",
              "85% of State Quota seats — Delhi University affiliated colleges (UCMS Delhi), VMMC & Safdarjung Hospital.",
              "85% of State Quota seats — IP University (GGSIPU) affiliated medical colleges in Delhi.",
              "100% seats — Faculty of Dentistry, Jamia Millia Islamia (New Delhi).",
              "15% IP Quota seats — ESIC Medical Colleges across India.",
              "100% seats — All Deemed Universities across India.",
            ].map((text, i) => (
              <div key={i} className={`flex gap-3 p-4 ${i < 9 ? `border-b ${dm ? 'border-slate-700' : 'border-slate-100'}` : ''}
                ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}>
                <span className={`w-7 h-7 rounded shrink-0 flex items-center justify-center text-[11px] font-bold border
                  ${dm ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-primary/10 border-primary/20 text-primary'}`}>{i+1}</span>
                <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{text}</p>
              </div>
            ))}
            <div className={`p-3 border-t ${dm ? 'border-accent/30 bg-accent/5' : 'border-accent/30 bg-accent/5'}`}>
              <p className={`text-xs leading-relaxed text-accent`}>
                <strong>Note:</strong> The remaining 85% State Quota seats of Government Medical Colleges are handled by respective State/UT Counselling Authorities — not by MCC.
              </p>
            </div>
          </div>
        </div>
        
        {/* SECTION 2: OPEN vs CATEGORY SEAT */}
        <div className="mb-8">
          <SectionHeader icon={IC.book} title="Open Seat vs Category Seat — How Allotment Actually Works"
            subtitle="This is the most important concept for choice filling strategy" dm={dm} />
          
          <div className="space-y-4">
            <div className={`rounded border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`p-3 border-b flex items-center gap-2 ${dm ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
                <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold bg-primary/10 text-primary`}>1</span>
                <span className={`text-sm font-bold text-primary`}>MCC Checks Open Seats First</span>
              </div>
              <div className="p-4">
                <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                  When allocating your seat, MCC first checks if an <strong>Open Seat (unrestricted seat)</strong> is available 
                  at your AIR. An Open Seat can be taken by any eligible candidate regardless of category.
                </p>
                <div className={`p-3 rounded border ${dm ? 'bg-primary/5 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
                  <p className={`text-sm leading-relaxed text-primary`}>
                    <strong>If you get an Open Seat:</strong> Your reserved category seat remains vacant for another candidate from your category.
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`rounded border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`p-3 border-b flex items-center gap-2 ${dm ? 'bg-accent/10 border-accent/30' : 'bg-accent/5 border-accent/20'}`}>
                <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold bg-accent/10 text-accent`}>2</span>
                <span className={`text-sm font-bold text-accent`}>If No Open Seat — Your Reserved Category is Checked</span>
              </div>
              <div className="p-4">
                <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                  If an Open Seat is not available, MCC checks your reserved category seat. Category closing ranks are always higher (more relaxed) than Open seats.
                </p>
                <div className={`p-3 rounded border ${dm ? 'bg-accent/5 border-accent/30' : 'bg-accent/5 border-accent/20'}`}>
                  <p className={`text-sm leading-relaxed text-accent`}>
                    <strong>Example:</strong> Open closing rank = AIR 1,800 | OBC-NCL = AIR 4,500 | SC = AIR 14,000 | ST = AIR 38,000.
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
              <div className={`text-[11px] font-bold uppercase tracking-wide mb-2 text-primary`}>💡 Critical Tip for Choice Filling</div>
              <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                <strong>Fill choices in order of your genuine preference.</strong> Use the Category filter on the Cutoff Data page to see actual closing ranks for your category.
              </p>
            </div>
          </div>
        </div>
        
        {/* SECTION 3: QUOTA CODES */}
        <div className="mb-8">
          <SectionHeader icon={IC.trophy} title="All Quota Codes Explained"
            subtitle={`${QUOTAS.length} quota types from MCC official seat allotment PDFs`} dm={dm} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUOTAS.map(q => <SmallCard key={q.code} item={q} type="quota" dm={dm} onClick={openModal} />)}
          </div>
        </div>
        
        {/* SECTION 4: CATEGORIES */}
        <div className="mb-8">
          <SectionHeader icon={IC.users} title="Category Reservation — Benefits & Real Numbers"
            subtitle={`${CATEGORIES.length} categories — how reservation helps`} dm={dm} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(c => <SmallCard key={c.code} item={c} type="category" dm={dm} onClick={openModal} />)}
          </div>
        </div>
        
        {/* SECTION 5: ROUNDS */}
        <div className="mb-8">
          <SectionHeader icon={IC.trophy} title="Counselling Rounds — Strategy for Each Round"
            subtitle="MCC AIQ counselling has 4 rounds. Understanding each round helps you plan." dm={dm} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROUNDS.map(r => <RoundCard key={r.num} round={r} dm={dm} />)}
          </div>
        </div>
        
        {/* SECTION 6: DATA DISCLAIMER */}
        <div className={`p-5 rounded border flex items-start gap-4 ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className={`w-10 h-10 rounded shrink-0 flex items-center justify-center border
            ${dm ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-primary/10 border-primary/30 text-primary'}`}>
            {IC.shield}
          </div>
          <div>
            <div className={`text-sm font-bold mb-2 text-primary`}>About Our Data — Accuracy & Sources</div>
            <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              All data is sourced directly from official MCC seat allotment result PDFs published on mcc.nic.in — no estimation or approximation.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Source: mcc.nic.in", "No estimation", "Years 2020-2024", "Round-wise data", "Category-wise data"].map(item => (
                <span key={item} className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border
                  ${dm ? 'border-primary/30 bg-primary/5 text-primary' : 'border-primary/20 bg-primary/5 text-primary'}`}>
                  <span className="text-accent">{IC.check}</span> {item}
                </span>
              ))}
            </div>
            <p className={`text-xs italic leading-relaxed ${dm ? 'text-slate-400' : 'text-text-body'}`}>
              Always refer to the latest official MCC Information Brochure on mcc.nic.in for current year's rules.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}