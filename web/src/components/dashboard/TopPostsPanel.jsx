import { fmt, avgEng, mediaEmoji } from '../../utils/dashboardUtils';
import { GlassCard } from '../ui/GlassCard';

export function TopPostsPanel({ data }) {
  const posts = data?.posts?.['vpspaceman'] || [];
  const top   = [...posts].sort((a, b) => b.likesCount - a.likesCount).slice(0, 4);

  return (
    <GlassCard className="panel top-posts-panel">
      <h3 className="panel-title">◈ Top Posts</h3>
      {top.length === 0 ? (
        <div className="panel-empty">No post data — run scripts/pull-real-posts.js</div>
      ) : (
        <div className="post-list">
          {top.map((p, i) => (
            <div key={i} className="post-item">
              <div className="post-rank">{String(i + 1).padStart(2, '0')}</div>
              <div className="post-badge">{mediaEmoji(p.mediaType)}</div>
              <div className="post-body">
                <div className="post-caption">
                  {p.caption.slice(0, 90)}{p.caption.length > 90 ? '…' : ''}
                </div>
                <div className="post-stats">
                  <span className="post-stat">❤ {fmt(p.likesCount)}</span>
                  <span className="post-stat">💬 {p.commentsCount}</span>
                  <span className="post-stat">⚡ {(p.engagementRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
