import { useState, useEffect } from 'react';

const KEY = 'DEMO_KEY';

// Module-level cache: prevents re-fetching when StrictMode double-invokes effects
// or when the user navigates between routes. TTL = 1 hour.
const _cache = {};
function cachedFetch(url, ttl = 3_600_000) {
  const now = Date.now();
  if (_cache[url] && now - _cache[url].ts < ttl) return Promise.resolve(_cache[url].data);
  return fetch(url)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => { _cache[url] = { data: d, ts: Date.now() }; return d; });
}

// ── APOD ──────────────────────────────────────────────────────────────────────
export function ApodPanel() {
  const [data, setData] = useState(null);
  const [err,  setErr]  = useState(false);

  useEffect(() => {
    cachedFetch(`https://api.nasa.gov/planetary/apod?api_key=${KEY}`)
      .then(setData)
      .catch(() => setErr(true));
  }, []);

  return (
    <div className="glass-card nasa-apod-panel">
      <div className="panel-title">◈ Astronomy Picture of the Day</div>
      {!data && !err && <div className="panel-empty">Loading APOD…</div>}
      {err  && <div className="panel-empty">APOD unavailable</div>}
      {data && (
        <>
          <div className="nasa-apod-img-wrap">
            {data.media_type === 'image' ? (
              <img src={data.url} alt={data.title} className="nasa-apod-img" />
            ) : (
              <div className="nasa-apod-video-note">📽 Today's APOD is a video</div>
            )}
          </div>
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
    </div>
  );
}

// ── MARS ROVER PHOTOS ─────────────────────────────────────────────────────────
const ROVERS = ['curiosity', 'perseverance'];

export function MarsRoverPanel() {
  const [photos, setPhotos] = useState([]);
  const [rover,  setRover]  = useState('curiosity');
  const [loading, setLoading] = useState(false);
  const [roverInfo, setRoverInfo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setPhotos([]);
    cachedFetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${KEY}`)
      .then(data => {
        const manifest = data.photo_manifest;
        if (!manifest) throw new Error('no manifest');
        setRoverInfo({ name: manifest.name, status: manifest.status, total: manifest.total_photos });
        const latestSol = manifest.max_sol;
        return cachedFetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${latestSol}&api_key=${KEY}`);
      })
      .then(data => {
        const imgs = (data.photos || []).slice(0, 6);
        setPhotos(imgs);
      })
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
            {photos.map((p) => (
              <div key={p.id} className="nasa-gallery-item" title={`${p.camera.full_name} · Sol ${p.sol}`}>
                <img src={p.img_src} alt={p.camera.full_name} className="nasa-gallery-img" loading="lazy" />
                <div className="nasa-gallery-overlay">
                  <span>{p.camera.full_name}</span>
                </div>
              </div>
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
    </div>
  );
}

// ── NASA IMAGE LIBRARY ────────────────────────────────────────────────────────
const QUERIES = ['nebula', 'galaxy', 'supernova', 'black hole', 'aurora', 'solar flare'];

export function NasaGalleryPanel() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('nebula');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    cachedFetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=6`, 1_800_000)
      .then(d => {
        const results = (d.collection?.items || []).slice(0, 6).map(item => ({
          href: item.links?.[0]?.href,
          title: item.data?.[0]?.title,
          date:  item.data?.[0]?.date_created?.split('T')[0],
        })).filter(x => x.href);
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
            <div key={i} className="nasa-gallery-item" title={item.title}>
              <img src={item.href} alt={item.title} className="nasa-gallery-img" loading="lazy" />
              <div className="nasa-gallery-overlay">
                <span>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
