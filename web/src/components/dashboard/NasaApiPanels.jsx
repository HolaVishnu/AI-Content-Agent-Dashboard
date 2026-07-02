import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const KEY = 'DEMO_KEY';
const DAY_MS = 86_400_000;

// In-memory cache for gallery (session only, short TTL)
const _mem = {};
function cachedFetch(url, ttl = 1_800_000) {
  const now = Date.now();
  if (_mem[url] && now - _mem[url].ts < ttl) return Promise.resolve(_mem[url].data);
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => { _mem[url] = { data: d, ts: Date.now() }; return d; });
}

// localStorage cache: persists across reloads, 24-hour TTL per URL
// Skips the network entirely if today's data is already stored.
function dailyCachedFetch(url) {
  const lsKey = 'nasa_daily_' + btoa(url).slice(0, 48);
  try {
    const stored = localStorage.getItem(lsKey);
    if (stored) {
      const { data, ts } = JSON.parse(stored);
      if (Date.now() - ts < DAY_MS) return Promise.resolve(data);
    }
  } catch (_) { /* corrupted entry — fall through to fetch */ }

  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => {
      try { localStorage.setItem(lsKey, JSON.stringify({ data: d, ts: Date.now() })); } catch (_) {}
      return d;
    });
}

// Replaces any NASA CDN quality suffix with the requested level
function upgradeUrl(url, quality = 'large') {
  if (!url) return url;
  return url.replace(/~(thumb|small|medium)\.jpg$/i, `~${quality}.jpg`);
}

