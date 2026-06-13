'use client';

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { X, TrendingUp, TrendingDown, Minus, Loader2, AlertCircle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { fetchInstituteTrends } from "@/utils/api";

// ── Category Buttons ke liye Colors (Iska graph se ab koi lena-dena nahi hai) ──
const CAT_COLORS = {
  UR:  { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/40"   },
  OBC: { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/40" },
  SC:  { bg: "bg-purple-500/15",  text: "text-purple-400",  border: "border-purple-500/40" },
  ST:  { bg: "bg-pink-500/15",    text: "text-pink-400",    border: "border-pink-500/40"   },
  EWS: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40"},
};
const DEFAULT_COLOR = { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/40" };
const getCatColor = (cat) => CAT_COLORS[cat?.toUpperCase()] || DEFAULT_COLOR;

// ── HAR ROUND KA STRICT UNIQUE COLOR (GRAPH KE LIYE)  ──
const ROUND_COLORS = [
  "#3b82f6", // Round 1: Vivid Blue
  "#ef4444", // Round 2: Bright Red
  "#10b981", // Round 3: Emerald Green
  "#f59e0b", // Round 4: Golden Amber
  "#a855f7", // Round 5: Vibrant Purple
  "#ec4899", // Round 6: Hot Pink
  "#06b6d4", // Round 7: Bright Cyan
  "#84cc16", // Round 8: Lime Green
];

// ── Custom Tooltip ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl px-4 py-3 border shadow-2xl text-xs font-bold transition-all
      ${darkMode ? "bg-[#0d1525] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
      <p className="text-slate-400 mb-2 font-black tracking-wider uppercase text-[11px]">Year {label}</p>
      {[...payload]
        .sort((a, b) => a.value - b.value)
        .map((p) => (
          <div key={p.name} className="flex items-center gap-2.5 mb-1.5">
            {/* Dot ka color strict Recharts payload se aayega */}
            <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: p.color }} />
            <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{p.name}:</span>
            <span style={{ color: p.color }} className="text-sm">{Number(p.value).toLocaleString("en-IN")}</span>
          </div>
        ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
export default function TrendModal({ isOpen, onClose, instituteName, darkMode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [activeCategory, setActiveCategory]           = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [chartData, setChartData]                     = useState([]);
  const [tableRecords, setTableRecords]               = useState([]);

  const fetchTrends = useCallback(async (categoryToFetch = null) => {
    if (!instituteName) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetchInstituteTrends(instituteName, categoryToFetch);
      
      if (res.data.success) {
        const { categories, chartData: newChartData, tableRecords: newTableRecords } = res.data.data;
        
        setAvailableCategories(categories || []);
        setChartData(newChartData || []);
        setTableRecords(newTableRecords || []);

        if (!categoryToFetch && categories?.length > 0) {
          setActiveCategory(categories[0]);
        }
      } else {
        setError(res.data.message || "Failed to load trend data.");
      }
    } catch (e) {
      setError("Server error while fetching trends.");
    } finally {
      setLoading(false);
    }
  }, [instituteName]);

  useEffect(() => {
    if (isOpen) {
      fetchTrends();
    }
  }, [isOpen, fetchTrends]);

  const handleCategoryClick = (cat) => {
    if (cat === activeCategory) return;
    setActiveCategory(cat);
    fetchTrends(cat);
  };

  const activeRounds = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    const keys = new Set();
    chartData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "year") keys.add(key);
      });
    });
    return Array.from(keys).sort();
  }, [chartData]);

  const trendStatus = useMemo(() => {
    if (chartData.length < 2) return { text: "Insufficient Data", icon: <Minus className="h-3.5 w-3.5" />, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    
    const firstYearRanks = activeRounds.map(r => chartData[0][r]).filter(Boolean);
    const first = firstYearRanks.length ? Math.min(...firstYearRanks) : null;

    const lastYearRanks = activeRounds.map(r => chartData[chartData.length - 1][r]).filter(Boolean);
    const last = lastYearRanks.length ? Math.min(...lastYearRanks) : null;
    
    if (!first || !last) return { text: "Insufficient Data", icon: <Minus className="h-3.5 w-3.5" />, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };

    if (last < first) return { text: "Demand Rising", icon: <TrendingUp className="h-3.5 w-3.5" />, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    if (last > first) return { text: "Demand Easing", icon: <TrendingDown className="h-3.5 w-3.5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    return { text: "Stable", icon: <Minus className="h-3.5 w-3.5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
  }, [chartData, activeRounds]);

  const catColor = getCatColor(activeCategory);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md"
      style={{ animation: "fadeIn 0.2s ease" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full max-w-5xl rounded-[1.75rem] border shadow-2xl flex flex-col overflow-hidden transition-colors duration-300
          ${darkMode
            ? "bg-[#080e1a] border-slate-800/80 text-white shadow-black/80"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/60"
          }`}
        style={{ maxHeight: "95vh", animation: "slideUp 0.25s cubic-bezier(.16,1,.3,1)" }}
      >

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className={`flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b flex-shrink-0
          ${darkMode ? "border-slate-800/60" : "border-slate-100"}`}>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${trendStatus.color}`}>
                {trendStatus.icon}
                {trendStatus.text}
              </span>
              {activeCategory && (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${catColor.bg} ${catColor.text} ${catColor.border}`}>
                  {activeCategory}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-xl font-black tracking-tight leading-snug line-clamp-2">
              {instituteName}
            </h3>
            <p className={`text-xs mt-1 font-semibold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Year-wise Closing Rank Trend (Round by Round)
            </p>
          </div>
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-2.5 rounded-xl border transition-all cursor-pointer mt-0.5
              ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-black"}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── SCROLLABLE BODY ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className={`h-10 w-10 animate-spin ${darkMode ? "text-blue-400" : "text-blue-500"}`} />
              <p className={`text-sm font-bold ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                Analyzing historical trends…
              </p>
            </div>
          )}

          {!loading && error && (
            <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-bold
              ${darkMode ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-rose-50 border-rose-200 text-rose-600"}`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* ── CATEGORY PILLS ─────────────────────────── */}
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {availableCategories.map((cat) => {
                    const cc     = getCatColor(cat);
                    const active = cat === activeCategory;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleCategoryClick(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all duration-200 cursor-pointer
                          ${active
                            ? `${cc.bg} ${cc.text} ${cc.border} shadow-md scale-105`
                            : darkMode
                              ? "bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                              : "bg-slate-100 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                          }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── GRAPH ──────────────────────────────────── */}
              {chartData.length > 1 ? (
                <div className={`rounded-3xl border p-5 shadow-inner ${darkMode ? "bg-slate-950/50 border-slate-800/60" : "bg-slate-50 border-slate-200/80"}`}
                  style={{ height: 420, minHeight: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 15, right: 25, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke={darkMode ? "#1e2d45" : "#cbd5e1"} vertical={false} />
                      <XAxis
                        dataKey="year"
                        stroke={darkMode ? "#475569" : "#94a3b8"}
                        fontSize={12} fontWeight="800" tick={{ fill: darkMode ? "#64748b" : "#64748b" }}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke={darkMode ? "#475569" : "#94a3b8"}
                        fontSize={12} fontWeight="800" tick={{ fill: darkMode ? "#64748b" : "#64748b" }}
                        width={65}
                        tickMargin={10}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                      />
                      <Tooltip content={<CustomTooltip darkMode={darkMode} />} cursor={{ stroke: darkMode ? "#334155" : "#e2e8f0", strokeWidth: 2, strokeDasharray: "4 4" }} />
                      <Legend
                        wrapperStyle={{ fontSize: "13px", fontWeight: "800", paddingTop: "20px" }}
                        iconType="circle"
                      />
                      
                      {/* 🔥 STRICTLY MAPPED UNIQUE COLORS (No category color here) 🔥 */}
                      {activeRounds.map((roundName, index) => {
                        const preciseColor = ROUND_COLORS[index % ROUND_COLORS.length];

                        return (
                          <Line
                            key={roundName}
                            name={roundName}
                            type="monotone"
                            dataKey={roundName}
                            stroke={preciseColor}         // Curve color
                            strokeWidth={3.5}
                            dot={{ 
                              r: 5.5, 
                              fill: preciseColor,         // Normal Dot color
                              strokeWidth: 2.5, 
                              stroke: darkMode ? "#0f172a" : "#fff" 
                            }}
                            activeDot={{ 
                              r: 9, 
                              strokeWidth: 0, 
                              fill: preciseColor          // Hover Dot color
                            }} 
                            connectNulls
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : chartData.length === 1 ? (
                <div className={`rounded-3xl border px-6 py-12 text-center ${darkMode ? "bg-slate-950/50 border-slate-800/50 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  <p className="text-sm font-bold">Only 1 year of data for <span className="font-black">{activeCategory}</span> — need 2+ years to plot a proper curve.</p>
                </div>
              ) : (
                <div className={`rounded-3xl border px-6 py-12 text-center ${darkMode ? "bg-slate-950/50 border-slate-800/50 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  <p className="text-sm font-bold">No data found for category <span className="font-black">{activeCategory}</span>.</p>
                </div>
              )}

              {/* ── TABLE ──────────────────────────────────── */}
              {tableRecords.length > 0 && (
                <div className={`rounded-2xl border overflow-hidden ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={darkMode ? "bg-slate-900/70 text-slate-400" : "bg-slate-100 text-slate-500"}>
                          {["Year", "Round", "Quota", "Gender", "Opening Rank", "Closing Rank"].map((h) => (
                            <th key={h} className="px-4 py-3.5 font-black uppercase tracking-wider text-[10px] whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRecords.map((row, i) => (
                          <tr
                            key={i}
                            className={`border-t transition-colors
                              ${darkMode
                                ? "border-slate-800/40 hover:bg-slate-900/60"
                                : "border-slate-100 hover:bg-slate-50"
                              }`}
                          >
                            <td className="px-4 py-3 font-mono font-black text-sm">{row.year}</td>


                            <td className="px-4 py-3 text-slate-400 font-bold whitespace-nowrap">
                              {row.round ?? "—"}   
                            </td>


                            <td className="px-4 py-3">
                              {/* Yahan category color apply hota hai, graph me nahi */}
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide ${catColor.bg} ${catColor.text}`}>
                                {row.quota || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-400 font-semibold">{row.gender || "—"}</td>
                            <td className="px-4 py-3 font-mono text-slate-400">
                              {row.openRank ? Number(row.openRank).toLocaleString("en-IN") : "—"}
                            </td>
                            <td className="px-4 py-3 font-mono font-black text-sm text-slate-500 dark:text-slate-300">
                              {row.closeRank ? Number(row.closeRank).toLocaleString("en-IN") : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {availableCategories.length === 0 && (
                <div className="py-20 text-center text-slate-400 text-sm font-bold">
                  No historical records found for this institute.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style> */}

      
    </div>
  );
}