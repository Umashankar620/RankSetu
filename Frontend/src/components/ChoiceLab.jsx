
'use client';

import React, { useState } from "react";
import { ArrowLeft, Trash2, ArrowUp, ArrowDown, Download, Sparkles, Eye, EyeOff } from "lucide-react";

export default function ChoiceLab({ treeList, setTreeList, setCurrentView, darkMode }) {
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  // Index shifting loop function
  const handleShiftSequence = (index, direction) => {
    const matrix = [...treeList];
    if (direction === "up" && index > 0) {
      [matrix[index], matrix[index - 1]] = [matrix[index - 1], matrix[index]];
    } else if (direction === "down" && index < matrix.length - 1) {
      [matrix[index], matrix[index + 1]] = [matrix[index + 1], matrix[index]];
    }
    setTreeList(matrix);
  };

  const handleRemoveNode = (id) => {
    setTreeList(treeList.filter(n => n.id !== id));
  };

  // 💥 THE FILE EXPORTING LOGIC pipeline
  const handleDownloadSheet = () => {
    let output = "MEDSPHERE PRO - AI GENERATED MEDICAL PREFERENCE PRESET SHEET\n";
    output += "========================================================\n\n";
    
    treeList.forEach((node, index) => {
      output += `${index + 1}. ${node.institute}\n`;
      output += `   Course Spec: ${node.program} | Stream Type: ${node.type || "Government"}\n`;
      output += `   Category Filter: ${node.category} | Gender Quota: ${node.gender}\n`;
      output += `   Counselling Cutoff -> Opening: ${node.openRank} | Closing Target: ${node.closeRank}\n`;
      output += `   Estimated Cost Metrics: ₹${node.type === "Government" ? "5,500" : "18,50,000"}/yr | 1 Year Service Bond\n`;
      output += `--------------------------------------------------------\n`;
    });

    const fileBlob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = URL.createObjectURL(fileBlob);
    downloadAnchor.download = "My_RankSetu_Choice_Tree.txt";
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* Top Controls Toolbar Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentView("analytics")} 
            className={`p-2.5 rounded-xl border transition-all ${darkMode ? "bg-[#111625] border-slate-800 hover:bg-slate-800 text-white" : "bg-white border-slate-200 hover:bg-slate-100 shadow-sm text-slate-800"}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-400 animate-bounce" />
              <h2 className={`text-2xl font-black tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>AI Choice Filling Analyzer</h2>
            </div>
            <p className={`text-sm font-bold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Organize preference arrays. System constraints audit sequence warnings dynamically.</p>
          </div>
        </div>

        {/* 💥 PREMIUM DOWNLOAD TREE FILE TRIGGER */}
        <button
          onClick={handleDownloadSheet}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-sm font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg cursor-pointer hover:scale-[1.02] transition"
        >
          <Download className="h-4 w-4" />
          <span>Download Choice List (.TXT)</span>
        </button>
      </div>

      {/* SEQUENCE FLOW CONTAINER */}
      {treeList.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-[#0f1422]/20">
          <p className="text-sm text-slate-500 font-bold">No choices loaded inside workspace buffer arrays.</p>
          <p className="text-xs text-slate-600 mt-1">Return to Cutoff Engine grid and activate selection checkboxes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {treeList.map((node, index) => {
            const isExpanded = expandedNodeId === node.id;
            
            // AI PREFERENCE CONFLICT VALIDATOR ALGORITHM
            let hasConflict = index > 0 && node.closeRank < treeList[index - 1].closeRank;

            return (
              <div 
                key={node.id}
                className={`p-4 rounded-2xl border transition-all duration-300 relative
                  ${hasConflict ? "border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5" : (darkMode ? "bg-[#0f1626]/80 border-slate-800/60" : "bg-white border-slate-200 shadow-sm")}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5 flex-1">
                    <span className="font-mono font-black text-xs h-6 w-6 rounded-md flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className={`font-black text-sm sm:text-base ${darkMode ? "text-white" : "text-slate-900"}`}>{node.institute}</h4>
                      <div className="text-sm text-slate-400 font-bold mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-emerald-500">️🩺 {node.program}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono">OR: {node.openRank} - CR: <span className="text-emerald-400 font-black">{node.closeRank}</span></span>
                        <span>•</span>
                        <button 
                          onClick={() => setExpandedNodeId(isExpanded ? null : node.id)}
                          className="text-blue-400 font-black uppercase text-xs hover:underline flex items-center space-x-0.5"
                        >
                          <span>{isExpanded ? "Hide Details" : "View Bond / Fee"}</span>
                        </button>
                      </div>

                      {/* AI AUTOMATIC PREFERENCE MISMATCH TRIGGER ALERT BANNER */}
                      {hasConflict && (
                        <div className="mt-2 text-sm font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2 py-0.5 rounded-md w-fit animate-pulse">
                          ⚠️ Sequence Conflict: High value threshold node positioned lower down the allocation workflow.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Sequence modifier button hubs */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-center">
                    <button disabled={index === 0} onClick={() => handleShiftSequence(index, "up")} className="p-2 bg-slate-800 border border-slate-700/60 rounded-xl hover:bg-slate-700 text-white text-xs disabled:opacity-20"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button disabled={index === treeList.length - 1} onClick={() => handleShiftSequence(index, "down")} className="p-2 bg-slate-800 border border-slate-700/60 rounded-xl hover:bg-slate-700 text-white text-xs disabled:opacity-20"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleRemoveNode(node.id)} className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>

                {/* COST COMPONENT ACCORDION DRAWER INSIDE INDIVIDUAL preference CARDS */}
                {isExpanded && (
                  <div className={`mt-3 pt-3 border-t ${darkMode ? "border-slate-800/60" : "border-slate-100"} grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-bold`}>
                    <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/80"><span className="text-slate-500 text-xs block">Tuition / yr</span><span className="text-emerald-400 font-mono">{node.type === "Government" ? "₹5,500" : "₹18,50,000"}</span></div>
                    <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/80"><span className="text-slate-500 text-xs block">Mandatory Bond</span><span className="text-amber-500">{node.type === "Government" ? "1 Year" : "None"}</span></div>
                    <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/80"><span className="text-slate-500 text-xs block">Stipend Pay</span><span className="text-blue-400 font-mono">₹28,500</span></div>
                    <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/80"><span className="text-slate-500 text-xs block">Patient Beds</span><span className="text-purple-400">1,850+ Beds</span></div>
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