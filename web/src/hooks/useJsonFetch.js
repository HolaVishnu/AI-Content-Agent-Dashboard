import { useEffect, useState } from 'react';

// Shared one-shot cache-busted JSON fetch hook — used by the NEO, launches,
// space-weather, and news-feed panels (each of those was a near-identical
// fetch function in the old app.js; consolidated here instead of four
// copy-pasted hook files).
export function useJsonFetch(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    fetch(`${base}${path}?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((json) => { if (!cancelled) setData(json); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [path]);

  return { data, error, loading };
}
