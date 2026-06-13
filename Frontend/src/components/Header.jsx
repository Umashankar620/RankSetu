'use client';

import React, { useState, useRef, useEffect } from "react";
import { ArrowUpCircle } from "lucide-react";

// ── RankSetu Logo — redrawn: sharp bridge, clear SMG badge ────────────────────
const CYCLE = 4800, BUILD = 3200;

function rsDrawLogo(ctx, dark, p, W = 220, H = 56) {
  ctx.clearRect(0, 0, W, H);
  ctx.save();

  const cl  = v => Math.min(1, Math.max(0, v));
  const seg = (s, e) => cl((p - s) / (e - s));
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function bounce(t) {
    if (t < 1/2.75)  return 7.5625*t*t;
    if (t < 2/2.75) { t -= 1.5/2.75;  return 7.5625*t*t + 0.75; }
    if (t < 2.5/2.75){ t -= 2.25/2.75; return 7.5625*t*t + 0.9375; }
    t -= 2.625/2.75; return 7.5625*t*t + 0.984375;
  }

  function rr(x, y, w, h, r, fill, stroke, sw) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.arcTo(x+w, y,   x+w, y+r,   r); ctx.lineTo(x+w, y+h-r);
    ctx.arcTo(x+w, y+h, x+w-r, y+h, r); ctx.lineTo(x+r, y+h);
    ctx.arcTo(x,   y+h, x,   y+h-r, r); ctx.lineTo(x,   y+r);
    ctx.arcTo(x,   y,   x+r, y,     r); ctx.closePath();
    if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
  }

  // Bridge geometry
  const BX=0, BY=5, BS=46;          // icon box
  const DY  = BY+38;                 // deck y
  const TX1 = BX+13, TX2 = BX+33;   // tower x positions
  const APX = BX+23, APY = BY+13;   // arch apex
  const TWH = DY - (BY+20);         // tower height (top at BY+20)
  const TTY = BY+20;                 // tower top y

  // ── Icon box ──────────────────────────────────────────────────────
  rr(BX, BY, BS, BS, 11, '#1A3C6E');
  ctx.beginPath();
  ctx.moveTo(BX+11, BY+1); ctx.lineTo(BX+BS-11, BY+1);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1; ctx.stroke();

  // ── 1. Deck (p 0→0.22) ───────────────────────────────────────────
  const dP = seg(0, 0.22);
  if (dP > 0) {
    const x0 = BX+4, x1 = BX+4 + (BS-8)*dP;
    ctx.beginPath(); ctx.moveTo(x0, DY); ctx.lineTo(x1, DY);
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.5; ctx.lineCap = 'butt'; ctx.stroke();
  }

  // ── 2. Towers (p 0.10→0.26) ──────────────────────────────────────
  const tP = seg(0.10, 0.26);
  if (tP > 0) {
    [TX1, TX2].forEach(tx => {
      const topY = DY - TWH*tP;
      ctx.beginPath(); ctx.moveTo(tx, DY); ctx.lineTo(tx, topY);
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2.8; ctx.lineCap = 'butt'; ctx.stroke();
      if (tP > 0.7) {
        const ca = (tP-0.7)/0.3;
        ctx.fillStyle = `rgba(255,255,255,${ca})`;
        ctx.fillRect(tx-3, topY-3, 6, 3);
      }
    });
  }

  // ── 3. Main cables (p 0.20→0.52) ─────────────────────────────────
  const aP = seg(0.20, 0.52);
  if (aP > 0) {
    [
      { x0:TX1, y0:TTY, cx:BX+5,  cy:TTY-3, x1:APX, y1:APY },
      { x0:TX2, y0:TTY, cx:BX+41, cy:TTY-3, x1:APX, y1:APY },
    ].forEach(({ x0, y0, cx, cy, x1, y1 }) => {
      const steps = 40, endI = Math.round(aP*steps);
      ctx.beginPath();
      for (let i = 0; i <= endI; i++) {
        const t=i/steps, mt=1-t;
        const px=mt*mt*x0+2*mt*t*cx+t*t*x1;
        const py=mt*mt*y0+2*mt*t*cy+t*t*y1;
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
      }
      ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
    });
  }

  // ── 4. Hangers (p 0.36→0.58) ─────────────────────────────────────
  [BX+8, TX1, APX, TX2, BX+38].forEach((hx, i) => {
    const hp = seg(0.36+i*0.022, 0.52+i*0.022);
    if (hp > 0) {
      const norm = Math.abs(hx-APX)/(TX2-APX);
      const cabY = APY + (TTY-APY)*norm*norm;
      ctx.beginPath(); ctx.moveTo(hx, cabY); ctx.lineTo(hx, cabY+(DY-cabY)*hp);
      ctx.strokeStyle='#7DD3FC'; ctx.lineWidth=1.2; ctx.lineCap='butt'; ctx.stroke();
    }
  });

  // ── 5. SMG badge (p 0.48→0.64) — clear, readable ─────────────────
  const smgP = seg(0.48, 0.64);
  if (smgP > 0) {
    const ea = easeOut(smgP);
    ctx.save(); ctx.globalAlpha = ea;
    // pill: 34×11, bottom-center of icon box
    const PW=34, PH=11, PX=BX+(BS-PW)/2, PY=BY+BS-PH-2;
    rr(PX, PY, PW, PH, 4, '#0A1E3D');      // dark navy fill
    rr(PX, PY, PW, PH, 4, null, '#2563EB', 1.2); // blue border
    // letters — spaced clearly
    ctx.font = '700 7px "Segoe UI",Arial,sans-serif';
    ctx.fillStyle = '#BFDBFE';             // light blue — high contrast on dark bg
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const mY = PY + PH/2 + 0.5;
    ctx.fillText('S', PX+6,    mY);
    ctx.fillText('M', PX+17,   mY);
    ctx.fillText('G', PX+28,   mY);
    ctx.restore();
  }

  // ── 6. Apex star (p 0.50→0.66) ───────────────────────────────────
  const sp = seg(0.50, 0.66);
  if (sp > 0) {
    const eb = bounce(sp);
    ctx.save(); ctx.translate(APX, APY); ctx.scale(eb, eb);
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI*2);
    ctx.fillStyle='#3B82F6'; ctx.fill();
    ctx.font='bold 7px Arial'; ctx.fillStyle='#FFFFFF';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('★', 0, 0.5);
    ctx.restore();
  }

  // ── 7. Orbit dot (p 0.62→1.0) ────────────────────────────────────
  const op = seg(0.62, 1.0);
  if (op > 0) {
    const angle = -Math.PI/2 + op*Math.PI*3.5;
    for (let t = 4; t >= 0; t--) {
      const ta = angle - t*0.16;
      const ox = APX+8*Math.cos(ta), oy = APY+8*Math.sin(ta);
      const al = t===0 ? Math.max(0.75, 0.75+0.25*Math.sin(op*Math.PI*10)) : (0.32-t*0.07)*op;
      ctx.save(); ctx.globalAlpha=Math.max(0,al);
      ctx.beginPath(); ctx.arc(ox, oy, t===0?2:1.2-t*0.2, 0, Math.PI*2);
      ctx.fillStyle='#93C5FD'; ctx.fill(); ctx.restore();
    }
  }

  // ── 8. "Rank" (p 0.64→0.76) ──────────────────────────────────────
  const rankP = seg(0.64, 0.76);
  if (rankP > 0) {
    const e = easeOut(rankP);
    ctx.save(); ctx.globalAlpha=e; ctx.translate((e-1)*8, 0);
    ctx.font='800 24px "Arial Black","Syne",Arial,sans-serif';
    ctx.fillStyle = dark ? '#F1F5F9' : '#111827';
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.fillText('Rank', BX+BS+8, BY+31);
    ctx.restore();
  }

  // ── 9. Dot divider (p 0.72→0.80) ─────────────────────────────────
  const dotP = seg(0.72, 0.80);
  if (dotP > 0) {
    ctx.save(); ctx.globalAlpha=dotP;
    ctx.beginPath(); ctx.arc(BX+BS+73, BY+24, 2.2, 0, Math.PI*2);
    ctx.fillStyle = dark ? '#3B82F6' : '#1A3C6E'; ctx.fill();
    ctx.restore();
  }

  // ── 10. "Setu" (p 0.72→0.84) ─────────────────────────────────────
  const setuP = seg(0.72, 0.84);
  if (setuP > 0) {
    const e = easeOut(setuP);
    ctx.save(); ctx.globalAlpha=e; ctx.translate((e-1)*8, 0);
    ctx.font='800 24px "Arial Black","Syne",Arial,sans-serif';
    ctx.fillStyle = dark ? '#60A5FA' : '#1A3C6E';
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.fillText('Setu', BX+BS+82, BY+31);
    ctx.restore();
  }

  // ── 11. Tagline (p 0.84→0.94) ────────────────────────────────────
  const tagP = seg(0.84, 0.94);
  if (tagP > 0) {
    ctx.save(); ctx.globalAlpha=easeOut(tagP);
    ctx.font='600 7px "Segoe UI",Arial,sans-serif';
    ctx.fillStyle = dark ? '#3B82F6' : '#94a3b8';
    ctx.textAlign='left'; ctx.textBaseline='alphabetic';
    ctx.fillText('NEET COUNSELLING', BX+BS+8, BY+43);
    ctx.restore();
  }

  ctx.restore();
}

