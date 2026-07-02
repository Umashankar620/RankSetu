'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles, AlertTriangle, CheckCircle, Copy, Download,
  TrendingUp, TrendingDown, Minus, ChevronDown, Filter,
  BarChart3, Zap, Star, Shield, Target, Activity, Info,
  ArrowUpRight, Clock, Flame, Award, Layers, MapPin, Building2
} from "lucide-react";
import {
  fetchPyCounselingTypes, fetchPyStates, fetchPyAuthorities,
  fetchPyInstituteTypes, fetchPyCourses, fetchPyQuotas, fetchPyCategories,
  optimizeChoices,
} from "@/utils/api";

const TOP_N_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => ({ label: `Top ${i + 1}`, value: i + 1 })),
  { label: "Show All", value: 0 },
];

const TrendIcon = ({ trend }) => {
  if (trend === "Rising")  return <TrendingUp   className="w-3 h-3 text-primary" />;
  if (trend === "Falling") return <TrendingDown  className="w-3 h-3 text-primary" />;
  return <Minus className="w-3 h-3 text-primary" />;
};

const ConfBar = ({ value }) => {
  const color = value > 70 ? "#1A3C6E" : value > 40 ? "#2563EB" : "#F0A500";
  const label = value > 70 ? "High" : value > 40 ? "Medium" : "Low";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label} {value}%</span>
    </div>
  );
};

const sortByRankProximity = (colleges, userRank) => {
  return [...colleges].sort((a, b) => {
    const diffA = Math.abs(a.predicted_close - userRank);
    const diffB = Math.abs(b.predicted_close - userRank);
    return diffA - diffB;
  });
};

