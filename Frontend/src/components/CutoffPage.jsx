'use client';
// =============================================================================
// CutoffPage.jsx — 100% Dynamic, Production-Ready
// =============================================================================
// STRUCTURE:
//  ┌─ Step 1: Counselling Type  (buttons from DB)
//  ├─ Step 2: State             (pills, scoped to type — DB-driven, may be empty)
//  ├─ Step 3: Authority         (pills, scoped to type + state)
//  ├─ PILLS:
//  │   ├─ Institute Type  (pills, scoped to type+auth+state — DB-driven,
//  │   │                   only shown when the dataset actually has it,
//  │   │                   e.g. the UP files; MCC/AYUSH correctly hide it)
//  │   ├─ Round
//  │   └─ Year
//  └─ DROPDOWNS (below pills):
//      ├─ Course / Program
//      ├─ Quota
//      ├─ Category
//      └─ Institute  (loads ALL filtered colleges, type to narrow —
//                      NOW genuinely scoped by state_id + institute_type_id
//                      so selecting these actually changes the college list)
//
// KEY FIX vs previous version: Institute Type pill selection now flows into
// EVERY downstream call (years, rounds, courses, quotas, categories, AND
// crucially the colleges list itself) via instType/instTypeId — previously
// it only fed the search payload, so the college dropdown silently ignored
// it and kept showing unrelated colleges.
// =============================================================================

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import CutoffTable from '@/components/CutoffTable';
import TrendModal  from '@/components/Graphd';
import {
  fetchCounselingTypes,
  fetchFilterStates,
  fetchFilterAuthorities,
  fetchFilterInstituteTypes,
  fetchFilterYears,
  fetchFilterRounds,
  fetchFilterCourses,
  fetchFilterQuotas,
  fetchFilterCategories,
  fetchColleges,
  fetchCutoffs,
  fetchFilters,
} from '@/utils/api';

