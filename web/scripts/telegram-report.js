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
    return 'âš ï¸ <b>Instagram token status unknown</b> â€” refresh-instagram-token.js has not run yet.';
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  if (!meta.ok) {
    return `âš ï¸ <b>Instagram token refresh FAILED</b>\n${meta.error || 'Unknown error'}\nReal post data will stop updating soon â€” re-authenticate via Graph API Explorer.`;
  }
  const daysLeft = Math.round((new Date(meta.expiresAt) - Date.now()) / 86400000);
  if (daysLeft <= 10) {
    return `âš ï¸ <b>Instagram token expires in ${daysLeft} day(s)</b> (${meta.expiresAt.slice(0,10)}) â€” refresh is automatic, but check the log if this keeps shrinking.`;
  }
  return null;
}

async function main() {
  const dataPath = path.join(__dirname, '..', 'public', 'data.json');
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

  // Content calendar â€” today's plan
  const plans = [
    'Reel â€” Dark sky spot near Chennai (post 6â€“8 PM)',
    'Carousel â€” 5 apps for Indian stargazers',
    'Story â€” Poll: Ride or Space content this weekend?',
    'Reel â€” ISS pass over Tamil Nadu (3am timelapse)',
    'Carousel â€” Budget telescope guide â‚¹5kâ€“â‚¹20k',
    'Reel â€” Munnar ride + Milky Way core',
    'Image â€” Weekly wrap + what\'s coming next',
  ];
  const dayIndex = new Date().getDay();
  const todayPlan = plans[dayIndex] || plans[0];

  const message = `ðŸš€ <b>Content Agent Daily Report</b>
ðŸ“… ${today}
${tokenWarning ? `\n${tokenWarning}\n` : ''}
ðŸ‘¤ <b>@vpspaceman</b>
â”œ Followers: <b>${profile.followersCount || 840}</b>
â”œ Total posts: <b>${profile.postsCount || 47}</b>
â”œ Avg likes: <b>${avgLikes}</b>
â”” Engagement: <b>${avgEng}%</b>

ðŸ“Š <b>Performance</b>
â”œ Reels (${reels.length}): avg ${Math.round(reels.reduce((s,p)=>s+p.likesCount,0)/(reels.length||1))} likes
â”” Data source: ${data.postDataSource || 'sample'}

ðŸ† <b>Top Post</b>
${topPost ? `"${(topPost.caption||'').slice(0,80)}..."
â¤ï¸ ${topPost.likesCount} likes Â· ðŸ’¬ ${topPost.commentsCount} comments` : 'No posts yet'}

ðŸ“… <b>Today's Plan</b>
${todayPlan}

âš”ï¸ <b>Competitor Snapshot</b>
${competitors.map(h => {
  const p = data.profiles[h] || {};
  const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n;
  return `â”œ @${h}: ${fmt(p.followersCount||0)} followers`;
}).join('\n')}

ðŸ¤– <b>Agent Status</b>
â”œ ðŸ’¡ Ideator: Active
â”œ âœï¸ Hook & Script: Active
â”œ ðŸ“… Planner: Active
â”œ ðŸ“Š Analyst: Active
â”” ðŸ’¬ DM Manager: Active

ðŸ”— Dashboard: http://localhost:3000
â° Next report: Tomorrow 8:00 AM`;

  console.log('Sending report to Telegram...');
  await sendMessage(message);
  console.log('âœ“ Report sent successfully!');
  console.log('\nMessage preview:');
  console.log(message);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });

