import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ── Rarity system ─────────────────────────────────────────────────────────────
const RARITY = {
  COMMON:    { label: 'COMMON',    color: '#9090a8', glow: 'rgba(144,144,168,0.35)', dim: 'rgba(144,144,168,0.12)' },
  RARE:      { label: 'RARE',      color: '#5C8CFF', glow: 'rgba(92,140,255,0.45)',  dim: 'rgba(92,140,255,0.12)'  },
  EPIC:      { label: 'EPIC',      color: '#b96cff', glow: 'rgba(185,108,255,0.50)', dim: 'rgba(185,108,255,0.12)' },
  LEGENDARY: { label: 'LEGENDARY', color: '#FFC83D', glow: 'rgba(255,200,61,0.55)', dim: 'rgba(255,200,61,0.12)'  },
};

const BADGE_DEFS = [
  {
    id: 'launch',   icon: '🚀', name: 'LAUNCH DAY',        rarity: 'COMMON',
    desc: 'First post transmitted to the cosmos',
    unlocked: (d) => (d?.posts?.vpspaceman?.length || 0) >= 1,
    xp: 100,
  },
  {
    id: 'reel5',    icon: '🎬', name: 'REEL DIRECTOR',     rarity: 'RARE',
    desc: '5+ reels published to the feed',
    unlocked: (d) => (d?.posts?.vpspaceman?.filter((p) => p.mediaType === 'reel').length || 0) >= 5,
    xp: 250,
  },
  {
    id: 'post20',   icon: '📡', name: 'SIGNAL CORPS',      rarity: 'RARE',
    desc: '20+ posts transmitted',
    unlocked: (d) => (d?.posts?.vpspaceman?.length || 0) >= 20,
    xp: 300,
  },
  {
    id: 'eng4',     icon: '📊', name: 'HIGH SIGNAL',       rarity: 'EPIC',
    desc: 'Achieve 4%+ engagement rate',
    unlocked: (d) => parseFloat(avgEng(d?.posts?.vpspaceman || [])) >= 4,
    xp: 400,
  },
  {
    id: 'night',    icon: '🌌', name: 'NIGHT RIDER',       rarity: 'EPIC',
    desc: 'Astrophotography content pioneer',
    unlocked: () => true,
    xp: 200,
  },
  {
    id: '500f',     icon: '⭐', name: '500 ORBIT',          rarity: 'RARE',
    desc: '500+ followers in the constellation',
    unlocked: (d) => (d?.profiles?.vpspaceman?.followersCount || 0) >= 500,
    xp: 500,
  },
  {
    id: '1kf',      icon: '🌟', name: '1K MISSION',         rarity: 'LEGENDARY',
    desc: '1,000+ followers reached',
    unlocked: (d) => (d?.profiles?.vpspaceman?.followersCount || 0) >= 1000,
    xp: 1000,
  },
  {
    id: 'dark-sky', icon: '🔭', name: 'DARK SKY PIONEER',  rarity: 'EPIC',
    desc: "India's space creator niche — charted",
    unlocked: () => true,
    xp: 350,
  },
];

// ── Single hex badge ──────────────────────────────────────────────────────────
function HexBadge({ badge, active, index }) {
  const [hovered, setHovered] = useState(false);
  const r = RARITY[badge.rarity];

  return (
    <motion.div
      className="hb-container"
      initial={{ opacity: 0, scale: 0.55, y: 18 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 320, damping: 26 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Hexagon patch */}
      <motion.div
        className={`hb-outer ${active ? 'hb-active' : 'hb-locked'}`}
        style={{ '--rc': r.color, '--rd': r.dim }}
        whileHover={active ? { scale: 1.1 } : { scale: 1.03 }}
        animate={active && hovered
          ? { filter: `drop-shadow(0 0 14px ${r.color}) drop-shadow(0 0 5px ${r.glow})` }
          : active
            ? { filter: `drop-shadow(0 0 6px ${r.glow})` }
            : { filter: 'none' }
        }
        transition={{ duration: 0.25 }}
      >
        <div className={`hb-inner${active ? '' : ' hb-inner-locked'}`}>
          {active ? (
            <>
              <span className="hb-icon">{badge.icon}</span>
              {badge.rarity === 'LEGENDARY' && <div className="hb-shimmer" />}
            </>
          ) : (
            <div className="hb-classified">
              <span className="hb-lock">🔒</span>
              <span className="hb-cls-text">CLASSIFIED</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Label below hex */}
      <div className={`hb-name${active ? '' : ' hb-name-locked'}`}>{badge.name}</div>
      <div className="hb-rarity" style={{ color: active ? r.color : 'rgba(255,255,255,0.2)' }}>
        {badge.rarity}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="hb-tooltip"
            initial={{ opacity: 0, y: 8,  scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: 8,  scale: 0.94 }}
            transition={{ duration: 0.14 }}
          >
            <div className="hbt-icon">{active ? badge.icon : '🔒'}</div>
            <div className="hbt-name" style={{ color: r.color }}>{badge.name}</div>
            <div className="hbt-desc">
              {active ? badge.desc : `Unlock: ${badge.desc.toLowerCase()}`}
            </div>
            <div className="hbt-footer">
              <span className="hbt-xp" style={{ color: r.color }}>+{badge.xp} XP</span>
              <span className="hbt-rar" style={{ color: r.color, borderColor: `${r.color}44` }}>
                {badge.rarity}
              </span>
            </div>
            {!active && (
              <div className="hbt-locked-bar">
                <span>ACCESS DENIED</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function AchievementsPanel({ data }) {
  const xp     = useMemo(() => computeXP(data), [data]);
  const level  = useMemo(() => getLevel(xp), [xp]);
  const days   = daysSinceMissionStart();
  const badges = BADGE_DEFS.map((b) => ({ ...b, active: b.unlocked(data) }));
  const unlocked = badges.filter((b) => b.active).length;

  return (
    <div className="glass-card achievements-panel">
      {/* Rank row */}
      <div className="rank-row">
        <div className="rank-level-block">
          <div className="rank-level-num">LVL {level.num}</div>
          <div className="rank-level-name" style={{ color: level.color }}>{level.name}</div>
        </div>
        <div className="rank-xp-block">
          <div className="rank-xp-label">Mission XP</div>
          <div className="rank-xp-val">{xp.toLocaleString()}</div>
          <div className="rank-xp-bar-bg">
            <motion.div
              className="rank-xp-bar-fill"
              style={{ background: level.color }}
              initial={{ width: 0 }}
              animate={{ width: `${level.pct}%` }}
              transition={{ duration: 1.2, ease: [0.22, 0.68, 0.36, 1] }}
            />
          </div>
          <div className="rank-xp-next">{level.pct}% to next rank</div>
        </div>
        <div className="rank-days-block">
          <div className="rank-days-val">{days}</div>
          <div className="rank-days-label">Mission Days</div>
        </div>
      </div>

      {/* Achievements header */}
      <div className="ach-header">
        <span className="ach-count-label">Mission Patches</span>
        <div className="ach-header-right">
          {/* Mini rarity legend */}
          {Object.entries(RARITY).map(([key, r]) => (
            <span key={key} className="ach-legend-dot" style={{ color: r.color }}>
              ⬡ {key}
            </span>
          ))}
          <span className="ach-count">{unlocked}/{badges.length} unlocked</span>
        </div>
      </div>

      {/* Hex badge grid */}
      <div className="hb-grid">
        {badges.map((b, i) => (
          <HexBadge key={b.id} badge={b} active={b.active} index={i} />
        ))}
      </div>
    </div>
  );
}