// ── icons ─────────────────────────────────────────────────────────────────────
const Ic = {
  Search:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Reset:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
  X:       () => <svg width="9"  height="9"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevL:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevD:   () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Check:   () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  DB:      () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  Spin:    () => <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  Back:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>,
  Trophy:  () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  Sliders: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  Info:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Bldg:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9"/><path d="M15 21V9"/><path d="M3 12h18"/></svg>,
  MapPin:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// ── palette ───────────────────────────────────────────────────────────────────
const PAL = [
  {bg:'#2563EB',lt:'rgba(37,99,235,.1)',bd:'rgba(37,99,235,.3)',tx:'#1D4ED8',dot:'#3B82F6'},
  {bg:'#16A34A',lt:'rgba(22,163,74,.1)', bd:'rgba(22,163,74,.3)', tx:'#15803D',dot:'#22C55E'},
  {bg:'#9333EA',lt:'rgba(147,51,234,.1)',bd:'rgba(147,51,234,.3)',tx:'#7E22CE',dot:'#A855F7'},
  {bg:'#EA580C',lt:'rgba(234,88,12,.1)', bd:'rgba(234,88,12,.3)', tx:'#C2410C',dot:'#F97316'},
  {bg:'#0891B2',lt:'rgba(8,145,178,.1)', bd:'rgba(8,145,178,.3)', tx:'#0E7490',dot:'#06B6D4'},
  {bg:'#BE185D',lt:'rgba(190,24,93,.1)', bd:'rgba(190,24,93,.3)', tx:'#9D174D',dot:'#EC4899'},
  {bg:'#B45309',lt:'rgba(180,83,9,.1)',  bd:'rgba(180,83,9,.3)',  tx:'#92400E',dot:'#F59E0B'},
  {bg:'#047857',lt:'rgba(4,120,87,.1)',  bd:'rgba(4,120,87,.3)',  tx:'#065F46',dot:'#10B981'},
];
const pal = (i) => PAL[Math.abs(i||0) % PAL.length];

// ─────────────────────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-xl backdrop-blur-sm text-xs font-bold
            ${t.type==='success'?'bg-emerald-600/95 border-emerald-400/50 text-white'
             :t.type==='warn'   ?'bg-amber-500/95 border-amber-400/50 text-white'
             :                   'bg-slate-800/95 border-slate-600/50 text-white'}`}
          style={{animation:'ti .2s ease'}}>
          {t.type==='success'&&<Ic.Check/>}{t.type==='warn'&&<Ic.Info/>}
          {t.message}
        </div>
      ))}
      <style>{`@keyframes ti{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PILL ROW (scrollable)
// ─────────────────────────────────────────────────────────────────────────────
function Pills({ items, selected, onSelect, color, dm, allLabel='All', loading }) {
  const ref = useRef(null);
  const sc  = (d) => ref.current?.scrollBy({ left: d*200, behavior:'smooth' });
  const arw = `flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center
    ${dm?'border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700'
        :'border-slate-200 bg-white text-slate-400 hover:bg-slate-100'}`;
  const pill = `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap cursor-pointer`;
  const off  = dm?'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                 :'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900';
  return (
    <div className="flex items-center gap-1.5">
      <button className={arw} onClick={()=>sc(-1)}><Ic.ChevL/></button>
      <div ref={ref} className="flex-1 flex gap-1.5 overflow-x-auto py-0.5 px-0.5 scrollbar-none">
        {loading
          ? <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400"><Ic.Spin/>Loading…</span>
          : <>
              <button onClick={()=>onSelect(null,'')}
                className={`${pill} ${!selected?'text-white border-transparent':off}`}
                style={!selected&&color?{backgroundColor:color.bg}:{}}>{allLabel}</button>
              {items.map(item=>{
                const id    = typeof item==='object' ? item.id   : item;
                const label = typeof item==='object' ? item.name : String(item);
                const on    = String(selected)===String(id) || selected===label;
                return (
                  <button key={id} onClick={()=>onSelect(id,label)}
                    className={`${pill} ${on?'text-white border-transparent scale-[1.03]':off}`}
                    style={on&&color?{backgroundColor:color.bg}:{}}>{label}</button>
                );
              })}
            </>
        }
      </div>
      <button className={arw} onClick={()=>sc(1)}><Ic.ChevR/></button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN (standard select-style, shows all options)
// ─────────────────────────────────────────────────────────────────────────────
function Dropdown({ label, items, value, onChange, loading, dm, placeholder='All' }) {
  const sCls = `w-full px-3 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all appearance-none cursor-pointer
    ${dm?'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-400'
        :'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`;
  const lCls = `block text-xs font-black uppercase tracking-widest mb-1.5 ${dm?'text-slate-400':'text-slate-500'}`;
  return (
    <div>
      <label className={lCls}>{label}</label>
      <div className="relative">
        {loading
          ? <div className={`w-full px-3 py-2.5 rounded-lg border text-xs ${dm?'bg-slate-800 border-slate-700 text-slate-500':'bg-white border-slate-200 text-slate-400'}`}>
              <span className="flex items-center gap-1.5"><Ic.Spin/>Loading…</span>
            </div>
          : <>
              <select value={value||''} onChange={e=>onChange(e.target.value)} className={sCls}>
                <option value="">{placeholder}</option>
                {items.map(item=>{
                  const v = typeof item==='object' ? item.id   : item;
                  const l = typeof item==='object' ? item.name : String(item);
                  return <option key={v} value={v}>{l}</option>;
                })}
              </select>
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}>
                <Ic.ChevD/>
              </span>
            </>
        }
        {value && !loading && (
          <div className={`mt-1 text-[10px] font-bold ${dm?'text-emerald-400':'text-emerald-600'}`}>
            ✓ {items.find(i=>(typeof i==='object'?String(i.id):i)===String(value))?.name || value}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTE DROPDOWN — loads ALL filtered colleges + search within them
// (Fixed-positioning panel preserved exactly as-is — z-index/escape-overflow
// behavior is unchanged from the last working version.)
// ─────────────────────────────────────────────────────────────────────────────
function CollegeDrop({ colleges, total, selId, selName, onSelect, onSearch,
  onMore, hasMore, loading, loadingMore, dm }) {

  const [open, setOpen]   = useState(false);
  const [qry,  setQry]    = useState('');
  const wRef              = useRef(null);
  const inputRef          = useRef(null);
  const dRef              = useRef(null);
  const [panelStyle, setPanelStyle] = useState({});

  const calcPanelStyle = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH = Math.min(320, spaceBelow - 8);
    setPanelStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(dropH, 120),
      zIndex: 9990,
    });
  }, []);

  useEffect(()=>{
    const fn = e => { if(wRef.current && !wRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return ()=>document.removeEventListener('mousedown', fn);
  },[]);

  useEffect(()=>{ if(!selName) setQry(''); },[selName]);

  useEffect(()=>{
    if (!open) return;
    calcPanelStyle();
    window.addEventListener('scroll', calcPanelStyle, true);
    window.addEventListener('resize', calcPanelStyle);
    return ()=>{
      window.removeEventListener('scroll', calcPanelStyle, true);
      window.removeEventListener('resize', calcPanelStyle);
    };
  },[open, calcPanelStyle]);

  const type = e => {
    const v = e.target.value; setQry(v); setOpen(true);
    clearTimeout(dRef.current);
    dRef.current = setTimeout(()=>onSearch(v), 300);
  };

  const pick = c => { onSelect(c.id, c.name); setQry(c.name); setOpen(false); };
  const clear = () => { onSelect(null,''); setQry(''); onSearch(''); };

  const lCls = `block text-xs font-black uppercase tracking-widest mb-1.5 ${dm?'text-slate-400':'text-slate-500'}`;
  const iCls = `w-full pl-8 pr-8 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all
    ${dm?'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-400'
        :'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'}`;
  const ph = total>0 ? `Search ${total.toLocaleString('en-IN')} colleges…` : 'Select type to see colleges';

  return (
    <div ref={wRef} className="relative">
      <label className={lCls}>
        Institute
        {total>0 && <span className={`ml-2 normal-case font-bold text-[10px] ${dm?'text-blue-400':'text-blue-600'}`}>
          {total.toLocaleString('en-IN')} available
        </span>}
      </label>
      <div className="relative" ref={inputRef}>
        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}>
          {loading ? <Ic.Spin/> : <Ic.Bldg/>}
        </span>
        <input value={qry} onChange={type}
          onFocus={()=>{ if(colleges.length>0||total>0){ calcPanelStyle(); setOpen(true); } }}
          placeholder={ph} className={iCls} autoComplete="off"/>
        {(qry||selName)
          ? <button onClick={clear} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${dm?'text-slate-400 hover:text-white':'text-slate-400 hover:text-slate-700'}`}><Ic.X/></button>
          : <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-600':'text-slate-300'}`}><Ic.ChevD/></span>
        }
      </div>

      {selName && !open && (
        <div className={`mt-1 flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg
          ${dm?'bg-emerald-500/10 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}>
          <Ic.Check/><span className="truncate">{selName}</span>
        </div>
      )}

      {open && (
        <div
          className={`rounded-xl border shadow-2xl overflow-hidden
            ${dm?'bg-slate-800 border-slate-600':'bg-white border-slate-200'}`}
          style={panelStyle}>
          <div className="overflow-y-auto" style={{maxHeight: (panelStyle.maxHeight||320) - 36}}>
            {loading && (
              <div className={`flex items-center gap-2 px-4 py-3 text-xs font-medium ${dm?'text-slate-400':'text-slate-500'}`}>
                <Ic.Spin/>Loading colleges…
              </div>
            )}
            {!loading && colleges.length===0 && (
              <p className={`px-4 py-5 text-xs text-center font-medium ${dm?'text-slate-500':'text-slate-400'}`}>
                {total===0 ? 'No colleges match current filters' : 'No colleges match your search'}
              </p>
            )}
            {colleges.map(c=>(
              <button key={c.id} onMouseDown={()=>pick(c)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5
                  ${selId===c.id
                    ? dm?'bg-blue-600/20 text-blue-300 font-bold':'bg-blue-50 text-blue-700 font-bold'
                    : dm?'text-slate-200 hover:bg-slate-700 font-medium':'text-slate-800 hover:bg-slate-50 font-medium'}`}>
                {selId===c.id && <span className="flex-shrink-0 text-emerald-500"><Ic.Check/></span>}
                <span className="truncate">{c.name}</span>
              </button>
            ))}
            {hasMore && !loading && (
              <button onMouseDown={onMore} disabled={loadingMore}
                className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-t
                  ${dm?'border-slate-700 text-blue-400 hover:bg-slate-700':'border-slate-100 text-blue-600 hover:bg-blue-50'}`}>
                {loadingMore ? <><Ic.Spin/>Loading…</> : <>Load more colleges ↓</>}
              </button>
            )}
          </div>
          {total>0 && (
            <div className={`px-4 py-1.5 text-[10px] font-bold border-t
              ${dm?'border-slate-700 text-slate-500':'border-slate-100 text-slate-400'}`}>
              {total.toLocaleString('en-IN')} colleges match current filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHIP BAR
// ─────────────────────────────────────────────────────────────────────────────
function Chips({ chips, onRemove, dm }) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {chips.map(c=>(
        <span key={c.key}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border
            ${dm?'bg-slate-800 border-slate-600 text-slate-300':'bg-white border-slate-300 text-slate-700'}`}>
          <span className={`text-[9px] uppercase ${dm?'text-slate-500':'text-slate-400'}`}>{c.lbl}</span>
          <span className="max-w-[140px] truncate">{c.val}</span>
          {!c.fixed && (
            <button onClick={()=>onRemove(c.key)}
              className={`opacity-60 hover:opacity-100 ${dm?'text-slate-400':'text-slate-500'}`}><Ic.X/></button>
          )}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS BAR
// ─────────────────────────────────────────────────────────────────────────────
function Stats({ total, rows, dm }) {
  if (!total) return null;
  const hi = rows.length ? Math.max(...rows.map(r=>r.closeRank||0)).toLocaleString('en-IN') : '—';
  const lo = rows.length ? Math.min(...rows.map(r=>r.openRank||Infinity)) : null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {[
        {l:'Total Records', v:total.toLocaleString('en-IN')},
        {l:'Highest Close', v:hi},
        {l:'Lowest Open',   v:lo&&lo!==Infinity?lo.toLocaleString('en-IN'):'—'},
        {l:'This Page',     v:String(rows.length)},
      ].map(({l,v})=>(
        <div key={l} className={`px-3 py-2.5 rounded-xl border text-center ${dm?'bg-slate-800/60 border-slate-700':'bg-white border-slate-200'}`}>
          <div className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${dm?'text-slate-500':'text-slate-400'}`}>{l}</div>
          <div className={`text-sm font-black ${dm?'text-white':'text-slate-900'}`}>{v}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SHdr({ n, done, title, sub, badge, dm }) {
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 border-b
      ${dm?'border-slate-700 bg-slate-800/70':'border-slate-100 bg-slate-50'}`}>
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black
        ${done?'bg-emerald-500 text-white':dm?'bg-slate-700 text-slate-400 border border-slate-600':'bg-slate-100 text-slate-500 border border-slate-300'}`}>
        {done?<Ic.Check/>:n}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-black uppercase tracking-widest ${dm?'text-slate-300':'text-slate-700'}`}>{title}</p>
        {sub&&<p className={`text-[10px] font-medium mt-0.5 ${dm?'text-slate-500':'text-slate-400'}`}>{sub}</p>}
      </div>
      {badge}
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================
export default function CutoffPage({
  darkMode=false, showToast, setCurrentView,
  treeList, setTreeList,   // optional — shared "Choice Lab" list, lifted from parent
}) {
  const dm = darkMode;

  // If the parent gives us treeList+setTreeList, selected colleges get pushed
  // straight into the SAME list ChoiceLab reads — that's what makes
  // "select college → forward to Choice Lab" actually work end-to-end.
  const choiceLabControlled = treeList !== undefined && typeof setTreeList === 'function';

  // ── cascade data ──────────────────────────────────────────────────────────
  const [allTypes,   setAllTypes]   = useState([]);
  const [allStates,  setAllStates]  = useState([]);
  const [allAuths,   setAllAuths]   = useState([]);
  const [allInstTyp, setAllInstTyp] = useState([]); // DB-driven institute types
  const [allYears,   setAllYears]   = useState([]);
  const [allRounds,  setAllRounds]  = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allQuotas,  setAllQuotas]  = useState([]);
  const [allCats,    setAllCats]    = useState([]);
  const [allGenders, setAllGenders] = useState([]);

  // ── selected values (id for API, name for display + search payload) ──────
  const [ctId,      setCtId]      = useState(null);
  const [ctName,    setCtName]    = useState('');
  const [stateId,   setStateId]   = useState(null);
  const [stateName, setStateName] = useState('');
  const [authId,    setAuthId]    = useState(null);
  const [authName,  setAuthName]  = useState('');
  const [instTypeId,setInstTypeId]= useState(null); // DB id, drives every downstream query
  const [instType,  setInstType]  = useState('');    // name, used in search payload + chips
  const [yearSel,   setYearSel]   = useState(null);
  const [roundId,   setRoundId]   = useState(null);
  const [roundName, setRoundName] = useState('');
  const [courseId,  setCourseId]  = useState(null);
  const [courseName,setCourseName]= useState('');
  const [quotaId,   setQuotaId]   = useState(null);
  const [quotaName, setQuotaName] = useState('');
  const [catId,     setCatId]     = useState(null);
  const [catName,   setCatName]   = useState('');
  const [instId,    setInstId]    = useState(null);
  const [instName,  setInstName]  = useState('');
  const [gender,    setGender]    = useState('');
  const [minFees,   setMinFees]   = useState('');
  const [maxFees,   setMaxFees]   = useState('');
  const [bondYrs,   setBondYrs]   = useState('');
  const [minScore,  setMinScore]  = useState('');
  const [maxScore,  setMaxScore]  = useState('');
  const [userRank,  setUserRank]  = useState('');
  const [shift,     setShift]     = useState(0);

  // filterMeta — still used for fees/bond/score/gender, which aren't tied to
  // institute type the way courses/colleges are
  const [meta, setMeta] = useState({
    hasGender:false, hasFees:false, hasBond:false, hasScore:false,
  });

  // ── loading ───────────────────────────────────────────────────────────────
  const [ldT,  setLdT]  = useState(true);
  const [ldS,  setLdS]  = useState(false); // states
  const [ldA,  setLdA]  = useState(false); // authorities
  const [ldIT, setLdIT] = useState(false); // institute types
  const [ldY,  setLdY]  = useState(false);
  const [ldR,  setLdR]  = useState(false);
  const [ldC,  setLdC]  = useState(false);
  const [ldQ,  setLdQ]  = useState(false);
  const [ldK,  setLdK]  = useState(false); // categories

  // ── colleges dropdown ─────────────────────────────────────────────────────
  const [cols,     setCols]     = useState([]);
  const [colTotal, setColTotal] = useState(0);
  const [colPage,  setColPage]  = useState(1);
  const [colMore,  setColMore]  = useState(false);
  const [colSrch,  setColSrch]  = useState('');
  const [ldCol,    setLdCol]    = useState(false);
  const [ldColM,   setLdColM]   = useState(false);

  // ── results ───────────────────────────────────────────────────────────────
  const [results,  setResults]  = useState([]);
  const [totItems, setTotItems] = useState(0);
  const [totPages, setTotPages] = useState(0);
  const [curPage,  setCurPage]  = useState(1);
  const [ldSrch,   setLdSrch]  = useState(false);
  const [errSrch,  setErrSrch] = useState('');
  const [searched, setSearched] = useState(false);

  // ── trend modal ───────────────────────────────────────────────────────────
  const [tOpen,  setTOpen]  = useState(false);
  const [tName,  setTName]  = useState('');

  // ── college selection (checkboxes in CutoffTable) → forward to Choice Lab ─
  const [selectedColleges, setSelectedColleges] = useState([]);

  // ── toasts ────────────────────────────────────────────────────────────────
  // ── smooth-scroll refs — glides the page toward the next step as each
  //    filter is picked, and toward the results table on Search/pagination
  //    (same UX pattern used on the College Directory page). ────────────────
  const stateStepRef  = useRef(null);
  const authStepRef   = useRef(null);
  const itypeStepRef  = useRef(null);
  const roundStepRef  = useRef(null);
  const yearStepRef   = useRef(null);
  const cqcStepRef    = useRef(null);
  const instStepRef   = useRef(null);
  const rankStepRef   = useRef(null);
  const resultsRef    = useRef(null);

  const scrollToRef = useCallback((ref, offset = 90) => {
    if (typeof window === 'undefined' || !ref?.current) return;
    const top = ref.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
  }, []);

  // Small delay instead of a single animation frame — gives the cascade's
  // own effects (which reset/refetch the next step's pills) time to flip
  // their "has this step got data" flag before we measure where to scroll.
  const scrollSoon = useCallback((ref, delay = 150) => {
    setTimeout(() => scrollToRef(ref), delay);
  }, [scrollToRef]);

  const [toasts, setToasts] = useState([]);
  const tid = useRef(0);
  const toast = useCallback((msg, type='info', ms=2500)=>{
    const id=++tid.current;
    setToasts(p=>[...p,{id,message:msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),ms);
  },[]);

  // color
  const color = useMemo(()=>pal(allTypes.findIndex(t=>t.id===ctId)),[ctId,allTypes]);

  // ==========================================================================
  // FORWARD SELECTED COLLEGES → CHOICE LAB
  // Converts whatever rows the user checked in CutoffTable into the exact
  // node shape ChoiceLab/PrefList expects, merges into the shared treeList
  // (de-duping on collegeId+course+quota+category+round+year so the same
  // row added twice doesn't create a duplicate preference), then jumps the
  // user straight into the Choice Lab view.
  // ==========================================================================
  const forwardToChoiceLab = useCallback(()=>{
    if(!selectedColleges.length){ toast('Select at least one college first','warn'); return; }
    if(!choiceLabControlled){
      toast('Choice Lab list is not connected — pass treeList/setTreeList from the parent page','warn',3500);
      return;
    }

    const mapped = selectedColleges.map(row=>({
      id:             `cl_${row.id ?? row.collegeId ?? row.instituteId}_${row.round ?? ''}_${row.category ?? ''}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      collegeId:      row.collegeId ?? row.instituteId ?? row.id ?? null,
      institute:      row.institute || row.instituteName || row.name || '—',
      counselingType: row.counselingType || ctName || '—',
      state:          row.state || stateName || '—',
      stateName:      row.stateName || row.state || stateName || '—',
      authority:      row.authority || authName || '—',
      instituteType:  row.instituteType || instType || '—',
      course:         row.course || row.program || courseName || '—',
      quota:          row.quota || quotaName || '—',
      category:       row.category || catName || '—',
      round:          row.round || roundName || '—',
      year:           row.year || yearSel || '—',
      openRank:       row.openRank  ?? null,
      closeRank:      row.closeRank ?? null,
    }));

    setTreeList(prev=>{
      const existing = prev || [];
      const seen = new Set(existing.map(c=>`${c.collegeId}|${c.course}|${c.quota}|${c.category}|${c.round}|${c.year}`));
      const fresh = mapped.filter(c=>!seen.has(`${c.collegeId}|${c.course}|${c.quota}|${c.category}|${c.round}|${c.year}`));
      return [...existing, ...fresh];
    });

    toast(`${mapped.length} college${mapped.length>1?'s':''} sent to Choice Lab`,'success');
    setSelectedColleges([]);
    if(typeof setCurrentView==='function') setCurrentView('lab');
  },[selectedColleges, choiceLabControlled, setTreeList, setCurrentView, toast,
     ctName, stateName, authName, instType, courseName, quotaName, catName, roundName, yearSel]);


  // ── dynamic step numbering — since State / Authority / Institute Type are
  //    each conditionally rendered (only when the DB actually has data for
  //    them), the visible step numbers shift to stay sequential ───────────
  const hasStateStep  = allStates.length>0 || ldS;
  const hasAuthStep   = allAuths.length>0;
  const hasITypeStep  = allInstTyp.length>0 || ldIT;
  let stepN = 1;
  const stepState  = hasStateStep ? ++stepN : null;
  const stepAuth   = hasAuthStep  ? ++stepN : null;
  const stepIType  = hasITypeStep ? ++stepN : null;
  const stepRound  = ++stepN;
  const stepYear   = ++stepN;
  const stepCQC    = ++stepN;        // Course / Quota / Category
  const stepInst   = ++stepN;        // Institute / College
  const stepExtra  = ++stepN;        // Fees / Bond / Score (only if present)

  // ==========================================================================
  // CASCADE LOADERS
  // ==========================================================================

  // Step 1 — types on mount
  useEffect(()=>{
    setLdT(true);
    fetchCounselingTypes()
      .then(r=>{ if(r?.data?.success) setAllTypes(r.data.data||[]); })
      .catch(e=>console.error('[types]',e))
      .finally(()=>setLdT(false));
  },[]);

  // Reset all downstream when type changes
  const resetAll = useCallback(()=>{
    setStateId(null); setStateName('');
    setAuthId(null);  setAuthName('');
    setInstTypeId(null); setInstType('');
    setYearSel(null); setRoundId(null); setRoundName('');
    setCourseId(null); setCourseName('');
    setQuotaId(null); setQuotaName('');
    setCatId(null); setCatName('');
    setInstId(null); setInstName('');
    setGender('');
    setMinFees(''); setMaxFees(''); setBondYrs('');
    setMinScore(''); setMaxScore('');
    setCols([]); setColTotal(0); setColSrch('');
    setResults([]); setTotItems(0); setTotPages(0);
    setSearched(false); setErrSrch('');
  },[]);

  // Step 2 — states (scoped to type only — comes BEFORE authority because
  // authority itself depends on state in this dataset)
  useEffect(()=>{
    if(!ctId){ setAllStates([]); setStateId(null); setStateName(''); return; }
    setLdS(true);
    setAllStates([]); setStateId(null); setStateName('');
    fetchFilterStates(ctId)
      .then(r=>setAllStates(r?.data?.data||[]))
      .catch(e=>console.error('[states]',e))
      .finally(()=>setLdS(false));
  },[ctId]);

  // Step 3 — authorities (scoped to type + state)
  useEffect(()=>{
    if(!ctId){ setAllAuths([]); setAuthId(null); setAuthName(''); return; }
    setLdA(true);
    setAllAuths([]); setAuthId(null); setAuthName('');
    fetchFilterAuthorities(ctId, stateId)
      .then(r=>setAllAuths(r?.data?.data||[]))
      .catch(e=>console.error('[auth]',e))
      .finally(()=>setLdA(false));
  },[ctId, stateId]);

  // Institute Type — scoped to type + auth + state. Naturally empty for
  // MCC/AYUSH (type: null in their CSVs), populated for UP files.
  useEffect(()=>{
    if(!ctId){ setAllInstTyp([]); setInstTypeId(null); setInstType(''); return; }
    setLdIT(true);
    setAllInstTyp([]); setInstTypeId(null); setInstType('');
    fetchFilterInstituteTypes(ctId, authId, stateId)
      .then(r=>setAllInstTyp(r?.data?.data||[]))
      .catch(e=>console.error('[itypes]',e))
      .finally(()=>setLdIT(false));
  },[ctId, authId, stateId]);

  // Years, rounds — scoped to type + auth + state + institute type
  useEffect(()=>{
    if(!ctId) return;
    setLdY(true); setLdR(true);
    setYearSel(null); setRoundId(null); setRoundName('');
    Promise.all([
      fetchFilterYears(ctId, authId, stateId, instTypeId),
      fetchFilterRounds(ctId, authId, stateId, instTypeId),
    ]).then(([y,r])=>{
      setAllYears(y?.data?.data||[]);
      setAllRounds(r?.data?.data||[]);
    }).catch(e=>console.error('[years/rounds]',e))
      .finally(()=>{ setLdY(false); setLdR(false); });
  },[ctId, authId, stateId, instTypeId]);

  // Courses — scoped to type + auth + state + institute type
  useEffect(()=>{
    if(!ctId) return;
    setLdC(true);
    setCourseId(null); setCourseName('');
    fetchFilterCourses(ctId, authId, stateId, instTypeId)
      .then(r=>setAllCourses(r?.data?.data||[]))
      .catch(e=>console.error('[courses]',e))
      .finally(()=>setLdC(false));
  },[ctId, authId, stateId, instTypeId]);

  // Quotas — scoped to type + auth + course + state + institute type
  useEffect(()=>{
    if(!ctId) return;
    setLdQ(true);
    setQuotaId(null); setQuotaName('');
    fetchFilterQuotas(ctId, authId, courseId, stateId, instTypeId)
      .then(r=>setAllQuotas(r?.data?.data||[]))
      .catch(e=>console.error('[quotas]',e))
      .finally(()=>setLdQ(false));
  },[ctId, authId, courseId, stateId, instTypeId]);

  // Categories + filterMeta + genders (parallel) — categories scoped to
  // type + auth + state + institute type; filterMeta still keyed by
  // counseling type name only (fees/bond/score/gender aren't institute-type
  // specific in this schema).
  useEffect(()=>{
    if(!ctId) return;
    setLdK(true);
    setCatId(null); setCatName('');
    Promise.all([
      fetchFilterCategories(ctId, authId, stateId, instTypeId),
      fetchFilters(ctName),
    ]).then(([cats, fm])=>{
      setAllCats(cats?.data?.data||[]);
      if(fm?.data?.success){
        const f = fm.data.filters;
        if(f?.filterMeta) setMeta(f.filterMeta);
        if(Array.isArray(f?.genders)) setAllGenders(f.genders);
      }
    }).catch(e=>console.error('[cats/meta]',e))
      .finally(()=>setLdK(false));
  },[ctId, authId, stateId, instTypeId, ctName]);

  // Colleges — THE CORE FIX: now scoped to type + auth + course + quota +
  // state + institute type, so selecting State or Institute Type pills
  // genuinely narrows down the college list to match what's really in the
  // uploaded CSVs (e.g. only UP government colleges show when "State"
  // institute type is selected, instead of every college ignoring it).
  const loadCols = useCallback(async(page=1, srch=colSrch, append=false)=>{
    if(!ctId){ setCols([]); setColTotal(0); return; }
    page===1 ? setLdCol(true) : setLdColM(true);
    try{
      const r = await fetchColleges({
        ctId, authId:authId||undefined,
        courseId:courseId||undefined, quotaId:quotaId||undefined,
        stateId:stateId||undefined, instituteTypeId:instTypeId||undefined,
        search:srch, page, pageSize:50,
      });
      if(r?.data?.success){
        const list = r.data.data||[];
        setCols(prev=>append?[...prev,...list]:list);
        setColTotal(r.data.totalItems||0);
        setColMore(r.data.hasNext||false);
        setColPage(page);
      }
    }catch(e){console.error('[cols]',e);}
    finally{ setLdCol(false); setLdColM(false); }
  },[ctId, authId, courseId, quotaId, stateId, instTypeId, colSrch]);

  useEffect(()=>{
    if(!ctId){ setCols([]); setColTotal(0); return; }
    setInstId(null); setInstName(''); setColSrch('');
    loadCols(1,'');
  },[ctId, authId, courseId, quotaId, stateId, instTypeId]);

  const handleColSrch = useCallback((q)=>{ setColSrch(q); loadCols(1,q); },[loadCols]);

  // ==========================================================================
  // SEARCH
  // ==========================================================================
  const doSearch = useCallback(async(page=1)=>{
    if(!ctId){ toast('Select a counselling type first','warn'); return; }
    setErrSrch(''); setLdSrch(true); setSearched(true);
    try{
      const f   = 1 - shift/100;
      const res = await fetchCutoffs({
        counselingType: ctName,
        state:          stateName  ||undefined,
        authority:      authName   ||undefined,
        instituteType:  instType   ||undefined,
        program:        courseName ||undefined,
        quota:          quotaName  ||undefined,
        category:       catName    ||undefined,
        round:          roundName  ||undefined,
        year:           yearSel    ||undefined,
        institute:      instName   ||undefined,
        gender:         gender     ||undefined,
        minFees:        minFees    ||undefined,
        maxFees:        maxFees    ||undefined,
        bondYears:      bondYrs    ||undefined,
        minScore:       minScore   ||undefined,
        maxScore:       maxScore   ||undefined,
        page, pageSize:25,
      });
      if(res?.data?.success){
        const data=(res.data.data||[]).map(row=>({
          ...row,
          openRank:  row.openRank  ?Math.round(Number(row.openRank) *f):0,
          closeRank: row.closeRank ?Math.round(Number(row.closeRank)*f):0,
        }));
        setResults(data);
        setTotItems(res.data.totalItems||0);
        setTotPages(res.data.totalPages||0);
        setCurPage(res.data.currentPage||1);
        if(data.length>0) toast(`${(res.data.totalItems||0).toLocaleString('en-IN')} records found`,'success');
        else toast('No records match','warn');
      }else{
        setErrSrch(res?.data?.message||'Search failed'); setResults([]);
      }
    }catch(e){ setErrSrch(e.message||'Server error'); setResults([]); toast('Server error','warn'); }
    finally{ setLdSrch(false); }
  },[ctId,ctName,stateName,authName,instType,courseName,quotaName,catName,roundName,yearSel,instName,gender,minFees,maxFees,bondYrs,minScore,maxScore,shift]);

  const doReset = useCallback(()=>{
    setCatId(null); setCatName(''); setRoundId(null); setRoundName('');
    setYearSel(null); setInstId(null); setInstName('');
    setGender(''); setMinFees(''); setMaxFees('');
    setBondYrs(''); setMinScore(''); setMaxScore('');
    setUserRank(''); setShift(0);
    setResults([]); setTotItems(0); setTotPages(0);
    setCurPage(1); setSearched(false); setErrSrch('');
    toast('Filters cleared','info',1500);
  },[toast]);

  const doPage = useCallback((p)=>{
    if(p<1||p>totPages) return;
    scrollToRef(resultsRef);
    doSearch(p);
  },[totPages,doSearch,scrollToRef]);

  // ── chips ─────────────────────────────────────────────────────────────────
  const chips = useMemo(()=>{
    const c=[];
    if(ctName)    c.push({key:'ct',    lbl:'Type',     val:ctName,    fixed:true});
    if(stateName) c.push({key:'state', lbl:'State',    val:stateName});
    if(authName)  c.push({key:'auth',  lbl:'Authority',val:authName});
    if(instType)  c.push({key:'itype', lbl:'Inst Type',val:instType});
    if(yearSel)   c.push({key:'year',  lbl:'Year',     val:String(yearSel)});
    if(roundName) c.push({key:'round', lbl:'Round',    val:roundName});
    if(courseName)c.push({key:'course',lbl:'Course',   val:courseName});
    if(quotaName) c.push({key:'quota', lbl:'Quota',    val:quotaName});
    if(catName)   c.push({key:'cat',   lbl:'Category', val:catName});
    if(instName)  c.push({key:'inst',  lbl:'College',  val:instName});
    if(gender)    c.push({key:'gender',lbl:'Gender',   val:gender});
    return c;
  },[ctName,stateName,authName,instType,yearSel,roundName,courseName,quotaName,catName,instName,gender]);

  const removeChip = useCallback((key)=>{
    if(key==='state') {setStateId(null);   setStateName('');}
    if(key==='auth')  {setAuthId(null);    setAuthName('');}
    if(key==='itype') {setInstTypeId(null);setInstType('');}
    if(key==='year')  {setYearSel(null);}
    if(key==='round') {setRoundId(null);   setRoundName('');}
    if(key==='course'){setCourseId(null);  setCourseName('');}
    if(key==='quota') {setQuotaId(null);   setQuotaName('');}
    if(key==='cat')   {setCatId(null);     setCatName('');}
    if(key==='inst')  {setInstId(null);    setInstName('');}
    if(key==='gender'){setGender('');}
  },[]);

  // ── CSS helpers ───────────────────────────────────────────────────────────
  const card  = `rounded-2xl border overflow-hidden mb-4 ${dm?'bg-slate-800/60 border-slate-700':'bg-white border-slate-200 shadow-sm'}`;
  const iCls  = `w-full px-3 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all
    ${dm?'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-400'
        :'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'}`;
  const sCls  = `w-full px-3 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all appearance-none cursor-pointer
    ${dm?'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-400'
        :'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`;
  const lbl   = `block text-xs font-black uppercase tracking-widest mb-1.5 ${dm?'text-slate-400':'text-slate-500'}`;
  const slPct = ((shift+15)/30)*100;

  // Inject scrollbar-hiding CSS client-side only (avoids SSR hydration mismatch)
  useEffect(() => {
    const id = 'scrollbar-none-style';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = '.scrollbar-none{scrollbar-width:none}.scrollbar-none::-webkit-scrollbar{display:none}';
    document.head.appendChild(el);
    return () => { const s = document.getElementById(id); if (s) s.remove(); };
  }, []);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="pb-12">
      <Toast toasts={toasts}/>

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        {setCurrentView && (
          <button onClick={()=>setCurrentView('home')}
            className={`p-2 rounded-xl border transition-all
              ${dm?'border-slate-700 bg-slate-800 text-slate-400 hover:text-white':'border-slate-200 bg-white text-slate-500 hover:text-slate-900'}`}>
            <Ic.Back/>
          </button>
        )}
        <div className="flex-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${dm?'text-slate-500':'text-slate-400'}`}>
            Opening & Closing Ranks
          </p>
          <h1 className={`text-xl font-black tracking-tight ${dm?'text-white':'text-slate-900'}`}>Cutoff Explorer</h1>
        </div>
        {ctName && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
            style={{backgroundColor:color.lt, borderColor:color.bd, color:color.tx}}>
            <span className="w-2 h-2 rounded-full" style={{backgroundColor:color.dot}}/>
            {ctName}
          </span>
        )}
      </div>

      {/* ══ STEP 1 — COUNSELLING TYPE ════════════════════════════════════════ */}
      <div className={card}>
        <SHdr n={1} done={!!ctId} dm={dm}
          title="Counselling Type"
          sub="Required · all filters load after selection"/>
        <div className="p-4">
          {ldT
            ? <span className="flex items-center gap-2 text-xs text-slate-400"><Ic.Spin/>Loading types from database…</span>
            : allTypes.length===0
              ? <p className={`text-xs ${dm?'text-slate-500':'text-slate-400'}`}>The server is slow. Please refresh or reopen this page</p>
              : <div className="flex flex-wrap gap-2">
                  {allTypes.map((t,i)=>{
                    const c=pal(i); const on=ctId===t.id;
                    return (
                      <button key={t.id}
                        onClick={()=>{ if(ctId===t.id) return; setCtId(t.id); setCtName(t.name); resetAll(); toast(`${t.name} selected`,'success'); scrollSoon(stateStepRef); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all
                          ${on?'text-white border-transparent shadow-lg'
                             :dm?'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                :'bg-white text-slate-600 border-slate-300 hover:border-slate-400'}`}
                        style={on?{backgroundColor:c.bg,boxShadow:`0 4px 14px ${c.bg}40`}:{}}>
                        {on&&<span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center"><Ic.Check/></span>}
                        {t.name}
                      </button>
                    );
                  })}
                </div>
          }
          {ctId&&!ldA&&!ldC&&(
            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
              ${dm?'bg-blue-500/10 border border-blue-500/25 text-blue-300':'bg-blue-50 border border-blue-200 text-blue-700'}`}>
              <Ic.DB/>
              {ctName} · {allAuths.length} authorities · {allCourses.length} courses · {allCats.length} categories
              {colTotal>0&&` · ${colTotal.toLocaleString('en-IN')} colleges`}
            </div>
          )}
        </div>
      </div>

      {!ctId&&!ldT&&(
        <div className={`mb-4 p-8 rounded-2xl border border-dashed text-center
          ${dm?'bg-slate-800/40 border-slate-700':'bg-slate-50 border-slate-200'}`}>
          <p className="text-2xl mb-2">☝️</p>
          <p className={`text-sm font-black ${dm?'text-slate-400':'text-slate-500'}`}>
            Select a counselling type above to get started
          </p>
        </div>
      )}

      {ctId&&(<>

        {/* ══ STEP — STATE ═════════════════════════════════════════════════════
            Comes BEFORE Authority because authority itself depends on state
            in this dataset (UP -> UPDGME/UP_Ayush, All India -> MCC/AACCC). */}
        {hasStateStep&&(
          <div className={card} ref={stateStepRef}>
            <SHdr n={stepState} done={!!stateId} dm={dm}
              title="State"
              sub={ldS ? 'Loading states…' : `${allStates.length} state${allStates.length===1?'':'s'} available`}
              badge={stateId&&(
                <span className={`flex items-center gap-1 text-[10px] font-bold ${dm?'text-emerald-400':'text-emerald-600'}`}>
                  <Ic.MapPin/>✓ {stateName}
                </span>
              )}/>
            <div className="p-4">
              <Pills items={allStates} selected={stateId} color={color} dm={dm}
                allLabel="All States" loading={ldS}
                onSelect={(id,name)=>{ setStateId(id||null); setStateName(name||''); if(name) toast(`${name} selected`,'info',1600); scrollSoon(hasAuthStep?authStepRef:(hasITypeStep?itypeStepRef:roundStepRef)); }}/>
            </div>
          </div>
        )}

        {/* ══ STEP — AUTHORITY ═══════════════════════════════════════════════ */}
        {hasAuthStep&&(
          <div className={card} ref={authStepRef}>
            <SHdr n={stepAuth} done={!!authId} dm={dm}
              title="Authority / Council"
              sub={`${allAuths.length} authorit${allAuths.length===1?'y':'ies'} available`}
              badge={authId&&<span className={`text-[10px] font-bold ${dm?'text-emerald-400':'text-emerald-600'}`}>✓ {authName}</span>}/>
            <div className="p-4">
              <Pills items={allAuths} selected={authId} color={color} dm={dm}
                allLabel="All Authorities" loading={ldA}
                onSelect={(id,name)=>{ setAuthId(id||null); setAuthName(name||''); if(name) toast(`${name} selected`,'info',1600); scrollSoon(hasITypeStep?itypeStepRef:roundStepRef); }}/>
            </div>
          </div>
        )}

        {/* ══ INSTITUTE TYPE (DB-driven, only when dataset has it) ═════════════
            Institute Type is genuinely scoped here: selecting it now flows
            into courses/quotas/categories/years/rounds AND the college list
            below, instead of silently being ignored everywhere except the
            final search payload. */}
        {hasITypeStep&&(
          <div className={card} ref={itypeStepRef}>
            <SHdr n={stepIType} done={!!instTypeId} dm={dm}
              title="Institute Type"
              sub="Narrows results — also filters the college list below"/>
            <div className="p-4">
              <Pills
                items={allInstTyp} selected={instTypeId} color={color} dm={dm}
                allLabel="All Types" loading={ldIT}
                onSelect={(id,name)=>{ setInstTypeId(id||null); setInstType(name||''); if(name) toast(`${name} type selected`,'info',1600); scrollSoon(roundStepRef); }}/>
            </div>
          </div>
        )}

        {/* ══ ROUND ══════════════════════════════════════════════════════════ */}
        <div className={card} ref={roundStepRef}>
          <SHdr n={stepRound} done={!!roundId} dm={dm}
            title="Round"
            sub="Select the counselling round"/>
          <div className="p-4">
            <Pills items={allRounds} selected={roundId} color={color} dm={dm}
              allLabel="All Rounds" loading={ldR}
              onSelect={(id,name)=>{ setRoundId(id||null); setRoundName(name||''); if(name) toast(`${name} selected`,'info',1600); scrollSoon(yearStepRef); }}/>
          </div>
        </div>

        {/* ══ YEAR ═══════════════════════════════════════════════════════════ */}
        <div className={card} ref={yearStepRef}>
          <SHdr n={stepYear} done={!!yearSel} dm={dm}
            title="Year"
            sub="Select the counselling year"/>
          <div className="p-4">
            <Pills
              items={(allYears||[]).map(y=>({id:y,name:String(y)}))}
              selected={yearSel} color={color} dm={dm}
              allLabel="All Years" loading={ldY}
              onSelect={(id)=>{ setYearSel(id||null); if(id) toast(`Year ${id}`,'info',1500); scrollSoon(cqcStepRef); }}/>
          </div>
        </div>

        {/* ══ COURSE, QUOTA & CATEGORY ═══════════════════════════════════════ */}
        <div className={card} ref={cqcStepRef}>
          <SHdr n={stepCQC} done={!!(courseId||quotaId||catId)} dm={dm}
            title="Course, Quota & Category"
            sub="Select from dropdowns · each scoped to previous selections"/>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Course */}
              <Dropdown label="Course / Program" dm={dm} loading={ldC}
                items={allCourses} value={courseId}
                onChange={v=>{ const f=allCourses.find(c=>String(c.id)===v); setCourseId(v?Number(v):null); setCourseName(f?.name||''); if(f) toast(`${f.name}`,'info',1600); }}
                placeholder="All Courses"/>

              {/* Quota */}
              <Dropdown label="Quota" dm={dm} loading={ldQ}
                items={allQuotas} value={quotaId}
                onChange={v=>{ const f=allQuotas.find(q=>String(q.id)===v); setQuotaId(v?Number(v):null); setQuotaName(f?.name||''); if(f) toast(`${f.name} quota`,'info',1600); }}
                placeholder="All Quotas"/>

              {/* Category */}
              <Dropdown label="Category" dm={dm} loading={ldK}
                items={allCats} value={catId}
                onChange={v=>{ const f=allCats.find(c=>String(c.id)===v); setCatId(v?Number(v):null); setCatName(f?.name||''); if(f) toast(`${f.name} category`,'info',1600); scrollSoon(instStepRef); }}
                placeholder="All Categories"/>
            </div>

            {/* Gender (if available) */}
            {meta.hasGender&&allGenders.length>0&&(
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Gender</label>
                  <div className="relative">
                    <select value={gender} onChange={e=>{setGender(e.target.value); if(e.target.value) toast(`${e.target.value} gender`,'info',1500);}} className={sCls}>
                      <option value="">All Genders</option>
                      {allGenders.map(g=>{ const v=typeof g==='object'?g.name||g:g; return <option key={v} value={v}>{v}</option>; })}
                    </select>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}><Ic.ChevD/></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ INSTITUTE / COLLEGE ════════════════════════════════════════════
            Full width, genuinely scoped to state + institute type too. */}
        <div className={card.replace('overflow-hidden','overflow-visible')} ref={instStepRef}>
          <SHdr n={stepInst} done={!!instId} dm={dm}
            title="Institute"
            sub="Type to search — scoped to everything selected above"/>
          <div className="p-4">
            <CollegeDrop
              colleges={cols} total={colTotal}
              selId={instId} selName={instName}
              onSelect={(id,name)=>{ setInstId(id||null); setInstName(name||''); if(name) toast(`${name.split('(')[0].trim()} selected`,'success',2000); scrollSoon(rankStepRef); }}
              onSearch={handleColSrch}
              onMore={()=>loadCols(colPage+1,colSrch,true)}
              hasMore={colMore} loading={ldCol} loadingMore={ldColM}
              dm={dm}/>
          </div>
        </div>

        {/* ══ OPTIONAL EXTRA FILTERS — Fees, Bond, Score ═══════════════════ */}
        {(meta.hasFees||meta.hasBond||meta.hasScore)&&(
          <div className={card}>
            <SHdr n={stepExtra} done={false} dm={dm}
              title="Additional Filters"
              sub="Fees, bond, score — available for this counselling type"/>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {meta.hasFees&&(<>
                <div><label className={lbl}>Min Fees (₹)</label><input type="number" value={minFees} onChange={e=>setMinFees(e.target.value)} placeholder="0" className={iCls}/></div>
                <div><label className={lbl}>Max Fees (₹)</label><input type="number" value={maxFees} onChange={e=>setMaxFees(e.target.value)} placeholder="10,00,000" className={iCls}/></div>
              </>)}
              {meta.hasBond&&(
                <div>
                  <label className={lbl}>Bond Years</label>
                  <div className="relative">
                    <select value={bondYrs} onChange={e=>setBondYrs(e.target.value)} className={sCls}>
                      <option value="">Any</option>
                      {[1,2,3,5,7,10].map(y=><option key={y} value={y}>{y} yr{y>1?'s':''}</option>)}
                    </select>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}><Ic.ChevD/></span>
                  </div>
                </div>
              )}
              {meta.hasScore&&(<>
                <div><label className={lbl}>Min Score</label><input type="number" value={minScore} onChange={e=>setMinScore(e.target.value)} placeholder="400" className={iCls}/></div>
                <div><label className={lbl}>Max Score</label><input type="number" value={maxScore} onChange={e=>setMaxScore(e.target.value)} placeholder="720" className={iCls}/></div>
              </>)}
            </div>
          </div>
        )}

        {/* ══ RANK + SIMULATOR ════════════════════════════════════════════════ */}
        <div className={`${card.replace('mb-4','mb-4')}`} ref={rankStepRef}>
          <SHdr n="★" done={!!userRank} dm={dm}
            title="Rank Predictor & Cutoff Simulator"
            sub="Optional — highlights matching rows in results"/>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`flex items-center gap-1.5 ${lbl}`}><Ic.Trophy/>Your Target Rank (AIR)</label>
              <input type="number" value={userRank} onChange={e=>setUserRank(e.target.value)}
                placeholder="Enter NEET AIR…" className={iCls}/>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`flex items-center gap-1.5 ${lbl}`}><Ic.Sliders/>Cutoff Shift Simulator</label>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-full
                  ${shift>0?'bg-rose-500/15 text-rose-500':shift<0?'bg-blue-500/15 text-blue-500':dm?'bg-slate-700 text-slate-400':'bg-slate-200 text-slate-500'}`}>
                  {shift>0?`+${shift}% Tougher`:shift<0?`${shift}% Easier`:'Standard'}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-bold mb-1 px-0.5 text-slate-400">
                <span>−15%</span><span>0%</span><span>+15%</span>
              </div>
              <input type="range" min="-15" max="15" step="1" value={shift}
                onChange={e=>setShift(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{background:`linear-gradient(to right,#2563EB 0%,#2563EB ${slPct}%,${dm?'#334155':'#e2e8f0'} ${slPct}%,${dm?'#334155':'#e2e8f0'} 100%)`}}/>
            </div>
          </div>
        </div>

        {/* CHIPS */}
        <Chips chips={chips} onRemove={removeChip} dm={dm}/>

        {/* ERROR */}
        {errSrch&&(
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold">
            {errSrch}
          </div>
        )}

        {/* SEARCH + RESET BUTTONS */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 p-4 rounded-2xl border
          ${dm?'bg-slate-800/60 border-slate-700':'bg-white border-slate-200 shadow-sm'}`}>
          <p className={`text-[11px] font-medium hidden sm:block ${dm?'text-slate-500':'text-slate-400'}`}>
            All filters optional · Category gives most accurate rank data
          </p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button onClick={doReset} disabled={ldSrch}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all
                ${dm?'border-slate-600 text-slate-200 hover:bg-slate-700':'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
              <Ic.Reset/>Reset
            </button>
            <button onClick={()=>{ doSearch(1); scrollSoon(resultsRef, 250); }} disabled={ldSrch}
              className={`flex items-center gap-1.5 px-7 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all
                ${ldSrch?'opacity-50 cursor-not-allowed bg-blue-600':'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'}`}>
              {ldSrch?<><Ic.Spin/>Searching…</>:<><Ic.Search/>Search Results</>}
            </button>
          </div>
        </div>
      </>)}

      {/* STATS */}
      {searched&&<Stats total={totItems} rows={results} dm={dm}/>}

      {/* SELECTED-COLLEGES → CHOICE LAB BAR — appears once at least one row is
          checked in the table below; works whether CutoffTable triggers the
          forward itself (via onAddToChoiceLab) or just keeps selectedColleges
          in sync via setSelectedColleges. */}
      {selectedColleges.length>0&&(
        <div className={`sticky top-2 z-30 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-lg
          ${dm?'bg-blue-600/15 border-blue-500/40':'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-2">
            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black text-white ${dm?'bg-blue-500':'bg-blue-600'}`}>
              {selectedColleges.length}
            </span>
            <p className={`text-sm font-bold ${dm?'text-blue-200':'text-blue-800'}`}>
              college{selectedColleges.length>1?'s':''} selected
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button onClick={()=>setSelectedColleges([])}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all
                ${dm?'border-slate-600 text-slate-200 hover:bg-slate-700':'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
              <Ic.X/>Clear
            </button>
            <button onClick={forwardToChoiceLab}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5"
              style={{backgroundColor:'#1A3C6E'}}>
              <Ic.ChevR/>Send to Choice Lab
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div ref={resultsRef}>
        <CutoffTable
          data={results} totalItems={totItems} totalPages={totPages}
          currentPage={curPage} onPageChange={doPage}
          loading={ldSrch} hasSearched={searched}
          userRank={userRank} cutoffShift={shift} darkMode={dm}
          onOpenTrendModal={(n)=>{ setTName(n); setTOpen(true); }}
          selectedColleges={selectedColleges} setSelectedColleges={setSelectedColleges}
          onAddToChoiceLab={forwardToChoiceLab}
          setCurrentView={setCurrentView}/>
      </div>

      {/* TREND MODAL */}
      <TrendModal
        isOpen={tOpen} onClose={()=>setTOpen(false)}
        instituteName={tName} darkMode={dm} counselingType={ctName}/>
    </div>
  );
}