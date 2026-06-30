// scripts/pull-launches.js
// Pulls REAL upcoming rocket launches — every agency (SpaceX, ISRO, Roscosmos,
// ESA, NASA, CNSA, etc.), not just NASA — from the Launch Library 2 API
// (thespacedevs.com, free, no API key required). Saves to dashboard/launches.json.
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Pulling upcoming launches from Launch Library 2...');
  const url = 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&mode=normal';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const launches = (data.results || []).map(l => ({
    id: l.id,
    name: l.name,
    provider: l.launch_service_provider?.name || 'Unknown',
    providerType: l.launch_service_provider?.type || '',
    rocket: l.rocket?.configuration?.full_name || l.rocket?.configuration?.name || 'Unknown',
    net: l.net, // "no earlier than" — the scheduled launch time, ISO
    status: l.status?.name || 'Unknown',
    statusAbbrev: l.status?.abbrev || '',
    pad: l.pad?.name || '',
    location: l.pad?.location?.name || '',
    missionDesc: (l.mission?.description || '').slice(0, 220),
    imageUrl: l.image || null,
  }));

  const output = {
    pulledAt: new Date().toISOString(),
    source: 'Launch Library 2 (thespacedevs.com)',
    count: launches.length,
    launches,
  };

  const outPath = path.join(__dirname, '..', 'dashboard', 'launches.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${launches.length} upcoming launches to dashboard/launches.json`);
  launches.slice(0, 3).forEach(l => console.log(`  - ${l.name} (${l.provider}) — ${l.net}`));
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
