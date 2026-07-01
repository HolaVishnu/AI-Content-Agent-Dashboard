import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { MagneticButton } from '../ui/MagneticButton';

const AGENT_SERVER = 'http://localhost:3001';

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

  async function uplink() {
    setStatus('loading');
    try {
      const res  = await fetch(`${AGENT_SERVER}/agent/${cls}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setItems(data.items);
      setTs('✓ SYNCED ' + new Date(data.generatedAt).toLocaleTimeString());
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
        aria-label={`Uplink ${name} agent`}
      >
        {status === 'loading' ? '⟳ UPLINK...' : status === 'done' ? '⚡ RE-UPLINK' : '⚡ UPLINK AGENT'}
      </MagneticButton>
      {ts && <div className="agent-ts">{ts}</div>}
    </GlassCard>
  );
}
