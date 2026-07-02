import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Universe.css';

export const COSMIC_SCALES = [
  { key:'solar-system',      name:'Solar System',        size:'~1 light-day across',
    color:'#4af0ff', r:8,
    desc:'The Sun and its eight planets — vanishingly small at this scale, but home.' },
  { key:'local-bubble',      name:'Local Bubble',         size:'~1,000 light-years across',
    color:'#6655ff', r:16,
    desc:'A low-density cavity in the interstellar medium, carved by ancient supernovae, that the Sun currently drifts through.' },
  { key:'milky-way',         name:'Milky Way',            size:'~100,000 light-years across',
    color:'#9944ee', r:24,
    desc:'Our home galaxy — a barred spiral of 200–400 billion stars, 13.6 billion years old.' },
  { key:'local-group',       name:'Local Group',          size:'~10 million light-years across',
    color:'#cc44cc', r:33,
    desc:'A gravitationally bound group of ~80 galaxies including the Milky Way, Andromeda, and Triangulum.' },
  { key:'virgo-supercluster',name:'Virgo Supercluster',   size:'~110 million light-years across',
    color:'#ee4466', r:42,
    desc:'A vast supercluster of galaxy groups, including the Local Group, all loosely bound by gravity.' },
  { key:'observable-universe',name:'Observable Universe', size:'~93 billion light-years across',
    color:'#ff7733', r:50,
    desc:'The full extent of space we can observe from Earth, containing an estimated 2 trillion galaxies.' },
];

export function UniverseSection() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered]   = useState(null);

  return (
    <section className="universe-section" aria-label="Observable universe scale explorer">
      <div className="universe-header">
        <div className="universe-eyebrow">◈ Cosmic Perspective</div>
        <h2 className="universe-title">The Observable Universe</h2>
        <p className="universe-sub">Each ring is a scale of existence — hover to explore, click for details</p>
      </div>

      <div className="universe-stage">
        {/* Star dots background */}
        <div className="universe-stars" aria-hidden="true">
          {Array.from({ length: 80 }, (_, i) => (
            <div
              key={i}
              className="universe-star-dot"
              style={{
                left: `${Math.random() * 100}%`,
                top:  `${Math.random() * 100}%`,
                width:  `${1 + Math.random() * 1.5}px`,
                height: `${1 + Math.random() * 1.5}px`,
                opacity: 0.3 + Math.random() * 0.5,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* SVG rings */}
        <svg className="universe-svg" viewBox="0 0 110 110" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            {COSMIC_SCALES.map((s) => (
              <filter key={`glow-${s.key}`} id={`glow-${s.key}`}>
                <feGaussianBlur stdDeviation={hovered === s.key ? '1.6' : '0.8'} result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            ))}
          </defs>

          {COSMIC_SCALES.map((s, i) => (
            <g key={s.key}>
              <circle
                cx="55" cy="55" r={s.r}
                fill="none"
                stroke={s.color}
                strokeWidth={hovered === s.key || selected?.key === s.key ? 1.0 : 0.45}
                opacity={hovered === s.key || selected?.key === s.key ? 1 : 0.5 + i * 0.07}
                filter={`url(#glow-${s.key})`}
                className="universe-ring"
                style={{ '--ring-delay': `${i * 0.18}s`, '--ring-color': s.color }}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s)}
                cursor="pointer"
              />
              {/* Label dot at ~60° position */}
              <circle
                cx={55 + s.r * Math.cos(Math.PI / 3)}
                cy={55 - s.r * Math.sin(Math.PI / 3)}
                r={hovered === s.key ? 1.8 : 1.1}
                fill={s.color}
                opacity={hovered === s.key ? 1 : 0.7}
                filter={`url(#glow-${s.key})`}
                onMouseEnter={() => setHovered(s.key)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(s)}
                cursor="pointer"
                className="universe-ring-dot"
              />
            </g>
          ))}

          {/* You Are Here */}
          <circle cx="55" cy="55" r="1.5" fill="#00F5D4" />
          <circle cx="55" cy="55" r="3.0" fill="none" stroke="#00F5D4" strokeWidth="0.4" opacity="0.5" className="universe-you-pulse" />
          <text x="55" y="49" textAnchor="middle" fill="#00F5D4" fontSize="2.8" fontFamily="monospace" opacity="0.7">YOU ARE HERE</text>
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hovered && !selected && (
            <motion.div
              className="universe-hover-tip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key={hovered}
            >
              {(() => { const s = COSMIC_SCALES.find(x => x.key === hovered);
                return s ? <><strong>{s.name}</strong><span>{s.size}</span></> : null; })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scale pills */}
      <div className="universe-pills">
        {COSMIC_SCALES.map((s) => (
          <button
            key={s.key}
            className={`universe-pill${selected?.key === s.key ? ' active' : ''}`}
            style={{ '--pill-color': s.color }}
            onClick={() => setSelected(prev => prev?.key === s.key ? null : s)}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Selected detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="universe-detail"
            style={{ '--detail-color': selected.color }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            key={selected.key}
          >
            <button className="universe-detail-close" onClick={() => setSelected(null)}>✕</button>
            <div className="universe-detail-name" style={{ color: selected.color }}>{selected.name}</div>
            <div className="universe-detail-type">{selected.size}</div>
            <p className="universe-detail-desc">{selected.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
