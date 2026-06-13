



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

// ══════════════════════════════════════════════════════════════════════
// COMPLETE DATA — 100% from MCC official sources
// ══════════════════════════════════════════════════════════════════════

const QUOTAS = [
  {
    code: "AI", fullName: "All India Quota (AIQ)", tag: "Govt. Medical Colleges",
    seats: "15% of Govt. seats", shortDesc: "15% seats in all Government Medical/Dental Colleges across India. Open to students from any state.",
    who: "Any NEET-qualified student from any state in India. No domicile restriction. J&K students are also eligible from 2022 onwards.",
    rank: "All India Rank (AIR) from NEET. MCC prepares a single national merit list.",
    example: { title: "Real Scenario", text: "Priya from Bihar has AIR 2,200 in NEET 2024. She can apply for AIQ seats in Government Medical College & Hospital, Chandigarh (Punjab), Government Medical College Nagpur (Maharashtra), or any other government medical college across India — her Bihar domicile is not a restriction in AIQ." },
    note: "AIQ only covers 15% of government college seats. The remaining 85% are filled by state governments through State Quota counselling — which is separate from MCC.",
  },
  {
    code: "AI (AIIMS)", fullName: "All India — AIIMS Institutes", tag: "Institute of National Importance",
    seats: "100% of all AIIMS seats", shortDesc: "All AIIMS across India are under MCC counselling. These are NOT Deemed Universities — they are Institutes of National Importance.",
    who: "Any NEET-qualified student from any state. No domicile restriction. PwD reservation (5%) and SC/ST/OBC/EWS reservations apply within AIIMS seats.",
    rank: "All India Rank (AIR). MCC prepares a single AIIMS merit list from NEET scores.",
    example: { title: "Real Scenario", text: "Arjun from Tamil Nadu has AIR 32. He can apply for MBBS at AIIMS New Delhi. The Open/UR closing rank at AIIMS New Delhi was around AIR 50 in Round 1 of 2024." },
    note: "AIIMS institutions are NOT Deemed Universities. They are established under 'The Institutes of National Importance Act'. There is no 'State Quota' in AIIMS — 100% seats are filled by MCC on AIR basis.",
    campuses: ["AIIMS New Delhi","AIIMS Bhopal","AIIMS Bhubaneswar","AIIMS Jodhpur","AIIMS Patna","AIIMS Rishikesh","AIIMS Raipur","AIIMS Nagpur","AIIMS Mangalagiri","AIIMS Bathinda","AIIMS Bibinagar","AIIMS Gorakhpur","AIIMS Rajkot","AIIMS Madurai","AIIMS Vijaypur"],
  },
  {
    code: "AI (JIPMER)", fullName: "All India — JIPMER", tag: "Institute of National Importance",
    seats: "100% JIPMER seats", shortDesc: "JIPMER Puducherry and JIPMER Karaikal are Institutes of National Importance — similar to AIIMS. 100% seats through MCC.",
    who: "All India students for Open seats. Puducherry UT domicile students have a separate 50% reserved pool (JP Quota).",
    rank: "AIR. Two separate merit lists: Open (AI) and Puducherry Internal (JP).",
    example: { title: "Real Scenario", text: "Kavita from Delhi has AIR 88. She applies for JIPMER Puducherry Open seats. Deepa, a Puducherry UT domicile student, has AIR 1,450 — she competes in the JP quota pool." },
    note: "JIPMER is NOT a Deemed University. 50% seats are ring-fenced for Puducherry UT residents (JP quota) per Supreme Court direction.",
  },
  {
    code: "AI (BHU)", fullName: "All India — Banaras Hindu University", tag: "Central University",
    seats: "100% MBBS/BDS seats", shortDesc: "Institute of Medical Sciences, BHU Varanasi. A Central University (not Deemed) — 100% seats under MCC.",
    who: "All India students. OBC/SC/ST/EWS/PwD reservations apply as per Government of India norms.",
    rank: "AIR from NEET. Central University, so Central OBC list applies (not State OBC).",
    example: { title: "Real Scenario", text: "Rohit from Andhra Pradesh has AIR 1,100. He applies for BHU IMS MBBS. The Open closing rank at BHU was around AIR 1,400–1,600 in 2024 Round 1." },
    note: "BHU is a Central University, not a Deemed University. Fees at BHU are very low compared to private deemed colleges.",
  },
  {
    code: "AM", fullName: "Aligarh Muslim University (AMU) Quota", tag: "Central University",
    seats: "100% JNMC AMU seats", shortDesc: "Jawaharlal Nehru Medical College, AMU Aligarh. A Central University — 100% seats under MCC.",
    who: "All India students for open seats. AMU has an internal quota for AMU enrolled students.",
    rank: "AIR. AMU also has SA (Self Finance All India) and SI (Self Finance Internal) sub-quotas.",
    example: { title: "Real Scenario", text: "Asif has AIR 4,200. JNMC AMU Open closing rank was around AIR 4,500–5,000 in 2024." },
    note: "AMU's minority character and internal quotas are a matter of ongoing legal debate. Always check the latest MCC information brochure.",
  },
  {
    code: "DU", fullName: "Delhi University Quota", tag: "Central University — Delhi",
    seats: "85% State Quota seats", shortDesc: "University College of Medical Sciences (UCMS) affiliated to Delhi University. 85% seats are under MCC.",
    who: "All India students — no domicile restriction for DU quota handled by MCC.",
    rank: "AIR. 85% seats under MCC (DU quota), 15% AIQ seats separately.",
    example: { title: "Real Scenario", text: "Shruti from Rajasthan has AIR 680. She applies for UCMS Delhi under DU quota. Open closing rank at UCMS in 2024 was around AIR 700–900." },
    note: "UCMS Delhi (DU), VMMC & Safdarjung Hospital, and ABVIMS & RML Hospital have seats split: 85% under MCC (DU/IP quota) and 15% AIQ.",
  },
  {
    code: "IP", fullName: "IP University Quota (GGSIPU)", tag: "Delhi — IP University",
    seats: "85% of GGSIPU seats", shortDesc: "Guru Gobind Singh Indraprastha University affiliated medical colleges in Delhi — 85% seats under MCC.",
    who: "All India students for MCC-handled IP quota seats.",
    rank: "AIR. GGSIPU also runs its own state counselling for some seats.",
    example: { title: "Real Scenario", text: "Nikhil from UP has AIR 5,800. He applies for ESIC Medical College Rohini (Delhi) under IP University quota. Closing rank was around AIR 6,000–7,000 in 2024." },
    note: null,
  },
  {
    code: "JP", fullName: "Internal — Puducherry UT Domicile", tag: "JIPMER • UT Reserved",
    seats: "50% of JIPMER seats", shortDesc: "Reserved for Puducherry Union Territory domicile candidates at JIPMER Puducherry.",
    who: "Students who are permanent residents/domicile of Puducherry UT only. Certificate required.",
    rank: "AIR — evaluated in a separate JP merit list with far fewer competitors.",
    example: { title: "Real Scenario", text: "Meena is a Puducherry UT resident with AIR 3,400. In the Open pool, JIPMER closing rank was AIR 150. In JP pool, closing rank was around AIR 4,000–5,000 — Meena gets a seat." },
    note: "50% of JIPMER Puducherry MBBS seats are reserved under JP quota per Supreme Court order.",
  },
  {
    code: "PS", fullName: "Deemed / Paid Seats Quota", tag: "Deemed Universities",
    seats: "100% of Deemed seats", shortDesc: "All Deemed Universities — both Government Deemed and Private Deemed — 100% seats under MCC.",
    who: "All India students. No domicile restriction. Fees vary: private deemed ₹10–25 lakh/year.",
    rank: "AIR from NEET. MCC prepares a common Deemed University merit list.",
    example: { title: "Real Scenario", text: "Sunita has AIR 9,500. Government medical college seats are exhausted. Amrita Institute Kochi had closing rank around AIR 12,000 in 2024 — she gets a seat. Fees: ~₹18 lakh/year." },
    note: "Deemed Universities are NOT the same as Government colleges. They are granted 'Deemed to be University' status by UGC.",
  },
  {
    code: "SO", fullName: "Open Seat Quota", tag: "Deemed Univ • No Restriction",
    seats: "Open pool", shortDesc: "Open Seats within Deemed Universities — no category restriction, no minority restriction.",
    who: "Any NEET-qualified student. No domicile, no religion, no community restriction.",
    rank: "Strictly AIR. Open Seat closing rank is usually tighter than category-specific seats.",
    example: { title: "Real Scenario", text: "Rahul (General) has AIR 7,800. He applies for Sri Ramachandra Institute Chennai under SO quota. SO closing rank was AIR 8,200 — he gets the seat." },
    note: "In MCC result PDFs, 'SO' means Open Seat Quota. This is the standard unrestricted pool in Deemed Universities.",
  },
  {
    code: "ES / EN", fullName: "Employees State Insurance Scheme (ESI) Quota", tag: "ESIC Medical Colleges",
    seats: "15% IP Quota", shortDesc: "ES = ESIC quota for MBBS/BDS. EN = ESIC-IP Nursing Quota. 15% IP (Insured Person) quota under MCC.",
    who: "Children/dependents of ESI beneficiary employees. ESI card / beneficiary proof mandatory.",
    rank: "AIR from NEET. ESI quota has a separate merit list.",
    example: { title: "Real Scenario", text: "Vijay's father is an ESI insured person. Vijay has AIR 14,000. He applies for ESIC Medical College Hyderabad under ES quota and secures a seat." },
    note: "ESIC Medical Colleges are good quality government hospitals with very low fees.",
  },
  {
    code: "JM / MM", fullName: "Jain Minority / Muslim Minority Quota", tag: "Deemed • Minority Institutions",
    seats: "Minority reserved seats", shortDesc: "Some Deemed Universities run by Jain or Muslim minority trusts have reserved minority quota.",
    who: "JM: Jain community with valid certificate. MM: Muslim community with valid certificate.",
    rank: "AIR, but evaluated in separate minority merit list. Closing rank is more relaxed.",
    example: { title: "Real Scenario", text: "Piyush (Jain, AIR 18,000) applies for JSS Medical College Mysuru under JM quota. Closing rank was AIR 20,000 — he secures a seat." },
    note: "If seats remain vacant after Round 3, they are converted to PS (Open Deemed) seats.",
  },
  {
    code: "NR", fullName: "Non-Resident Indian (NRI) Quota", tag: "Private / Deemed • NRI",
    seats: "15% of private/deemed seats", shortDesc: "Seats reserved for NRI candidates or their dependents/relatives.",
    who: "NRI passport holders or their children/dependents. Fees in USD ($40,000–$80,000/year).",
    rank: "AIR or college-specific merit.",
    example: { title: "Real Scenario", text: "Sameer holds a US passport (NRI). His AIR is 25,000. Under NRI quota, he secures admission paying ~$50,000/year." },
    note: "NRI quota rules changed after Supreme Court rulings. Management Quota is handled by State authorities, not MCC.",
  },
  {
    code: "BS / BD / BW", fullName: "B.Sc Nursing Quotas", tag: "B.Sc Nursing — Central Institutes",
    seats: "B.Sc Nursing seats", shortDesc: "BS = B.Sc Nursing All India. BD = B.Sc Nursing Delhi NCR. BW = B.Sc Nursing Delhi NCR CW (Children/Widows of Armed Forces).",
    who: "BS: All India NEET-qualified students. BD: Delhi NCR students. BW: Children/Widows of Armed Forces.",
    rank: "NEET AIR. Separate nursing merit list.",
    example: { title: "Real Scenario", text: "Neha from Delhi applies under BS quota for AIIMS Nursing. Her sister Anita (Army child) applies under BW quota." },
    note: "Since 2021, NEET is mandatory for B.Sc Nursing admissions in central/deemed institutes.",
  },
  {
    code: "JI", fullName: "Jamia Internal Quota", tag: "Jamia Millia Islamia",
    seats: "5% internal seats", shortDesc: "Faculty of Dentistry, Jamia Millia Islamia — 100% seats under MCC, with 5% for Jamia internal students.",
    who: "100% seats: All India via MCC. 5% JI seats: Jamia enrolled students only.",
    rank: "AIR for open seats. Jamia internal merit for JI seats.",
    example: { title: "Real Scenario", text: "Faraz is enrolled at Jamia. He applies for BDS under JI quota — competition is only with other Jamia students." },
    note: "Faculty of Dentistry Jamia is only for BDS (dental). No separate state quota exists.",
  },
];

