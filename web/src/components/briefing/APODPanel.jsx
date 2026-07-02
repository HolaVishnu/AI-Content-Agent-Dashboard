import { useEffect, useState } from 'react';
import { addDailyScore } from './MissionDayHeader';

export function APODPanel() {
  const [apod, setApod]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState(false);
  const [scored, setScored]   = useState(false);

  useEffect(() => {
    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&thumbs=true')
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setApod(d); setLoading(false); })
      .catch(() => { setErr(true); setLoading(false); });
  }, []);

  function handleView() {
    if (scored) return;
    addDailyScore(10);
    setScored(true);
  }

  const imgUrl = apod
    ? (apod.media_type === 'video' ? apod.thumbnail_url : apod.hdurl || apod.url)
    : null;

  return (
    <div className="glass-card apod-panel" onMouseEnter={handleView}>
      <div className="panel-title">
        ◈ NASA — Astronomy Picture of the Day
        {scored && <span className="apod-xp-flash">+10 OPS PTS</span>}
      </div>

      {loading && <div className="panel-empty apod-loading">Downloading from deep space…</div>}
      {err && <div className="panel-empty">Signal unavailable · check api.nasa.gov</div>}

      {apod && (
        <>
          {imgUrl && (
            <a href={apod.url} target="_blank" rel="noopener noreferrer" className="apod-img-link">
              <img src={imgUrl} alt={apod.title} className="apod-img" />
              {apod.media_type === 'video' && <span className="apod-video-badge">▶ VIDEO</span>}
            </a>
          )}
          <div className="apod-body">
            <div className="apod-title">{apod.title}</div>
            <div className="apod-meta">{apod.date}{apod.copyright ? ` · © ${apod.copyright.replace(/\n/g, ' ')}` : ''}</div>
            <p className="apod-desc">{apod.explanation?.slice(0, 300)}…</p>
          </div>
        </>
      )}
    </div>
  );
}
