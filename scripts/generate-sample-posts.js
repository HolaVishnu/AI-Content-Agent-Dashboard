// scripts/generate-sample-posts.js
// Uses Claude AI to generate realistic post data based on real profile stats
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'dashboard', 'data.json');
const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const ACCOUNTS = {
  vpspaceman: {
    followers: 840,
    niche: 'space, astronomy, moto-vlog, travel, India',
    style: 'educational + personal, mix of reels and carousels',
    avgLikes: 45,
    avgComments: 8,
  },
  'mumbiker._.nikhil': {
    followers: 818,
    niche: 'motorcycle riding, Mumbai streets, travel, lifestyle',
    style: 'ride vlogs, street photography, personal stories',
    avgLikes: 42,
    avgComments: 6,
  },
  thetravelingdesi: {
    followers: 536976,
    niche: 'India travel, budget travel, hidden gems, culture',
    style: 'destination guides, reels, travel tips',
    avgLikes: 8200,
    avgComments: 340,
  },
  nasdaily: {
    followers: 4770543,
    niche: 'global stories, people, culture, inspiration, 1-minute videos',
    style: 'punchy reels, story-driven, high energy hooks',
    avgLikes: 95000,
    avgComments: 2100,
  },
  karaandnate: {
    followers: 1251554,
    niche: 'full-time travel, couples travel, budget travel, adventure',
    style: 'long-form travel vlogs cut to reels, personal journey',
    avgLikes: 18000,
    avgComments: 420,
  },
};

const MEDIA_TYPES = ['reel', 'carousel', 'image'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTimestamp(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

async function generatePostsForAccount(handle, info) {
  console.log(`  Generating posts for @${handle}...`);

  const prompt = `Generate exactly 12 realistic Instagram posts for @${handle}.
Account niche: ${info.niche}
Content style: ${info.style}
Followers: ${info.followers}
Average likes per post: ${info.avgLikes}
Average comments per post: ${info.avgComments}

Return ONLY a valid JSON array with exactly 12 objects. No markdown, no explanation, just the JSON array.
Each object must have these exact fields:
{
  "id": "post_${handle.replace(/\./g,'')}_1",
  "caption": "realistic caption with hashtags, 100-200 chars",
  "mediaType": "reel" or "carousel" or "image",
  "likesCount": number close to ${info.avgLikes} with natural variation,
  "commentsCount": number close to ${info.avgComments} with natural variation,
  "timestamp": "ISO date string",
  "hashtags": ["array", "of", "5-8", "hashtags"],
  "engagementRate": number between 0.01 and 0.15,
  "url": "https://www.instagram.com/p/fake_${handle.replace(/\./g,'')}_postN/"
}

Make captions authentic to the niche. Vary media types naturally. Space timestamps 2-5 days apart going back from today.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
headers: {
  'Content-Type': 'application/json',
  'x-api-key': process.env.ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
},
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const text = data.content[0].text.trim();
  // Strip any markdown fences if present
  const clean = text.replace(/```json|```/g, '').trim();
  const posts = JSON.parse(clean);

  console.log(`    ✓ Got ${posts.length} posts for @${handle}`);
  return posts;
}

async function main() {
  console.log('Generating realistic sample posts using Claude AI...\n');

  const posts = {};

  for (const [handle, info] of Object.entries(ACCOUNTS)) {
    try {
      posts[handle] = await generatePostsForAccount(handle, info);
      // Small delay between API calls
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ✗ Failed for @${handle}:`, err.message);
      posts[handle] = [];
    }
  }

  // Merge into existing data.json
  existing.posts = posts;
  existing.postDataSource = 'claude-ai-generated';
  existing.postsGeneratedAt = new Date().toISOString();

  fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2));

  console.log('\n✓ Saved to dashboard/data.json');
  console.log('\nPost counts:');
  for (const [h, p] of Object.entries(posts)) {
    console.log(`  ${h}: ${p.length} posts`);
  }
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});