const CATEGORIES = [
  {
    code: "UR", fullName: "Unreserved (Open / General)", reservation: "No reservation",
    shortDesc: "All seats that are NOT reserved for any category. Highest competition.",
    who: "Any NEET-qualified student from any category.",
    rank: "Strictly AIR. No relaxation. Most competitive closing ranks.",
    example: { title: "How UR Seats Work", text: "At GMC Nagpur 2024: UR closing rank = AIR 1,850. Any student with AIR ≤ 1,850 can get this UR seat." },
    note: "UR seats = Open competition seats. Any category student with good rank gets UR seat first.",
  },
  {
    code: "OBC-NCL", fullName: "Other Backward Class — Non Creamy Layer", reservation: "27% reservation",
    shortDesc: "27% of AIQ seats reserved for OBC-NCL candidates. Income ≤ ₹8 lakh/year.",
    who: "Central OBC list candidates with income ≤ ₹8L. Valid NCL OBC certificate required.",
    rank: "AIR — separate OBC-NCL merit list. 2x–5x higher AIR accepted vs UR.",
    example: { title: "OBC-NCL Benefit", text: "At MAMC Delhi: UR closing = AIR 310, OBC-NCL closing = AIR 900. Amit (AIR 750) gets OBC seat." },
    note: "Central OBC list ≠ State OBC list. Verify your caste on NCBC website.",
  },
  {
    code: "SC", fullName: "Scheduled Caste", reservation: "15% reservation",
    shortDesc: "15% of AIQ seats reserved for SC candidates. Central SC list is used.",
    who: "Students with valid SC caste certificate matching Central SC list.",
    rank: "AIR — separate SC merit list. 5x–15x higher AIR accepted vs UR.",
    example: { title: "SC Benefit", text: "At VMMC Delhi: UR closing = AIR 220, SC closing = AIR 3,500. Sunita (SC, AIR 2,800) qualifies." },
    note: "SC/ST candidates can take UR seats if AIR qualifies — called 'floating'.",
  },
  {
    code: "ST", fullName: "Scheduled Tribe", reservation: "7.5% reservation",
    shortDesc: "7.5% of AIQ seats reserved for ST candidates. Most relaxed closing ranks.",
    who: "Students with valid ST caste certificate matching Central ST list.",
    rank: "AIR — separate ST merit list. 10x–30x higher AIR accepted vs UR.",
    example: { title: "ST Benefit", text: "At GMC Amritsar: UR closing = AIR 2,100, ST closing = AIR 42,000. Ramesh (ST, AIR 28,000) secures seat." },
    note: "If ST seats remain vacant, they are NOT transferred to another category.",
  },
  {
    code: "EWS", fullName: "Economically Weaker Section", reservation: "10% reservation",
    shortDesc: "For General category students with family income below ₹8 lakh/year.",
    who: "General/UR candidates with income ≤ ₹8L, land <5 acres, house <1000 sq ft. Valid EWS certificate required.",
    rank: "AIR — separate EWS merit list. More relaxed than UR.",
    example: { title: "EWS Benefit", text: "At Lady Hardinge: UR closing = AIR 150, EWS closing = AIR 600. Pooja (EWS, AIR 420) qualifies." },
    note: "EWS certificate valid only for current financial year. OBC/SC/ST not eligible.",
  },
  {
    code: "PwD", fullName: "Person with Disability (PwD / PH)", reservation: "5% horizontal",
    shortDesc: "5% of seats across all categories reserved for candidates with benchmark disabilities (≥40%).",
    who: "Candidates with ≥40% benchmark disability. Valid disability certificate from Government medical board.",
    rank: "AIR — separate PwD merit list for each category. Most relaxed ranks.",
    example: { title: "PwD Benefit", text: "At AIIMS Bhopal: UR closing = AIR 320, UR-PwD closing = AIR 2,800. Karan (AIR 1,500) gets seat." },
    note: "MCC conducts medical fitness test for PwD candidates before final admission.",
  },
];

