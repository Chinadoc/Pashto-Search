"use client";

import { useSearch } from "../hooks/useSearch";

export default function Page() {
  const { q, setQ, results, loading, error } = useSearch();

  return (
    <main>
      <h1>Pashto Bible Search (MVP)</h1>
      <p style={{ opacity: 0.8, marginTop: -6 }}>Next.js + Firebase (server search)</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a Pashto word…"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            background: '#0d1117',
            border: '1px solid #30363d',
            color: '#e6edf3'
          }}
        />
      </div>

      {error && (
        <div style={{ color: '#ff8a8a', marginTop: 12 }}>Error: {error}</div>
      )}

      {loading && <div style={{ marginTop: 12 }}>Searching…</div>}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {results.map((r) => (
          <li key={r.ref} style={{
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: 12,
            marginBottom: 8,
            background: '#0d1117'
          }}>
            <div style={{ fontWeight: 600 }}>{r.ref}</div>
            <div style={{ opacity: 0.9 }}>{r.text}</div>
          </li>
        ))}
      </ul>

      {!loading && results.length === 0 && q.trim().length > 0 && (
        <div style={{ marginTop: 12, opacity: 0.8 }}>No matches found.</div>
      )}
    </main>
  );
}
