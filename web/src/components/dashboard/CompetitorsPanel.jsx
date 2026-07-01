import { fmt, avgLikes, avgEng } from '../../utils/dashboardUtils';
import { GlassCard } from '../ui/GlassCard';

const BAR_COLORS = ['#00F5D4', '#7B2FBE', '#FF4466', '#FFD700', '#1B4FD8'];

export function CompetitorsPanel({ data }) {
  const me   = data?.me || 'vpspaceman';
  const all  = [me, ...(data?.competitors || [])];
  const maxF = Math.max(...all.map((h) => data?.profiles?.[h]?.followersCount || 0), 1);

  return (
    <GlassCard className="panel competitors-panel">
      <h3 className="panel-title">◈ Signal Comparison</h3>
      <div className="comp-list">
        {all.map((handle, i) => {
          const profile = data?.profiles?.[handle] || {};
          const posts   = data?.posts?.[handle]    || [];
          const pct     = Math.round((profile.followersCount || 0) / maxF * 100);
          const isMe    = handle === me;
          return (
            <div key={handle} className={`comp-item${isMe ? ' you' : ''}`}>
              <div className="comp-row">
                <span className={`comp-handle${isMe ? ' you-handle' : ''}`}>
                  @{handle}{isMe ? ' ◈' : ''}
                </span>
                <span className="comp-followers">{fmt(profile.followersCount || 0)}</span>
              </div>
              <div className="comp-bar-bg">
                <div
                  className="comp-bar-fill"
                  style={{
                    width: pct + '%',
                    background: `linear-gradient(90deg, ${BAR_COLORS[i % BAR_COLORS.length]}, ${BAR_COLORS[(i + 1) % BAR_COLORS.length]})`,
                  }}
                />
              </div>
              <div className="comp-eng">
                {avgEng(posts)}% eng · {fmt(avgLikes(posts))} avg likes
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