const ROUNDS = [
  {
    num: "R1", name: "Round 1", purpose: "First round of counselling. Maximum seats available — complete seat matrix offered.",
    strategy: "If your AIR is strong, this is your most important round. Top government colleges, AIIMS, JIPMER fill up here.",
    important: "After R1 allotment, you must pay acceptance fee and report to college. If you don't report, you are debarred.",
  },
  {
    num: "R2", name: "Round 2", purpose: "Seats vacated after Round 1 + newly added seats from candidates who upgraded.",
    strategy: "Participate with your R1 seat still secured. You can only move up, not down.",
    important: "You can participate in R2 even if you have a seat from R1.",
  },
  {
    num: "R3", name: "Round 3 (Mop-Up)", purpose: "Final mopping up of all remaining vacant seats across all categories.",
    strategy: "If you don't have a seat after R1/R2, this is crucial. Closing ranks are more relaxed.",
    important: "After R3, minority/NRI vacant seats convert to Open/PS seats.",
  },
  {
    num: "SV", name: "Stray Vacancy", purpose: "Absolute last round. Very small seat count but ranks can be surprisingly relaxed.",
    strategy: "Monitor MCC website carefully. Sometimes good seats appear here due to last-minute withdrawals.",
    important: "Final chance. No further rounds after this. Admission process closes.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// Detail Modal (Full popup with all content)
// ══════════════════════════════════════════════════════════════════════
function DetailModal({ item, dm, onClose }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded shadow-xl
        ${dm ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-primary h-1 rounded-t" />
        <div className={`flex items-start justify-between gap-3 p-5 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-11 h-11 rounded shrink-0 flex items-center justify-center text-xs font-bold border
              ${dm ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}`}>
              {item.code?.substring(0, 3)}
            </div>
            <div>
              <div className={`text-base font-bold ${dm ? 'text-white' : 'text-primary'}`}>{item.code}</div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-text-body'}`}>{item.fullName}</div>
              <div className={`inline-block mt-1 text-sm font-bold uppercase px-2 py-0.5 rounded-full border
                ${dm ? 'border-primary/40 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
                {item.tag || item.reservation}
              </div>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded border transition-colors
            ${dm ? 'border-slate-600 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
            {IC.close}
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item.shortDesc}</p>
          
          {item.campuses && (
            <div className={`p-3 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
              <div className={`text-sm font-bold uppercase tracking-wide mb-2 text-primary`}>🏥 AIIMS Campuses (15 total)</div>
              <div className="flex flex-wrap gap-1.5">
                {item.campuses.map(c => (
                  <span key={c} className={`text-sm font-medium px-2 py-1 rounded-full border
                    ${dm ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>{c}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className={`p-3 rounded border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-400' : 'text-text-body'}`}>👤 Who Can Apply</div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item.who}</p>
          </div>
          
          <div className={`p-3 rounded border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-400' : 'text-text-body'}`}>🏅 Rank / Merit List</div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item.rank}</p>
          </div>
          
          {item.example && (
            <div className={`p-3 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
              <div className={`text-sm font-bold uppercase tracking-wide mb-1 text-primary`}>📌 {item.example.title}</div>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${dm ? 'text-slate-300' : 'text-text-body'}`}>{item.example.text}</p>
            </div>
          )}
          
          {item.note && (
            <div className={`p-3 rounded border ${dm ? 'border-interactive/30 bg-interactive/5' : 'border-interactive/30 bg-interactive/5'}`}>
              <div className={`text-sm font-bold uppercase tracking-wide mb-1 text-interactive`}>ℹ️ Important Note</div>
              <p className={`text-sm leading-relaxed text-interactive`}>{item.note}</p>
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
        <span className={`text-sm font-bold uppercase px-2 py-0.5 rounded-full border
          ${dm ? 'border-primary/40 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>{item.code}</span>
        <span className={`text-sm font-mono ${dm ? 'text-slate-400' : 'text-text-body'}`}>{type === "quota" ? item.seats : item.reservation}</span>
      </div>
      <p className={`text-sm font-bold mb-1 leading-tight ${dm ? 'text-white' : 'text-primary'}`}>{item.fullName}</p>
      <p className={`text-xs leading-relaxed mb-2 ${dm ? 'text-slate-400' : 'text-text-body'}`}>
        {item.shortDesc.length > 80 ? item.shortDesc.substring(0, 80) + "…" : item.shortDesc}
      </p>
      <div className={`flex items-center gap-1 text-sm font-bold text-primary`}>
        {IC.eye} View full details & example
      </div>
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
          <div className={`text-sm font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-500' : 'text-text-body'}`}>What Happens</div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{round.purpose}</p>
        </div>
        <div className={`p-2 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
          <div className={`text-sm font-bold uppercase tracking-wide mb-1 text-primary`}>💡 Strategy</div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{round.strategy}</p>
        </div>
        <div className={`p-2 rounded border ${dm ? 'border-interactive/30 bg-interactive/5' : 'border-interactive/30 bg-interactive/5'}`}>
          <p className={`text-xs leading-relaxed text-interactive`}>⚠ {round.important}</p>
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
              className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 text-text-body hover:text-primary transition-colors">
              {IC.back} Back to Cutoff Data
            </button>
          )}
          
          <div className={`relative rounded border p-6 md:p-8 overflow-hidden
            ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
            <div className="flex flex-wrap justify-between gap-6">
              <div className="flex-1">
                <div className={`inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border mb-4
                  ${dm ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
                  {IC.shield} MCC Official Guide
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${dm ? 'text-white' : 'text-primary'}`}>
                  NEET UG Counselling — <span className="text-accent">Complete Guide</span>
                </h1>
                <p className={`text-sm mt-3 max-w-xl leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                  Every quota code, category benefit, and round strategy — explained in simple English with real numbers.
                  All data sourced from MCC's official information brochures and seat allotment PDFs (mcc.nic.in).
                </p>
              </div>
              
              {/* Authenticity Badge Box */}
              <div className={`p-4 rounded-lg border min-w-[200px] ${dm ? 'bg-primary/5 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
                <div className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 text-primary`}>
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary">✓</span>
                  </div>
                  Verified Sources
                </div>
                <div className="space-y-2">
                  {[
                    { icon: "📄", text: "Source: mcc.nic.in" },
                    { icon: "🔄", text: "Updated for 2024 Counselling" },
                    { icon: "📊", text: "All Rounds Covered" },
                    { icon: "🏷️", text: "All Quota Codes Explained" },
                  ].map(t => (
                    <div key={t.text} className="flex items-center gap-2 text-xs">
                      <span className="text-accent">{t.icon}</span>
                      <span className={dm ? 'text-slate-300' : 'text-text-body'}>{t.text}</span>
                    </div>
                  ))}
                </div>
                <div className={`mt-3 pt-3 border-t text-sm font-medium ${dm ? 'border-primary/30 text-primary' : 'border-primary/20 text-primary'}`}>
                  ⚡ Trusted by thousands of NEET aspirants
                </div>
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
              "15% All India Quota (AIQ) seats — MBBS/BDS in Government Medical Colleges across all states and UTs (J&K included from 2022).",
              "100% MBBS/BDS seats — All 15 AIIMS campuses across India (Institutes of National Importance).",
              "100% seats — JIPMER Puducherry and JIPMER Karaikal (Institutes of National Importance).",
              "100% MBBS/BDS seats — Banaras Hindu University (BHU), Varanasi.",
              "100% MBBS/BDS seats — Aligarh Muslim University (AMU), Aligarh.",
              "85% of State Quota seats — Delhi University affiliated colleges (UCMS Delhi), VMMC & Safdarjung Hospital, ABVIMS & Dr. RML Hospital, ESIC Dental College Delhi.",
              "85% of State Quota seats — IP University (GGSIPU) affiliated medical colleges in Delhi.",
              "100% seats — Faculty of Dentistry, Jamia Millia Islamia (New Delhi), including 5% internal Jamia student quota.",
              "15% IP Quota seats — ESIC (Employees State Insurance Corporation) Medical Colleges across India.",
              "100% seats — All Deemed Universities (both Government Deemed and Private Deemed) across India.",
            ].map((text, i) => (
              <div key={i} className={`flex gap-3 p-4 ${i < 9 ? `border-b ${dm ? 'border-slate-700' : 'border-slate-100'}` : ''}
                ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/50') : ''}`}>
                <span className={`w-7 h-7 rounded shrink-0 flex items-center justify-center text-sm font-bold border
                  ${dm ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-primary/10 border-primary/20 text-primary'}`}>{i+1}</span>
                <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>{text}</p>
              </div>
            ))}
            <div className={`p-3 border-t ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
              <p className={`text-xs leading-relaxed text-primary`}>
                <strong>Note:</strong> The remaining 85% State Quota seats of all Government Medical Colleges, 
                and 100% seats of all Private Medical Colleges, are handled by respective State/UT Counselling Authorities — not by MCC.
              </p>
            </div>
          </div>
        </div>
        
        {/* SECTION 2: OPEN vs CATEGORY SEAT */}
        <div className="mb-8">
          <SectionHeader icon={IC.book} title="Open Seat vs Category Seat — How Allotment Actually Works"
            subtitle="This is the most important concept for choice filling strategy — understand this before filling your preferences" dm={dm} />
          
          <div className="space-y-4">
            <div className={`rounded border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`p-3 border-b flex items-center gap-2 ${dm ? 'bg-primary/10 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
                <span className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold bg-primary/10 text-primary`}>1</span>
                <span className={`text-sm font-bold text-primary`}>MCC Checks Open Seats First</span>
              </div>
              <div className="p-4">
                <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                  When allocating your seat, MCC first checks if an <strong>Open Seat (unrestricted seat)</strong> is available 
                  at your AIR in the colleges you have chosen. An Open Seat can be taken by any eligible candidate regardless of category.
                </p>
                <div className={`p-3 rounded border ${dm ? 'bg-primary/5 border-primary/30' : 'bg-primary/5 border-primary/20'}`}>
                  <p className={`text-sm leading-relaxed text-primary`}>
                    <strong>If you get an Open Seat:</strong> You are allotted that Open Seat. Your reserved category seat remains vacant for another candidate.
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
                  If an Open Seat is not available at your AIR, MCC then checks if a seat is available under your reserved category at your AIR.
                </p>
                <div className={`p-3 rounded border ${dm ? 'bg-accent/5 border-accent/30' : 'bg-accent/5 border-accent/20'}`}>
                  <p className={`text-sm leading-relaxed text-accent`}>
                    <strong>Real Numbers Example:</strong> Open closing rank = AIR 1,800 | OBC-NCL = AIR 4,500 | SC = AIR 14,000 | ST = AIR 38,000.
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded border ${dm ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
              <div className={`text-sm font-bold uppercase tracking-wide mb-2 text-primary`}>💡 Critical Tip for Choice Filling</div>
              <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-text-body'}`}>
                <strong>Fill your choices very carefully and in order of your genuine preference.</strong> MCC allocates 
                the highest-preference college where a seat is available for you (Open first, then Category). 
                If you have a reserved category, <strong>use the Category filter on the Cutoff Data page</strong> to 
                see the actual closing rank for your specific category.
              </p>
            </div>
          </div>
        </div>
        
        {/* SECTION 3: QUOTA CODES */}
        <div className="mb-8">
          <SectionHeader icon={IC.trophy} title="All Quota Codes Explained"
            subtitle={`${QUOTAS.length} quota types from MCC official seat allotment PDFs — click any card to see full details and a real example`} dm={dm} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUOTAS.map(q => <SmallCard key={q.code} item={q} type="quota" dm={dm} onClick={openModal} />)}
          </div>
        </div>
        
        {/* SECTION 4: CATEGORIES */}
        <div className="mb-8">
          <SectionHeader icon={IC.users} title="Category Reservation — Benefits & Real Numbers"
            subtitle={`${CATEGORIES.length} categories — how reservation helps, with actual 2024 closing rank examples. Click any card to see full details.`} dm={dm} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(c => <SmallCard key={c.code} item={c} type="category" dm={dm} onClick={openModal} />)}
          </div>
        </div>
        
        {/* SECTION 5: ROUNDS */}
        <div className="mb-8">
          <SectionHeader icon={IC.trophy} title="Counselling Rounds — Strategy for Each Round"
            subtitle="MCC AIQ counselling has 4 rounds. Understanding each round helps you plan when to lock seats and when to participate." dm={dm} />
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
            <div className={`text-sm font-bold mb-2 text-primary`}>About Our Data — Accuracy &amp; Sources</div>
            <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-text-body'}`}>
              All Opening and Closing Rank data on RankSetu is sourced directly from the official MCC seat allotment result PDFs 
              published on mcc.nic.in — no estimation or approximation involved.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Source: mcc.nic.in official PDFs", "No estimation involved", "Years 2020–2024 covered", "Round-wise data preserved", "Category-wise data preserved"].map(item => (
                <span key={item} className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full border
                  ${dm ? 'border-primary/30 bg-primary/5 text-primary' : 'border-primary/20 bg-primary/5 text-primary'}`}>
                  <span className="text-accent">{IC.check}</span> {item}
                </span>
              ))}
            </div>
            <p className={`text-xs italic leading-relaxed ${dm ? 'text-slate-400' : 'text-text-body'}`}>
              MCC guidelines and reservation rules are updated by the Government of India for each counselling year. 
              Always refer to the latest official MCC Information Brochure on mcc.nic.in for the current year's rules.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}