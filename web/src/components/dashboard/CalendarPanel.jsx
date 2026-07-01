import { GlassCard } from '../ui/GlassCard';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const COLORS = ['#7B2FBE', '#FF4466', '#00F5D4', '#FFD700', '#1B4FD8', '#FF8800', '#9B4FDE'];

const PLAN = [
  { type: 'Reel',     text: 'Dark sky spot 80km from Chennai — night ride + astrophotography' },
  { type: 'Carousel', text: '5 free apps every Indian stargazer needs in 2026' },
  { type: 'Story',    text: 'Poll: Ride content or Space content this weekend?' },
  { type: 'Reel',     text: 'POV: Waking up at 3am to catch the ISS pass over Tamil Nadu' },
  { type: 'Carousel', text: 'Budget telescope guide — ₹5,000–₹20,000 range with real reviews' },
  { type: 'Reel',     text: 'Munnar ride + Milky Way core timelapse at the summit' },
  { type: 'Image',    text: "Weekly wrap: best shot + what's coming next week" },
];

export function CalendarPanel() {
  const today = new Date();

  return (
    <GlassCard className="panel calendar-panel">
      <h3 className="panel-title">◈ 7-Day Content Orbit</h3>
      <div className="cal-list">
        {PLAN.map((p, i) => {
          const d     = new Date(today);
          d.setDate(today.getDate() + i);
          const label = i === 0 ? 'TODAY' : i === 1 ? 'TMW' : DAYS[d.getDay()];

          return (
            <div key={i} className={`cal-item${i === 0 ? ' today' : ''}`}>
              <div className={`cal-day${i === 0 ? ' today-label' : ''}`}>{label}</div>
              <div
                className="cal-orb"
                style={{ background: COLORS[i], boxShadow: `0 0 6px ${COLORS[i]}55` }}
                aria-hidden="true"
              />
              <div>
                <div className="cal-text">{p.text}</div>
                <div className="cal-format">{p.type}</div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
