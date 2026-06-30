// scripts/pull-news.js
// Pulls daily headlines across Astronomy / NASA / Space / Rockets / Bikes
// from public RSS feeds (no API key needed) and saves the top 10 mixed
// items to dashboard/news.json for the dashboard's "Daily Briefing" tab.
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const FEEDS = [
  { url: 'https://www.nasa.gov/feed/', category: 'NASA', max: 4 },
  { url: 'https://www.universetoday.com/feed/', category: 'Astronomy', max: 4 },
  { url: 'https://www.space.com/feeds/news', category: 'Space', max: 4 },
  { url: 'https://spacenews.com/feed/', category: 'Rockets', max: 4 },
  { url: 'https://feeds.feedburner.com/Asphaltandrubber', category: 'Bikes', max: 2 },
  { url: 'https://www.bikeexif.com/feed', category: 'Bikes', max: 3 },
  { url: 'https://venturebeat.com/category/ai/feed/', category: 'AI', max: 5 },
  { url: 'https://www.artificialintelligence-news.com/feed/', category: 'AI', max: 5 },
  { url: 'https://www.cnbc.com/id/15839069/device/rss/rss.html', category: 'Stocks', max: 6 },
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', category: 'Stocks', max: 4 },
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'World', max: 6 },
  { url: 'https://feeds.npr.org/1004/rss.xml', category: 'World', max: 4 },
];

function decodeEntities(s) {
  return (s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '’').replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“').replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–').replace(/&#8230;/g, '…')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x2019;/gi, '’').replace(/&#x2018;/gi, '‘')
    .replace(/&#x201c;/gi, '“').replace(/&#x201d;/gi, '”')
    .trim();
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]) : '';
}

function parseRss(xml, category) {
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of itemBlocks) {
    const title = extractTag(block, 'title');
    const link = extractTag(block, 'link') || extractTag(block, 'guid');
    const pubDateRaw = extractTag(block, 'pubDate');
    const pubDate = pubDateRaw ? new Date(pubDateRaw) : null;
    if (!title || !link || !pubDate || isNaN(pubDate.getTime())) continue;
    items.push({ title, link, pubDate: pubDate.toISOString(), category });
  }
  return items;
}

async function fetchFeed({ url, category, max }) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (content-agent-dashboard)' } });
    if (!res.ok) { console.log(`  ${category} (${url}): HTTP ${res.status}`); return []; }
    const xml = await res.text();
    const items = parseRss(xml, category).slice(0, max);
    console.log(`  ${category} (${url}): ${items.length} items`);
    return items;
  } catch (e) {
    console.log(`  ${category} (${url}): FAILED — ${e.message}`);
    return [];
  }
}

async function main() {
  console.log('Pulling daily briefing headlines...');
  const results = await Promise.all(FEEDS.map(fetchFeed));
  let all = results.flat();

  // de-dupe by title
  const seen = new Set();
  all = all.filter(item => {
    const key = item.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Guarantee category diversity: a pure global date-sort lets the most
  // frequently-updated feed (e.g. Space) crowd out slower ones (e.g. Bikes).
  // Take up to 2 newest per category first, then fill remaining slots from
  // whatever's left, sorted by date.
  const CATEGORIES = ['NASA', 'Astronomy', 'Space', 'Rockets', 'Bikes'];
  const byCategory = {};
  for (const c of CATEGORIES) {
    byCategory[c] = all.filter(i => i.category === c).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  }

  const picked = [];
  const pickedTitles = new Set();
  for (const c of CATEGORIES) {
    for (const item of byCategory[c].slice(0, 2)) {
      picked.push(item);
      pickedTitles.add(item.title.toLowerCase());
    }
  }
  const leftovers = all.filter(i => !pickedTitles.has(i.title.toLowerCase()))
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  for (const item of leftovers) {
    if (picked.length >= 10) break;
    picked.push(item);
  }

  const top10 = picked.slice(0, 10).sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Four-column grouping for the Dashboard tab — Space merges the four space-ish
  // categories used above; AI/Stocks are independent and don't affect the Daily
  // Briefing top10 (kept separate so adding columns doesn't dilute that tab).
  const sortByDate = items => [...items].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  const columns = {
    space: sortByDate(all.filter(i => ['NASA', 'Astronomy', 'Space', 'Rockets'].includes(i.category))).slice(0, 6),
    ai: sortByDate(all.filter(i => i.category === 'AI')).slice(0, 6),
    bikes: sortByDate(all.filter(i => i.category === 'Bikes')).slice(0, 6),
    world: sortByDate(all.filter(i => i.category === 'World')).slice(0, 6),
    stocks: sortByDate(all.filter(i => i.category === 'Stocks')).slice(0, 6),
  };

  const output = {
    pulledAt: new Date().toISOString(),
    items: top10,
    columns,
  };

  const outPath = path.join(__dirname, '..', 'dashboard', 'news.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Saved ${top10.length} headlines to dashboard/news.json`);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
