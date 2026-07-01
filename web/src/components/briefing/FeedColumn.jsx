import { motion } from 'framer-motion';
import { timeAgo } from '../../utils/dashboardUtils';

const ITEM_VARIANTS = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.055, ease: [0.16, 0.8, 0.24, 1] } }),
};

export function FeedColumn({ title, items, loading, error, delay = 0 }) {
  return (
    <motion.div
      className="feed-col"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 0.8, 0.24, 1] }}
      viewport={{ once: true, margin: '-40px' }}
    >
      <div className="feed-col-title">{title}</div>

      {loading && <div className="feed-col-loading">⟳ Fetching…</div>}
      {error   && <div className="feed-col-empty">⚠ {error?.message || 'Failed to load'}</div>}
      {!loading && !error && (!items || items.length === 0) && (
        <div className="feed-col-empty">No headlines yet — run scripts/pull-news.js</div>
      )}

      {!loading && items && (
        <div className="feed-col-list">
          {items.map((item, i) => {
            let host = '';
            try { host = new URL(item.link).hostname.replace('www.', ''); } catch (_) { /* ignore */ }
            return (
              <motion.a
                key={i}
                className="feed-item"
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                custom={i}
                variants={ITEM_VARIANTS}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="feed-item-title">{item.title}</div>
                <div className="feed-item-meta">
                  {item.pubDate ? timeAgo(item.pubDate) : ''}
                  {host ? ` · ${host}` : ''}
                </div>
              </motion.a>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
