'use client';

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Milestone, Zap } from "lucide-react";

// ── Slide Data ─────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 0,
    view: "home",
    isPureImage: false,
    title: "Your Complete NEET Counselling",
    titleAccent: "Command Center",
    typingPhrase: "Plan Your Counselling",
    desc: "One platform for MCC & AYUSH cutoffs, smart college matching, rank prediction, and step-by-step counselling guidance. No more scattered PDFs.",
    tag: "WELCOME TO RANKSETU",
    badge: "All-In-One Platform",
    bgImage: "/banner1.jpg",
    theme: "primary",
    mockUi: { title: "RankSetu Platform", course: "9 Specialized Tools", pool: "All-India Coverage", closing: "2026", trend: "Live & Updated" },
    stats: [{ label: "Colleges Mapped", value: "600+" }, { label: "Aspirants Helped", value: "1.4L+" }],
  },
  {
    id: 1,
    view: "analytics",
    isPureImage: false,
    title: "MCC Opening & Closing",
    titleAccent: "Rank Analysis",
    typingPhrase: "Predict Smarter",
    desc: "Track AIQ opening and closing ranks across every government and deemed medical college. Filter by category, round, and year.",
    tag: "OR CR · MCC COUNSELLING",
    badge: "Updated",
    bgImage: "/img2.jpg",
    theme: "primary",
    mockUi: { title: "AIIMS New Delhi", course: "MBBS (5.5 Years)", pool: "AIQ Pool", closing: "50", trend: "+4 Ranks Up" },
    stats: [{ label: "Institutes", value: "160+" }, { label: "Records", value: "1.4L+" }],
  },
  {
    id: 2,
    view: "ayush",
    isPureImage: false,
    title: "AYUSH Opening & Closing",
    titleAccent: "Cutoff Database",
    typingPhrase: "Explore Colleges",
    desc: "Rank data for BAMS, BHMS, BUMS and BNYS counselling. Compare trends across AYUSH colleges nationwide with real historical data.",
    tag: "OR CR · AYUSH COUNSELLING",
    badge: "New",
    bgImage: "/img3.png",
    theme: "primary",
    mockUi: { title: "NIA Jaipur", course: "BAMS (5.5 Years)", pool: "AYUSH Pool", closing: "310", trend: "Stable Demand" },
    stats: [{ label: "AYUSH Colleges", value: "450+" }, { label: "Records", value: "80K+" }],
  },
  {
    id: 3,
    view: "optimizer",
    isPureImage: false,
    title: "Choice List",
    titleAccent: "Optimizer",
    typingPhrase: "Choose Better",
    desc: "Enter your rank and category. Our optimizer ranks colleges by real admission probability — built from years of historical cutoff patterns.",
    tag: "INSTITUTE HUB · SMART TOOL",
    badge: "AI Powered",
    bgImage: "/img4.png",
    theme: "interactive",
    mockUi: { title: "Choice Optimizer", course: "Rank-Based Matching", pool: "Probability Engine", closing: "Top 25", trend: "High Accuracy" },
    stats: [{ label: "Colleges Mapped", value: "600+" }, { label: "Match Accuracy", value: "95%+" }],
  },
  {
    id: 4,
    view: "upgrade",
    isPureImage: false,
    title: "Upgrade Checker",
    titleAccent: "Round 2 Probability",
    typingPhrase: "Make Data-Driven Decisions",
    desc: "Already allotted a seat? Find your realistic upgrade chances for Round 2 based on seat-movement data across all previous rounds.",
    tag: "INSTITUTE HUB · ROUND 2",
    badge: "New",
    bgImage: "/img5.png",
    theme: "interactive",
    mockUi: { title: "Upgrade Checker", course: "Round 1 → Round 2", pool: "Movement Data", closing: "Live", trend: "+62% Avg Upgrade" },
    stats: [{ label: "Rounds Tracked", value: "5" }, { label: "Data Points", value: "50K+" }],
  },
  {
    id: 5,
    view: "state-analytics",
    isPureImage: false,
    title: "State Cutoffs",
    titleAccent: "Quota Seat Data",
    typingPhrase: "Find Your State Seat",
    desc: "State-wise NEET cutoffs for state quota, management and NRI seats — with domicile rules and category-wise breakdowns included.",
    tag: "INSTITUTE HUB · STATE QUOTA",
    badge: "Verified",
    bgImage: "/img6.png",
    theme: "interactive",
    mockUi: { title: "State Quota Pool", course: "85% State Seats", pool: "Domicile Based", closing: "Varies", trend: "State-Wise Trends" },
    stats: [{ label: "States Covered", value: "28+" }, { label: "Colleges", value: "300+" }],
  },
  {
    id: 6,
    view: "aiims-hub",
    isPureImage: false,
    title: "National AIIMS",
    titleAccent: "Seat Data Hub",
    typingPhrase: "Track Every AIIMS",
    desc: "Deep-dive into seat allocation across all 21 AIIMS institutes nationwide. Map your score to your dream AIIMS with historical accuracy.",
    tag: "INSTITUTE HUB · AIIMS NETWORK",
    badge: "100% Verified",
    bgImage: "/img7.png",
    theme: "primary",
    mockUi: { title: "MAMC New Delhi", course: "MBBS (5.5 Years)", pool: "Open Pool", closing: "90", trend: "Highly Competitive" },
    stats: [{ label: "AIIMS Nodes", value: "21" }, { label: "Rounds", value: "5" }],
  },
  {
    id: 7,
    view: "college-db",
    isPureImage: false,
    title: "College",
    titleAccent: "Database",
    typingPhrase: "Browse 600+ Colleges",
    desc: "Complete directory of medical colleges across India — fees, seat matrix, NIRF ranking, infrastructure and affiliations in one searchable database.",
    tag: "RESOURCES · DATABASE",
    badge: "600+ Colleges",
    bgImage: "/img1.png",
    theme: "primary",
    mockUi: { title: "College Directory", course: "Govt + Deemed + Private", pool: "Full India Map", closing: "600+", trend: "Regularly Refreshed" },
    stats: [{ label: "Colleges Listed", value: "600+" }, { label: "Data Fields", value: "20+" }],
  },
  {
    id: 8,
    view: "counselling",
    isPureImage: false,
    title: "Counselling",
    titleAccent: "Guide",
    typingPhrase: "Navigate Counselling",
    desc: "New to NEET counselling? Understand MCC, State and Deemed rounds step by step — registration, choice filling, locking and seat acceptance.",
    tag: "RESOURCES · STEP-BY-STEP GUIDE",
    badge: "Beginner Friendly",
    bgImage: "/banner1.jpg",
    theme: "primary",
    mockUi: { title: "Counselling Guide", course: "MCC · State · Deemed", pool: "All Rounds Covered", closing: "Step-by-Step", trend: "Beginner Friendly" },
    stats: [{ label: "Guide Sections", value: "12+" }, { label: "FAQs Answered", value: "100+" }],
  },
  {
    id: 9,
    view: "predictor",
    isPureImage: false,
    title: "Rank",
    titleAccent: "Predictor",
    typingPhrase: "Predict Your Rank",
    desc: "Enter your expected NEET score and instantly estimate your All India Rank using a model trained on multiple years of result and percentile data.",
    tag: "RESOURCES · SCORE TO RANK",
    badge: "New",
    bgImage: "/img2.jpg",
    theme: "primary",
    mockUi: { title: "Score → Rank Engine", course: "AI Prediction Model", pool: "Multi-Year Trained", closing: "Instant", trend: "Live Calibration" },
    stats: [{ label: "Years of Data", value: "5+" }, { label: "Prediction Accuracy", value: "90%+" }],
  },
  {
    id: 10,
    view: "about-us",
    isPureImage: false,
    title: "About",
    titleAccent: "RankSetu",
    typingPhrase: "Built For Aspirants",
    desc: "RankSetu was born from the confusion students face during counselling — scattered PDFs, no clarity, high stakes. We built the clarity aspirants deserve.",
    tag: "RESOURCES · OUR STORY",
    badge: "Our Mission",
    bgImage: "/img3.png",
    theme: "primary",
    mockUi: { title: "From the Founder", course: "\u201cClarity for every aspirant\u201d", pool: "Our Mission", closing: "2024", trend: "Built By Aspirants" },
    stats: [{ label: "Aspirants Helped", value: "1.4L+" }, { label: "Founded", value: "2024" }],
  },
  {
    id: 11,
    view: "timeline",
    isPureImage: false,
    title: "NEET Counselling",
    titleAccent: "Timeline 2026",
    typingPhrase: "Never Miss a Deadline",
    desc: "Track registration dates, choice-filling windows, seat allotment results and reporting deadlines for MCC, State and AYUSH counselling.",
    tag: "COUNSELLING TIMELINE",
    badge: "Live Updates",
    bgImage: "/img4.png",
    theme: "interactive",
    mockUi: { title: "Counselling Timeline", course: "All Rounds Tracked", pool: "MCC + State + AYUSH", closing: "Live", trend: "Auto-Updated" },
    stats: [{ label: "Key Dates", value: "30+" }, { label: "Rounds Tracked", value: "5" }],
  },
];

