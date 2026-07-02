import { useEffect, useState, useMemo } from 'react';
import { computeXP, getLevel } from '../dashboard/AchievementsPanel';

const MISSION_START = new Date('2023-06-01');

function missionDay() {
  return Math.floor((Date.now() - MISSION_START) / 86400000);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStreak() {
  try {
    const raw = localStorage.getItem('vp_streak');
    if (!raw) return { count: 1 };
    const { count, lastDate } = JSON.parse(raw);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today     = todayKey();
    if (lastDate === today)     return { count };
    if (lastDate === yesterday) return { count: count + 1 };
    return { count: 1 };
  } catch { return { count: 1 }; }
}

function saveStreak(count) {
  try { localStorage.setItem('vp_streak', JSON.stringify({ count, lastDate: todayKey() })); } catch {}
}

function getDailyScore() {
  try {
    const raw = localStorage.getItem(`vp_score_${todayKey()}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch { return 0; }
}

export function addDailyScore(pts) {
  try {
    const key = `vp_score_${todayKey()}`;
    const cur = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(cur + pts));
  } catch {}
}

export function MissionDayHeader({ data }) {
  const day    = missionDay();
  const full   = `MISSION DAY ${day}`;
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(getDailyScore);
  const streak = useMemo(() => { const s = getStreak(); saveStreak(s.count); return s.count; }, []);

  const xp    = useMemo(() => computeXP(data), [data]);
  const level = useMemo(() => getLevel(xp), [xp]);

  useEffect(() => {
    let i = 0;
    setTyped('');
    const id = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [full]);

  useEffect(() => {
    const id = setInterval(() => setScore(getDailyScore()), 3000);
    return () => clearInterval(id);
  }, []);

  const dateStr = new Date().toLocaleDateString('en', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  }).toUpperCase();
  const timeStr = new Date().toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mission-day-header">
      <div className="mday-scan-lines" aria-hidden="true" />

      <div className="mday-top-row">
        <div className="mday-eyebrow">◈ MISSION CONTROL · CHENNAI OUTPOST · ACTIVE</div>
        <div className="mday-status-pills">
          <span className="mday-pill streak">🔥 {streak}-DAY STREAK</span>
          <span className="mday-pill score">⚡ {score} OPS PTS TODAY</span>
          <span className="mday-pill level" style={{ borderColor: level.color, color: level.color }}>
            LVL {level.num} {level.name}
          </span>
        </div>
      </div>

      <h1 className="mday-title">
        {typed}
        <span className="mday-cursor" aria-hidden="true">▮</span>
      </h1>

      <div className="mday-sub-row">
        <span className="mday-date">{dateStr}</span>
        <span className="mday-divider">·</span>
        <span className="mday-time">IST {timeStr}</span>
      </div>

      <div className="mday-xp-section">
        <div className="mday-xp-label">
          <span>MISSION XP — {xp.toLocaleString()}</span>
          <span>{level.pct}% to {level.name === 'COMMANDER' ? 'ADMIRAL' : 'next rank'}</span>
        </div>
        <div className="mday-xp-bar-bg">
          <div
            className="mday-xp-bar-fill"
            style={{ width: `${level.pct}%`, background: level.color }}
          />
        </div>
      </div>
    </div>
  );
}
