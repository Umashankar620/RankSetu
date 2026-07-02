'use client';
// =============================================================================
// components/CollegeInfoPage.jsx — REDESIGNED (additive, no other file touched)
// =============================================================================
// Directory page: Counselling Type -> State -> College Type -> Course filter
// cascade (numbered step headers, same visual language as CutoffPage.jsx),
// plus a stats banner and removable filter chips for a more "official
// directory" feel (https://www.neetugguidance.in/state-institute.php style —
// state list with counts, clear category tabs, decorated header).
// Server-side pagination only — never loads all institutes at once.
// =============================================================================
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
// ── IMPORTANT ─────────────────────────────────────────────────────────────────
// This page now reuses the EXACT SAME cascading filter endpoints that power
// CutoffPage.jsx (fetchCounselingTypes / fetchFilterStates /
// fetchFilterInstituteTypes / fetchFilterCourses — all hitting
// /api/filters/* on cutoffController.js, already verified to correctly
// narrow results). The old fetchCollegeStates / fetchCollegeTypes /
// fetchCollegeCounselingTypes endpoints returned a single GLOBAL, unscoped
// list no matter what was selected — that's why picking a Counselling Type
// never actually narrowed anything downstream. fetchInstitutesList (the
// actual college directory listing) is unchanged — its backend query
// already filters correctly by every id passed to it.
import {
  fetchCounselingTypes, fetchFilterStates, fetchFilterInstituteTypes,
  fetchFilterCourses, fetchInstitutesList, searchInstitutesAutocomplete,
} from '@/utils/api';

// ── icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Search: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Reset:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  X:      () => <svg width="9"  height="9"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevL:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevD:  () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Check:  () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Spin:   () => <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  Bldg:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9"/><path d="M15 21V9"/><path d="M3 12h18"/></svg>,
  MapPin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Arrow:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Globe:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/></svg>,
  Layers: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Award:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
};

// ── palette (same families CutoffPage uses, so counselling-type pills read
//    consistently with the rest of the site) ───────────────────────────────
const PAL = [
  { bg: '#2563EB', tx: '#1D4ED8' }, // MCC / default — blue
  { bg: '#16A34A', tx: '#15803D' }, // AYUSH — green
  { bg: '#9333EA', tx: '#7E22CE' }, // State — purple
  { bg: '#EA580C', tx: '#C2410C' }, // AIIMS — orange
  { bg: '#0891B2', tx: '#0E7490' },
];
const pal = (i) => PAL[Math.abs(i || 0) % PAL.length];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER — numbered step, matches CutoffPage.jsx's SHdr exactly
// ─────────────────────────────────────────────────────────────────────────────
function SHdr({ n, done, title, sub, badge, dm }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 border-b
      ${dm ? 'border-slate-700 bg-slate-800/70' : 'border-slate-100 bg-slate-50'}`}>
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black
        ${done ? 'bg-emerald-500 text-white' : dm ? 'bg-slate-700 text-slate-400 border border-slate-600' : 'bg-slate-100 text-slate-500 border border-slate-300'}`}>
        {done ? <Ic.Check/> : n}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-black uppercase tracking-widest ${dm ? 'text-slate-300' : 'text-slate-700'}`}>{title}</p>
        {sub && <p className={`text-[10px] font-medium mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
      </div>
      {badge}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PILL ROW — colored, scrollable, with optional per-item count badge
