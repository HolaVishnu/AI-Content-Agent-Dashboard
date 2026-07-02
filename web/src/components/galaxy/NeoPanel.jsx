import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJsonFetch } from '../../hooks/useJsonFetch';

export function NeoPanel({ onSelect }) {
  const { data, loading } = useJsonFetch('/neows.json');
  const [open, setOpen] = useState(false);
  const objects   = data?.objects || [];
  const hazCount  = objects.filter((o) => o.hazardous).length;
  const safeCount = objects.length - hazCount;

  return (
    <div className="neo-hud">
      <AnimatePresence>
        {open && (
          <motion.div
            className="neo-hud-panel"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 0.68, 0.36, 1] }}
          >
            {/* Panel header */}
            <div className="neo-hud-ph">
              <span className="neo-hud-ph-icon">☄</span>
              <div className="neo-hud-ph-text">
                <span className="neo-hud-ph-title">NEAR-EARTH OBJECTS</span>
                <span className="neo-hud-ph-sub">
                  {objects.length} tracked · 7-day window ·
                  <span className="neo-ph-safe"> {safeCount} safe</span>
                  <span className="neo-ph-haz"> · ⚠ {hazCount} hazardous</span>
                </span>
              </div>
              <button className="neo-hud-ph-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Table */}
            <div className="neo-hud-table-wrap">
              {loading ? (
                <div className="neo-hud-empty">Loading NEO data…</div>
              ) : objects.length === 0 ? (
                <div className="neo-hud-empty">No data — run scripts/pull-neows.js</div>
              ) : (
                <table className="neo-hud-table">
                  <thead>
                    <tr>
                      <th>Object</th>
                      <th>Approach Date</th>
                      <th>Miss Distance</th>
                      <th>Diameter</th>
                      <th>Velocity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objects.map((o, i) => (
                      <tr
                        key={i}
                        className={`neo-hud-row${o.hazardous ? ' neo-row-haz' : ''}`}
                        onClick={() => {
                          onSelect({
                            name: o.name,
                            type: 'Near-Earth Object',
                            desc: `Close approach: ${o.closeApproachDate} · Miss distance: ${o.missDistanceLunar} LD (${Number(o.missDistanceKm).toLocaleString()} km) · Relative velocity: ${o.velocityKmS} km/s · Estimated diameter: ${o.diameterMinM}–${o.diameterMaxM} m${o.hazardous ? ' · ⚠ POTENTIALLY HAZARDOUS ASTEROID' : ''}`,
                          });
                          setOpen(false);
                        }}
                      >
                        <td className="neo-td-name">
                          <span className={`neo-status-dot ${o.hazardous ? 'haz' : 'safe'}`} />
                          <span className="neo-name-text">{o.name}</span>
                          {o.hazardous && <span className="neo-haz-tag">HAZ</span>}
                        </td>
                        <td>{o.closeApproachDate}</td>
                        <td className="neo-td-dist">{o.missDistanceLunar} LD</td>
                        <td>{o.diameterMinM}–{o.diameterMaxM} m</td>
                        <td className="neo-td-vel">{o.velocityKmS} km/s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible toggle badge */}
      <button
        className={`neo-hud-badge${open ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="neo-badge-comet">☄</span>
        <span className="neo-badge-label">NEO TRACKER</span>
        {!loading && (
          <>
            <span className="neo-badge-sep" />
            <span className="neo-badge-safe">{safeCount} safe</span>
            {hazCount > 0 && (
              <span className="neo-badge-haz">
                <span className="neo-haz-pulse" />
                {hazCount} HAZ
              </span>
            )}
          </>
        )}
        <span className="neo-badge-caret">{open ? '▼' : '▲'}</span>
      </button>
    </div>
  );
}
