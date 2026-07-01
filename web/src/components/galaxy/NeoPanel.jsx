import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJsonFetch } from '../../hooks/useJsonFetch';

export function NeoPanel() {
  const { data, loading, error } = useJsonFetch('/neows.json');
  const [selected, setSelected] = useState(null);
  const objects = data?.objects || [];

  return (
    <div className="neo-panel">
      <div className="neo-panel-title">
        ☄ Near-Earth Objects
        {!loading && <span className="neo-count">({objects.length})</span>}
      </div>

      {loading && <div className="neo-empty">Loading NEO data…</div>}
      {error && <div className="neo-empty">⚠ {error.message || 'Failed to load'}</div>}
      {!loading && !error && objects.length === 0 && (
        <div className="neo-empty">No data — run scripts/pull-neows.js</div>
      )}

      <div className="neo-list">
        {objects.map((o, i) => (
          <button
            key={i}
            className={`neo-item ${o.hazardous ? 'hazardous' : ''}${selected === i ? ' neo-item--selected' : ''}`}
            onClick={() => setSelected(selected === i ? null : i)}
          >
            <div className="neo-item-name">{o.hazardous ? '⚠ ' : '☄ '}{o.name}</div>
            <div className="neo-item-meta">
              {o.closeApproachDate} · {o.missDistanceLunar} LD
              {o.hazardous && <span className="haz-tag"> · HAZARDOUS</span>}
            </div>

            <AnimatePresence>
              {selected === i && (
                <motion.div
                  className="neo-detail-inline"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="neo-detail-row"><span>Close Approach</span><span>{o.closeApproachDate}</span></div>
                  <div className="neo-detail-row"><span>Miss Distance</span><span>{o.missDistanceLunar} LD</span></div>
                  <div className="neo-detail-row"><span>Distance (km)</span><span>{Number(o.missDistanceKm).toLocaleString()} km</span></div>
                  <div className="neo-detail-row"><span>Velocity</span><span>{o.velocityKmS} km/s</span></div>
                  <div className="neo-detail-row"><span>Diameter</span><span>{o.diameterMinM}–{o.diameterMaxM} m</span></div>
                  <div className="neo-detail-row"><span>Hazardous</span><span>{o.hazardous ? '⚠ Yes' : 'No'}</span></div>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
}
