'use client';

// =============================================================================
// ChoiceLab.jsx — AI Choice Filling Analyzer (single unified page)
// =============================================================================
// One file. No separate Sandbox page — this IS the sandbox, fully merged in.
//
// Cascade matches the backend EXACTLY:
//   Step 1 : Counselling Type  → buttons
//   Step 2 : State             → pills + search   (BEFORE authority, backend order)
//   Step 3 : Authority         → pills             (scoped to type+state)
//   Step 4 : Institute Type    → pills              CONDITIONAL — only rendered
//              when backend actually returns rows (e.g. UP datasets). MCC/AYUSH
//              correctly return [] so this section is hidden entirely.
//   Step 5 : Round + Year      → pills              (scoped to everything above)
//   Step 6 : Course → Quota → Category → College    (Quota loads AFTER Course)
//   Step 7 : Add button → Preference List
//   Step 8 : Reorder / conflict-check / export
//
// On picking a college, opening + closing rank are fetched via
// fetchCollegeCutoffs(id, {ctId,authId,courseId,quotaId,stateId,instituteTypeId}).
//
// If the parent passes treeList/setTreeList (e.g. colleges shortlisted from
// CutoffTable), the list is controlled by the parent so those colleges show
// up here too. If not passed, the component keeps its own internal list —
// so this same file works standalone with zero extra setup.
// =============================================================================

import React, {
  useState, useEffect, useRef, useCallback, useMemo, memo,
} from 'react';
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
  fetchCollegeCutoffs,
} from '@/utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────
const Ic = {
  Spin:  ()=><svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
  Check: ()=><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:     ()=><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevD: ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevL: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Up:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  Down:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Trash: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Save:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Sort:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Warn:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Bldg:  ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 21V9"/><path d="M15 21V9"/><path d="M3 12h18"/></svg>,
  Plus:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Grip:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>,
  Map:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Srch:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bldg2: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/></svg>,
  Sparkle:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v3m0 12v3m9-9h-3M6 12H3m13.5-6.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2"/></svg>,
  Back:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Refresh:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
};

// ─────────────────────────────────────────────────────────────────────────────
// Palette
// ─────────────────────────────────────────────────────────────────────────────
const PAL = [
  {bg:'#2563EB',lt:'rgba(37,99,235,.1)',  bd:'rgba(37,99,235,.3)',  tx:'#1D4ED8'},
  {bg:'#16A34A',lt:'rgba(22,163,74,.1)',  bd:'rgba(22,163,74,.3)',  tx:'#15803D'},
  {bg:'#9333EA',lt:'rgba(147,51,234,.1)', bd:'rgba(147,51,234,.3)', tx:'#7E22CE'},
  {bg:'#EA580C',lt:'rgba(234,88,12,.1)',  bd:'rgba(234,88,12,.3)',  tx:'#C2410C'},
  {bg:'#0891B2',lt:'rgba(8,145,178,.1)',  bd:'rgba(8,145,178,.3)',  tx:'#0E7490'},
  {bg:'#BE185D',lt:'rgba(190,24,93,.1)',  bd:'rgba(190,24,93,.3)',  tx:'#9D174D'},
];
const pal = (i) => PAL[Math.abs(i||0) % PAL.length];

