'use client';

import React, { useState } from "react";

// ── Color constants ────────────────────────────────────────────────────
const PRIMARY     = '#1A3C6E';
const INTERACTIVE = '#2563EB';

// Dark-mode-safe accent helpers — Navy (#1A3C6E) and brand blue (#2563EB) read poorly
// on dark backgrounds, so dark mode swaps in lighter, higher-contrast blues while
// light mode keeps the original brand colors untouched.
const accent  = (dm) => (dm ? '#7DB8FF' : PRIMARY);      // for headings/labels/icons
const accent2 = (dm) => (dm ? '#93C5FD' : INTERACTIVE);  // for secondary callouts
const tint    = (dm, alpha) => `${dm ? '#3B82F6' : PRIMARY}${alpha}`;      // soft backgrounds/borders
const tint2   = (dm, alpha) => `${dm ? '#60A5FA' : INTERACTIVE}${alpha}`; // soft backgrounds/borders

// ── Icons ──────────────────────────────────────────────────────────────
const IC = {
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,
  book:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  users:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  trophy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  info:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  check:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  db:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  chevD:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  chevU:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>,
  eye:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  back:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
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
  {
    code: "AFMC", fullName: "Armed Forces Medical College, Pune", tag: "Registration Only via MCC",
    seats: "Registration through MCC; seat allotment done by AFMC", shortDesc: "MCC's role for AFMC is limited to registration of willing candidates. Actual counselling/allotment is done separately by AFMC authorities as per their own rules.",
    who: "Any NEET-qualified candidate who wants to be considered by AFMC. Candidates must separately check AFMC's own medical and physical eligibility conditions before applying.",
    rank: "AFMC applies its own selection process after receiving the registered candidate list from MCC — not a standard MCC merit-list allotment.",
    example: { title: "Important to Know", text: "Rakesh registers for AFMC on the MCC portal. MCC forwards his details to AFMC. From here, AFMC — not MCC — decides eligibility, conducts further screening, and allots the seat as per its own regulations." },
    note: "MCC will NOT be responsible for any allotment made by AFMC, and will not entertain any grievance about AFMC's process. Always check medical/physical eligibility directly on the AFMC website before applying — admissions have been cancelled in the past for not meeting AFMC's medical standards.",
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
    num: "R1", name: "Round 1",
    purpose: "First round of counselling. Maximum seats available — the complete seat matrix is offered fresh.",
    strategy: "If your AIR is strong, this is your most important round. Top government colleges, AIIMS, and JIPMER mostly fill up here — don't hold back your best choices.",
    important: "After R1 allotment, you must report physically with original documents to confirm your seat. If you don't report, you are not automatically debarred from R2 — but you will need to check MCC's latest notice, since rules can be revised each year.",
    who: "Any candidate who has registered, paid fees, and locked choices before the Round 1 deadline.",
    process: [
      "Register on mcc.nic.in and pay Registration Fee + Security Deposit (amount depends on category and quota — see Fees section below).",
      "Fill choices of colleges/courses in your genuine order of preference, then lock them before the deadline. Once locked, choices CANNOT be modified — not even by MCC.",
      "MCC processes the seat allotment and publishes the Round 1 result on mcc.nic.in.",
      "If allotted a seat, physically report with original documents at the allotted college within the stipulated time to confirm admission.",
      "At the time of reporting, you can also give 'willingness for upgradation' to Round 2 if you want to keep this seat as backup while trying for something better.",
    ],
    note: "If you registered but did NOT get any seat in Round 1, you do not need to register again — you are automatically carried forward into Round 2.",
  },
  {
    num: "R2", name: "Round 2",
    purpose: "Seats vacated after Round 1 (due to non-reporting, resignation, or upgrades) plus any newly released seats.",
    strategy: "You must submit completely fresh choices for Round 2 — your Round 1 choices are treated as null and void. If you already hold a Round 1 seat and gave upgrade willingness, you keep that seat safe while trying to move up.",
    important: "If you are allotted a seat in Round 2 and do not report/join, your security deposit will be forfeited, and you'll need fresh payment to join Round 3.",
    who: [
      "Group I — Registered candidates who got no seat in Round 1.",
      "Group II — Candidates whose Round 1 seat got cancelled during document verification (changed category).",
      "Group III — Candidates who reported in Round 1 and gave 'Yes' for upgradation willingness.",
      "Group IV — Candidates allotted a seat in Round 1 but who did not join.",
      "Group V — Candidates who resigned online from their Round 1 seat within the resignation window.",
    ],
    process: [
      "If you registered in Round 1 but got no seat, you do NOT need to register again — just fill fresh choices.",
      "If you are registering for the very first time in Round 2, you must complete full registration with fresh payment of fees.",
      "Fill and lock FRESH choices — your Round 1 choice list has no effect on Round 2 allotment.",
      "MCC processes allotment and publishes the Round 2 result.",
      "Physically report at the newly allotted college. If you are upgrading from your Round 1 seat, you must first get an online relieving letter from your Round 1 college before joining the Round 2 college.",
      "You can again give willingness for upgradation to Round 3 at the time of reporting.",
    ],
    note: "Once upgraded in Round 2, you have NO further claim on your Round 1 seat — it is released to another candidate.",
  },
  {
    num: "R3", name: "Round 3 (Mop-Up Round)",
    purpose: "Final mopping-up of all seats left vacant after Round 1 and Round 2, across AIQ, Deemed, Central Universities, AIIMS, JIPMER, and B.Sc. Nursing.",
    strategy: "If you still don't have a seat after R1/R2, this round matters most — closing ranks are usually more relaxed here since supply and demand have already adjusted twice.",
    important: "Once you JOIN a seat allotted in Round 3, you CANNOT resign or upgrade further — this is a final commitment. Think carefully before locking choices for Round 3.",
    who: [
      "Group I — Registered candidates who got no seat in Round 1 or Round 2.",
      "Group II — Candidates whose Round 2 seat got cancelled during document verification (changed category).",
      "Group III — Candidates who reported in Round 2 and gave 'Yes' for upgradation willingness.",
      "Group IV — Candidates allotted a Round 2 seat but who did not join, or who resigned and exited with forfeiture.",
    ],
    process: [
      "No fresh registration needed if you already registered in Round 1 or Round 2 and remained unallotted.",
      "If you never registered before, or you did not report/resigned in an earlier round, you must do a fresh full registration with full payment of fees.",
      "Fill and lock completely FRESH choices — Round 2 choices are void for Round 3.",
      "MCC processes allotment and publishes the Round 3 result.",
      "Report physically and join the allotted college. If upgrading from Round 2, get a relieving letter from the Round 2 college first.",
      "If you are allotted a seat in Round 3 and do NOT report, you exit with forfeiture of your security deposit AND you are eliminated from all further rounds, including the Stray Vacancy Round.",
    ],
    note: "Conversion of unfilled reserved-category seats (e.g., ST(PwD)→ST→SC→UR) happens during Round 3, once all eligible candidates in that category have been exhausted.",
  },
  {
    num: "SV", name: "Stray Vacancy Round",
    purpose: "The absolute last round — for seats that remain vacant after Round 3 in AIQ and Deemed Universities. Seat count is small, but ranks can be surprisingly relaxed.",
    strategy: "Register fresh and monitor the MCC website closely. Sometimes strong seats appear here due to very last-minute non-joining by other candidates.",
    important: "This is the final chance. There is no round after this — the admission process closes once Stray Vacancy Round ends.",
    who: "Fresh registration is required for everyone. However, three groups are NOT eligible: (a) candidates who don't register for this round, (b) candidates already holding/joined a seat at the time of this round, and (c) candidates allotted a Round 3 seat who did not report.",
    process: [
      "Register fresh for the Stray Vacancy Round (even if you registered before).",
      "Before this round, MCC cross-checks data with State counselling authorities — if your name appears as allotted in either list, you are removed from the All-India Stray Vacancy Round to prevent seat blocking.",
      "Fill and lock choices for available vacant seats.",
      "If allotted a seat, you must join it. If you don't join, your security deposit is forfeited and you become ineligible for any further round (if any is announced).",
    ],
    note: null,
  },
];

