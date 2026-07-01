import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AstronautSVG } from './AstronautSVG';

const STATS = [
  { value: '840',   label: 'Followers'    },
  { value: '47',    label: 'Transmissions'},
  { value: '12.3%', label: 'Engagement'   },
];

const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.28 } },
  exit:    { opacity: 0, transition: { duration: 0.22 } },
};

const card = {
  initial: { opacity: 0, scale: 0.93, y: 28 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 0.8, 0.24, 1] } },
  exit:    { opacity: 0, scale: 0.97, y: 14, transition: { duration: 0.22 } },
};

export function HeroLightbox({ open, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox-overlay"
          variants={overlay}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog"
          aria-modal="true"
          aria-label="Creator dossier"
        >
          <button className="lightbox-close" onClick={onClose} aria-label="Close dossier">
            ✕ Close
          </button>

          <motion.div className="lightbox-inner" variants={card}>
            <div className="lightbox-photo">
              <AstronautSVG />
            </div>
            <div className="lightbox-text">
              <span className="lightbox-tag">◈ Crew Dossier</span>
              <h3 className="lightbox-name">@vpspaceman</h3>
              <p>Rides into India's darkest corners chasing clear skies — combining motorbike travel vlogging with deep-sky astrophotography. Self-taught, self-funded, self-propelled.</p>
              <p>On a mission to make the night sky feel reachable for everyone who has never seen the Milky Way with their own eyes.</p>
              <div className="lightbox-stats">
                {STATS.map(({ value, label }) => (
                  <div key={label} className="lightbox-stat">
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
