'use client';

import React, { useState, useRef, useEffect } from "react";

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
const Icon = ({ paths, size = 16, color = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {paths.map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const IC = {
  shield:    ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  instagram: ["M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z","M17.5 6.5h.01","M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z"],
  linkedin:  ["M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z","M2 9h4v12H2z","M4 6a2 2 0 100-4 2 2 0 000 4z"],
  youtube:   ["M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z","M9.75 15.02l5.75-3.02-5.75-3.02v6.04z"],
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  phone:     ["M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.64A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"],
  map:       ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z","M12 10m-3 0a3 3 0 106 0 3 3 0 00-6 0"],
  heart:     ["M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"],
  check:     ["M20 6L9 17l-5-5"],
  arrowR:    ["M5 12h14","M12 5l7 7-7 7"],
  star:      ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
};

// ── RankSetu Logo — Living DNA Helix-Bridge mark (same as Header) ────────────
function buildStrandPoints(phase, amp = 7.6, cx = 23, top = 7, bottom = 39, steps = 36) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = top + t * (bottom - top);
    const angle = t * Math.PI * 2.4 + phase;
    const x = cx + amp * Math.sin(angle);
    const z = Math.cos(angle);
    pts.push({ x, y, z, t });
  }
  return pts;
}

function smoothPath(pts) {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} L ${pts[1].x.toFixed(2)} ${pts[1].y.toFixed(2)}`;
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} `;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d.trim();
}

function splitByDepth(pts) {
  const segments = [];
  let current = null;
  pts.forEach((p, i) => {
    const isFront = p.z > 0;
    if (!current || current.front !== isFront) {
      const seed = current ? [current.pts[current.pts.length - 1]] : [];
      current = { front: isFront, pts: [...seed, p] };
      segments.push(current);
    } else {
      current.pts.push(p);
    }
  });
  return segments;
}

