import { useEffect, useRef, useState } from 'react';

const REFRESH_INTERVAL_MS = 30000;

// Ports the static site's refreshDashboard()/tickLiveStatus() polling loop:
// fetch data.json (cache-busted), re-fetch every 30s, and expose a
// human-readable "LIVE · SYNCED ..." / "NEXT SYNC IN Ns" status string.
export function useDashboardData() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('LIVE · SYNCING…');
  const lastRefreshAt = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const base = import.meta.env.BASE_URL.replace(/\/$/, '');
        const res = await fetch(`${base}/data.json?t=` + Date.now());
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        lastRefreshAt.current = Date.now();
        setStatus('LIVE · SYNCED ' + new Date().toLocaleTimeString());
      } catch (e) {
        if (!cancelled) {
          console.error('Failed to load data.json:', e);
          setStatus('⚠ SYNC FAILED — RETRYING');
        }
      }
    }

    load();
    const refreshTimer = setInterval(load, REFRESH_INTERVAL_MS);
    const tickTimer = setInterval(() => {
      if (!lastRefreshAt.current) return;
      const secs = Math.round((Date.now() - lastRefreshAt.current) / 1000);
      if (secs >= 3) {
        setStatus(`LIVE · NEXT SYNC IN ${Math.max(0, Math.round(REFRESH_INTERVAL_MS / 1000 - secs))}s`);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(refreshTimer);
      clearInterval(tickTimer);
    };
  }, []);

  return { data, status };
}
