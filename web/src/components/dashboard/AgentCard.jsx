import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { MagneticButton } from '../ui/MagneticButton';
import { deriveInsights } from '../../utils/agentInsights';

const BASE = import.meta.env.BASE_URL || '/';

function OutputItem({ label, text }) {
  return (
    <div className="output-item">
      <div className="output-label">{label}</div>
      <div className="output-text">{text}</div>
    </div>
  );
}

export function AgentCard({ agent }) {
  const { cls, icon, id, name, role, items: defaultItems } = agent;
  const [items, setItems]   = useState(defaultItems);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [ts, setTs]         = useState('');

  // Re-pull the latest Instagram data (data.json, refreshed by the pull script)
  // and recompute this agent's insights locally — no backend, no AI, fully free.
  async function uplink() {
    setStatus('loading');
    try {
      const res  = await fetch(`${BASE}data.json?t=${Date.now()}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      setItems(deriveInsights(cls, data));
      const pulled = data.realDataPulledAt ? new Date(data.realDataPulledAt).toLocaleString() : new Date().toLocaleTimeString();
      setTs('✓ REFRESHED · data from ' + pulled);
      setStatus('done');
    } catch (e) {
      setTs('⚠ ' + e.message);
      setStatus('error');
    }
  }

  return (
    <GlassCard className={`agent-card agent-${cls}`}>
      <div className="agent-header">
        <div className="agent-icon">{icon}</div>
        <div className="agent-id">{id}</div>
      </div>
      <div className="agent-meta">
        <div className="agent-name">{name}</div>
        <div className="agent-role">{role}</div>
        <div className="agent-online"><span className="online-dot" />ONLINE</div>
      </div>
      <div className={`agent-outputs${status === 'loading' ? ' dimmed' : ''}`}>
        {items.map((item, i) => (
          <OutputItem key={i} label={item.label} text={item.text} />
        ))}
      </div>
      <MagneticButton
        className="agent-uplink-btn"
        onClick={uplink}
        disabled={status === 'loading'}
        aria-label={`Refresh ${name} insights`}
      >
        {status === 'loading' ? '⟳ REFRESHING...' : status === 'done' ? '⟳ REFRESH DATA' : '⚡ REFRESH INSIGHTS'}
      </MagneticButton>
      {ts && <div className="agent-ts">{ts}</div>}
    </GlassCard>
  );
}
