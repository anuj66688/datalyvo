# Datalyvo

AI-ready data analytics SaaS for turning raw CSV/XLSX files into clean, explainable, interactive dashboards.

## MVP

- Upload CSV/XLSX datasets
- Profile columns, missing values, duplicates, and data types
- Apply safe automatic cleaning
- Generate an interactive dashboard
- FastAPI analytics service + Next.js web app

## Structure

```text
datalyvo/
├── frontend/   # Next.js + TypeScript + Tailwind
├── backend/    # FastAPI + Pandas
└── README.md
```

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the API at `http://localhost:8000` by default. Override with `NEXT_PUBLIC_API_URL`.
