import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { STAR_SYSTEMS } from './starSystemsData';
import { GalaxyMapScene } from './GalaxyMapScene';
import { SolarSystemScene } from './SolarSystemScene';
import { ExoSystemScene } from './ExoSystemScene';
import { BodyDetailPanel } from './BodyDetailPanel';
import { SimControls } from './SimControls';
import { NeoPanel } from './NeoPanel';
import './Galaxy.css';

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
  exit:    { opacity: 0, transition: { duration: 0.22 } },
};

export function GalaxySection() {
  const [ref, inView] = useInView({ rootMargin: '120% 0px 120% 0px' });
  const [view, setView]         = useState('galaxy'); // 'galaxy' | 'solar' | 'exo'
  const [activeSystem, setActiveSystem] = useState(null);
  const [simRunning, setSimRunning]     = useState(true);
  const [timeWarp, setTimeWarp]         = useState(40);
  const [selectedBody, setSelectedBody] = useState(null);

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

  function goBack() {
    setView('galaxy');
    setActiveSystem(null);
    setSelectedBody(null);
  }

  return (
    <section className="galaxy-section" ref={ref} aria-label="Interactive space explorer">
      <div className="galaxy-section-header">
        <div className="galaxy-eyebrow">◈ Space Explorer</div>
        <h2 className="galaxy-title">Navigate the Cosmos</h2>
        <p className="galaxy-sub">
          {view === 'galaxy' && 'The Milky Way · Click any star system to explore'}
          {view === 'solar' && 'Sol — Our Solar System · 8 planets · 4 comets · real orbital data'}
          {view === 'exo' && activeSystem && `${activeSystem.name} — ${activeSystem.spectral} · ${activeSystem.distanceLy.toLocaleString()} ly away`}
        </p>
      </div>

      {view !== 'galaxy' && (
        <button className="galaxy-back-btn" onClick={goBack}>
          ← Galaxy Map
        </button>
      )}

      <div className="galaxy-stage">
        {inView && (
          <AnimatePresence mode="wait">
            {view === 'galaxy' && (
              <motion.div key="galaxy" className="galaxy-view" variants={PAGE} initial="initial" animate="animate" exit="exit">
                <GalaxyMapScene onSelectSystem={enterSystem} />
              </motion.div>
            )}

            {view === 'solar' && (
              <motion.div key="solar" className="solar-view" variants={PAGE} initial="initial" animate="animate" exit="exit">
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
                <NeoPanel />
                <BodyDetailPanel body={selectedBody} onClose={() => setSelectedBody(null)} />
              </motion.div>
            )}

            {view === 'exo' && activeSystem && (
              <motion.div key="exo" className="solar-view" variants={PAGE} initial="initial" animate="animate" exit="exit">
                <ExoSystemScene
                  system={activeSystem}
                  selectedBody={selectedBody}
                  onSelectBody={setSelectedBody}
                />
                <BodyDetailPanel body={selectedBody} onClose={() => setSelectedBody(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {!inView && (
          <div className="galaxy-placeholder">
            <div className="galaxy-placeholder-text">Scroll to load space explorer…</div>
          </div>
        )}
      </div>

      {/* System selector pills (galaxy view only) */}
      {inView && view === 'galaxy' && (
        <div className="system-pills">
          {STAR_SYSTEMS.map((sys) => (
            <button
              key={sys.key}
              className={`system-pill${sys.isSol ? ' sol-pill' : ''}`}
              onClick={() => enterSystem(sys.key)}
            >
              {sys.isSol ? '☀' : '⭐'} {sys.name}
              {sys.distanceLy > 0 && <span className="pill-dist">{sys.distanceLy} ly</span>}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
