import { Fragment } from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

// Decorative floating icons — CSS/Framer only, no 4th WebGL canvas
const FLOATERS = [
  { icon: '🚀', left: '8%',  duration: 6.2, delay: 0 },
  { icon: '🪐', left: '24%', duration: 8.5, delay: 1.4 },
  { icon: '⭐', left: '42%', duration: 5.8, delay: 0.7 },
  { icon: '🛸', left: '63%', duration: 7.1, delay: 2.1 },
  { icon: '🌌', left: '80%', duration: 9.0, delay: 0.3 },
];

const LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/vpspaceman' },
  { label: 'YouTube', href: 'https://youtube.com/@vpspaceman' },
  { label: 'GitHub', href: 'https://github.com/vpspaceman' },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-floaters" aria-hidden="true">
        {FLOATERS.map(({ icon, left, duration, delay }) => (
          <motion.span
            key={left}
            className="footer-floater"
            style={{ left }}
            animate={{ y: [0, -22, 0] }}
            transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            {icon}
          </motion.span>
        ))}
      </div>

      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">VPSpaceman</span>
          <p className="footer-tagline">Exploring the cosmos. One post at a time.</p>
        </div>

        <nav className="footer-links" aria-label="Social links">
          {LINKS.map(({ label, href }, i) => (
            <Fragment key={label}>
              <a href={href} className="footer-link" target="_blank" rel="noopener noreferrer">
                {label}
              </a>
              {i < LINKS.length - 1 && <span className="footer-divider" aria-hidden="true" />}
            </Fragment>
          ))}
        </nav>

        <p className="footer-copy">
          © {new Date().getFullYear()} VP Spaceman · Mission Control Dashboard
        </p>
      </div>
    </footer>
  );
}
