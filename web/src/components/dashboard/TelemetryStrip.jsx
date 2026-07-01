import { fmt, avgLikes, avgEng } from '../../utils/dashboardUtils';

export function TelemetryStrip({ data }) {
  const profile = data?.profiles?.['vpspaceman'] || {};
  const posts   = data?.posts?.['vpspaceman']    || [];
  const reels   = posts.filter((p) => p.mediaType === 'reel');
  const sync    = data?.pulledAt ? new Date(data.pulledAt).toLocaleDateString() : '—';

  const items = [
    { label: 'Orbit',        value: fmt(profile.followersCount || 840), sub: 'FOLLOWERS',  color: 'aurora' },
    { label: 'Transmissions',value: profile.postsCount || 47,           sub: 'POSTS',      color: 'white'  },
    { label: 'Signal',       value: avgEng(posts) + '%',                sub: 'ENGAGEMENT', color: 'gold'   },
    { label: 'Avg Likes',    value: fmt(avgLikes(posts)),               sub: 'PER POST',   color: 'aurora' },
    { label: 'Reels',        value: reels.length,                       sub: 'UPLOADED',   color: 'white'  },
    { label: 'Synced',       value: sync,                               sub: 'LAST PULL',  color: 'muted'  },
  ];

  return (
    <div className="telemetry-strip">
      {items.map(({ label, value, sub, color }) => (
        <div key={sub} className={`telem-item ${color}`}>
          <div className="telem-label">{label}</div>
          <div className={`telem-value ${color}`}>{value}</div>
          <div className="telem-sub">{sub}</div>
        </div>
      ))}
    </div>
  );
}
