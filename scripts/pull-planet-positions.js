// scripts/pull-planet-positions.js
// Pulls REAL current heliocentric ecliptic positions for all 8 planets from
// NASA JPL's Horizons API (no API key required — public JPL/SSD service) and
// saves them to dashboard/planet-positions.json. The dashboard's Solar System
// view uses this to start each planet at its actual real-world position
// "right now" instead of a random angle, before the (accelerated/time-warped)
// orbital animation takes over.
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// JPL Horizons body IDs for the major planets.
const BODIES = [
  { key: 'mercury', id: '199' },
  { key: 'venus', id: '299' },
  { key: 'earth', id: '399' },
  { key: 'mars', id: '499' },
  { key: 'jupiter', id: '599' },
  { key: 'saturn', id: '699' },
  { key: 'uranus', id: '799' },
  { key: 'neptune', id: '899' },
];

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

async function fetchPosition(body, start, stop) {
  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json` +
    `&COMMAND='${body.id}'&OBJ_DATA='NO'&MAKE_EPHEM='YES'&EPHEM_TYPE='VECTORS'` +
    `&CENTER='500@10'&START_TIME='${start}'&STOP_TIME='${stop}'&STEP_SIZE='1d'`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const text = data.result || '';
  const s = text.indexOf('$$SOE');
  const e = text.indexOf('$$EOE');
  if (s === -1 || e === -1) throw new Error('No ephemeris data in response');
  const block = text.slice(s, e);
  const xMatch = block.match(/X\s*=\s*([-\d.E+]+)/);
  const yMatch = block.match(/Y\s*=\s*([-\d.E+]+)/);
  if (!xMatch || !yMatch) throw new Error('Could not parse X/Y from ephemeris');
  const x = parseFloat(xMatch[1]); // km, heliocentric ecliptic
  const y = parseFloat(yMatch[1]);
  const angleDeg = (Math.atan2(y, x) * 180) / Math.PI;
  const distanceAU = Math.hypot(x, y) / 149597870.7; // km -> AU
  return { angleDeg, distanceAU };
}

async function main() {
  console.log('Pulling real planet positions from NASA JPL Horizons...');
  const now = new Date();
  const start = fmtDate(now);
  const stop = fmtDate(new Date(now.getTime() + 86400000));

  const positions = {};
  for (const body of BODIES) {
    try {
      const pos = await fetchPosition(body, start, stop);
      positions[body.key] = pos;
      console.log(`  ${body.key}: angle=${pos.angleDeg.toFixed(2)}° distance=${pos.distanceAU.toFixed(3)} AU`);
    } catch (e) {
      console.log(`  ${body.key}: FAILED — ${e.message}`);
    }
  }

  const output = { pulledAt: now.toISOString(), source: 'NASA JPL Horizons (ssd.jpl.nasa.gov)', positions };
  const outPath = path.join(__dirname, '..', 'dashboard', 'planet-positions.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${Object.keys(positions).length}/8 real planet positions to dashboard/planet-positions.json`);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
