



'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Brain, TrendingUp, TrendingDown, Minus, ArrowUpCircle,
  Shield, Loader2, Sparkles, AlertTriangle, CheckCircle,
  ChevronDown, Search, Activity, Target, Filter,
} from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_PYTHON_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || json.message || `API error ${res.status}`);
  return json;
}

const ROUND_OPTIONS = ["Round 1", "Round 2"];

const ZONE_COLORS = {
  Promising: { stroke: "#1A3C6E", text: "text-primary", bg: "bg-primary/10 border-primary/30" },
  Uncertain: { stroke: "#1A3C6E", text: "text-primary", bg: "bg-primary/10 border-primary/30" },
  Risky:     { stroke: "#1A3C6E", text: "text-primary", bg: "bg-primary/10 border-primary/30" },
};

const RISK_META = {
  Low:    { color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: CheckCircle,
            text: "Your rank is well within this college's cutoff buffer — the seat is likely to remain filled even if you exit." },
  Medium: { color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: AlertTriangle,
            text: "Your rank is moderately close to the closing cutoff — some risk exists if demand shifts in the next round." },
  High:   { color: "text-primary", bg: "bg-primary/10 border-primary/30", icon: AlertTriangle,
            text: "You are near the closing rank — exiting carries significant risk of losing this allotment entirely." },
};

const Disclaimer = ({ darkMode }) => (
  <div className={`rounded border border-dashed p-3 flex items-start gap-2 text-xs
    ${darkMode ? 'border-primary/30 bg-primary/5' : 'border-primary/30 bg-primary/5'}`}>
    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
    <div>
      <p className="text-sm font-bold uppercase tracking-wide mb-0.5 text-primary">⚠ Beta — Testing Phase</p>
      <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        This tool is currently in <strong>testing phase</strong>. Predictions are based on historical cutoff patterns.
        Please use as a reference only. Always cross-check with official MCC/state data.
      </p>
    </div>
  </div>
);

const TrendIcon = ({ trend }) => {
  if (trend === "Rising")  return <TrendingUp   className="w-4 h-4 text-primary" />;
  if (trend === "Falling") return <TrendingDown  className="w-4 h-4 text-primary" />;
  return <Minus className="w-4 h-4 text-primary" />;
};

const confColor = (v) => "text-slate-700 dark:text-slate-300";

