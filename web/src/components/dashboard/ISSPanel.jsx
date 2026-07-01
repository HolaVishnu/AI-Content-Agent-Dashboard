import { useEffect, useState } from 'react';

const CHENNAI_LAT = 13.0827;
const CHENNAI_LON = 80.2707;
const W = 360;
const H = 180;

function toRad(d) { return d * Math.PI / 180; }

function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toSVG(lon, lat) {
  return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
}

// Decode world-atlas topojson into a single SVG path string
function decodeLandPath(topo) {
  const { scale, translate } = topo.transform;

  // Delta-decode each arc, then project to SVG coords
  const svgArcs = topo.arcs.map(arc => {
    let px = 0, py = 0;
    return arc.map(([dx, dy]) => {
      px += dx; py += dy;
      return toSVG(px * scale[0] + translate[0], py * scale[1] + translate[1]);
    });
  });

  function stitchRing(indices) {
    const pts = [];
    for (const idx of indices) {
      const arc = idx < 0 ? [...svgArcs[~idx]].reverse() : svgArcs[idx];
      pts.push(...(pts.length === 0 ? arc : arc.slice(1)));
    }
    return pts;
  }

  function addRing(arcIndices, out) {
    const pts = stitchRing(arcIndices);
    if (pts.length < 2) return;
    out.push(`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`);
    for (let i = 1; i < pts.length; i++) {
      // Skip if huge jump (dateline crossing artifact)
      if (Math.abs(pts[i][0] - pts[i - 1][0]) > 90) {
        out.push(`M${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`);
      } else {
        out.push(`L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`);
      }
    }
    out.push('Z');
  }

  function geomToD(geom, out) {
    if (!geom) return;
    if (geom.type === 'Polygon')      geom.arcs.forEach(r => addRing(r, out));
    if (geom.type === 'MultiPolygon') geom.arcs.forEach(p => p.forEach(r => addRing(r, out)));
    if (geom.type === 'GeometryCollection') geom.geometries.forEach(g => geomToD(g, out));
  }

  const parts = [];
  geomToD(topo.objects.land, parts);
  return parts.join('');
}

function ISSMap({ lat, lon, trail, landPath }) {
  const [ix, iy]   = toSVG(lon, lat);
  const [chx, chy] = toSVG(CHENNAI_LON, CHENNAI_LAT);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="iss-map" xmlns="http://www.w3.org/2000/svg">
      <rect width={W} height={H} fill="rgba(3,4,14,0.85)" rx="6" />

      {/* Lat/lon grid */}
      {[-60, -30, 0, 30, 60].map((latL) => {
        const y = ((90 - latL) / 180) * H;
        return <line key={latL} x1="0" y1={y} x2={W} y2={y}
          stroke={latL === 0 ? 'rgba(0,240,208,0.15)' : 'rgba(255,255,255,0.04)'}
          strokeWidth={latL === 0 ? 0.7 : 0.35} />;
      })}
      {[-120, -60, 0, 60, 120].map((lonL) => {
        const x = ((lonL + 180) / 360) * W;
        return <line key={lonL} x1={x} y1="0" x2={x} y2={H}
          stroke="rgba(255,255,255,0.04)" strokeWidth="0.35" />;
      })}

      {/* ISS inclination band ±51.6° */}
      <rect x="0" y={((90 - 51.6) / 180) * H} width={W} height={(51.6 * 2 / 180) * H}
        fill="rgba(0,240,208,0.025)" />

      {/* Continent outlines */}
      {landPath && (
        <path d={landPath}
          fill="rgba(40,55,80,0.55)"
          stroke="rgba(80,110,150,0.6)"
          strokeWidth="0.35"
          strokeLinejoin="round" />
      )}

      {/* ISS trail */}
      {trail.map((pt, i) => {
        if (i === 0) return null;
        const prev = trail[i - 1];
        if (Math.abs(pt.lon - prev.lon) > 90) return null;
        const [px, py] = toSVG(prev.lon, prev.lat);
        const [nx, ny] = toSVG(pt.lon, pt.lat);
        return <line key={i} x1={px} y1={py} x2={nx} y2={ny}
          stroke="rgba(0,240,208,0.7)" strokeWidth="0.9"
          opacity={0.25 + (i / trail.length) * 0.65} />;
      })}

      {/* Chennai marker */}
      <circle cx={chx} cy={chy} r="2.2" fill="#FFC83D" />
      <text x={chx + 3} y={chy - 2} fontSize="4.5" fill="rgba(255,200,61,0.8)" fontFamily="monospace">Chennai</text>

      {/* ISS marker */}
      <circle cx={ix} cy={iy} r="5.5" fill="none" stroke="rgba(0,240,208,0.45)" strokeWidth="1" />
      <circle cx={ix} cy={iy} r="2.8" fill="#00F0D0" />
      <text x={ix + 7} y={iy + 1} fontSize="5.5" fill="rgba(0,240,208,0.95)" fontFamily="monospace" fontWeight="bold">ISS</text>
    </svg>
  );
}

export function ISSPanel() {
  const [iss, setIss]         = useState(null);
  const [err, setErr]         = useState(false);
  const [trail, setTrail]     = useState([]);
  const [landPath, setLand]   = useState(null);

  // Load world land outline once
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')
      .then(r => r.json())
      .then(topo => setLand(decodeLandPath(topo)))
      .catch(() => {}); // silently fail — grid still shows
  }, []);

  // Poll ISS every 5 s
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
        setTrail(prev => {
          const next = [...prev, { lat: d.latitude, lon: d.longitude }];
          return next.length > 28 ? next.slice(-28) : next;
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
        {!landPath && !err && <span className="iss-live-badge" style={{ color: 'var(--muted)' }}>loading map…</span>}
      </div>

      {err && <div className="panel-empty">Signal lost · retrying…</div>}
      {!iss && !err && <div className="panel-empty iss-acquiring">Acquiring signal…</div>}

      {iss && (
        <>
          <ISSMap lat={iss.latitude} lon={iss.longitude} trail={trail} landPath={landPath} />
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
