<div align="center">

# 🏥 RankSetu

### India's NEET UG Counselling Intelligence Platform

**रैंक + सेतु = "Rank Bridge"**

Turning 3200+ page government PDFs into searchable data, real-time trend charts, and statistically-forecasted college recommendations — for the 20-22 lakh students who sit the NEET UG exam every year.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TiDB](https://img.shields.io/badge/Database-TiDB%20Cloud-FF7A45?style=for-the-badge)](https://www.pingcap.com/tidb-cloud/)

**🆓 100% Free &nbsp;•&nbsp; 🔓 No Login Required &nbsp;•&nbsp; ⚡ Sub-second Predictions**

[**🌐 Live Demo**](https://rank-setu.vercel.app) &nbsp;·&nbsp; [**🐛 Report a Bug**](https://github.com/Umashankar620/RankSetu/issues) &nbsp;·&nbsp; [**✨ Request a Feature**](https://github.com/Umashankar620/RankSetu/issues)

</div>

<br>

> 💡 **If you're a recruiter or engineer skimming this:** skip straight to [The Hardest Problem I Solved](#-the-hardest-problem-i-solved-deduplicating-600-college-names) and [Performance Engineering](#-performance-engineering-9000-queries--1-query) — those two sections are the real technical depth of this project, not the UI.

---

## 📖 Table of Contents

- [The Problem](#-the-problem)
- [What RankSetu Does](#-what-ranksetu-does)
- [Features](#-features)
- [The Hardest Problem I Solved: Deduplicating 600+ College Names](#-the-hardest-problem-i-solved-deduplicating-600-college-names)
- [Performance Engineering: 9,000 Queries → 1 Query](#-performance-engineering-9000-queries--1-query)
- [The AI Optimizer — How the Prediction Actually Works](#-the-ai-optimizer--how-the-prediction-actually-works)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Engineering Highlights](#-engineering-highlights)
- [License](#-license)

---

## 🎯 The Problem

Every year, **15–20 lakh NEET UG aspirants** go through India's MCC (Medical Counselling Committee) admission process — and every year, they're handed the same broken tooling: their *only* source of truth is a **3200+ page government PDF**, published fresh after every single counselling round, with no search, no history, and no way to tell if a cutoff is trending up or down.

| The Problem | What It Actually Costs Students |
|---|---|
| 📄 Cutoffs locked inside dense, unsearchable PDFs | Hours spent manually scrolling through tables |
| 🔢 28 different quota codes, 5+ rounds, 6 categories | High chance of choice-filling the wrong combination |
| 📊 Zero historical trend visibility | No way to know if a college is getting easier or harder to get into |
| ⏳ Freeze-or-upgrade decision must be made in **24–48 hours** | Students gamble on gut feeling instead of data — and can lose a confirmed seat |

---

## 🚀 What RankSetu Does

RankSetu replaces all of that with one platform:

1. **Search** any year/round/category/quota/institute combination instantly, instead of hunting through a PDF
2. **Visualize** how any college's cutoff has moved across years and rounds
3. **Predict** — using a custom-built statistical forecasting engine — where a given rank realistically stands a chance next cycle, bucketed into **Dream / Target / Safe**
4. **Decide** whether to freeze or upgrade an allotted seat, backed by a probability score instead of a guess

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔎 **MCC Cutoff Search** | Multi-filter search (year, round, category, quota, program, institute, gender) across the historical cutoff dataset, with paginated results and a live **Safe / Borderline / Hard Cutoff** badge computed against the user's own rank |
| 🧠 **Dependent Smart Filters** | Selecting a quota automatically narrows the Institute dropdown to only institutes that actually offer seats under it — zero extra network calls, computed via a purpose-built database index |
| 🎚️ **Cutoff Shift Simulator** | A live ±15% slider to instantly model "what if this year is tougher / easier" without re-querying the server |
| 📈 **Institute Trend Charts** | Interactive Recharts visualization of a college's closing rank across every year and round on record |
| 🤖 **AI College Optimizer** | A custom-built statistical forecasting engine that predicts next-cycle closing ranks and classifies every matching college into **Dream / Target / Safe** — see the [deep dive below](#-the-ai-optimizer--how-the-prediction-actually-works) |
| 📊 **Upgrade Probability Checker** | Models round-to-round cutoff movement for a student's *current* allotted seat and returns an upgrade probability, a seat-loss risk rating, and a ranked list of realistically-better alternative colleges |
| 🌿 **AYUSH Counselling Support** | The same search/filter/trend system, extended to BAMS/BHMS/BUMS counselling data |
| 🌙 **Dark Mode, Responsive UI, SEO-ready** | Full dark mode, mobile-first responsive design, auto-generated sitemap, and structured data (JSON-LD) for search visibility |

---

## 🧩 The Hardest Problem I Solved: Deduplicating 700+ College Names

This is the part of the project I'd most want to talk through in an interview — it's an unglamorous, very real data-engineering problem, and it's the kind of bug that **doesn't crash your app, it just quietly makes your predictions wrong.**

### The symptom

MCC publishes every counselling round as a **PDF**, not as structured data. When you extract text from a PDF programmatically, the extraction doesn't always respect word boundaries — it reads based on character/glyph positions on the page, not on what a human would call a "word." The result: **the same real-world college could come out of different PDFs looking like different strings.**

This wasn't a one-off — it was a **recurring pattern across the entire dataset**, showing up differently for different institutes. A few representative examples, out of many similar cases found while auditing the data:

```
PDF Round 1 (2022):  "AIIMS Mangala giri"     ← stray space inserted mid-word
PDF Round 3 (2023):  "AIIMS Mangalagiri"      ← correct, no stray space
PDF Round 1 (2021):  "A IIMS Vijaypur"        ← broken acronym
PDF Round 2 (2021):  "AIIMS, Vijaypur"        ← comma-separated variant


# ...and dozens more variants like these across other institutes —
# stray spaces, broken acronyms, punctuation differences, and
# leaked numbering, each one unique enough that no single regex
# rule could catch all of them at once.
```

In just this small sample, what should be **2 real institutes** (AIIMS Mangalagiri, AIIMS Vijaypur) plus one normally-formatted one (AIIMS New Delhi) were appearing as **5 different strings** to the database. Scaled across the full dataset, this pattern affected a meaningful share of the 600+ institutes on record — each with its own specific variant, which is exactly why a single generic rule couldn't solve it (more on that below).

### Why this is more dangerous than it sounds

Every feature in RankSetu — search, the dependent quota filter, trend charts, and especially the **AI Optimizer's multi-year forecasting** — works by grouping historical rows **by institute name**. If "AIIMS Mangala giri" and "AIIMS Mangalagiri" aren't recognized as the same college, the prediction engine doesn't crash. It does something worse: it silently treats one college's 4-year history as *two colleges with 1–2 years of data each* — which forces the forecasting engine into its low-confidence fallback path instead of running its full statistical model. **The bug never throws an error. It just quietly makes every prediction for that college less accurate, with no warning to anyone.**

### How I fixed it

A multi-stage normalization pass, built specifically to catch this class of problem:

```python
def clean_college_name(name):
    # 1. Strip row-numbering garbage leaked from the source PDF table
    name = re.sub(r'^\d+\.\d+\s*-\s*', '', str(name))

    # 2. Collapse repeated/stray whitespace between tokens
    #    (NOT sufficient alone — "Mangala giri" is one stray space
    #     INSIDE a single word, not a duplicate space between two words)
    name = re.sub(r'\s+', ' ', name)

    # 3. A hand-built, continuously-maintained mapping of every known
    #    wrong-variant → correct-name pair I found while auditing the
    #    full institute list — this is the part that actually solves
    #    the "Mangala giri" → "Mangalagiri" case that whitespace
    #    collapsing alone cannot fix
    KNOWN_VARIANTS = {
        "A IIMS": "AIIMS",
        "Mangala giri": "Mangalagiri",
        "Vijaypur Samba": "Vijaypur",
        # ...built out to a full canonical-name mapping covering
        # every institute discovered to have a PDF-extraction variant
    }
    for wrong, correct in KNOWN_VARIANTS.items():
        if wrong in name:
            name = name.replace(wrong, correct)

    return name.strip()
```

**The key engineering decision:** generic regex (collapsing whitespace, stripping prefixes) catches maybe 60% of the problem. The remaining cases — a space accidentally inserted *inside* a single word — are **mathematically indistinguishable** from a legitimately two-word college name using regex alone. There's no rule that can tell "Mangala giri" (broken) apart from "New Delhi" (correctly two words) without already knowing which institutes exist. So I built and maintained a **canonical institute-name list**, audited the full dataset against it, and mapped every discovered variant explicitly — trading "fully automatic" for "actually correct," which mattered far more given downstream features depend on getting this exactly right.

> **Honest limitation, stated plainly:** this approach is reactive, not exhaustive — it only catches variants that have actually been found and added to the mapping. Every new PDF source carries some risk of introducing a not-yet-seen variant. That's a real, ongoing maintenance cost of working with PDF-sourced data, not a one-time fix.

---

## ⚡ Performance Engineering: 9,000 Queries → 1 Query

The **Upgrade Probability Checker** has to scan 600+ institutes to find ones with a historically better cutoff than a student's current college. The first version of this feature did exactly what it sounds like: it queried the database **separately for every institute, multiple times, across several helper functions** — roughly **9,000–12,000 individual database round-trips for a single request**, taking up to **5 minutes** to respond.

**The fix:** rewrote the data-access layer to pull every relevant row in **one single bulk query**, then build all 600+ institutes' historical comparisons as pure in-memory Python lookups — zero additional database round-trips for the rest of the request.

| | Before | After |
|---|---|---|
| Database round-trips per request | ~9,000–12,000 | **1** |
| Typical response time | Up to 5 minutes | **Sub-second** |
| Business logic | — | **Unchanged** — purely a data-access rewrite |

This is the classic round-trip-latency-vs-bandwidth tradeoff: on a cloud database, every query pays real network latency *on top of* execution time. Paying that cost once instead of 9,000 times is where almost the entire 5-minute response time was actually going.

---

## 🤖 The AI Optimizer — How the Prediction Actually Works

Built as **classical statistical forecasting, hand-implemented in pure Python** — no ML framework dependency, every method built from first principles using only Python's standard library.

For every college matching a student's category/quota, the engine:

1. **Aggregates multi-round data per year**, with outlier rejection — any round whose closing rank jumps more than 3.5× the year's anchor round is excluded, so a single anomalous mop-up round can't corrupt the trend
2. **Detects anomalous years** via z-score analysis
3. **Blends four independent forecasting methods** for any college with 3+ years of data:
   - Weighted linear regression (recency-decayed)
   - Holt's exponential smoothing (trend-aware)
   - Simple exponential smoothing
   - A Round-1-only regression (the cleanest available signal)
4. **Computes a 0–100 confidence score** from regression fit quality, data coverage, and historical volatility
5. **Classifies every college into Dream / Target / Safe**, with the Dream threshold dynamically widened for historically volatile institutes

**Input:** rank, category, quota → **Output:** a ranked, confidence-scored list of colleges with predicted next-cycle cutoffs.

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**Frontend**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Recharts
- Axios

</td>
<td valign="top" width="33%">

**Backend (API Gateway)**
- Node.js + Express
- mysql2
- express-rate-limit
- Node `cluster` (multi-core)

</td>
<td valign="top" width="33%">

**AI / Prediction Service**
- Python + FastAPI
- SQLAlchemy + PyMySQL
- Pydantic validation
- Pure-Python statistical forecasting

</td>
</tr>
</table>

**Database:** TiDB Cloud Serverless (MySQL-protocol compatible, TLS-enforced)
**Data Ingestion:** `pdfplumber` + `pandas` + custom regex/mapping normalization (see above)

---

## 🏗️ System Architecture

The frontend talks to **two independent backend services in parallel** — it picks the right one per feature rather than routing everything through a single gateway:

```
                              ┌──────────────────────────────┐
                              │       Next.js Frontend          │
                              └────────────────┬───────────────┘
                                                │
                     ┌───────────────────────────┴────────────────────────────┐
                     ▼                                                          ▼
      ┌───────────────────────────┐                          ┌───────────────────────────┐
      │   Node.js / Express API     │                          │   FastAPI Prediction Service │
      │   (raw data access)         │                          │   (statistical computation)  │
      │                              │                          │                               │
      │   Search · Filters · Trends │                          │   AI Optimizer · Upgrade Check │
      └────────────────┬───────────┘                          └────────────────┬──────────────┘
                        │                                                        │
                        └──────────────────────┬─────────────────────────────────┘
                                                ▼
                                  ┌───────────────────────────┐
                                  │     TiDB Cloud Serverless    │
                                  │   mcc_cutoffs / ayush_cutoffs │
                                  └───────────────────────────┘
```

---

## 📁 Project Structure

```
RankSetu/
├── Frontend/                  # Next.js 14 — port 3000
│   └── src/
│       ├── app/                # App Router pages, SEO, sitemap
│       ├── components/         # ClientWrapper (view router), search, charts
│       └── utils/api.js        # Backend API clients
│
├── backend/                   # Node.js + Express — port 5080
│   ├── config/                 # DB pool, in-memory cache
│   ├── controllers/            # MCC + AYUSH cutoff logic
│   ├── routes/
│   └── middleware/             # Tiered rate limiting
│
└── python_backend/            # FastAPI — port 8000
    ├── main.py                 # API entry point
    ├── prediction_engine.py    # AI College Optimizer
    ├── upgrade_engine.py       # Upgrade Probability engine
    └── database.py / models.py
```

---

## ⚡ Quick Start

### Prerequisites
`Node.js ≥ 18` · `Python 3.10+` · A MySQL-protocol database (TiDB Cloud Serverless recommended)

```bash
git clone https://github.com/Umashankar620/RankSetu.git
cd RankSetu
```

**Terminal 1 — Node.js Backend**
```bash
cd backend
cp .env.example .env      # fill in your DB credentials
npm install
npm run dev
# → http://localhost:5080
```

**Terminal 2 — FastAPI Prediction Service**
```bash
cd python_backend
cp .env.example .env      # same DB credentials
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000  (interactive docs at /docs)
```

**Terminal 3 — Frontend**
```bash
cd Frontend
cp .env.local.example .env.local
npm install
npm run dev
# → http://localhost:3000
```

---

## 🔐 Environment Variables

<details>
<summary><code>backend/.env</code></summary>

```env
PORT=5080
NODE_ENV=development

DB_HOST=your-tidb-host.tidbcloud.com
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ranksetu
DB_CONNECTION_LIMIT=50

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```
</details>

<details>
<summary><code>python_backend/.env</code></summary>

```env
DB_HOST=your-tidb-host.tidbcloud.com
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ranksetu

ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
PORT=8000
```
</details>

<details>
<summary><code>Frontend/.env.local</code></summary>

```env
NEXT_PUBLIC_API_URL=http://localhost:5080
NEXT_PUBLIC_PYTHON_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=https://rank-setu.vercel.app
```
</details>

---

## 🖼️ Screenshots

> **To add your own:** create `docs/screenshots/` in the repo root and add `homepage.png`, `cutoff-search.png`, `optimizer.png`, and `upgrade-probability.png`. Once pushed, the table below renders them automatically — no other edits needed.

| | |
|---|---|
| ![Homepage](./docs/screenshots/homepage.png) | ![Cutoff Search](./docs/screenshots/cutoff-search.png) |
| *Homepage* | *Cutoff Search with live filters* |
| ![AI Optimizer](./docs/screenshots/optimizer.png) | ![Upgrade Probability](./docs/screenshots/upgrade-probability.png) |
| *AI Optimizer — Dream / Target / Safe results* | *Upgrade Probability — gauge & ranked alternatives* |

---


---

## 📊 Data Coverage

- **📅 Years:** 2020, 2021, 2022, 2023, 2024, 2025
- **🔄 Rounds:** Round 1, Round 2, Round 3, Mop-Up, Stray Vacancy
- **🏷️ Categories:** UR, OBC-NCL, SC, ST, EWS, PwD
- **📚 Quotas:** AI, AI-AIIMS, AI-JIPMER, DU, IP, PS, SO, NRI, ES (28 total)
- **🏥 Institutes:** 600+ (AIIMS, JIPMER, BHU, AMU, Deemed, Private, Government)
- **📈 Records:** 1,40,000+ opening/closing rank entries

---


## 🗺️ Roadmap

- [x] MCC Cutoff Search with multi-filter support
- [x] AI College Optimizer (Dream / Target / Safe)
- [x] Upgrade Probability Engine
- [x] AYUSH counselling support
- [x] Dark mode
- [ ] State quota cutoffs
- [ ] Automated backtesting for the forecasting engine
- [ ] Redis-backed shared caching for multi-instance deployment
- [ ] Mobile app

---

## 💼 Engineering Highlights

A quick summary of what this project actually demonstrates, for anyone evaluating it technically:

- **Three-tier architecture** with a deliberate split between raw-data access (Node) and statistical computation (Python) — two independently deployable services sharing one cloud database
- **Diagnosed and fixed a real N+1 performance defect**, cutting a single endpoint's response time from ~5 minutes to sub-second by replacing ~9,000 sequential queries with one bulk query
- **Solved a genuine PDF-data-quality problem** — built and maintained a canonical institute-name mapping to fix extraction artifacts that would otherwise silently corrupt multi-year predictions
- **Built a four-method statistical forecasting ensemble** from first principles in pure Python, with outlier rejection, data-quality-aware weighting, and a derived confidence score
- **Designed dependent server-side filtering** backed by a purpose-built composite database index, eliminating an entire class of "filter returns nothing, user doesn't know why" UX failure
- **Implemented tiered rate limiting and TTL-based caching**, with a clear understanding of their limitations under horizontal scaling

---

## 📜 License

This project does not yet have a `LICENSE` file in the repository. Until one is added, all rights to this code are reserved by the author by default — no reuse, copying, or redistribution is implied.

A `LICENSE.txt` file with standard **MIT License** text is included alongside this README as a ready-to-use option — adding it to the repo is optional and entirely your choice. The MIT License doesn't require obtaining permission from anyone; it's a free, standard template that *you*, as the copyright holder of your own code, can choose to attach to grant others permission to reuse it (with credit). If you'd rather keep all rights reserved, simply don't add it.

<div align="center">

📧 **Email:** [hello@ranksetu.in](mailto:hello@ranksetu.in)
🌐 **Website:** [ranksetu.vercel.app](https://rank-setu.vercel.app/)

### 💙 Made with care for NEET aspirants across India
### ⭐ If RankSetu is useful to you, consider starring the repo!

</div>
