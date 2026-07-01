// Copies the JSON data files written by ../scripts/pull-*.js (and the agent
// dashboard's hand-pulled data.json) from the existing static dashboard/
// folder into web/public/, so the new React app can fetch('/data.json') etc.
// exactly like the old static site did — without touching the data pipeline.
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = path.resolve(__dirname, '..', '..', 'dashboard');
const DEST_DIR = path.resolve(__dirname, '..', 'public');

const FILES = [
  'data.json',
  'news.json',
  'neows.json',
  'launches.json',
  'spaceweather.json',
  'planet-positions.json',
];

async function main() {
  await mkdir(DEST_DIR, { recursive: true });
  let synced = 0;
  for (const file of FILES) {
    const src = path.join(SOURCE_DIR, file);
    if (!existsSync(src)) {
      console.warn(`sync-data: skipping ${file} (not found at ${src} — run the relevant scripts/pull-*.js first)`);
      continue;
    }
    await copyFile(src, path.join(DEST_DIR, file));
    synced++;
  }
  console.log(`sync-data: synced ${synced}/${FILES.length} JSON file(s) from dashboard/ into web/public/`);
}

main().catch(err => {
  console.error('sync-data failed:', err.message);
  process.exit(1);
});