// ── Theme config ───────────────────────────────────────────────────────────────
const THEMES = {
  primary: {
    tagText:         "text-[#1A3C6E] dark:text-[#93B4DC]",
    tagBorder:       "border-[#1A3C6E]/40",
    tagBg:           "bg-[#1A3C6E]/10",
    accentText:      "text-[#2563EB]",
    accentTextLight: "text-[#1A3C6E]",
    dot:             "bg-[#1A3C6E]",
    topLine:         "from-[#1A3C6E] via-[#2563EB] to-[#1A3C6E]",
    cardBorder:      "border-[#1A3C6E]/20",
    trendBg:         "bg-[#1A3C6E]/15 text-[#1A3C6E] border-[#1A3C6E]/30",
    trendBgLight:    "bg-[#1A3C6E]/10 text-[#1A3C6E] border-[#1A3C6E]/30",
    statText:        "text-[#2563EB]",
    statTextLight:   "text-[#1A3C6E]",
    pip:             "bg-[#1A3C6E]",
    separatorColor:  "via-[#1A3C6E]/50",
    separatorDot:    "bg-[#1A3C6E]",
  },
  interactive: {
    tagText:         "text-[#2563EB] dark:text-[#93C5FD]",
    tagBorder:       "border-[#2563EB]/40",
    tagBg:           "bg-[#2563EB]/10",
    accentText:      "text-[#2563EB]",
    accentTextLight: "text-[#2563EB]",
    dot:             "bg-[#2563EB]",
    topLine:         "from-[#2563EB] via-[#1A3C6E] to-[#2563EB]",
    cardBorder:      "border-[#2563EB]/20",
    trendBg:         "bg-[#2563EB]/15 text-[#2563EB] border-[#2563EB]/30",
    trendBgLight:    "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/30",
    statText:        "text-[#2563EB]",
    statTextLight:   "text-[#2563EB]",
    pip:             "bg-[#2563EB]",
    separatorColor:  "via-[#2563EB]/50",
    separatorDot:    "bg-[#2563EB]",
  },
};