// ── HiDPI-aware hook ──────────────────────────────────────────────────────────
function useRsLogo(dark) {
  const ref      = useRef(null);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;

    // Setup HiDPI once
    const dpr = window.devicePixelRatio || 1;
    const W = 220, H = 56;
    cv.width  = W * dpr;
    cv.height = H * dpr;
    cv.style.width  = W + 'px';
    cv.style.height = H + 'px';
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) % CYCLE;
      const p = elapsed < BUILD ? elapsed / BUILD : 1;
      rsDrawLogo(ctx, dark, p, W, H);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [dark]);

  return ref;
}

const RankSetuLogo     = () => { const ref = useRsLogo(false); return <canvas ref={ref} width={220} height={56} aria-label="RankSetu" style={{display:'block'}} />; };
const RankSetuLogoDark = () => { const ref = useRsLogo(true);  return <canvas ref={ref} width={220} height={56} aria-label="RankSetu" style={{display:'block'}} />; };

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
const HUB_ITEMS = [
  { view: "optimizer",       icon: "sliders", color: "#2563EB", label: "Choice Optimizer",  sub: "Find your best college match" },
  { view: "upgrade",         lucideIcon: ArrowUpCircle, color: "#7C3AED", label: "Upgrade Checker", sub: "Round 2 upgrade probability", badge: "New" },
  { view: "state-analytics", icon: "pin",     color: "#0369A1", label: "State Cutoffs",     sub: "State quota seat data" },
  { view: "aiims-hub",       icon: "award",   color: "#B45309", label: "National AIIMS",    sub: "Top AIIMS seat data" },
];

