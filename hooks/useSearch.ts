"use client";

import { useEffect, useState } from 'react';

export type Verse = { ref: string; text: string };

export function useSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const id = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q, scope: 'all' }),
        })
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
        const json = await resp.json()
        setResults(Array.isArray(json?.results) ? json.results : [])
      } catch (e: any) {
        setError(e?.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(id)
  }, [q])

  return { q, setQ, results, loading, error };
}
