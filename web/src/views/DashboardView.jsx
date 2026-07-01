import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { avgEng, avgLikes, fmt } from '../utils/dashboardUtils';
import { TelemetryStrip } from '../components/dashboard/TelemetryStrip';
import { AgentCard } from '../components/dashboard/AgentCard';
import { TopPostsPanel } from '../components/dashboard/TopPostsPanel';
import { CompetitorsPanel } from '../components/dashboard/CompetitorsPanel';
import { CalendarPanel } from '../components/dashboard/CalendarPanel';
import { LaunchesPanel } from '../components/dashboard/LaunchesPanel';
import { SpaceWeatherPanel } from '../components/dashboard/SpaceWeatherPanel';
import { ISSPanel } from '../components/dashboard/ISSPanel';
import { AchievementsPanel } from '../components/dashboard/AchievementsPanel';
import '../components/dashboard/Dashboard.css';

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 0.8, 0.24, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

// Builds the 5 agent definitions — analyst items use live metrics from data.json
function buildAgents(data) {
  const posts  = data?.posts?.['vpspaceman'] || [];
  const reels  = posts.filter((p) => p.mediaType === 'reel');
  const eng    = avgEng(posts);
  const avgR   = fmt(avgLikes(reels));
  const avgAll = fmt(avgLikes(posts));

  return [
    {
      cls: 'ideator', icon: '💡', id: 'AGT-01', name: 'Ideator', role: 'Content intelligence & idea scouting',
      items: [
        { label: 'Top idea',     text: '🪐 "I visited India\'s only dark sky reserve — what I saw will change how you look up"' },
        { label: 'Trending now', text: '🏍️ Monsoon ride + astrophotography combo — zero creators covering this' },
        { label: 'Whitespace',   text: '🔭 Budget stargazing under ₹10,000 — a gap no Indian creator owns yet' },
      ],
    },
    {
      cls: 'hook', icon: '✍️', id: 'AGT-02', name: 'Hook & Script', role: 'Hooks, captions & reel scripts',
      items: [
        { label: 'Opening hook', text: '"99% of Indians have never seen the Milky Way. I found the spot 80km from Chennai."' },
        { label: 'CTA',          text: '"Save this 🌌 — you\'ll need it on the next clear night"' },
        { label: 'Caption arc',  text: 'Surprising fact → personal story → actionable tip → save CTA' },
      ],
    },
    {
      cls: 'planner', icon: '📅', id: 'AGT-03', name: 'Planner', role: 'Daily content scheduling & timing',
      items: [
        { label: 'Post today',   text: '🎬 Reel — dark sky spot near Chennai — window: 6–8 PM' },
        { label: 'Post tomorrow',text: '🖼️ Carousel — 5 apps every Indian stargazer needs' },
        { label: 'Weekend',      text: '🏍️ Munnar ride + Milky Way timelapse — your highest-eng format' },
      ],
    },
    {
      cls: 'analyst', icon: '📊', id: 'AGT-04', name: 'Analyst', role: 'Performance intelligence & benchmarking',
      items: [
        { label: 'Signal strength', text: `✅ ${eng}% engagement — outperforming accounts at similar orbit` },
        { label: 'Best format',     text: `🎬 Reels avg ${avgR} likes vs ${avgAll} overall — double down` },
        { label: 'Growth vector',   text: '📈 Space + travel combos get 2.3× more saves — your unfair advantage' },
      ],
    },
    {
      cls: 'dm', icon: '💬', id: 'AGT-05', name: 'DM Manager', role: 'Inbound comms & collab intelligence',
      items: [
        { label: 'Priority',     text: '📬 Telescope & travel brands actively prospecting micro creators — check DMs' },
        { label: 'FAQ to pin',   text: '"What telescope do you use?" — add gear guide link to bio' },
        { label: 'Collab target',text: '🤝 Indian dark sky reserve or planetarium — co-content = 10× credibility' },
      ],
    },
  ];
}

export default function DashboardView({ data }) {
  const agents = useMemo(() => buildAgents(data), [data]);

  return (
    <motion.div className="dashboard-view" variants={PAGE} initial="initial" animate="animate" exit="exit">
      <TelemetryStrip data={data} />

      <div className="dashboard-main">
        <div className="section-label">Intelligence Agents</div>
        <div className="agents-grid">
          {agents.map((agent) => (
            <AgentCard key={agent.cls} agent={agent} />
          ))}
        </div>

        <div className="section-label">Transmission Analytics</div>
        <div className="bottom-grid">
          <TopPostsPanel data={data} />
          <CompetitorsPanel data={data} />
          <CalendarPanel />
        </div>

        <div className="section-label">Live Space Intel</div>
        <div className="live-grid">
          <LaunchesPanel />
          <SpaceWeatherPanel />
        </div>

        <div className="section-label">ISS Command</div>
        <ISSPanel />

        <div className="section-label">Mission Rank</div>
        <AchievementsPanel data={data} />
      </div>
    </motion.div>
  );
}
