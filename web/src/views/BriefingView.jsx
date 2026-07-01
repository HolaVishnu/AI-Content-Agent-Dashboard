import { motion } from 'framer-motion';
import { useJsonFetch } from '../hooks/useJsonFetch';
import { FeedColumn } from '../components/briefing/FeedColumn';
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

export default function BriefingView() {
  const { data, loading, error } = useJsonFetch('/news.json');
  const cols = data?.columns || {};

  return (
    <motion.div
      className="briefing-view"
      variants={PAGE}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="briefing-header">
        <div className="briefing-eyebrow">◈ Signal Feeds</div>
        <h1 className="briefing-title">Daily Intel Report</h1>
        <p className="briefing-sub">Space · AI · Bikes & Travel · World News · Stocks</p>
      </div>

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
