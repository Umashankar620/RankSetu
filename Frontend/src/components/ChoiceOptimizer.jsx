

'use client';

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, AlertTriangle, CheckCircle, Copy, Download,
  TrendingUp, TrendingDown, Minus, ChevronDown, Filter,
  BarChart3, Zap, Star, Shield, Target, Activity, Info,
  ArrowUpRight, Clock, Flame, Award
} from "lucide-react";
import { fetchOptimizerFilters, optimizeChoices } from "@/utils/api";

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

const BucketPanel = ({ title, icon, items, darkMode, onCopy, onDownload, emptyLabel, userRank, onAddToLab }) => {
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
          <button onClick={onDownload} disabled={!items.length}
            className={`p-1.5 rounded transition disabled:opacity-40
              ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Download className="w-3.5 h-3.5" />
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
  const [categories, setCategories] = useState([]);
  const [quotas, setQuotas] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedQuota, setSelectedQuota] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ dream: [], target: [], safe: [] });
  const [hasOptimized, setHasOptimized] = useState(false);
  const [stats, setStats] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    fetchOptimizerFilters()
      .then(filters => {
        setCategories(filters.categories || []);
        setQuotas(filters.quotas || []);
        setCourses(filters.courses || []);
      })
      .catch(() => showToast("Failed to load filter options."));
  }, []);

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
    if (!selectedCategory || selectedCategory === "ALL") {
      showToast("Please select a Category to proceed.");
      return;
    }

    setLoading(true);
    try {
      const data = await optimizeChoices({
        user_rank: rank,
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

  const downloadList = (list, name) => {
    if (!list.length) return;
    const header = "Rank\tInstitute\tProgram\tQuota\tPredicted Rank\tConfidence\tTrend";
    const rows = list.map((c, i) => `${i+1}\t${c.institute}\t${c.program}\t${c.quota}\t${c.predicted_close}\t${c.confidence}%\t${c.trend}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `NEET_${name}_Rank_${userRank}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`📥 ${name} list downloaded`);
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
                options={categories} darkMode={darkMode} placeholder="Select Category" />
              <SelectField label="Quota" icon={Shield} value={selectedQuota} onChange={setSelectedQuota}
                options={quotas} darkMode={darkMode} placeholder="All Quotas" />
              <SelectField label="Course" icon={BarChart3} value={selectedCourse} onChange={setSelectedCourse}
                options={courses} darkMode={darkMode} placeholder="All Courses" />

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
          <div className={`flex items-center gap-2 px-4 py-2 rounded border text-sm
            ${darkMode ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}`}>
            <Flame className="w-4 h-4" />
            Colleges sorted by closeness to rank {rank.toLocaleString()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <BucketPanel
              title="Dream Colleges"
              icon={Star}
              items={results.dream}
              darkMode={darkMode}
              onCopy={() => copyList(results.dream, "Dream")}
              onDownload={() => downloadList(results.dream, "Dream")}
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
              onDownload={() => downloadList(results.target, "Target")}
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
              onDownload={() => downloadList(results.safe, "Safe")}
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