const ProbabilityGauge = ({ value, zone, years, darkMode }) => {
  const colors = ZONE_COLORS[zone] || ZONE_COLORS.Uncertain;
  const data = [{ name: "prob", value: Math.min(100, Math.max(0, value)), fill: colors.stroke }];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" barSize={14} data={data} startAngle={210} endAngle={-30}>
            <PolarAngleAxis type="number" domain={[0,100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: darkMode ? "#1e293b" : "#e2e8f0" }} dataKey="value" cornerRadius={8} animationDuration={900} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-4xl font-bold font-mono ${colors.text}`}>{value}%</span>
          <span className={`text-sm font-semibold uppercase tracking-wide ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Upgrade Chance</span>
        </div>
      </div>
      <span className={`mt-2 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full border ${colors.bg} ${colors.text}`}>{zone}</span>
      <span className={`text-sm mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Based on {years} year{years !== 1 ? "s" : ""} of data</span>
    </div>
  );
};

const SearchableSelect = ({ label, value, onChange, options, darkMode, placeholder, loading }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.toLowerCase().includes(q));
  }, [options, query]);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <label className={`text-sm font-bold uppercase tracking-wide block mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        <Search className="w-3 h-3" /> {label}
      </label>
      <button type="button" onClick={() => setOpen(v => !v)}
        className={`w-full text-left text-xs font-semibold pl-3 pr-8 py-2.5 border rounded transition
          ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-200 hover:border-primary' : 'bg-white border-slate-300 text-slate-800 hover:border-primary'}
          ${!value ? (darkMode ? 'text-slate-500' : 'text-slate-500') : ""}`}>
        <span className="line-clamp-1 font-medium">{value || placeholder}</span>
        <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`} />
      </button>
      {open && (
        <div className={`absolute z-20 mt-1 w-full rounded border shadow-md overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
          <div className={`p-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
            <input autoFocus type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search college…"
              className={`w-full text-xs px-2 py-1.5 rounded border outline-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`} />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {loading ? <li className="px-3 py-2 text-xs text-center">Loading colleges…</li>
            : filtered.length === 0 ? <li className="px-3 py-2 text-xs text-center">No colleges found</li>
            : filtered.map(inst => (
                <li key={inst}>
                  <button type="button" onClick={() => { onChange(inst); setOpen(false); setQuery(""); }}
                    className={`w-full text-left text-sm font-semibold px-3 py-2.5 hover:bg-primary/10 transition-colors
                      ${inst === value ? 'bg-primary/15 text-primary font-bold' : 'text-slate-800 dark:text-slate-200'}`}>
                    {inst}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, darkMode, placeholder, hint, icon: Icon }) => (
  <div>
    <label className={`text-sm font-bold uppercase tracking-wide block mb-1 flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
      {Icon && <Icon className="w-3 h-3" />} {label}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className={`w-full text-sm font-semibold px-3 py-2.5 border rounded focus:outline-none focus:border-primary
        ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}>
      {placeholder && <option value="ALL">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
  </div>
);

const ShiftBar = ({ avg, min, max, darkMode }) => {
  const span = Math.max(max - min, 1);
  const avgPct = ((avg - min) / span) * 100;
  const isRelaxing = avg > 0;
  
  return (
    <div className="relative">
      <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: darkMode ? "#334155" : "#e2e8f0" }}>
        <div 
          className="absolute top-0 bottom-0 rounded-full transition-all"
          style={{ 
            width: `${avgPct}%`, 
            background: isRelaxing 
              ? "linear-gradient(90deg, #1A3C6E, #2563EB)" 
              : "linear-gradient(90deg, #F0A500, #D97706)",
            left: 0
          }} 
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          ↓ {Math.abs(min).toLocaleString()}
        </span>
        <div className="relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${isRelaxing ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'}`}>
              {avg > 0 ? `+${avg.toLocaleString()}` : avg.toLocaleString()}
            </span>
          </div>
        </div>
        <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          ↑ {Math.abs(max).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const BetterCollegeCard = ({ college, darkMode, idx }) => (
  <div className={`rounded-lg border p-4 transition-all hover:border-primary ${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-slate-200'}`}>
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-primary/30 text-primary' : 'bg-primary/15 text-primary'}`}>
        {idx + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold leading-tight mb-1.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{college.institute}</div>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={`text-sm font-bold font-mono text-primary`}>~{college.predicted_r2_cutoff?.toLocaleString()}</span>
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
            {college.confidence}% conf.
          </span>
          <div className="flex items-center gap-1">
            <TrendIcon trend={college.trend} />
            <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{college.trend}</span>
          </div>
          {college.low_data_warning && <span className="text-xs px-1.5 py-0.5 rounded bg-accent/15 text-accent font-medium">Limited data</span>}
        </div>
      </div>
    </div>
  </div>
);

export default function UpgradeProbability({ darkMode, showToast }) {
  const [userRank, setUserRank] = useState("");
  const [categories, setCategories] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [quota, setQuota] = useState("ALL");
  const [currentRound, setCurrentRound] = useState("Round 1");
  const [institute, setInstitute] = useState("");
  const [institutes, setInstitutes] = useState([]);
  const [instLoading, setInstLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setInstLoading(true);
      try {
        const [filterData, instData] = await Promise.all([
          apiFetch("/api/filters"),
          apiFetch("/api/upgrade-institutes"),
        ]);
        if (cancelled) return;
        const f = filterData.filters || filterData;
        setCategories(f.categories || []);
        setQuotas(f.quotas || []);
        const list = instData.data?.institutes || instData.institutes || [];
        setInstitutes(list);
        if (list.length === 0) showToast?.("No institutes found.");
      } catch (err) {
        if (!cancelled) showToast?.(err.message || "Could not load data.");
        setInstitutes([]);
      } finally {
        if (!cancelled) setInstLoading(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rank = parseInt(userRank, 10);
    if (!rank || rank <= 0) return showToast?.("Enter valid NEET AIR rank");
    if (!institute) return showToast?.("Select your currently allotted college");
    setLoading(true);
    setResult(null);
    try {
      const data = await apiFetch("/api/upgrade-check", {
        method: "POST",
        body: JSON.stringify({ user_rank: rank, current_institute: institute, category, quota, current_round: currentRound }),
      });
      if (!data.success) {
        showToast?.(data.message || "Insufficient data.");
        setHasChecked(false);
        return;
      }
      setResult(data);
      setHasChecked(true);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      showToast?.(err.message || "Upgrade check failed.");
    } finally {
      setLoading(false);
    }
  };

  const ra = result?.round_analysis;

  return (
    <div className="space-y-5">
      {/* Form Card */}
      <div className={`rounded border shadow-sm ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
              <ArrowUpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-primary'}`}>Upgrade Probability Checker</h2>
              <p className="text-xs text-slate-500">Round-wise shift · Seat risk · Better college finder</p>
            </div>
          </div>

          <div className={`rounded border p-3 ${darkMode ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">What does this tool do?</p>
            <p className="text-sm mb-2 text-slate-600 dark:text-slate-300">
              If you have been allotted a seat in Round 1/2 and are deciding to freeze or upgrade – this tool shows
              upgrade chance, seat risk, and better colleges.
            </p>
            <div className={`rounded border px-3 py-2 text-xs ${darkMode ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
              <p className="font-bold text-primary">Understanding "Current Round":</p>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600 dark:text-slate-300">
                <li>Check Round 2 upgrade → You are in Round 1 → Select <strong>Round 1</strong></li>
                <li>Check Round 3 upgrade → You are in Round 2 → Select <strong>Round 2</strong></li>
              </ul>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
              {[
                "Enter your NEET AIR rank",
                "Select your currently allotted college",
                "Set Category & Quota, and your current round",
                'Click "Check Upgrade Chances"',
              ].map((text, i) => (
                <li key={i} className={`flex gap-2 px-2 py-1.5 rounded border ${darkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold bg-primary/10 text-primary`}>{i+1}</span>
                  <span className="text-slate-600 dark:text-slate-300">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-bold uppercase tracking-wide block mb-1 flex items-center gap-1 text-slate-500">
                  <Activity className="w-3 h-3" /> NEET AIR Rank
                </label>
                <input type="number" value={userRank} onChange={e => setUserRank(e.target.value)} placeholder="e.g. 2550" required
                  className={`w-full text-sm px-3 py-2 border rounded focus:outline-none focus:border-primary
                    ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-800'}`} />
              </div>
              <div className="relative z-10">
                <SearchableSelect label="Currently Allotted College" value={institute} onChange={setInstitute}
                  options={institutes} darkMode={darkMode} placeholder={instLoading ? "Loading…" : "Select college"} loading={instLoading} />
              </div>
              <SelectField label="Category" icon={Target} value={category} onChange={setCategory}
                options={categories} darkMode={darkMode} placeholder="All Categories" />
              <SelectField label="Quota" icon={Shield} value={quota} onChange={setQuota}
                options={quotas} darkMode={darkMode} placeholder="All Quotas" />
              <SelectField label="Current Round" icon={Filter} value={currentRound} onChange={setCurrentRound}
                options={ROUND_OPTIONS} darkMode={darkMode} placeholder="Select round"
                hint="Round 1 → check R2 upgrade; Round 2 → check R3 upgrade" />
              <button type="submit" disabled={loading}
                className="h-10 px-4 rounded bg-primary hover:bg-interactive text-white text-xs font-bold uppercase tracking-wide transition disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : <Sparkles className="w-3.5 h-3.5 inline mr-1" />}
                Check Upgrade Chances
              </button>
            </div>
          </form>

          <Disclaimer darkMode={darkMode} />
        </div>
      </div>

      {/* Empty state */}
      {!hasChecked && !loading && (
        <div className={`rounded border p-8 text-center ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
          <ArrowUpCircle className={`w-10 h-10 mx-auto mb-2 text-primary`} />
          <h3 className="font-bold text-base mb-1 text-primary">What will you see?</h3>
          <p className="text-sm text-slate-500">Upgrade % · Seat Risk · Better Colleges · Recommendation</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={`rounded border p-12 flex flex-col items-center gap-3 ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Analyzing patterns...</p>
        </div>
      )}

      {/* Results */}
      {hasChecked && result && !loading && (
        <div ref={resultsRef} className="space-y-4">
          {/* Gauge + rank */}
          <div className={`rounded border p-5 flex flex-col sm:flex-row items-center justify-center gap-6 ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
            <ProbabilityGauge value={result.upgrade_probability} zone={result.upgrade_zone} years={ra?.years_analyzed ?? 0} darkMode={darkMode} />
            <div className="text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your Rank</p>
              <p className="text-2xl font-bold text-primary">{result.user_rank?.toLocaleString()}</p>
              <p className="text-sm mt-2 font-medium text-slate-700 dark:text-slate-200">{result.current_college}</p>
              <p className="text-sm text-slate-500">{result.category} · {result.quota}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Round shift analysis */}
            {ra && (
              <div className={`rounded border p-4 ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
                <h3 className="font-bold text-sm mb-1 text-primary">How does cutoff shift?</h3>
                <p className="text-sm mb-3 text-slate-500">{ra.from_round} → {ra.to_round} across {ra.years_analyzed} years</p>
                <ShiftBar avg={ra.avg_shift_r1_to_r2} min={ra.min_shift} max={ra.max_shift} darkMode={darkMode} />
                <p className="mt-8 text-sm text-slate-600 dark:text-slate-300">
                  Historically cutoff <span className={ra.trend === "Relaxes" ? "text-primary font-bold" : "text-accent font-bold"}>{ra.trend === "Relaxes" ? "RELAXES" : "TIGHTENS"}</span>
                  {" by avg "}<span className="font-mono font-bold text-primary">{Math.abs(ra.avg_shift_r1_to_r2).toLocaleString()}</span> ranks in {ra.to_round}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-bold uppercase px-2 py-0.5 rounded-full border ${ra.trend === "Relaxes" ? 'border-primary/30 bg-primary/10 text-primary' : 'border-accent/30 bg-accent/10 text-accent'}`}>
                    {ra.trend === "Relaxes" ? "Relaxes ↓" : "Tightens ↑"}
                  </span>
                  <span className={`text-sm font-mono text-slate-500`}>
                    Predicted {ra.to_round}: {ra.predicted_r2_cutoff?.toLocaleString()}
                  </span>
                </div>
                {ra.year_wise?.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr><th className="px-2 py-1.5 text-left text-slate-600 font-semibold">Year</th>
                        <th className="px-2 py-1.5 text-right text-slate-600 font-semibold">{ra.from_round}</th>
                        <th className="px-2 py-1.5 text-right text-slate-600 font-semibold">{ra.to_round}</th>
                        <th className="px-2 py-1.5 text-right text-slate-600 font-semibold">Shift</th>
                      </tr>
                      </thead>
                      <tbody>
                        {ra.year_wise.map(row => (
                          <tr key={row.year} className="border-t dark:border-slate-700">
                            <td className="px-2 py-1.5 font-mono text-slate-700 dark:text-slate-300">{row.year}</td>
                            <td className="px-2 py-1.5 text-right text-slate-700 dark:text-slate-300">{row.from_close?.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right text-slate-700 dark:text-slate-300">{row.to_close?.toLocaleString()}</td>
                            <td className={`px-2 py-1.5 text-right font-mono font-semibold ${row.shift > 0 ? "text-primary" : row.shift < 0 ? "text-accent" : "text-slate-500"}`}>
                              {row.shift > 0 ? "+" : ""}{row.shift?.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Risk of losing seat */}
            {(() => {
              const meta = RISK_META[result.risk_of_losing_seat] || RISK_META.Medium;
              const RiskIcon = meta.icon;
              return (
                <div className={`rounded border p-4 ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <h3 className="font-bold text-sm text-primary">Risk of losing your current seat</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-full border ${meta.bg} ${meta.color}`}>
                    <RiskIcon className="w-3 h-3" /> {result.risk_of_losing_seat} Risk
                  </span>
                  <p className="text-xs mt-3 leading-relaxed text-slate-600 dark:text-slate-300">{meta.text}</p>
                </div>
              );
            })()}
          </div>

          {/* Better colleges */}
          <div className={`rounded border p-4 ${darkMode ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white'}`}>
            <h3 className="font-bold text-base mb-1 text-primary">Colleges you may get in {ra?.to_round || "Round 2"}</h3>
            <p className="text-sm mb-3 text-slate-500">Government, deemed, and private colleges with historically tighter cutoffs</p>
            {result.better_colleges?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.better_colleges.map((c, i) => <BetterCollegeCard key={c.institute} college={c} darkMode={darkMode} idx={i} />)}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertTriangle className="w-6 h-6 mx-auto mb-1 opacity-50 text-slate-500" />
                <p className="text-xs text-slate-500">No better colleges found. Try different Category/Quota.</p>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className={`rounded border p-4 flex items-start gap-3 ${darkMode ? 'border-primary/30 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
            <Brain className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Recommendation</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{result.recommendation}</p>
            </div>
          </div>

          <Disclaimer darkMode={darkMode} />
        </div>
      )}
    </div>
  );
}