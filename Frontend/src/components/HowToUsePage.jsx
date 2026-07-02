'use client';

import React, { useState } from 'react';
import {
  Building2, BarChart2, Leaf, Award, MapPin, Target, TrendingUp, Layers,
  BookOpen, Calendar, ChevronDown, ArrowRight, AlertTriangle, Users,
  Lightbulb, Search, HelpCircle, PlayCircle, Sparkles, Heart, Compass,
  Share2, Clock3,
} from 'lucide-react';

const PRIMARY     = '#1A3C6E';
const INTERACTIVE = '#2563EB';

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO SLOTS — every section below has a `videoId` field. Leave it as an
// empty string for now (renders a "coming soon" placeholder in the correct
// 16:9 aspect ratio). Once a demo video is recorded, just paste the YouTube
// video ID here (the part after "v=" or after youtu.be/) and it upgrades
// to a real embedded player automatically — no other code changes needed.
//   e.g. videoId: 'dQw4w9WgXcQ'  →  https://www.youtube.com/embed/dQw4w9WgXcQ
// ─────────────────────────────────────────────────────────────────────────────

function VideoSlot({ videoId, title, dm }) {
  if (videoId) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border" style={{ borderColor: dm ? '#1e293b' : '#e2e8f0' }}>
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={`${title} — demo video`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }
  return (
    <div
      className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2.5 text-center px-6 ${
        dm ? 'border-slate-700 bg-slate-800/30' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: dm ? 'rgba(37,99,235,0.15)' : 'rgba(26,60,110,0.08)' }}
      >
        <PlayCircle className="w-6 h-6" style={{ color: INTERACTIVE }} />
      </div>
      <p className={`text-xs font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
        {title} — video demo coming soon
      </p>
      <p className={`text-[11px] ${dm ? 'text-slate-600' : 'text-slate-400'}`}>Reserved space for a YouTube walkthrough</p>
    </div>
  );
}

// ── Every page currently in the project, in the order a new user would
// actually reach them ────────────────────────────────────────────────────────
const PAGES = [
  {
    id: 'home',
    icon: Compass,
    color: PRIMARY,
    title: 'Home',
    view: 'home',
    videoId: '',
    what: 'Your starting point — trust stats, the College Directory banner, a "How It Works" strip, and a filterable grid of every tool on the platform.',
    who: 'Everyone. This is where every visitor lands first.',
    steps: [
      'Skim the trust bar at the top for a quick sense of scale (colleges mapped, records covered).',
      'Use the category filter (All / Colleges / Cutoff Data / Smart Tools / Resources) to jump straight to the kind of tool you need.',
      'Click any feature card to open that tool directly — no extra navigation needed.',
    ],
    note: 'If you\u2019re completely new, start with this guide instead of jumping straight into a tool — five minutes here saves a lot of confusion later.',
  },
  {
    id: 'college-directory',
    icon: Building2,
    color: '#2563EB',
    title: 'College Directory',
    view: 'college-info',
    videoId: '',
    what: 'A searchable list of every medical college on the platform. Clicking a college opens its own dedicated College Detail Page — fee structure, seat matrix, admission details and a multi-year cutoff trend graph.',
    who: 'Anyone who already knows a college name and wants the full picture before adding it to a choice list.',
    steps: [
      'Open College Directory from the navbar (under "Colleges") or the homepage banner.',
      'Search by name, or filter by state and college type (Govt / Deemed / Private / AIIMS).',
      'Click a college card — this opens its individual College Detail Page.',
      'On the detail page, scroll to the trend graph to see how its closing rank has moved over the last few years.',
    ],
    note: 'Judging a college only by name recognition is a common trap — always check the actual closing rank for your category on its detail page.',
  },
  {
    id: 'mcc-cutoffs',
    icon: BarChart2,
    color: PRIMARY,
    title: 'MCC Cutoff Explorer',
    view: 'mcc',
    videoId: '',
    what: 'Year-wise, round-wise opening & closing ranks for every MCC college — AIQ, AIIMS, JIPMER, and Deemed universities.',
    who: 'Anyone shortlisting colleges under All-India Quota or Deemed/Central counselling.',
    steps: [
      'Select the counselling year and round you want to check.',
      'Filter by category (General, OBC, SC, ST, EWS, PwD) — cutoffs vary a lot by category.',
      'Search or filter by college/branch to narrow down to exact opening and closing ranks.',
      'Compare 2–3 years of the same round to see if a college\u2019s cutoff is trending up or down.',
    ],
    note: 'Looking at only the latest year\u2019s closing rank can mislead you — one year can be an outlier, so always check the trend.',
  },
  {
    id: 'ayush-cutoffs',
    icon: Leaf,
    color: '#16A34A',
    title: 'Ayush Cutoff Explorer',
    view: 'ayush',
    videoId: '',
    what: 'Opening & closing ranks for BAMS, BHMS, BUMS and BNYS seats under Ayush counselling.',
    who: 'NEET candidates targeting Ayurveda, Homeopathy, Unani or Naturopathy courses.',
    steps: [
      'Choose the Ayush course type (BAMS / BHMS / BUMS / BNYS).',
      'Filter by state or college to compare rank cutoffs.',
      'Cross-check with the MCC explorer if you\u2019re also weighing MBBS/BDS as a parallel option.',
    ],
    note: 'Ayush cutoffs don\u2019t follow the same pattern as MBBS cutoffs — read this pool\u2019s data on its own terms.',
  },
  {
    id: 'aiims-hub',
    icon: Award,
    color: PRIMARY,
    title: 'AIIMS Hub',
    view: 'aiims-hub',
    videoId: '',
    what: 'A dedicated section with cutoff data for every AIIMS campus across India.',
    who: 'Candidates specifically targeting an AIIMS seat.',
    steps: [
      'Pick an AIIMS campus — New Delhi, or any of the newer regional AIIMS.',
      'Select round and category to see the exact closing rank for that campus.',
      'Compare closing ranks across campuses to gauge relative difficulty.',
    ],
    note: 'Don\u2019t compare a newer AIIMS campus directly against AIIMS New Delhi — newer campuses usually have very different closing ranks.',
  },
  {
    id: 'state-cutoffs',
    icon: MapPin,
    color: PRIMARY,
    title: 'State Quota Cutoffs',
    view: 'state',
    videoId: '',
    what: 'Opening & closing ranks for state government quota seats, filtered by state and counselling authority.',
    who: 'Candidates counting on their home-state quota as part of their strategy.',
    steps: [
      'Select your state and the relevant counselling authority.',
      'Filter by category and college to see state-quota rank ranges.',
      'Keep this separate from All-India Quota ranks — they are two different pools for the same college.',
    ],
    note: 'Mixing up All-India Quota and State Quota cutoffs for the same college is one of the most common reading mistakes.',
  },
  {
    id: 'choice-optimizer',
    icon: Target,
    color: INTERACTIVE,
    title: 'AI Choice Optimizer',
    view: 'optimizer',
    videoId: '',
    what: 'Enter your rank and category to get an AI-ranked list of colleges by real admission probability, grouped roughly into Dream / Target / Safe zones. Results can also be turned into a shareable Share Card.',
    who: 'Anyone who wants a data-backed starting point for their choice list instead of guessing.',
    steps: [
      'Enter your NEET rank, category, and any state-quota eligibility.',
      'Review the Dream / Target / Safe grouping in your results.',
      'Send colleges you like straight to the Choice List Builder to fine-tune ordering.',
      'Optionally generate a Share Card to save or share your result summary.',
    ],
    note: 'Treat the AI list as a strong starting point, not a guarantee — always sanity-check a few colleges yourself in the Cutoff Explorer.',
  },
  {
    id: 'choice-lab',
    icon: Layers,
    color: PRIMARY,
    title: 'Choice List Builder (Choice Lab)',
    view: 'lab',
    videoId: '',
    what: 'Build, drag-to-reorder, and audit your final MCC preference list before you submit it on the official portal.',
    who: 'Anyone finalising their actual choice-filling order.',
    steps: [
      'Add colleges from the Cutoff Explorer or Choice Optimizer — they appear here automatically.',
      'Drag cards to reorder from most to least preferred.',
      'Watch for conflict warnings that flag risky orderings.',
      'Note down your final order, then enter it manually on mcc.nic.in.',
    ],
    note: 'This list is a planning tool, not the actual submission form — the real choice filling still happens on the official MCC portal.',
  },
  {
    id: 'upgrade-probability',
    icon: TrendingUp,
    color: '#EA580C',
    title: 'Upgrade Probability',
    view: 'upgrade',
    videoId: '',
    what: 'Estimates your chances of getting a better college in the next round, based on historical seat-movement patterns.',
    who: 'Candidates who got an allotment and are deciding whether to float/upgrade or accept and lock it.',
    steps: [
      'Enter the college and rank you were allotted in the current round.',
      'Review the estimated upgrade probability for the next round.',
      'Weigh that probability against the risk of losing your current seat if you float.',
    ],
    note: 'Check the exit/forfeiture rules for that round before floating — some rounds penalise backing out after allotment.',
  },
  {
    id: 'counselling-guide',
    icon: BookOpen,
    color: PRIMARY,
    title: 'Counselling Guide',
    view: 'counselling',
    videoId: '',
    what: 'The complete rulebook — quota codes, category & reservation rules, and the full round-by-round MCC process, all in one place.',
    who: 'Everyone — especially first-time candidates and parents who are new to the process.',
    steps: [
      'Start with the quota codes section to understand AI, AI-AIIMS, PS, NRI and other codes.',
      'Read the category/reservation section to know exactly what benefit applies to you.',
      'Go through the round-wise section before each round opens, so you know what to expect.',
    ],
    note: 'Process mistakes — missed document verification, wrong quota selection — cost far more seats than rank issues do. Read this before your first round.',
  },
  {
    id: 'timeline',
    icon: Calendar,
    color: '#D97706',
    title: 'Counselling Timeline',
    view: 'timeline',
    videoId: '',
    what: 'Every important MCC date — registration, choice filling windows, result dates, and reporting deadlines.',
    who: 'Everyone currently in an active counselling cycle.',
    steps: [
      'Check the timeline as soon as MCC releases the counselling schedule.',
      'Set your own reminders a day before each deadline.',
      'Re-check after every round — next-round dates are usually announced only once the current round closes.',
    ],
    note: 'Treat every published date as final — deadlines are rarely extended.',
  },
  {
    id: 'about-us',
    icon: Heart,
    color: PRIMARY,
    title: 'About RankSetu',
    view: 'about-us',
    videoId: '',
    what: 'The story behind the platform, its mission, and the team building it.',
    who: 'Anyone who wants to know who\u2019s behind the data before trusting it with their counselling decisions.',
    steps: [
      'Open About RankSetu from the Resources menu.',
      'Read the mission section to understand why the platform exists.',
    ],
    note: null,
  },
  {
    id: 'rank-predictor',
    icon: Sparkles,
    color: '#047857',
    title: 'Rank Predictor',
    view: 'predictor',
    videoId: '',
    what: 'A planned tool to predict your expected NEET rank from your raw score, before the official result is out.',
    who: 'NEET candidates waiting for their result.',
    steps: [
      'This page currently shows a "Coming Soon" placeholder — the tool is in active development.',
      'Check back after your exam, or watch the Resources menu for when it goes live.',
    ],
    note: 'Marked as Coming Soon and kept out of search indexing until the real tool ships.',
    comingSoon: true,
  },
];

// ── FAQs ──────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'Is RankSetu free to use?', a: 'Yes. Every tool on RankSetu — cutoff data, the Choice Optimizer, Choice List Builder, and all guides — is free, with no login required.' },
  { q: 'Where does the cutoff data come from?', a: 'All cutoff data is sourced directly from official MCC seat allotment PDFs and state counselling authority publications, not estimated or crowd-sourced.' },
  { q: 'Does RankSetu submit my choices to MCC for me?', a: 'No. The Choice List Builder is a planning tool to help you organise and audit your preference order. You still need to enter your final choices yourself on the official MCC portal.' },
  { q: 'How accurate is the Choice Optimizer\u2019s prediction?', a: 'It\u2019s built from historical rank and seat-movement data, so it\u2019s a strong data-backed starting point — but always double-check a few colleges yourself in the Cutoff Explorer before finalising.' },
  { q: 'What\u2019s the difference between All-India Quota and State Quota cutoffs?', a: 'AIQ seats are open to candidates from any state and counselled by MCC. State Quota seats are counselled by each state\u2019s own authority, usually with a lower cutoff for domiciled candidates. Always check both separately for the same college.' },
  { q: 'Why do I see different closing ranks for the same college in different rounds?', a: 'Closing ranks shift every round as seats vacate through upgrades and withdrawals. Later rounds typically have more relaxed closing ranks than Round 1.' },
  { q: 'I\u2019m new to NEET counselling — where should I start?', a: 'Start with the Counselling Guide to understand the process, check the Timeline for dates, then use the Choice Optimizer once your rank is out to see which colleges are realistic for you.' },
];

const TIPS = [
  'Always filter by your own category before comparing cutoffs — General and reserved-category ranks can differ by thousands of positions.',
  'Build a Dream / Target / Safe spread in your choice list, not just your top picks — this protects you against a tougher-than-expected round.',
  'Re-check the Cutoff Explorer after every round; closing ranks shift as seats vacate through upgrades.',
  'Keep documents ready before choice filling opens — verification delays are one of the most common reasons candidates lose a round.',
  'Use the Upgrade Probability tool before deciding to float a seat — know the risk before you risk your current allotment.',
  'Bookmark the Counselling Timeline and check it at the start of every round — MCC dates are rarely extended.',
];

// ── Small building blocks ────────────────────────────────────────────────────
function JumpChip({ label, targetId, dm }) {
  return (
    <button
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      className={`text-xs font-bold px-3 py-1.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
        dm ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

// A full-width editorial row: text content on the left, a reserved video
// slot on the right. This deliberately does NOT sit inside a bordered card —
// each page gets the full width of the layout, separated by a divider,
// the way a documentation site or help center article would read.
function PageSection({ page, dm, setCurrentView, index }) {
  const Icon = page.icon;
  const tint = dm ? 'rgba(255,255,255,0.02)' : 'rgba(26,60,110,0.015)';
  return (
    <section
      id={page.id}
      className="scroll-mt-24 py-8 sm:py-10"
      style={{ backgroundColor: index % 2 === 1 ? tint : 'transparent' }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10 items-start">
        {/* ── Left: full explanation ── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${page.color}18`, color: page.color }}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: page.color }}>
                {String(index + 1).padStart(2, '0')} · {page.comingSoon ? 'Coming Soon' : 'Live Page'}
              </p>
              <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>{page.title}</h2>
            </div>
          </div>

          <p className={`text-[15px] leading-relaxed mb-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{page.what}</p>

          <p className={`text-sm mb-5 ${dm ? 'text-slate-500' : 'text-slate-500'}`}>
            <span className="font-bold" style={{ color: page.color }}>Best for: </span>{page.who}
          </p>

          <p className={`text-xs font-black uppercase tracking-widest mb-2.5 flex items-center gap-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            <PlayCircle className="w-3.5 h-3.5" /> How to use it
          </p>
          <ol className="space-y-2 mb-5">
            {page.steps.map((s, i) => (
              <li key={i} className={`text-sm leading-relaxed flex gap-3 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black text-white mt-0.5" style={{ backgroundColor: page.color }}>
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>

          {page.note && (
            <div className={`flex gap-2.5 items-start text-xs leading-relaxed p-3 rounded-xl border mb-5 ${
              dm ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{page.note}</span>
            </div>
          )}

          <button
            onClick={() => setCurrentView(page.view)}
            className="inline-flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-xl text-white cursor-pointer transition-transform hover:translate-x-0.5"
            style={{ backgroundColor: page.color }}
          >
            {page.comingSoon ? 'Preview Page' : `Open ${page.title}`} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Right: reserved video space ── */}
        <div className="lg:sticky lg:top-24">
          <VideoSlot videoId={page.videoId} title={page.title} dm={dm} />
        </div>
      </div>
    </section>
  );
}

function FaqItem({ item, dm, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`border-b last:border-b-0 ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-3 py-4 text-left cursor-pointer">
        <span className={`text-sm font-bold flex items-center gap-2 ${dm ? 'text-white' : 'text-slate-900'}`}>
          <HelpCircle className="w-4 h-4 shrink-0" style={{ color: PRIMARY }} />
          {item.q}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className={`pb-4 pl-6 text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{item.a}</p>}
    </div>
  );
}

const JUMP_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'college-directory', label: 'College Directory' },
  { id: 'mcc-cutoffs', label: 'MCC Cutoffs' },
  { id: 'ayush-cutoffs', label: 'Ayush Cutoffs' },
  { id: 'aiims-hub', label: 'AIIMS Hub' },
  { id: 'state-cutoffs', label: 'State Cutoffs' },
  { id: 'choice-optimizer', label: 'Choice Optimizer' },
  { id: 'choice-lab', label: 'Choice Lab' },
  { id: 'upgrade-probability', label: 'Upgrade Probability' },
  { id: 'counselling-guide', label: 'Counselling Guide' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'about-us', label: 'About Us' },
  { id: 'rank-predictor', label: 'Rank Predictor' },
  { id: 'htu-tips', label: 'Tips' },
  { id: 'htu-faq', label: 'FAQs' },
];

