// Client-side agent insights — computes REAL data-driven insights straight from
// data.json (Instagram Graph API data). No backend, no Anthropic, fully free.
// The UPLINK/REFRESH button re-fetches the latest data.json and recomputes these.

import { avgLikes } from './dashboardUtils';

const HANDLE = 'vpspaceman';
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Static identity for each agent card (icon/name/role never change)
export const AGENT_META = [
  { cls: 'ideator', icon: '💡', id: 'AGT-01', name: 'Ideator',     role: 'Content intelligence & idea scouting' },
  { cls: 'hook',    icon: '✍️', id: 'AGT-02', name: 'Hook & Script', role: 'Hooks, captions & reel scripts' },
  { cls: 'planner', icon: '📅', id: 'AGT-03', name: 'Planner',      role: 'Daily content scheduling & timing' },
  { cls: 'analyst', icon: '📊', id: 'AGT-04', name: 'Analyst',      role: 'Performance intelligence & benchmarking' },
  { cls: 'dm',      icon: '💬', id: 'AGT-05', name: 'DM Manager',   role: 'Inbound comms & collab intelligence' },
];

const FMT_EMOJI = { reel: '🎬', carousel: '🖼️', image: '📷' };
const FMT_LABEL = { reel: 'Reels', carousel: 'Carousels', image: 'Images' };
const FMT_SINGULAR = { reel: 'reel', carousel: 'carousel', image: 'image post' };

function clean(caption = '') {
  return caption.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
}

// Average likes grouped by media type → sorted best-first
function formatBreakdown(posts) {
  const groups = {};
  for (const p of posts) {
    const t = p.mediaType || 'image';
    (groups[t] = groups[t] || []).push(p);
  }
  return Object.entries(groups)
    .map(([type, arr]) => ({ type, count: arr.length, avg: avgLikes(arr) }))
    .sort((a, b) => b.avg - a.avg);
}

// Top hashtags by frequency (excludes the always-present personal tag)
function topHashtags(posts, n = 3) {
  const freq = {};
  for (const p of posts) {
    for (const h of p.hashtags || []) {
      const tag = h.toLowerCase();
      if (tag === '#vpspaceman') continue;
      freq[tag] = (freq[tag] || 0) + 1;
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, n).map(([t]) => t);
}

// Best weekday to post, by average likes (needs ≥2 posts on that day to count)
function bestDay(posts) {
  const byDay = {};
  for (const p of posts) {
    if (!p.timestamp) continue;
    const d = new Date(p.timestamp).getDay();
    (byDay[d] = byDay[d] || []).push(p.likesCount || 0);
  }
  let best = null;
  for (const [day, likes] of Object.entries(byDay)) {
    if (likes.length < 2) continue;
    const avg = Math.round(likes.reduce((s, x) => s + x, 0) / likes.length);
    if (!best || avg > best.avg) best = { day: DAYS[day], avg, n: likes.length };
  }
  return best;
}

export function deriveInsights(cls, data) {
  const posts   = (data?.posts?.[HANDLE] || []).filter((p) => p);
  const profile = data?.profiles?.[HANDLE] || {};

  if (!posts.length) {
    return [{ label: 'No data', text: 'Run the Instagram pull to load real posts, then refresh.' }];
  }

  const sorted   = [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  const top      = sorted[0];
  const formats  = formatBreakdown(posts);
  const bestFmt  = formats[0];
  const worstFmt = formats[formats.length - 1];
  const tags     = topHashtags(posts);
  const overall  = avgLikes(posts);
  const eng      = (posts.reduce((s, p) => s + (p.engagementRate || 0), 0) / posts.length * 100).toFixed(2);
  const mostComments = [...posts].sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0))[0];
  const day      = bestDay(posts);

  const topCaption = clean(top.caption).slice(0, 55) || '(no caption)';

  switch (cls) {
    case 'ideator':
      return [
        { label: 'Your best angle', text: `${FMT_EMOJI[top.mediaType] || '📷'} Top post "${topCaption}" pulled ${top.likesCount} likes — build a series around this` },
        { label: 'Winning format',  text: `${FMT_EMOJI[bestFmt.type] || '🎬'} ${FMT_LABEL[bestFmt.type]} average ${bestFmt.avg} likes — your strongest format, make more` },
        { label: 'Whitespace',      text: worstFmt && worstFmt.type !== bestFmt.type
            ? `${FMT_EMOJI[worstFmt.type]} You post few ${FMT_LABEL[worstFmt.type].toLowerCase()} (${worstFmt.count}) — test more to diversify reach`
            : `🔭 ${tags.length ? tags.join(' ') : 'Add niche hashtags'} — lean into your recurring themes` },
      ];

    case 'hook':
      return [
        { label: 'Proven hook',   text: `"${topCaption}" — your highest-performing opener at ${top.likesCount} likes. Reuse this structure` },
        { label: 'Best hashtags', text: tags.length ? `Your top-reaching tags: ${tags.join('  ')}` : 'Add 3–5 niche hashtags per post to grow reach' },
        { label: 'Caption tip',   text: 'Keep hooks tight and front-load the payoff — your top posts lead with the surprise' },
      ];

    case 'planner':
      return [
        { label: 'Best day to post', text: day ? `📅 ${day.day} performs best — avg ${day.avg} likes across ${day.n} posts` : '📅 Post consistently to reveal your best-performing day' },
        { label: 'Post next',        text: `${FMT_EMOJI[bestFmt.type] || '🎬'} Prioritise your next ${FMT_SINGULAR[bestFmt.type] || 'post'} — your ${bestFmt.avg}-like average beats the rest` },
        { label: 'Cadence',          text: `📈 ${posts.length} recent posts tracked · ${profile.postsCount || posts.length} total — keep a steady weekly rhythm` },
      ];

    case 'analyst': {
      const reels = posts.filter((p) => p.mediaType === 'reel');
      return [
        { label: 'Engagement',  text: `✅ ${eng}% avg engagement across ${posts.length} posts at ${profile.followersCount || '—'} followers` },
        { label: 'Best format', text: `${FMT_EMOJI[bestFmt.type] || '🎬'} ${FMT_LABEL[bestFmt.type]} avg ${bestFmt.avg} likes vs ${overall} overall${reels.length ? ` · ${reels.length} reels tracked` : ''}` },
        { label: 'Top post',    text: `🏆 "${topCaption}" — ${top.likesCount} likes, ${top.commentsCount} comments` },
      ];
    }

    case 'dm':
      return [
        { label: 'Engage here',   text: mostComments && mostComments.commentsCount
            ? `💬 "${clean(mostComments.caption).slice(0, 45)}" has ${mostComments.commentsCount} comments — reply to keep the thread alive`
            : '💬 Comments are low — end captions with a question to spark DMs' },
        { label: 'Pin an FAQ',    text: '📌 Add a gear/telescope guide link in bio — converts repeat questions into follows' },
        { label: 'Grow reach',    text: `🤝 ${eng}% engagement is strong for ${profile.followersCount || '—'} followers — pitch micro-collabs in your niche` },
      ];

    default:
      return [{ label: 'Status', text: 'Agent ready.' }];
  }
}
