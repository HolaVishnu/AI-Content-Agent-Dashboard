import { motion } from 'framer-motion';
import { useJsonFetch } from '../hooks/useJsonFetch';
import { FeedColumn } from '../components/briefing/FeedColumn';
import { MissionDayHeader } from '../components/briefing/MissionDayHeader';
import { APODPanel } from '../components/briefing/APODPanel';
import { ShootWindowPanel } from '../components/briefing/ShootWindowPanel';
import '../components/briefing/Briefing.css';

const PAGE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 0.8, 0.24, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.25 } },
};

const COLUMNS = [
  { key: 'space',  title: '🚀 Space',          delay: 0    },
  { key: 'ai',     title: '🤖 AI',              delay: 0.07 },
  { key: 'bikes',  title: '🏍️ Bikes & Travel',  delay: 0.14 },
  { key: 'world',  title: '🌍 World News',       delay: 0.21 },
  { key: 'stocks', title: '📈 Stocks',           delay: 0.28 },
];

export default function BriefingView({ data }) {
  const { data: news, loading, error } = useJsonFetch('/news.json');
  const cols = news?.columns || {};

  return (
    <motion.div
      className="briefing-view"
      variants={PAGE}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <MissionDayHeader data={data} />

      <div className="briefing-command-row">
        <APODPanel />
        <ShootWindowPanel />
      </div>

      <div className="briefing-feeds-label">◈ Signal Feeds · Space · AI · Bikes · World · Markets</div>

      <div className="feed-columns">
        {COLUMNS.map(({ key, title, delay }) => (
          <FeedColumn
            key={key}
            title={title}
            items={cols[key]}
            loading={loading}
            error={error}
            delay={delay}
          />
        ))}
      </div>
    </motion.div>
  );
}
