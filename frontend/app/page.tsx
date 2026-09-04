"use client";

import { ChangeEvent, useState } from "react";

type Column = { name: string; dtype: string; missing: number; unique: number; sample: string | null };
type Profile = { rows: number; columns: number; duplicates: number; missing_cells: number; columns_detail: Column[]; numeric_summary: { column: string; min: number; max: number; mean: number }[] };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze(selected: File) {
    setFile(selected); setProfile(null); setError(""); setLoading(true);
    try {
      const form = new FormData(); form.append("file", selected);
      const res = await fetch(`${API}/api/analyze`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Analysis failed");
      setProfile(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]; if (selected) analyze(selected);
  }

  return <main className="page"><div className="shell">
    <nav className="nav"><div className="logo">datalyvo</div><div className="badge">Data analytics, simplified</div></nav>
    <section className="hero">
      <div className="eyebrow">RAW DATA → CLEAR INSIGHTS</div>
      <h1>Turn messy data into decisions.</h1>
      <p className="sub">Upload a CSV or Excel file. Datalyvo profiles your dataset instantly and lays the foundation for an intelligent, interactive dashboard.</p>
    </section>

    <label className="card upload"><input type="file" accept=".csv,.xlsx,.xls" onChange={onFile}/>
      <div className="upload-title">{loading ? "Analyzing your dataset…" : file ? file.name : "Drop your dataset here"}</div>
      <div className="muted">CSV or XLSX · up to 25 MB</div>
      {!loading && <button className="btn" type="button">Choose file</button>}
    </label>

    {error && <div className="error">{error}</div>}

    {profile && <section className="dashboard">
      <div className="metrics">
        <Metric label="Rows" value={profile.rows.toLocaleString()}/><Metric label="Columns" value={profile.columns.toLocaleString()}/><Metric label="Missing cells" value={profile.missing_cells.toLocaleString()}/><Metric label="Duplicate rows" value={profile.duplicates.toLocaleString()}/>
      </div>
      <div className="card table-card"><div className="section-title">Column profile</div><table><thead><tr><th>Column</th><th>Type</th><th>Missing</th><th>Unique</th><th>Sample</th></tr></thead><tbody>{profile.columns_detail.map(c => <tr key={c.name}><td><strong>{c.name}</strong></td><td>{c.dtype}</td><td>{c.missing}</td><td>{c.unique.toLocaleString()}</td><td>{c.sample ?? "—"}</td></tr>)}</tbody></table></div>
    </section>}
  </div></main>;
}

function Metric({label, value}: {label:string; value:string}) { return <div className="card metric"><div className="metric-label">{label}</div><div className="metric-value">{value}</div></div>; }