// ── Main component ───────────────────────────────────────────────────────────
export default function HowToUsePage({ darkMode = false, setCurrentView }) {
  const dm = darkMode;

  return (
    <div>
      {/* ── Intro ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 shrink-0 mt-0.5" style={{ color: INTERACTIVE }} />
          <p className={`text-[15px] leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            Every page on RankSetu, explained end to end — what it does, who it&rsquo;s for, and exactly how to use
            it. Each section below has a reserved spot on the right for a short demo video, so as walkthroughs
            get recorded they\u2019ll drop straight in — no redesign needed.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap overflow-x-auto pb-1">
          {JUMP_SECTIONS.map(s => <JumpChip key={s.id} label={s.label} targetId={s.id} dm={dm} />)}
        </div>
      </div>

      {/* ── Full-width page-by-page walkthrough ──────────────────────── */}
      <div className={`border-t ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
        {PAGES.map((page, i) => (
          <div key={page.id} className={`border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
            <PageSection page={page} dm={dm} setCurrentView={setCurrentView} index={i} />
          </div>
        ))}
      </div>

      {/* ── Tips & best practices ──────────────────────────────────────── */}
      <div id="htu-tips" className="mt-10 mb-10 scroll-mt-24">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-4" style={{ color: PRIMARY }}>Tips & Best Practices</p>
        <div className="space-y-3">
          {TIPS.map((tip, i) => (
            <div key={i} className={`flex items-start gap-3 pb-3 border-b last:border-b-0 ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
              <p className={`text-sm leading-relaxed ${dm ? 'text-slate-300' : 'text-slate-600'}`}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQs ────────────────────────────────────────────────────────── */}
      <div id="htu-faq" className="mb-4 scroll-mt-24">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: PRIMARY }}>Frequently Asked Questions</p>
        <div>
          {FAQS.map((f, i) => <FaqItem key={f.q} item={f} dm={dm} defaultOpen={i === 0} />)}
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
      <div className={`mt-10 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        dm ? 'bg-gradient-to-r from-[#102347] to-[#0B0F19] border-blue-500/30' : 'bg-gradient-to-r from-[#EEF4FF] to-white border-blue-200'
      }`}>
        <div>
          <p className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>Ready to find your college?</p>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Start with your rank in the AI Choice Optimizer, or browse the full College Directory.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => setCurrentView('optimizer')}
            className="flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-xl text-white cursor-pointer transition-transform hover:translate-x-0.5"
            style={{ backgroundColor: INTERACTIVE }}>
            <Target className="w-4 h-4" /> Choice Optimizer
          </button>
          <button onClick={() => setCurrentView('college-info')}
            className={`flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-xl cursor-pointer transition-transform hover:translate-x-0.5 border ${
              dm ? 'border-slate-600 text-white' : 'border-slate-300 text-slate-800 bg-white'
            }`}>
            <Search className="w-4 h-4" /> College Directory
          </button>
        </div>
      </div>
    </div>
  );
}