// scripts/pull-data.js
require('dotenv').config();
const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

// --- EDITABLE CONFIG ---------------------------------------------------
const ME = 'vpspaceman';
const COMPETITORS = [
  'mumbiker._.nikhil',
  'thetravelingdesi',
  'nasdaily',
  'karaandnate',
];
const POSTS_PER_ACCOUNT = 12;
// -----------------------------------------------------------------------

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });
const ALL = [ME, ...COMPETITORS];

// Step A: pull profile stats for all accounts (already proven to work)
async function pullProfiles() {
  console.log('Step A: Pulling profile stats for all accounts...');
  const run = await client.actor('apify/instagram-profile-scraper').call({
    usernames: ALL,
  });
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const profiles = {};
  for (const item of items) {
    const u = (item.username || '').toLowerCase();
    const match = ALL.find(h => h.toLowerCase() === u);
    if (match) profiles[match] = item;
  }
  console.log(`  Got profiles for: ${Object.keys(profiles).join(', ')}`);
  return profiles;
}

// NOTE: apify/instagram-post-scraper used to run here. Removed — it is a PAID
// actor (~$1/account/run, ~$5/run across 5 accounts) and per Instagram's 2026
// blocking it doesn't reliably return data anyway. Real post data for ME now
// comes free from pull-real-posts.js (official Graph API), which runs right
// after this script in daily-run.js. Competitor post-level data was never
// reliably available through this actor either, so it's simply not pulled —
// competitor cards use profile-level stats (followers) only.

async function main() {
  const profiles = await pullProfiles();

  // Preserve whatever posts are already in data.json (e.g. real posts for ME
  // from a previous pull-real-posts.js run) instead of wiping them to {}.
  const outPath = path.join(__dirname, '..', 'dashboard', 'data.json');
  let existingPosts = {};
  let existingMeta = {};
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    existingPosts = existing.posts || {};
    existingMeta = { postDataSource: existing.postDataSource, realDataPulledAt: existing.realDataPulledAt };
  } catch (e) { /* no existing file yet — fine */ }

  const output = {
    pulledAt: new Date().toISOString(),
    me: ME,
    competitors: COMPETITORS,
    postsPerAccount: POSTS_PER_ACCOUNT,
    profiles,
    posts: existingPosts,
    ...existingMeta,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log('\n✓ Saved to dashboard/data.json');
  console.log('\nSummary:');
  console.log('  Profile stats:', Object.keys(profiles).length, 'accounts ✓');
  console.log('  Post-level data: preserved from previous pull (no paid actor call made)');
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});