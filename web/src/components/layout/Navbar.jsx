import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MusicToggle } from '../music/MusicToggle';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/', label: '◈ Explore', end: true },
  { to: '/dashboard', label: '◈ Dashboard' },
  { to: '/briefing', label: '◈ Daily Briefing' },
];

const TZ_LABEL = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
  .formatToParts(new Date()).find((p) => p.type === 'timeZoneName').value;

function useClock() {
  const [time, setTime] = useState('--:--:--');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s} ${TZ_LABEL}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Navbar({ liveStatus }) {
  const clock = useClock();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="mission-badge">Mission Ctrl</div>
        <div className="mission-title">VPSpaceman Dashboard</div>
      </div>

      <nav className="nav-tabs" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="nav-tab-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="topbar-right">
        <MusicToggle />
        <div className="status-pill" title="Dashboard auto-refreshes data.json every 30s">
          <div className="pulse-dot" />
          <span>{liveStatus || 'LIVE · SYNCING…'}</span>
        </div>
        <div className="utc-clock">{clock}</div>
      </div>
    </header>
  );
}