const uid  = (m) => `${m}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
const fmtN = (n) => n != null ? Number(n).toLocaleString('en-IN') : '—';

// ─────────────────────────────────────────────────────────────────────────────
// Conflict detection
// Conflict = a SAFER college (bigger closeRank) placed ABOVE a DREAM college
// (smaller closeRank) — the allotment engine stops at the first eligible
// match in list order, so the dream college would never be tried.
// ─────────────────────────────────────────────────────────────────────────────
function buildConflictSet(list) {
  const s = new Set();
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i].closeRank, b = list[i+1].closeRank;
    if (a != null && b != null && a > b) { s.add(i); s.add(i+1); }
  }
  return s;
}
function countConflictPairs(list) {
  let n = 0;
  for (let i = 0; i < list.length - 1; i++) {
    const a = list[i].closeRank, b = list[i+1].closeRank;
    if (a != null && b != null && a > b) n++;
  }
  return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-xl text-xs font-bold
          ${t.type==='success'?'bg-emerald-600/95 border-emerald-400/50 text-white'
          :t.type==='warn'   ?'bg-amber-500/95 border-amber-400/50 text-white'
          :                   'bg-slate-800/95 border-slate-600/50 text-white'}`}>
          {t.type==='success'&&<Ic.Check/>}{t.type==='warn'&&<Ic.Warn/>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pills (scrollable, horizontal)
// ─────────────────────────────────────────────────────────────────────────────
function Pills({ items, selected, onSelect, color, dm, allLabel='All', loading }) {
  const ref = useRef(null);
  const sc  = d => ref.current?.scrollBy({left:d*200,behavior:'smooth'});
  const arw = `flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center
    ${dm?'border-slate-600 bg-slate-800 text-slate-400 hover:bg-slate-700'
        :'border-slate-200 bg-white text-slate-400 hover:bg-slate-100'}`;
  const pillCls = `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all whitespace-nowrap cursor-pointer`;
  const off  = dm
    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900';
  return (
    <div className="flex items-center gap-1.5">
      <button className={arw} onClick={()=>sc(-1)} type="button"><Ic.ChevL/></button>
      <div ref={ref} className="flex-1 flex gap-1.5 overflow-x-auto py-0.5 px-0.5 scrollbar-none">
        {loading
          ? <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400"><Ic.Spin/>Loading…</span>
          : <>
              <button type="button" onClick={()=>onSelect(null,'')}
                className={`${pillCls} ${!selected?'text-white border-transparent':off}`}
                style={!selected&&color?{backgroundColor:color.bg}:{}}>
                {allLabel}
              </button>
              {items.map(item=>{
                const id    = typeof item==='object'?item.id:item;
                const label = typeof item==='object'?item.name:String(item);
                const on    = String(selected)===String(id)||selected===label;
                return (
                  <button type="button" key={id} onClick={()=>onSelect(id,label)}
                    className={`${pillCls} ${on?'text-white border-transparent scale-[1.03]':off}`}
                    style={on&&color?{backgroundColor:color.bg}:{}}>
                    {label}
                  </button>
                );
              })}
            </>
        }
      </div>
      <button className={arw} onClick={()=>sc(1)} type="button"><Ic.ChevR/></button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatePicker — pills + type-to-search (future-proofs against many states)
// ─────────────────────────────────────────────────────────────────────────────
function StatePicker({ allStates, stateId, onSelect, color, dm, loading }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(()=>{
    const s = q.trim().toLowerCase();
    if (!s) return allStates;
    return allStates.filter(st =>
      st.name.toLowerCase().includes(s) ||
      (st.code && st.code.toLowerCase().includes(s))
    );
  }, [allStates, q]);

  return (
    <div className="space-y-2">
      {allStates.length > 8 && (
        <div className="relative">
          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}>
            <Ic.Srch/>
          </span>
          <input
            type="text"
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder={`Search ${allStates.length} states…`}
            className={`w-full pl-8 pr-8 py-2 rounded-lg border text-xs font-medium outline-none transition-all
              ${dm?'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-600 focus:border-blue-500'
                  :'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'}`}
          />
          {q && (
            <button type="button" onClick={()=>setQ('')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${dm?'text-slate-500 hover:text-white':'text-slate-400 hover:text-slate-700'}`}>
              <Ic.X/>
            </button>
          )}
        </div>
      )}

      {filtered.length===0
        ? <p className={`text-xs font-medium px-2 py-1.5 ${dm?'text-slate-600':'text-slate-400'}`}>No states match "{q}"</p>
        : <Pills
            items={filtered.map(s=>({id:s.id,name:s.code||s.name}))}
            selected={stateId}
            onSelect={onSelect}
            color={color}
            dm={dm}
            allLabel="All States"
            loading={loading}
          />
      }
      {q && filtered.length>0 && (
        <p className={`text-[10px] font-bold ${dm?'text-slate-600':'text-slate-400'}`}>
          {filtered.length} of {allStates.length} states match "{q}"
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdown (Course / Quota / Category)
// ─────────────────────────────────────────────────────────────────────────────
function Dropdown({ label, items, value, onChange, loading, dm, placeholder='All', disabled, hint }) {
  const sCls = `w-full px-3 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all appearance-none cursor-pointer
    ${disabled||loading?'opacity-50 cursor-not-allowed':''}
    ${dm?'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-400'
        :'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`;
  const lCls = `block text-xs font-black uppercase tracking-widest mb-1.5 ${dm?'text-slate-400':'text-slate-500'}`;
  const sel  = items.find(i=>(typeof i==='object'?String(i.id):i)===String(value));
  return (
    <div>
      <label className={lCls}>{label}</label>
      <div className="relative">
        {loading
          ? <div className={`w-full px-3 py-2.5 rounded-lg border text-xs flex items-center gap-1.5
              ${dm?'bg-slate-800 border-slate-700 text-slate-500':'bg-white border-slate-200 text-slate-400'}`}>
              <Ic.Spin/>Loading…
            </div>
          : <>
              <select value={value||''} onChange={e=>onChange(e.target.value)}
                disabled={disabled||items.length===0} className={sCls}>
                <option value="">{placeholder}</option>
                {items.map(item=>{
                  const v=typeof item==='object'?item.id:item;
                  const l=typeof item==='object'?item.name:String(item);
                  return <option key={v} value={v}>{l}</option>;
                })}
              </select>
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}>
                <Ic.ChevD/>
              </span>
            </>
        }
      </div>
      {value&&!loading&&sel&&(
        <p className={`mt-1 text-[10px] font-bold ${dm?'text-emerald-400':'text-emerald-600'}`}>
          ✓ {typeof sel==='object'?sel.name:sel}
        </p>
      )}
      {hint&&!value&&!loading&&(
        <p className={`mt-1 text-[10px] font-bold ${dm?'text-slate-600':'text-slate-400'}`}>{hint}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CollegeDrop — paginated, searchable, fetches OR/CR on pick
// ─────────────────────────────────────────────────────────────────────────────
function CollegeDrop({
  colleges, total, selId, selName, onSelect, onSearch,
  onMore, hasMore, loading, loadingMore, dm, alreadyAdded,
  ctId, authId, courseId, quotaId, stateId, instituteTypeId,
}) {
  const [open,setOpen]               = useState(false);
  const [qry,setQry]                 = useState('');
  const [rankLoading,setRankLoading] = useState(false);
  const wRef                         = useRef(null);
  const inputRef                     = useRef(null);
  const dRef                         = useRef(null);
  const [panelStyle,setPanelStyle]   = useState({});

  const calcPanel = useCallback(()=>{
    if(!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPanelStyle({
      position:'fixed', top:rect.bottom+4,
      left:rect.left, width:rect.width,
      maxHeight:Math.max(Math.min(300,spaceBelow-8),120), zIndex:9990,
    });
  },[]);

  useEffect(()=>{
    const fn=e=>{ if(wRef.current&&!wRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown',fn);
    return()=>document.removeEventListener('mousedown',fn);
  },[]);

  useEffect(()=>{ if(!selName) setQry(''); },[selName]);

  useEffect(()=>{
    if(!open) return;
    calcPanel();
    window.addEventListener('scroll',calcPanel,true);
    window.addEventListener('resize',calcPanel);
    return()=>{ window.removeEventListener('scroll',calcPanel,true); window.removeEventListener('resize',calcPanel); };
  },[open,calcPanel]);

  const type = e=>{
    const v=e.target.value; setQry(v); setOpen(true);
    clearTimeout(dRef.current);
    dRef.current=setTimeout(()=>onSearch(v),300);
  };

  // Fetch real opening + closing rank the moment a college is picked.
  // This is what was missing before — selCollege.openRank/closeRank were
  // never populated because the college LIST endpoint doesn't return ranks,
  // only fetchCollegeCutoffs(id, filters) does.
  const pick = async c=>{
    if(alreadyAdded?.has(c.id)) return;
    setOpen(false); setQry(c.name);
    setRankLoading(true);
    try {
      const r = await fetchCollegeCutoffs(c.id, {
        ctId:             ctId             || undefined,
        authId:           authId           || undefined,
        courseId:         courseId         || undefined,
        quotaId:          quotaId          || undefined,
        stateId:          stateId          || undefined,
        instituteTypeId:  instituteTypeId  || undefined,
      });
      const rows = r?.data?.data || [];
      const best = rows[0] || {};
      onSelect({
        ...c,
        openRank:  best.openRank  ?? best.open_rank  ?? null,
        closeRank: best.closeRank ?? best.close_rank ?? null,
      });
    } catch(e) {
      console.error('[CollegeDrop:rank]', e);
      onSelect(c); // still add the college, just without rank
    } finally {
      setRankLoading(false);
    }
  };
  const clear = () => { onSelect(null); setQry(''); onSearch(''); };

  const lCls = `block text-xs font-black uppercase tracking-widest mb-1.5 ${dm?'text-slate-400':'text-slate-500'}`;
  const iCls = `w-full pl-8 pr-8 py-2.5 rounded-lg border text-sm font-medium outline-none transition-all
    ${dm?'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-400'
        :'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500'}`;
  const ph = total>0?`Search ${total.toLocaleString('en-IN')} colleges…`:'Select counselling type & course first';

  return (
    <div ref={wRef} className="relative">
      <label className={lCls}>
        Institute / College
        {total>0&&<span className={`ml-2 normal-case font-bold text-[10px] ${dm?'text-blue-400':'text-blue-600'}`}>
          {total.toLocaleString('en-IN')} available
        </span>}
      </label>
      <div className="relative" ref={inputRef}>
        <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-500':'text-slate-400'}`}>
          {loading||rankLoading?<Ic.Spin/>:<Ic.Bldg/>}
        </span>
        <input value={qry} onChange={type}
          onFocus={()=>{ if(colleges.length>0||total>0){calcPanel();setOpen(true);} }}
          placeholder={rankLoading?'Fetching opening/closing rank…':ph}
          className={iCls} autoComplete="off"/>
        {(qry||selName)&&!rankLoading
          ? <button type="button" onClick={clear} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${dm?'text-slate-400 hover:text-white':'text-slate-400 hover:text-slate-700'}`}><Ic.X/></button>
          : <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${dm?'text-slate-600':'text-slate-300'}`}><Ic.ChevD/></span>
        }
      </div>

      {selName&&!open&&(
        <div className={`mt-1 flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg
          ${dm?'bg-emerald-500/10 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}>
          <Ic.Check/><span className="truncate">{selName}</span>
          {rankLoading&&<span className="ml-1 flex items-center gap-1 text-amber-400 font-bold"><Ic.Spin/>Fetching rank…</span>}
        </div>
      )}

      {open&&(
        <div className={`rounded-xl border shadow-2xl overflow-hidden ${dm?'bg-slate-800 border-slate-600':'bg-white border-slate-200'}`}
          style={panelStyle}>
          <div className="overflow-y-auto" style={{maxHeight:(panelStyle.maxHeight||280)-36}}>
            {loading&&<div className={`flex items-center gap-2 px-4 py-3 text-xs font-medium ${dm?'text-slate-400':'text-slate-500'}`}><Ic.Spin/>Loading colleges…</div>}
            {!loading&&colleges.length===0&&(
              <p className={`px-4 py-5 text-xs text-center font-medium ${dm?'text-slate-500':'text-slate-400'}`}>
                {total===0?'Select counselling type + course first':'No colleges match your search'}
              </p>
            )}
            {colleges.map(c=>{
              const added=alreadyAdded?.has(c.id);
              return (
                <button key={c.id} type="button" onMouseDown={()=>pick(c)} disabled={added}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between gap-2
                    ${added
                      ?dm?'opacity-40 cursor-not-allowed text-slate-500':'opacity-40 cursor-not-allowed text-slate-400'
                      :selId===c.id
                        ?dm?'bg-blue-600/20 text-blue-300 font-bold':'bg-blue-50 text-blue-700 font-bold'
                        :dm?'text-slate-200 hover:bg-slate-700 font-medium':'text-slate-800 hover:bg-slate-50 font-medium'}`}>
                  <span className="truncate">{c.name}</span>
                  {added
                    ? <span className={`text-[10px] font-bold shrink-0 ${dm?'text-emerald-400':'text-emerald-600'}`}>✓ added</span>
                    : selId===c.id&&<span className="flex-shrink-0 text-emerald-500"><Ic.Check/></span>
                  }
                </button>
              );
            })}
            {hasMore&&!loading&&(
              <button type="button" onMouseDown={onMore} disabled={loadingMore}
                className={`w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-t
                  ${dm?'border-slate-700 text-blue-400 hover:bg-slate-700':'border-slate-100 text-blue-600 hover:bg-blue-50'}`}>
                {loadingMore?<><Ic.Spin/>Loading…</>:<>Load more colleges ↓</>}
              </button>
            )}
          </div>
          {total>0&&<div className={`px-4 py-1.5 text-[10px] font-bold border-t ${dm?'border-slate-700 text-slate-500':'border-slate-100 text-slate-400'}`}>
            {total.toLocaleString('en-IN')} colleges match current filters
          </div>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHdr — Section header
// ─────────────────────────────────────────────────────────────────────────────
function SHdr({ n, done, title, sub, dm, badge }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${dm?'border-slate-700 bg-slate-800/50':'border-slate-100 bg-slate-50'}`}>
      <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border
        ${done?'bg-emerald-500 border-emerald-400 text-white':dm?'bg-slate-700 border-slate-600 text-slate-300':'bg-white border-slate-300 text-slate-600'}`}>
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

// ─────────────────────────────────────────────────────────────────────────────
// DetailCell
// ─────────────────────────────────────────────────────────────────────────────
function DetailCell({ label, value, highlight, dm }) {
  return (
    <div className={`p-2.5 rounded-lg border ${dm?'bg-slate-900/50 border-slate-700':'bg-slate-50 border-slate-200'}`}>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${dm?'text-slate-500':'text-slate-400'}`}>{label}</p>
      <p className={`text-xs font-bold font-mono truncate ${highlight?(dm?'text-emerald-400':'text-emerald-700'):(dm?'text-slate-200':'text-slate-700')}`}>
        {value||'—'}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChoiceCard — single item in the preference list
// ─────────────────────────────────────────────────────────────────────────────
const ChoiceCard = memo(function ChoiceCard({ node, index, total, conflict, onMove, onRemove, dm }) {
  const [exp, setExp] = useState(false);
  return (
    <div className={`rounded-xl border transition-all duration-150
      ${conflict
        ?dm?'border-amber-500/50 bg-amber-500/5':'border-amber-300 bg-amber-50/60'
        :dm?'bg-slate-800/60 border-slate-700 hover:border-slate-600':'bg-white border-slate-200 shadow-sm hover:shadow'}`}>
      <div className="flex items-center gap-3 p-3.5">
        {/* Number */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`${dm?'opacity-30':'opacity-20'} text-slate-500`}><Ic.Grip/></span>
          <span className="font-mono font-black text-xs h-7 w-7 rounded-lg flex items-center justify-center border"
            style={dm
              ?{background:'rgba(37,99,235,0.12)',borderColor:'rgba(37,99,235,0.25)',color:'#60A5FA'}
              :{background:'rgba(26,60,110,0.07)',borderColor:'rgba(26,60,110,0.18)',color:'#1A3C6E'}}>
            {String(index+1).padStart(2,'0')}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`font-black text-sm sm:text-base truncate ${dm?'text-white':'text-slate-900'}`}>{node.institute}</p>
          <div className={`flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs font-medium ${dm?'text-slate-400':'text-slate-500'}`}>
            {node.counselingType&&node.counselingType!=='—'&&(
              <span className={`font-bold ${dm?'text-blue-400':'text-blue-600'}`}>{node.counselingType}</span>
            )}
            {node.state&&node.state!=='—'&&(
              <span className={`flex items-center gap-1 ${dm?'text-violet-400':'text-violet-700'}`}>
                <Ic.Map/>{node.state}{node.stateName&&node.stateName!==node.state?` (${node.stateName})`:''}
              </span>
            )}
            {node.instituteType&&node.instituteType!=='—'&&(
              <span className={`flex items-center gap-1 ${dm?'text-cyan-400':'text-cyan-700'}`}>
                <Ic.Bldg2/>{node.instituteType}
              </span>
            )}
            {node.course&&node.course!=='—'&&<span>{node.course}</span>}
            {node.quota &&node.quota !=='—'&&<span>{node.quota}</span>}
            {node.category&&node.category!=='—'&&<span>{node.category}</span>}
            <span className="font-mono">
              OR:&nbsp;<span className={dm?'text-sky-400 font-black':'text-sky-700 font-black'}>{fmtN(node.openRank)}</span>
              &nbsp;CR:&nbsp;<span className={conflict
                ?(dm?'text-amber-400 font-black':'text-amber-600 font-black')
                :(dm?'text-emerald-400 font-black':'text-emerald-700 font-black')
              }>{fmtN(node.closeRank)}</span>
            </span>
            <button type="button" onClick={()=>setExp(e=>!e)}
              className={`font-bold hover:underline ${dm?'text-blue-400':'text-blue-600'}`}>
              {exp?'▲ hide details':'▼ view details'}
            </button>
          </div>
          {conflict&&(
            <p className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg w-fit border
              ${dm?'bg-amber-500/10 border-amber-500/20 text-amber-400':'bg-amber-50 border-amber-200 text-amber-700'}`}>
              ⚠ Safer college above is blocking this dream pick — reorder or Auto-Arrange
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" disabled={index===0} onClick={()=>onMove(index,'up')} title="Move up"
            className={`p-2 rounded-lg border transition-all disabled:opacity-20
              ${dm?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Ic.Up/>
          </button>
          <button type="button" disabled={index===total-1} onClick={()=>onMove(index,'down')} title="Move down"
            className={`p-2 rounded-lg border transition-all disabled:opacity-20
              ${dm?'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700':'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Ic.Down/>
          </button>
          <button type="button" onClick={()=>onRemove(node.id)} title="Remove"
            className={`p-2 rounded-lg border transition-all
              ${dm?'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20':'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}>
            <Ic.Trash/>
          </button>
        </div>
      </div>

      {/* Detail drawer */}
      {exp&&(
        <div className={`mx-3.5 mb-3.5 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-2 ${dm?'border-slate-700':'border-slate-100'}`}>
          <DetailCell label="Counselling"    value={node.counselingType}  dm={dm}/>
          <DetailCell label="State Code"     value={node.state}           dm={dm}/>
          <DetailCell label="State Name"     value={node.stateName}       dm={dm}/>
          <DetailCell label="Authority"      value={node.authority}       dm={dm}/>
          <DetailCell label="Institute Type" value={node.instituteType}   dm={dm}/>
          <DetailCell label="Course"         value={node.course}          dm={dm}/>
          <DetailCell label="Quota"          value={node.quota}           dm={dm}/>
          <DetailCell label="Category"       value={node.category}        dm={dm}/>
          <DetailCell label="Round"          value={node.round}           dm={dm}/>
          <DetailCell label="Year"           value={node.year}            dm={dm}/>
          <DetailCell label="Open Rank"      value={fmtN(node.openRank)}  highlight dm={dm}/>
          <DetailCell label="Closing Rank"   value={fmtN(node.closeRank)} highlight dm={dm}/>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Preference List panel
// ─────────────────────────────────────────────────────────────────────────────
function PrefList({ choices, setChoices, dm, stepNo, onBack, backLabel, toast, onRefresh, refreshing }) {
  const notify = toast || (()=>{});
  const conflictSet   = useMemo(()=>buildConflictSet(choices),[choices]);
  const conflictPairs = useMemo(()=>countConflictPairs(choices),[choices]);

  const move = useCallback((i,dir)=>{
    setChoices(prev=>{
      const arr=[...prev];
      if(dir==='up'   &&i>0)          [arr[i],arr[i-1]]=[arr[i-1],arr[i]];
      if(dir==='down' &&i<arr.length-1)[arr[i],arr[i+1]]=[arr[i+1],arr[i]];
      return arr;
    });
  },[setChoices]);

  const remove = useCallback((id)=>setChoices(p=>p.filter(c=>c.id!==id)),[setChoices]);

  const autoArrange = ()=>{
    setChoices(prev=>[...prev].sort((a,b)=>{
      if(a.closeRank==null) return 1;
      if(b.closeRank==null) return -1;
      return a.closeRank - b.closeRank; // dream (low CR) on top
    }));
  };

  // ───────────────────────────────────────────────────────────────────────
  // exportPdf — final, attractive, branded PDF of the preference list.
  // Requires: npm i jspdf jspdf-autotable
  //
  // Design notes:
  //  • autoTable's `overflow:'linebreak'` wraps long institute names at
  //    WORD boundaries — this is what stops words being cut/misplaced
  //    mid-string across the page, which is the #1 cause of "ugly" PDFs.
  //  • Header band + footer band are redrawn on every page via
  //    `didDrawPage`, so the "RankSetu SMG" brand tag + page numbers
  //    appear identically on page 1, 2, 3… no matter how many rows.
  //  • Conflict rows (a safer college sitting above a dream college) are
  //    tinted so the PDF carries the same warning the on-screen list does.
  // ───────────────────────────────────────────────────────────────────────
  const [pdfBusy, setPdfBusy] = useState(false);
  const exportPdf = async ()=>{
    if(!choices.length || pdfBusy) return;
    setPdfBusy(true);
    try{
      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const autoTable = autoTableMod.default || autoTableMod;

      const doc    = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
      const pageW  = doc.internal.pageSize.getWidth();
      const pageH  = doc.internal.pageSize.getHeight();
      const BRAND  = [26, 60, 110];   // #1A3C6E
      const MUTED  = [120, 130, 145];
      const CONFLICT_TINT = [255, 244, 230];

      const conflictRows = buildConflictSet(choices);
      const genDate = new Date().toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });

      const head = [[
        '#', 'Institute', 'Counselling', 'State', 'Authority',
        'Course', 'Quota', 'Category', 'Round', 'Year', 'Open Rank', 'Closing Rank',
      ]];
      const body = choices.map((c,i)=>[
        String(i+1),
        c.institute || '—',
        c.counselingType || '—',
        (c.stateName && c.stateName !== '—') ? c.stateName : (c.state || '—'),
        c.authority || '—',
        c.course || '—',
        c.quota || '—',
        c.category || '—',
        c.round || '—',
        c.year || '—',
        c.openRank  != null ? fmtN(c.openRank)  : '—',
        c.closeRank != null ? fmtN(c.closeRank) : '—',
      ]);

      autoTable(doc, {
        head, body,
        startY: 26,
        margin: { left: 10, right: 10, top: 26, bottom: 18 },
        theme: 'grid',
        tableWidth: 'auto',
        styles: {
          font: 'helvetica', fontSize: 8, cellPadding: 2.4,
          overflow: 'linebreak', valign: 'middle',
          textColor: [30, 41, 59], lineColor: [221, 227, 235], lineWidth: 0.15,
        },
        headStyles: {
          fillColor: BRAND, textColor: 255, fontStyle: 'bold',
          fontSize: 8.5, halign: 'center',
        },
        alternateRowStyles: { fillColor: [245, 248, 252] },
        columnStyles: {
          0:  { cellWidth: 8,  halign: 'center' },
          1:  { cellWidth: 54 },
          2:  { cellWidth: 22 },
          3:  { cellWidth: 20 },
          4:  { cellWidth: 24 },
          5:  { cellWidth: 32 },
          6:  { cellWidth: 18 },
          7:  { cellWidth: 18 },
          8:  { cellWidth: 15, halign: 'center' },
          9:  { cellWidth: 13, halign: 'center' },
          10: { cellWidth: 18, halign: 'right' },
          11: { cellWidth: 20, halign: 'right' },
        },
        didParseCell: (data)=>{
          if(data.section==='body' && conflictRows.has(data.row.index)){
            data.cell.styles.fillColor = CONFLICT_TINT;
          }
        },
        didDrawPage: ()=>{
          // ── watermark (every page) — faint, diagonal, behind/under the
          // content visually because it's near-transparent, so the table
          // stays fully readable. ─────────────────────────────────────────
          doc.saveGraphicsState();
          doc.setGState(new doc.GState({ opacity: 0.07 }));
          doc.setTextColor(...BRAND);
          doc.setFont('helvetica','bold');
          doc.setFontSize(64);
          doc.text('RankSetu', pageW/2, pageH/2, { align:'center', angle:35 });
          doc.restoreGraphicsState();

          // ── header band (every page) ──────────────────────────────────
          doc.setFillColor(...BRAND);
          doc.rect(0, 0, pageW, 20, 'F');
          doc.setTextColor(255,255,255);
          doc.setFont('helvetica','bold');
          doc.setFontSize(16);
          doc.text('RankSetu', 10, 11);
          doc.setFont('helvetica','normal');
          doc.setFontSize(8.5);
          doc.text('SMG  •  AI Choice Filling List  •  Founder: Umashankar', 10, 16.5);

          doc.setFont('helvetica','bold');
          doc.setFontSize(9);
          doc.text(`Total Choices: ${choices.length}`, pageW-10, 11, { align:'right' });
          doc.setFont('helvetica','normal');
          doc.setFontSize(8);
          doc.text(`Generated: ${genDate}`, pageW-10, 16.5, { align:'right' });

          // ── footer band (every page) ────────────────────────────────────
          doc.setDrawColor(...MUTED);
          doc.setLineWidth(0.1);
          doc.line(10, pageH-13, pageW-10, pageH-13);
          doc.setFontSize(7.5);
          doc.setTextColor(...MUTED);
          doc.setFont('helvetica','bold');
          doc.text('RankSetu • SMG', 10, pageH-8);
          doc.setFont('helvetica','normal');
          doc.text(
            'Dream colleges first, safer colleges last. Verify the official seat matrix before final submission.',
            pageW/2, pageH-8, { align:'center' },
          );
          doc.setFont('helvetica','italic');
          doc.text('Made by Umashankar', pageW-10, pageH-3.5, { align:'right' });
        },
      });

      // page numbers — added last so the true total page count is known
      const totalPages = doc.internal.getNumberOfPages();
      for(let p=1; p<=totalPages; p++){
        doc.setPage(p);
        doc.setFont('helvetica','normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(`Page ${p} of ${totalPages}`, pageW-10, pageH-8, { align:'right' });
      }

      doc.save('RankSetu_ChoiceList.pdf');
      notify('PDF downloaded','success');
    }catch(e){
      console.error('[exportPdf]', e);
      notify('Could not generate the PDF — please try again','warn',3000);
    }finally{
      setPdfBusy(false);
    }
  };

  const card = `rounded-2xl border overflow-hidden ${dm?'bg-slate-900 border-slate-700':'bg-white border-slate-200 shadow-sm'}`;
  const statusCls = choices.length===0
    ?(dm?'bg-slate-800/30 border-slate-700/50 text-slate-600':'bg-slate-50 border-slate-100 text-slate-400')
    :conflictPairs>0
      ?(dm?'bg-amber-500/10 border-amber-500/20 text-amber-400':'bg-amber-50 border-amber-200 text-amber-700')
      :(dm?'bg-emerald-500/10 border-emerald-500/20 text-emerald-400':'bg-emerald-50 border-emerald-200 text-emerald-700');
  const statusMsg = choices.length===0
    ?'Add colleges using the filter panel above'
    :conflictPairs>0
      ?`${conflictPairs} conflict${conflictPairs>1?'s':''} — safer college blocking a dream pick. Use Auto-Arrange.`
      :`✓ ${choices.length} choice${choices.length>1?'s':''} — sequence looks correct`;

  return (
    <div className={card}>
      <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap
        ${dm?'border-slate-700 bg-slate-800/40':'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-3">
          <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border
            ${dm?'bg-blue-500/20 text-blue-400 border-transparent':'bg-blue-100 text-blue-700 border-transparent'}`}>
            {stepNo}
          </span>
          <div>
            <p className={`text-sm font-black ${dm?'text-white':'text-slate-900'}`}>Your Preference List</p>
            <p className={`text-xs ${dm?'text-slate-500':'text-slate-400'}`}>Dream colleges on top → safer colleges at bottom</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {onRefresh&&(
            <button type="button" onClick={onRefresh} disabled={choices.length===0||refreshing}
              title="Re-check every college against the latest source data — removes any that no longer exist there"
              className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl border transition-all disabled:opacity-40
                ${dm?'border-slate-700 text-slate-300 hover:bg-slate-800':'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
              <span className={refreshing?'animate-spin':''}><Ic.Refresh/></span>
              {refreshing?'Refreshing…':'Refresh List'}
            </button>
          )}
          <button type="button" onClick={autoArrange} disabled={choices.length<2}
            className="flex items-center gap-1.5 px-3.5 py-2 text-white font-bold text-xs rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{backgroundColor:'#1A3C6E'}}>
            <Ic.Sort/> Auto-Arrange
          </button>
          <button type="button" onClick={exportPdf} disabled={choices.length===0||pdfBusy}
            className="flex items-center gap-1.5 px-4 py-2 text-white font-bold text-xs rounded-xl transition-all hover:opacity-90 disabled:opacity-40"
            style={{backgroundColor:'#16A34A'}}>
            {pdfBusy ? <><Ic.Spin/> Preparing PDF…</> : <><Ic.Save/> Download PDF</>}
          </button>
        </div>
      </div>

      <div className={`px-5 py-2.5 border-b flex items-center gap-2 text-xs font-bold ${statusCls}`}>
        <Ic.Warn/><span>{statusMsg}</span>
      </div>

      <div className="p-4 space-y-2.5">
        {choices.length===0
          ?<div className={`py-16 text-center border-2 border-dashed rounded-2xl ${dm?'border-slate-700 text-slate-600':'border-slate-200 text-slate-400'}`}>
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-bold">Your list is empty</p>
            <p className="text-xs mt-1 font-medium">Use the filters above → pick a college → click Add</p>
            {onBack&&(
              <button type="button" onClick={onBack}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{backgroundColor:'#1A3C6E'}}>
                <Ic.Back/>{backLabel||'Back to Cutoffs'}
              </button>
            )}
          </div>
          :choices.map((node,i)=>(
            <ChoiceCard key={node.id} node={node} index={i} total={choices.length}
              conflict={conflictSet.has(i)} onMove={move} onRemove={remove} dm={dm}/>
          ))
        }
      </div>

      {choices.length>0&&(
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs font-semibold flex-wrap gap-2
          ${dm?'border-slate-700 text-slate-500':'border-slate-100 text-slate-400'}`}>
          <span>{choices.length} college{choices.length>1?'s':''} in list</span>
          <div className="flex items-center gap-4">
            <span className={conflictPairs>0?(dm?'text-amber-400 font-bold':'text-amber-600 font-bold'):(dm?'text-emerald-400 font-bold':'text-emerald-600 font-bold')}>
              {conflictPairs>0?`${conflictPairs} conflict${conflictPairs>1?'s':''} — fix before submitting`:'✓ Ready to submit'}
            </span>
            {onBack&&(
              <button type="button" onClick={onBack}
                className={`flex items-center gap-1 font-bold hover:underline ${dm?'text-blue-400':'text-blue-600'}`}>
                <Ic.Back/>{backLabel||'Back to Cutoffs'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN — ChoiceLab
// =============================================================================
export default function ChoiceLab({
  darkMode,
  treeList,                  // optional — pass to control list from parent (e.g. CutoffTable shortlist)
  setTreeList,                // optional — required if treeList is passed
  setCurrentView,             // optional — enables "Back to Cutoffs" button
}) {
  const dm = darkMode;

  // If the parent controls the list (treeList + setTreeList both given), use
  // that. Otherwise this component is fully self-contained — no setup needed
  // to drop it on any page standalone.
  const isControlled = treeList !== undefined && typeof setTreeList === 'function';

  // ── Preference list state ─────────────────────────────────────────────────
  const [internalChoices, setInternalChoices] = useState([]);
  const rawChoices  = isControlled ? (treeList || []) : internalChoices;
  const setChoices  = isControlled ? setTreeList : setInternalChoices;

  // Normalize every entry so the UI never breaks on missing fields —
  // this matters because entries can arrive from CutoffTable with a
  // different shape than what this component produces internally.
  const choices = useMemo(()=>rawChoices.map(n=>({
    id:             n.id            || uid('lab'),
    collegeId:      n.collegeId     ?? n.id ?? null,
    institute:      n.institute     || n.name || '—',
    counselingType: n.counselingType|| '—',
    state:          n.state         || '—',
    stateName:      n.stateName     || n.state || '—',
    authority:      n.authority     || '—',
    instituteType:  n.instituteType || '—',
    course:         n.course        || n.program || '—',
    quota:          n.quota         || '—',
    category:       n.category      || '—',
    round:          n.round         || '—',
    year:           n.year          || '—',
    openRank:       n.openRank      ?? null,
    closeRank:      n.closeRank     ?? null,
  })),[rawChoices]);

  // ── Cascade option lists ──────────────────────────────────────────────────
  const [allTypes,   setAllTypes]   = useState([]);
  const [allStates,  setAllStates]  = useState([]);
  const [allAuths,   setAllAuths]   = useState([]);
  const [allITypes,  setAllITypes]  = useState([]);
  const [allYears,   setAllYears]   = useState([]);
  const [allRounds,  setAllRounds]  = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allQuotas,  setAllQuotas]  = useState([]);
  const [allCats,    setAllCats]    = useState([]);

  // ── Selected values ───────────────────────────────────────────────────────
  const [ctId,       setCtId]       = useState(null);
  const [ctName,     setCtName]     = useState('');
  const [stateId,    setStateId]    = useState(null);
  const [stateName,  setStateName]  = useState('');
  const [stateCode,  setStateCode]  = useState('');
  const [authId,     setAuthId]     = useState(null);
  const [authName,   setAuthName]   = useState('');
  const [itId,       setItId]       = useState(null);
  const [itName,     setItName]     = useState('');
  const [yearSel,    setYearSel]    = useState(null);
  const [roundId,    setRoundId]    = useState(null);
  const [roundName,  setRoundName]  = useState('');
  const [courseId,   setCourseId]   = useState(null);
  const [courseName, setCourseName] = useState('');
  const [quotaId,    setQuotaId]    = useState(null);
  const [quotaName,  setQuotaName]  = useState('');
  const [catId,      setCatId]      = useState(null);
  const [catName,    setCatName]    = useState('');
  const [selCollege, setSelCollege] = useState(null);

  // ── Loading flags ──────────────────────────────────────────────────────────
  const [ldT,  setLdT]  = useState(true);
  const [ldSt, setLdSt] = useState(false);
  const [ldA,  setLdA]  = useState(false);
  const [ldIt, setLdIt] = useState(false);
  const [ldY,  setLdY]  = useState(false);
  const [ldR,  setLdR]  = useState(false);
  const [ldC,  setLdC]  = useState(false);
  const [ldQ,  setLdQ]  = useState(false);
  const [ldK,  setLdK]  = useState(false);

  // ── Colleges ──────────────────────────────────────────────────────────────
  const [cols,    setCols]    = useState([]);
  const [colTotal,setColTotal]= useState(0);
  const [colPage, setColPage] = useState(1);
  const [colMore, setColMore] = useState(false);
  const [colSrch, setColSrch] = useState('');
  const [ldCol,   setLdCol]   = useState(false);
  const [ldColM,  setLdColM]  = useState(false);

  // ── Step auto-scroll refs — after a filter is picked, scroll the next
  // step's card to the top of the viewport so the flow feels guided.
  const refType  = useRef(null);
  const refState = useRef(null);
  const refAuth  = useRef(null);
  const refIType = useRef(null);
  const refRound = useRef(null);
  const refCQC   = useRef(null);
  const refCollegeDrop = useRef(null);
  const refList  = useRef(null);

  // Smooth-scrolls a section so it lands a bit below the very top of the
  // viewport — leaving the tail of the previous (just-completed) step still
  // peeking above it, so the user sees confirmation of what they just picked
  // instead of it disappearing off-screen.
  const scrollToStep = useCallback((ref, delay = 80) => {
    if (!ref?.current) return;
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const OFFSET = 160; // leaves room for sticky header + a peek of the previous step
      const top = window.scrollY + rect.top - OFFSET;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }, delay);
  }, []);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const tid = useRef(0);
  const toast = useCallback((message,type='info',ms=2200)=>{
    const id=++tid.current;
    setToasts(p=>[...p,{id,message,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),ms);
  },[]);

  const color = useMemo(()=>pal(allTypes.findIndex(t=>t.id===ctId)),[ctId,allTypes]);

  // ── Scrollbar-hide CSS (injected once) ────────────────────────────────────
  useEffect(()=>{
    const id='cb-scrollbar-none';
    if(document.getElementById(id)) return;
    const el=document.createElement('style');
    el.id=id;
    el.textContent='.scrollbar-none{scrollbar-width:none}.scrollbar-none::-webkit-scrollbar{display:none}';
    document.head.appendChild(el);
    return()=>{ const s=document.getElementById(id); if(s) s.remove(); };
  },[]);

  // ============================================================================
  // CASCADE LOADERS — exact backend order: Type → State → Authority →
  // InstituteType(conditional) → Round/Year → Course → Quota(after course) →
  // Category → Colleges
  // ============================================================================

  // Step 1 — counselling types
  useEffect(()=>{
    setLdT(true);
    fetchCounselingTypes()
      .then(r=>{ if(r?.data?.success) setAllTypes(r.data.data||[]); })
      .catch(e=>console.error('[cb:types]',e))
      .finally(()=>setLdT(false));
  },[]);

  const resetDownstream = useCallback(()=>{
    setStateId(null); setStateName(''); setStateCode('');
    setAuthId(null);  setAuthName('');
    setItId(null);    setItName('');
    setYearSel(null); setRoundId(null); setRoundName('');
    setCourseId(null);setCourseName('');
    setQuotaId(null); setQuotaName('');
    setCatId(null);   setCatName('');
    setSelCollege(null);
    setCols([]); setColTotal(0); setColSrch('');
  },[]);

  // Step 2 — states (scoped to ct) — BEFORE authority
  useEffect(()=>{
    if(!ctId) return;
    setLdSt(true); setAllStates([]); setStateId(null); setStateName(''); setStateCode('');
    fetchFilterStates(ctId)
      .then(r=>{
        const raw=r?.data?.data||[];
        setAllStates(raw.map(s=>typeof s==='object'?s:{id:s,name:String(s),code:String(s)}));
      })
      .catch(e=>console.error('[cb:states]',e))
      .finally(()=>setLdSt(false));
  },[ctId]);

  // Step 3 — authorities (scoped to ct + state)
  useEffect(()=>{
    if(!ctId) return;
    setLdA(true); setAllAuths([]); setAuthId(null); setAuthName('');
    fetchFilterAuthorities(ctId, stateId)
      .then(r=>setAllAuths(r?.data?.data||[]))
      .catch(e=>console.error('[cb:auth]',e))
      .finally(()=>setLdA(false));
  },[ctId, stateId]);

  // Step 4 — institute types (scoped to ct + auth + state) — CONDITIONAL pill row.
  // Datasets like MCC/AYUSH return [] here; UP datasets return real values.
  // We only render the section if allITypes.length > 0.
  useEffect(()=>{
    if(!ctId) return;
    setLdIt(true); setAllITypes([]); setItId(null); setItName('');
    fetchFilterInstituteTypes(ctId, authId, stateId)
      .then(r=>setAllITypes(r?.data?.data||[]))
      .catch(e=>console.error('[cb:itype]',e))
      .finally(()=>setLdIt(false));
  },[ctId, authId, stateId]);

  // Step 5 — years + rounds (scoped to ct + auth + state + itype)
  useEffect(()=>{
    if(!ctId) return;
    setLdY(true); setLdR(true);
    setYearSel(null); setRoundId(null); setRoundName('');
    Promise.all([
      fetchFilterYears(ctId, authId, stateId, itId),
      fetchFilterRounds(ctId, authId, stateId, itId),
    ]).then(([y,r])=>{
      setAllYears(y?.data?.data||[]);
      setAllRounds(r?.data?.data||[]);
    }).catch(e=>console.error('[cb:yr]',e))
      .finally(()=>{ setLdY(false); setLdR(false); });
  },[ctId, authId, stateId, itId]);

  // Step 6a — courses (scoped to ct + auth + state + itype)
  useEffect(()=>{
    if(!ctId) return;
    setLdC(true); setCourseId(null); setCourseName('');
    fetchFilterCourses(ctId, authId, stateId, itId)
      .then(r=>setAllCourses(r?.data?.data||[]))
      .catch(e=>console.error('[cb:courses]',e))
      .finally(()=>setLdC(false));
  },[ctId, authId, stateId, itId]);

  // Step 6b — quotas (scoped to ct + auth + COURSE + state + itype)
  // Quota intentionally loads AFTER course is picked — backend signature is
  // fetchFilterQuotas(ctId, authId, courseId, stateId, instTypeId).
  useEffect(()=>{
    if(!ctId) return;
    setLdQ(true); setQuotaId(null); setQuotaName('');
    fetchFilterQuotas(ctId, authId, courseId, stateId, itId)
      .then(r=>setAllQuotas(r?.data?.data||[]))
      .catch(e=>console.error('[cb:quotas]',e))
      .finally(()=>setLdQ(false));
  },[ctId, authId, courseId, stateId, itId]);

  // Step 6c — categories (scoped to ct + auth + state + itype)
  useEffect(()=>{
    if(!ctId) return;
    setLdK(true); setCatId(null); setCatName('');
    fetchFilterCategories(ctId, authId, stateId, itId)
      .then(r=>setAllCats(r?.data?.data||[]))
      .catch(e=>console.error('[cb:cats]',e))
      .finally(()=>setLdK(false));
  },[ctId, authId, stateId, itId]);

  // Step 6d — colleges (scoped to EVERYTHING above, paginated)
  const loadCols = useCallback(async(page=1, srch=colSrch, append=false)=>{
    if(!ctId){ setCols([]); setColTotal(0); return; }
    page===1?setLdCol(true):setLdColM(true);
    try{
      const r = await fetchColleges({
        ctId,
        authId:           authId           || undefined,
        courseId:         courseId         || undefined,
        quotaId:          quotaId          || undefined,
        stateId:          stateId          || undefined,
        instituteTypeId:  itId             || undefined,
        search:           srch,
        page, pageSize:50,
      });
      if(r?.data?.success){
        const list=r.data.data||[];
        setCols(prev=>append?[...prev,...list]:list);
        setColTotal(r.data.totalItems||0);
        setColMore(r.data.hasNext||false);
        setColPage(page);
      }
    }catch(e){ console.error('[cb:cols]',e); }
    finally{ setLdCol(false); setLdColM(false); }
  },[ctId, authId, courseId, quotaId, stateId, itId, colSrch]);

  useEffect(()=>{
    if(!ctId){ setCols([]); setColTotal(0); return; }
    setSelCollege(null); setColSrch('');
    loadCols(1,'');
  },[ctId, authId, courseId, quotaId, stateId, itId]);

  const handleColSrch = useCallback((q)=>{ setColSrch(q); loadCols(1,q); },[loadCols]);

  // ── ADD TO LIST ─────────────────────────────────────────────────────────────
  const alreadyAdded = useMemo(()=>new Set(choices.map(c=>c.collegeId)),[choices]);

  const handleAdd = useCallback(()=>{
    if(!selCollege){ toast('Select a college first','warn'); return; }
    if(alreadyAdded.has(selCollege.id)){ toast('Already in your list','warn'); return; }
    const entry = {
      id:             uid('lab'),
      collegeId:      selCollege.id,
      institute:      selCollege.name,
      counselingType: ctName     ||'—',
      state:          stateCode  ||'—',
      stateName:      stateName  ||'—',
      authority:      authName   ||'—',
      instituteType:  itName     ||'—',
      course:         courseName ||'—',
      quota:          quotaName  ||'—',
      category:       catName    ||'—',
      round:          roundName  ||'—',
      year:           yearSel    ?String(yearSel):'—',
      openRank:       selCollege.openRank  ??null,
      closeRank:      selCollege.closeRank ??null,
    };
    setChoices(prev=>[...prev,entry]);
    const shortName=selCollege.name.length>45?selCollege.name.slice(0,45)+'…':selCollege.name;
    toast(`${shortName} added!`,'success');
    setSelCollege(null); setColSrch('');
    loadCols(1,'');
    // After adding, gently scroll down to the preference list so the user
    // sees their pick land in the list instead of wondering if it worked.
    scrollToStep(refList, 200);
  },[selCollege,alreadyAdded,ctName,stateCode,stateName,authName,itName,courseName,quotaName,catName,roundName,yearSel,toast,loadCols,setChoices,scrollToStep]);

  // ── REFRESH LIST ─────────────────────────────────────────────────────────
  // Re-validates every college already in the Preference List against the
  // live cutoff data at the source (whichever page/table it was added from —
  // CutoffTable, CutoffPage, or added here directly). For each college we
  // re-fetch its current cutoff rows and try to find the SAME
  // course+quota+category+round+year combination that was originally added:
  //   • college has no cutoff rows at all anymore  → removed entirely
  //   • that exact combination is gone             → removed entirely
  //   • still exists but rank changed               → openRank/closeRank updated
  //   • network/API error for that college          → left untouched (so a
  //     flaky request doesn't wipe someone's list)
  const [refreshing, setRefreshing] = useState(false);
  const handleRefreshList = useCallback(async ()=>{
    if(!choices.length || refreshing) return;
    setRefreshing(true);
    try{
      const uniqueIds = [...new Set(choices.map(c=>c.collegeId).filter(Boolean))];
      const settled = await Promise.allSettled(
        uniqueIds.map(id=>fetchCollegeCutoffs(id, {}))
      );

      const rowsById = new Map();
      settled.forEach((res,i)=>{
        const id = uniqueIds[i];
        rowsById.set(id, res.status==='fulfilled' ? (res.value?.data?.data || []) : undefined);
      });

      const norm = v => String(v ?? '').trim().toLowerCase();
      let removed = 0, updated = 0, failed = 0;

      const next = choices.reduce((acc,c)=>{
        if(!c.collegeId){ acc.push(c); return acc; } // nothing to verify against — keep

        const rows = rowsById.get(c.collegeId);
        if(rows===undefined){ failed++; acc.push(c); return acc; }   // fetch failed — don't touch
        if(rows.length===0){ removed++; return acc; }                // college gone entirely

        const match = rows.find(r =>
          norm(r.course)   === norm(c.course)   &&
          norm(r.quota)    === norm(c.quota)    &&
          norm(r.category) === norm(c.category) &&
          norm(r.round)    === norm(c.round)    &&
          norm(r.year)     === norm(c.year)
        );
        if(!match){ removed++; return acc; }                         // this exact row is gone

        const newOpen  = match.openRank  ?? match.open_rank  ?? null;
        const newClose = match.closeRank ?? match.close_rank ?? null;
        if(newOpen!==c.openRank || newClose!==c.closeRank) updated++;
        acc.push({ ...c, openRank:newOpen, closeRank:newClose });
        return acc;
      },[]);

      setChoices(next);

      if(!removed && !updated && !failed){
        toast('List already up to date','success');
      }else{
        const parts=[];
        if(removed) parts.push(`${removed} removed`);
        if(updated) parts.push(`${updated} rank${updated>1?'s':''} updated`);
        if(failed)  parts.push(`${failed} could not be checked`);
        toast(parts.join(' · '), removed?'warn':'success', 3500);
      }
    }catch(e){
      console.error('[cb:refresh]', e);
      toast('Refresh failed — please try again','warn');
    }finally{
      setRefreshing(false);
    }
  },[choices,refreshing,setChoices,toast]);

  // ── CSS shortcuts ────────────────────────────────────────────────────────────
  const card = `rounded-2xl border overflow-hidden mb-4 ${dm?'bg-slate-800/60 border-slate-700':'bg-white border-slate-200 shadow-sm'}`;
  const lbl  = `block text-xs font-black uppercase tracking-widest mb-1.5 ${dm?'text-slate-400':'text-slate-500'}`;

  // ── Dynamic step numbering — sections appear/disappear based on data ───────
  const hasAuth  = allAuths.length>0;
  const hasIType = allITypes.length>0;
  let stepCounter = 1;
  const stepType   = stepCounter++;                  // always 1
  const stepState  = (allStates.length>0||ldSt) ? stepCounter++ : null;
  const stepAuth   = hasAuth ? stepCounter++ : null;
  const stepIType  = (hasIType||ldIt) ? stepCounter++ : null;
  const stepRound  = stepCounter++;
  const stepCQC     = stepCounter++;        // Course, Quota, Category
  const stepCollege = stepCounter++;        // Institute / College
  const stepList   = stepCounter++;

  return (
    <div className="pb-12">
      <Toast toasts={toasts}/>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Ic.Sparkle/>
          <h2 className={`text-xl font-black tracking-tight ${dm?'text-white':'text-slate-900'}`}>
            AI Choice Filling Analyzer
          </h2>
        </div>
        <p className={`text-sm ${dm?'text-slate-400':'text-slate-500'}`}>
          Organise your final preference list — conflicts flagged automatically.
        </p>
      </div>

      {/* STEP — COUNSELLING TYPE */}
      <div className={card} ref={refType}>
        <SHdr n={stepType} done={!!ctId} dm={dm} title="Counselling Type" sub="Required — all filters load after selection"/>
        <div className="p-4">
          {ldT
            ?<span className="flex items-center gap-2 text-xs text-slate-400"><Ic.Spin/>Loading types…</span>
            :allTypes.length===0
              ?<p className={`text-xs ${dm?'text-slate-500':'text-slate-400'}`}>No types found.</p>
              :<div className="flex flex-wrap gap-2">
                {allTypes.map((t,i)=>{
                  const c=pal(i); const on=ctId===t.id;
                  return (
                    <button type="button" key={t.id}
                      onClick={()=>{ if(ctId===t.id) return; setCtId(t.id); setCtName(t.name); resetDownstream(); toast(`${t.name} selected`,'success'); scrollToStep(refState, 150); }}
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
            <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold flex-wrap
              ${dm?'bg-blue-500/10 border border-blue-500/25 text-blue-300':'bg-blue-50 border border-blue-200 text-blue-700'}`}>
              {ctName} · {allStates.length} states · {allAuths.length} authorities · {allCourses.length} courses · {allCats.length} categories
              {colTotal>0&&` · ${colTotal.toLocaleString('en-IN')} colleges`}
            </div>
          )}
        </div>
      </div>

      {!ctId&&!ldT&&(
        <div className={`mb-4 p-8 rounded-2xl border border-dashed text-center ${dm?'bg-slate-800/40 border-slate-700':'bg-slate-50 border-slate-200'}`}>
          <p className="text-2xl mb-2">☝️</p>
          <p className={`text-sm font-black ${dm?'text-slate-400':'text-slate-500'}`}>Select a counselling type above to begin</p>
        </div>
      )}

      {ctId&&(<>
        {/* STEP — STATE (before Authority, matches backend) */}
        {stepState&&(
          <div className={card} ref={refState}>
            <SHdr n={stepState} done={!!stateId} dm={dm}
              title="State"
              sub={allStates.length>0?`${allStates.length} state${allStates.length>1?'s':''} available — type to search`:'Loading states…'}
              badge={stateId&&(
                <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border
                  ${dm?'bg-violet-500/15 border-violet-500/30 text-violet-300':'bg-violet-50 border-violet-200 text-violet-700'}`}>
                  <Ic.Map/>
                  {stateCode}{stateName&&stateName!==stateCode?` — ${stateName}`:''}
                </div>
              )}/>
            <div className="p-4 space-y-3">
              <StatePicker
                allStates={allStates}
                stateId={stateId}
                onSelect={(id,code)=>{
                  if(!id){ setStateId(null); setStateCode(''); setStateName(''); return; }
                  const found=allStates.find(s=>String(s.id)===String(id));
                  setStateId(id);
                  setStateCode(found?.code||found?.name||code||'');
                  setStateName(found?.name||code||'');
                  if(found) toast(`${found.name}${found.code&&found.code!==found.name?` (${found.code})`:''} selected`,'info',1800);
                  scrollToStep(refAuth, 150);
                }}
                color={color} dm={dm} loading={ldSt}
              />
              {stateId&&stateName&&(
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
                  ${dm?'bg-violet-500/10 border border-violet-500/25 text-violet-300':'bg-violet-50 border border-violet-200 text-violet-700'}`}>
                  <Ic.Map/>
                  <span>
                    <span className="font-black">{stateCode}</span>
                    {stateName&&stateName!==stateCode&&<span className="font-medium ml-1.5">— {stateName}</span>}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP — AUTHORITY (scoped to type + state) */}
        {stepAuth&&(
          <div className={card} ref={refAuth}>
            <SHdr n={stepAuth} done={!!authId} dm={dm}
              title="Authority / Council"
              sub={`${allAuths.length} authorit${allAuths.length===1?'y':'ies'} available`}
              badge={authId&&<span className={`text-[10px] font-bold ${dm?'text-emerald-400':'text-emerald-600'}`}>✓ {authName}</span>}/>
            <div className="p-4">
              <Pills items={allAuths} selected={authId} color={color} dm={dm}
                allLabel="All Authorities" loading={ldA}
                onSelect={(id,name)=>{
                  setAuthId(id||null); setAuthName(name||'');
                  if(name) toast(`${name} selected`,'info',1500);
                  scrollToStep(hasIType ? refIType : refRound, 200);
                }}/>
            </div>
          </div>
        )}

        {/* STEP — INSTITUTE TYPE (CONDITIONAL — only when backend returns data, e.g. UP) */}
        {stepIType&&hasIType&&(
          <div className={card} ref={refIType}>
            <SHdr n={stepIType} done={!!itId} dm={dm}
              title="Institute Type"
              sub={`${allITypes.length} type${allITypes.length>1?'s':''} available for this selection`}
              badge={itId&&<span className={`text-[10px] font-bold ${dm?'text-cyan-400':'text-cyan-600'}`}>✓ {itName}</span>}/>
            <div className="p-4">
              <Pills items={allITypes} selected={itId} color={color} dm={dm}
                allLabel="All Institute Types" loading={ldIt}
                onSelect={(id,name)=>{
                  setItId(id||null); setItName(name||'');
                  if(name) toast(`${name}`,'info',1500);
                  scrollToStep(refRound, 200);
                }}/>
            </div>
          </div>
        )}

        {/* STEP — ROUND + YEAR */}
        <div className={card} ref={refRound}>
          <SHdr n={stepRound} done={!!(roundId||yearSel)} dm={dm}
            title="Round & Year"
            sub="Filter by round and year of cutoff data"/>
          <div className="p-4 space-y-4">
            <div>
              <label className={lbl}>Round</label>
              <Pills items={allRounds} selected={roundId} color={color} dm={dm}
                allLabel="All Rounds" loading={ldR}
                onSelect={(id,name)=>{
                  setRoundId(id||null); setRoundName(name||'');
                  if(name) toast(`${name}`,'info',1500);
                  scrollToStep(refCQC, 200);
                }}/>
            </div>
            <div>
              <label className={lbl}>Year</label>
              <Pills
                items={(allYears||[]).map(y=>({id:y,name:String(y)}))}
                selected={yearSel} color={color} dm={dm}
                allLabel="All Years" loading={ldY}
                onSelect={(id)=>{
                  setYearSel(id||null);
                  if(id) toast(`Year ${id}`,'info',1500);
                  scrollToStep(refCQC, 200);
                }}/>
            </div>
          </div>
        </div>

        {/* STEP — COURSE, QUOTA & CATEGORY */}
        <div className={card} ref={refCQC}>
          <SHdr n={stepCQC} done={!!(courseId||quotaId||catId)} dm={dm}
            title="Course, Quota & Category"
            sub="Quota updates after Course is selected"/>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Dropdown label="Course / Program" dm={dm} loading={ldC}
                items={allCourses} value={courseId||''}
                onChange={v=>{
                  const f=allCourses.find(c=>String(c.id)===v);
                  setCourseId(v?Number(v):null); setCourseName(f?.name||'');
                  setQuotaId(null); setQuotaName(''); setSelCollege(null);
                  if(f) toast(`${f.name}`,'info',1500);
                }}
                placeholder="All Courses"/>

              <Dropdown label="Quota" dm={dm} loading={ldQ}
                items={allQuotas} value={quotaId||''}
                onChange={v=>{
                  const f=allQuotas.find(q=>String(q.id)===v);
                  setQuotaId(v?Number(v):null); setQuotaName(f?.name||'');
                  setSelCollege(null);
                  if(f) toast(`${f.name} quota`,'info',1500);
                }}
                placeholder={courseId?'All Quotas':'Select Course first'}
                disabled={!courseId&&allQuotas.length===0}
                hint="↑ Select a Course to load quotas"/>

              <Dropdown label="Category" dm={dm} loading={ldK}
                items={allCats} value={catId||''}
                onChange={v=>{
                  const f=allCats.find(c=>String(c.id)===v);
                  setCatId(v?Number(v):null); setCatName(f?.name||'');
                  if(f) toast(`${f.name} category`,'info',1500);
                  // Category is the last field in this group — only now do
                  // we bring the College section into view.
                  scrollToStep(refCollegeDrop, 200);
                }}
                placeholder="All Categories"/>
            </div>
          </div>
        </div>

        {/* STEP — INSTITUTE / COLLEGE */}
        <div className={card.replace('overflow-hidden','overflow-visible')} ref={refCollegeDrop}>
          <SHdr n={stepCollege} done={!!selCollege} dm={dm}
            title="Institute / College"
            sub="Type to search — scoped to everything selected above"/>
          <div className="p-4 space-y-4">
            <CollegeDrop
              colleges={cols} total={colTotal}
              selId={selCollege?.id||null} selName={selCollege?.name||''}
              onSelect={(c)=>setSelCollege(c||null)}
              onSearch={handleColSrch}
              onMore={()=>loadCols(colPage+1,colSrch,true)}
              hasMore={colMore} loading={ldCol} loadingMore={ldColM}
              alreadyAdded={alreadyAdded}
              ctId={ctId} authId={authId} courseId={courseId} quotaId={quotaId}
              stateId={stateId} instituteTypeId={itId}
              dm={dm}/>

            <button type="button"
              onClick={handleAdd}
              disabled={!selCollege}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold
                transition-all disabled:opacity-40
                ${selCollege?'text-white border-transparent hover:opacity-90':dm?'border-slate-700 text-slate-500':'border-slate-200 text-slate-400'}`}
              style={selCollege?{backgroundColor:color.bg,boxShadow:`0 4px 14px ${color.bg}40`}:{}}>
              <Ic.Plus/>
              {selCollege?`Add "${selCollege.name.slice(0,50)}${selCollege.name.length>50?'…':''}" to List`:'Select a college above to add'}
            </button>
          </div>
        </div>
      </>)}

      {/* STEP — PREFERENCE LIST (always visible) */}
      <div ref={refList}>
      <PrefList
        choices={choices}
        setChoices={setChoices}
        dm={dm}
        stepNo={stepList}
        onBack={setCurrentView ? ()=>setCurrentView('analytics') : undefined}
        backLabel="Back to Cutoffs"
        toast={toast}
        onRefresh={handleRefreshList}
        refreshing={refreshing}
      />
      </div>
    </div>
  );
}