let __rsLogoStyleInjected = false;
function ensureRsLogoStyles() {
  if (__rsLogoStyleInjected || typeof document === 'undefined') return;
  __rsLogoStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rsFloat {
      0%, 100% { transform: translateY(0px); }
      50%      { transform: translateY(-3px); }
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
    .rs-logo-helix-svg {
      position: absolute;
      inset: 0;
      transition: filter 320ms ease;
    }
    .rs-logo-wrap:hover .rs-logo-helix-svg {
      filter: drop-shadow(0 0 4px rgba(91,156,255,0.65));
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
      .rs-logo-float, .rs-logo-glow, .rs-logo-sheen { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

function RsHelixBridgeLogo({ dark }) {
  useEffect(() => { ensureRsLogoStyles(); }, []);

  const gid = dark ? 'd' : 'l';
  const [phase, setPhase] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    let last = performance.now();
    const SPEED = 0.5;
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setPhase((p) => (p + dt * SPEED) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const strandA = buildStrandPoints(phase);
  const strandB = buildStrandPoints(phase + Math.PI);

  const segA = splitByDepth(strandA);
  const segB = splitByDepth(strandB);

  const rungCount = 11;
  const rungs = Array.from({ length: rungCount }, (_, k) => {
    const idx = Math.round((k / (rungCount - 1)) * (strandA.length - 1));
    return { a: strandA[idx], b: strandB[idx], i: idx };
  });

  const navyTop     = dark ? '#16335E' : '#22507F';
  const navyBase    = dark ? '#0A0F19' : '#1A3C6E';
  const backCol     = dark ? '#3D5C99' : '#7E9BCB';
  const frontCol    = '#2563EB';
  const particleCol = '#5B9CFF';

  const particleStrand = strandA.filter((p) => p.z > 0).length >= strandB.filter((p) => p.z > 0).length
    ? strandA : strandB;
  const frontPathD = smoothPath(particleStrand);
  const apex = strandA[0].y <= strandB[0].y ? strandA[0] : strandB[0];

  return (
    <div className="rs-logo-wrap">
      <div className="rs-logo-icon">
        <div className="rs-logo-glow" />
        <div className="rs-logo-float">
          <div className="rs-logo-box" style={{
            background: `linear-gradient(150deg, ${navyTop} 0%, ${navyBase} 65%)`,
          }}>
            <div className="rs-logo-sheen" />

            <svg className="rs-logo-helix-svg" width="46" height="46" viewBox="0 0 46 46">
              <defs>
                <linearGradient id={`rsFrontGrad-${gid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor="#8FC1FF" />
                  <stop offset="45%" stopColor={frontCol} />
                  <stop offset="100%" stopColor="#163E8F" />
                </linearGradient>
                <linearGradient id={`rsBackGrad-${gid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={backCol} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={navyBase} stopOpacity="0.7" />
                </linearGradient>
                <radialGradient id={`rsRungShine-${gid}`} cx="35%" cy="30%" r="80%">
                  <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.98" />
                  <stop offset="50%" stopColor="#BFDBFE" stopOpacity="0.7" />
                  <stop offset="100%" stopColor={frontCol} stopOpacity="0.15" />
                </radialGradient>
                <radialGradient id={`rsParticleGlow-${gid}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="1" />
                  <stop offset="55%" stopColor={particleCol} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={particleCol} stopOpacity="0" />
                </radialGradient>
              </defs>

              <line x1="6" y1="36.5" x2="40" y2="36.5"
                stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="2.3" strokeLinecap="round" />
              <line x1="10" y1="36.5" x2="10" y2="30" stroke={backCol} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="36" y1="36.5" x2="36" y2="30" stroke={backCol} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />

              {[...segA, ...segB].filter((s) => !s.front).map((s, i) => (
                <path key={`back-${i}`} d={smoothPath(s.pts)} fill="none"
                  stroke={`url(#rsBackGrad-${gid})`} strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              ))}

              {rungs.map((r) => {
                const depth = Math.max(r.a.z, r.b.z);
                const w = 0.9 + Math.max(0, depth) * 1.1;
                const op = 0.32 + Math.max(0, depth) * 0.62;
                const bright = depth > 0.05;
                return (
                  <line key={`rung-${r.i}`}
                    x1={r.a.x} y1={r.a.y} x2={r.b.x} y2={r.b.y}
                    stroke={bright ? `url(#rsRungShine-${gid})` : backCol}
                    strokeWidth={w}
                    strokeOpacity={op}
                    strokeLinecap="round"
                  />
                );
              })}

              {[...segA, ...segB].filter((s) => s.front).map((s, i) => (
                <path key={`front-${i}`} d={smoothPath(s.pts)} fill="none"
                  stroke={`url(#rsFrontGrad-${gid})`} strokeWidth="2.7"
                  strokeLinecap="round" strokeLinejoin="round" />
              ))}

              <circle cx={apex.x} cy={apex.y} r="1.9" fill="#FFFFFF" opacity="0.92" />
              <circle cx={apex.x} cy={apex.y} r="3.6" fill="#5B9CFF" opacity="0.22" />

              <circle r="1.5" fill={`url(#rsParticleGlow-${gid})`} className="rs-logo-particle" opacity="0.85">
                <animateMotion path={frontPathD} dur="3.2s" repeatCount="indefinite" rotate="auto" />
                <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.15;0.85;1" dur="3.2s" repeatCount="indefinite" />
              </circle>
              <circle r="1.2" fill={`url(#rsParticleGlow-${gid})`} className="rs-logo-particle" opacity="0.65">
                <animateMotion path={frontPathD} dur="3.2s" begin="1.1s" repeatCount="indefinite" rotate="auto" />
                <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.15;0.85;1" dur="3.2s" begin="1.1s" repeatCount="indefinite" />
              </circle>
            </svg>

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

// ── Footer Logo wrapper ───────────────────────────────────────────────────────
const FooterLogo = ({ darkMode: dm }) => (
  <div className="mb-4">
    {dm ? <RankSetuLogoDark /> : <RankSetuLogo />}
  </div>
);

// ── Stat Badge ────────────────────────────────────────────────────────────────
const StatBadge = ({ value, label, dm }) => (
  <div className={`flex flex-col items-center py-5 px-5 rounded-md flex-1 min-w-[110px] border relative overflow-hidden ${
    dm ? "bg-blue-500/8 border-blue-500/20" : "bg-blue-50/80 border-blue-200/60"
  }`}>
    <div className="absolute top-0 left-1/5 right-1/5 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-b" />
    <span className={`text-[26px] font-bold font-mono tracking-tight leading-tight ${dm ? "text-blue-400" : "text-primary"}`}>{value}</span>
    <span className={`text-[11.5px] font-medium mt-1.5 text-center ${dm ? "text-slate-400" : "text-slate-500"}`}>{label}</span>
  </div>
);

// ── Social Button ─────────────────────────────────────────────────────────────
const SocialBtn = ({ icon, title: ttl, hoverColor, dm, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button title={ttl} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200"
      style={{
        border: `1px solid ${hov ? hoverColor+"55" : (dm ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)")}`,
        background: hov ? hoverColor+"15" : (dm ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
        color: hov ? hoverColor : (dm ? "#93C5FD" : "#1A3C6E"),
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? `0 4px 12px ${hoverColor}22` : "none",
      }}>
      <Icon paths={IC[icon]} size={15} color="currentColor" />
    </button>
  );
};

// ── Footer Link ───────────────────────────────────────────────────────────────
const FooterLink = ({ label, badge, dm, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <li>
      <button onClick={onClick}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="flex items-center gap-2 text-[13.5px] font-normal bg-transparent border-none cursor-pointer py-1.5 px-0 font-sans transition-all duration-150"
        style={{
          color: hov ? "#2563EB" : (dm ? "#94a3b8" : "#4B5563"),
          transform: hov ? "translateX(4px)" : "none",
        }}>
        <span className="w-1 h-1 rounded-full flex-shrink-0 transition-all duration-150"
          style={{ background: hov ? "#2563EB" : (dm ? "#334155" : "#CBD5E1") }} />
        {label}
        {badge && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white tracking-wide">{badge}</span>
        )}
      </button>
    </li>
  );
};

// ── Navigation Data ───────────────────────────────────────────────────────────
const NAV_LINKS = {
  "Platform": [
    { label: "Choice Optimizer",  view: "optimizer" },
    { label: "All India Cutoffs", view: "cutoffTable" },
    { label: "State Cutoffs",     view: "state-analytics" },
    { label: "National AIIMS",    view: "aiims-hub" },
  ],
  "Resources": [
    { label: "College Database",  view: "college-db" },
    { label: "Counselling Guide", view: "counselling" },
    { label: "Rank Predictor",    view: "predictor", badge: "New" },
    { label: "Timeline",          view: "timeline" },
  ],
  "Company": [
    { label: "About Us",  view: "about-us" },
    { label: "Blog",      view: null },
    { label: "Careers",   view: null },
    { label: "Contact",   view: null },
  ],
};

const STATS = [
  { value: "700+",  label: "Medical Colleges" },
  { value: "50,000+",  label: "NEET Records" },
  { value: "28",    label: "States Covered" },
  { value: "99.9%", label: "Data Accuracy" },
];

const SOCIALS = [
  { icon: "instagram", title: "Instagram", hoverColor: "#E1306C", url: "https://www.instagram.com/umash.ankar8?igsh=c2I5aGRwZzcydGI2" },
  { icon: "linkedin",  title: "LinkedIn",  hoverColor: "#0A66C2", url: "https://www.linkedin.com/in/umashankar-kushwaha-2a06a02ba" },
  { icon: "youtube",   title: "YouTube",   hoverColor: "#FF0000", url: "https://youtube.com/@umashankarkushwaha-uc2jx?si=yPG6F6akpZdTOq_c" },
  { icon: "mail",      title: "Email",     hoverColor: "#2563EB", url: "mailto:hello@ranksetu.com" },
];

const LEGAL = ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"];

// ── Main Footer Component ─────────────────────────────────────────────────────
export default function Footer({ darkMode, showToast, setCurrentView }) {
  const dm = darkMode;
  const textMuted = dm ? "#475569" : "#94A3B8";

  return (
    <footer className={`ms-footer mt-16 border-t ${dm ? "bg-[#07090e] border-white/7" : "bg-[#f2f2ef] border-black/8"}`}>

      <div className="ms-glow-line" />

      {/* Trust bar */}
      <div className={`flex items-center justify-center gap-2.5 py-3 px-6 border-b ${dm ? "border-white/6 bg-blue-900/10" : "border-black/7 bg-blue-50/60"}`}>
        <Icon paths={IC.shield} size={13} color="#2563EB" />
        <span className={`text-xs font-semibold tracking-wide ${dm ? "text-blue-300" : "text-primary"}`}>
          Official data sourced from MCC, NMC & State Counselling Authorities
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary text-white tracking-widest">VERIFIED</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-7 pt-12 pb-9">

        {/* Stats row */}
        <div className="ms-stats-row flex gap-3 flex-wrap mb-14">
          {STATS.map(s => <StatBadge key={s.label} value={s.value} label={s.label} dm={dm} />)}
        </div>

        {/* Main grid */}
        <div className="ms-footer-grid grid gap-10 mb-14"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1.7fr", columnGap: "52px" }}>

          {/* ── Brand Column ── */}
          <div className="ms-footer-brand">
            <FooterLogo darkMode={dm} />

            <p className={`text-[13.5px] leading-relaxed mb-6 max-w-[250px] font-normal ${dm ? "text-slate-400" : "text-text-body"}`}>
              India's most trusted NEET counselling intelligence platform — helping aspirants find their right medical college, faster.
            </p>

            {/* Socials */}
            <div className="flex gap-2 flex-wrap mb-6">
              {SOCIALS.map(s => (
                <SocialBtn key={s.title} icon={s.icon} title={s.title} hoverColor={s.hoverColor} dm={dm}
                  onClick={() => { showToast?.(`Opening ${s.title}...`); window.open(s.url, "_blank", "noopener,noreferrer"); }}
                />
              ))}
            </div>

            {/* Contact */}
            {[
              { icon: "mail",  text: "hello@ranksetu.com" },
    
              { icon: "map",   text: "NIT Hamirpur, India" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 mb-2.5">
                <span className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border ${dm ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200/60"}`}>
                  <Icon paths={IC[icon]} size={12} color="#2563EB" />
                </span>
                <span className={`text-[13px] font-normal ${dm ? "text-slate-400" : "text-text-body"}`}>{text}</span>
              </div>
            ))}
          </div>

          {/* ── Nav Columns ── */}
          {Object.entries(NAV_LINKS).map(([section, links]) => (
            <div key={section}>
              <div className={`text-sm font-bold uppercase tracking-[0.12em] mb-4 pb-3 border-b ${dm ? "text-slate-500 border-white/6" : "text-slate-400 border-black/7"}`}>
                {section}
              </div>
              <ul className="list-none m-0 p-0 flex flex-col">
                {links.map(link => (
                  <FooterLink key={link.label} label={link.label} badge={link.badge} dm={dm}
                    onClick={() => {
                      if (link.view && setCurrentView) setCurrentView(link.view);
                      else showToast?.(`${link.label} coming soon`);
                    }}
                  />
                ))}
              </ul>
            </div>
          ))}

          {/* ── Newsletter ── */}
          <div className="ms-footer-newsletter">
            <div className={`text-sm font-bold uppercase tracking-[0.12em] mb-4 pb-3 border-b ${dm ? "text-slate-500 border-white/6" : "text-slate-400 border-black/7"}`}>
              Stay Updated
            </div>

            <p className={`text-[13.5px] leading-relaxed mb-4 font-normal ${dm ? "text-slate-400" : "text-text-body"}`}>
              Get cutoff alerts & counselling round updates directly in your inbox.
            </p>

            <div className={`rounded-xl overflow-hidden mb-3.5 border ${dm ? "border-blue-500/20 bg-white/3" : "border-blue-200/60 bg-white/80"}`}>
              <input
                type="email"
                className={`ms-nl-input w-full px-3.5 py-3 text-[13.5px] bg-transparent border-none border-b outline-none font-sans ${dm ? "text-slate-100 border-white/7" : "text-slate-800 border-black/7"}`}
                placeholder="your@email.com"
              />
              <button
                onClick={() => showToast?.("Subscribed! You'll receive cutoff alerts soon.")}
                className="w-full py-3 px-3.5 bg-primary hover:bg-interactive text-white border-none cursor-pointer text-[13px] font-semibold font-sans tracking-wide transition-colors duration-150"
              >
                Subscribe to Alerts →
              </button>
            </div>

            {[
              "No spam — unsubscribe anytime",
              "Weekly counselling round alerts",
              "Data from official sources only",
            ].map(t => (
              <div key={t} className="flex items-center gap-2.5 mb-2">
                <span className={`w-4.5 h-4.5 rounded-full flex-shrink-0 flex items-center justify-center border ${dm ? "bg-blue-500/12 border-blue-500/25" : "bg-blue-50 border-blue-200/60"}`}>
                  <Icon paths={IC.check} size={10} color="#2563EB" sw={2.5} />
                </span>
                <span className={`text-[12.5px] font-normal ${dm ? "text-slate-400" : "text-text-body"}`}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px mb-6 ${dm ? "bg-white/6" : "bg-black/7"}`} />

        {/* Bottom bar */}
        <div className="ms-footer-bottom flex items-center justify-between gap-4 flex-wrap">
          <span style={{ color: textMuted }} className="text-[12.5px] font-normal">
            © 2026 RankSetu. All rights reserved.
          </span>

          <div className="flex flex-wrap items-center gap-5">
            {LEGAL.map(item => (
              <button key={item}
                onClick={() => showToast?.(`${item} coming soon`)}
                className="text-[12.5px] bg-none border-none cursor-pointer p-0 font-sans transition-colors duration-150 hover:text-interactive"
                style={{ color: textMuted }}>
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: textMuted }}>
            <span>Made with</span>
            <Icon paths={IC.heart} size={13} color="#E24B4A" fill="#E24B4A" sw={0} />
            <span>by</span>
            <span className={`font-bold tracking-widest text-xs font-sans ${dm ? "text-slate-300" : "text-slate-700"}`}>UMASHANKAR</span>
          </div>
        </div>

      </div>
    </footer>
  );
}