const OR_CR_ITEMS = [
  {
    view: "analytics",
    icon: "bar",
    color: "#1A3C6E",
    label: "MCC Opening & Closing",
    sub: "NEET AIQ rank cutoffs — MCC counselling",
    badge: "Updated",
  },
  {
    view: "ayush",
    icon: "leaf",
    color: "#15803D",
    label: "Ayush Opening & Closing",
    sub: "AYUSH counselling rank data",
    badge: "New",
  },
];

const RESOURCE_ITEMS = [
  { view: "college-db",   icon: "file",     color: "#B45309", label: "College Database",  sub: "600+ medical colleges" },
  { view: "counselling",  icon: "users",    color: "#7C3AED", label: "Counselling Guide", sub: "MCC, State, Deemed rounds" },
  { view: "predictor",    icon: "activity", color: "#047857", label: "Rank Predictor",    sub: "Estimate your NEET rank", badge: "New" },
  { view: "about-us",     icon: "heart",    color: "#BE185D", label: "About Us",          sub: "Our mission & founder story" },
];

// ── Live Dot ──────────────────────────────────────────────────────────────────
const LiveDot = ({ darkMode }) => (
  <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 bg-blue-400 ${darkMode ? "shadow-[0_0_0_2.5px_#0F2952]" : "shadow-[0_0_0_2.5px_#DBEAFE]"}`} />
);

// ── Dropdown Item ─────────────────────────────────────────────────────────────
const DropdownItem = ({ item, darkMode, setCurrentView, onClose }) => (
  <div
    onClick={() => { setCurrentView(item.view); onClose(); }}
    className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 ${darkMode ? "hover:bg-white/5" : "hover:bg-slate-100"}`}
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${darkMode ? "border-white/8 bg-white/4" : "border-black/8 bg-slate-50"}`}
      style={{ color: item.color }}>
      {item.lucideIcon
        ? <item.lucideIcon size={16} color={item.color} strokeWidth={2} />
        : <SvgIcon name={item.icon} color={item.color} size={16} />
      }
    </div>
    <div className="flex-1 min-w-0">
      <div className={`text-[13px] font-semibold leading-tight ${darkMode ? "text-slate-100" : "text-slate-800"}`}>{item.label}</div>
      <div className="text-sm text-slate-500 mt-0.5">{item.sub}</div>
    </div>
    {item.badge && (
      <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 flex-shrink-0">{item.badge}</span>
    )}
  </div>
);

// ── Desktop Dropdown ──────────────────────────────────────────────────────────
const DesktopDropdown = ({ label, items, darkMode, setCurrentView, currentView, activeViews }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const isActive = activeViews.includes(currentView);

  const handleMouseEnter = () => { clearTimeout(timerRef.current); setOpen(true); };
  const handleMouseLeave = () => { timerRef.current = setTimeout(() => setOpen(false), 80); };
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button className={`ms-navpill flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold cursor-pointer border-none font-sans transition-all duration-150 ${
        isActive
          ? darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-primary"
          : darkMode ? "bg-transparent text-slate-400" : "bg-transparent text-slate-600"
      } hover:${darkMode ? "bg-white/5 text-white" : "bg-slate-100 text-slate-900"}`}>
        {label}
        <SvgIcon name="chevron" size={12} color={isActive ? (darkMode ? "#60A5FA" : "#1A3C6E") : (darkMode ? "#94a3b8" : "#64748b")} />
      </button>

      {open && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl border shadow-xl z-50 overflow-hidden ${
          darkMode ? "bg-[#141824] border-white/10" : "bg-white border-slate-200"
        }`}>
          <div className="p-2 flex flex-col gap-0.5">
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
    {badge && <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{badge}</span>}
  </div>
);

