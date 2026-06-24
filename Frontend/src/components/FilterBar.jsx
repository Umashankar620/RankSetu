'use client';

// FilterBar.jsx
import React, { useRef } from "react";

const ChevLeft  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const Trophy    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const Sliders   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
const SearchIcon= () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const ResetIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;

export default function FilterBar({
  filters, formState, onChange, onSearch, onReset, loading,
  userRank, setUserRank, cutoffShift, setCutoffShift, darkMode = false,
}) {
  const yearRef  = useRef(null);
  const roundRef = useRef(null);

  const scroll = (ref, dir) => {
    ref.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  const {
    years = [],
    rounds = [],
    categories = [],
    quotas = [],
    programs = [],
    institutes = [],
    quotaInstituteMap = {},   // NEW — dependent filtering map from backend
  } = filters;

  // ── Dependent filtering: compute which institutes to show ─────────────────
  // If a quota is selected AND that quota has a mapping, show only those institutes.
  // Otherwise fall back to the full institute list — same as before.
  const filteredInstitutes =
    formState.quota && quotaInstituteMap[formState.quota]
      ? quotaInstituteMap[formState.quota]
      : institutes;

  // True when the list is actively being narrowed by quota selection
  const instituteListIsFiltered =
    formState.quota &&
    quotaInstituteMap[formState.quota] &&
    quotaInstituteMap[formState.quota].length < institutes.length;

  // ── Handler: quota change also resets institute if now invalid ─────────────
  const handleQuotaChange = (newQuota) => {
    onChange("quota", newQuota);
    // If a quota was chosen and the current institute doesn't appear in it, clear institute
    if (formState.institute && newQuota && quotaInstituteMap[newQuota]) {
      if (!quotaInstituteMap[newQuota].includes(formState.institute)) {
        onChange("institute", "");
      }
    }
    // If quota is cleared (All Quotas), keep institute as-is — no reset needed
  };

  const sliderPct = ((cutoffShift + 15) / 30) * 100;

  const inputCls = `w-full px-4 py-2.5 rounded border text-sm font-medium transition-all outline-none
    ${darkMode
      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-400"
      : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-primary"}`;

  const selectCls = `w-full px-3 py-2.5 rounded border text-sm font-medium outline-none transition-all
    ${darkMode
      ? "bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-400"
      : "bg-white border-slate-300 text-slate-800 focus:border-primary"}`;

  const pillBase = "flex-shrink-0 px-4 py-1.5 rounded text-sm font-bold transition-all duration-200 whitespace-nowrap";
  const pillActive = `bg-primary text-white`;
  const pillInactive = darkMode
    ? "text-slate-300 hover:text-white hover:bg-slate-700"
    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100";

  const labelCls = `block text-sm font-bold uppercase tracking-wide mb-2
    ${darkMode ? "text-slate-400" : "text-slate-500"}`;

  return (
    <div className={`rounded border overflow-hidden transition-colors
      ${darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>

      {/* HEADER */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b
        ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50/60"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded ${darkMode ? "bg-blue-500/15 text-blue-300" : "bg-primary/10 text-primary"}`}>
            <SearchIcon />
          </div>
          <div>
            <h2 className={`text-base font-bold ${darkMode ? "text-white" : "text-primary"}`}>
              Opening & Closing Ranks Filters
            </h2>
            <p className={`text-sm font-medium mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Fields marked <span className="text-accent font-bold">*</span> are recommended
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">

        {/* RANK + SIMULATOR */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded border
          ${darkMode ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>

          {/* Rank Input */}
          <div>
            <label className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide mb-2 ${darkMode ? "text-blue-300" : "text-primary"}`}>
              <Trophy /> Target Rank (AIR)
            </label>
            <input
              type="number"
              value={userRank}
              onChange={(e) => setUserRank(e.target.value)}
              placeholder="Enter your NEET rank…"
              className={inputCls}
            />
          </div>

          {/* Cutoff Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide ${darkMode ? "text-blue-300" : "text-primary"}`}>
                <Sliders /> Cutoff Shift Simulator
              </label>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full
                ${cutoffShift > 0
                  ? darkMode ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
                  : cutoffShift < 0
                    ? darkMode ? "bg-blue-500/20 text-blue-300" : "bg-primary/10 text-primary"
                    : darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"}`}>
                {cutoffShift > 0 ? `+${cutoffShift}% Tougher` : cutoffShift < 0 ? `${cutoffShift}% Easier` : "Standard Base"}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold mb-1.5 px-0.5">
              <span className={darkMode ? "text-slate-400" : "text-slate-500"}>−15%</span>
              <span className={darkMode ? "text-slate-400" : "text-slate-500"}>0%</span>
              <span className={darkMode ? "text-slate-400" : "text-slate-500"}>+15%</span>
            </div>
            <input
              type="range" min="-15" max="15" step="1"
              value={cutoffShift}
              onChange={(e) => setCutoffShift(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${darkMode ? "#3B82F6" : "#1A3C6E"} 0%, ${darkMode ? "#3B82F6" : "#1A3C6E"} ${sliderPct}%, ${darkMode ? "#334155" : "#e2e8f0"} ${sliderPct}%, ${darkMode ? "#334155" : "#e2e8f0"} 100%)`
              }}
            />
          </div>
        </div>

        {/* YEAR PILLS */}
        <div>
          <label className={labelCls}>Counselling Year</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(yearRef, "left")}
              className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center transition-colors
                ${darkMode ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}>
              <ChevLeft />
            </button>
            <div ref={yearRef} className={`flex-1 flex gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 rounded border
              ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <button onClick={() => onChange("year", "")} className={`${pillBase} ${formState.year === "" ? pillActive : pillInactive}`}>
                All Years
              </button>
              {years.map((y) => (
                <button key={y} onClick={() => onChange("year", y)} className={`${pillBase} ${formState.year === y ? pillActive : pillInactive}`}>
                  {y}
                </button>
              ))}
            </div>
            <button
              onClick={() => scroll(yearRef, "right")}
              className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center transition-colors
                ${darkMode ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}>
              <ChevRight />
            </button>
          </div>
        </div>

        {/* ROUND PILLS */}
        <div>
          <label className={labelCls}>Counselling Round</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(roundRef, "left")}
              className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center transition-colors
                ${darkMode ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}>
              <ChevLeft />
            </button>
            <div ref={roundRef} className={`flex-1 flex gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 rounded border
              ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
              <button onClick={() => onChange("round", "")} className={`${pillBase} ${formState.round === "" ? pillActive : pillInactive}`}>
                All Rounds
              </button>
              {rounds.map((r) => (
                <button key={r} onClick={() => onChange("round", r)} className={`${pillBase} ${formState.round === r ? pillActive : pillInactive}`}>
                  {r}
                </button>
              ))}
            </div>
            <button
              onClick={() => scroll(roundRef, "right")}
              className={`flex-shrink-0 w-8 h-8 rounded border flex items-center justify-center transition-colors
                ${darkMode ? "border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"}`}>
              <ChevRight />
            </button>
          </div>
        </div>

        {/* DROPDOWN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Category */}
          <div>
            <label className={labelCls}>
              Category <span className="text-accent ml-0.5">*</span>
            </label>
            <select
              value={formState.category}
              onChange={(e) => onChange("category", e.target.value)}
              className={selectCls}
            >
              <option value="">All Categories</option>
              {categories.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Quota — triggers institute list reset if selection becomes invalid */}
          <div>
            <label className={labelCls}>Quota</label>
            <select
              value={formState.quota}
              onChange={(e) => handleQuotaChange(e.target.value)}
              className={selectCls}
            >
              <option value="">All Quotas</option>
              {quotas.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Academic Program */}
          <div>
            <label className={labelCls}>Academic Program</label>
            <select
              value={formState.program}
              onChange={(e) => onChange("program", e.target.value)}
              className={selectCls}
            >
              <option value="">All Programs</option>
              {programs.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Institute — filtered by selected quota */}
          <div>
            <label className={labelCls}>
              Institute
              {/* Badge: shows count when list is narrowed by quota */}
              {instituteListIsFiltered && (
                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle
                  ${darkMode ? "bg-blue-500/20 text-blue-300" : "bg-primary/10 text-primary"}`}>
                  {filteredInstitutes.length} in {formState.quota}
                </span>
              )}
            </label>
            <select
              value={formState.institute}
              onChange={(e) => onChange("institute", e.target.value)}
              className={selectCls}
            >
              <option value="">
                {instituteListIsFiltered
                  ? `All ${formState.quota} Institutes`
                  : "All Institutes"}
              </option>
              {filteredInstitutes.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t
        ${darkMode ? "border-slate-700 bg-slate-800/60" : "border-slate-100 bg-slate-50/60"}`}>
        <p className={`text-xs font-medium hidden sm:block ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
          Configure filters above and click search to view insights.
        </p>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReset}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded border text-sm font-bold transition-all w-full sm:w-auto
              ${darkMode
                ? "border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-100"}`}
          >
            <ResetIcon /> Reset
          </button>

          <button
            onClick={onSearch}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-7 py-2.5 rounded text-sm font-bold text-white transition-all w-full sm:w-auto shadow-sm
              ${loading
                ? "bg-primary/60 cursor-not-allowed"
                : "bg-primary hover:bg-interactive hover:-translate-y-0.5"}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <SearchIcon /> Search Results
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}