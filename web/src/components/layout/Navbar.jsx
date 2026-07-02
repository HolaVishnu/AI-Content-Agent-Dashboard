import { useEffect, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MusicToggle } from '../music/MusicToggle';
import { computeXP, getLevel } from '../dashboard/AchievementsPanel';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/', label: '◈ Explore', end: true },
  { to: '/dashboard', label: '◈ Dashboard' },
  { to: '/briefing', label: '◈ Daily Briefing' },
];

const TZ_LABEL = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
  .formatToParts(new Date()).find((p) => p.type === 'timeZoneName').value;

const MISSION_START = new Date('2023-06-01');

function useClock() {
  const [time, setTime] = useState({ ist: '--:--:--', met: 'T+000:00:00' });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const elapsedMs = now - MISSION_START;
      const totalSec  = Math.floor(elapsedMs / 1000);
      const days       = Math.floor(totalSec / 86400);
      const hrs        = Math.floor((totalSec % 86400) / 3600);
      const mins       = Math.floor((totalSec % 3600) / 60);
      const secs       = totalSec % 60;
      setTime({
        ist: `${h}:${m}:${s} ${TZ_LABEL}`,
        met: `T+${String(days).padStart(3, '0')}:${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Navbar({ liveStatus, data }) {
  const { ist, met } = useClock();
  const xp    = useMemo(() => computeXP(data), [data]);
  const level = useMemo(() => getLevel(xp), [xp]);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="mission-badge">Mission Ctrl</div>
        <div className="mission-title">VPSpaceman</div>
        <div className="nav-level-pill" style={{ borderColor: level.color, color: level.color }}
          title={`${xp.toLocaleString()} XP · ${level.pct}% to next rank`}>
          LVL {level.num} {level.name}
        </div>
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
        <div className="clock-block">
          <div className="utc-clock">{ist}</div>
          <div className="met-clock">{met}</div>
        </div>
      </div>
    </header>
  );
}
