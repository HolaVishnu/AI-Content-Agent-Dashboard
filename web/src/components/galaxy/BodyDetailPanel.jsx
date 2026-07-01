import { motion, AnimatePresence } from 'framer-motion';

function statRows(body) {
  if (!body) return [];
  const rows = [];

  if (body.period !== undefined)
    rows.push({ label: 'Orbital Period', value: body.period < 1 ? `${Math.round(body.period * 365)} days` : `${body.period} yr` });
  if (body.orbit !== undefined)
    rows.push({ label: 'Scene Orbit Radius', value: `${body.orbit} u` });
  if (body.spinDays !== undefined)
    rows.push({ label: 'Axial Rotation', value: `${Math.abs(body.spinDays)} days${body.spinDays < 0 ? ' (retrograde)' : ''}` });
  if (body.orbitAU !== undefined)
    rows.push({ label: 'Semi-Major Axis', value: `${body.orbitAU} AU` });
  if (body.periodDays !== undefined)
    rows.push({ label: 'Orbital Period', value: `${body.periodDays} days` });
  if (body.distanceLy !== undefined)
    rows.push({ label: 'Distance from Earth', value: body.distanceLy === 0 ? '0 ly (Sol system)' : `${body.distanceLy.toLocaleString()} ly` });
  if (body.spectral)
    rows.push({ label: 'Spectral Class', value: body.spectral });
  if (body.designation)
    rows.push({ label: 'Designation', value: body.designation });
  if (body.period && body.a)
    rows.push({ label: 'Semi-Major Axis (real)', value: `${body.a} AU` });
  if (body.e !== undefined)
    rows.push({ label: 'Eccentricity', value: body.e.toFixed(3) });
  if (body.habitable)
    rows.push({ label: 'Habitable Zone', value: '✅ Yes' });

  return rows;
}

export function BodyDetailPanel({ body, onClose }) {
  const rows = statRows(body);

  return (
    <AnimatePresence>
      {body && (
        <motion.div
          className="body-detail-panel"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        >
          <button className="bd-close" onClick={onClose} aria-label="Close">✕</button>

          <div className="bd-header">
            <div className="bd-name">{body.name}</div>
            <div className="bd-type">{body.type || body.spectral || ''}</div>
          </div>

          <p className="bd-desc">{body.desc}</p>

          {rows.length > 0 && (
            <div className="bd-stats">
              {rows.map(({ label, value }) => (
                <div key={label} className="bd-stat">
                  <span className="bd-stat-label">{label}</span>
                  <span className="bd-stat-value">{value}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