// ══════════════════════════════════════════════════════════════════════
// ELIGIBILITY — exact wording simplified from Chapter 1 & NTA eligibility clause
// ══════════════════════════════════════════════════════════════════════
const ELIGIBILITY = [
  {
    title: "Qualify NEET-UG first",
    text: "You must have passed Physics, Chemistry, and Biology/Biotechnology individually, AND English, in your qualifying exam (usually Class 12). You also need a valid NEET-UG rank from NTA.",
  },
  {
    title: "Minimum marks needed (Class 12, PCB combined)",
    text: "General / General-EWS candidates: at least 50% marks in Physics + Chemistry + Biology/Biotechnology taken together. SC / ST / OBC-NCL candidates: at least 40% marks (relaxed). PwBD candidates: at least 40% marks (relaxed), as per NMC/DCI norms.",
  },
  {
    title: "No separate MCC eligibility test",
    text: "MCC does not conduct its own entrance exam. Your NEET-UG rank from NTA is the only merit criterion MCC uses for AIQ, Deemed, Central University, AIIMS, JIPMER, and B.Sc. Nursing seats.",
  },
  {
    title: "Data comes from your NTA registration — cannot be edited",
    text: "The name, date of birth, category, and other details you entered on the NTA NEET application form are automatically carried into your MCC counselling profile. MCC does NOT allow you to edit this information under any circumstances — so make sure it was correct at the NTA stage itself.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// FEES — exact figures from Chapter 13 of the official bulletin
// ══════════════════════════════════════════════════════════════════════
const FEES = [
  {
    group: "Deemed Universities (100% seats)",
    registration: "₹5,000 (non-refundable) — same for every candidate",
    security: "₹2,00,000 (refundable)",
    total: "₹2,05,000 at the time of registration",
  },
  {
    group: "AIQ / Central Universities (DU, AMU, BHU, Jamia) / AFMC & ESI / All AIIMS / JIPMER / B.Sc. Nursing — UR/EWS candidates",
    registration: "₹1,000 (non-refundable)",
    security: "₹10,000 (refundable)",
    total: "₹11,000 at the time of registration",
  },
  {
    group: "Same group as above — SC / ST / OBC / PwD candidates",
    registration: "₹500 (non-refundable)",
    security: "₹5,000 (refundable)",
    total: "₹5,500 at the time of registration",
  },
];

// ══════════════════════════════════════════════════════════════════════
// DOCUMENTS — required at the time of physical reporting (Chapter 12 FAQ Q29)
// ══════════════════════════════════════════════════════════════════════
const DOCUMENTS = [
  "MCC Allotment Letter (downloaded from the MCC website)",
  "NEET Admit Card issued by NTA",
  "NEET Result / Rank Letter issued by NTA",
  "Date of Birth Certificate (needed only if your Class 10 certificate does not show DOB)",
  "Class 10th Certificate",
  "Class 10+2 Certificate",
  "Class 10+2 Marksheet",
  "8 passport-size photographs — same photo as used on your NEET application form",
  "Proof of identity — Aadhaar / PAN / Driving Licence / Passport",
  "For OCI/PIO/Foreign National candidates — citizenship certificate / card number documents",
  "SC/ST certificate (standard format, in English or Hindi — carry an attested English/Hindi translation if issued in a regional language) — only if claiming this category",
  "OBC-NCL certificate matching the Central OBC list, confirming you are NOT in the creamy layer — only if claiming this category",
  "EWS certificate in the prescribed format — only if claiming this category",
];

// ══════════════════════════════════════════════════════════════════════
// GLOSSARY — terms actually used in MCC's official bulletin, defined simply.
// (Terms like "Freeze / Float / Slide" are common in OTHER counselling
// bodies like AACCC or JoSAA, but MCC's bulletin does not use those words —
// so they are intentionally left out here to avoid mixing up terminology.)
// ══════════════════════════════════════════════════════════════════════
const GLOSSARY = [
  { term: "AIQ", def: "All India Quota — the 15% of seats in every state's government medical colleges that are opened up to students from anywhere in India, filled by MCC." },
  { term: "MCC", def: "Medical Counselling Committee — the central body under DGHS, Ministry of Health & Family Welfare, that conducts online counselling for AIQ, Deemed Universities, AIIMS, JIPMER, Central Universities, and more." },
  { term: "State Quota", def: "Seats reserved for students who meet a state's own domicile rules, counselled separately by that state's own counselling authority — NOT by MCC." },
  { term: "Open Seat", def: "A seat with no category restriction. Any eligible candidate can be allotted an Open Seat, regardless of their reservation category." },
  { term: "Deemed University", def: "A private institution granted 'Deemed to be University' status by the UGC. 100% of Deemed University MBBS/BDS seats are counselled by MCC, but fees are much higher than government colleges." },
  { term: "Seat Matrix", def: "The full list of how many seats are available in each college, course, and category for a given round." },
  { term: "Choice Filling", def: "The process where you arrange colleges/courses in the exact order you prefer them, before locking." },
  { term: "Choice Locking", def: "Once you finalize (lock) your choice order, it becomes permanent for that round — it cannot be changed, even by MCC, even if you made a mistake." },
  { term: "Seat Allotment", def: "MCC's software matches your AIR against the seat matrix and your locked choices, and assigns you the highest-preference seat you qualify for." },
  { term: "Free Exit", def: "After Round 1, you are allowed to simply not report to your allotted college with no penalty — your security deposit is not forfeited." },
  { term: "Exit with Forfeiture", def: "From Round 2 onwards, if you are allotted a seat but do not report/join, you lose your security deposit as a penalty." },
  { term: "Upgradation / Upgrade", def: "Choosing to try for a better seat in the next round while temporarily holding your current seat as backup. If you get upgraded, your previous seat is released to someone else." },
  { term: "Security Deposit", def: "A refundable deposit paid at registration (₹2,00,000 for Deemed, ₹5,000–₹10,000 for AIQ/Central seats) to discourage candidates from blocking seats without joining." },
  { term: "Stray Vacancy Round", def: "The final round, held after Round 3, to fill any seats that are still empty. Very few seats, but sometimes with relaxed closing ranks." },
  { term: "Mop-Up Round", def: "The older name for what is now called Round 3 — a round meant to 'mop up' (fill) all remaining vacant seats." },
  { term: "Conversion", def: "When a reserved-category seat (like ST or NRI) stays empty because no eligible candidate in that category wants it, MCC converts it to another category (usually UR/Open) during Round 3, following a fixed conversion algorithm." },
  { term: "NRI Seat", def: "A seat reserved for Non-Resident Indian candidates or their dependents, usually with fees in US dollars, mainly found in Deemed and private institutions." },
  { term: "OCI", def: "Overseas Citizen of India — a status for certain foreign nationals of Indian origin. Following a 2023 Supreme Court judgment, OCI cardholders are treated at par with Indian citizens and are eligible for both UR and NRI category seats." },
  { term: "PwD / PwBD", def: "Person with Disability — candidates with at least 40% benchmark disability get 5% horizontal reservation across all categories, verified through a disability certificate from an authorized government medical board." },
  { term: "EWS", def: "Economically Weaker Section — 10% reservation for General category candidates whose family income is below ₹8 lakh/year and who don't own specified amounts of land/property." },
];

// ══════════════════════════════════════════════════════════════════════
// FAQS — paraphrased in simple language from the official bulletin's own FAQ chapter
// ══════════════════════════════════════════════════════════════════════
const FAQS = [
  {
    q: "Do I need any documents to register online?",
    a: "You mainly need the details from the NEET-UG application form you already submitted to NTA. Keep a printout of that form handy, since MCC asks for information exactly matching it (same spelling, same date format).",
  },
  {
    q: "How and when do I make the payment?",
    a: "After completing fresh registration, the payment page opens automatically. Pay by Net Banking, Credit Card, or Debit Card. Only after successful payment can you move on to choice filling.",
  },
  {
    q: "Is there a limit on how many choices I can fill?",
    a: "No — you can add as many college/course choices as you want. Just make sure they are arranged in your genuine order of preference, since the same software and choice-filling process is common across AIQ, Deemed, Central Universities, AIIMS, JIPMER, AMU, and BHU.",
  },
  {
    q: "Can I get an idea of what seat I'm likely to get at my rank?",
    a: "Yes — the previous years' composite allotment lists and category/course-wise opening-closing ranks are published on the MCC website's download section. These only give a rough idea; they don't guarantee anything for the current year.",
  },
  {
    q: "Is it compulsory to lock my choices, or will I get a seat automatically from leftovers?",
    a: "You must fill and lock your choices yourself. If you don't lock them manually, the system auto-locks whatever you've filled at the scheduled deadline. If you don't fill any choices at all, you get no seat allotment.",
  },
  {
    q: "Do I have to join my Round 1 college to be allowed into Round 2?",
    a: "No — there's free exit after Round 1. But if you want to KEEP your Round 1 seat as a backup while trying to upgrade in Round 2, you must physically report and give upgradation willingness at the time of admission.",
  },
  {
    q: "If I don't report during Round 2, do I need to register again for Round 3?",
    a: "Yes. Your security deposit is forfeited, and you can only participate in Round 3 with a completely fresh payment.",
  },
  {
    q: "Who is eligible for the 2nd round of allotment?",
    a: "Five groups: (1) registered candidates who got no seat in Round 1, (2) candidates whose Round 1 seat was cancelled during document checks, (3) candidates who reported in Round 1 and opted for upgradation, (4) candidates allotted a seat but who didn't join, and (5) candidates who resigned online from their Round 1 seat.",
  },
  {
    q: "Can I get a Round 2 seat using my old Round 1 choices, without filling fresh ones?",
    a: "No. Fresh choice submission is compulsory for Round 2 (and every later round). If you skip this step, you won't be considered for that round's allotment — you simply retain whatever seat you already joined, if any.",
  },
  {
    q: "After joining Round 3, can I leave or resign?",
    a: "No. Once you join a seat allotted in Round 3, you cannot vacate it. If you were ALLOTTED a Round 3 seat but never joined, you can still exit — but with forfeiture of your security deposit, and you become ineligible for any further rounds.",
  },
  {
    q: "If I forget my password, how do I get it back?",
    a: "Use the 'forgot password' option and answer the security question you set during registration. If your answers match your registered details, you'll be allowed to set a new password.",
  },
  {
    q: "Can I modify my locked choices?",
    a: "You can freely modify, add, or delete choices before locking. Once locked, they are final for that round — no exceptions, even for genuine mistakes.",
  },
  {
    q: "If I'm not allotted any seat in Round 2 or Round 3, do I lose my earlier seat?",
    a: "No — if you get no NEW seat in a later round, you simply retain whatever seat you already held from an earlier round. But the moment you DO get upgraded, your earlier seat is cancelled automatically and given to someone else — with no claim back on it.",
  },
  {
    q: "If I get upgraded, can I join the new college directly?",
    a: "No. You first need an online-generated relieving letter from your earlier college (issued through the MCC software by the college authority) before you're allowed to join the new, upgraded seat.",
  },
  {
    q: "By mistake I registered for the wrong quota (e.g. Deemed instead of AIQ) — can I fix it?",
    a: "Yes, but only once. There's a 'reset' option on the registration page that lets you clear your previously filled quota choice and register again. After using reset, you must complete a fresh registration with full payment.",
  },
  {
    q: "Who is NOT eligible for the Stray Vacancy Round?",
    a: "Three groups: candidates who didn't register for the Stray round, candidates already holding/joined a seat at that time, and candidates allotted a Round 3 seat who did not report.",
  },
  {
    q: "How much time do I get to join my allotted college?",
    a: "You must join within the time mentioned in the official counselling schedule — MCC will not extend this date under any circumstances. Some colleges take 2–3 days to complete formalities, so don't wait until the last day.",
  },
  {
    q: "What if my original documents are with another college?",
    a: "You will NOT be allowed to take admission using a certificate stating your originals are 'deposited elsewhere.' You must have your actual original documents in hand at the time of reporting.",
  },
  {
    q: "There's a spelling mismatch between my documents and my application form — what do I do?",
    a: "Carry a notarized affidavit proving that all the documents belong to the same person.",
  },
  {
    q: "When and how is my security deposit refunded?",
    a: "Only after all rounds of counselling are fully completed. MCC's Financial Custodian (HLL Lifecare Ltd.) starts the refund within 15 working days of the official notification and completes it within 30 days — refunded ONLY to the exact same account/card you originally paid from.",
  },
  {
    q: "Can I get my refund sent to a different bank account or card?",
    a: "No. MCC will not entertain such requests under any circumstance — the refund always goes back to the original payment source. Keep that account/card active until the refund is processed.",
  },
];

// ══════════════════════════════════════════════════════════════════════
// COMPARISON — MCC (verified from official bulletin) vs State Counselling
// (kept general/high-level since state rules vary a lot state-to-state and
// aren't covered by this MCC bulletin — always check your own state's
// official counselling website for exact figures)
// ══════════════════════════════════════════════════════════════════════
const COMPARISON_ROWS = [
  { label: "Conducting Authority", mcc: "Medical Counselling Committee (MCC), DGHS, MoHFW, Govt. of India", state: "Each state's own Directorate of Medical Education / State Counselling Committee" },
  { label: "Official Website", mcc: "www.mcc.nic.in", state: "Varies by state (each state has its own portal)" },
  { label: "Seats Covered", mcc: "15% AIQ + 100% AIIMS + 100% JIPMER + 100% Deemed Universities + 100% Central Universities (BHU, AMU, DU internal, Jamia) + ESIC + B.Sc. Nursing (central institutes)", state: "85% State Quota of government colleges + 100% private medical/dental colleges within that state" },
  { label: "Domicile Requirement", mcc: "None for AIQ, AIIMS, JIPMER Open, Deemed, and most Central seats (fully domicile-free)", state: "Yes — almost always requires proof of domicile/residence in that state" },
  { label: "Reservation Policy", mcc: "Central Government norms: SC 15%, ST 7.5%, OBC-NCL 27%, EWS 10%, PwD 5% (no reservation in Deemed Universities except possible minority quota)", state: "State's own reservation policy — percentages and categories can differ significantly from Central norms" },
  { label: "Number of Rounds", mcc: "4 rounds — Round 1, Round 2, Round 3 (Mop-Up), and Stray Vacancy Round", state: "Varies by state — some states run 3 rounds, some run more, including their own stray/mop-up rounds" },
  { label: "Registration Fee & Security Deposit", mcc: "Fixed nationwide — e.g. ₹1,000+₹10,000 (UR/EWS) or ₹500+₹5,000 (SC/ST/OBC/PwD) for AIQ/Central seats; ₹5,000+₹2,00,000 for Deemed Universities", state: "Set independently by each state — amounts differ widely" },
  { label: "Choice Locking", mcc: "Once locked, cannot be modified under any circumstances, even by MCC", state: "Similar strict-lock rule in most states, but exact windows/processes vary" },
  { label: "Seat Upgradation", mcc: "Allowed up to Round 3 while keeping your current seat as backup, by giving 'willingness' at the time of reporting", state: "Most states allow similar upgrade options, but the process and terminology can differ" },
  { label: "Who Should Apply", mcc: "Every NEET-qualified student in India — since AIQ, AIIMS, JIPMER, Deemed & Central Universities are open to all states", state: "Only students who meet that specific state's domicile rules, for 85% state-quota government seats and private colleges in that state" },
  { label: "Best For", mcc: "Trying for AIQ seats in ANY state, plus AIIMS/JIPMER/BHU/Deemed options nationwide", state: "Securing the much larger pool of state-quota seats within your own home state, usually at lower fees than Deemed Universities" },
];

// ══════════════════════════════════════════════════════════════════════
// Detail Modal
// ══════════════════════════════════════════════════════════════════════
function DetailModal({ item, dm, onClose }) {
  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border
          ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="h-1 rounded-t-xl" style={{ backgroundColor: accent(dm) }} />

        {/* Header */}
        <div className={`flex items-start justify-between gap-3 p-5 border-b ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
          <div className="flex items-start gap-3 flex-1">
            <div
              className="w-11 h-11 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border"
              style={{ backgroundColor: tint(dm, '14'), borderColor: tint(dm, '30'), color: accent(dm) }}
            >
              {item.code?.substring(0, 3)}
            </div>
            <div>
              <div className={`text-base font-bold ${dm ? 'text-white' : 'text-slate-900'}`}
                style={{ color: dm ? undefined : PRIMARY }}>
                {item.code}
              </div>
              <div className={`text-xs mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{item.fullName}</div>
              <div
                className="inline-block mt-1 text-xs font-bold uppercase px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: tint(dm, '10'), borderColor: tint(dm, '30'), color: accent(dm) }}
              >
                {item.tag || item.reservation}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg border transition-colors cursor-pointer
              ${dm ? 'border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            {IC.close}
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{item.shortDesc}</p>

          {/* AIIMS Campuses */}
          {item.campuses && (
            <div
              className="p-3 rounded-lg border"
              style={{ backgroundColor: tint(dm, '08'), borderColor: tint(dm, '25') }}
            >
              <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: accent(dm) }}>
                🏥 AIIMS Campuses (Total)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.campuses.map(c => (
                  <span
                    key={c}
                    className={`text-xs font-medium px-2 py-1 rounded-full border
                      ${dm ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Who can apply */}
          <div className={`p-3 rounded-lg border ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              👤 Who Can Apply
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{item.who}</p>
          </div>

          {/* Rank */}
          <div className={`p-3 rounded-lg border ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              🏅 Rank / Merit List
            </div>
            <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{item.rank}</p>
          </div>

          {/* Example */}
          {item.example && (
            <div
              className="p-3 rounded-lg border"
              style={{ backgroundColor: tint(dm, '08'), borderColor: tint(dm, '25') }}
            >
              <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accent(dm) }}>
                📌 {item.example.title}
              </div>
              <p className={`text-sm leading-relaxed whitespace-pre-line ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                {item.example.text}
              </p>
            </div>
          )}

          {/* Note */}
          {item.note && (
            <div
              className="p-3 rounded-lg border"
              style={{ backgroundColor: tint2(dm, '08'), borderColor: tint2(dm, '30') }}
            >
              <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accent2(dm) }}>
                ℹ️ Important Note
              </div>
              <p className="text-sm leading-relaxed" style={{ color: accent2(dm) }}>{item.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, dm }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border"
        style={{ backgroundColor: tint(dm, '10'), borderColor: tint(dm, '25'), color: accent(dm) }}
      >
        {icon}
      </div>
      <div>
        <h2 className={`text-lg font-bold ${dm ? 'text-white' : 'text-slate-900'}`}
          style={{ color: dm ? undefined : PRIMARY }}>
          {title}
        </h2>
        <p className={`text-xs mt-1 leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
      </div>
    </div>
  );
}

// ── Small Card ─────────────────────────────────────────────────────────
function SmallCard({ item, type, dm, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${hov
          ? dm
            ? 'bg-slate-700/80 border-slate-500 -translate-y-0.5 shadow-lg'
            : 'bg-slate-50 -translate-y-0.5 shadow-md'
          : dm
            ? 'bg-slate-800/50 border-slate-700'
            : 'bg-white border-slate-200'
        }`}
      style={hov ? { borderColor: tint(dm, '60') } : {}}
    >
      {/* Code badge + seat count */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-bold uppercase px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: tint(dm, '10'), borderColor: tint(dm, '30'), color: accent(dm) }}
        >
          {item.code}
        </span>
        <span className={`text-xs font-mono ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
          {type === "quota" ? item.seats : item.reservation}
        </span>
      </div>

      {/* Full name */}
      <p className={`text-sm font-bold mb-1 leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}
        style={{ color: dm ? undefined : PRIMARY }}>
        {item.fullName}
      </p>

      {/* Short desc */}
      <p className={`text-xs leading-relaxed mb-3 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
        {item.shortDesc.length > 80 ? item.shortDesc.substring(0, 80) + "…" : item.shortDesc}
      </p>

      {/* View details CTA */}
      <div className="flex items-center gap-1 text-xs font-bold" style={{ color: accent(dm) }}>
        {IC.eye}
        <span>View full details & example</span>
      </div>
    </div>
  );
}

// ── Round Card ─────────────────────────────────────────────────────────
function RoundCard({ round, dm }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      {/* Card header */}
      <div className={`p-3 border-b flex items-center gap-2.5
        ${dm ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black border"
          style={{ backgroundColor: tint(dm, '15'), borderColor: tint(dm, '35'), color: accent(dm) }}
        >
          {round.num}
        </div>
        <span className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}
          style={{ color: dm ? undefined : PRIMARY }}>
          {round.name}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Purpose */}
        <div>
          <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            What Happens
          </div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{round.purpose}</p>
        </div>

        {/* Who's eligible (if provided) */}
        {round.who && (
          <div>
            <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
              Who Can Take Part
            </div>
            {Array.isArray(round.who) ? (
              <ul className={`text-xs leading-relaxed space-y-1 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                {round.who.map((w, i) => <li key={i}>• {w}</li>)}
              </ul>
            ) : (
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{round.who}</p>
            )}
          </div>
        )}

        {/* Strategy */}
        <div
          className="p-2.5 rounded-lg border"
          style={{ backgroundColor: tint(dm, '08'), borderColor: tint(dm, '22') }}
        >
          <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: accent(dm) }}>
            💡 Strategy
          </div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{round.strategy}</p>
        </div>

        {/* Step-by-step process toggle */}
        {round.process && (
          <div>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              style={{ color: accent2(dm) }}
            >
              {open ? IC.chevU : IC.chevD} Step-by-step process
            </button>
            {open && (
              <ol className={`mt-2 space-y-1.5 text-xs leading-relaxed list-decimal list-inside ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                {round.process.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            )}
          </div>
        )}

        {/* Important */}
        <div
          className="p-2.5 rounded-lg border"
          style={{ backgroundColor: tint2(dm, '08'), borderColor: tint2(dm, '30') }}
        >
          <p className="text-xs leading-relaxed" style={{ color: accent2(dm) }}>⚠ {round.important}</p>
        </div>

        {/* Extra note */}
        {round.note && (
          <p className={`text-xs italic leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>ℹ {round.note}</p>
        )}
      </div>
    </div>
  );
}

// ── Comparison Table (MCC vs State) ─────────────────────────────────────
function ComparisonTable({ dm }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={dm ? 'bg-slate-800/80' : 'bg-slate-50'}>
              <th className={`text-left p-3 font-bold text-xs uppercase tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Aspect</th>
              <th className="text-left p-3 font-bold text-xs uppercase tracking-wide" style={{ color: accent(dm) }}>MCC (Central Counselling)</th>
              <th className="text-left p-3 font-bold text-xs uppercase tracking-wide" style={{ color: accent2(dm) }}>State Counselling</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((r, i) => (
              <tr key={r.label} className={`border-t ${dm ? 'border-slate-700' : 'border-slate-100'} ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/60') : ''}`}>
                <td className={`p-3 font-semibold align-top ${dm ? 'text-white' : 'text-slate-900'}`}>{r.label}</td>
                <td className={`p-3 align-top leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{r.mcc}</td>
                <td className={`p-3 align-top leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{r.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t" style={{ borderColor: tint(dm, '25'), backgroundColor: tint(dm, '06') }}>
        <p className="text-xs leading-relaxed" style={{ color: accent(dm) }}>
          <strong>Note:</strong> The MCC column above is verified directly from MCC's official Information Bulletin.
          The State Counselling column is a general overview — exact rules, fees, reservation percentages, and
          round counts differ from state to state, so always cross-check with your own state's official counselling website too.
        </p>
      </div>
    </div>
  );
}

// ── Fees Table ────────────────────────────────────────────────────────
function FeesTable({ dm }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={dm ? 'bg-slate-800/80' : 'bg-slate-50'}>
              <th className={`text-left p-3 font-bold text-xs uppercase tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Quota Group</th>
              <th className={`text-left p-3 font-bold text-xs uppercase tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Registration Fee</th>
              <th className={`text-left p-3 font-bold text-xs uppercase tracking-wide ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Security Deposit</th>
              <th className="text-left p-3 font-bold text-xs uppercase tracking-wide" style={{ color: accent(dm) }}>Total Payable</th>
            </tr>
          </thead>
          <tbody>
            {FEES.map((f, i) => (
              <tr key={f.group} className={`border-t ${dm ? 'border-slate-700' : 'border-slate-100'} ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/60') : ''}`}>
                <td className={`p-3 font-semibold align-top ${dm ? 'text-white' : 'text-slate-900'}`}>{f.group}</td>
                <td className={`p-3 align-top ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{f.registration}</td>
                <td className={`p-3 align-top ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{f.security}</td>
                <td className="p-3 align-top font-bold" style={{ color: accent(dm) }}>{f.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t" style={{ borderColor: tint(dm, '25'), backgroundColor: tint(dm, '06') }}>
        <p className="text-xs leading-relaxed" style={{ color: accent(dm) }}>
          <strong>If applying for both Govt./Central seats AND Deemed University seats:</strong> you only pay the
          higher fee once (the Deemed University fee of ₹2,05,000) — not both amounts separately. Registration
          fee is non-refundable; the security deposit is refunded after all rounds are completed, to the same
          account/card it was paid from.
        </p>
      </div>
    </div>
  );
}

// ── Simple bullet list card ─────────────────────────────────────────────
function BulletCard({ items, dm, numbered = false }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      {items.map((text, i) => (
        <div
          key={i}
          className={`flex gap-3 p-4 ${i < items.length - 1 ? `border-b ${dm ? 'border-slate-700/60' : 'border-slate-100'}` : ''}
            ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/60') : ''}`}
        >
          <span
            className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border"
            style={{ backgroundColor: tint(dm, '12'), borderColor: tint(dm, '25'), color: accent(dm) }}
          >
            {numbered ? i + 1 : IC.check}
          </span>
          <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Eligibility card list (title + text) ────────────────────────────────
function EligibilityList({ dm }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ELIGIBILITY.map((e, i) => (
        <div key={i} className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="text-sm font-bold mb-1.5" style={{ color: accent(dm) }}>{e.title}</div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{e.text}</p>
        </div>
      ))}
    </div>
  );
}

// ── Glossary grid ────────────────────────────────────────────────────────
function GlossaryGrid({ dm }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {GLOSSARY.map((g) => (
        <div key={g.term} className={`p-3.5 rounded-xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div
            className="inline-block text-xs font-bold uppercase px-2 py-0.5 rounded-full border mb-2"
            style={{ backgroundColor: tint(dm, '10'), borderColor: tint(dm, '30'), color: accent(dm) }}
          >
            {g.term}
          </div>
          <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{g.def}</p>
        </div>
      ))}
    </div>
  );
}

// ── FAQ Accordion ─────────────────────────────────────────────────────────
function FAQAccordion({ dm }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      {FAQS.map((f, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className={i < FAQS.length - 1 ? `border-b ${dm ? 'border-slate-700/60' : 'border-slate-100'}` : ''}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className={`w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer transition-colors
                ${dm ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}
            >
              <span className={`text-sm font-semibold ${dm ? 'text-white' : 'text-slate-900'}`}>{f.q}</span>
              <span className="shrink-0" style={{ color: accent(dm) }}>{isOpen ? IC.chevU : IC.chevD}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{f.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function CounsellingGuidePage({ darkMode: dm = false, setCurrentView }) {
  const [modal, setModal] = useState(null);
  const openModal  = (item) => setModal(item);
  const closeModal = () => setModal(null);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: dm ? '#0A0F19' : '#F9FAFC' }}>
      {modal && <DetailModal item={modal} dm={dm} onClose={closeModal} />}

      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-8 pb-20">

        {/* ── PAGE HEADER ─────────────────────────────────────────── */}
        <div className="mb-8">
          {/* Back button */}
          {setCurrentView && (
            <button
              onClick={() => setCurrentView("analytics")}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold mb-4 transition-colors cursor-pointer
                ${dm ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {IC.back} Back to Cutoff Data
            </button>
          )}

          <div className={`relative rounded-xl border p-6 md:p-8 overflow-hidden
            ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: accent(dm) }} />

            <div className="flex flex-wrap justify-between gap-6">
              {/* Left: title block */}
              <div className="flex-1 min-w-0">
                <div
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border mb-4"
                  style={{ backgroundColor: tint(dm, '10'), borderColor: tint(dm, '30'), color: accent(dm) }}
                >
                  {IC.shield} MCC Official Guide
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}
                  style={{ color: dm ? undefined : PRIMARY }}>
                  NEET UG Counselling —{' '}
                  <span style={{ color: accent2(dm) }}>Complete Guide</span>
                </h1>
                <p className={`text-sm mt-3 max-w-xl leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                  Every quota code, category benefit, and round strategy — explained in simple English with real numbers.
                  All data sourced from MCC's official information brochures and seat allotment PDFs (mcc.nic.in).
                </p>
              </div>

              {/* Right: Authenticity badge box */}
              <div
                className="p-4 rounded-xl border min-w-[200px] shrink-0"
                style={{ backgroundColor: tint(dm, '06'), borderColor: tint(dm, '22') }}
              >
                <div className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: accent(dm) }}>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tint(dm, '20') }}
                  >
                    <span style={{ color: accent(dm), fontSize: 10 }}>✓</span>
                  </div>
                  Verified Sources
                </div>
                <div className="space-y-2">
                  {[
                    { icon: "📄", text: "Source: mcc.nic.in" },
                    { icon: "🔄", text: "Updated for 2025 Counselling" },
                    { icon: "📊", text: "All Rounds Covered" },
                    { icon: "🏷️", text: "All Quota Codes Explained" },
                  ].map(t => (
                    <div key={t.text} className="flex items-center gap-2 text-xs">
                      <span>{t.icon}</span>
                      <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{t.text}</span>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-3 pt-3 border-t text-xs font-medium"
                  style={{ borderColor: tint(dm, '25'), color: accent(dm) }}
                >
                  ⚡ Trusted by thousands of NEET aspirants
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── QUICK SUMMARY / JUMP NAV ────────────────────────────── */}
        <div
          className={`mb-8 rounded-xl border p-4 ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: accent(dm) }}>
            📋 Quick Summary — Jump to a Section
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "#sec-scope", label: "What MCC Handles" },
              { href: "#sec-compare", label: "MCC vs State" },
              { href: "#sec-eligibility", label: "Eligibility" },
              { href: "#sec-allotment", label: "How Allotment Works" },
              { href: "#sec-quotas", label: "Quota Codes" },
              { href: "#sec-categories", label: "Category Reservation" },
              { href: "#sec-rounds", label: "Counselling Rounds" },
              { href: "#sec-fees", label: "Fees & Refund" },
              { href: "#sec-documents", label: "Documents Required" },
              { href: "#sec-glossary", label: "Glossary" },
              { href: "#sec-faq", label: "FAQs" },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
                  ${dm ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                style={{ backgroundColor: tint(dm, '08'), borderColor: tint(dm, '28'), color: accent(dm) }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* ── SECTION 1: MCC SCOPE ────────────────────────────────── */}
        <div id="sec-scope" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.db}
            title="What Does MCC Handle? — UG Counselling Scope"
            subtitle="MCC (Medical Counselling Committee) under DGHS conducts centralised online counselling for these seats"
            dm={dm}
          />

          <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            {[
              "15% All India Quota (AIQ) seats — MBBS/BDS in Government Medical Colleges across all states and UTs (J&K included from 2022).",
              "100% MBBS/BDS seats — All AIIMS campuses across India (Institutes of National Importance).",
              "100% seats — JIPMER Puducherry and JIPMER Karaikal (Institutes of National Importance).",
              "100% MBBS/BDS seats — Banaras Hindu University (BHU), Varanasi.",
              "100% MBBS/BDS seats — Aligarh Muslim University (AMU), Aligarh.",
              "85% of State Quota seats — Delhi University affiliated colleges (UCMS Delhi), VMMC & Safdarjung Hospital, ABVIMS & Dr. RML Hospital, ESIC Dental College Delhi.",
              "85% of State Quota seats — IP University (GGSIPU) affiliated medical colleges in Delhi.",
              "100% seats — Faculty of Dentistry, Jamia Millia Islamia (New Delhi), including 5% internal Jamia student quota.",
              "15% IP Quota seats — ESIC (Employees State Insurance Corporation) Medical Colleges across India.",
              "100% seats — All Deemed Universities (both Government Deemed and Private Deemed) across India.",
            ].map((text, i) => (
              <div
                key={i}
                className={`flex gap-3 p-4 ${i < 9 ? `border-b ${dm ? 'border-slate-700/60' : 'border-slate-100'}` : ''}
                  ${i % 2 === 1 ? (dm ? 'bg-slate-800/30' : 'bg-slate-50/60') : ''}`}
              >
                <span
                  className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold border"
                  style={{ backgroundColor: tint(dm, '12'), borderColor: tint(dm, '25'), color: accent(dm) }}
                >
                  {i + 1}
                </span>
                <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
              </div>
            ))}
            <div
              className="p-3 border-t"
              style={{ borderColor: tint(dm, '25'), backgroundColor: tint(dm, '06') }}
            >
              <p className="text-xs leading-relaxed" style={{ color: accent(dm) }}>
                <strong>Note:</strong> The remaining 85% State Quota seats of all Government Medical Colleges,
                and 100% seats of all Private Medical Colleges, are handled by respective State/UT Counselling Authorities — not by MCC.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION: MCC vs STATE COMPARISON ────────────────────── */}
        <div id="sec-compare" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.trophy}
            title="MCC vs State Counselling — What's the Difference?"
            subtitle="The single most confusing thing for first-timers. This table clears it up in one glance."
            dm={dm}
          />
          <ComparisonTable dm={dm} />

          {/* Decision guide */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-sm font-bold mb-1.5" style={{ color: accent(dm) }}>Should I register for MCC?</div>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                Yes — almost every NEET-qualified student should register for MCC counselling. It's your only route to
                AIQ seats in EVERY state (not just your own), plus AIIMS, JIPMER, BHU, AMU, and Deemed Universities. There's
                no domicile restriction, so you lose nothing by registering.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="text-sm font-bold mb-1.5" style={{ color: accent2(dm) }}>Should I also register for State Counselling?</div>
              <p className={`text-xs leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                Yes, if you meet your state's domicile rules — State Quota is 85% of every government college's seats,
                a much bigger pool than the 15% AIQ. Most students register for BOTH MCC and their home state's counselling
                at the same time, since the two processes run independently and don't block each other.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION: ELIGIBILITY ────────────────────────────────── */}
        <div id="sec-eligibility" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.shield}
            title="Am I Eligible? — Eligibility Conditions"
            subtitle="Straight from the official bulletin — the minimum bar you need to clear before you can even register"
            dm={dm}
          />
          <EligibilityList dm={dm} />
        </div>

        {/* ── SECTION 2: OPEN vs CATEGORY SEAT ───────────────────── */}
        <div id="sec-allotment" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.book}
            title="Open Seat vs Category Seat — How Allotment Actually Works"
            subtitle="This is the most important concept for choice filling strategy — understand this before filling your preferences"
            dm={dm}
          />

          <div className="space-y-4">
            {/* Step 1 */}
            <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div
                className={`p-3 border-b flex items-center gap-2 ${dm ? 'border-slate-700' : ''}`}
                style={{ backgroundColor: tint(dm, '08'), borderBottomColor: tint(dm, '22') }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border"
                  style={{ backgroundColor: tint(dm, '15'), borderColor: tint(dm, '30'), color: accent(dm) }}
                >
                  1
                </span>
                <span className="text-sm font-bold" style={{ color: accent(dm) }}>MCC Checks Open Seats First</span>
              </div>
              <div className="p-4">
                <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                  When allocating your seat, MCC first checks if an <strong>Open Seat (unrestricted seat)</strong> is available
                  at your AIR in the colleges you have chosen. An Open Seat can be taken by any eligible candidate regardless of category.
                </p>
                <div
                  className="p-3 rounded-lg border"
                  style={{ backgroundColor: tint(dm, '07'), borderColor: tint(dm, '25') }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: accent(dm) }}>
                    <strong>If you get an Open Seat:</strong> You are allotted that Open Seat. Your reserved category seat remains vacant for another candidate.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`rounded-xl border overflow-hidden ${dm ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div
                className={`p-3 border-b flex items-center gap-2 ${dm ? 'border-slate-700' : ''}`}
                style={{ backgroundColor: tint2(dm, '08'), borderBottomColor: tint2(dm, '22') }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold border"
                  style={{ backgroundColor: tint2(dm, '15'), borderColor: tint2(dm, '30'), color: accent2(dm) }}
                >
                  2
                </span>
                <span className="text-sm font-bold" style={{ color: accent2(dm) }}>
                  If No Open Seat — Your Reserved Category is Checked
                </span>
              </div>
              <div className="p-4">
                <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                  If an Open Seat is not available at your AIR, MCC then checks if a seat is available under your reserved category at your AIR.
                </p>
                <div
                  className="p-3 rounded-lg border"
                  style={{ backgroundColor: tint2(dm, '07'), borderColor: tint2(dm, '25') }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: accent2(dm) }}>
                    <strong>Real Numbers Example:</strong> Open closing rank = AIR 1,800 | OBC-NCL = AIR 4,500 | SC = AIR 14,000 | ST = AIR 38,000.
                  </p>
                </div>
              </div>
            </div>

            {/* Critical tip */}
            <div
              className="p-4 rounded-xl border"
              style={{ backgroundColor: tint(dm, '07'), borderColor: tint(dm, '25') }}
            >
              <div className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accent(dm) }}>
                💡 Critical Tip for Choice Filling
              </div>
              <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                <strong>Fill your choices very carefully and in order of your genuine preference.</strong> MCC allocates
                the highest-preference college where a seat is available for you (Open first, then Category).
                If you have a reserved category, <strong>use the Category filter on the Cutoff Data page</strong> to
                see the actual closing rank for your specific category.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: QUOTA CODES ──────────────────────────────── */}
        <div id="sec-quotas" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.trophy}
            title="All Quota Codes Explained"
            subtitle={`${QUOTAS.length} quota types from MCC official seat allotment PDFs — click any card to see full details and a real example`}
            dm={dm}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUOTAS.map(q => <SmallCard key={q.code} item={q} type="quota" dm={dm} onClick={openModal} />)}
          </div>
        </div>

        {/* ── SECTION 4: CATEGORIES ───────────────────────────────── */}
        <div id="sec-categories" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.users}
            title="Category Reservation — Benefits & Real Numbers"
            subtitle={`${CATEGORIES.length} categories — how reservation helps, with actual 2024 closing rank examples. Click any card to see full details.`}
            dm={dm}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map(c => <SmallCard key={c.code} item={c} type="category" dm={dm} onClick={openModal} />)}
          </div>
        </div>

        {/* ── SECTION 5: ROUNDS ───────────────────────────────────── */}
        <div id="sec-rounds" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.trophy}
            title="Counselling Rounds — Strategy for Each Round"
            subtitle="MCC AIQ counselling has 4 rounds. Understanding each round helps you plan when to lock seats and when to participate."
            dm={dm}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROUNDS.map(r => <RoundCard key={r.num} round={r} dm={dm} />)}
          </div>
        </div>

        {/* ── SECTION: FEES & SECURITY DEPOSIT ────────────────────── */}
        <div id="sec-fees" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.db}
            title="Fees & Security Deposit — Exact Amounts"
            subtitle="These figures are fixed nationwide by MCC and are the same regardless of which state you're from"
            dm={dm}
          />
          <FeesTable dm={dm} />

          <div
            className="mt-4 p-4 rounded-xl border"
            style={{ backgroundColor: tint2(dm, '08'), borderColor: tint2(dm, '30') }}
          >
            <div className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accent2(dm) }}>
              💰 Refund Policy — When You Get Your Money Back
            </div>
            <ul className={`space-y-1.5 text-xs leading-relaxed`} style={{ color: accent2(dm) }}>
              <li>• Refund only starts after ALL rounds of counselling (including Stray Vacancy) are fully completed and MCC notifies this on its portal.</li>
              <li>• The Financial Custodian (HLL Lifecare Ltd., a Govt. of India undertaking) begins the refund within 15 working days and completes it within 30 days of the notification.</li>
              <li>• The refund goes ONLY to the exact same bank account/card you originally paid from — keep that account active until refund is complete.</li>
              <li>• If a seat allotted in Round 2 or later is not joined, the security deposit for that round is forfeited (not refunded).</li>
              <li>• You do not need to separately request a refund — MCC publishes an eligible list, and the process starts automatically.</li>
              <li>• MCC does not pay any interest on the security deposit held during the counselling period.</li>
            </ul>
          </div>
        </div>

        {/* ── SECTION: DOCUMENTS REQUIRED ─────────────────────────── */}
        <div id="sec-documents" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.book}
            title="Documents Required at Reporting"
            subtitle="Carry ORIGINALS plus attested photocopies of every document below when you report to your allotted college — incomplete documents can cost you your seat"
            dm={dm}
          />
          <BulletCard items={DOCUMENTS} dm={dm} />
          <p className={`mt-3 text-xs italic leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Some colleges may ask for additional documents specific to them — always check the allotted college's own
            website or contact them directly right after your result is declared.
          </p>
        </div>

        {/* ── SECTION: GLOSSARY ───────────────────────────────────── */}
        <div id="sec-glossary" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.book}
            title="Counselling Dictionary — Terms Explained Simply"
            subtitle="Every important word from the MCC bulletin, explained in plain English so you never get confused again"
            dm={dm}
          />
          <GlossaryGrid dm={dm} />
        </div>

        {/* ── SECTION: FAQ ─────────────────────────────────────────── */}
        <div id="sec-faq" className="mb-8 scroll-mt-24">
          <SectionHeader
            icon={IC.users}
            title="Frequently Asked Questions"
            subtitle="Real questions students ask, answered simply — sourced from MCC's own official FAQ chapter"
            dm={dm}
          />
          <FAQAccordion dm={dm} />
        </div>

        {/* ── COMMON MISTAKES CALLOUT ─────────────────────────────── */}
        <div
          className={`mb-8 p-5 rounded-xl border ${dm ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}
        >
          <div className={`text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${dm ? 'text-amber-300' : 'text-amber-800'}`}>
            ⚠️ Common Mistakes to Avoid
          </div>
          <ul className={`space-y-2 text-sm leading-relaxed ${dm ? 'text-amber-100/90' : 'text-amber-900'}`}>
            <li>• Filling choices randomly instead of in genuine order of preference — MCC allots the highest-preference seat you're eligible for, so a wrongly ordered list can cost you a better seat.</li>
            <li>• Not reporting or paying the acceptance fee after Round 1/2 allotment — this can lead to debarment from future rounds.</li>
            <li>• Checking only the Open/UR closing rank when you belong to a reserved category — always use the category filter on the Cutoff Data page to see the real closing rank for your category.</li>
            <li>• Skipping Round 2 because you already have a seat — you can almost always participate in upgrade rounds while keeping your current seat safe.</li>
            <li>• Ignoring Stray Vacancy round — some good seats appear here at the very last moment due to late withdrawals.</li>
            <li>• Not filling FRESH choices in Round 2/Round 3 — your earlier round's choice list is void, so if you skip fresh choice filling you get no new allotment that round.</li>
            <li>• Confusing AIQ (15% central, domicile-free) with State Quota (85%, needs domicile) — many students think registering for MCC alone is enough; check your state's own counselling too.</li>
            <li>• Joining a Round 3 seat without being sure — once joined, there is NO exit; you cannot resign even with genuine reasons.</li>
            <li>• Giving wrong information at registration (name, category, etc.) — MCC pulls this directly from your NTA form and will not edit it under any circumstances, and wrong info can get your admission cancelled later.</li>
            <li>• Waiting until the last day to report to your allotted college — some colleges take 2–3 days to complete formalities, and missing the deadline cancels your seat with no extension.</li>
          </ul>
        </div>

        {/* ── SECTION 6: DATA DISCLAIMER ──────────────────────────── */}
        <div
          className={`p-5 rounded-xl border flex items-start gap-4
            ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
          style={{ borderColor: dm ? undefined : tint(dm, '25'), backgroundColor: dm ? undefined : tint(dm, '06') }}
        >
          <div
            className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border"
            style={{ backgroundColor: tint(dm, '15'), borderColor: tint(dm, '35'), color: accent(dm) }}
          >
            {IC.shield}
          </div>
          <div>
            <div className="text-sm font-bold mb-2" style={{ color: accent(dm) }}>
              About Our Data — Accuracy &amp; Sources
            </div>
            <p className={`text-sm leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              All Opening and Closing Rank data on RankSetu is sourced directly from the official MCC seat allotment result PDFs
              published on mcc.nic.in — no estimation or approximation involved. The Eligibility, Fees, Refund Policy, Documents,
              Round-wise process, and FAQ sections above are paraphrased directly from MCC's official <strong>NEET-UG 2025 Information
              Bulletin & Counselling Scheme</strong> — nothing in those sections is guessed or invented.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {["Source: mcc.nic.in official PDFs", "No estimation involved", "Years 2020–2024 covered", "Round-wise data preserved", "Category-wise data preserved"].map(item => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
                  style={{ backgroundColor: tint(dm, '10'), borderColor: tint(dm, '28'), color: accent(dm) }}
                >
                  <span style={{ color: accent2(dm) }}>{IC.check}</span> {item}
                </span>
              ))}
            </div>
            <p className={`text-xs italic leading-relaxed ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
              MCC guidelines and reservation rules are updated by the Government of India for each counselling year.
              Always refer to the latest official MCC Information Brochure on mcc.nic.in for the current year's rules.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}