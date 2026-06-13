


'use client';

import React, { useState } from "react";
import {
  Award, Users, GraduationCap, Search, MapPin,
  ExternalLink, HelpCircle, Stethoscope, TrendingUp,
} from "lucide-react";
import TrendModal from "@/components/Graphd";

// ── DB ke EXACT institute names (SELECT DISTINCT institute FROM cutoffs) ──
const AIIMS_DB_NAMES = {
  "AIIMS New Delhi":    "AIIMS, New Delhi",
  "AIIMS Bhubaneswar":  "AIIMS, Bhubaneswar",
  "AIIMS Jodhpur":      "AIIMS, Jodhpur",
  "AIIMS Bhopal":       "AIIMS, Bhopal",
  "AIIMS Rishikesh":    "AIIMS, Rishikesh",
  "AIIMS Raipur":       "AIIMS, Raipur",
  "AIIMS Patna":        "AIIMS, Patna",
  "AIIMS Nagpur":       "AIIMS, Nagpur",
  "AIIMS Mangalagiri":  "AIIMS, Mangalagiri",
  "AIIMS Gorakhpur":    "AIIMS, Gorakhpur",
  "AIIMS Kalyani":      "AIIMS, Kalyani",
  "AIIMS Bathinda":     "AIIMS, Bathinda",
  "AIIMS Deoghar":      "AIIMS, Deoghar",
  "AIIMS Bibinagar":    "AIIMS, Bibinagar, Hyderabad",
  "AIIMS Rae Bareli":   "AIIMS, Rae Bareli",
  "AIIMS Rajkot":       "AIIMS, Rajkot",
  "AIIMS Bilaspur":     "AIIMS, Bilaspur",
  "AIIMS Guwahati":     "AIIMS, Guwahati",
  "AIIMS Jammu":        "AIIMS, Jammu",
  "AIIMS Madurai":      "AIIMS, Madurai",
  // Ye 4 DB mein nahi hain — TrendModal "No records" dikhayega
  "AIIMS Mangalore":    null,
  "AIIMS Awantipora":   null,
  "AIIMS Manethi":      null,
  "AIIMS Darbhanga":    null,
};

