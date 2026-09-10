# BhoomiSetu - National Land Acquisition & Management System (SIH26016)

## Problem Statement
Current public land acquisition processes face bureaucratic delays, opaque physical files, revenue record tampering, land disputes, and severely delayed compensation disbursements.

## Proposed Solution
BhoomiSetu is a unified digital platform designed for transparent, efficient, and data-driven land acquisition management. It integrates landowners, revenue authorities, and implementing agencies into a single ecosystem with automated timelines, AI OCR, and Direct Benefit Transfer (DBT) tracking.

## Key Features
* **Automated Compensation Calculation:** Server-side derivation of market value adding 100% statutory solatium (Sec 30(1) RFCTLARR 2013).
* **Two-Dimensional Access Control:** Strict role-based and jurisdiction-based record filtering.
* **Risk & Delay Monitor:** Per-stage delay detection with rule-based severity flags.
* **BhoomiMitra AI Assistant:** Built-in Gemini 2.5 Flash-powered virtual assistant.
* **Document OCR Extraction:** Automated parsing of revenue records.
* **GIS Integration:** Cadastral map overlays for precise boundary demarcation.

## Technology Stack
* **Frontend:** React 19, Vite, TypeScript, Tailwind CSS 4, Recharts, Framer Motion, Google GenAI.
* **Backend:** Python 3.10+, FastAPI, SQLAlchemy, SQLite, Uvicorn.

## Repository Structure
```text
PROJECT/
├── README.md
├── SUBMISSION_GUIDE.md
├── submission/
│   ├── PRESENTATION.md
│   └── DEMO.md
├── src/
│   ├── backend/ (FastAPI + SQLite)
│   └── frontend/ (React + TypeScript)
├── docs/
│   └── architecture.md
├── assets/
│   └── screenshots/
├── requirements.txt
├── .gitignore
└── LICENSE
```

## Installation & Run Instructions

**Prerequisites:** Python 3.10+ and Node.js 18+.

### 1. Start the Backend (Terminal 1)
```bash
cd src/backend
pip install -r requirements.txt
cd app

# Copy environment variables
copy ..\.env.example .env          # Windows
# cp ../.env.example .env          # Mac / Linux

# Initialize database
python create_tables.py
python seed.py

# Run Server
python -m uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend (Terminal 2)
```bash
cd src/frontend
npm install
npm run dev
```
