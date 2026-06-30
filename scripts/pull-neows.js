// scripts/pull-neows.js
// Pulls REAL near-Earth asteroid close-approach data for the next 7 days from
// NASA's NeoWs (Near Earth Object Web Service) API and saves it to
// dashboard/neows.json. Used by the Solar System view to show actual asteroids
// with real close-approach dates, velocities, sizes, and hazard status.
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log('Pulling near-Earth object data from NASA NeoWs...');
  const start = new Date();
  const end = new Date(start.getTime() + 6 * 86400000); // NeoWs feed max range is 7 days
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${fmtDate(start)}&end_date=${fmtDate(end)}&api_key=${NASA_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const all = [];
  for (const dateKey of Object.keys(data.near_earth_objects || {})) {
    for (const neo of data.near_earth_objects[dateKey]) {
      const approach = neo.close_approach_data[0];
      if (!approach) continue;
      all.push({
        id: neo.id,
        name: neo.name.replace(/[()]/g, ''),
        hazardous: neo.is_potentially_hazardous_asteroid,
        diameterMinM: Math.round(neo.estimated_diameter.meters.estimated_diameter_min),
        diameterMaxM: Math.round(neo.estimated_diameter.meters.estimated_diameter_max),
        closeApproachDate: approach.close_approach_date_full,
        closeApproachEpochMs: approach.epoch_date_close_approach,
        velocityKmS: parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(2),
        missDistanceKm: Math.round(parseFloat(approach.miss_distance.kilometers)),
        missDistanceLunar: parseFloat(approach.miss_distance.lunar).toFixed(2),
        jplUrl: neo.nasa_jpl_url,
      });
    }
  }

  all.sort((a, b) => a.closeApproachEpochMs - b.closeApproachEpochMs);

  const output = {
    pulledAt: new Date().toISOString(),
    source: 'NASA NeoWs (api.nasa.gov/neo)',
    rangeStart: fmtDate(start),
    rangeEnd: fmtDate(end),
    count: all.length,
    objects: all,
  };

  const outPath = path.join(__dirname, '..', 'dashboard', 'neows.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${all.length} near-Earth objects to dashboard/neows.json`);
  const hazardous = all.filter(o => o.hazardous).length;
  console.log(`  (${hazardous} flagged potentially hazardous)`);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