// ── CINEMATIC LIGHTBOX ─────────────────────────────────────────────────────────
// images: full array for arrow nav; startIndex: which one opens first
function Lightbox({ images, startIndex = 0, onClose }) {
  const [idx, setIdx]   = useState(startIndex);
  const [dir, setDir]   = useState(0); // -1 = left, 1 = right
  const dirRef          = useRef(0);

  const image = images[idx];
  const total = images.length;

  const go = useCallback((step) => {
    dirRef.current = step;
    setDir(step);
    setIdx(i => (i + step + total) % total);
  }, [total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  go(1);
      if (e.key === 'ArrowLeft')   go(-1);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, go]);

  if (!image) return null;

  const variants = {
    enter: (d) => ({ x: d * 60, opacity: 0 }),
    center:      ({ x: 0,      opacity: 1 }),
    exit:  (d) => ({ x: d * -60, opacity: 0 }),
  };

  return createPortal(
    <motion.div
      className="nasa-lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div
        className="nasa-lightbox-frame"
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        exit={{    scale: 0.92, opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: [0.16, 0.8, 0.24, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image with slide transition */}
        <div className="nasa-lightbox-img-wrap">
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.img
              key={idx}
              src={image.src}
              alt={image.title}
              className="nasa-lightbox-img"
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: [0.32, 0, 0.67, 0] }}
              onError={(e) => {
                if (image.thumb && e.target.src !== upgradeUrl(image.thumb, 'large'))
                  e.target.src = upgradeUrl(image.thumb, 'large');
                else if (image.thumb && e.target.src !== image.thumb)
                  e.target.src = image.thumb;
              }}
            />
          </AnimatePresence>
        </div>

        {/* Prev / Next arrows — only when there are multiple images */}
        {total > 1 && (
          <>
            <button className="nasa-lb-arrow nasa-lb-prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous">
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                <path d="M11 2L3 11L11 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="nasa-lb-arrow nasa-lb-next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next">
              <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                <path d="M3 2L11 11L3 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        <div className="nasa-lightbox-info">
          {image.badge && <div className="nasa-lightbox-badge">{image.badge}</div>}
          <div className="nasa-lightbox-title">{image.title}</div>
          {image.sub && <div className="nasa-lightbox-sub">{image.sub}</div>}
          {total > 1 && (
            <div className="nasa-lb-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`nasa-lb-dot${i === idx ? ' active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setDir(i > idx ? 1 : -1); setIdx(i); }}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <button className="nasa-lightbox-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </motion.div>
    </motion.div>,
    document.body
  );
}

// ── APOD ──────────────────────────────────────────────────────────────────────
export function ApodPanel() {
  const [data, setData] = useState(null);
  const [err,  setErr]  = useState(false);
  const [light, setLight] = useState(null);

  useEffect(() => {
    dailyCachedFetch(`https://api.nasa.gov/planetary/apod?api_key=${KEY}`)
      .then(setData)
      .catch(() => setErr(true));
  }, []);

  const openLight = useCallback(() => {
    if (!data || data.media_type !== 'image') return;
    setLight([{
      src: data.hdurl || data.url,
      title: data.title,
      sub: data.copyright ? `© ${data.copyright.trim()} · ${data.date}` : data.date,
    }]);
  }, [data]);

  return (
    <div className="glass-card nasa-apod-panel">
      <div className="panel-title">◈ Astronomy Picture of the Day</div>
      {!data && !err && <div className="panel-empty">Loading APOD…</div>}
      {err  && <div className="panel-empty">APOD unavailable</div>}
      {data && (
        <>
          <motion.div
            className="nasa-apod-img-wrap nasa-clickable"
            whileHover={{ scale: 1.015 }}
            transition={{ duration: 0.25 }}
            onClick={openLight}
            title="Click to expand"
          >
            {data.media_type === 'image' ? (
              <>
                <img src={data.url} alt={data.title} className="nasa-apod-img" />
                <div className="nasa-img-expand-hint">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </>
            ) : (
              <div className="nasa-apod-video-note">📽 Today's APOD is a video</div>
            )}
          </motion.div>
          <div className="nasa-apod-meta">
            <div className="nasa-apod-date">{data.date}</div>
            <div className="nasa-apod-title">{data.title}</div>
            {data.copyright && (
              <div className="nasa-apod-credit">© {data.copyright.trim()}</div>
            )}
            <p className="nasa-apod-desc">{data.explanation}</p>
          </div>
        </>
      )}
      {light && <Lightbox images={light} startIndex={0} onClose={() => setLight(null)} />}
    </div>
  );
}

// ── MARS ROVER PHOTOS ─────────────────────────────────────────────────────────
const ROVERS = ['curiosity', 'perseverance'];

export function MarsRoverPanel() {
  const [photos,    setPhotos]    = useState([]);
  const [rover,     setRover]     = useState('curiosity');
  const [loading,   setLoading]   = useState(false);
  const [roverInfo, setRoverInfo] = useState(null);
  const [light,     setLight]     = useState(null);

  useEffect(() => {
    setLoading(true);
    setPhotos([]);
    dailyCachedFetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${KEY}`)
      .then(data => {
        const manifest = data.photo_manifest;
        if (!manifest) throw new Error('no manifest');
        setRoverInfo({ name: manifest.name, status: manifest.status, total: manifest.total_photos });
        return dailyCachedFetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${manifest.max_sol}&api_key=${KEY}`);
      })
      .then(data => setPhotos((data.photos || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [rover]);

  return (
    <div className="glass-card nasa-epic-panel">
      <div className="panel-title">◈ Mars Rover Photos</div>
      <div className="nasa-gallery-queries" style={{ marginBottom: 10 }}>
        {ROVERS.map(r => (
          <button key={r} className={`nasa-q-pill${rover === r ? ' active' : ''}`}
            onClick={() => setRover(r)} style={{ textTransform: 'capitalize' }}>
            {r}
          </button>
        ))}
        {roverInfo && (
          <span className="nasa-rover-status" data-active={roverInfo.status === 'active'}>
            {roverInfo.status === 'active' ? '● LIVE' : '○ COMPLETE'}
          </span>
        )}
      </div>
      {loading && <div className="panel-empty">Downloading from Mars…</div>}
      {!loading && photos.length === 0 && <div className="panel-empty">No photos available</div>}
      {!loading && photos.length > 0 && (
        <>
          <div className="nasa-gallery-grid">
            {photos.map((p, pi) => (
              <motion.div
                key={p.id}
                className="nasa-gallery-item"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.22 }}
                onClick={() => setLight({
                  images: photos.map(ph => ({
                    src:   ph.img_src,
                    title: ph.camera.full_name,
                    badge: roverInfo?.name,
                    sub:   `Sol ${ph.sol} · ${ph.earth_date}`,
                  })),
                  startIndex: pi,
                })}
              >
                <img src={p.img_src} alt={p.camera.full_name} className="nasa-gallery-img" loading="lazy" />
                <div className="nasa-gallery-overlay">
                  <span>{p.camera.full_name}</span>
                </div>
                <div className="nasa-img-expand-hint">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
          {photos[0] && (
            <div className="nasa-rover-meta">
              Sol {photos[0].sol} · {photos[0].earth_date}
              {roverInfo && <span> · {roverInfo.total?.toLocaleString()} total photos</span>}
            </div>
          )}
        </>
      )}
      {light && <Lightbox images={light.images} startIndex={light.startIndex} onClose={() => setLight(null)} />}
    </div>
  );
}

// ── NASA IMAGE LIBRARY ────────────────────────────────────────────────────────
const QUERIES = ['nebula', 'galaxy', 'supernova', 'black hole', 'aurora', 'solar flare'];

// Quality score for sorting: prefer medium/large previews over small/thumb
function qualityScore(href = '') {
  if (/~large\.jpg$/i.test(href))  return 3;
  if (/~medium\.jpg$/i.test(href)) return 2;
  if (/~small\.jpg$/i.test(href))  return 1;
  return 0;
}

// Fallback chain for grid: large → medium → original preview URL
function GalleryImg({ href, alt, className, ...rest }) {
  const [src, setSrc] = useState(() => upgradeUrl(href, 'large'));
  const fallbacks = [upgradeUrl(href, 'medium'), href];
  let fi = 0;
  const onError = (e) => {
    if (fi < fallbacks.length) {
      e.target.src = fallbacks[fi++];
    }
  };
  return <img src={src} alt={alt} className={className} onError={onError} {...rest} />;
}

export function NasaGalleryPanel() {
  const [items,   setItems]   = useState([]);
  const [query,   setQuery]   = useState('nebula');
  const [loading, setLoading] = useState(false);
  const [light,   setLight]   = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch 20, sort by preview quality (medium/large first), take top 6
    cachedFetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=20`, 1_800_000)
      .then(d => {
        const results = (d.collection?.items || [])
          .map(item => ({
            href:  item.links?.[0]?.href,
            title: item.data?.[0]?.title,
            date:  item.data?.[0]?.date_created?.split('T')[0],
          }))
          .filter(x => x.href && !/\.tif$/i.test(x.href))
          .sort((a, b) => qualityScore(b.href) - qualityScore(a.href))
          .slice(0, 6);
        setItems(results);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="glass-card nasa-gallery-panel">
      <div className="panel-title">◈ NASA Image Library</div>
      <div className="nasa-gallery-queries">
        {QUERIES.map(q => (
          <button
            key={q}
            className={`nasa-q-pill${query === q ? ' active' : ''}`}
            onClick={() => setQuery(q)}
          >
            {q}
          </button>
        ))}
      </div>
      {loading && <div className="panel-empty">Searching…</div>}
      {!loading && items.length === 0 && <div className="panel-empty">No results</div>}
      {!loading && items.length > 0 && (
        <div className="nasa-gallery-grid">
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="nasa-gallery-item"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.22 }}
              onClick={() => setLight({
                images: items.map(it => ({
                  src:   upgradeUrl(it.href, 'orig'),
                  thumb: it.href,
                  title: it.title,
                  sub:   it.date,
                })),
                startIndex: i,
              })}
            >
              <GalleryImg href={item.href} alt={item.title} className="nasa-gallery-img" loading="lazy" />
              <div className="nasa-gallery-overlay">
                <span>{item.title}</span>
              </div>
              <div className="nasa-img-expand-hint">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {light && <Lightbox images={light.images} startIndex={light.startIndex} onClose={() => setLight(null)} />}
    </div>
  );
}
