'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertCircle, Info, ArrowRight } from 'lucide-react';

const ROUNDS = [
  {
    name:   'Round 1',
    period: 'Registration & Choice Filling',
    date:   'August 2025 (expected)',
    steps:  [
      'Register on mcc.nic.in and pay security deposit',
      'Fill your college choices in order of preference',
      'Lock your choice list before the deadline',
      'Wait for seat allotment result to be published',
    ],
    status: 'upcoming',
    color:  '#1A3C6E',
  },
  {
    name:   'Round 2',
    period: 'Second Allotment Round',
    date:   'September 2025',
    steps:  [
      'Report to allotted college from Round 1 OR participate in Round 2 for upgrade',
      'Fresh choice filling allowed for upgrading candidates',
      'New seat allotment result published after this round',
    ],
    status: 'upcoming',
    color:  '#2563EB',
  },
  {
    name:   'Mop-Up Round',
    period: 'Remaining Vacant Seats',
    date:   'October 2025',
    steps:  [
      'Only unfilled seats from Rounds 1 & 2 are available',
      'No change in college reporting deadline',
      'Final chance for most candidates to secure a seat',
    ],
    status: 'upcoming',
    color:  '#D97706',
  },
  {
    name:   'Stray Vacancy Round',
    period: 'Last Opportunity',
    date:   'November 2025',
    steps:  [
      'Seats that remain vacant post Mop-Up round',
      'Walk-in or online allocation at college level',
      'Reporting deadline is strict — do not miss it',
    ],
    status: 'upcoming',
    color:  '#EA580C',
  },
];

const statusIcon = (status, dm) => {
  if (status === 'done')   return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
  if (status === 'active') return <AlertCircle  className="w-5 h-5 text-amber-500"   />;
  return <Clock className={`w-5 h-5 ${dm ? 'text-slate-500' : 'text-slate-400'}`} />;
};

// ── Quick Tips ──────────────────────────────────────────────────────────────
const TIPS = [
  { icon: '📌', text: 'Registration is mandatory before choice filling — do not skip it.' },
  { icon: '🔒', text: 'Lock your choice list before the deadline. Late changes are not accepted.' },
  { icon: '📅', text: 'Reporting deadlines are strict. Missing them means forfeiture of your seat.' },
  { icon: '🔄', text: 'Round 2 upgrades are available only if you choose to participate — it is optional.' },
];

export default function CounsellingTimeline({ darkMode }) {
  const dm = darkMode;

  return (
    <div className={`min-h-screen ${dm ? 'bg-[#0A0F19]' : 'bg-[#F9FAFC]'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">

        {/* ── Page Introduction ─────────────────────────────────── */}
        <div className={`mb-10 pb-8 border-b ${dm ? 'border-slate-800' : 'border-slate-200'}`}>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-2 text-[#1A3C6E]">
            Counselling Timeline
          </p>
          <h1 className={`text-4xl sm:text-5xl font-bold tracking-tight mb-4 ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>
            NEET UG Counselling Schedule
          </h1>
          <p className={`text-base leading-relaxed max-w-2xl mb-4 ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            The MCC conducts NEET UG counselling in multiple rounds — Round 1, Round 2, Mop-Up, and Stray Vacancy.
            Each round has strict registration, choice-filling, and reporting deadlines. Missing any of them can cost you your seat.
          </p>
          <p className={`text-sm leading-relaxed max-w-2xl ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Use this page to track every important date and understand what you need to do at each stage.
            Dates here are estimated from the 2024 schedule — always verify on the official MCC portal before acting.
          </p>
        </div>

        {/* ── Quick Tips ────────────────────────────────────────── */}
        <div className={`mb-8 p-5 rounded-xl border ${dm ? 'bg-slate-800/40 border-slate-700' : 'bg-[#1A3C6E]/5 border-[#1A3C6E]/15'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#1A3C6E]" />
            <p className={`text-sm font-black ${dm ? 'text-white' : 'text-[#1A3C6E]'}`}>
              Key Things to Remember
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TIPS.map((tip, i) => (
              <div key={i} className={`flex items-start gap-2.5 text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="text-base shrink-0 mt-px">{tip.icon}</span>
                <span className="leading-relaxed">{tip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Round Overview ────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] mb-1 text-[#1A3C6E]">
            Round Schedule
          </p>
          <h2 className={`text-xl font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
            All Counselling Rounds — 2025
          </h2>
          <p className={`text-sm mt-1 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Tap any round to see what steps are required.
          </p>
        </div>

        {/* ── Timeline ─────────────────────────────────────────── */}
        <div className="relative mt-2">
          {/* Vertical connector line */}
          <div
            className="absolute left-5 top-5 bottom-5 w-px hidden sm:block"
            style={{ backgroundColor: dm ? 'rgba(71,85,105,0.5)' : 'rgba(226,232,240,1)' }}
          />

          <div className="space-y-4">
            {ROUNDS.map((round, i) => (
              <div key={round.name} className="relative flex flex-col sm:flex-row gap-4 sm:gap-6">

                {/* Step number indicator */}
                <div className="shrink-0 flex sm:flex-col items-center gap-2 sm:gap-0 z-10">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-black text-sm
                      ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}
                    style={{ color: round.color }}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`flex-1 p-5 rounded-xl border transition-all mb-1
                    ${dm ? 'bg-slate-800/60 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
                >
                  {/* Left color accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl hidden"
                    style={{ backgroundColor: round.color }}
                  />

                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <p
                        className="text-[11px] font-black uppercase tracking-[0.15em] mb-0.5"
                        style={{ color: round.color }}
                      >
                        {round.name}
                      </p>
                      <h3 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
                        {round.period}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0
                        ${dm ? 'border-slate-600 bg-slate-700/60 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                    >
                      <Calendar className="w-3 h-3" />
                      {round.date}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {round.steps.map((step) => (
                      <li key={step} className={`flex items-start gap-2.5 text-sm ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
                        <ArrowRight
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: round.color, opacity: 0.7 }}
                        />
                        {step}
                      </li>
                    ))}
                  </ul>

                  {/* Status pill */}
                  <div className="mt-4 flex items-center gap-2">
                    {statusIcon(round.status, dm)}
                    <span className={`text-xs font-bold capitalize ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      {round.status === 'upcoming' ? 'Upcoming — dates to be confirmed on mcc.nic.in' : round.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Official Note ─────────────────────────────────────── */}
        <div
          className={`mt-8 p-5 rounded-xl border text-sm flex items-start gap-3
            ${dm ? 'border-slate-700 bg-slate-800/40 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
        >
          <Info className={`w-4 h-4 shrink-0 mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-400'}`} />
          <p>
            <strong className={dm ? 'text-white' : 'text-slate-900'}>Important:</strong>{' '}
            Exact dates are announced by MCC on{' '}
            <span className="font-bold text-[#1A3C6E]">mcc.nic.in</span>.
            The dates shown above are estimated based on the 2024 counselling schedule.
            Always verify on the official MCC portal before taking any action.
          </p>
        </div>

      </div>
    </div>
  );
}