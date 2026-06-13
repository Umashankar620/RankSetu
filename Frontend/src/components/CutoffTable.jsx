


'use client';

import React, { useState } from 'react';

// ── Icons (unchanged) ───────────────────────────────────
const EyeIcon     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const ChartIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const ChevLeft    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>;
const RupeeIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3h12M6 8h12M6 13l8.5 9M6 13h3a4 4 0 0 0 0-8H6"/></svg>;
const ShieldIcon  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const AwardIcon   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
const ActivityIcon= () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

function Pagination({ currentPage, totalPages, onPageChange, darkMode }) {
  const pages = [];
  const delta = 2;
  const start = Math.max(2, currentPage - delta);
  const end   = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <div className="flex items-center gap-1 mt-4 justify-center">
      <button 
        className={`p-1.5 border rounded hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          darkMode 
            ? 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600' 
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
        }`} 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        <ChevLeft />
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className={`px-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>…</span>
          : <button 
              key={p} 
              className={`px-3 py-1 text-sm border rounded transition-colors ${
                p === currentPage 
                  ? darkMode 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-primary text-white border-primary'
                  : darkMode 
                    ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`} 
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
      )}
      <button 
        className={`p-1.5 border rounded hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          darkMode 
            ? 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600' 
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
        }`} 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        <ChevRight />
      </button>
    </div>
  );
}

function getSafetyBadge(userRank, closeRank, cutoffShift, darkMode) {
  if (!userRank || !closeRank) return { 
    text: '— No Rank', 
    cls: darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600' 
  };
  const adjusted = Math.round(closeRank * (1 + cutoffShift / 100));
  const rank = Number(userRank);
  if (rank <= adjusted * 0.8)  return { 
    text: '✓ Safe Target',     
    cls: darkMode ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-green-100 text-green-800' 
  };
  if (rank <= adjusted)        return { 
    text: '⚠ Borderline',      
    cls: darkMode ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800' : 'bg-yellow-100 text-yellow-800' 
  };
  return { 
    text: '✕ Hard Cutoff',     
    cls: darkMode ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-red-100 text-red-800' 
  };
}

export default function CutoffTable({
  data, totalItems, totalPages, currentPage,
  onPageChange, loading, hasSearched,
  userRank, cutoffShift = 0, darkMode = false,
  onOpenTrendModal,
}) {
  const [expanded, setExpanded] = useState({});
  const pageStart = (currentPage - 1) * 20 + 1;
  const pageEnd   = Math.min(currentPage * 20, totalItems);
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  if (!hasSearched) {
    return (
      <div className={`rounded-lg p-10 text-center shadow-sm mt-4 border transition-colors ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="text-4xl mb-3">🏥</div>
        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
          NEET UG Opening &amp; Closing Ranks
        </h3>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Select filters above and click <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>Search</strong> to view cutoff data.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`rounded-lg p-8 text-center shadow-sm mt-4 border transition-colors ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <h3 className={`text-md font-medium mb-4 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
          ⏳ Searching database…
        </h3>
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded overflow-hidden max-w-md mx-auto mb-4">
          <div className="bg-primary h-full w-1/2 rounded "></div>
        </div>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Querying records. Please wait…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`rounded-lg p-10 text-center shadow-sm mt-4 border transition-colors ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="text-4xl mb-3">🔎</div>
        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>No Records Found</h3>
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your filter criteria and search again.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Larger Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 px-2 py-2">
        <span className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-primary'}`}>
          <span className="text-2xl">📋</span> Opening &amp; Closing Ranks — Results
        </span>
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-2.5 py-0.5 rounded-full font-medium border ${
            darkMode 
              ? 'bg-primary/20 text-primary border-primary/40' 
              : 'bg-primary text-white border-primary'
          }`}>
            Total: {totalItems.toLocaleString('en-IN')} records
          </span>
          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
            Showing {pageStart.toLocaleString('en-IN')}–{pageEnd.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className={`overflow-x-auto border rounded-md shadow-sm transition-colors ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'
      }`}>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b bg-primary text-white">
              <th className="px-3 py-3 text-center font-semibold w-12 border-r border-white/20">#</th>
              <th className="px-4 py-3 font-semibold min-w-[320px] border-r border-white/20">Institution Profile</th>
              <th className="px-4 py-3 text-center font-semibold w-20 border-r border-white/20">Year</th>
              <th className="px-4 py-3 text-center font-semibold w-24 border-r border-white/20">Round</th>
              <th className="px-4 py-3 text-right font-semibold w-28 border-r border-white/20">Opening</th>
              <th className="px-4 py-3 text-right font-semibold w-28 border-r border-white/20">Closing</th>
              <th className="px-4 py-3 text-center font-semibold w-24 border-r border-white/20">Course</th>
              <th className="px-4 py-3 font-semibold min-w-[140px] border-r border-white/20">Quota</th>
              <th className="px-4 py-3 text-center font-semibold w-24 border-r border-white/20">Category</th>
              <th className="px-4 py-3 text-center font-semibold w-36">AI Safety Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const sno = pageStart + idx;
              const isEven = sno % 2 === 0;
              const isExp = !!expanded[row.id ?? idx];
              const safety = getSafetyBadge(userRank, row.closeRank, cutoffShift, darkMode);
              const rowId = row.id ?? idx;

              return (
                <React.Fragment key={rowId}>
                  <tr className={`transition-colors duration-150 border-b ${
                    darkMode 
                      ? `border-slate-600 hover:bg-slate-600 ${isEven ? 'bg-slate-700/40' : 'bg-slate-800'}`
                      : `border-slate-200 hover:bg-slate-50 ${isEven ? 'bg-slate-50' : 'bg-white'}`
                  }`}>
                    <td className="px-3 py-3 text-center font-medium border-r border-slate-200 dark:border-slate-600">
                      {String(sno).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-600">
                      <div className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{row.institute}</div>
                      {/* Action buttons - white in dark mode, navy in light mode */}
                      <div className="flex flex-wrap items-center gap-2 text-xs mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                          {row.type}
                        </span>
                        <button 
                          className={`flex items-center gap-1 transition-all hover:underline ${darkMode ? 'text-white' : 'text-primary'}`} 
                          onClick={() => toggle(rowId)}
                        >
                          {isExp ? <EyeOffIcon /> : <EyeIcon />}
                          <span>{isExp ? 'Hide Details' : 'View Bond & Fees'}</span>
                        </button>
                        <span className={darkMode ? 'text-slate-500' : 'text-slate-300'}>|</span>
                        <button 
                          className={`flex items-center gap-1 transition-all hover:underline ${darkMode ? 'text-white' : 'text-primary'}`}
                          onClick={() => onOpenTrendModal && onOpenTrendModal(row.institute)}
                        >
                          <ChartIcon /><span>History Trend</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-200 dark:border-slate-600">
                      {row.year ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-200 dark:border-slate-600">
                      {row.round ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium border-r border-slate-200 dark:border-slate-600">
                      {row.openRank ? Number(row.openRank).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold border-r border-slate-200 dark:border-slate-600">
                      {row.closeRank ? Number(row.closeRank).toLocaleString('en-IN') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-200 dark:border-slate-600">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.program === 'MBBS' 
                          ? darkMode 
                            ? 'bg-primary/30 text-white border border-primary/50'
                            : 'bg-primary/10 text-primary border border-primary/30'
                          : darkMode
                            ? 'bg-slate-700 text-slate-300 border border-slate-600'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {row.program}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm border-r border-slate-200 dark:border-slate-600" title={row.quota}>
                      {row.quota}
                    </td>
                    <td className="px-4 py-3 text-center font-medium border-r border-slate-200 dark:border-slate-600">
                      {row.category}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${safety.cls}`}>
                        {safety.text}
                      </span>
                    </td>
                  </tr>
                  {isExp && (
                    <tr className={darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}>
                      <td colSpan="10" className={`p-5 ${darkMode ? 'border-slate-700' : 'border-slate-200 border-t'}`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          <div className={`rounded-md p-3 shadow-sm flex flex-col gap-1 border ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <span className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <RupeeIcon /> Annual Tuition Fees
                            </span>
                            <span className={`text-base font-semibold ${darkMode ? 'text-primary' : 'text-slate-900'}`}>
                              ₹{row.fees ? Number(row.fees).toLocaleString('en-IN') : '—'}
                              <span className={`text-xs font-normal ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>/yr</span>
                            </span>
                          </div>
                          <div className={`rounded-md p-3 shadow-sm flex flex-col gap-1 border ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <span className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <ShieldIcon /> Service Bond
                            </span>
                            <span className={`text-base font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                              {row.bondYears > 0 ? `${row.bondYears} Year Mandatory` : 'No Bond'}
                            </span>
                          </div>
                          <div className={`rounded-md p-3 shadow-sm flex flex-col gap-1 border ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <span className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <AwardIcon /> Penalty Cost
                            </span>
                            <span className={`text-base font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              ₹{row.bondPenalty ? Number(row.bondPenalty).toLocaleString('en-IN') : '0'}
                            </span>
                          </div>
                          <div className={`rounded-md p-3 shadow-sm flex flex-col gap-1 border ${
                            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                          }`}>
                            <span className={`text-xs font-medium flex items-center gap-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <ActivityIcon /> Clinical Bed Flow
                            </span>
                            <span className={`text-base font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                              {row.beds ? `${Number(row.beds).toLocaleString('en-IN')}+ Active` : 'N/A'}
                              {row.opdFlow && <span className={`text-xs font-normal ml-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>({row.opdFlow})</span>}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-1 gap-4">
          <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Page {currentPage} of {totalPages.toLocaleString('en-IN')}
          </span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} darkMode={darkMode} />
        </div>
      )}
    </div>
  );
}