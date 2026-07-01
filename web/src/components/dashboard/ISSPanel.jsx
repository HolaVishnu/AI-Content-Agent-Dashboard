import { useEffect, useState } from 'react';

const CHENNAI_LAT = 13.0827;
const CHENNAI_LON = 80.2707;

function toRad(d) { return d * Math.PI / 180; }

function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toXY(lat, lon) {
  return { x: ((lon + 180) / 360) * 360, y: ((90 - lat) / 180) * 180 };
}

function ISSMap({ lat, lon, trail }) {
  const iss = toXY(lat, lon);
  const chennai = toXY(CHENNAI_LAT, CHENNAI_LON);

  return (
    <svg viewBox="0 0 360 180" className="iss-map" xmlns="http://www.w3.org/2000/svg">
      <rect width="360" height="180" fill="rgba(5,5,14,0.6)" rx="6" />
      {[-60, -30, 0, 30, 60].map((latLine) => {
        const y = ((90 - latLine) / 180) * 180;
        return <line key={latLine} x1="0" y1={y} x2="360" y2={y}
          stroke={latLine === 0 ? 'rgba(0,240,208,0.18)' : 'rgba(255,255,255,0.05)'} strokeWidth={latLine === 0 ? 0.8 : 0.4} />;
      })}
      {[-120, -60, 0, 60, 120].map((lonLine) => {
        const x = ((lonLine + 180) / 360) * 360;
        return <line key={lonLine} x1={x} y1="0" x2={x} y2="180"
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />;
      })}
      <rect x="0" y={((90 - 51.6) / 180) * 180} width="360" height={(51.6 * 2 / 180) * 180}
        fill="rgba(0,240,208,0.03)" />
      {trail.map((pt, i) => {
        if (i === 0) return null;
        const prev = trail[i - 1];
        if (Math.abs(pt.lon - prev.lon) > 90) return null;
        const p = toXY(prev.lat, prev.lon);
        const c = toXY(pt.lat, pt.lon);
        return <line key={i} x1={p.x} y1={p.y} x2={c.x} y2={c.y}
          stroke="rgba(0,240,208,0.6)" strokeWidth="0.8"
          opacity={(i / trail.length) * 0.7} />;
      })}
      <circle cx={chennai.x} cy={chennai.y} r="2" fill="#FFC83D" />
      <circle cx={iss.x} cy={iss.y} r="5" fill="none" stroke="rgba(0,240,208,0.5)" strokeWidth="1" />
      <circle cx={iss.x} cy={iss.y} r="2.5" fill="#00F0D0" />
      <text x={iss.x + 6} y={iss.y + 1} fontSize="6" fill="rgba(0,240,208,0.9)" fontFamily="monospace">ISS</text>
      <text x={chennai.x + 3} y={chennai.y - 2} fontSize="4.5" fill="rgba(255,200,61,0.7)" fontFamily="monospace">Chennai</text>
    </svg>
  );
}

export function ISSPanel() {
  const [iss, setIss] = useState(null);
  const [err, setErr] = useState(false);
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (cancelled) return;
        setIss(d);
        setErr(false);
        setTrail((prev) => {
          const next = [...prev, { lat: d.latitude, lon: d.longitude }];
          return next.length > 24 ? next.slice(-24) : next;
        });
      } catch {
        if (!cancelled) setErr(true);
      }
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const dist = iss ? distKm(CHENNAI_LAT, CHENNAI_LON, iss.latitude, iss.longitude) : null;

  return (
    <div className="glass-card iss-panel">
      <div className="panel-title">
        ◈ ISS Live Tracker
        {iss && <span className="iss-live-badge">● LIVE · 5s</span>}
      </div>
      {err && <div className="panel-empty">Signal lost · retrying…</div>}
      {!iss && !err && <div className="panel-empty iss-acquiring">Acquiring signal…</div>}
      {iss && (
        <>
          <ISSMap lat={iss.latitude} lon={iss.longitude} trail={trail} />
          <div className="iss-stats-grid">
            <div className="iss-stat">
              <div className="iss-stat-label">Latitude</div>
              <div className="iss-stat-val">{iss.latitude.toFixed(2)}°</div>
            </div>
            <div className="iss-stat">
              <div className="iss-stat-label">Longitude</div>
              <div className="iss-stat-val">{iss.longitude.toFixed(2)}°</div>
            </div>
            <div className="iss-stat">
              <div className="iss-stat-label">Altitude</div>
              <div className="iss-stat-val aurora">{Math.round(iss.altitude)} km</div>
            </div>
            <div className="iss-stat">
              <div className="iss-stat-label">Velocity</div>
              <div className="iss-stat-val">{Math.round(iss.velocity).toLocaleString()} km/h</div>
            </div>
            <div className="iss-stat">
              <div className="iss-stat-label">Visibility</div>
              <div className={`iss-stat-val ${iss.visibility === 'daylight' ? 'gold' : 'aurora'}`}>
                {iss.visibility}
              </div>
            </div>
            <div className="iss-stat">
              <div className="iss-stat-label">Dist. Chennai</div>
              <div className="iss-stat-val">{dist?.toLocaleString()} km</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
