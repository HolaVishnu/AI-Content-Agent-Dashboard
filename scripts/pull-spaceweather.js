// scripts/pull-spaceweather.js
// Pulls REAL space weather events (solar flares, CMEs, geomagnetic storms) for
// the past 7 days from NASA's DONKI API (free, same DEMO_KEY tier as APOD/NeoWs).
// Saves to dashboard/spaceweather.json.
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchEvents(type, start, end) {
  const url = `https://api.nasa.gov/DONKI/${type}?startDate=${start}&endDate=${end}&api_key=${NASA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${type}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log('Pulling space weather events from NASA DONKI...');
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 86400000);
  const startStr = fmtDate(start), endStr = fmtDate(end);

  const events = [];

  try {
    const flares = await fetchEvents('FLR', startStr, endStr);
    flares.forEach(f => events.push({
      type: 'Solar Flare',
      icon: '☀',
      time: f.peakTime || f.beginTime,
      detail: `Class ${f.classType || '?'} flare${f.sourceLocation ? ' at ' + f.sourceLocation : ''}`,
      link: f.link,
    }));
    console.log(`  Solar flares: ${flares.length}`);
  } catch (e) { console.log('  Solar flares: FAILED — ' + e.message); }

  try {
    const cmes = await fetchEvents('CME', startStr, endStr);
    cmes.forEach(c => events.push({
      type: 'Coronal Mass Ejection',
      icon: '🌊',
      time: c.startTime,
      detail: c.note ? c.note.slice(0, 160) : 'CME detected — may affect Earth-facing space weather.',
      link: c.link,
    }));
    console.log(`  CMEs: ${cmes.length}`);
  } catch (e) { console.log('  CMEs: FAILED — ' + e.message); }

  try {
    const storms = await fetchEvents('GST', startStr, endStr);
    storms.forEach(g => events.push({
      type: 'Geomagnetic Storm',
      icon: '🧲',
      time: g.startTime,
      detail: `Kp index peak: ${g.allKpIndex?.length ? Math.max(...g.allKpIndex.map(k => k.kpIndex)) : 'N/A'}`,
      link: g.link,
    }));
    console.log(`  Geomagnetic storms: ${storms.length}`);
  } catch (e) { console.log('  Geomagnetic storms: FAILED — ' + e.message); }

  events.sort((a, b) => new Date(b.time) - new Date(a.time));

  const output = {
    pulledAt: new Date().toISOString(),
    source: 'NASA DONKI (api.nasa.gov/DONKI)',
    rangeStart: startStr,
    rangeEnd: endStr,
    count: events.length,
    events: events.slice(0, 12),
  };

  const outPath = path.join(__dirname, '..', 'dashboard', 'spaceweather.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${output.events.length} space weather events to dashboard/spaceweather.json`);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
