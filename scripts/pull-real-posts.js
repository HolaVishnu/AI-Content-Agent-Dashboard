// scripts/pull-real-posts.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_USER_ID = process.env.INSTAGRAM_BUSINESS_ID;
const FOLLOWERS = 840;

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Pulling real posts from @vpspaceman...');

  const url = `https://graph.instagram.com/v22.0/${IG_USER_ID}/media` +
    `?fields=id,caption,media_type,timestamp,permalink,like_count,comments_count` +
    `&limit=30&access_token=${TOKEN}`;

  const data = await httpsGet(url);

  if (data.error) {
    console.error('API Error:', data.error.message);
    process.exit(1);
  }

  const posts = data.data || [];
  console.log(`Got ${posts.length} real posts.`);

  const normalized = posts.map(p => {
    const likesCount = p.like_count || 0;
    const commentsCount = p.comments_count || 0;
    return {
      id: p.id,
      caption: p.caption || '',
      mediaType: p.media_type === 'VIDEO' ? 'reel' : p.media_type === 'CAROUSEL_ALBUM' ? 'carousel' : 'image',
      likesCount,
      commentsCount,
      timestamp: p.timestamp,
      hashtags: (p.caption || '').match(/#\w+/g) || [],
      engagementRate: FOLLOWERS ? (likesCount + commentsCount) / FOLLOWERS : 0,
      url: p.permalink,
      realData: true,
    };
  });

  // Show sample
  console.log('\nSample posts:');
  normalized.slice(0, 3).forEach(p => {
    console.log(` - ${p.mediaType}: "${p.caption.slice(0, 60)}"...`);
    console.log(`   URL: ${p.url}`);
  });

  // Update data.json
  const dataPath = path.join(__dirname, '..', 'dashboard', 'data.json');
  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  existing.posts['vpspaceman'] = normalized;
  existing.postDataSource = 'instagram-graph-api-real';
  existing.realDataPulledAt = new Date().toISOString();
  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2));

  const reels = normalized.filter(p => p.mediaType === 'reel').length;
  const carousels = normalized.filter(p => p.mediaType === 'carousel').length;
  const images = normalized.filter(p => p.mediaType === 'image').length;

  console.log('\n✓ Saved to dashboard/data.json');
  console.log(`  Reels: ${reels} | Carousels: ${carousels} | Images: ${images}`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});