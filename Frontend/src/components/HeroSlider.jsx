
'use client';

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Milestone, Zap } from "lucide-react";

// ── Slide Data (all 8 slides, as originally provided) ──────────────────────
const SLIDES = [
  {
    id: 0,
    isPureImage: false,
    title: "NEET All India Cutoff",
    titleAccent: "Predictive Matrix 2026",
    desc: "Ditch messy government PDFs. Analyze opening and closing rank boundaries across premier medical institutions with real-time stream synchronization.",
    tag: "LIVE ALLOCATION ENGINE",
    badge: "v2.0 Active",
    bgImage: "/banner1.jpg",
    theme: "emerald",
    mockUi: { title: "AIIMS New Delhi", course: "MBBS (5.5 Years)", pool: "AIQ Pool", closing: "50", trend: "+4 Ranks Up" },
    stats: [{ label: "Institutes", value: "160+" }, { label: "Records", value: "1.4L+" }],
  },
  {
    id: 1,
    isPureImage: false,
    title: "NEET All India Cutoff",
    titleAccent: "Predictive Matrix 2026",
    desc: "Ditch messy government PDFs. Analyze opening and closing rank boundaries across premier medical institutions with real-time stream synchronization.",
    tag: "LIVE ALLOCATION ENGINE",
    badge: "v2.0 Active",
    bgImage: "/img2.jpg",
    theme: "emerald",
    mockUi: { title: "AIIMS New Delhi", course: "MBBS (5.5 Years)", pool: "AIQ Pool", closing: "50", trend: "+4 Ranks Up" },
    stats: [{ label: "Institutes", value: "160+" }, { label: "Records", value: "1.4L+" }],
  },
  {
    id: 2,
    isPureImage: false,
    title: "NEET All India Cutoff",
    titleAccent: "Predictive Matrix 2026",
    desc: "Ditch messy government PDFs. Analyze opening and closing rank boundaries across premier medical institutions with real-time stream synchronization.",
    tag: "LIVE ALLOCATION ENGINE",
    badge: "v2.0 Active",
    bgImage: "/img3.png",
    theme: "emerald",
    mockUi: { title: "AIIMS New Delhi", course: "MBBS (5.5 Years)", pool: "AIQ Pool", closing: "50", trend: "+4 Ranks Up" },
    stats: [{ label: "Institutes", value: "160+" }, { label: "Records", value: "1.4L+" }],
  },
  {
    id: 3,
    isPureImage: false,
    title: "NEET All India Cutoff",
    titleAccent: "Predictive Matrix 2026",
    desc: "Ditch messy government PDFs. Analyze opening and closing rank boundaries across premier medical institutions with real-time stream synchronization.",
    tag: "LIVE ALLOCATION ENGINE",
    badge: "v2.0 Active",
    bgImage: "/img4.png",
    theme: "emerald",
    mockUi: { title: "AIIMS New Delhi", course: "MBBS (5.5 Years)", pool: "AIQ Pool", closing: "50", trend: "+4 Ranks Up" },
    stats: [{ label: "Institutes", value: "160+" }, { label: "Records", value: "1.4L+" }],
  },
  {
    id: 4,
    isPureImage: false,
    title: "AIIMS & Top Tier",
    titleAccent: "Government Medical Hubs",
    desc: "Exclusively modeled data parameters for continuous historical analysis. Safely map your absolute scores to your dream medical colleges.",
    tag: "PREMIUM ANALYTICS LAB",
    badge: "100% Verified",
    bgImage: "/img5.png",
    theme: "blue",
    mockUi: { title: "MAMC New Delhi", course: "MBBS (5.5 Years)", pool: "Open Pool", closing: "90", trend: "Highly Competitive" },
    stats: [{ label: "AIIMS Nodes", value: "21" }, { label: "Rounds", value: "5" }],
  },
  {
    id: 5,
    isPureImage: false,
    title: "AIIMS & Top Tier",
    titleAccent: "Government Medical Hubs",
    desc: "Exclusively modeled data parameters for continuous historical analysis. Safely map your absolute scores to your dream medical colleges.",
    tag: "PREMIUM ANALYTICS LAB",
    badge: "100% Verified",
    bgImage: "/img6.png",
    theme: "blue",
    mockUi: { title: "MAMC New Delhi", course: "MBBS (5.5 Years)", pool: "Open Pool", closing: "90", trend: "Highly Competitive" },
    stats: [{ label: "AIIMS Nodes", value: "21" }, { label: "Rounds", value: "5" }],
  },
  {
    id: 6,
    isPureImage: false,
    title: "AIIMS & Top Tier",
    titleAccent: "Government Medical Hubs",
    desc: "Exclusively modeled data parameters for continuous historical analysis. Safely map your absolute scores to your dream medical colleges.",
    tag: "PREMIUM ANALYTICS LAB",
    badge: "100% Verified",
    bgImage: "/img7.png",
    theme: "blue",
    mockUi: { title: "MAMC New Delhi", course: "MBBS (5.5 Years)", pool: "Open Pool", closing: "90", trend: "Highly Competitive" },
    stats: [{ label: "AIIMS Nodes", value: "21" }, { label: "Rounds", value: "5" }],
  },
  {
    id: 7,
    isPureImage: false,
    title: "AIIMS & Top Tier",
    titleAccent: "Government Medical Hubs",
    desc: "Exclusively modeled data parameters for continuous historical analysis. Safely map your absolute scores to your dream medical colleges.",
    tag: "PREMIUM ANALYTICS LAB",
    badge: "100% Verified",
    bgImage: "/img1.png",
    theme: "blue",
    mockUi: { title: "MAMC New Delhi", course: "MBBS (5.5 Years)", pool: "Open Pool", closing: "90", trend: "Highly Competitive" },
    stats: [{ label: "AIIMS Nodes", value: "21" }, { label: "Rounds", value: "5" }],
  },
];

