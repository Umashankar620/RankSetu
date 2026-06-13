'use client';

import React, { useEffect, useRef, useState } from "react";
import {
  BarChart3, Compass, Layers, Bell, ArrowUpRight, Stethoscope,
  BookOpen, ExternalLink, AlertTriangle, CheckCircle2, Clock,
  FileText, HelpCircle, Star, Users, TrendingUp, Shield, Lightbulb,
  MapPin, Phone, Mail,
} from "lucide-react";

function useCountUp(target, started, duration = 6000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ""));
    let start = null;
    const run = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setVal(p < 1 ? Math.floor(e * num) : num);
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [started, target, duration]);
  return val;
}

function StatPill({ val, suffix, label, started, darkMode }) {
  const count = useCountUp(val, started);
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border text-xs transition
      ${darkMode ? 'bg-slate-800/60 border-slate-600' : 'bg-white border-slate-200'}`}>
      <span className="font-bold text-base text-primary">{count}{suffix}</span>
      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>{label}</span>
    </div>
  );
}

function SectionHead({ tag, icon, title, subtitle, darkMode }) {
  return (
    <div className="mb-8 text-center">
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border
        ${darkMode ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
        {icon}
        {tag}
      </span>
      <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mt-3 leading-tight
        ${darkMode ? 'text-white' : 'text-primary'}`}>
        {title}
      </h2>
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="h-px w-10 bg-primary/50" />
        <div className="h-1 w-1 rounded-full bg-primary" />
        <div className="h-px w-10 bg-primary/50" />
      </div>
      {subtitle && (
        <p className={`text-sm mt-3 max-w-lg mx-auto leading-relaxed ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function Home({ setCurrentView, showToast, darkMode }) {
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setStatsStarted(true);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const features = [
    { id:1, title:"OR-CR Analytics Engine",    icon:<BarChart3 className="h-5 w-5"/>, desc:"Track Opening & Closing rank parameters with high-fidelity sorting algorithms.", action:"analytics", btnText:"Launch Analytics Core", badge:"POPULAR" },
    { id:2, title:"Choice Optimizer Matrix",   icon:<Layers className="h-5 w-5"/>,      desc:"Apna NEET rank aur reservation pool fill karke direct Dream, Target aur Safe medical colleges ki dynamic tracking sequence generate karein.", action:"optimizer", btnText:"Open Optimizer Matrix" },
    { id:3, title:"Choice Filling Simulator",  icon:<Compass className="h-5 w-5"/>,     desc:"Apni custom metrics lagakar up-to-date algorithms ke sath accurate cut-off range check karein.", action:"sandbox", btnText:"Launch Predictor Matrix" },
    { id:4, title:"State Cutoff Matrix",       icon:<Compass className="h-5 w-5"/>,     desc:"Filter medical institutions based on State boundaries. Map opening and closing ranks specific to state counselings instantly.", action:"state-analytics", btnText:"Launch State Core" },
    { id:5, title:"National AIIMS Gateway",    icon:<Stethoscope className="h-5 w-5"/>, desc:"भारत के सभी 24 AIIMS संस्थानों की सीटें, NIRF रैंकिंग और क्लोजिंग रेंक्स का लाइव डेटा स्नैपशॉट।", action:"aiims-hub", btnText:"Explore AIIMS Pool", badge:"POPULAR" },
    { id:6, title:"Timeline Alerts Feed",      icon:<Bell className="h-5 w-5"/>,        desc:"Get high-priority alerts regarding counselling deadlines, seat matrix revisions, and registration windows.", action:null, btnText:"Explore Feature" },
  ];

  const directives = [
    { icon:<AlertTriangle className="h-4 w-4"/>, tag:"CRITICAL", title:"Choice Locking is Irreversible", desc:"Once you lock your choices, no modifications are permitted under any circumstance." },
    { icon:<CheckCircle2 className="h-4 w-4"/>,  tag:"RULE",     title:"Reporting Mandate After Allotment", desc:"Candidates must physically report to the allotted institute within the stipulated window." },
    { icon:<Clock className="h-4 w-4"/>,         tag:"DEADLINE", title:"Document Verification Timeline", desc:"Original documents must be verified at designated centres within 24 hours of allotment." },
    { icon:<FileText className="h-4 w-4"/>,      tag:"GUIDELINE",title:"Stray Vacancy Round Eligibility", desc:"Only candidates who were not allotted any seat in previous rounds, or those who surrendered their seat formally, are eligible." },
  ];

  const expertTips = [
    { num:"01", title:"Register Early, Verify Documents First", desc:"Complete registration and document verification before the deadline." },
    { num:"02", title:"Understand Seat Matrix Before Choice Filling", desc:"Analyze seat availability across categories and colleges." },
    { num:"03", title:"Always Fill Maximum Choices in Preference List", desc:"More choices increase your chance of allotment." },
    { num:"04", title:"Know Your Category & Quota Precisely", desc:"Select the correct category and quota to avoid rejection." },
    { num:"05", title:"Track Round Schedules Without Missing Deadlines", desc:"Set reminders for choice filling, locking, and result declaration." },
    { num:"06", title:"Verify Allotment Letter Before Reporting", desc:"Check all details on the allotment letter before reporting to the college." },
  ];

  const faqs = [
    { q:"How many rounds does MCC NEET UG counselling have?", a:"MCC conducts 4 rounds: Round 1, Round 2, Round 3 (Mop-Up), and Stray Vacancy round." },
    { q:"Can I change my choices after locking?", a:"No, once locked, choices cannot be modified under any circumstances." },
    { q:"What documents are required at reporting?", a:"NEET scorecard, Class 10/12 certificates, category certificate (if applicable), ID proof, and passport-size photographs." },
    { q:"Is RankSetu data updated in real-time?", a:"Yes, we update data immediately after MCC releases official PDFs." },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-16">

      {/* Hero Block */}
      <div className={`relative rounded mb-12 border overflow-hidden
        ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="relative z-10 px-6 sm:px-10 py-12 sm:py-16">
          <div className="mb-5">
            <span className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border
              ${darkMode ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
              </span>
              About RankSetu
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-2
            ${darkMode ? 'text-white' : 'text-primary'}`}>
            Making Medical
          </h1>
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5
            ${darkMode ? 'text-primary' : 'text-primary'}`}>
            Admissions Simple.
          </h1>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-8 bg-primary/50" />
            <div className="h-1 w-1 rounded-full bg-primary" />
            <div className="h-px w-8 bg-primary/50" />
          </div>
          <p className={`text-sm leading-relaxed max-w-xl mb-8 ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>
            India's most trusted NEET counselling platform — transparent, free, and built for every aspirant from every corner of the country.
          </p>
          <div ref={statsRef} className="flex flex-wrap gap-2">
            <StatPill val={24} suffix="+" label="AIIMS Covered" started={statsStarted} darkMode={darkMode} />
            <StatPill val={700} suffix="+" label="Medical Colleges" started={statsStarted} darkMode={darkMode} />
            <StatPill val={15} suffix="" label="Rounds of Data" started={statsStarted} darkMode={darkMode} />
            <StatPill val={100} suffix="%" label="Free Always" started={statsStarted} darkMode={darkMode} />
          </div>
        </div>
      </div>

      {/* Feature Tools */}
      <SectionHead
        tag="System Core Hub"
        icon={<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        title="Intelligent Counselling Suite"
        subtitle="High-performance data modules engineered to optimize your medical university seat allocation strategy."
        darkMode={darkMode}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {features.map(f => (
          <button
            key={f.id}
            onClick={() => f.action ? setCurrentView(f.action) : showToast?.(f.title)}
            className={`p-5 border text-left transition-all hover:border-primary group
              ${darkMode ? 'bg-slate-800/50 border-slate-600 hover:bg-slate-700/50' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded border ${darkMode ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
                {f.icon}
              </div>
              {f.badge && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-primary text-white">
                  {f.badge}
                </span>
              )}
            </div>
            <h3 className={`text-sm font-bold mb-1 flex items-center gap-1 ${darkMode ? 'text-white' : 'text-primary'}`}>
              {f.title}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition" />
            </h3>
            <p className={`text-xs leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>{f.desc}</p>
            <div className={`flex items-center justify-between pt-3 border-t text-xs font-medium
              ${darkMode ? 'border-slate-600 text-slate-400' : 'border-slate-100 text-text-body'}`}>
              <span>{f.btnText}</span>
              <span className="text-primary group-hover:translate-x-1 transition">→</span>
            </div>
          </button>
        ))}
      </div>

      {/* Counselling Directive */}
      <SectionHead
        tag="Counselling Directive"
        icon={<BookOpen className="h-3 w-3" />}
        title="🎓 MCC Official Counselling Rules & Expert Guidance"
        subtitle="Review these high-priority regulatory frameworks carefully before initiating choice-locking sequences to avoid forfeiture risks."
        darkMode={darkMode}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {directives.map((d, i) => (
          <div key={i}
            className={`p-5 border transition-all hover:border-primary
              ${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded border shrink-0 ${darkMode ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
                {d.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${darkMode ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary'}`}>
                    {d.tag}
                  </span>
                  <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-primary'}`}>{d.title}</h3>
                </div>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>{d.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-between flex-wrap gap-3 px-4 py-3 border text-xs font-medium mb-12
        ${darkMode ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-primary/5 border-primary/20 text-primary'}`}>
        <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> For complete official rulebook, refer to MCC of India's published prospectus.</span>
        <a href="https://mcc.nic.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-primary">mcc.nic.in <ExternalLink className="h-3 w-3" /></a>
      </div>

      {/* Expert Strategy Tips */}
      <SectionHead
        tag="Expert Strategy"
        icon={<Lightbulb className="h-3 w-3" />}
        title="Pro Tips for Zero Errors in Counselling"
        subtitle="Step-by-step guidance from NEET counselling experts — follow these rules to maximise your seat allocation outcome."
        darkMode={darkMode}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {expertTips.map(t => (
          <div key={t.num}
            className={`relative p-5 border transition-all hover:border-primary
              ${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-slate-200'}`}>
            <div className="absolute top-2 right-3 text-4xl font-black opacity-5 select-none text-primary">{t.num}</div>
            <div className="mb-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary'}`}>
                STEP {t.num}
              </span>
            </div>
            <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-primary'}`}>{t.title}</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Why RankSetu */}
      <SectionHead
        tag="Why RankSetu"
        icon={<Star className="h-3 w-3" />}
        title="Built for Every NEET Aspirant"
        subtitle="From rural aspirants to urban toppers — RankSetu provides equal access to data-driven counselling intelligence."
        darkMode={darkMode}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        {[
          { icon:<Shield className="h-5 w-5"/>, title:"100% Free, Always", desc:"No hidden fees, no premium tiers. Every feature is free for every student." },
          { icon:<Users className="h-5 w-5"/>,   title:"Trusted by Thousands", desc:"Lakhs of NEET aspirants use RankSetu every counselling season for accurate data." },
          { icon:<TrendingUp className="h-5 w-5"/>, title:"Real-Time Data Accuracy", desc:"Our datasets are sourced directly from MCC, state councils, and NIRF — updated each round." },
        ].map((w, i) => (
          <div key={i}
            className={`p-5 border text-center transition-all hover:border-primary
              ${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-slate-200'}`}>
            <div className={`inline-flex p-3 rounded-full mb-3 border ${darkMode ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
              {w.icon}
            </div>
            <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-primary'}`}>{w.title}</h3>
            <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>{w.desc}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <SectionHead
        tag="FAQ"
        icon={<HelpCircle className="h-3 w-3" />}
        title="Frequently Asked Questions"
        subtitle="Common queries about NEET counselling process and RankSetu platform — answered clearly."
        darkMode={darkMode}
      />
      <div className="max-w-3xl mx-auto space-y-3 mb-16">
        {faqs.map((faq, i) => (
          <div key={i}
            className={`border overflow-hidden ${darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-white border-slate-200'}`}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-bold transition
                ${darkMode ? 'text-white hover:text-primary' : 'text-primary hover:text-primary'}`}>
              <span>{faq.q}</span>
              <span className={`ml-3 text-lg font-black transition-transform ${openFaq === i ? 'rotate-45' : ''} text-primary`}>+</span>
            </button>
            {openFaq === i && (
              <div className={`px-4 pb-4 text-xs leading-relaxed border-t ${darkMode ? 'border-slate-600 text-slate-300' : 'border-slate-100 text-text-body'}`}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className={`relative rounded border overflow-hidden ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="relative z-10 px-6 py-12 text-center">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border mb-4
            ${darkMode ? 'border-primary/30 bg-primary/10 text-primary' : 'border-primary/30 bg-primary/5 text-primary'}`}>
            <Mail className="h-3 w-3" /> Get in Touch
          </span>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-primary'}`}>Have a Question or Suggestion?</h2>
          <p className={`text-sm max-w-md mx-auto mb-6 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-text-body'}`}>
            We're constantly improving RankSetu. Reach out to our team for feedback, data corrections, or collaboration.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="mailto:support@ranksetu.in"
              className="inline-flex items-center gap-2 px-5 py-2 rounded bg-primary text-white text-xs font-bold uppercase tracking-wide hover:bg-interactive transition">
              <Mail className="h-3.5 w-3.5" /> Email Us
            </a>
            <button
              onClick={() => showToast?.("Contact form coming soon!")}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded border text-xs font-bold uppercase tracking-wide transition
                ${darkMode ? 'border-slate-500 text-slate-200 hover:border-primary' : 'border-slate-300 text-text-body hover:border-primary'}`}>
              <Phone className="h-3.5 w-3.5" /> Contact Form
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}