// ─────────────────────────────────────────────────────────────────────────────
function Pills({ items, selected, onSelect, dm, allLabel = 'All India', loading, colored = false, showCount = true }) {
  const ref = useRef(null);
  const sc = (d) => ref.current?.scrollBy({ left: d * 200, behavior: 'smooth' });
  const arw = `flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center
    ${dm ? 'border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700'
         : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-100'}`;
  const pill = `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5`;
  const off  = dm ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900';
  const on   = 'text-white border-transparent shadow-sm';

  return (
    <div className="flex items-center gap-1.5">
      <button className={arw} onClick={() => sc(-1)}><Ic.ChevL/></button>
      <div ref={ref} className="flex-1 flex gap-1.5 overflow-x-auto py-0.5 px-0.5 scrollbar-none">
        {loading
          ? <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400"><Ic.Spin/>Loading…</span>
          : <>
              <button onClick={() => onSelect(null)} className={`${pill} ${!selected ? on : off}`}
                style={!selected ? { backgroundColor: '#1A3C6E' } : {}}>
                {allLabel}
              </button>
              {items.map((it, i) => {
                const color = colored ? pal(i) : null;
                const isOn = selected === it.id;
                return (
                  <button key={it.id} onClick={() => onSelect(it.id)}
                    className={`${pill} ${isOn ? on : off}`}
                    style={isOn ? { backgroundColor: color ? color.bg : '#1A3C6E' } : {}}>
                    {it.name}
                    {showCount && it.count != null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isOn ? 'bg-white/25' : dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>{it.count}</span>
                    )}
                  </button>
                );
              })}
            </>}
      </div>
      <button className={arw} onClick={() => sc(1)}><Ic.ChevR/></button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLEGE TYPE TABS — segmented control, with counts
// ─────────────────────────────────────────────────────────────────────────────
function TypeTabs({ items, selected, onSelect, dm }) {
  return (
    <div className="p-3 flex flex-wrap gap-2">
      <button onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all
          ${!selected ? 'bg-[#1A3C6E] text-white border-[#1A3C6E]' : dm ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>
        All Types
      </button>
      {items.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)}
          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5
            ${selected === t.id ? 'bg-[#1A3C6E] text-white border-[#1A3C6E]' : dm ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>
          {t.name}
          {t.count != null && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              selected === t.id ? 'bg-white/25' : dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
            }`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHIP BAR — active filters, removable, same pattern as CutoffPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
function Chips({ chips, onRemove, dm }) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {chips.map(c => (
        <span key={c.key}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border
            ${dm ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}>
          <span className={`text-[9px] uppercase ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{c.lbl}</span>
          <span className="max-w-[160px] truncate">{c.val}</span>
          <button onClick={() => onRemove(c.key)}
            className={`opacity-60 hover:opacity-100 ${dm ? 'text-slate-400' : 'text-slate-500'}`}><Ic.X/></button>
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS BANNER — decorated header strip, neetugguidance.in-style top bar
// ─────────────────────────────────────────────────────────────────────────────
function StatsBanner({ totalItems, states, types, dm }) {
  const stats = [
    { icon: Ic.Bldg,   label: 'Colleges Listed', value: totalItems ? totalItems.toLocaleString('en-IN') : '—' },
    { icon: Ic.Globe,  label: 'States Covered',  value: states.length || '—' },
    { icon: Ic.Layers, label: 'College Types',   value: types.length || '—' },
    { icon: Ic.Award,  label: 'Data Source',     value: '100% MCC' },
  ];
  return (
    <div className={`rounded-2xl border mb-5 overflow-hidden ${dm ? 'border-slate-700' : 'border-slate-200 shadow-sm'}`}>
      <div className="p-5 sm:p-6" style={{ background: dm ? 'linear-gradient(120deg,#102347,#0F1E3D 60%,#0B0F19)' : 'linear-gradient(120deg,#EEF4FF,#F4F8FF 60%,#FFFFFF)' }}>
        <div className="flex items-start gap-3 mb-1">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
            style={{ backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.3)', color: '#2563EB' }}>
            <Ic.Bldg/>
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
              NEET UG College Directory
            </h1>
            <p className={`text-sm mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-600'}`}>
              State-wise &amp; counselling-type-wise list of every medical college — cutoffs, fees and seat matrix
              in one place, sourced from official MCC data.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${
              dm ? 'bg-slate-900/40 border-slate-700' : 'bg-white/70 border-white'
            }`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(26,60,110,0.1)', color: '#1A3C6E' }}>
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
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================
export default function CollegeInfoPage({ darkMode }) {
  const dm = darkMode;

  // ── lookups ──────────────────────────────────────────────────────────────
  const [states, setStates]               = useState([]);
  const [types, setTypes]                 = useState([]);
  const [courses, setCourses]             = useState([]);
  const [counselingTypes, setCounselingTypes] = useState([]);

  // ── filters ──────────────────────────────────────────────────────────────
  const [counselingTypeId, setCounselingTypeId] = useState(null);
  const [stateId, setStateId]             = useState(null);
  const [typeId, setTypeId]               = useState(null);
  const [courseId, setCourseId]           = useState(null);
  const [search, setSearch]               = useState('');
  const [suggestions, setSuggestions]     = useState([]);
  const [showSuggest, setShowSuggest]     = useState(false);

  // ── per-step loading flags (drives the "Loading…" pill state, and lets us
  //    tell "step not selected yet" apart from "step is fetching") ─────────
  const [loadingMeta, setLoadingMeta]     = useState(true);  // step 1
  const [loadingStates, setLoadingStates] = useState(false); // step 2
  const [loadingTypes, setLoadingTypes]   = useState(false); // step 3
  const [loadingCourses, setLoadingCourses] = useState(false); // step 4

  // ── results ──────────────────────────────────────────────────────────────
  const [rows, setRows]                   = useState([]);
  const [totalItems, setTotalItems]       = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [page, setPage]                   = useState(1);
  const [loading, setLoading]             = useState(false);
  const [err, setErr]                     = useState('');

  const debounceRef = useRef(null);

  // ── smooth-scroll helpers ────────────────────────────────────────────────
  // Each ref marks the top of the "next" step, so that as soon as someone
  // picks a pill, the page glides up just enough to reveal the next step
  // instead of sitting frozen where it was.
  const step2Ref        = useRef(null); // State
  const step3Ref        = useRef(null); // College Type
  const afterStep3Ref   = useRef(null); // anchor right after College Type (works whether Step 4/Courses renders or not)
  const searchAnchorRef = useRef(null); // chips + Search button row
  const resultsRef      = useRef(null); // results table — target when "Search" is clicked

  const scrollToRef = useCallback((ref, offset = 88) => {
    if (typeof window === 'undefined' || !ref?.current) return;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }, []);

  // Wait two animation frames so any conditionally-rendered section (e.g.
  // Step 4 only appears once courses exist) has actually laid out before we
  // measure its position — otherwise we'd scroll to where it USED to be.
  const scrollNextTick = useCallback((ref) => {
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToRef(ref)));
  }, [scrollToRef]);

  // ── STEP 1 — Counselling Types (loaded once, same endpoint CutoffPage uses) ─
  useEffect(() => {
    setLoadingMeta(true);
    fetchCounselingTypes()
      .then(r => setCounselingTypes(r?.data?.data || []))
      .catch(() => setCounselingTypes([]))
      .finally(() => setLoadingMeta(false));
  }, []);

  // ── STEP 2 — States, scoped to Counselling Type (or ALL when nothing is
  //    selected yet, so the directory is still fully browsable by default) ──
  useEffect(() => {
    setLoadingStates(true);
    fetchFilterStates(counselingTypeId)
      .then(r => setStates(r?.data?.data || []))
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, [counselingTypeId]);

  // ── STEP 3 — College Type, scoped to Counselling Type + State ───────────
  useEffect(() => {
    setLoadingTypes(true);
    fetchFilterInstituteTypes(counselingTypeId, null, stateId)
      .then(r => setTypes(r?.data?.data || []))
      .catch(() => setTypes([]))
      .finally(() => setLoadingTypes(false));
  }, [counselingTypeId, stateId]);

  // ── STEP 4 — Course, scoped to Counselling Type + State + College Type ──
  useEffect(() => {
    setLoadingCourses(true);
    fetchFilterCourses(counselingTypeId, null, stateId, typeId)
      .then(r => setCourses(r?.data?.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, [counselingTypeId, stateId, typeId]);

  // ── selection handlers — each one resets everything downstream of it
  //    (so a stale State/Type/Course id from a previous Counselling Type
  //    never silently stays applied) and glides the page to the next step ──
  const selectCounselingType = useCallback((id) => {
    setCounselingTypeId(id);
    setStateId(null); setTypeId(null); setCourseId(null);
    scrollNextTick(step2Ref);
  }, [scrollNextTick]);

  const selectState = useCallback((id) => {
    setStateId(id);
    setTypeId(null); setCourseId(null);
    scrollNextTick(step3Ref);
  }, [scrollNextTick]);

  const selectType = useCallback((id) => {
    setTypeId(id);
    setCourseId(null);
    scrollNextTick(afterStep3Ref);
  }, [scrollNextTick]);

  const selectCourse = useCallback((id) => {
    setCourseId(id);
    scrollNextTick(searchAnchorRef);
  }, [scrollNextTick]);

  // ── fetch list whenever filters/page change (live preview) ─────────────
  const loadList = useCallback(async (pg = 1) => {
    setLoading(true); setErr('');
    try {
      const res = await fetchInstitutesList({
        stateId, collegeTypeId: typeId, courseId, counselingTypeId, search, page: pg, pageSize: 30,
      });
      setRows(res.data?.data || []);
      setTotalItems(res.data?.totalItems || 0);
      setTotalPages(res.data?.totalPages || 1);
      setPage(pg);
    } catch (e) {
      setErr('Could not load colleges. Please try again.');
    } finally { setLoading(false); }
  }, [stateId, typeId, courseId, counselingTypeId, search]);

  useEffect(() => { loadList(1); }, [stateId, typeId, courseId, counselingTypeId, search]); // eslint-disable-line

  // Explicit "Search" click — data is already kept live-in-sync above, this
  // just re-confirms the fetch and, more importantly, glides the results
  // table into view so the person doesn't have to manually scroll down.
  const doSearch = useCallback(() => {
    loadList(1);
    scrollNextTick(resultsRef);
  }, [loadList, scrollNextTick]);

  // ── debounced autocomplete ──────────────────────────────────────────────
  const onSearchChange = (v) => {
    setSearch(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!v || v.trim().length < 2) { setSuggestions([]); setShowSuggest(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchInstitutesAutocomplete(v);
        setSuggestions(res.data?.data || []);
        setShowSuggest(true);
      } catch (_) {}
    }, 300);
  };

  // ── active filter chips ─────────────────────────────────────────────────
  const chips = useMemo(() => {
    const list = [];
    if (counselingTypeId) {
      const n = counselingTypes.find(c => c.id === counselingTypeId)?.name;
      if (n) list.push({ key: 'ct', lbl: 'Counselling', val: n });
    }
    if (stateId) {
      const n = states.find(s => s.id === stateId)?.name;
      if (n) list.push({ key: 'state', lbl: 'State', val: n });
    }
    if (typeId) {
      const n = types.find(t => t.id === typeId)?.name;
      if (n) list.push({ key: 'type', lbl: 'Type', val: n });
    }
    if (courseId) {
      const n = courses.find(c => c.id === courseId)?.name;
      if (n) list.push({ key: 'course', lbl: 'Course', val: n });
    }
    if (search) list.push({ key: 'search', lbl: 'Search', val: search });
    return list;
  }, [counselingTypeId, stateId, typeId, courseId, search, counselingTypes, states, types, courses]);

  const removeChip = (key) => {
    // Cascades the same way picking a pill does — removing an upstream
    // filter (e.g. Counselling Type) can't leave a now-invalid downstream
    // selection (State/Type/Course) silently applied.
    if (key === 'ct')     { setCounselingTypeId(null); setStateId(null); setTypeId(null); setCourseId(null); }
    if (key === 'state')  { setStateId(null); setTypeId(null); setCourseId(null); }
    if (key === 'type')   { setTypeId(null); setCourseId(null); }
    if (key === 'course') { setCourseId(null); }
    if (key === 'search') { setSearch(''); }
  };

  const resetAll = () => {
    setCounselingTypeId(null); setStateId(null); setTypeId(null);
    setCourseId(null); setSearch('');
  };

  const card = `rounded-2xl border mb-4 overflow-hidden ${dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* DECORATED STATS BANNER */}
      <StatsBanner totalItems={totalItems} states={states} types={types} dm={dm} />

      {/* SEARCH */}
      <div className="relative mb-4">
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <Ic.Search/>
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={() => suggestions.length && setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
            placeholder="Search college name…"
            className={`flex-1 bg-transparent outline-none text-sm ${dm ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
          />
        </div>
        {showSuggest && suggestions.length > 0 && (
          <div className={`absolute z-20 mt-1 w-full rounded-xl border shadow-xl overflow-hidden ${dm ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {suggestions.map(s => (
              <Link key={s.slug} href={`/college/${s.slug}`}
                className={`block px-4 py-2.5 text-sm font-semibold ${dm ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-800 hover:bg-slate-50'}`}>
                {s.name}
                <span className={`block text-[11px] font-normal ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{s.state || ''}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1 — COUNSELLING TYPE */}
      <div className={card}>
        <SHdr n="1" done={!!counselingTypeId} dm={dm}
          title="Counselling Type"
          sub="MCC, Ayush, State Quota, AIIMS — narrow colleges to one counselling track" />
        <div className="p-3">
          <Pills items={counselingTypes} selected={counselingTypeId} onSelect={selectCounselingType}
            dm={dm} loading={loadingMeta} allLabel="All Counselling Types" colored />
        </div>
      </div>

      {/* STEP 2 — STATE (scoped to Counselling Type above) */}
      <div className={card} ref={step2Ref}>
        <SHdr n="2" done={!!stateId} dm={dm}
          title="State"
          sub="Browse colleges state-wise — narrows automatically to the counselling type picked above" />
        <div className="p-3">
          <Pills items={states} selected={stateId} onSelect={selectState} dm={dm} loading={loadingStates} allLabel="All India" />
        </div>
      </div>

      {/* STEP 3 — COLLEGE TYPE (scoped to Counselling Type + State above) */}
      <div className={card} ref={step3Ref}>
        <SHdr n="3" done={!!typeId} dm={dm}
          title="College Type"
          sub="Government, Private, Deemed, Central — only types that actually exist for your selection above" />
        {loadingTypes
          ? <div className="p-3 flex items-center gap-1.5 text-xs font-bold text-slate-400"><Ic.Spin/>Loading…</div>
          : <TypeTabs items={types} selected={typeId} onSelect={selectType} dm={dm} />}
      </div>

      {/* Anchor — always present right after Step 3, whether or not Step 4
          (Course) actually renders below it, so the scroll target is stable. */}
      <div ref={afterStep3Ref} />

      {/* STEP 4 — COURSE (scoped to Counselling Type + State + College Type) */}
      {!!courses.length && (
        <div className={card}>
          <SHdr n="4" done={!!courseId} dm={dm}
            title="Course / Program"
            sub="Optional — only show colleges that offer this specific course" />
          <div className="p-3">
            <div className="relative max-w-xs">
              <select value={courseId || ''} disabled={loadingCourses}
                onChange={e => selectCourse(e.target.value ? parseInt(e.target.value) : null)}
                className={`w-full appearance-none px-3 py-2.5 rounded-lg border text-sm font-semibold pr-9
                  ${dm ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <option value="">All Courses</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm ? 'text-slate-500' : 'text-slate-400'}`}><Ic.ChevD/></span>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE FILTER CHIPS + RESET + SEARCH */}
      <div ref={searchAnchorRef} className="flex items-start justify-between gap-3 flex-wrap">
        <Chips chips={chips} onRemove={removeChip} dm={dm} />
        <div className="flex items-center gap-2 mb-4">
          {chips.length > 0 && (
            <button onClick={resetAll}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all
                ${dm ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
              <Ic.Reset/>Reset All
            </button>
          )}
          <button onClick={doSearch}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all hover:opacity-90"
            style={{ backgroundColor: '#1A3C6E' }}>
            {loading ? <Ic.Spin/> : <Ic.Search/>}
            Search Colleges
          </button>
        </div>
      </div>

      {/* ERROR */}
      {err && <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">{err}</div>}

      {/* RESULTS TABLE */}
      <div className={card} ref={resultsRef}>
        <div className={`px-4 py-3 border-b flex items-center justify-between ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
          <p className={`text-xs font-black uppercase tracking-widest ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
            Results
          </p>
          <p className={`text-[11px] font-bold ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            {totalItems ? `${totalItems.toLocaleString('en-IN')} colleges found` : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={dm ? 'bg-slate-900/60 text-slate-400' : 'bg-slate-50 text-slate-500'}>
                <th className="text-left font-bold px-4 py-3">College Name</th>
                <th className="text-left font-bold px-4 py-3">State</th>
                <th className="text-left font-bold px-4 py-3">Type</th>
                <th className="text-left font-bold px-4 py-3">Courses</th>
                <th className="text-right font-bold px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400"><Ic.Spin/>Loading colleges…</span>
                </td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">No colleges match these filters.</td></tr>
              )}
              {!loading && rows.map(r => (
                <tr key={r.id} className={`border-t transition-colors ${dm ? 'border-slate-700/60 hover:bg-slate-700/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                  <td className="px-4 py-3 font-bold">
                    <Link href={`/college/${r.slug}`} className="flex items-center gap-1.5 hover:underline">
                      <Ic.Bldg/>{r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs"><Ic.MapPin/>{r.state || '—'}</span></td>
                  <td className="px-4 py-3 text-xs">{r.college_type || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.courses || []).slice(0, 3).map(c => (
                        <span key={c} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{c}</span>
                      ))}
                      {(r.courses || []).length > 3 && <span className="text-[10px] text-slate-400">+{r.courses.length - 3} more</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/college/${r.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700">
                      View <Ic.Arrow/>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-4 py-3 border-t text-xs font-bold ${dm ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
            <span>Page {page} of {totalPages} · {totalItems.toLocaleString('en-IN')} colleges</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => { loadList(page - 1); scrollNextTick(resultsRef); }}
                className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 ${dm ? 'border-slate-600' : 'border-slate-200'}`}>Prev</button>
              <button disabled={page >= totalPages} onClick={() => { loadList(page + 1); scrollNextTick(resultsRef); }}
                className={`px-3 py-1.5 rounded-lg border disabled:opacity-40 ${dm ? 'border-slate-600' : 'border-slate-200'}`}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}