// ── Theme config (emerald and blue keys kept, but colors updated to official palette) ──
const THEMES = {
  emerald: {
    tagText: "text-primary",
    tagBorder: "border-primary/40",
    tagBg: "bg-primary/15",
    accentText: "text-primary",
    accentTextLight: "text-primary",
    dot: "bg-primary",
    topLine: "from-primary via-interactive to-primary",
    cardBorder: "border-primary/20",
    trendBg: "bg-primary/15 text-primary border-primary/30",
    trendBgLight: "bg-primary/10 text-primary border-primary/30",
    statText: "text-primary",
    statTextLight: "text-primary",
    pip: "bg-primary",
    pipInactive: "bg-primary/30",
    separatorColor: "via-primary/50",
    separatorDot: "bg-primary",
    overlayFrom: "from-slate-950/90 via-slate-900/60 to-slate-950/20",
    overlayFromLight: "from-white/95 via-white/75 to-white/10",
  },
  blue: {
    tagText: "text-primary",
    tagBorder: "border-primary/40",
    tagBg: "bg-primary/15",
    accentText: "text-primary",
    accentTextLight: "text-primary",
    dot: "bg-primary",
    topLine: "from-primary via-interactive to-primary",
    cardBorder: "border-primary/20",
    trendBg: "bg-primary/15 text-primary border-primary/30",
    trendBgLight: "bg-primary/10 text-primary border-primary/30",
    statText: "text-primary",
    statTextLight: "text-primary",
    pip: "bg-primary",
    pipInactive: "bg-primary/30",
    separatorColor: "via-primary/50",
    separatorDot: "bg-primary",
    overlayFrom: "from-slate-950/90 via-slate-900/60 to-slate-950/20",
    overlayFromLight: "from-white/95 via-white/75 to-white/10",
  },
};

