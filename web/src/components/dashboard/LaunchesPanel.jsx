import { useJsonFetch } from '../../hooks/useJsonFetch';
import { GlassCard } from '../ui/GlassCard';

export function LaunchesPanel() {
  const { data, loading, error } = useJsonFetch('/launches.json');
  const launches = data?.launches || [];

  return (
    <GlassCard className="panel launches-panel">
      <h3 className="panel-title">◈ Upcoming Launches</h3>
      {loading && <div className="panel-empty">⟳ Loading…</div>}
      {error   && <div className="panel-empty">⚠ {error}</div>}
      {!loading && !error && launches.length === 0 && (
        <div className="panel-empty">No launch data — run scripts/pull-launches.js</div>
      )}
      {!loading && launches.map((l, i) => {
        const dt   = new Date(l.net);
        const isGo = /go|confirmed/i.test(l.status);
        return (
          <div key={i} className="launch-item">
            <div className="launch-top">
              <span className="launch-name">{l.name}</span>
              <span className={`launch-status${isGo ? '' : ' tbd'}`}>
                {l.statusAbbrev || l.status}
              </span>
            </div>
            <div className="launch-meta">
              {l.provider} · {l.rocket} ·{' '}
              {dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{' '}
              {dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      })}
    </GlassCard>
  );
}
