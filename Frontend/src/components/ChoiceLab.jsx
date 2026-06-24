'use client';

import React, { useState } from 'react';
import { ArrowLeft, Trash2, ArrowUp, ArrowDown, Download, Sparkles } from 'lucide-react';

export default function ChoiceLab({ treeList, setTreeList, setCurrentView, darkMode }) {
  const dm = darkMode;
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  const handleShiftSequence = (index, direction) => {
    const matrix = [...treeList];
    if (direction === 'up' && index > 0) {
      [matrix[index], matrix[index - 1]] = [matrix[index - 1], matrix[index]];
    } else if (direction === 'down' && index < matrix.length - 1) {
      [matrix[index], matrix[index + 1]] = [matrix[index + 1], matrix[index]];
    }
    setTreeList(matrix);
  };

  const handleRemoveNode = (id) => {
    setTreeList(treeList.filter((n) => n.id !== id));
  };

  const handleDownloadSheet = () => {
    let output = 'RANKSETU — AI GENERATED MEDICAL PREFERENCE LIST\n';
    output += '================================================\n\n';
    treeList.forEach((node, index) => {
      output += `${index + 1}. ${node.institute}\n`;
      output += `   Program: ${node.program} | Type: ${node.type || 'Government'}\n`;
      output += `   Category: ${node.category} | Gender: ${node.gender}\n`;
      output += `   Opening Rank: ${node.openRank} | Closing Rank: ${node.closeRank}\n`;
      output += `   Est. Fees: ₹${node.type === 'Government' ? '5,500' : '18,50,000'}/yr\n`;
      output += '------------------------------------------------\n';
    });

    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'RankSetu_Choice_List.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="animate-fadeIn">
      {/* Toolbar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h2 className={`text-xl font-black tracking-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
              AI Choice Filling Analyzer
            </h2>
          </div>
          <p className={`text-sm ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            Organise your preference list. The system flags sequence conflicts automatically.
          </p>
        </div>

        <button
          onClick={handleDownloadSheet}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all hover:opacity-90"
          style={{ backgroundColor: '#16A34A' }}
        >
          <Download className="h-4 w-4" />
          Download Choice List
        </button>
      </div>

      {/* Empty state */}
      {treeList.length === 0 ? (
        <div className={`p-16 text-center border-2 border-dashed rounded-2xl ${dm ? 'border-slate-700 bg-slate-800/20' : 'border-slate-200 bg-slate-50'}`}>
          <p className={`text-sm font-bold ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
            No choices in your list yet.
          </p>
          <p className={`text-xs mt-1 ${dm ? 'text-slate-600' : 'text-slate-400'}`}>
            Go back to the cutoff table and select colleges to add them here.
          </p>
          <button
            onClick={() => setCurrentView('analytics')}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: '#1A3C6E' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Cutoffs
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {treeList.map((node, index) => {
            const isExpanded = expandedNodeId === node.id;
            const hasConflict = index > 0 && node.closeRank < treeList[index - 1].closeRank;

            return (
              <div
                key={node.id}
                className={`p-4 rounded-xl border transition-all duration-200
                  ${hasConflict
                    ? (dm ? 'border-amber-500/40 bg-amber-500/5' : 'border-amber-300 bg-amber-50')
                    : (dm ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200 shadow-sm')
                  }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Sequence number */}
                    <span
                      className="shrink-0 font-mono font-black text-xs h-6 w-6 rounded-md flex items-center justify-center border"
                      style={dm
                        ? { backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.25)', color: '#60A5FA' }
                        : { backgroundColor: 'rgba(26,60,110,0.08)', borderColor: 'rgba(26,60,110,0.2)', color: '#1A3C6E' }
                      }
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <h4 className={`font-black text-sm sm:text-base truncate ${dm ? 'text-white' : 'text-slate-900'}`}>
                        {node.institute}
                      </h4>
                      <div className={`text-xs font-bold mt-1 flex flex-wrap items-center gap-2 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className={dm ? 'text-emerald-400' : 'text-emerald-700'}>{node.program}</span>
                        <span>•</span>
                        <span className="font-mono">
                          OR: {node.openRank} &mdash; CR:{' '}
                          <span className={dm ? 'text-emerald-400 font-black' : 'text-emerald-700 font-black'}>{node.closeRank}</span>
                        </span>
                        <span>•</span>
                        <button
                          onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
                          className="font-black uppercase text-[10px] hover:underline"
                          style={{ color: '#2563EB' }}
                        >
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>

                      {/* Conflict warning */}
                      {hasConflict && (
                        <div className={`mt-2 text-xs font-bold px-2.5 py-1 rounded-lg w-fit border ${dm ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                          ⚠ Sequence conflict — a higher-rank college is placed below a lower-rank one
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      disabled={index === 0}
                      onClick={() => handleShiftSequence(index, 'up')}
                      className={`p-2 rounded-lg border text-xs transition-all disabled:opacity-20 ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      disabled={index === treeList.length - 1}
                      onClick={() => handleShiftSequence(index, 'down')}
                      className={`p-2 rounded-lg border text-xs transition-all disabled:opacity-20 ${dm ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveNode(node.id)}
                      className={`p-2 rounded-lg border transition-all ${dm ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail drawer */}
                {isExpanded && (
                  <div className={`mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm ${dm ? 'border-slate-700' : 'border-slate-100'}`}>
                    {[
                      { label: 'Tuition / yr', value: node.type === 'Government' ? '₹5,500' : '₹18,50,000', color: dm ? 'text-emerald-400' : 'text-emerald-700' },
                      { label: 'Bond',         value: node.type === 'Government' ? '1 Year' : 'None',        color: dm ? 'text-amber-400'  : 'text-amber-700'  },
                      { label: 'Stipend',      value: '₹28,500',                                              color: dm ? 'text-blue-400'   : 'text-blue-700'   },
                      { label: 'Bed Strength', value: '1,850+ Beds',                                          color: dm ? 'text-violet-400' : 'text-violet-700' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`p-2.5 rounded-lg border ${dm ? 'bg-slate-900/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wide block mb-1 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
                        <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}