export default function HeroSlider({ darkMode }) {
  const [current, setCurrent] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [displayedAccent, setDisplayedAccent] = useState("");
  const [displayedDesc, setDisplayedDesc] = useState("");
  const [accentVisible, setAccentVisible] = useState(false);
  const [descVisible, setDescVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const slide = SLIDES[current];
  const tc = THEMES[slide.theme] || THEMES.emerald;

  // Preload next image
  useEffect(() => {
    const nextIdx = (current + 1) % SLIDES.length;
    const img = new Image();
    img.src = SLIDES[nextIdx].bgImage;
  }, [current]);

  // Image fade on slide change
  useEffect(() => {
    setImgLoaded(false);
    setCardKey((k) => k + 1);
    const img = new Image();
    img.src = slide.bgImage;
    img.onload = () => setImgLoaded(true);
    if (img.complete) setImgLoaded(true);
  }, [current]);

  // Typing animation (unchanged)
  useEffect(() => {
    setDisplayedText("");
    setDisplayedAccent("");
    setDisplayedDesc("");
    setAccentVisible(false);
    setDescVisible(false);

    const title = slide.title || "";
    const accent = slide.titleAccent || "";
    const desc = slide.desc || "";
    const titleSpeed = 38;
    const accentSpeed = 38;
    const descSpeed = 16;

    let i = 0;
    const t1 = setInterval(() => {
      if (i < title.length) { setDisplayedText(title.substring(0, i + 1)); i++; }
      else { clearInterval(t1); setAccentVisible(true); }
    }, titleSpeed);

    const t2 = setTimeout(() => {
      let j = 0;
      const t3 = setInterval(() => {
        if (j < accent.length) { setDisplayedAccent(accent.substring(0, j + 1)); j++; }
        else { clearInterval(t3); setDescVisible(true); }
      }, accentSpeed);
      return () => clearInterval(t3);
    }, title.length * titleSpeed + 80);

    const t4 = setTimeout(() => {
      let k = 0;
      const t5 = setInterval(() => {
        if (k < desc.length) { setDisplayedDesc(desc.substring(0, k + 1)); k++; }
        else clearInterval(t5);
      }, descSpeed);
      return () => clearInterval(t5);
    }, (title.length * titleSpeed) + (accent.length * accentSpeed) + 200);

    return () => { clearInterval(t1); clearTimeout(t2); clearTimeout(t4); };
  }, [current]);

  // Auto-advance
  useEffect(() => {
    const loop = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 8500);
    return () => clearInterval(loop);
  }, []);

  const goTo = (idx) => { if (idx !== current) setCurrent((idx + SLIDES.length) % SLIDES.length); };
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  return (
    <div className="mb-12 -mt-4 relative w-auto mx-1 sm:-mx-8 lg:-mx-16 xl:-mx-26 z-20">

      {/* Main Slider - keep original rounded-lg */}
      <div className={`relative rounded-lg overflow-hidden min-h-[530px] shadow-2xl border flex items-center
        ${darkMode
          ? "border-white/8 shadow-black/60"
          : "border-slate-200/60 shadow-slate-400/20"
        }`}>

        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className={`absolute inset-0 ${darkMode ? "bg-slate-950" : "bg-slate-100"}`} />
          {slide.bgImage && (
            <img
              key={slide.bgImage}
              src={slide.bgImage}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none
                ${imgLoaded ? "hs-img-enter opacity-100" : "opacity-0"}
              `}
              style={{ transition: "opacity 0.6s ease" }}
            />
          )}
          {/* Gradient overlay – using official dark/light background colors */}
          {darkMode ? (
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(100deg, rgba(10,15,25,0.96) 0%, rgba(10,15,25,0.88) 30%, rgba(10,15,25,0.60) 55%, rgba(10,15,25,0.20) 75%, rgba(10,15,25,0.05) 100%)"
              }}
            />
          ) : (
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(100deg, rgba(249,250,252,0.97) 0%, rgba(249,250,252,0.90) 30%, rgba(249,250,252,0.65) 55%, rgba(249,250,252,0.18) 75%, rgba(249,250,252,0.02) 100%)"
              }}
            />
          )}
          <div className="absolute inset-0"
            style={{
              background: darkMode
                ? "linear-gradient(180deg, rgba(10,15,25,0.30) 0%, transparent 20%, transparent 80%, rgba(10,15,25,0.45) 100%)"
                : "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 18%, transparent 80%, rgba(0,0,0,0.10) 100%)"
            }}
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-14 py-10">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">

            {/* Left: Text */}
            <div key={`content-${current}`} className="flex-1 space-y-5 w-full text-left py-10 hs-content-enter">
              {/* Tag + Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-2 text-sm font-bold tracking-[0.14em] border px-3 py-1.5 rounded-lg uppercase backdrop-blur-sm
                  ${darkMode
                    ? `${tc.tagText} ${tc.tagBorder} ${tc.tagBg}`
                    : `text-primary border-primary/30 bg-white/60`
                  }`}>
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 hs-dot-pulse ${darkMode ? tc.dot : "bg-primary"}`} />
                  {slide.tag}
                </span>
                <span className={`text-sm font-bold px-2.5 py-1.5 rounded-lg border backdrop-blur-sm
                  ${darkMode
                    ? "bg-slate-900/70 border-slate-700 text-slate-300"
                    : "bg-white/70 border-slate-300/60 text-slate-700"
                  }`}>
                  {slide.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]
                ${darkMode ? "text-white" : "text-primary"}`}
                style={{ textShadow: darkMode ? "0 2px 20px rgba(0,0,0,0.8)" : "0 1px 8px rgba(255,255,255,0.9)" }}>
                <span className={!accentVisible ? "hs-cursor" : ""}>{displayedText}</span>
                {accentVisible && (
                  <>
                    {" "}
                    <span className={`block sm:inline ${darkMode ? tc.accentText : tc.accentTextLight} ${displayedAccent !== slide.titleAccent ? "hs-cursor" : ""}`}>
                      {displayedAccent}
                    </span>
                  </>
                )}
              </h1>

              {/* Description */}
              {descVisible && (
                <p className={`text-sm lg:text-base max-w-lg leading-relaxed font-medium
                  ${darkMode ? "text-slate-300" : "text-text-body"}`}
                  style={{ textShadow: darkMode ? "0 1px 12px rgba(0,0,0,0.9)" : "0 1px 6px rgba(255,255,255,0.95)" }}>
                  {displayedDesc}
                  {displayedDesc !== slide.desc && (
                    <span className={`inline-block w-0.5 h-4 ml-0.5 align-middle rounded-full hs-dot-pulse ${darkMode ? tc.dot : "bg-primary"}`} />
                  )}
                </p>
              )}

              {/* Trust chips */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {[
                  { icon: ShieldCheck, text: "MCC Structured Blueprint" },
                  { icon: Milestone,   text: "Auto-Calculated V-Ranks" },
                  { icon: Zap,         text: "Zero Cost Access" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border backdrop-blur-sm
                    ${darkMode
                      ? "bg-slate-900/60 border-white/8 text-slate-300"
                      : "bg-white/75 border-slate-300/50 text-slate-800"
                    }`}>
                    <Icon className={`h-3.5 w-3.5 ${darkMode ? tc.accentText : "text-primary"}`} />
                    {text}
                  </div>
                ))}
              </div>

              {/* Pip progress */}
              <div className="flex items-center gap-2 pt-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1 rounded-full transition-all duration-500 cursor-pointer
                      ${i === current
                        ? `w-7 ${tc.pip}`
                        : `w-4 ${darkMode ? "bg-white/20 hover:bg-white/35" : "bg-slate-900/20 hover:bg-slate-900/35"}`
                      }`}
                  />
                ))}
                <span className={`ml-1 text-xs font-bold font-mono tracking-widest ${darkMode ? "text-white/30" : "text-slate-900/30"}`}>
                  {String(current + 1).padStart(2, "0")}/{String(SLIDES.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Right: Telemetry Card - keep original rounded-md */}
            <div className="hidden lg:flex w-full lg:w-[300px] justify-center lg:justify-end">
              <div
                key={`card-${cardKey}`}
                className={`w-full max-w-[290px] rounded-md border overflow-hidden backdrop-blur-2xl shadow-2xl hs-card-enter
                  ${darkMode
                    ? `bg-slate-950/55 ${tc.cardBorder} shadow-black/50`
                    : "bg-white/70 border-slate-200/70 shadow-slate-300/40"
                  }`}>
                <div className={`h-0.5 w-full bg-gradient-to-r ${tc.topLine}`} />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-xs font-bold tracking-[0.18em] uppercase mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Live Data Node</p>
                      <p className={`font-bold text-sm leading-snug ${darkMode ? "text-white" : "text-primary"}`}>{slide.mockUi.title}</p>
                    </div>
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-1 hs-dot-pulse ${tc.dot}`} />
                  </div>
                  <p className={`text-sm font-bold ${darkMode ? tc.accentText : tc.accentTextLight}`}>
                    {slide.mockUi.course}
                    <span className={`mx-1.5 ${darkMode ? "text-slate-600" : "text-slate-300"}`}>•</span>
                    <span className={darkMode ? "text-slate-300" : "text-slate-700"}>{slide.mockUi.pool}</span>
                  </p>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl border
                    ${darkMode ? "bg-slate-900/60 border-white/6" : "bg-slate-50/90 border-slate-200/60"}`}>
                    <span className={`text-xs font-bold tracking-widest uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Archival Cutoff</span>
                    <span className={`font-mono font-bold text-xs ${darkMode ? tc.accentText : tc.accentTextLight}`}>#{slide.mockUi.closing}</span>
                  </div>
                  <div className={`flex items-center justify-between px-3 py-2 rounded-xl border
                    ${darkMode ? "bg-slate-900/60 border-white/6" : "bg-slate-50/90 border-slate-200/60"}`}>
                    <span className={`text-xs font-bold tracking-widest uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Analysis Engine</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border hs-dot-pulse
                      ${darkMode ? tc.trendBg : tc.trendBgLight}`}>
                      {slide.mockUi.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {slide.stats.map((s, i) => (
                      <div key={i} className={`px-3 py-2 rounded-xl border text-center
                        ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-slate-50/80 border-slate-200/50"}`}>
                        <p className={`font-bold text-sm ${darkMode ? tc.statText : tc.statTextLight}`}>{s.value}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-wide mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Buttons - keep original rounded-xl */}
        <div className="absolute right-5 bottom-5 flex items-center gap-2 z-20">
          <button
            onClick={prev}
            className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm
              ${darkMode
                ? "bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                : "bg-white/75 border-slate-300/60 text-slate-700 hover:border-slate-400/60 hover:text-slate-900"
              }`}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className={`p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm
              ${darkMode
                ? "bg-slate-950/70 border-white/10 text-slate-300 hover:border-white/20 hover:text-white"
                : "bg-white/75 border-slate-300/60 text-slate-700 hover:border-slate-400/60 hover:text-slate-900"
              }`}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Live Badge - keep original rounded-full */}
      <div className="flex justify-center -mt-5 relative z-30">
        <span className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest border shadow-xl
          ${darkMode
            ? "bg-slate-900 border-slate-800 text-slate-200 shadow-black/50"
            : "bg-white border-slate-200 text-slate-700 shadow-slate-200/60"
          }`}>
          <span className="h-1.5 w-1.5 rounded-full bg-primary hs-dot-pulse" />
          Active Pipelines:
          <span className="font-mono text-primary">1,45,230 Records Synced</span>
          <span className={`h-3 w-px ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />
          <span className={darkMode ? "text-slate-500" : "text-slate-400"}>Live</span>
        </span>
      </div>

      {/* Separator */}
      <div className="relative w-full h-px mt-12 mb-2 select-none pointer-events-none">
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${tc.separatorColor} to-transparent`} />
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${tc.separatorDot}`}
          style={{ boxShadow: `0 0 14px 2px currentColor` }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white" />
      </div>
    </div>
  );
}