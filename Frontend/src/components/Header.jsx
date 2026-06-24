'use client';

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle } from "lucide-react";

// ── RankSetu Logo — Living 3D Helix-Bridge mark ───────────────────────────────
// The helix is the centerpiece: a 3D-shaded double spine with depth-scaled
// rungs, a slow combined rotation+drift+float motion (not a single-axis spin),
// a soft pulse traveling through the strands, and small particles riding the
// strand paths via native SVG animateMotion — read as "data/insight flowing
// through the structure" rather than decoration. Bridge deck is fused through
// the helix core. CSS drives the outer motion (GPU, cheap); SVG-native
// animateMotion drives the particles (no JS per-frame work either way).

let __rsLogoStyleInjected = false;
function ensureRsLogoStyles() {
  if (__rsLogoStyleInjected || typeof document === 'undefined') return;
  __rsLogoStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rsHelixSpin3D {
      0%   { transform: rotateY(-18deg) rotateX(5deg)  translateZ(0px); }
      28%  { transform: rotateY(6deg)   rotateX(-3deg) translateZ(4px); }
      52%  { transform: rotateY(20deg)  rotateX(2deg)  translateZ(0px); }
      76%  { transform: rotateY(-4deg)  rotateX(4deg)  translateZ(-3px); }
      100% { transform: rotateY(-18deg) rotateX(5deg)  translateZ(0px); }
    }
    @keyframes rsFloat {
      0%, 100% { transform: translateY(0px) scale(1); }
      50%      { transform: translateY(-3px) scale(1.008); }
    }
    @keyframes rsLightSweep {
      0%   { transform: translate(-14%, -10%) rotate(0deg);  opacity: 0.5; }
      50%  { transform: translate(14%, 10%)  rotate(8deg);  opacity: 0.85; }
      100% { transform: translate(-14%, -10%) rotate(0deg);  opacity: 0.5; }
    }
    @keyframes rsGlowPulse {
      0%, 100% { opacity: 0.42; transform: scale(1); }
      50%      { opacity: 0.78; transform: scale(1.08); }
    }
    @keyframes rsStrandPulse {
      0%   { stroke-opacity: 0.65; }
      50%  { stroke-opacity: 1; }
      100% { stroke-opacity: 0.65; }
    }
    .rs-logo-wrap {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: transform 320ms cubic-bezier(.2,.8,.2,1);
    }
    .rs-logo-wrap:hover {
      transform: scale(1.05);
    }
    .rs-logo-icon {
      position: relative;
      width: 46px;
      height: 46px;
      flex-shrink: 0;
      perspective: 280px;
    }
    .rs-logo-glow {
      position: absolute;
      inset: -10px;
      border-radius: 18px;
      background: radial-gradient(circle, rgba(37,99,235,0.40) 0%, rgba(37,99,235,0) 70%);
      filter: blur(6px);
      animation: rsGlowPulse 4.2s ease-in-out infinite;
      transition: opacity 320ms ease, filter 320ms ease;
      pointer-events: none;
    }
    .rs-logo-wrap:hover .rs-logo-glow {
      opacity: 1 !important;
      filter: blur(10px);
    }
    .rs-logo-float {
      width: 100%;
      height: 100%;
      animation: rsFloat 6.4s ease-in-out infinite;
    }
    .rs-logo-box {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 13px;
      box-shadow:
        0 4px 14px rgba(8,16,32,0.32),
        inset 0 1px 0 rgba(255,255,255,0.10),
        inset 0 -9px 18px rgba(0,0,0,0.20);
      overflow: hidden;
      transition: box-shadow 320ms ease;
    }
    .rs-logo-wrap:hover .rs-logo-box {
      box-shadow:
        0 6px 20px rgba(8,16,32,0.40),
        inset 0 1px 0 rgba(255,255,255,0.14),
        inset 0 -9px 18px rgba(0,0,0,0.22);
    }
    .rs-logo-spin3d {
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
      animation: rsHelixSpin3D 12s ease-in-out infinite;
      transition: filter 320ms ease;
    }
    .rs-logo-wrap:hover .rs-logo-spin3d {
      filter: drop-shadow(0 0 4px rgba(91,156,255,0.65));
    }
    .rs-logo-strand-front {
      animation: rsStrandPulse 3.4s ease-in-out infinite;
    }
    .rs-logo-sheen {
      position: absolute;
      inset: -25%;
      background: radial-gradient(ellipse 55% 40% at 50% 50%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 65%);
      animation: rsLightSweep 7s ease-in-out infinite;
      mix-blend-mode: screen;
      pointer-events: none;
    }
    .rs-logo-particle {
      transition: opacity 320ms ease;
    }
    .rs-logo-wrap:hover .rs-logo-particle {
      opacity: 1 !important;
    }
    .rs-wordmark-rank, .rs-wordmark-setu {
      font-family: 'Poppins','Inter',Arial,sans-serif;
      font-weight: 800;
      font-size: 22px;
      letter-spacing: 0.15px;
      line-height: 1;
    }
    .rs-wordmark-tag {
      font-family: 'Inter',Arial,sans-serif;
      font-weight: 600;
      font-size: 9px;
      letter-spacing: 0.16em;
      margin-top: 3px;
    }
    @media (prefers-reduced-motion: reduce) {
      .rs-logo-float, .rs-logo-spin3d, .rs-logo-glow, .rs-logo-sheen,
      .rs-logo-strand-front { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// Perspective-scaled helix rungs: depth parameter drives x-swing, ellipse
// width and opacity, so near rungs read wide/bright and far rungs read
// narrow/dim — the thing that actually sells "3D" rather than a flat ribbon.
function buildHelixRungs() {
  const N = 7;
  const rungs = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const depth = Math.sin(t * Math.PI * 2.1);
    const cx = 23 + depth * 7.2;
    const cy = 11 + t * 24;
    const rx = 8.2 - Math.abs(depth) * 2.4;
    const front = depth > 0;
    rungs.push({ cx, cy, rx, front, depth, i });
  }
  return rungs;
}

function RsHelixBridgeLogo({ dark }) {
  useEffect(() => { ensureRsLogoStyles(); }, []);

  const rungs = buildHelixRungs();
  const gid = dark ? 'd' : 'l';
  const spinePath = `M ${rungs.map(r => `${r.cx} ${r.cy}`).join(' L ')}`;

  const navyTop    = dark ? '#16335E' : '#22507F';
  const navyBase   = dark ? '#0A0F19' : '#1A3C6E';
  const cableFront  = '#2563EB';
  const cableBack   = dark ? '#5B86D6' : '#9DB7E8';
  const particleCol = '#5B9CFF';

  return (
    <div className="rs-logo-wrap">
      <div className="rs-logo-icon">
        <div className="rs-logo-glow" />
        <div className="rs-logo-float">
          <div className="rs-logo-box" style={{
            background: `linear-gradient(150deg, ${navyTop} 0%, ${navyBase} 65%)`,
          }}>
            <div className="rs-logo-sheen" />

            <div className="rs-logo-spin3d">
              <svg width="46" height="46" viewBox="0 0 46 46" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <linearGradient id={`rsSpineBack-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={cableBack} stopOpacity="0.85" />
                    <stop offset="100%" stopColor={navyBase} stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id={`rsSpineFront-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#5B9CFF" />
                    <stop offset="55%" stopColor={cableFront} />
                    <stop offset="100%" stopColor="#163E8F" />
                  </linearGradient>
                  <radialGradient id={`rsRungShine-${gid}`} cx="35%" cy="30%" r="75%">
                    <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="40%" stopColor="#BFDBFE" stopOpacity="0.55" />
                    <stop offset="100%" stopColor={cableFront} stopOpacity="0.15" />
                  </radialGradient>
                  <radialGradient id={`rsParticleGlow-${gid}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="1" />
                    <stop offset="55%" stopColor={particleCol} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={particleCol} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Back spine — drawn behind the rungs */}
                <path
                  id={`rsSpinePathBack-${gid}`}
                  d={spinePath}
                  fill="none" stroke={`url(#rsSpineBack-${gid})`} strokeWidth="2.3"
                  strokeLinecap="round" strokeLinejoin="round" opacity="0.55"
                />

                {/* Bridge deck — fused straight through the helix core */}
                <line x1="6" y1="35.5" x2="40" y2="35.5"
                  stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="2.4" strokeLinecap="round" />
                <line x1="10" y1="35.5" x2="10" y2="23" stroke={cableBack} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="36" y1="35.5" x2="36" y2="23" stroke={cableBack} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />

                {/* Front spine — the path particles ride, bright + pulsing */}
                <path
                  id={`rsSpinePathFront-${gid}`}
                  className="rs-logo-strand-front"
                  d={spinePath}
                  fill="none" stroke={`url(#rsSpineFront-${gid})`} strokeWidth="2.6"
                  strokeLinecap="round" strokeLinejoin="round"
                />

                {/* Depth-scaled rungs */}
                {rungs.map((r) => (
                  <ellipse
                    key={r.i}
                    cx={r.cx} cy={r.cy}
                    rx={Math.max(1.4, r.rx)} ry="1.55"
                    fill={r.front ? `url(#rsRungShine-${gid})` : cableBack}
                    opacity={r.front ? 0.95 : 0.45}
                    transform={`rotate(${r.depth * 18} ${r.cx} ${r.cy})`}
                  />
                ))}

                {/* Apex highlight — where "Rank" enters the structure */}
                <circle cx={rungs[0].cx} cy={rungs[0].cy} r="2.1" fill="#FFFFFF" opacity="0.9" />
                <circle cx={rungs[0].cx} cy={rungs[0].cy} r="3.6" fill="#5B9CFF" opacity="0.22" />

                {/* ── Data-flow particles — travel along the front spine path ── */}
                <circle r="1.6" fill={`url(#rsParticleGlow-${gid})`} className="rs-logo-particle" opacity="0.85">
                  <animateMotion dur="2.6s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#rsSpinePathFront-${gid}`} />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.15;0.85;1" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle r="1.3" fill={`url(#rsParticleGlow-${gid})`} className="rs-logo-particle" opacity="0.7">
                  <animateMotion dur="2.6s" begin="0.9s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#rsSpinePathFront-${gid}`} />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;0.75;0.75;0" keyTimes="0;0.15;0.85;1" dur="2.6s" begin="0.9s" repeatCount="indefinite" />
                </circle>
                <circle r="1.1" fill={`url(#rsParticleGlow-${gid})`} className="rs-logo-particle" opacity="0.55">
                  <animateMotion dur="2.6s" begin="1.8s" repeatCount="indefinite" rotate="auto">
                    <mpath href={`#rsSpinePathFront-${gid}`} />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;0.6;0.6;0" keyTimes="0;0.15;0.85;1" dur="2.6s" begin="1.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            {/* SMG badge pill */}
            <svg width="46" height="46" viewBox="0 0 46 46" style={{ position: 'absolute', inset: 0 }}>
              <rect x="6" y="38.3" width="34" height="11" rx="4" fill="#0A1428" />
              <rect x="6" y="38.3" width="34" height="11" rx="4" fill="none" stroke="#2563EB" strokeWidth="1.1" />
              <text x="23" y="45" textAnchor="middle" fontFamily="Segoe UI, Arial, sans-serif"
                fontSize="7" fontWeight="700" fill="#BFDBFE">SMG</text>
            </svg>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="rs-wordmark-rank" style={{ color: dark ? '#F9FAFC' : '#0A0F19' }}>Rank</span>
          <span className="rs-wordmark-setu" style={{ color: dark ? '#5B9CFF' : '#1A3C6E', marginLeft: '1px' }}>Setu</span>
        </div>
        <span className="rs-wordmark-tag" style={{ color: dark ? '#2563EB' : '#5C7AA8' }}>
          NEET COUNSELLING
        </span>
      </div>
    </div>
  );
}

const RankSetuLogo     = () => <RsHelixBridgeLogo dark={false} />;
const RankSetuLogoDark = () => <RsHelixBridgeLogo dark={true} />;

// ── Icons ─────────────────────────────────────────────────────────────────────
const SvgIcon = ({ name, color, size = 16 }) => {
  const icons = {
    home:     ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"],
    clock:    ["M12 2a10 10 0 100 20A10 10 0 0012 2z", "M12 6v6l4 2"],
    sliders:  ["M4 21V14","M4 10V3","M12 21V12","M12 8V3","M20 21V16","M20 12V3","M1 14h6","M9 8h6","M17 16h6"],
    bar:      ["M18 20V10","M12 20V4","M6 20V14"],
    pin:      ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z","M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0"],
    award:    ["M12 2a6 6 0 100 12A6 6 0 0012 2z","M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"],
    file:     ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"],
    users:    ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M9 3a4 4 0 010 8","M16 3.13a4 4 0 010 7.75"],
    activity: ["M22 12h-4l-3 9L9 3l-3 9H2"],
    sun:      ["M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42","M12 7a5 5 0 100 10A5 5 0 0012 7z"],
    moon:     ["M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"],
    menu:     ["M3 12h18","M3 6h18","M3 18h18"],
    close:    ["M18 6L6 18","M6 6l12 12"],
    chevron:  ["M6 9l6 6 6-6"],
    heart:    ["M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"],
    leaf:     ["M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z","M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"],
    check:    ["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01 9 11.01"],
  };
  const d = icons[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || "currentColor"} strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
};

// ── Nav Data ──────────────────────────────────────────────────────────────────
// Tools dropdown — ye sab counselling decisions ke tools hain
const HUB_ITEMS = [
  { view: "optimizer",       icon: "sliders", color: "#1A3C6E", label: "Choice Optimizer",  sub: "Best college order for your rank" },
  { view: "upgrade",         lucideIcon: ArrowUpCircle, color: "#1A3C6E", label: "Upgrade Checker", sub: "Round 2 seat upgrade probability", badge: "New" },
  { view: "state-analytics", icon: "pin",     color: "#1A3C6E", label: "State Quota Cutoffs", sub: "State seat allotment rank data" },
  
];

// OR-CR dropdown — previous year rank data
const OR_CR_ITEMS = [
  {
    view: "analytics",
    icon: "bar",
    color: "#1A3C6E",
    label: "MCC Counselling Ranks",
    sub: "AIQ opening & closing ranks, all rounds",
    badge: "Updated",
  },
  {
    view: "ayush",
    icon: "leaf",
    color: "#1A3C6E",
    label: "Ayush Counselling Ranks",
    sub: "BAMS, BHMS & BUMS seat cutoff data",
    badge: "New",
  },
  { view: "aiims-hub",       icon: "award",   color: "#1A3C6E", label: "AIIMS Cutoffs",    sub: "All-India AIIMS campus rank data" },
];

// Resources dropdown
const RESOURCE_ITEMS = [
  { view: "college-db",   icon: "file",     color: "#1A3C6E", label: "College Directory",  sub: "600+ medical colleges, fees & seats" },
  { view: "counselling",  icon: "users",    color: "#1A3C6E", label: "Counselling Process", sub: "Round-wise allotment & joining steps" },
  { view: "predictor",    icon: "activity", color: "#047857", label: "Rank Predictor",      sub: "Expected NEET rank from your score", badge: "New" },
  { view: "about-us",     icon: "heart",    color: "#1A3C6E", label: "About RankSetu",      sub: "Our mission & the team" },
];

// Category label text shown in the dropdown's official header strip
const GROUP_INFO = {
  "OR CR":     "Previous Year Cutoffs",
  "Tools":     "Smart Counselling Tools",
  "Resources": "Guides & College Data",
};


// ── Live Dot ──────────────────────────────────────────────────────────────────
const LiveDot = ({ darkMode }) => (
  <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 bg-blue-400 ${darkMode ? "shadow-[0_0_0_2.5px_#0F2952]" : "shadow-[0_0_0_2.5px_#DBEAFE]"}`} />
);

// ── Dropdown Item ─────────────────────────────────────────────────────────────
const DropdownItem = ({ item, darkMode, setCurrentView, onClose }) => (
  <div
    onClick={() => { setCurrentView(item.view); onClose(); }}
    className={`group flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-100 border-b last:border-b-0 ${
      darkMode
        ? "border-white/5 hover:bg-[#1A3C6E]/20"
        : "border-slate-100 hover:bg-[#EEF2F8]"
    }`}
  >
    <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
      darkMode ? "bg-[#1A3C6E]/40" : "bg-[#1A3C6E]/8"
    }`}>
      {item.lucideIcon
        ? <item.lucideIcon size={14} color={darkMode ? "#93C5FD" : "#1A3C6E"} strokeWidth={2} />
        : <SvgIcon name={item.icon} color={darkMode ? "#93C5FD" : "#1A3C6E"} size={14} />
      }
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-[12.5px] font-semibold leading-tight tracking-tight ${darkMode ? "text-slate-100" : "text-[#0F1C33]"}`}>{item.label}</div>
      <div className={`text-[11px] mt-0.5 leading-snug ${darkMode ? "text-slate-500" : "text-slate-500"}`}>{item.sub}</div>
    </div>
    {item.badge && (
      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0 tracking-wider uppercase ${
        darkMode ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-[#1A3C6E]/10 text-[#1A3C6E] border border-[#1A3C6E]/20"
      }`}>{item.badge}</span>
    )}
  </div>
);

// ── Desktop Dropdown ──────────────────────────────────────────────────────────
const DesktopDropdown = ({ label, description, items, darkMode, setCurrentView, currentView, activeViews }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const isActive = activeViews.includes(currentView);

  const handleMouseEnter = () => { clearTimeout(timerRef.current); setOpen(true); };
  const handleMouseLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 100); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={`ms-navpill flex items-center gap-1 h-9 px-4 text-[13px] font-semibold cursor-pointer border-none font-sans transition-all duration-100 tracking-tight ${
        isActive
          ? darkMode
            ? "text-blue-400 border-b-2 border-blue-400 rounded-none bg-transparent"
            : "text-[#1A3C6E] border-b-2 border-[#1A3C6E] rounded-none bg-transparent"
          : darkMode
            ? open
              ? "text-white border-b-2 border-white/30 rounded-none bg-transparent"
              : "text-slate-400 rounded-none bg-transparent hover:text-slate-200 border-b-2 border-transparent"
            : open
              ? "text-[#1A3C6E] border-b-2 border-[#1A3C6E]/40 rounded-none bg-transparent"
              : "text-slate-600 rounded-none bg-transparent hover:text-[#1A3C6E] border-b-2 border-transparent"
      }`}>
        {label}
        <SvgIcon
          name="chevron"
          size={11}
          color={isActive ? (darkMode ? "#60A5FA" : "#1A3C6E") : (darkMode ? "#64748b" : "#94a3b8")}
        />
      </button>

      {open && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 rounded border z-50 overflow-hidden ${
          darkMode
            ? "bg-[#10151F] border-[#1A3C6E]/40 shadow-[0_6px_24px_rgba(0,0,0,0.6)]"
            : "bg-white border-[#C5D4E8] shadow-[0_4px_20px_rgba(26,60,110,0.15)]"
        }`} style={{width: '272px'}}>
          {/* Official header bar */}
          <div className={`px-3.5 py-2 border-b ${
            darkMode ? "bg-[#1A3C6E]/25 border-[#1A3C6E]/30" : "bg-[#1A3C6E] border-[#1A3C6E]"
          }`}>
            <span className={`text-[10.5px] font-bold uppercase tracking-widest ${darkMode ? "text-blue-300" : "text-white"}`}>{label}</span>
          </div>
          <div className="flex flex-col">
            {items.map((item) => (
              <DropdownItem
                key={item.view}
                item={item}
                darkMode={darkMode}
                setCurrentView={setCurrentView}
                onClose={() => setOpen(false)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Mobile Link ───────────────────────────────────────────────────────────────
const MobileLink = ({ icon, iconColor, label, badge, darkMode, onClick }) => (
  <div onClick={onClick}
    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-100"}`}>
    <SvgIcon name={icon} color={iconColor} size={17} />
    <span className={`text-sm font-semibold flex-1 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{label}</span>
    {badge && <span className={`text-sm font-bold px-2 py-0.5 rounded ${darkMode ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700"}`}>{badge}</span>}
  </div>
);

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header({ currentView, setCurrentView, darkMode, setDarkMode, showToast }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dm = darkMode;

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
      dm ? "bg-[#0B0F19]/98 border-[#1A3C6E]/30 backdrop-blur-sm" : "bg-white border-[#C5D4E8]"
    }`}>
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── LOGO ── */}
        <div className="ms-logo flex-shrink-0 cursor-pointer" onClick={() => setCurrentView("home")}>
          {dm ? <RankSetuLogoDark /> : <RankSetuLogo />}
        </div>

        {/* ── DESKTOP CENTER NAV ── */}
        <div className="ms-nav-center absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
          <button
            className={`ms-navpill flex items-center gap-1 h-9 px-4 text-[13px] font-semibold border-none font-sans cursor-pointer transition-all duration-100 tracking-tight border-b-2 ${
              currentView === "home"
                ? dm ? "text-blue-400 border-blue-400 bg-transparent rounded-none" : "text-[#1A3C6E] border-[#1A3C6E] bg-transparent rounded-none"
                : dm ? "text-slate-400 border-transparent bg-transparent rounded-none hover:text-slate-200" : "text-slate-600 border-transparent bg-transparent rounded-none hover:text-[#1A3C6E]"
            }`}
            onClick={() => setCurrentView("home")}
          >
            <SvgIcon name="home" size={13} />
            Home
          </button>

          <DesktopDropdown
            label="OR-CR"
            description={GROUP_INFO["OR CR"]}
            items={OR_CR_ITEMS}
            darkMode={dm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            activeViews={["analytics", "state-analytics", "ayush"]}
          />

          <DesktopDropdown
            label="Tools"
            description={GROUP_INFO["Tools"]}
            items={HUB_ITEMS}
            darkMode={dm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            activeViews={["optimizer", "upgrade", "aiims-hub"]}
          />

          <DesktopDropdown
            label="Resources"
            description={GROUP_INFO["Resources"]}
            items={RESOURCE_ITEMS}
            darkMode={dm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            activeViews={["college-db", "counselling", "predictor", "about-us"]}
          />

          <button
            className={`ms-navpill flex items-center gap-1 h-9 px-4 text-[13px] font-semibold border-none font-sans cursor-pointer transition-all duration-100 tracking-tight border-b-2 ${
              currentView === "timeline"
                ? dm ? "text-blue-400 border-blue-400 bg-transparent rounded-none" : "text-[#1A3C6E] border-[#1A3C6E] bg-transparent rounded-none"
                : dm ? "text-slate-400 border-transparent bg-transparent rounded-none hover:text-slate-200" : "text-slate-600 border-transparent bg-transparent rounded-none hover:text-[#1A3C6E]"
            }`}
            onClick={() => setCurrentView("timeline")}
          >
            <SvgIcon name="clock" size={13} />
            Timeline
          </button>
        </div>

        {/* ── DESKTOP RIGHT ── */}
        <div className="ms-desktop-right flex items-center gap-2 flex-shrink-0">
          <button
            className={`ms-iconbtn w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-150 border ${
              dm ? "border-white/7 bg-white/4 text-yellow-400 hover:bg-white/8" : "border-black/8 bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            onClick={() => setDarkMode(!dm)}
            title={dm ? "Light mode" : "Dark mode"}
          >
            <SvgIcon name={dm ? "sun" : "moon"} size={15} />
          </button>

          <button
            className="flex items-center gap-1.5 h-9 px-4 rounded-sm bg-[#1A3C6E] hover:bg-[#0F2952] text-white text-[12.5px] font-semibold border-none font-sans cursor-pointer transition-colors duration-150 whitespace-nowrap tracking-tight"
            onClick={() => showToast?.("Connecting with live medical counselling support...")}
          >
            <LiveDot darkMode={dm} />
            Live Support
          </button>
        </div>

        {/* ── MOBILE RIGHT ── */}
        <div className="ms-mobile-right hidden items-center gap-2 flex-shrink-0">
          <button
            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border ${
              dm ? "border-white/7 bg-white/4 text-yellow-400" : "border-black/8 bg-slate-100 text-slate-600"
            }`}
            onClick={() => setDarkMode(!dm)}
          >
            <SvgIcon name={dm ? "sun" : "moon"} size={15} />
          </button>

          <button
            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border ${
              dm ? "border-white/7 bg-white/4 text-slate-300" : "border-black/8 bg-slate-100 text-slate-600"
            }`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <SvgIcon name={mobileOpen ? "close" : "menu"} size={18} />
          </button>
        </div>
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className={`ms-mobile-drawer px-4 pb-6 pt-3 border-t ${dm ? "border-[#1A3C6E]/30" : "border-[#C5D4E8]"}`}>
          <MobileLink icon="home"  iconColor={dm ? "#94a3b8" : "#64748b"} label="Home"     darkMode={dm} onClick={() => { setCurrentView("home"); setMobileOpen(false); }} />
          <MobileLink icon="clock" iconColor={dm ? "#94a3b8" : "#64748b"} label="Timeline" darkMode={dm} onClick={() => { setCurrentView("timeline"); setMobileOpen(false); }} />

          <div className="mt-2">
            <div className={`text-[10px] font-bold uppercase tracking-widest px-3 pt-2 pb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}>OR-CR</div>

            <div className={`pl-1 border-l-2 ml-3 ${dm ? "border-white/7" : "border-black/8"}`}>
              {OR_CR_ITEMS.map(item => (
                <MobileLink key={item.view} icon={item.icon} iconColor={item.color}
                  label={item.label} badge={item.badge} darkMode={dm}
                  onClick={() => { setCurrentView(item.view); setMobileOpen(false); }}
                />
              ))}
            </div>
          </div>

          <div className="mt-2">
            <div className={`text-[10px] font-bold uppercase tracking-widest px-3 pt-2 pb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}>Tools</div>

            <div className={`pl-1 border-l-2 ml-3 ${dm ? "border-white/7" : "border-black/8"}`}>
              {HUB_ITEMS.map(item => (
                item.lucideIcon ? (
                  <div key={item.view} onClick={() => { setCurrentView(item.view); setMobileOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${dm ? "hover:bg-white/5" : "hover:bg-slate-100"}`}>
                    <item.lucideIcon size={17} color={item.color} strokeWidth={2} />
                    <span className={`text-sm font-semibold flex-1 ${dm ? "text-slate-200" : "text-slate-800"}`}>{item.label}</span>
                    {item.badge && <span className={`text-sm font-bold px-2 py-0.5 rounded ${dm ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700"}`}>{item.badge}</span>}
                  </div>
                ) : (
                  <MobileLink key={item.view} icon={item.icon} iconColor={item.color}
                    label={item.label} badge={item.badge} darkMode={dm}
                    onClick={() => { setCurrentView(item.view); setMobileOpen(false); }}
                  />
                )
              ))}
            </div>
          </div>

          <div className="mt-2">
            <div className={`text-[10px] font-bold uppercase tracking-widest px-3 pt-2 pb-1 ${dm ? "text-slate-500" : "text-slate-400"}`}>Resources</div>

            <div className={`pl-1 border-l-2 ml-3 ${dm ? "border-white/7" : "border-black/8"}`}>
              {RESOURCE_ITEMS.map(item => (
                <MobileLink key={item.view} icon={item.icon} iconColor={item.color}
                  label={item.label} badge={item.badge} darkMode={dm}
                  onClick={() => { setCurrentView(item.view); setMobileOpen(false); }}
                />
              ))}
            </div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 h-11 rounded-sm mt-4 bg-[#1A3C6E] hover:bg-[#0F2952] text-white text-sm font-semibold border-none font-sans cursor-pointer transition-colors tracking-tight"
            onClick={() => { setMobileOpen(false); showToast?.("Connecting with live medical counselling support..."); }}
          >
            <LiveDot darkMode={dm} />
            Live Support
          </button>
        </div>
      )}
    </header>
  );
}