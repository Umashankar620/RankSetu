'use client';

import React from 'react';

// =============================================================================
// components/PageHeader.jsx
// =============================================================================
// Shared "page header" section used on every page EXCEPT Home.
// Keeps the site to its 3 brand colors (primary / interactive / text-body).
// `badge` is reserved for genuine status indicators (Live, New, Trending,
// Featured, Verified...) — never used purely for decoration.
// `variant="explore"` is used only on the Cutoff/Analytics ("Explore Data")
// pages to make them feel like a distinct zone, via a subtle ring + pattern.
// =============================================================================

export default function PageHeader({
  icon: Icon,
  eyebrow,
  title,
  accent,
  description,
  badge,
  darkMode = false,
  variant = 'default',
  onBack,
  backLabel = 'Back to Dashboard',
}) {
  const dm = darkMode;
  const isExplore = variant === 'explore';

  return (
    <div className="mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-xs font-bold uppercase tracking-wide hover:underline cursor-pointer flex items-center gap-1.5 transition-colors"
          style={{ color: '#1A3C6E' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          {backLabel}
        </button>
      )}

      <div
        className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8
          ${dm ? 'border-slate-700 bg-slate-800/40' : 'border-slate-200 bg-white'}
          ${isExplore ? (dm ? 'ring-1 ring-blue-500/20' : 'ring-1 ring-blue-500/10') : ''}
        `}
      >
        {/* Decorative backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl"
          style={{ backgroundColor: dm ? 'rgba(26,60,110,0.15)' : 'rgba(26,60,110,0.08)' }}
        />
        {isExplore && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)',
              color: dm ? '#fff' : '#1A3C6E',
            }}
          />
        )}

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {Icon && (
              <div
                className={`shrink-0 p-3 rounded-xl border ${dm ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'border-slate-200 text-slate-700'}`}
                style={!dm ? { backgroundColor: 'rgba(26,60,110,0.07)', borderColor: 'rgba(26,60,110,0.15)' } : {}}
              >
                <Icon className="w-6 h-6" style={!dm ? { color: '#1A3C6E' } : {}} />
              </div>
            )}
            <div className="min-w-0">
              {eyebrow && (
                <p
                  className="text-[11px] font-black uppercase tracking-[0.18em] mb-1.5"
                  style={{ color: '#1A3C6E' }}
                >
                  {eyebrow}
                </p>
              )}
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${dm ? 'text-white' : 'text-slate-900'}`}>
                {title}
                {accent && (
                  <span style={{ color: '#1A3C6E' }}> {accent}</span>
                )}
              </h1>
              {description && (
                <p className={`mt-2.5 text-sm sm:text-[15px] leading-relaxed max-w-2xl ${dm ? 'text-slate-300' : 'text-slate-500'}`}>
                  {description}
                </p>
              )}
            </div>
          </div>

          {badge && (
            <span className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${badgeToneClasses(badge.tone, dm)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {badge.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function badgeToneClasses(tone = 'live', dm) {
  const map = {
    live: dm
      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
      : 'bg-emerald-50 border-emerald-200 text-emerald-700',
    trending: dm
      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
      : 'bg-amber-50 border-amber-200 text-amber-700',
    new: dm
      ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
      : 'bg-cyan-50 border-cyan-200 text-cyan-700',
    success: dm
      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
      : 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: dm
      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
      : 'bg-amber-50 border-amber-200 text-amber-700',
  };
  return map[tone] || map.live;
}