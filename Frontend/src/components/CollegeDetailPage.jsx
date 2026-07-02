// =============================================================================
// components/CollegeDetailPage.jsx — REDESIGNED + Trend Graph (Graphd) wired in
// =============================================================================
'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import TrendModal from '@/components/Graphd';

const Ic = {
  MapPin: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Link:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Bldg:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9"/><path d="M15 21V9"/><path d="M3 12h18"/></svg>,
  Chart:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Book:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  Layers: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Seat:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 19v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7"/><path d="M4 14h16"/><path d="M6 19v2M18 19v2"/></svg>,
  ChevD:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

function Section({ id, title, dm, action, children }) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-2xl border mb-5 overflow-hidden ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
        <h2 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Table({ head, rows, dm, empty = 'No data available yet.' }) {
  if (!rows || rows.length === 0) {
    return <p className={`text-sm ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className={dm ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-50 text-slate-500'}>
            {head.map(h => <th key={h} className="text-left font-bold px-3 py-2 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-t transition-colors ${dm ? 'border-slate-700/60 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
              {r.map((c, j) => <td key={j} className="px-3 py-2 whitespace-nowrap">{c ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── In-page section nav — sticky pill bar, click scrolls smoothly ──────────
function SectionNav({ items, dm }) {
  return (
    <div className={`sticky top-0 z-10 -mx-1 px-1 py-2 mb-5 overflow-x-auto scrollbar-none backdrop-blur
      ${dm ? 'bg-slate-900/80' : 'bg-slate-50/90'}`}>
      <div className="flex gap-1.5 w-max">
        {items.map(it => (
          <a key={it.id} href={`#${it.id}`}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all
              ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:text-white'
                   : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700'}`}>
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function CollegeDetailPage({ data, darkMode = false }) {
  const dm = darkMode;
  const { institute, courses = [], counselingTypes = [], cutoffs = [], fees = [], seatMatrix = [], bond = [], admissionInfo } = data;

  const [cutoffYear, setCutoffYear] = useState('ALL');
  const years = Array.from(new Set(cutoffs.map(c => c.year))).sort((a, b) => b - a);
  const visibleCutoffs = cutoffYear === 'ALL' ? cutoffs : cutoffs.filter(c => c.year === cutoffYear);

  // ── Trend graph (Graphd / TrendModal) state ───────────────────────────────
  const [trendOpen, setTrendOpen] = useState(false);
  const [trendCounseling, setTrendCounseling] = useState(counselingTypes[0] || '');

  const totalSeats = useMemo(
    () => seatMatrix.reduce((sum, s) => sum + (Number(s.seat_total_intake) || 0), 0),
    [seatMatrix]
  );

  const navItems = [
    { id: 'overview',  label: 'Overview' },
    { id: 'cutoffs',   label: 'Cut Off' },
    { id: 'fees',      label: 'Fees' },
    { id: 'seats',     label: 'Seat Matrix' },
    { id: 'bond',      label: 'Bond' },
    { id: 'admission', label: 'Admission' },
  ];

  return (
    <div className={`max-w-5xl mx-auto ${dm ? 'text-slate-200' : 'text-slate-800'}`}>
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className={`text-xs font-semibold mb-4 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href="/college-info" className="hover:underline">College Directory</Link>
        {institute.state && <> {' / '} <Link href={`/college-info?state=${encodeURIComponent(institute.state)}`} className="hover:underline">{institute.state}</Link></>}
        {' / '}
        <span className={dm ? 'text-slate-300' : 'text-slate-600'}>{institute.name}</span>
      </nav>

      {/* HERO HEADER — gradient panel, same visual language as the directory's StatsBanner */}
      <header className={`rounded-2xl border mb-5 overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}>
        <div className="p-6"
          style={{ background: dm ? 'linear-gradient(120deg,#102347,#0F1E3D 60%,#0B0F19)' : 'linear-gradient(120deg,#EEF4FF,#F4F8FF 60%,#FFFFFF)' }}>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border"
              style={{ backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.3)', color: '#2563EB' }}>
              <Ic.Bldg/>
            </div>
            <div className="flex-1 min-w-[220px]">
              <h1 className={`text-xl sm:text-2xl font-black tracking-tight mb-1.5 ${dm ? 'text-white' : 'text-slate-900'}`}>{institute.name}</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                {institute.state && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${dm ? 'bg-slate-800/80 text-slate-300' : 'bg-white/80 text-slate-600'}`}>
                    <Ic.MapPin/>{institute.state}
                  </span>
                )}
                {institute.college_type && (
                  <span className="px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#2563EB' }}>{institute.college_type}</span>
                )}
                {institute.affiliated_university && (
                  <span className={`px-2.5 py-1 rounded-full ${dm ? 'bg-slate-800/80 text-slate-300' : 'bg-white/80 text-slate-600'}`}>
                    Affiliated: {institute.affiliated_university}
                  </span>
                )}
              </div>
              {institute.address && <p className={`text-xs mt-2.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{institute.address}</p>}

              {/* ACTION ROW */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {cutoffs.length > 0 && (
                  <>
                    <button onClick={() => setTrendOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
                      style={{ backgroundColor: '#1A3C6E' }}>
                      <Ic.Chart/>View Cutoff Trend Graph
                    </button>
                    {counselingTypes.length > 1 && (
                      <div className="relative">
                        <select value={trendCounseling} onChange={e => setTrendCounseling(e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-2 rounded-xl border text-xs font-bold
                            ${dm ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                          {counselingTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                        </select>
                        <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? 'text-slate-500' : 'text-slate-400'}`}><Ic.ChevD/></span>
                      </div>
                    )}
                  </>
                )}
                {institute.website && (
                  <a href={institute.website} target="_blank" rel="noopener noreferrer nofollow"
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5
                      ${dm ? 'border-slate-600 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-white'}`}>
                    <Ic.Link/>Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* QUICK STAT STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { icon: Ic.Book,   label: 'Courses Offered',    value: courses.length || '—' },
              { icon: Ic.Layers, label: 'Counselling Types',  value: counselingTypes.length || '—' },
              { icon: Ic.Seat,   label: 'Total Seat Intake',  value: totalSeats ? totalSeats.toLocaleString('en-IN') : '—' },
              { icon: Ic.Chart,  label: 'Years of Cutoff Data', value: years.length || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${dm ? 'bg-slate-900/40 border-slate-700' : 'bg-white/70 border-white'}`}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(26,60,110,0.1)', color: '#1A3C6E' }}>
                  <Icon/>
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-black leading-tight truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{value}</p>
                  <p className={`text-[10px] font-bold leading-tight ${dm ? 'text-slate-500' : 'text-slate-500'}`}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* IN-PAGE SECTION NAV */}
      <SectionNav items={navItems} dm={dm} />

      {/* QUICK FACTS */}
      <Section id="overview" title="Overview" dm={dm}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className={`text-[11px] font-bold uppercase mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Courses Offered</p>
            <p className="text-sm font-bold">{courses.length ? courses.map(c => c.name).join(', ') : '—'}</p>
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Counselling Types</p>
            <p className="text-sm font-bold">{counselingTypes.length ? counselingTypes.join(', ') : '—'}</p>
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Total Seat Intake</p>
            <p className="text-sm font-bold">{seatMatrix[0]?.seat_total_intake ?? '—'}</p>
          </div>
          <div>
            <p className={`text-[11px] font-bold uppercase mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>College Type</p>
            <p className="text-sm font-bold">{institute.college_type || '—'}</p>
          </div>
        </div>
      </Section>

      {/* CUTOFFS */}
      <Section id="cutoffs" title="Cut Off — Category × Round × Year" dm={dm}
        action={cutoffs.length > 0 && (
          <button onClick={() => setTrendOpen(true)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
              ${dm ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
            <Ic.Chart/>Trend Graph
          </button>
        )}>
        {years.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button onClick={() => setCutoffYear('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${cutoffYear === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : dm ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>All Years</button>
            {years.map(y => (
              <button key={y} onClick={() => setCutoffYear(y)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${cutoffYear === y ? 'bg-blue-600 text-white border-blue-600' : dm ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>{y}</button>
            ))}
          </div>
        )}
        <Table
          dm={dm}
          head={['Year', 'Round', 'Course', 'Category', 'Quota', 'Counselling', 'Opening Rank', 'Closing Rank']}
          rows={visibleCutoffs.slice(0, 500).map(c => [c.year, c.round, c.course, c.category, c.quota, c.counseling_type, c.opening_rank, c.closing_rank])}
          empty="No cutoff records found for this institute yet."
        />
      </Section>

      {/* FEES */}
      <Section id="fees" title="Fees Structure" dm={dm}>
        <Table
          dm={dm}
          head={['Course', 'Year', 'Annual Fee', 'Admission Fee', 'Hostel Fee', 'Hostel Type']}
          rows={fees.map(f => [f.course, f.year, f.annual_fee, f.admission_fee, f.annual_hostel_fee, f.hostel_type])}
          empty="Fee details for this institute aren't available yet."
        />
      </Section>

      {/* SEAT MATRIX */}
      <Section id="seats" title="Seat Matrix" dm={dm}>
        <Table
          dm={dm}
          head={['Course', 'Year', 'Total Intake', 'State Quota Seats', 'AIQ Seats']}
          rows={seatMatrix.map(s => [s.course, s.year, s.seat_total_intake, s.seat_state_quota_seats, s.seat_aiq_seats])}
          empty="Seat matrix data for this institute isn't available yet."
        />
      </Section>

      {/* BOND */}
      <Section id="bond" title="Bond / Service Obligation" dm={dm}>
        <Table
          dm={dm}
          head={['Course', 'Bond Years', 'Condition', 'Reimbursement Amount', 'Reimbursement Days']}
          rows={bond.map(b => [b.course, b.bond_years, b.bond_condition, b.bond_reimbursement_amount, b.bond_reimbursement_days])}
          empty="No bond/service obligation recorded for this institute."
        />
      </Section>

      {/* COUNSELLING & ADMISSION */}
      <Section id="admission" title="Counselling & Admission" dm={dm}>
        {admissionInfo
          ? <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">{admissionInfo}</div>
          : <p className={`text-sm ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Coming soon.</p>}
      </Section>

      {/* TREND GRAPH MODAL — reuses the exact Graphd component CutoffPage.jsx uses */}
      <TrendModal
        isOpen={trendOpen}
        onClose={() => setTrendOpen(false)}
        instituteName={institute.name}
        darkMode={dm}
        counselingType={trendCounseling}
      />
    </div>
  );
}