// ── Main HeroSlider ────────────────────────────────────────────────────────────
export default function HeroSlider({ darkMode, setCurrentView }) {
  const [current, setCurrent]                 = useState(0);
  const [displayedTitle, setDisplayedTitle]   = useState("");
  const [displayedAccent, setDisplayedAccent] = useState("");
  const [displayedDesc, setDisplayedDesc]     = useState("");
  const [accentVisible, setAccentVisible]     = useState(false);
  const [descVisible, setDescVisible]         = useState(false);
  const [cursorPhase, setCursorPhase]         = useState("title"); // "title" | "accent" | "desc" | "done"
  const [imgLoaded, setImgLoaded]             = useState(false);
  const [cardKey, setCardKey]                 = useState(0);
  const timersRef                             = useRef([]);

  const slide = SLIDES[current];
  const tc    = THEMES[slide.theme] || THEMES.primary;

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => { clearInterval(t); clearTimeout(t); });
    timersRef.current = [];
  };

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

  // Full typing animation: title → accent → desc
  useEffect(() => {
    clearAllTimers();
    setDisplayedTitle("");
    setDisplayedAccent("");
    setDisplayedDesc("");
    setAccentVisible(false);
    setDescVisible(false);
    setCursorPhase("title");

    const title  = slide.title || "";
    const accent = slide.titleAccent || "";
    const desc   = slide.desc || "";

    const TITLE_SPEED  = 36;
    const ACCENT_SPEED = 36;
    const DESC_SPEED   = 12;

    let i = 0;

    // Phase 1: type title
    const t1 = setInterval(() => {
      i++;
      setDisplayedTitle(title.substring(0, i));
      if (i >= title.length) {
        clearInterval(t1);

        // Phase 2: pause → type accent
        const p1 = setTimeout(() => {
          setCursorPhase("accent");
          setAccentVisible(true);
          let j = 0;
          const t2 = setInterval(() => {
            j++;
            setDisplayedAccent(accent.substring(0, j));
            if (j >= accent.length) {
              clearInterval(t2);

              // Phase 3: pause → type desc
              const p2 = setTimeout(() => {
                setCursorPhase("desc");
                setDescVisible(true);
                let k = 0;
                const t3 = setInterval(() => {
                  k++;
                  setDisplayedDesc(desc.substring(0, k));
                  if (k >= desc.length) {
                    clearInterval(t3);
                    setCursorPhase("done");
                  }
                }, DESC_SPEED);
                timersRef.current.push(t3);
              }, 120);
              timersRef.current.push(p2);
            }
          }, ACCENT_SPEED);
          timersRef.current.push(t2);
        }, 100);
        timersRef.current.push(p1);
      }
    }, TITLE_SPEED);
    timersRef.current.push(t1);

    return () => clearAllTimers();
  }, [current]);

  // Auto-advance — longer interval so typing animation completes
  useEffect(() => {
    const loop = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 11000);
    return () => clearInterval(loop);
  }, []);

  const goTo = (idx) => { if (idx !== current) setCurrent((idx + SLIDES.length) % SLIDES.length); };
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const handleExplore = () => {
    if (!slide.view || !setCurrentView) return;
    const targetView = slide.view === "home" ? "analytics" : slide.view;
    setCurrentView(targetView);
  };

  return (
    <div className="mb-4 -mt-4 relative w-auto mx-1 sm:-mx-8 lg:-mx-16 xl:-mx-26 z-20">

      {/* ── Main Slider ───────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden min-h-[520px] shadow-2xl border flex items-center
        ${darkMode
          ? "border-white/10 shadow-black/60"
          : "border-[#1A3C6E]/20 shadow-slate-400/20"
        }`}>

        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className={`absolute inset-0 ${darkMode ? "bg-[#0A0F19]" : "bg-[#F9FAFC]"}`} />
          {slide.bgImage && (
            <img
              key={slide.bgImage}
              src={slide.bgImage}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-opacity duration-700
                ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}
          {/* Gradient overlay — slightly stronger for better readability */}
          {darkMode ? (
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(105deg, rgba(10,15,25,0.97) 0%, rgba(10,15,25,0.90) 35%, rgba(10,15,25,0.65) 58%, rgba(10,15,25,0.22) 78%, rgba(10,15,25,0.05) 100%)" }}
            />
          ) : (
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(105deg, rgba(249,250,252,0.98) 0%, rgba(249,250,252,0.93) 35%, rgba(249,250,252,0.68) 58%, rgba(249,250,252,0.20) 78%, rgba(249,250,252,0.02) 100%)" }}
            />
          )}
          <div className="absolute inset-0"
            style={{
              background: darkMode
                ? "linear-gradient(180deg, rgba(10,15,25,0.30) 0%, transparent 20%, transparent 80%, rgba(10,15,25,0.45) 100%)"
                : "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, transparent 18%, transparent 80%, rgba(0,0,0,0.08) 100%)"
            }}
          />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-14 py-10">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">

            {/* Left: Text */}
            <div key={`content-${current}`} className="flex-1 space-y-5 w-full text-left py-8">

              {/* Tag + Badge — official style: sharp corners, formal label */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] border-l-2 pl-3 pr-3 py-1.5 uppercase
                  ${darkMode
                    ? `border-[#2563EB] bg-[#1A3C6E]/15 ${tc.tagText}`
                    : `border-[#1A3C6E] bg-[#1A3C6E]/06 text-[#1A3C6E]`
                  }`}>
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 animate-pulse ${darkMode ? "bg-[#2563EB]" : "bg-[#1A3C6E]"}`} />
                  {slide.tag}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1.5 border tracking-widest uppercase
                  ${darkMode
                    ? "bg-transparent border-slate-600 text-slate-400"
                    : "bg-transparent border-slate-400/60 text-slate-500"
                  }`}>
                  {slide.badge}
                </span>
              </div>

              {/* Title — typed character by character */}
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.12] min-h-[3.5rem]
                ${darkMode ? "text-white" : "text-[#0D1F3C]"}`}
                style={{ textShadow: darkMode ? "0 2px 20px rgba(0,0,0,0.8)" : "0 1px 8px rgba(255,255,255,0.9)", fontFamily: "'Georgia', 'Times New Roman', serif" }}>
                <span>{displayedTitle}</span>
                {accentVisible && (
                  <>
                    {" "}
                    <span className={darkMode ? "text-[#60A5FA]" : "text-[#2563EB]"}>
                      {displayedAccent}
                      {/* Blinking cursor on accent while typing accent */}
                      {cursorPhase === "accent" && (
                        <span className={`inline-block w-[3px] h-[0.85em] ml-0.5 align-middle ${darkMode ? "bg-[#60A5FA]" : "bg-[#2563EB]"}`}
                          style={{ animation: "blink 0.7s step-end infinite" }} />
                      )}
                    </span>
                  </>
                )}
                {/* Blinking cursor on title while typing title */}
                {cursorPhase === "title" && (
                  <span className={`inline-block w-[3px] h-[0.85em] ml-0.5 align-middle ${darkMode ? "bg-white" : "bg-[#0D1F3C]"}`}
                    style={{ animation: "blink 0.7s step-end infinite" }} />
                )}
              </h1>

              {/* Description — typed, shown after title+accent done */}
              <div className="min-h-[3.5rem]">
                {descVisible && (
                  <p className={`text-sm lg:text-[0.95rem] max-w-lg leading-relaxed font-medium
                    ${darkMode ? "text-slate-300" : "text-slate-600"}`}
                    style={{ textShadow: darkMode ? "0 1px 12px rgba(0,0,0,0.9)" : "0 1px 6px rgba(255,255,255,0.95)" }}>
                    {displayedDesc}
                    {cursorPhase === "desc" && (
                      <span className={`inline-block w-[2px] h-[1em] ml-0.5 align-middle ${darkMode ? "bg-slate-300" : "bg-slate-600"}`}
                        style={{ animation: "blink 0.7s step-end infinite" }} />
                    )}
                  </p>
                )}
              </div>

              {/* Blink keyframe injected once */}
              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

              {/* Trust chips — official rectangular style */}
              <div className={`flex flex-wrap gap-2 pt-1 transition-opacity duration-300
                ${cursorPhase === "done" ? "opacity-100" : "opacity-0"}`}>
                {[
                  { icon: ShieldCheck, text: "MCC Structured Blueprint" },
                  { icon: Milestone,   text: "Auto-Calculated V-Ranks" },
                  { icon: Zap,         text: "Zero Cost Access" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 border
                    ${darkMode
                      ? "border-slate-700 bg-slate-900/70 text-slate-300"
                      : "border-slate-300 bg-white/85 text-slate-700"
                    }`}>
                    <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${darkMode ? "text-[#60A5FA]" : "text-[#1A3C6E]"}`} />
                    {text}
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className={`flex flex-wrap items-center gap-3 pt-1 transition-opacity duration-300
                ${cursorPhase === "done" ? "opacity-100" : "opacity-0"}`}>
                <button
                  onClick={handleExplore}
                  className="group inline-flex items-center gap-2.5 text-sm font-bold px-6 py-2.5 text-white transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer uppercase tracking-widest"
                  style={{ backgroundColor: '#1A3C6E', letterSpacing: '0.1em' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563EB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1A3C6E'; }}
                >
                  View {slide.titleAccent || slide.title}
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>
                {/* <button
                  onClick={() => setCurrentView?.("home")}
                  className={`inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 border uppercase tracking-widest transition-all duration-150 cursor-pointer
                    ${darkMode
                      ? "border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white"
                      : "border-slate-400 text-slate-600 hover:border-[#1A3C6E] hover:text-[#1A3C6E]"
                    }`}>
                  All Tools
                </button> */}
              </div>

              {/* Pip progress — square ticks, official */}
              <div className="flex items-center gap-1.5 pt-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`h-1 transition-all duration-500 cursor-pointer
                      ${i === current
                        ? `w-6 ${tc.pip}`
                        : `w-2.5 ${darkMode ? "bg-white/20 hover:bg-white/35" : "bg-[#1A3C6E]/15 hover:bg-[#1A3C6E]/30"}`
                      }`}
                  />
                ))}
                <span className={`ml-2 text-xs font-bold font-mono tracking-widest ${darkMode ? "text-white/30" : "text-[#1A3C6E]/30"}`}>
                  {String(current + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Right: Telemetry Card */}
            <div className="hidden lg:flex w-full lg:w-[300px] justify-center lg:justify-end">
              <div
                key={`card-${cardKey}`}
                role={slide.view ? "button" : undefined}
                tabIndex={slide.view ? 0 : undefined}
                onClick={() => slide.view && setCurrentView?.(slide.view === "home" ? "analytics" : slide.view)}
                onKeyDown={(e) => { if (slide.view && (e.key === "Enter" || e.key === " ")) setCurrentView?.(slide.view === "home" ? "analytics" : slide.view); }}
                className={`w-full max-w-[290px] border overflow-hidden backdrop-blur-2xl shadow-2xl transition-transform duration-200
                  ${slide.view ? "cursor-pointer hover:scale-[1.02] active:scale-[0.99]" : ""}
                  ${darkMode
                    ? `bg-slate-950/60 ${tc.cardBorder} shadow-black/50`
                    : "bg-white/80 border-[#1A3C6E]/20 shadow-slate-300/40"
                  }`}>
                <div className={`h-0.5 w-full bg-gradient-to-r ${tc.topLine}`} />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-xs font-bold tracking-[0.18em] uppercase mb-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Live Data Node</p>
                      <p className={`font-bold text-sm leading-snug ${darkMode ? "text-white" : "text-[#1A3C6E]"}`}>{slide.mockUi.title}</p>
                    </div>
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-1 animate-pulse ${tc.dot}`} />
                  </div>
                  <p className={`text-sm font-bold ${darkMode ? tc.accentText : tc.accentTextLight}`}>
                    {slide.mockUi.course}
                    <span className={`mx-1.5 ${darkMode ? "text-slate-600" : "text-slate-300"}`}>•</span>
                    <span className={darkMode ? "text-slate-300" : "text-slate-700"}>{slide.mockUi.pool}</span>
                  </p>
                  <div className={`flex items-center justify-between px-3 py-2 border
                    ${darkMode ? "bg-slate-900/60 border-white/6" : "bg-slate-50/90 border-slate-200/60"}`}>
                    <span className={`text-xs font-bold tracking-widest uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Archival Cutoff</span>
                    <span className={`font-mono font-bold text-xs ${darkMode ? tc.accentText : tc.accentTextLight}`}>#{slide.mockUi.closing}</span>
                  </div>
                  <div className={`flex items-center justify-between px-3 py-2 border
                    ${darkMode ? "bg-slate-900/60 border-white/6" : "bg-slate-50/90 border-slate-200/60"}`}>
                    <span className={`text-xs font-bold tracking-widest uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Analysis Engine</span>
                    <span className={`text-xs font-bold px-2 py-0.5 border
                      ${darkMode ? tc.trendBg : tc.trendBgLight}`}>
                      {slide.mockUi.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {slide.stats.map((s, i) => (
                      <div key={i} className={`px-3 py-2 border text-center
                        ${darkMode ? "bg-slate-900/40 border-white/5" : "bg-slate-50/80 border-slate-200/50"}`}>
                        <p className={`font-bold text-sm ${darkMode ? tc.statText : tc.statTextLight}`}>{s.value}</p>
                        <p className={`text-[8px] font-bold uppercase tracking-wide mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {slide.view && (
                    <div className={`flex items-center justify-between pt-1 mt-1 border-t ${darkMode ? "border-white/6" : "border-slate-200/60"}`}>
                      <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? "text-slate-500" : "text-slate-400"}`}>View Details</span>
                      <ChevronRight className={`h-3.5 w-3.5 ${darkMode ? tc.accentText : tc.accentTextLight}`} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nav Buttons — square, official */}
        <div className="absolute right-5 bottom-5 flex items-center gap-1.5 z-20">
          <button
            onClick={prev}
            className={`p-2.5 border transition-all duration-150 hover:opacity-80 active:scale-95 cursor-pointer
              ${darkMode
                ? "bg-slate-900/80 border-slate-700 text-slate-300"
                : "bg-white/90 border-[#1A3C6E]/30 text-[#1A3C6E]"
              }`}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className={`p-2.5 border transition-all duration-150 hover:opacity-80 active:scale-95 cursor-pointer
              ${darkMode
                ? "bg-slate-900/80 border-slate-700 text-slate-300"
                : "bg-white/90 border-[#1A3C6E]/30 text-[#1A3C6E]"
              }`}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Live Badge — official, formal */}
      <div className="flex justify-center -mt-5 relative z-30">
        <span className={`inline-flex items-center gap-2.5 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] border shadow-xl
          ${darkMode
            ? "bg-[#0A0F19] border-slate-700 text-slate-300 shadow-black/50"
            : "bg-white border-[#1A3C6E]/25 text-[#1A3C6E] shadow-slate-200/60"
          }`}>
          <span className="h-1.5 w-1.5 bg-[#1A3C6E] animate-pulse" />
          Active Data Pipelines:
          <span className="font-mono font-black">1,45,230 Records Synced</span>
          <span className={`h-3 w-px ${darkMode ? "bg-slate-600" : "bg-[#1A3C6E]/30"}`} />
          <span className={darkMode ? "text-[#60A5FA]" : "text-[#2563EB]"}>Live</span>
        </span>
      </div>

    </div>
  );
}