export default function AiimsHub({ darkMode }) {
  const [searchTerm, setSearchTerm]         = useState("");
  const [isTrendOpen, setIsTrendOpen]       = useState(false);
  const [trendInstitute, setTrendInstitute] = useState("");
  const [noDataPopup, setNoDataPopup]       = useState(null);

  const aiimsData = [
    { id: 1,  name: "AIIMS New Delhi",    established: 1956, seats: 132, closingRank: 57,   location: "Delhi",            NIRF: "Rank 1",  site: "https://www.aiims.edu" },
    { id: 2,  name: "AIIMS Bhubaneswar",  established: 2012, seats: 125, closingRank: 530,  location: "Odisha",           NIRF: "Rank 17", site: "https://aiimsbhubaneswar.nic.in" },
    { id: 3,  name: "AIIMS Jodhpur",      established: 2012, seats: 125, closingRank: 460,  location: "Rajasthan",        NIRF: "Rank 13", site: "https://www.aiimsjodhpur.edu.in" },
    { id: 4,  name: "AIIMS Bhopal",       established: 2012, seats: 125, closingRank: 558,  location: "Madhya Pradesh",   NIRF: "Rank 38", site: "https://www.aiimsbhopal.edu.in" },
    { id: 5,  name: "AIIMS Rishikesh",    established: 2012, seats: 125, closingRank: 773,  location: "Uttarakhand",      NIRF: "Rank 22", site: "https://www.aiimsrishikesh.edu.in" },
    { id: 6,  name: "AIIMS Raipur",       established: 2012, seats: 125, closingRank: 1120, location: "Chhattisgarh",     NIRF: "Rank 39", site: "https://www.aiimsraipur.edu.in" },
    { id: 7,  name: "AIIMS Patna",        established: 2012, seats: 125, closingRank: 1310, location: "Bihar",            NIRF: "Rank 27", site: "https://www.aiimspatna.edu.in" },
    { id: 8,  name: "AIIMS Nagpur",       established: 2018, seats: 125, closingRank: 870,  location: "Maharashtra",      NIRF: "Top 50",  site: "https://www.aiimsnagpur.edu.in" },
    { id: 9,  name: "AIIMS Mangalagiri",  established: 2018, seats: 125, closingRank: 1530, location: "Andhra Pradesh",   NIRF: "Top 50",  site: "https://www.aiimsmangalagiri.edu.in" },
    { id: 10, name: "AIIMS Gorakhpur",    established: 2019, seats: 125, closingRank: 2200, location: "Uttar Pradesh",    NIRF: "N/A",     site: "https://www.aiimsgorakhpur.edu.in" },
    { id: 11, name: "AIIMS Kalyani",      established: 2019, seats: 125, closingRank: 1980, location: "West Bengal",      NIRF: "N/A",     site: "https://aiimskalyani.edu.in" },
    { id: 12, name: "AIIMS Bathinda",     established: 2019, seats: 100, closingRank: 1760, location: "Punjab",           NIRF: "N/A",     site: "https://aiimsbathinda.edu.in" },
    { id: 13, name: "AIIMS Deoghar",      established: 2019, seats: 125, closingRank: 3400, location: "Jharkhand",        NIRF: "N/A",     site: "https://www.aiimsdeoghar.edu.in" },
    { id: 14, name: "AIIMS Bibinagar",    established: 2019, seats: 100, closingRank: 2600, location: "Telangana",        NIRF: "N/A",     site: "https://aiimsbibinagar.edu.in" },
    { id: 15, name: "AIIMS Rae Bareli",   established: 2019, seats: 100, closingRank: 2450, location: "Uttar Pradesh",    NIRF: "N/A",     site: "https://aiimsrbl.edu.in" },
    { id: 16, name: "AIIMS Mangalore",    established: 2022, seats: 50,  closingRank: 1600, location: "Karnataka",        NIRF: "N/A",     site: "https://www.aiimsmangalagiri.edu.in/" },
    { id: 17, name: "AIIMS Rajkot",       established: 2020, seats: 100, closingRank: 2750, location: "Gujarat",          NIRF: "N/A",     site: "https://aiimsrajkot.edu.in" },
    { id: 18, name: "AIIMS Bilaspur",     established: 2020, seats: 100, closingRank: 2900, location: "Himachal Pradesh", NIRF: "N/A",     site: "https://aiimsbilaspur.edu.in" },
    { id: 19, name: "AIIMS Guwahati",     established: 2020, seats: 100, closingRank: 4200, location: "Assam",            NIRF: "N/A",     site: "https://aiimsguwahati.ac.in" },
    { id: 20, name: "AIIMS Jammu",        established: 2020, seats: 100, closingRank: 4500, location: "Jammu & Kashmir",  NIRF: "N/A",     site: "https://aiimsjammu.edu.in" },
    { id: 21, name: "AIIMS Madurai",      established: 2021, seats: 50,  closingRank: 5100, location: "Tamil Nadu",       NIRF: "N/A",     site: "https://jipmer.edu.in/aiims-madurai" },
    { id: 22, name: "AIIMS Awantipora",   established: 2020, seats: 100, closingRank: 5600, location: "Jammu & Kashmir",  NIRF: "N/A",     site: "https://pmssy-mohfw.nic.in" },
    { id: 23, name: "AIIMS Manethi",      established: 2023, seats: 100, closingRank: 4900, location: "Haryana",          NIRF: "N/A",     site: "https://pmssy-mohfw.nic.in" },
    { id: 24, name: "AIIMS Darbhanga",    established: 2020, seats: 100, closingRank: 5300, location: "Bihar",            NIRF: "N/A",     site: "https://health.bihar.gov.in" },
  ];

  const filtered = aiimsData.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewTrend = (aiims) => {
    const dbName = AIIMS_DB_NAMES[aiims.name];
    if (dbName === null) {
      setNoDataPopup(aiims.name);
    } else if (dbName) {
      setTrendInstitute(dbName);
      setIsTrendOpen(true);
    } else {
      setTrendInstitute(aiims.name);
      setIsTrendOpen(true);
    }
  };

  const getCutoffColor = (rank) => {
    if (rank <= 200)  return { bg: darkMode ? "bg-interactive/10 border-interactive/20" : "bg-interactive/5 border-interactive/20",    text: darkMode ? "text-interactive"   : "text-interactive"   };
    if (rank <= 1000) return { bg: darkMode ? "bg-accent/10 border-accent/20"        : "bg-accent/5 border-accent/20",          text: darkMode ? "text-accent"        : "text-accent"        };
    if (rank <= 3000) return { bg: darkMode ? "bg-primary/10 border-primary/20"      : "bg-primary/5 border-primary/20",        text: darkMode ? "text-primary"       : "text-primary"       };
    return             { bg: darkMode ? "bg-slate-800 border-slate-700"               : "bg-slate-100 border-slate-200",         text: darkMode ? "text-slate-400"      : "text-slate-600"      };
  };

  return (
    <div className="w-full space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className={`p-6 sm:p-8 rounded-2xl border
        ${darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className={`text-sm font-black uppercase tracking-[0.18em] ${darkMode ? "text-primary" : "text-primary"}`}>
                Verified Central Pool • 24 Active Institutes
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-3 ${darkMode ? "text-white" : "text-primary"}`}>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Stethoscope className="h-6 w-6" />
              </div>
              All 24 AIIMS National Pool
            </h2>
            <p className={`text-xs font-semibold ${darkMode ? "text-slate-400" : "text-text-body"}`}>
              लाइव सीट मैट्रिक्स एवं NEET क्लोजिंग रैंक इंडेक्स 2026
            </p>
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-body pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or state…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none
                ${darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-primary"
                  : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary focus:bg-white"}`}
            />
          </div>
        </div>
      </div>

      {/* ── GRID ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center
          ${darkMode ? "bg-slate-900/40 border-slate-800 text-slate-500" : "bg-white border-slate-200 text-text-body"}`}>
          <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-bold text-sm">No results found for "{searchTerm}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((a) => {
            const cutoff = getCutoffColor(a.closingRank);
            const hasData = AIIMS_DB_NAMES[a.name] !== null && AIIMS_DB_NAMES[a.name] !== undefined;

            return (
              <div
                key={a.id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 group overflow-hidden
                  ${darkMode
                    ? "bg-slate-900/50 border-slate-800 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30"
                    : "bg-white border-slate-200 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"}`}
              >
                <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-black uppercase tracking-widest mb-1 ${darkMode ? "text-primary" : "text-primary"}`}>
                      AIIMS Node · Est. {a.established}
                    </div>
                    <h4 className={`text-sm font-black leading-snug ${darkMode ? "text-slate-100" : "text-primary"}`}>
                      {a.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-accent shrink-0" />
                      <span className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-text-body"}`}>
                        {a.location}
                      </span>
                    </div>
                  </div>
                  <a
                    href={a.site}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`p-2 rounded-xl border shrink-0 transition-all duration-200 hover:scale-110
                      ${darkMode
                        ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-primary"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:text-primary hover:bg-white"}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Stats Grid */}
                <div className={`grid grid-cols-2 gap-2.5 pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>

                  {/* Cutoff Trend Button */}
                  <button
                    onClick={() => handleViewTrend(a)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group/trend
                      ${hasData
                        ? darkMode
                          ? "bg-primary/10 border-primary/20 hover:bg-primary/25 hover:border-primary/50"
                          : "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                        : darkMode
                          ? "bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60"
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className={`h-3 w-3 transition-transform group-hover/trend:scale-125
                        ${hasData
                          ? darkMode ? "text-primary" : "text-primary"
                          : darkMode ? "text-slate-500" : "text-slate-400"
                        }`}
                      />
                      <span className={`text-xs font-bold uppercase tracking-wide
                        ${hasData
                          ? darkMode ? "text-primary" : "text-primary"
                          : darkMode ? "text-slate-500" : "text-slate-400"
                        }`}>
                        Cutoff Trend
                      </span>
                    </div>
                    <span className={`text-xs font-black leading-tight block
                      ${hasData
                        ? darkMode ? "text-primary" : "text-primary"
                        : darkMode ? "text-slate-500" : "text-slate-400"
                      }`}>
                      {hasData ? "View Graph →" : "No Data"}
                    </span>
                  </button>

                  {/* NIRF */}
                  <div className={`p-3 rounded-xl border ${darkMode ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award className="h-3 w-3 text-accent" />
                      <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? "text-slate-500" : "text-text-body"}`}>NIRF</span>
                    </div>
                    <span className={`text-sm font-black ${darkMode ? "text-slate-200" : "text-primary"}`}>{a.NIRF}</span>
                  </div>

                  {/* MBBS Seats */}
                  <div className={`p-3 rounded-xl border ${darkMode ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-100"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="h-3 w-3 text-primary" />
                      <span className={`text-xs font-bold uppercase tracking-wide ${darkMode ? "text-slate-500" : "text-text-body"}`}>MBBS Seats</span>
                    </div>
                    <span className={`text-sm font-black font-mono ${darkMode ? "text-slate-200" : "text-primary"}`}>{a.seats}</span>
                  </div>

                  {/* Gen Cutoff */}
                  <div className={`p-3 rounded-xl border ${cutoff.bg}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <GraduationCap className={`h-3 w-3 ${cutoff.text}`} />
                      <span className={`text-xs font-bold uppercase tracking-wide ${cutoff.text}`}>Gen Cutoff</span>
                    </div>
                    <span className={`text-sm font-black font-mono ${cutoff.text}`}>
                      ~{a.closingRank.toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FOOTER NOTICE ───────────────────────────────────────── */}
      <div className={`p-4 rounded-xl border border-dashed flex items-start gap-3 text-xs font-semibold leading-relaxed
        ${darkMode
          ? "bg-accent/5 border-accent/20 text-accent"
          : "bg-accent/5 border-accent/20 text-accent"}`}>
        <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
        <span>
          <strong className="font-black">⚠️ एम्स काउंसलिंग नियम:</strong> सभी AIIMS सीटें शत-प्रतिशत केवल{" "}
          <strong>MCC All India Quota (15%)</strong> काउंसलिंग द्वारा भरी जाती हैं।
          इनमें कोई भी राज्य स्तरीय 85% कोटा लागू नहीं होता।
        </span>
      </div>

      {/* ── No Data Popup ────────────────────────────────────────── */}
      {noDataPopup && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setNoDataPopup(null)}
        >
          <div
            className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-7 text-center
              ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`}
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "aimsSlideUp 0.22s cubic-bezier(.16,1,.3,1)" }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
            </div>
            <h3 className={`text-base font-black mb-2 ${darkMode ? "text-white" : "text-primary"}`}>
              Cutoff Data Not Available
            </h3>
            <p className={`text-xs font-semibold leading-relaxed mb-4 ${darkMode ? "text-slate-400" : "text-text-body"}`}>
              <span className="font-black text-accent">{noDataPopup}</span> ka historical
              cutoff data abhi database mein available nahi hai.
              <br /><br />
              Yeh AIIMS recently established hai aur MCC counselling data abhi compile ho raha hai.
            </p>
            <button
              onClick={() => setNoDataPopup(null)}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-interactive text-white text-xs font-black transition-colors"
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}

      {/* ── TrendModal — hamesha mounted, isOpen se control hota hai ── */}
      <TrendModal
        isOpen={isTrendOpen}
        onClose={() => { setIsTrendOpen(false); setTrendInstitute(""); }}
        instituteName={trendInstitute}
        darkMode={darkMode}
      />
    </div>
  );
}