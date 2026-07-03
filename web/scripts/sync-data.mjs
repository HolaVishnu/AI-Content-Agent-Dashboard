// Checks that required JSON data files exist in public/.
// Scripts (pull-*.js) write directly to public/ now.
// As a fallback, copies from the legacy dashboard/ folder if present.
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEGACY_DIR = path.resolve(__dirname, '..', '..', 'dashboard');
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
  let copied = 0;
  for (const file of FILES) {
    const dest = path.join(DEST_DIR, file);
    if (existsSync(dest)) continue; // already there — scripts wrote it directly
    const legacy = path.join(LEGACY_DIR, file);
    if (existsSync(legacy)) {
      await copyFile(legacy, dest);
      copied++;
    }
  }
  if (copied > 0) console.log(`sync-data: migrated ${copied} file(s) from legacy dashboard/ → public/`);
}

main().catch(err => {
  console.error('sync-data warning:', err.message);
});
