from io import BytesIO
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Datalyvo API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_dataframe(filename: str, data: bytes) -> pd.DataFrame:
    try:
        if filename.lower().endswith(".csv"):
            return pd.read_csv(BytesIO(data))
        if filename.lower().endswith((".xlsx", ".xls")):
            return pd.read_excel(BytesIO(data))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read dataset: {exc}") from exc
    raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported.")


def profile(df: pd.DataFrame) -> dict[str, Any]:
    columns = []
    for name in df.columns:
        series = df[name]
        columns.append(
            {
                "name": str(name),
                "dtype": str(series.dtype),
                "missing": int(series.isna().sum()),
                "unique": int(series.nunique(dropna=True)),
                "sample": None if series.dropna().empty else str(series.dropna().iloc[0]),
            }
        )
    numeric = df.select_dtypes(include="number")
    summary = []
    for name in numeric.columns:
        s = numeric[name].dropna()
        if not s.empty:
            summary.append(
                {
                    "column": str(name),
                    "min": float(s.min()),
                    "max": float(s.max()),
                    "mean": float(s.mean()),
                }
            )
    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "duplicates": int(df.duplicated().sum()),
        "missing_cells": int(df.isna().sum().sum()),
        "columns_detail": columns,
        "numeric_summary": summary,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)) -> dict[str, Any]:
    data = await file.read()
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 25 MB MVP limit.")
    df = load_dataframe(file.filename or "dataset.csv", data)
    return profile(df)
