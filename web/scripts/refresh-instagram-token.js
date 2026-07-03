// scripts/refresh-instagram-token.js
// Refreshes the long-lived Instagram access token (IGAA...) before it expires,
// and writes scripts/token-meta.json so other scripts/the Telegram report can
// warn if the refresh ever fails (token is ~60 days, refreshable after 24h).
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const META_PATH = path.join(__dirname, 'token-meta.json');
const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

function writeMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

function updateEnvToken(newToken) {
  let env = fs.readFileSync(ENV_PATH, 'utf8');
  if (/^INSTAGRAM_ACCESS_TOKEN=.*$/m.test(env)) {
    env = env.replace(/^INSTAGRAM_ACCESS_TOKEN=.*$/m, `INSTAGRAM_ACCESS_TOKEN=${newToken}`);
  } else {
    env += `\nINSTAGRAM_ACCESS_TOKEN=${newToken}\n`;
  }
  fs.writeFileSync(ENV_PATH, env);
}

async function main() {
  if (!TOKEN) {
    console.error('No INSTAGRAM_ACCESS_TOKEN set — skipping refresh.');
    writeMeta({ ok: false, error: 'No token set in .env', checkedAt: new Date().toISOString() });
    process.exit(1);
  }

  console.log('Refreshing Instagram long-lived access token...');
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Refresh FAILED:', data.error.message || JSON.stringify(data.error));
    writeMeta({
      ok: false,
      error: data.error.message || 'Unknown error',
      checkedAt: new Date().toISOString(),
    });
    process.exit(1);
  }

  const newToken = data.access_token;
  const expiresInSecs = data.expires_in; // typically ~5184000 (60 days)
  const expiresAt = new Date(Date.now() + expiresInSecs * 1000).toISOString();

  updateEnvToken(newToken);
  writeMeta({
    ok: true,
    refreshedAt: new Date().toISOString(),
    expiresAt,
    expiresInDays: Math.round(expiresInSecs / 86400),
  });

  console.log(`✓ Token refreshed. New expiry: ${expiresAt} (${Math.round(expiresInSecs/86400)} days from now)`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  writeMeta({ ok: false, error: err.message, checkedAt: new Date().toISOString() });
  process.exit(1);
});
