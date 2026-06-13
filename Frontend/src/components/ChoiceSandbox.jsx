

import React, { useState, useMemo } from "react";
// MOCK_CUTOFF_DATA removed — sandbox uses empty array by default
import { ArrowUp, ArrowDown, Trash2, Sparkles, AlertTriangle, CheckCircle, Plus } from "lucide-react";

export default function ChoiceSandbox({ darkMode }) {
  const [myChoices, setMyChoices] = useState([]);
  const [selectedInst, setSelectedInst] = useState("");

  
  const dropdownColleges = useMemo(() => {
    const names = [].map((item) => item.institute);
    return [...new Set(names)].sort();
  }, []);

  
  const addCollegeToSandbox = () => {
    if (!selectedInst || selectedInst === "") return;
    

    if (myChoices.some((c) => c.institute === selectedInst)) {
      alert("This institution is already in your preference matrix list!");
      return;
    }

   
    const databaseRecord = [].find((item) => item.institute === selectedInst);
    
    if (databaseRecord) {
      setMyChoices([
        ...myChoices,
        {
          id: `sandbox_${Date.now()}`,
          institute: databaseRecord.institute,
          program: databaseRecord.program,
          closeRank: databaseRecord.closeRank,
          quota: databaseRecord.quota,
        },
      ]);
    }
    setSelectedInst("");
  };

  // 🌟 ZERO-CONFLICT AUTOMATIC HIERARCHICAL SORTING (Closing Rank के सही क्रम में)
  const handleAutoArrange = () => {
    const sorted = [...myChoices].sort((a, b) => a.closeRank - b.closeRank);
    setMyChoices(sorted);
  };

  const checkConflicts = () => {
    let conflicts = 0;
    for (let i = 0; i < myChoices.length - 1; i++) {
      if (myChoices[i].closeRank > myChoices[i + 1].closeRank) conflicts++;
    }
    return conflicts;
  };

  const totalConflicts = checkConflicts();

  const moveChoice = (index, direction) => {
    const updated = [...myChoices];
    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setMyChoices(updated);
  };

  return (
    <div className={`w-full border rounded-3xl overflow-hidden transition-all duration-300 ${darkMode ? "bg-[#0b0f19] border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-800"}`}>
      
      {/* CARD TOP BAR PANEL */}
      <div className={`p-6 border-b border-solid flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-300 bg-slate-100"}`}>
        <div>
          <h2 className="text-lg font-black tracking-tight">🛡️ ChoiceLab Sandbox Simulator</h2>
          <p className="text-sm font-bold text-slate-400 mt-1">Populate preferences from real-world data and resolve sequence conflicts instantly.</p>
        </div>
        
        <button onClick={handleAutoArrange} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer">
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Auto-Arrange by Trend</span>
        </button>
      </div>

      {/*  CUSTOM REAL DATA SELECTION WRAPPER */}
      <div className={`p-4 border-b border-solid flex flex-col sm:flex-row gap-3 items-center ${darkMode ? "bg-slate-900/30 border-slate-700" : "bg-slate-50/50 border-slate-300"}`}>
        <select 
          value={selectedInst} 
          onChange={(e) => setSelectedInst(e.target.value)}
          className={`flex-1 text-sm font-bold px-3 py-2.5 rounded-xl border outline-none transition-all ${darkMode ? "bg-slate-950 border-slate-700 text-slate-100 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-800 focus:border-indigo-500"}`}
        >
          <option value="">-- Choose College From MOCK_CUTOFF_DATA --</option>
          {dropdownColleges.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
        
        <button 
          onClick={addCollegeToSandbox}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add to Preference Matrix</span>
        </button>
      </div>

      {/* REAL-TIME STATUS CONFLICT PANEL */}
      <div className={`px-6 py-3 border-b border-solid flex items-center justify-between text-sm font-black uppercase ${totalConflicts > 0 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-400"}`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>Sequence Conflict Guard System:</span>
        </div>
        <span className="font-mono text-sm">{totalConflicts > 0 ? `${totalConflicts} Hierarchy Faults Detected` : "✓ Order Optimized (Zero Errors)"}</span>
      </div>

      {/* RENDER DYNAMIC SYSTEM LIST */}
      <div className="p-6 space-y-3">
        {myChoices.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-bold tracking-wide">
            Your sandbox matrix is empty. Select colleges from the real data drop-down above to build your simulated preference sequence.
          </div>
        ) : (
          myChoices.map((choice, index) => {
            const isConflicted = index < myChoices.length - 1 && choice.closeRank > myChoices[index + 1].closeRank;
            return (
              <div key={choice.id} className={`flex items-center justify-between p-4 rounded-xl border border-solid ${isConflicted ? (darkMode ? "bg-amber-950/20 border-amber-800" : "bg-amber-50 border-amber-300") : (index % 2 === 0 ? (darkMode ? "bg-[#161f33] border-slate-700" : "bg-slate-100 border-slate-300") : (darkMode ? "bg-[#0b0f19] border-slate-700" : "bg-white border-slate-300"))}`}>
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="font-mono font-black opacity-40 w-6">{(index + 1).toString().padStart(2, '0')}</span>
                  <div className="truncate">
                    <div className={`font-bold text-base truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{choice.institute}</div>
                    <div className="text-sm font-extrabold uppercase text-slate-400 mt-1">
                      <span className="text-indigo-500 dark:text-indigo-400">{choice.program}</span> • <span>Quota: {choice.quota}</span> • <span className="font-mono">Database Base Rank: {choice.closeRank.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 ml-4">
                  <button disabled={index === 0} onClick={() => moveChoice(index, "up")} className="p-1.5 rounded border dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"><ArrowUp className="h-4 w-4" /></button>
                  <button disabled={index === myChoices.length - 1} onClick={() => moveChoice(index, "down")} className="p-1.5 rounded border dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"><ArrowDown className="h-4 w-4" /></button>
                  <button onClick={() => setMyChoices(myChoices.filter(c => c.id !== choice.id))} className="p-1.5 rounded border text-rose-500 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}