import { useJsonFetch } from '../../hooks/useJsonFetch';
import { GlassCard } from '../ui/GlassCard';

export function SpaceWeatherPanel() {
  const { data, loading, error } = useJsonFetch('/spaceweather.json');
  const events = data?.events || [];

  return (
    <GlassCard className="panel weather-panel">
      <h3 className="panel-title">◈ Space Weather</h3>
      {loading && <div className="panel-empty">⟳ Loading…</div>}
      {error   && <div className="panel-empty">⚠ {error}</div>}
      {!loading && !error && events.length === 0 && (
        <div className="panel-empty">No solar activity in the last 7 days — quiet skies.</div>
      )}
      {!loading && events.map((ev, i) => (
        <div key={i} className="weather-item">
          <div className="weather-top">
            <span className="weather-icon">{ev.icon}</span>
            <span className="weather-type">{ev.type}</span>
          </div>
          <div className="weather-detail">{ev.detail}</div>
          <div className="weather-time">
            {new Date(ev.time).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>
      ))}
    </GlassCard>
  );
}
