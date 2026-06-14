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

// ── RankSetu Logo Canvas (same as Header) ─────────────────────────────────────
const CYCLE = 4800, BUILD = 3200;

function rsDrawLogo(ctx, dark, p, W = 220, H = 56) {
  ctx.clearRect(0, 0, W, H);
  ctx.save();

  const cl  = v => Math.min(1, Math.max(0, v));
  const seg = (s, e) => cl((p - s) / (e - s));
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function bounce(t) {
    if (t < 1/2.75)   return 7.5625*t*t;
    if (t < 2/2.75) { t -= 1.5/2.75;  return 7.5625*t*t + 0.75; }
    if (t < 2.5/2.75){ t -= 2.25/2.75; return 7.5625*t*t + 0.9375; }
    t -= 2.625/2.75;  return 7.5625*t*t + 0.984375;
  }

  function rr(x, y, w, h, r, fill, stroke, sw) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
    ctx.arcTo(x+w, y,   x+w, y+r,   r); ctx.lineTo(x+w, y+h-r);
    ctx.arcTo(x+w, y+h, x+w-r, y+h, r); ctx.lineTo(x+r, y+h);
    ctx.arcTo(x,   y+h, x,   y+h-r, r); ctx.lineTo(x,   y+r);
    ctx.arcTo(x,   y,   x+r, y,     r); ctx.closePath();
    if (fill)   { ctx.fillStyle = fill;   ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw || 1; ctx.stroke(); }
  }

  const BX=0, BY=5, BS=46;
  const DY  = BY+38;
  const TX1 = BX+13, TX2 = BX+33;
  const APX = BX+23, APY = BY+13;
  const TWH = DY - (BY+20);
  const TTY = BY+20;

  // Icon box
  rr(BX, BY, BS, BS, 11, '#1A3C6E');
  ctx.beginPath();
  ctx.moveTo(BX+11, BY+1); ctx.lineTo(BX+BS-11, BY+1);
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 1; ctx.stroke();

  // 1. Deck
  const dP = seg(0, 0.22);
  if (dP > 0) {
    const x0 = BX+4, x1 = BX+4+(BS-8)*dP;
    ctx.beginPath(); ctx.moveTo(x0, DY); ctx.lineTo(x1, DY);
    ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2.5; ctx.lineCap='butt'; ctx.stroke();
  }

  // 2. Towers
  const tP = seg(0.10, 0.26);
  if (tP > 0) {
    [TX1, TX2].forEach(tx => {
      const topY = DY - TWH*tP;
      ctx.beginPath(); ctx.moveTo(tx, DY); ctx.lineTo(tx, topY);
      ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2.8; ctx.lineCap='butt'; ctx.stroke();
      if (tP > 0.7) {
        const ca = (tP-0.7)/0.3;
        ctx.fillStyle = `rgba(255,255,255,${ca})`;
        ctx.fillRect(tx-3, topY-3, 6, 3);
      }
    });
  }

  // 3. Main cables
  const aP = seg(0.20, 0.52);
  if (aP > 0) {
    [
      { x0:TX1, y0:TTY, cx:BX+5,  cy:TTY-3, x1:APX, y1:APY },
      { x0:TX2, y0:TTY, cx:BX+41, cy:TTY-3, x1:APX, y1:APY },
    ].forEach(({ x0, y0, cx, cy, x1, y1 }) => {
      const steps=40, endI=Math.round(aP*steps);
      ctx.beginPath();
      for (let i=0; i<=endI; i++) {
        const t=i/steps, mt=1-t;
        const px=mt*mt*x0+2*mt*t*cx+t*t*x1;
        const py=mt*mt*y0+2*mt*t*cy+t*t*y1;
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
      }
      ctx.strokeStyle='#FFFFFF'; ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
    });
  }

  // 4. Hangers
  [BX+8, TX1, APX, TX2, BX+38].forEach((hx, i) => {
    const hp = seg(0.36+i*0.022, 0.52+i*0.022);
    if (hp > 0) {
      const norm = Math.abs(hx-APX)/(TX2-APX);
      const cabY = APY + (TTY-APY)*norm*norm;
      ctx.beginPath(); ctx.moveTo(hx, cabY); ctx.lineTo(hx, cabY+(DY-cabY)*hp);
      ctx.strokeStyle='#7DD3FC'; ctx.lineWidth=1.2; ctx.lineCap='butt'; ctx.stroke();
    }
  });

  // 5. SMG badge
  const smgP = seg(0.48, 0.64);
  if (smgP > 0) {
    ctx.save(); ctx.globalAlpha = easeOut(smgP);
    const PW=34, PH=11, PX=BX+(BS-PW)/2, PY=BY+BS-PH-2;
    rr(PX, PY, PW, PH, 4, '#0A1E3D');
    rr(PX, PY, PW, PH, 4, null, '#2563EB', 1.2);
    ctx.font='700 7px "Segoe UI",Arial,sans-serif';
    ctx.fillStyle='#BFDBFE';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const mY = PY+PH/2+0.5;
    ctx.fillText('U', PX+6, mY);
    ctx.fillText('M', PX+17, mY);
    ctx.fillText('A', PX+28, mY);
    ctx.restore();
  }

  // 6. Apex star
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

  // 7. Orbit dot
  const op = seg(0.62, 1.0);
  if (op > 0) {
    const angle = -Math.PI/2 + op*Math.PI*3.5;
    for (let t=4; t>=0; t--) {
      const ta=angle-t*0.16;
      const ox=APX+8*Math.cos(ta), oy=APY+8*Math.sin(ta);
      const al=t===0 ? Math.max(0.75, 0.75+0.25*Math.sin(op*Math.PI*10)) : (0.32-t*0.07)*op;
      ctx.save(); ctx.globalAlpha=Math.max(0,al);
      ctx.beginPath(); ctx.arc(ox, oy, t===0?2:1.2-t*0.2, 0, Math.PI*2);
      ctx.fillStyle='#93C5FD'; ctx.fill(); ctx.restore();
    }
  }

  // 8. "Rank"
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

  // 9. Dot divider
  const dotP = seg(0.72, 0.80);
  if (dotP > 0) {
    ctx.save(); ctx.globalAlpha=dotP;
    ctx.beginPath(); ctx.arc(BX+BS+73, BY+24, 2.2, 0, Math.PI*2);
    ctx.fillStyle = dark ? '#3B82F6' : '#1A3C6E'; ctx.fill();
    ctx.restore();
  }

  // 10. "Setu"
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

  // 11. Tagline
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

function useRsLogo(dark) {
  const ref      = useRef(null);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
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

// ── Footer Logo wrapper (replaces old RankSetu static logo) ─────────────────
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
  { value: "15L+",  label: "NEET Records" },
  { value: "28",    label: "States Covered" },
  { value: "99.9%", label: "Data Accuracy" },
];

const SOCIALS = [
  { icon: "instagram", title: "Instagram", hoverColor: "#E1306C", url: "https://www.instagram.com/umash.ankar8?igsh=c2I5aGRwZzcydGI2" },
  { icon: "linkedin",  title: "LinkedIn",  hoverColor: "#0A66C2", url: "https://www.linkedin.com/in/umashankar-kushwaha-2a06a02ba?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
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
              { icon: "phone", text: "+91 0000000000" },
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