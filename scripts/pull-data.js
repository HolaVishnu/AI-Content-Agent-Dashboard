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

// Step B: pull recent posts for all accounts
async function pullPosts() {
  console.log('\nStep B: Pulling recent posts via apify/instagram-post-scraper...');

  const run = await client.actor('apify/instagram-post-scraper').call({
    username: ALL,          // this actor wants "username" not "startUrls"
    maxPosts: POSTS_PER_ACCOUNT,
  });

  console.log('  Run finished. Fetching results...');
  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  console.log(`  Got ${items.length} total post items.`);

  if (items.length === 0) {
    console.log('  Status:', run.status);
    return null;
  }

  // Peek at structure
  const sample = items[0];
  console.log('\n  Sample fields:', Object.keys(sample).slice(0, 15).join(', '));
  console.log('  Sample ownerUsername:', sample.ownerUsername || sample.username || '(not found)');
  console.log('  Sample likesCount:', sample.likesCount ?? sample.likes ?? '(not found)');
  console.log('  Sample caption (first 80 chars):', (sample.caption || sample.text || '').slice(0, 80));

  // Group by account
  const posts = {};
  for (const h of ALL) posts[h] = [];
  for (const item of items) {
    const u = (item.ownerUsername || item.username || '').toLowerCase();
    const match = ALL.find(h => h.toLowerCase() === u);
    if (match) posts[match].push(item);
  }

  console.log('\n  Posts per account:');
  for (const h of ALL) console.log(`    ${h}: ${posts[h].length}`);

  return posts;
}

async function main() {
  const profiles = await pullProfiles();
  const posts = await pullPosts();

  const output = {
    pulledAt: new Date().toISOString(),
    me: ME,
    competitors: COMPETITORS,
    postsPerAccount: POSTS_PER_ACCOUNT,
    profiles,
    posts: posts || {},
    postScrapeSuccess: posts !== null,
  };

  const outPath = path.join(__dirname, '..', 'dashboard', 'data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log('\n✓ Saved to dashboard/data.json');
  console.log('\nSummary:');
  console.log('  Profile stats:', Object.keys(profiles).length, 'accounts ✓');
  console.log('  Post-level data:', posts ? 'SUCCESS ✓' : 'FAILED — dashboard will use profile stats only');
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});