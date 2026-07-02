import { useEffect, useState, useMemo } from 'react';
import { addDailyScore } from './MissionDayHeader';

const LAT = 13.0827;
const LON = 80.2707;

function astroScore(cloud, wind, precip) {
  return Math.round(
    Math.max(0, 100 - cloud) * 0.60 +
    Math.max(0, 100 - wind * 2.5) * 0.25 +
    Math.max(0, 100 - precip) * 0.15
  );
}

const GRADES = [
  { min: 80, grade: 'A', label: 'PERFECT LAUNCH',  cls: 'grade-a' },
  { min: 60, grade: 'B', label: 'GREEN LIGHT',      cls: 'grade-b' },
  { min: 40, grade: 'C', label: 'PARTIAL OPS',      cls: 'grade-c' },
  { min: 0,  grade: 'D', label: 'MISSION ABORT',    cls: 'grade-d' },
];

export function ShootWindowPanel() {
  const [wx, setWx]           = useState(null);
  const [err, setErr]         = useState(false);
  const [scored, setScored]   = useState(false);

  useEffect(() => {
    const url = [
      'https://api.open-meteo.com/v1/forecast',
      `?latitude=${LAT}&longitude=${LON}`,
      '&hourly=cloudcover,windspeed_10m,precipitation_probability',
      '&daily=sunrise,sunset',
      '&timezone=Asia%2FKolkata',
      '&forecast_days=1',
    ].join('');
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setWx)
      .catch(() => setErr(true));
  }, []);

  const night = useMemo(() => {
    if (!wx) return null;
    return wx.hourly.time
      .map((t, i) => ({
        hour:   new Date(t).getHours(),
        cloud:  wx.hourly.cloudcover[i],
        wind:   wx.hourly.windspeed_10m[i],
        precip: wx.hourly.precipitation_probability[i],
      }))
      .filter((h) => h.hour >= 20 || h.hour <= 5);
  }, [wx]);

  const avg = useMemo(() => {
    if (!night?.length) return null;
    const n = night.length;
    return {
      cloud:  Math.round(night.reduce((s, h) => s + h.cloud, 0) / n),
      wind:   Math.round(night.reduce((s, h) => s + h.wind, 0) / n),
      precip: Math.round(night.reduce((s, h) => s + h.precip, 0) / n),
    };
  }, [night]);

  const score    = avg ? astroScore(avg.cloud, avg.wind, avg.precip) : null;
  const gradeInfo = score !== null ? GRADES.find((g) => score >= g.min) : null;

  const best = useMemo(() => {
    if (!night?.length) return null;
    return night.reduce((b, h) => astroScore(h.cloud, h.wind, h.precip) > astroScore(b.cloud, b.wind, b.precip) ? h : b, night[0]);
  }, [night]);

  const sunrise = wx?.daily?.sunrise?.[0];
  const sunset  = wx?.daily?.sunset?.[0];

  function handleView() {
    if (scored) return;
    addDailyScore(10);
    setScored(true);
  }

  return (
    <div className="glass-card shoot-panel" onMouseEnter={handleView}>
      <div className="panel-title">
        ◈ Tonight's Shoot Window · Chennai
        {scored && <span className="apod-xp-flash">+10 OPS PTS</span>}
      </div>

      {err && <div className="panel-empty">Weather link offline</div>}
      {!wx && !err && <div className="panel-empty">Reading atmosphere…</div>}

      {score !== null && gradeInfo && (
        <>
          <div className="shoot-score-row">
            <div className={`shoot-grade ${gradeInfo.cls}`}>{gradeInfo.grade}</div>
            <div className="shoot-grade-info">
              <div className="shoot-status">{gradeInfo.label}</div>
              <div className="shoot-bar-bg">
                <div className="shoot-bar-fill" style={{ width: `${score}%` }} />
              </div>
              <div className="shoot-score-num">{score}/100 astro score</div>
            </div>
          </div>

          <div className="shoot-metrics">
            <div className="shoot-metric">
              <div className="shoot-m-label">Cloud Cover</div>
              <div className={`shoot-m-val ${avg.cloud < 30 ? 'aurora' : avg.cloud < 60 ? 'gold' : 'danger'}`}>
                {avg.cloud}%
              </div>
            </div>
            <div className="shoot-metric">
              <div className="shoot-m-label">Wind</div>
              <div className="shoot-m-val">{avg.wind} km/h</div>
            </div>
            <div className="shoot-metric">
              <div className="shoot-m-label">Rain Chance</div>
              <div className={`shoot-m-val ${avg.precip < 20 ? 'aurora' : 'gold'}`}>{avg.precip}%</div>
            </div>
            {sunset && (
              <div className="shoot-metric">
                <div className="shoot-m-label">Sunset</div>
                <div className="shoot-m-val">
                  {new Date(sunset).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>
            )}
            {sunrise && (
              <div className="shoot-metric">
                <div className="shoot-m-label">Sunrise</div>
                <div className="shoot-m-val">
                  {new Date(sunrise).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
              </div>
            )}
            {best && (
              <div className="shoot-metric shoot-metric-wide">
                <div className="shoot-m-label">Best Window</div>
                <div className="shoot-m-val aurora">
                  {String(best.hour).padStart(2, '0')}:00 IST · {100 - best.cloud}% clear
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
