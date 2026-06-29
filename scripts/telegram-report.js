// scripts/telegram-report.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendMessage(text) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description);
  return data;
}

function getTokenWarning() {
  const metaPath = path.join(__dirname, 'token-meta.json');
  if (!fs.existsSync(metaPath)) {
    return '⚠️ <b>Instagram token status unknown</b> — refresh-instagram-token.js has not run yet.';
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  if (!meta.ok) {
    return `⚠️ <b>Instagram token refresh FAILED</b>\n${meta.error || 'Unknown error'}\nReal post data will stop updating soon — re-authenticate via Graph API Explorer.`;
  }
  const daysLeft = Math.round((new Date(meta.expiresAt) - Date.now()) / 86400000);
  if (daysLeft <= 10) {
    return `⚠️ <b>Instagram token expires in ${daysLeft} day(s)</b> (${meta.expiresAt.slice(0,10)}) — refresh is automatic, but check the log if this keeps shrinking.`;
  }
  return null;
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'dashboard', 'data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const tokenWarning = getTokenWarning();

  const profile = data.profiles['vpspaceman'] || {};
  const posts = data.posts['vpspaceman'] || [];
  const competitors = data.competitors || [];

  // Stats
  const avgLikes = Math.round(posts.reduce((s,p) => s+(p.likesCount||0),0) / (posts.length||1));
  const avgEng = (posts.reduce((s,p) => s+(p.engagementRate||0),0) / (posts.length||1) * 100).toFixed(2);
  const topPost = [...posts].sort((a,b) => b.likesCount - a.likesCount)[0];
  const reels = posts.filter(p => p.mediaType === 'reel');
  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' });

  // Content calendar — today's plan
  const plans = [
    'Reel — Dark sky spot near Chennai (post 6–8 PM)',
    'Carousel — 5 apps for Indian stargazers',
    'Story — Poll: Ride or Space content this weekend?',
    'Reel — ISS pass over Tamil Nadu (3am timelapse)',
    'Carousel — Budget telescope guide ₹5k–₹20k',
    'Reel — Munnar ride + Milky Way core',
    'Image — Weekly wrap + what\'s coming next',
  ];
  const dayIndex = new Date().getDay();
  const todayPlan = plans[dayIndex] || plans[0];

  const message = `🚀 <b>Content Agent Daily Report</b>
📅 ${today}
${tokenWarning ? `\n${tokenWarning}\n` : ''}
👤 <b>@vpspaceman</b>
├ Followers: <b>${profile.followersCount || 840}</b>
├ Total posts: <b>${profile.postsCount || 47}</b>
├ Avg likes: <b>${avgLikes}</b>
└ Engagement: <b>${avgEng}%</b>

📊 <b>Performance</b>
├ Reels (${reels.length}): avg ${Math.round(reels.reduce((s,p)=>s+p.likesCount,0)/(reels.length||1))} likes
└ Data source: ${data.postDataSource || 'sample'}

🏆 <b>Top Post</b>
${topPost ? `"${(topPost.caption||'').slice(0,80)}..."
❤️ ${topPost.likesCount} likes · 💬 ${topPost.commentsCount} comments` : 'No posts yet'}

📅 <b>Today's Plan</b>
${todayPlan}

⚔️ <b>Competitor Snapshot</b>
${competitors.map(h => {
  const p = data.profiles[h] || {};
  const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;
  return `├ @${h}: ${fmt(p.followersCount||0)} followers`;
}).join('\n')}

🤖 <b>Agent Status</b>
├ 💡 Ideator: Active
├ ✍️ Hook & Script: Active
├ 📅 Planner: Active
├ 📊 Analyst: Active
└ 💬 DM Manager: Active

🔗 Dashboard: http://localhost:3000
⏰ Next report: Tomorrow 8:00 AM`;

  console.log('Sending report to Telegram...');
  await sendMessage(message);
  console.log('✓ Report sent successfully!');
  console.log('\nMessage preview:');
  console.log(message);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });