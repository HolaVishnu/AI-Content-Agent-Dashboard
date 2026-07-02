import { useMemo, useState } from 'react';
import { avgEng } from '../../utils/dashboardUtils';

const MISSION_START = new Date('2023-06-01');

export function computeXP(data) {
  const posts     = data?.posts?.vpspaceman     || [];
  const followers = data?.profiles?.vpspaceman?.followersCount || 0;
  const reels     = posts.filter((p) => p.mediaType === 'reel');
  let xp = posts.length * 100 + reels.length * 50;
  [100, 500, 1000, 5000, 10000].forEach((m) => { if (followers >= m) xp += m; });
  const eng = parseFloat(avgEng(posts));
  if (eng >= 5) xp += 800;
  else if (eng >= 3) xp += 300;
  return xp;
}

export function getLevel(xp) {
  const tiers = [
    { name: 'CADET',     next: 500,   color: '#888899' },
    { name: 'SCOUT',     next: 1200,  color: '#5C8CFF' },
    { name: 'NAVIGATOR', next: 2500,  color: '#9B4FDE' },
    { name: 'PILOT',     next: 4500,  color: '#00F0D0' },
    { name: 'COMMANDER', next: 8000,  color: '#FFC83D' },
    { name: 'ADMIRAL',   next: 99999, color: '#FF4466' },
  ];
  const tier = tiers.filter((t) => xp >= (tiers.indexOf(t) === 0 ? 0 : tiers[tiers.indexOf(t) - 1].next)).pop() || tiers[0];
  const prev = tiers[tiers.indexOf(tier) - 1]?.next || 0;
  const pct  = Math.min(100, Math.round(((xp - prev) / (tier.next - prev)) * 100));
  return { ...tier, xp, pct, num: tiers.indexOf(tier) + 1 };
}

function daysSinceMissionStart() {
  return Math.floor((Date.now() - MISSION_START) / 86400000);
}

const BADGE_DEFS = [
  {
    id: 'launch',   icon: '🚀', name: 'LAUNCH DAY',
    desc: 'First post transmitted',
    unlocked: (d) => (d?.posts?.vpspaceman?.length || 0) >= 1,
    xp: 100,
  },
  {
    id: 'reel5',    icon: '🎬', name: 'REEL DIRECTOR',
    desc: '5+ reels published',
    unlocked: (d) => (d?.posts?.vpspaceman?.filter((p) => p.mediaType === 'reel').length || 0) >= 5,
    xp: 250,
  },
  {
    id: 'post20',   icon: '📡', name: 'SIGNAL CORPS',
    desc: '20+ posts transmitted',
    unlocked: (d) => (d?.posts?.vpspaceman?.length || 0) >= 20,
    xp: 300,
  },
  {
    id: 'eng4',     icon: '📊', name: 'HIGH SIGNAL',
    desc: '4%+ engagement rate',
    unlocked: (d) => parseFloat(avgEng(d?.posts?.vpspaceman || [])) >= 4,
    xp: 400,
  },
  {
    id: 'night',    icon: '🌌', name: 'NIGHT RIDER',
    desc: 'Astrophotography pioneer',
    unlocked: () => true,
    xp: 200,
  },
  {
    id: '500f',     icon: '⭐', name: '500 ORBIT',
    desc: '500+ followers',
    unlocked: (d) => (d?.profiles?.vpspaceman?.followersCount || 0) >= 500,
    xp: 500,
  },
  {
    id: '1kf',      icon: '🌟', name: '1K MISSION',
    desc: '1,000+ followers',
    unlocked: (d) => (d?.profiles?.vpspaceman?.followersCount || 0) >= 1000,
    xp: 1000,
  },
  {
    id: 'dark-sky', icon: '🔭', name: 'DARK SKY PIONEER',
    desc: 'India\'s space creator niche',
    unlocked: () => true,
    xp: 350,
  },
];

function Badge({ badge, active }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`achievement-badge ${active ? 'unlocked' : 'locked'} ${hovered ? 'hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="badge-icon">{active ? badge.icon : '🔒'}</div>
      <div className="badge-name">{badge.name}</div>
      {hovered && (
        <div className="badge-tooltip">
          <div className="badge-tooltip-name">{badge.name}</div>
          <div className="badge-tooltip-desc">{badge.desc}</div>
          <div className="badge-tooltip-xp">+{badge.xp} XP</div>
        </div>
      )}
    </div>
  );
}

export function AchievementsPanel({ data }) {
  const xp    = useMemo(() => computeXP(data), [data]);
  const level = useMemo(() => getLevel(xp), [xp]);
  const days  = daysSinceMissionStart();
  const badges = BADGE_DEFS.map((b) => ({ ...b, active: b.unlocked(data) }));
  const unlocked = badges.filter((b) => b.active).length;

  return (
    <div className="glass-card achievements-panel">
      <div className="panel-title">◈ Mission Rank & Achievements</div>

      <div className="rank-row">
        <div className="rank-level-block">
          <div className="rank-level-num">LVL {level.num}</div>
          <div className="rank-level-name" style={{ color: level.color }}>{level.name}</div>
        </div>
        <div className="rank-xp-block">
          <div className="rank-xp-label">Mission XP</div>
          <div className="rank-xp-val">{xp.toLocaleString()}</div>
          <div className="rank-xp-bar-bg">
            <div className="rank-xp-bar-fill" style={{ width: `${level.pct}%`, background: level.color }} />
          </div>
          <div className="rank-xp-next">{level.pct}% to next rank</div>
        </div>
        <div className="rank-days-block">
          <div className="rank-days-val">{days}</div>
          <div className="rank-days-label">Mission Days</div>
        </div>
      </div>

      <div className="ach-header">
        <span className="ach-count-label">Achievements</span>
        <span className="ach-count">{unlocked}/{badges.length} unlocked</span>
      </div>
      <div className="badges-grid">
        {badges.map((b) => <Badge key={b.id} badge={b} active={b.active} />)}
      </div>
    </div>
  );
}
