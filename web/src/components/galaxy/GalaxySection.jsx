import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { STAR_SYSTEMS } from './starSystemsData';
import { GalaxyMapScene } from './GalaxyMapScene';
import { SolarSystemScene } from './SolarSystemScene';
import { ExoSystemScene } from './ExoSystemScene';
import { BodyDetailPanel } from './BodyDetailPanel';
import { SimControls } from './SimControls';
import { ConstellationView } from './ConstellationView';
import './Galaxy.css';

// Cinematic zoom-blur transition — feels like flying through space
const CINEMATIC = {
  initial: { opacity: 0, scale: 0.92, filter: 'blur(12px)' },
  animate: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.22, 0.68, 0.36, 1.0] },
  },
  exit: {
    opacity: 0, scale: 1.06, filter: 'blur(8px)',
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
  },
};

const TABS = [
  { key: 'galaxy',         icon: '◈', label: 'Milky Way'    },
  { key: 'solar',          icon: '☀', label: 'Solar System' },
  { key: 'constellations', icon: '★', label: 'Constellations' },
];

function tabSubtitle(view, activeSystem) {
  if (view === 'galaxy')         return 'The Milky Way · Click any star system to explore';
  if (view === 'solar')          return 'Sol — Our Solar System · 8 planets · 4 comets · real orbital data';
  if (view === 'exo' && activeSystem)
    return `${activeSystem.name} — ${activeSystem.spectral} · ${activeSystem.distanceLy.toLocaleString()} ly away`;
  if (view === 'constellations') return '10 constellations · hover stars to identify · rotate with mouse';
  return '';
}

export function GalaxySection() {
  const [ref, inView] = useInView({ rootMargin: '120% 0px 120% 0px' });
  const [view, setView]             = useState('galaxy');
  const [activeSystem, setActiveSystem] = useState(null);
  const [simRunning, setSimRunning]     = useState(true);
  const [timeWarp, setTimeWarp]         = useState(40);
  const [selectedBody, setSelectedBody] = useState(null);

  // Which tab is "active" for the tab bar highlight (exo is a sub-view of galaxy)
  const activeTab = view === 'exo' ? 'galaxy' : view;

  function enterSystem(key) {
    setSelectedBody(null);
    if (key === 'sol') {
      setView('solar');
      setActiveSystem(null);
    } else {
      const sys = STAR_SYSTEMS.find((s) => s.key === key);
      setActiveSystem(sys || null);
      setView('exo');
    }
  }

  function switchTab(key) {
    setSelectedBody(null);
    setActiveSystem(null);
    setView(key);
  }

  return (
    <section className="galaxy-section" ref={ref} aria-label="Space explorer">
      {/* Header */}
      <div className="galaxy-section-header">
        <div className="galaxy-eyebrow">◈ Space Explorer</div>
        <h2 className="galaxy-title">Navigate the Cosmos</h2>
        <p className="galaxy-sub">{tabSubtitle(view, activeSystem)}</p>
      </div>

      {/* ── Unified tab bar ── */}
      <div className="space-tab-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`space-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => switchTab(t.key)}
          >
            <span className="space-tab-icon">{t.icon}</span>
            <span className="space-tab-label">{t.label}</span>
            {activeTab === t.key && (
              <motion.div className="space-tab-indicator" layoutId="tab-indicator" />
            )}
          </button>
        ))}

        {/* Back button when in exo view */}
        {view === 'exo' && (
          <button className="space-tab-back" onClick={() => { setView('galaxy'); setActiveSystem(null); }}>
            ← Milky Way
          </button>
        )}
      </div>

      {/* ── Stage ── */}
      <div className="galaxy-stage">
        {inView ? (
          <AnimatePresence mode="sync">
            {/* Galaxy map */}
            {view === 'galaxy' && (
              <motion.div key="galaxy" className="galaxy-view" variants={CINEMATIC} initial="initial" animate="animate" exit="exit">
                <GalaxyMapScene onSelectSystem={enterSystem} />
                <div className="system-pills">
                  {STAR_SYSTEMS.map((sys) => (
                    <button key={sys.key} className={`system-pill${sys.isSol ? ' sol-pill' : ''}`}
                      onClick={() => enterSystem(sys.key)}>
                      {sys.isSol ? '☀' : '⭐'} {sys.name}
                      {sys.distanceLy > 0 && <span className="pill-dist">{sys.distanceLy} ly</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Solar system */}
            {view === 'solar' && (
              <motion.div key="solar" className="solar-view" variants={CINEMATIC} initial="initial" animate="animate" exit="exit">
                <SolarSystemScene
                  simRunning={simRunning}
                  timeWarp={timeWarp}
                  selectedBody={selectedBody}
                  onSelectBody={setSelectedBody}
                />
                <SimControls
                  simRunning={simRunning}
                  setSimRunning={setSimRunning}
                  timeWarp={timeWarp}
                  setTimeWarp={setTimeWarp}
                />
                <BodyDetailPanel body={selectedBody} onClose={() => setSelectedBody(null)} />
              </motion.div>
            )}

            {/* Exo system */}
            {view === 'exo' && activeSystem && (
              <motion.div key={`exo-${activeSystem.key}`} className="solar-view" variants={CINEMATIC} initial="initial" animate="animate" exit="exit">
                {/* ── Floating system-switcher bar ── */}
                <div className="exo-quick-switch">
                  <button className="eqs-back" onClick={() => { setView('galaxy'); setActiveSystem(null); setSelectedBody(null); }}>
                    ◈ Galaxy Map
                  </button>
                  <span className="eqs-divider" />
                  {STAR_SYSTEMS.filter((s) => !s.isSol).map((sys) => (
                    <button
                      key={sys.key}
                      className={`eqs-btn${activeSystem.key === sys.key ? ' active' : ''}`}
                      style={{ '--sc': sys.starColor ? `#${sys.starColor.toString(16).padStart(6, '0')}` : '#fff0c0' }}
                      onClick={() => { setSelectedBody(null); enterSystem(sys.key); }}
                    >
                      <span className="eqs-dot" />
                      <span className="eqs-name">{sys.name}</span>
                    </button>
                  ))}
                  <span className="eqs-divider" />
                  <button className="eqs-sol-btn" onClick={() => { setSelectedBody(null); enterSystem('sol'); }}>
                    ☀ Sol
                  </button>
                </div>
                <ExoSystemScene
                  system={activeSystem}
                  selectedBody={selectedBody}
                  onSelectBody={setSelectedBody}
                />
                <BodyDetailPanel body={selectedBody} onClose={() => setSelectedBody(null)} />
              </motion.div>
            )}

            {/* Constellations */}
            {view === 'constellations' && (
              <motion.div key="constellations" className="galaxy-view" variants={CINEMATIC} initial="initial" animate="animate" exit="exit">
                <ConstellationView />
              </motion.div>
            )}

          </AnimatePresence>
        ) : (
          <div className="galaxy-placeholder">
            <div className="galaxy-placeholder-text">Scroll to load space explorer…</div>
          </div>
        )}
      </div>
    </section>
  );
}