const CollegeCard = ({ college, idx, darkMode, userRank, onAddToLab }) => {
  const isTop = idx < 3;
  const rankDiff = college.predicted_close - userRank;
  
  return (
    <div className={`group rounded border transition-all hover:border-primary/50 hover:-translate-y-0.5
      ${isTop ? (darkMode ? 'border-primary/40 bg-primary/5' : 'border-primary/30 bg-primary/5')
        : (darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white')}`}>
      
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-bold
            ${isTop ? 'bg-primary text-white' : (darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>
            {idx + 1}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              {college.institute}
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full
                ${darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                {college.program}
              </span>
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-full
                ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                {college.quota}
              </span>
              <div className="flex items-center gap-1">
                <TrendIcon trend={college.trend} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {college.trend}
                </span>
              </div>
            </div>
            
            <div className="mt-2">
              <ConfBar value={college.confidence} />
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <div className={`text-lg font-bold font-mono text-primary`}>
              {college.predicted_close?.toLocaleString()}
            </div>
            <div className={`text-sm font-medium mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Predicted Rank
            </div>
          </div>
        </div>
        
        {onAddToLab && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onAddToLab(college)}
              className={`w-full text-sm font-semibold py-2 rounded transition-all
                ${darkMode ? 'text-primary hover:text-primary/80' : 'text-primary hover:text-primary/80'}`}>
              + Add to Choice Lab
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const BucketPanel = ({ title, icon, items, darkMode, onCopy, emptyLabel, userRank, onAddToLab }) => {
  const Icon = icon;
  
  return (
    <div className={`flex flex-col rounded border overflow-hidden
      ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
      
      <div className={`px-4 py-3 border-b flex items-center justify-between
        ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-primary'}`}>{title}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${darkMode ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCopy} disabled={!items.length}
            className={`p-1.5 rounded transition disabled:opacity-40
              ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-3 space-y-2 max-h-[500px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">{emptyLabel}</div>
        ) : (
          items.map((college, idx) => (
            <CollegeCard
              key={college.institute + college.program + idx}
              college={college}
              idx={idx}
              darkMode={darkMode}
              userRank={userRank}
              onAddToLab={onAddToLab}
            />
          ))
        )}
      </div>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, darkMode, placeholder, icon: Icon }) => (
  <div>
    <label className={`text-sm font-bold uppercase tracking-wide block mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
      {Icon && <Icon className="w-3 h-3 inline mr-1" />} {label}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full text-sm font-medium px-3 py-2.5 rounded border focus:outline-none focus:border-primary
        ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>
      {placeholder && <option value="ALL">{placeholder}</option>}
      {options.map(o => (
        <option key={typeof o === "object" ? o.value : o} value={typeof o === "object" ? o.value : o}>
          {typeof o === "object" ? o.label : o}
        </option>
      ))}
    </select>
  </div>
);

export default function ChoiceOptimizer({ darkMode, showToast, onShareCard, onAddToLab }) {
  const [userRank, setUserRank] = useState("");

  // ── Cascade selections (names — what gets sent to the API) ──────────────
  const [ctName,       setCtName]       = useState("ALL");
  const [stateName,    setStateName]    = useState("ALL");
  const [authName,     setAuthName]     = useState("ALL");
  const [instTypeName, setInstTypeName] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedQuota,    setSelectedQuota]    = useState("ALL");
  const [selectedCourse,   setSelectedCourse]   = useState("ALL");

  // ── Cascade dropdown option lists — 100% database-driven ────────────────
  const [counselingTypes, setCounselingTypes] = useState([]);
  const [states,          setStates]          = useState([]);
  const [authorities,     setAuthorities]     = useState([]);
  const [instituteTypes,  setInstituteTypes]  = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [quotas,          setQuotas]          = useState([]);
  const [courses,         setCourses]         = useState([]);

  // ── Per-step loading flags (so each dropdown can show its own spinner) ──
  const [ldCt,    setLdCt]    = useState(true);
  const [ldState, setLdState] = useState(false);
  const [ldAuth,  setLdAuth]  = useState(false);
  const [ldIType, setLdIType] = useState(false);
  const [ldRest,  setLdRest]  = useState(false);

  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ dream: [], target: [], safe: [] });
  const [hasOptimized, setHasOptimized] = useState(false);
  const [stats, setStats] = useState(null);
  const resultsRef = useRef(null);

  // ==========================================================================
  // CASCADE LOADERS — Counselling Type → State → Authority → Institute Type
  // → Course/Quota/Category. Every dropdown is 100% database-driven: no
  // hardcoded values anywhere, every selection narrows the next dropdown,
  // and changing a parent filter resets every child filter automatically.
  // ==========================================================================

  // Step 1 — Counselling Type, loaded once on mount
  useEffect(() => {
    setLdCt(true);
    fetchPyCounselingTypes()
      .then(r => setCounselingTypes(r?.data?.data || []))
      .catch(() => showToast("Failed to load counselling types."))
      .finally(() => setLdCt(false));
  }, [showToast]);

  // Reset every downstream filter — called whenever a parent filter changes
  const resetDownstreamOfType = useCallback(() => {
    setStateName("ALL"); setAuthName("ALL"); setInstTypeName("ALL");
    setSelectedCategory("ALL"); setSelectedQuota("ALL"); setSelectedCourse("ALL");
    setStates([]); setAuthorities([]); setInstituteTypes([]);
    setCategories([]); setQuotas([]); setCourses([]);
    setHasOptimized(false); setResults({ dream: [], target: [], safe: [] }); setStats(null);
  }, []);

  const resetDownstreamOfState = useCallback(() => {
    setAuthName("ALL"); setInstTypeName("ALL");
    setSelectedCategory("ALL"); setSelectedQuota("ALL"); setSelectedCourse("ALL");
    setAuthorities([]); setInstituteTypes([]);
    setCategories([]); setQuotas([]); setCourses([]);
    setHasOptimized(false); setResults({ dream: [], target: [], safe: [] }); setStats(null);
  }, []);

  const resetDownstreamOfAuth = useCallback(() => {
    setInstTypeName("ALL");
    setSelectedCategory("ALL"); setSelectedQuota("ALL"); setSelectedCourse("ALL");
    setInstituteTypes([]);
    setCategories([]); setQuotas([]); setCourses([]);
    setHasOptimized(false); setResults({ dream: [], target: [], safe: [] }); setStats(null);
  }, []);

  // Step 2 — States, scoped to selected Counselling Type only
  useEffect(() => {
    if (ctName === "ALL") { setStates([]); return; }
    setLdState(true);
    fetchPyStates(ctName)
      .then(r => setStates(r?.data?.data || []))
      .catch(() => showToast("Failed to load states."))
      .finally(() => setLdState(false));
  }, [ctName, showToast]);

  // Step 3 — Authorities, scoped to type + state
  useEffect(() => {
    if (ctName === "ALL") { setAuthorities([]); return; }
    setLdAuth(true);
    fetchPyAuthorities(ctName, stateName)
      .then(r => setAuthorities(r?.data?.data || []))
      .catch(() => showToast("Failed to load authorities."))
      .finally(() => setLdAuth(false));
  }, [ctName, stateName, showToast]);

  // Institute Type pill — scoped to type + state + authority. Returns []
  // for datasets whose CSV maps type: null (e.g. MCC, AYUSH); the UI
  // hides this field entirely in that case instead of showing a stale list.
  useEffect(() => {
    if (ctName === "ALL") { setInstituteTypes([]); return; }
    setLdIType(true);
    fetchPyInstituteTypes(ctName, stateName, authName)
      .then(r => setInstituteTypes(r?.data?.data || []))
      .catch(() => showToast("Failed to load institute types."))
      .finally(() => setLdIType(false));
  }, [ctName, stateName, authName, showToast]);

  // Remaining filters (Course, Quota, Category) — all scoped to everything
  // selected so far. Never show values that don't exist in the filtered data.
  useEffect(() => {
    if (ctName === "ALL") { setCourses([]); setQuotas([]); setCategories([]); return; }
    setLdRest(true);
    Promise.all([
      fetchPyCourses(ctName, stateName, authName, instTypeName),
      fetchPyCategories(ctName, stateName, authName, instTypeName),
    ]).then(([c, cat]) => {
      setCourses(c?.data?.data || []);
      setCategories(cat?.data?.data || []);
    }).catch(() => showToast("Failed to load courses/categories."))
      .finally(() => setLdRest(false));
  }, [ctName, stateName, authName, instTypeName, showToast]);

  // Quotas depend additionally on the selected Course
  useEffect(() => {
    if (ctName === "ALL") { setQuotas([]); return; }
    fetchPyQuotas(ctName, stateName, authName, instTypeName, selectedCourse)
      .then(r => setQuotas(r?.data?.data || []))
      .catch(() => showToast("Failed to load quotas."));
  }, [ctName, stateName, authName, instTypeName, selectedCourse, showToast]);

  // onChange handlers that reset every downstream filter (per the cascading
  // reset spec: changing a parent filter must reset every child filter).
  const handleCtChange = (val) => { setCtName(val); resetDownstreamOfType(); };
  const handleStateChange = (val) => { setStateName(val); resetDownstreamOfState(); };
  const handleAuthChange = (val) => { setAuthName(val); resetDownstreamOfAuth(); };
  const handleInstTypeChange = (val) => {
    setInstTypeName(val);
    setSelectedCategory("ALL"); setSelectedQuota("ALL"); setSelectedCourse("ALL");
    setHasOptimized(false); setResults({ dream: [], target: [], safe: [] }); setStats(null);
  };

  // Force Category to "Open" when Deemed quota is selected
  useEffect(() => {
    if (selectedQuota === "DEEMED/paid seat Quota") {
      if (selectedCategory !== "Open") {
        setSelectedCategory("Open");
        showToast("For Deemed quota, only Open category is applicable.");
      }
    }
  }, [selectedQuota, selectedCategory, showToast]);

  const handleOptimize = async (e) => {
    e.preventDefault();
    const rank = parseInt(userRank, 10);
    if (!rank || rank <= 0) { showToast("Please enter a valid NEET rank"); return; }
    if (!ctName || ctName === "ALL") {
      showToast("Please select a Counselling Type to proceed.");
      return;
    }
    if (!selectedCategory || selectedCategory === "ALL") {
      showToast("Please select a Category to proceed.");
      return;
    }

    setLoading(true);
    try {
      // Prediction NEVER runs on the whole database — every filter
      // selected through the cascade above is applied server-side
      // BEFORE prediction runs, on the exact same filtering pipeline
      // the Upgrade module uses.
      const data = await optimizeChoices({
        user_rank: rank,
        counseling_type: ctName,
        state: stateName,
        authority: authName,
        institute_type: instTypeName,
        category: selectedCategory,
        quota: selectedQuota,
        course: selectedCourse,
        top_n: 0,
      });

      const sorted = {
        ...data,
        dream: sortByRankProximity(data.dream || [], rank),
        target: sortByRankProximity(data.target || [], rank),
        safe: sortByRankProximity(data.safe || [], rank),
      };

      const sliced = topN > 0 ? {
        ...sorted,
        dream: sorted.dream.slice(0, topN),
        target: sorted.target.slice(0, topN),
        safe: sorted.safe.slice(0, topN),
      } : sorted;

      setResults(sliced);
      setStats(data.stats);
      setHasOptimized(true);
      showToast(`✅ Found ${sliced.dream.length + sliced.target.length + sliced.safe.length} colleges`);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      showToast(err.message || "Optimization failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyList = (list, name) => {
    if (!list.length) return;
    const text = list.map((c, i) => `${i + 1}. ${c.institute} (${c.program}) — Predicted: ${c.predicted_close}`).join("\n");
    navigator.clipboard.writeText(text);
    showToast(`📋 ${name} list copied`);
  };

  // ───────────────────────────────────────────────────────────────────────
  // exportPdf — ONE combined, branded PDF for Dream + Target + Safe
  // together (college names included), replacing the old per-bucket .txt
  // downloads. Requires: npm i jspdf jspdf-autotable
  // ───────────────────────────────────────────────────────────────────────
  const [pdfBusy, setPdfBusy] = useState(false);
  const exportPdf = async () => {
    const all = [
      ...results.dream.map(c => ({ ...c, _bucket: 'Dream' })),
      ...results.target.map(c => ({ ...c, _bucket: 'Target' })),
      ...results.safe.map(c => ({ ...c, _bucket: 'Safe' })),
    ];
    if (!all.length || pdfBusy) return;
    setPdfBusy(true);
    try {
      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const autoTable = autoTableMod.default || autoTableMod;

      const doc   = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const BRAND = [26, 60, 110];   // #1A3C6E
      const MUTED = [120, 130, 145];
      const BUCKET_TINT = {
        Dream:  [255, 247, 230],
        Target: [232, 244, 255],
        Safe:   [232, 250, 240],
      };
      const genDate = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

      const head = [[
        '#', 'Bucket', 'Institute', 'Program', 'Quota',
        'Predicted Rank', 'Confidence', 'Trend',
      ]];
      const body = all.map((c, i) => [
        String(i + 1),
        c._bucket,
        c.institute || '—',
        c.program || '—',
        c.quota || '—',
        c.predicted_close != null ? Number(c.predicted_close).toLocaleString('en-IN') : '—',
        c.confidence != null ? `${c.confidence}%` : '—',
        c.trend || '—',
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
        columnStyles: {
          0: { cellWidth: 8,  halign: 'center' },
          1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 80 },
          3: { cellWidth: 40 },
          4: { cellWidth: 30 },
          5: { cellWidth: 28, halign: 'right' },
          6: { cellWidth: 24, halign: 'center' },
          7: { cellWidth: 22, halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const tint = BUCKET_TINT[all[data.row.index]?._bucket];
            if (tint) data.cell.styles.fillColor = tint;
          }
        },
        didDrawPage: () => {
          // ── watermark ───────────────────────────────────────────────
          doc.saveGraphicsState();
          doc.setGState(new doc.GState({ opacity: 0.07 }));
          doc.setTextColor(...BRAND);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(64);
          doc.text('RankSetu', pageW / 2, pageH / 2, { align: 'center', angle: 35 });
          doc.restoreGraphicsState();

          // ── header band ─────────────────────────────────────────────
          doc.setFillColor(...BRAND);
          doc.rect(0, 0, pageW, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.text('RankSetu', 10, 11);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.text('SMG  •  AI College Optimizer  •  Founder: Umashankar', 10, 16.5);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`NEET Rank: ${rank.toLocaleString('en-IN')}`, pageW - 10, 11, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.text(`Generated: ${genDate}`, pageW - 10, 16.5, { align: 'right' });

          // ── footer band ───────────────────────────────────────────────
          doc.setDrawColor(...MUTED);
          doc.setLineWidth(0.1);
          doc.line(10, pageH - 13, pageW - 10, pageH - 13);
          doc.setFontSize(7.5);
          doc.setTextColor(...MUTED);
          doc.setFont('helvetica', 'bold');
          doc.text('RankSetu • SMG', 10, pageH - 8);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `Dream: ${results.dream.length}   Target: ${results.target.length}   Safe: ${results.safe.length}  — AI prediction based on past round-wise cutoffs; verify official seat matrix.`,
            pageW / 2, pageH - 8, { align: 'center' },
          );
          doc.setFont('helvetica', 'italic');
          doc.text('Made by Umashankar', pageW - 10, pageH - 3.5, { align: 'right' });
        },
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text(`Page ${p} of ${totalPages}`, pageW - 10, pageH - 8, { align: 'right' });
      }

      doc.save(`RankSetu_Optimizer_Rank_${userRank || 'NA'}.pdf`);
      showToast('📥 PDF downloaded');
    } catch (e) {
      console.error('[exportPdf]', e);
      showToast('Could not generate the PDF — please try again');
    } finally {
      setPdfBusy(false);
    }
  };

  const handleShareCardClick = () => {
    if (!hasOptimized) { showToast("Generate your list first."); return; }
    const rank = parseInt(userRank, 10);
    if (!rank || rank <= 0) { showToast("Invalid rank."); return; }
    onShareCard?.({
      rank,
      category: selectedCategory,
      dreamCount: results.dream.length,
      targetCount: results.target.length,
      safeCount: results.safe.length,
      topDream: results.dream.slice(0, 3).map(c => c.institute),
      topTarget: results.target.slice(0, 3).map(c => c.institute),
      topSafe: results.safe.slice(0, 3).map(c => c.institute),
    });
  };

  const rank = parseInt(userRank, 10) || 0;

  return (
    <div className="space-y-5">
      {/* Form Card */}
      <div className={`rounded border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded flex items-center justify-center bg-primary/10`}>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-primary'}`}>AI College Optimizer</h2>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>5-year trend · Rank-proximity sorting</p>
            </div>
          </div>

          <form onSubmit={handleOptimize}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
              <SelectField label="Counselling Type *" icon={Layers} value={ctName} onChange={handleCtChange}
                options={counselingTypes} darkMode={darkMode}
                placeholder={ldCt ? "Loading…" : "Select Counselling Type"} />
              <SelectField label="State" icon={MapPin} value={stateName} onChange={handleStateChange}
                options={states} darkMode={darkMode}
                placeholder={ldState ? "Loading…" : "All States"} />
              <SelectField label="Authority" icon={Building2} value={authName} onChange={handleAuthChange}
                options={authorities} darkMode={darkMode}
                placeholder={ldAuth ? "Loading…" : "All Authorities"} />
              {instituteTypes.length > 0 && (
                <SelectField label="Institute Type" icon={Award} value={instTypeName} onChange={handleInstTypeChange}
                  options={instituteTypes} darkMode={darkMode}
                  placeholder={ldIType ? "Loading…" : "All Institute Types"} />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-1">
                <label className={`text-sm font-bold uppercase tracking-wide block mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Activity className="w-3 h-3 inline mr-1" /> NEET Rank
                </label>
                <input type="number" value={userRank} onChange={e => setUserRank(e.target.value)}
                  placeholder="e.g. 24500" required
                  className={`w-full text-sm px-3 py-2.5 rounded border focus:outline-none focus:border-primary
                    ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`} />
              </div>

              <SelectField label="Category *" icon={Target} value={selectedCategory} onChange={setSelectedCategory}
                options={categories} darkMode={darkMode}
                placeholder={ldRest ? "Loading…" : "Select Category"} />
              <SelectField label="Quota" icon={Shield} value={selectedQuota} onChange={setSelectedQuota}
                options={quotas} darkMode={darkMode} placeholder="All Quotas" />
              <SelectField label="Course" icon={BarChart3} value={selectedCourse} onChange={setSelectedCourse}
                options={courses} darkMode={darkMode}
                placeholder={ldRest ? "Loading…" : "All Courses"} />

              <div>
                <label className={`text-sm font-bold uppercase tracking-wide block mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Filter className="w-3 h-3 inline mr-1" /> Show
                </label>
                <select value={topN} onChange={e => setTopN(Number(e.target.value))}
                  className={`w-full text-sm px-3 py-2.5 rounded border focus:outline-none focus:border-primary
                    ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>
                  {TOP_N_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading}
                className="h-[42px] px-4 rounded bg-primary hover:bg-interactive text-white text-xs font-bold uppercase tracking-wide transition disabled:opacity-50">
                {loading ? <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full mr-1" /> : <Sparkles className="w-3 h-3 inline mr-1" />}
                Predict
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Stats */}
      {hasOptimized && stats && (
        <div className={`grid grid-cols-4 gap-3 rounded border p-3 ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
          {[
            { label: "Analyzed", value: stats.total_analyzed, icon: BarChart3 },
            { label: "Dream", value: results.dream.length, icon: Star },
            { label: "Target", value: results.target.length, icon: Target },
            { label: "Safe", value: results.safe.length, icon: Shield },
          ].map(s => (
            <div key={s.label} className="text-center">
              <s.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <div className={`text-xl font-bold text-primary`}>{s.value}</div>
              <div className={`text-xs uppercase font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {hasOptimized && (
        <div ref={resultsRef} className="space-y-4">
          <div className={`flex items-center justify-between gap-2 px-4 py-2 rounded border text-sm flex-wrap
            ${darkMode ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}`}>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Colleges sorted by closeness to rank {rank.toLocaleString()}
            </div>
            <button onClick={exportPdf} disabled={pdfBusy}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-interactive text-white text-xs font-bold uppercase tracking-wide transition disabled:opacity-50">
              {pdfBusy
                ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> Preparing PDF…</>
                : <><Download className="w-3.5 h-3.5" /> Download PDF</>}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <BucketPanel
              title="Dream Colleges"
              icon={Star}
              items={results.dream}
              darkMode={darkMode}
              onCopy={() => copyList(results.dream, "Dream")}
              onAddToLab={onAddToLab}
              emptyLabel="No dream colleges"
              userRank={rank}
            />
            <BucketPanel
              title="Target Colleges"
              icon={Target}
              items={results.target}
              darkMode={darkMode}
              onCopy={() => copyList(results.target, "Target")}
              onAddToLab={onAddToLab}
              emptyLabel="No target colleges"
              userRank={rank}
            />
            <BucketPanel
              title="Safe Colleges"
              icon={Shield}
              items={results.safe}
              darkMode={darkMode}
              onCopy={() => copyList(results.safe, "Safe")}
              onAddToLab={onAddToLab}
              emptyLabel="No safe colleges"
              userRank={rank}
            />
          </div>

          <div className="flex justify-center pt-4">
            <button onClick={handleShareCardClick}
              className="px-6 py-3 rounded bg-primary hover:bg-interactive text-white text-sm font-semibold transition flex items-center gap-2">
              <span>🎨</span> Generate Share Card <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className={`flex flex-wrap justify-center gap-4 text-sm pt-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Rising</span>
            <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Falling</span>
            <span className="flex items-center gap-1"><Minus className="w-3 h-3" /> Stable</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> AI Predicted Rank</span>
          </div>
        </div>
      )}

      {/* PERMANENT INFO NOTE - Always visible */}
      <div className={`mt-6 p-4 rounded border text-sm ${
        darkMode 
          ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' 
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}>
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">ℹ️ Important Notes:</p>
            <ul className="space-y-1 text-xs md:text-sm list-disc list-inside">
              <li>This prediction is based <strong>100% on previous years' round-wise cutoff data</strong>. Actual ranks may vary.</li>
              <li>When you select <strong>"DEEMED/paid seat Quota"</strong>, the Category will be automatically set to <strong>"Open"</strong> because admissions to Deemed universities are only under the Open category.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}