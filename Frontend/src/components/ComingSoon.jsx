'use client';

import React from 'react';
import { Clock, Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoon({ darkMode, featureName, onBack }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className={`max-w-md w-full text-center p-8 rounded-lg border
        ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center
            ${darkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
            <Construction className={`w-10 h-10 ${darkMode ? 'text-primary' : 'text-primary'}`} />
          </div>
        </div>
        
        {/* Title */}
        <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-primary'}`}>
          {featureName || 'Feature'} Coming Soon
        </h2>
        
        {/* Description */}
        <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>
          We're working hard to bring this feature to you. 
          Stay tuned for updates!
        </p>
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2 rounded bg-primary hover:bg-interactive text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}