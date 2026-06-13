<div align="center">

<!-- 🖼️ ADD YOUR LOGO HERE -->
<img src="./frontend/public/logo.png" alt="RankSetu Logo" width="120" />

# 🏥 RankSetu

### India's Most Trusted NEET UG Counselling Intelligence Platform

**रैंक + सेतु = "Rank Bridge"**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)](https://mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**🆓 100% Free&nbsp; • &nbsp;🔓 No Login Required&nbsp; • &nbsp;✅ Verified Official MCC Data**

[🌐 Live Demo](https://ranksetu.vercel.app) &nbsp;•&nbsp; [📧 Contact](mailto:hello@ranksetu.in) &nbsp;•&nbsp; [🐛 Report Bug](https://github.com/your-username/ranksetu/issues) &nbsp;•&nbsp; [✨ Request Feature](https://github.com/your-username/ranksetu/issues)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [The Problem We Solve](#-the-problem-we-solve)
- [Features](#-features)
- [Screenshots](#%EF%B8%8F-screenshots)
- [Data Coverage](#-data-coverage)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [System Architecture](#%EF%B8%8F-system-architecture)
- [Data Pipeline](#-data-pipeline-pdf--csv--database)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start-3-terminals)
- [Environment Configuration](#%EF%B8%8F-environment-configuration)
- [Roadmap](#%EF%B8%8F-roadmap)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact & Support](#-contact--support)

---

## 📌 About The Project

**RankSetu** is a comprehensive NEET UG counselling intelligence platform that helps medical aspirants find their perfect college match. It processes official MCC PDFs, cleans and normalizes the data, and delivers intelligent predictions powered by machine learning — completely free, with no login required.

---

## 🎯 The Problem We Solve

Every year, **15–20 lakh NEET aspirants** struggle with the same issues:

| Problem | Impact |
|---|---|
| 📄 Complex MCC PDFs (100+ pages) | Students can't find their cutoff data easily |
| 🔍 No centralized search across years/rounds | Manual searching takes hours |
| 🤔 Confusion about quota codes (AI, AI-AIIMS, PS, NRI) | Wrong choice filling → missed opportunities |
| 📊 No year-wise trend analysis | Can't predict if a cutoff will rise or fall |
| ❓ Unsure about upgrading or freezing seats | Wrong decision → loss of seat |

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| 🔎 **Opening & Closing Ranks** | Search with 8+ filters (year, round, category, quota) | ✅ Live |
| 🤖 **AI College Optimizer** | Get Dream / Target / Safe colleges based on your rank | ✅ Live |
| 🏥 **AIIMS Hub** | Complete data for all 24 AIIMS institutes | ✅ Live |
| 🌿 **AYUSH Cutoffs** | BAMS, BHMS, BUMS counselling data | ✅ Live |
| 📈 **Upgrade Probability** | Check chances of a better seat in the next round | ✅ Live |
| 📖 **Counselling Guide** | Quota codes, categories & rounds explained simply | ✅ Live |
| 🧪 **Choice Lab** | Simulate and optimize your choice-filling order | ✅ Live |
| 🗂️ **Choice Sandbox** | Drag-and-drop preference list builder | ✅ Live |
| 📅 **Counselling Timeline** | Key MCC dates & deadlines at a glance | ✅ Live |
| 🔗 **Share Card** | Generate & share your personalized college list | ✅ Live |
| 🌙 **Dark Mode** | Eye-friendly interface across the entire app | ✅ Live |
| 🏛️ **State Cutoffs** | State quota data | 🚧 Coming Soon |
| 🔮 **Rank Predictor** | Predict next year's cutoff trends | 🚧 Coming Soon |
| 🗄️ **College Database** | Full searchable college info database | 🚧 Coming Soon |

---

## 🖼️ Screenshots

<div align="center">

| Home Dashboard | AI Optimizer |
|---|---|
| ![Home](./docs/screenshots/home.png) | ![Optimizer](./docs/screenshots/optimizer.png) |

| Cutoff Search | Dark Mode |
|---|---|
| ![Cutoff Table](./docs/screenshots/cutoff-table.png) | ![Dark Mode](./docs/screenshots/dark-mode.png) |

*Add your actual screenshots/GIFs to `docs/screenshots/` and update the paths above.*

</div>

---

## 📊 Data Coverage

- **📅 Years:** 2020, 2021, 2022, 2023, 2024, 2025
- **🔄 Rounds:** Round 1, Round 2, Round 3, Mop-Up, Stray Vacancy
- **🏷️ Categories:** UR, OBC-NCL, SC, ST, EWS, PwD
- **📚 Quotas:** AI, AI-AIIMS, AI-JIPMER, DU, IP, PS, SO, NRI, ES (28 total)
- **🏥 Institutes:** 600+ (AIIMS, JIPMER, BHU, AMU, Deemed, Private, Government)
- **📈 Records:** 1,40,000+ opening/closing rank entries

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Backend (API Gateway)** | Node.js, Express, In-memory caching |
| **AI/Prediction Service** | Python, FastAPI, SQLAlchemy |
| **Database** | MySQL 8.0 |
| **Data Processing** | pdfplumber, pandas, regex normalization |
| **Deployment** | Vercel (Frontend), Render/Railway (Backends) |

</div>

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────┐
│         Frontend (Next.js) — Port 3000      │
└────────────────────┬─────────────────────────┘
                      ▼
┌────────────────────────────────────────────┐
│     Node.js Backend (Express) — Port 5080   │
│  ┌───────────┐ ┌───────────┐ ┌────────────┐ │
│  │MCC Cutoffs│ │Ayush      │ │ Filters API │ │
│  │ Controller│ │ Cutoffs   │ │  (cached)   │ │
│  └───────────┘ └───────────┘ └────────────┘ │
└────────────────────┬─────────────────────────┘
                      ▼
┌────────────────────────────────────────────┐
│   Python Backend (FastAPI) — Port 8000      │
│  ┌───────────┐ ┌───────────┐ ┌────────────┐ │
│  │ Optimizer │ │ Upgrade   │ │  Trends     │ │
│  │  Engine   │ │ Checker   │ │  API        │ │
│  └───────────┘ └───────────┘ └────────────┘ │
└────────────────────┬─────────────────────────┘
                      ▼
┌────────────────────────────────────────────┐
│              MySQL Database                  │
│  ┌──────────────────┐ ┌──────────────────┐  │
│  │   mcc_cutoffs     │ │      ayus         │  │
│  └──────────────────┘ └──────────────────┘  │
└────────────────────────────────────────────┘
```

---

## 🔄 Data Pipeline: PDF → CSV → Database

### The Challenge

Converting raw MCC PDFs into clean data revealed major quality issues:

| Problem | Example | Our Solution |
|---|---|---|
| Extra spaces | `"AIIMS Mangala giri"` vs `"AIIMS Mangalagiri"` | Regex normalization |
| Duplicate entries | `"AIIMS Jammu"` appears 3× with suffixes | Deduplication + mapping |
| Inconsistent naming | `"A IIMS Vijaypur"`, `"AIIMS, Vijaypur"` | Standardized mapping dictionary |
| Prefix garbage | `"1.1 - AIIMS New Delhi"` | Regex extraction |

### Cleaning Algorithm (simplified)

```python
def clean_college_name(name):
    name = re.sub(r'^\d+\.\d+\s*-\s*', '', str(name))  # Remove "1.1 - " prefixes
    name = re.sub(r'\s+', ' ', name)                     # Collapse extra spaces

    fixes = {
        "A IIMS": "AIIMS",
        "Mangala giri": "Mangalagiri",
        "Vijaypur Samba": "Vijaypur",
    }
    for wrong, correct in fixes.items():
        if wrong in name:
            name = name.replace(wrong, correct)

    return name.strip()


def parse_mcc_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        all_text = "".join(page.extract_text() for page in pdf.pages)
    # ...extract tables, clean names, normalize data...
    return df
```

### Database Schema

```sql
CREATE TABLE mcc_cutoffs (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    year            INT NOT NULL,
    round           VARCHAR(20) NOT NULL,
    quota           VARCHAR(50) NOT NULL,
    category        VARCHAR(20) NOT NULL,
    institute_name  VARCHAR(255) NOT NULL,
    course          VARCHAR(100) DEFAULT 'MBBS',
    opening_rank    INT,
    closing_rank    INT NOT NULL,
    fees            FLOAT,
    bond_years      INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_institute (institute_name),
    INDEX idx_year_round (year, round),
    INDEX idx_category (category),
    INDEX idx_search (institute_name, year, round, category),
    INDEX ix_quota_institute (quota, institute_name)
);
```

### Data Statistics

| Metric | Value |
|---|---|
| Total Records | 40,000+ |
| Unique Institutes | 600+ |
| Years Covered | 2020–2025 |
| Categories | 6 (UR, OBC, SC, ST, EWS, PwD) |
| Quotas | 28 |

---

## 📁 Project Structure

```
ranksetu/
│
├── frontend/                       # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── app/                    # App router pages
│   │   ├── components/             # React components (30+ files)
│   │   ├── context/                # React context (dark mode)
│   │   └── utils/                  # API utilities
│   ├── public/                     # Static assets
│   └── package.json
│
├── backend/                        # Node.js Backend (Port 5080)
│   ├── config/
│   │   ├── db.js                   # MySQL connection pool
│   │   └── cache.js                # In-memory TTL cache
│   ├── controllers/
│   │   ├── cutoffController.js     # MCC cutoffs CRUD
│   │   └── ayushCutoffController.js # Ayush cutoffs CRUD
│   ├── middleware/
│   │   └── rateLimiter.js          # API rate limiting
│   ├── routes/
│   │   ├── cutoffRoutes.js         # MCC routes
│   │   └── ayushRoutes.js          # Ayush routes
│   ├── server.js                   # Entry point
│   └── package.json
│
├── python_backend/                 # Python FastAPI (Port 8000)
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── database.py             # SQLAlchemy connection
│   │   ├── models.py                # ORM models
│   │   ├── prediction_engine.py    # AI prediction engine
│   │   └── upgrade_engine.py       # Upgrade probability engine
│   └── requirements.txt
│
└── database/                       # SQL scripts
    ├── init.sql                    # Table creation
    └── seed.sql                    # Sample data
```

---

## 🚀 Quick Start (3 Terminals)

### Prerequisites
- Node.js 18+
- Python 3.10+
- MySQL 8.0

### 1️⃣ Terminal 1 — Node.js Backend
```bash
cd backend
cp .env.example .env        # Fill DB_PASSWORD
npm install
npm start
# → http://localhost:5080
```

### 2️⃣ Terminal 2 — Python FastAPI (Choice Optimizer)
```bash
cd python_backend
cp .env.example .env        # Same DB credentials
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
```

### 3️⃣ Terminal 3 — Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:5173
```

➡️ Open your browser at **http://localhost:5173**

### 🔧 Port Conflict Fix
```bash
# If port 5080 is busy:
lsof -ti :5080 | xargs kill -9
npm start
```

---

## ⚙️ Environment Configuration

### Frontend (`.env.local`)
```env
# LOCAL DEVELOPMENT
NEXT_PUBLIC_API_URL=http://localhost:5080
NEXT_PUBLIC_PYTHON_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (`.env`)
```env
# Server Configuration
PORT=5080
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=neet_db

# Cache Configuration
CACHE_TTL=3600

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Optional: Python Backend URL
PYTHON_BACKEND_URL=http://localhost:8000
```

### Python Backend (`.env`)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=neet_db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5080,http://localhost:5173

# Optional: Node.js Backend URL
NODE_API_URL=http://localhost:5080
```

---

## 🗺️ Roadmap

- [x] MCC Cutoff Search with multi-filter support
- [x] AI College Optimizer (Dream/Target/Safe)
- [x] AIIMS Hub & AYUSH Cutoffs
- [x] Upgrade Probability Engine
- [x] Choice Lab & Choice Sandbox
- [x] Dark Mode
- [ ] State Quota Cutoffs
- [ ] AI Rank Predictor (year-on-year trend forecasting)
- [ ] Full College Database with detailed profiles
- [ ] Mobile App (React Native)

See [open issues](https://github.com/your-username/ranksetu/issues) for a full list of proposed features and known issues.

---

## ❓ FAQ

**Q: Is RankSetu really free?**
Yes — 100% free, no login or signup required for any feature.

**Q: Where does the data come from?**
All cutoff data is sourced from official MCC (Medical Counselling Committee) PDFs and cleaned/normalized through our data pipeline.

**Q: How often is the data updated?**
Data is updated after each official MCC counselling round is published.

**Q: Can I contribute new data or report incorrect cutoffs?**
Yes — open an issue or submit a pull request with the source PDF reference.

---

## 🤝 Contributing

Contributions make the open-source community amazing. Any contributions are **greatly appreciated**.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

## 📬 Contact & Support

<div align="center">

📧 **Email:** [hello@ranksetu.in](mailto:hello@ranksetu.in)
🌐 **Website:** [ranksetu.vercel.app](https://ranksetu.vercel.app)
🐛 **Issues:** [GitHub Issues](https://github.com/your-username/ranksetu/issues)

### ⭐ If RankSetu helped you, consider giving it a star on GitHub!

### 💙 Made with care for NEET aspirants across India

</div>