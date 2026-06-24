'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, Trash2, Sparkles, AlertTriangle, Plus } from 'lucide-react';

export default function ChoiceSandbox({ darkMode }) {
  const dm = darkMode;
  const [myChoices, setMyChoices] = useState([]);
  const [selectedInst, setSelectedInst] = useState('');

  const dropdownColleges = useMemo(() => {
    const names = [].map((item) => item.institute);
    return [...new Set(names)].sort();
  }, []);

  const addCollegeToSandbox = () => {
    if (!selectedInst) return;
    if (myChoices.some((c) => c.institute === selectedInst)) {
      alert('This institution is already in your preference list.');
      return;
    }
    const record = [].find((item) => item.institute === selectedInst);
    if (record) {
      setMyChoices([
        ...myChoices,
        {
          id:        `sandbox_${Date.now()}`,
          institute: record.institute,
          program:   record.program,
          closeRank: record.closeRank,
          quota:     record.quota,
        },
      ]);
    }
    setSelectedInst('');
  };

  const handleAutoArrange = () => {
    setMyChoices([...myChoices].sort((a, b) => a.closeRank - b.closeRank));
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
    if (direction === 'up' && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === 'down' && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setMyChoices(updated);
  };

  return (
    <div className={`w-full border rounded-2xl overflow-hidden ${dm ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>

      {/* Header */}
      <div className={`p-5 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${dm ? 'border-slate-700 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
        <div>
          <h2 className={`text-base font-black ${dm ? 'text-white' : 'text-slate-900'}`}>
            Choice Filling Sandbox
          </h2>
          <p className={`text-xs font-medium mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Simulate your preference order and resolve sequence conflicts before the real window opens.
          </p>
        </div>
        <button
          onClick={handleAutoArrange}
          className="flex items-center gap-2 px-4 py-2 text-white font-bold text-xs uppercase tracking-wide rounded-xl transition-all hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#1A3C6E' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          Auto-Arrange
        </button>
      </div>

      {/* Add college row */}
      <div className={`p-4 border-b flex flex-col sm:flex-row gap-3 items-center ${dm ? 'bg-slate-900/30 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
        <select
          value={selectedInst}
          onChange={(e) => setSelectedInst(e.target.value)}
          className={`flex-1 text-sm font-medium px-3 py-2.5 rounded-xl border outline-none transition-all ${dm ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'}`}
        >
          <option value="">— Select a college to add —</option>
          {dropdownColleges.map((name, i) => (
            <option key={i} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={addCollegeToSandbox}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-white font-bold text-xs uppercase rounded-xl transition-all hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#16A34A' }}
        >
          <Plus className="h-4 w-4" />
          Add College
        </button>
      </div>

      {/* Conflict status bar */}
      <div className={`px-5 py-2.5 border-b flex items-center justify-between text-xs font-bold uppercase tracking-wide
        ${totalConflicts > 0
          ? (dm ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700')
          : (dm ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')
        }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Sequence Check:
        </div>
        <span className="font-mono">
          {totalConflicts > 0 ? `${totalConflicts} conflict${totalConflicts > 1 ? 's' : ''} detected` : '✓ No conflicts'}
        </span>
      </div>

      {/* Choice list */}
      <div className="p-5 space-y-2">
        {myChoices.length === 0 ? (
          <div className={`text-center py-14 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>
            <p className="text-sm font-bold">Your sandbox is empty.</p>
            <p className="text-xs mt-1">Select a college from the dropdown above to begin.</p>
          </div>
        ) : (
          myChoices.map((choice, index) => {
            const isConflicted = index < myChoices.length - 1 && choice.closeRank > myChoices[index + 1].closeRank;
            return (
              <div
                key={choice.id}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all
                  ${isConflicted
                    ? (dm ? 'bg-amber-950/20 border-amber-700/40' : 'bg-amber-50 border-amber-300')
                    : (dm ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200')
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`font-mono font-black text-xs opacity-40 w-5 shrink-0 ${dm ? 'text-white' : 'text-slate-900'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="truncate">
                    <div className={`font-bold text-sm truncate ${dm ? 'text-white' : 'text-slate-900'}`}>{choice.institute}</div>
                    <div className={`text-xs font-medium mt-0.5 flex flex-wrap gap-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span style={{ color: '#2563EB' }}>{choice.program}</span>
                      <span>Quota: {choice.quota}</span>
                      <span className="font-mono">CR: {choice.closeRank?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 ml-3 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => moveChoice(index, 'up')}
                    className={`p-1.5 rounded-lg border transition-all disabled:opacity-20 ${dm ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    disabled={index === myChoices.length - 1}
                    onClick={() => moveChoice(index, 'down')}
                    className={`p-1.5 rounded-lg border transition-all disabled:opacity-20 ${dm ? 'border-slate-700 text-slate-400 hover:bg-slate-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setMyChoices(myChoices.filter((c) => c.id !== choice.id))}
                    className={`p-1.5 rounded-lg border transition-all ${dm ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10' : 'border-rose-200 text-rose-500 hover:bg-rose-50'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}