// ── Header ────────────────────────────────────────────────────────────────────
export default function Header({ currentView, setCurrentView, darkMode, setDarkMode, showToast }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dm = darkMode;

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-300 ${
      dm ? "bg-[#0B0F19]/95 border-white/7 backdrop-blur-md" : "bg-white/95 border-black/8 backdrop-blur-md"
    }`}>
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ── LOGO ── */}
        <div className="ms-logo flex-shrink-0 cursor-pointer" onClick={() => setCurrentView("home")}>
          {dm ? <RankSetuLogoDark /> : <RankSetuLogo />}
        </div>

        {/* ── DESKTOP CENTER NAV ── */}
        <div className="ms-nav-center absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5">
          <button
            className={`ms-navpill flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold border-none font-sans cursor-pointer transition-all duration-150 ${
              currentView === "home"
                ? dm ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-primary"
                : dm ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            onClick={() => setCurrentView("home")}
          >
            <SvgIcon name="home" size={14} />
            Home
          </button>

          <DesktopDropdown
            label="OR CR"
            items={OR_CR_ITEMS}
            darkMode={dm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            activeViews={["analytics", "state-analytics", "ayush"]}
          />

          <DesktopDropdown
            label="Institute Hub"
            items={HUB_ITEMS}
            darkMode={dm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            activeViews={["optimizer", "upgrade", "aiims-hub"]}
          />

          <DesktopDropdown
            label="Resources"
            items={RESOURCE_ITEMS}
            darkMode={dm}
            setCurrentView={setCurrentView}
            currentView={currentView}
            activeViews={["college-db", "counselling", "predictor", "about-us"]}
          />

          <button
            className={`ms-navpill flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold border-none font-sans cursor-pointer transition-all duration-150 ${
              currentView === "timeline"
                ? dm ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-primary"
                : dm ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            onClick={() => setCurrentView("timeline")}
          >
            <SvgIcon name="clock" size={14} />
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
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary hover:bg-interactive text-white text-[13px] font-semibold border-none font-sans cursor-pointer transition-colors duration-150 whitespace-nowrap"
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
        <div className={`ms-mobile-drawer px-4 pb-6 pt-3 border-t ${dm ? "border-white/7" : "border-black/8"}`}>
          <MobileLink icon="home"  iconColor={dm ? "#94a3b8" : "#64748b"} label="Home"     darkMode={dm} onClick={() => { setCurrentView("home"); setMobileOpen(false); }} />
          <MobileLink icon="clock" iconColor={dm ? "#94a3b8" : "#64748b"} label="Timeline" darkMode={dm} onClick={() => { setCurrentView("timeline"); setMobileOpen(false); }} />

          <div className="mt-2">
            <div className={`text-sm font-bold uppercase tracking-widest px-3 py-1.5 ${dm ? "text-slate-500" : "text-slate-400"}`}>OR CR</div>
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
            <div className={`text-sm font-bold uppercase tracking-widest px-3 py-1.5 ${dm ? "text-slate-500" : "text-slate-400"}`}>Institute Hub</div>
            <div className={`pl-1 border-l-2 ml-3 ${dm ? "border-white/7" : "border-black/8"}`}>
              {HUB_ITEMS.map(item => (
                item.lucideIcon ? (
                  <div key={item.view} onClick={() => { setCurrentView(item.view); setMobileOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${dm ? "hover:bg-white/5" : "hover:bg-slate-100"}`}>
                    <item.lucideIcon size={17} color={item.color} strokeWidth={2} />
                    <span className={`text-sm font-semibold flex-1 ${dm ? "text-slate-200" : "text-slate-800"}`}>{item.label}</span>
                    {item.badge && <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">{item.badge}</span>}
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
            <div className={`text-sm font-bold uppercase tracking-widest px-3 py-1.5 ${dm ? "text-slate-500" : "text-slate-400"}`}>Resources</div>
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
            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl mt-4 bg-primary hover:bg-interactive text-white text-sm font-semibold border-none font-sans cursor-pointer transition-colors"
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