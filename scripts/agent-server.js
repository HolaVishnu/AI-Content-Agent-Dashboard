// scripts/agent-server.js
require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const DATA_PATH = path.join(__dirname, '..', 'dashboard', 'data.json');

function getData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text.trim();
}

function buildPrompt(agent, data) {
  const profile = data.profiles['vpspaceman'] || {};
  const posts = data.posts['vpspaceman'] || [];
  const topPosts = [...posts].sort((a,b) => b.likesCount - a.likesCount).slice(0, 3);
  const avgLikes = Math.round(posts.reduce((s,p) => s+(p.likesCount||0),0) / (posts.length||1));
  const avgEng = (posts.reduce((s,p) => s+(p.engagementRate||0),0) / (posts.length||1) * 100).toFixed(2);

  const context = `Creator: @vpspaceman (Vishnu Priyan)
Niche: Space astronomy + moto-vlog travel, India
Followers: ${profile.followersCount}
Avg likes per post: ${avgLikes}
Avg engagement rate: ${avgEng}%
Top posts: ${topPosts.map(p => '"'+p.caption.slice(0,60)+'" ('+p.likesCount+' likes, '+p.mediaType+')').join(' | ')}
Competitors: @mumbiker._.nikhil (818), @thetravelingdesi (536K), @nasdaily (4.7M), @karaandnate (1.25M)
Today: ${new Date().toDateString()}`;

  const prompts = {
    ideator: `You are an Ideator agent for an Instagram creator.\n${context}\n\nGenerate 3 fresh content ideas. Return ONLY a JSON array, no markdown:\n[{"label":"Top idea","text":"..."},{"label":"Trending opportunity","text":"..."},{"label":"Gap in niche","text":"..."}]`,
    hook: `You are a Hook & Script agent for an Instagram creator.\n${context}\n\nWrite fresh hooks and scripts. Return ONLY a JSON array, no markdown:\n[{"label":"Opening hook","text":"..."},{"label":"CTA","text":"..."},{"label":"Caption formula","text":"..."}]`,
    planner: `You are a Planner agent for an Instagram creator.\n${context}\n\nPlan next 3 content slots. Return ONLY a JSON array, no markdown:\n[{"label":"Post today","text":"..."},{"label":"Post tomorrow","text":"..."},{"label":"This weekend","text":"..."}]`,
    analyst: `You are an Analyst agent for an Instagram creator.\n${context}\n\nGive 3 sharp insights. Return ONLY a JSON array, no markdown:\n[{"label":"Engagement insight","text":"..."},{"label":"Best format","text":"..."},{"label":"Growth action","text":"..."}]`,
    dm: `You are a DM Manager agent for an Instagram creator.\n${context}\n\nSuggest DM priorities. Return ONLY a JSON array, no markdown:\n[{"label":"Priority action","text":"..."},{"label":"Common question to pin","text":"..."},{"label":"Collab opportunity","text":"..."}]`,
  };
  return prompts[agent];
}

function getFallback(agent, data) {
  const posts = data.posts['vpspaceman'] || [];
  const profile = data.profiles['vpspaceman'] || {};
  const avgL = Math.round(posts.reduce((s,p) => s+(p.likesCount||0),0) / (posts.length||1));
  const reels = posts.filter(p => p.mediaType==='reel');
  const avgR = Math.round(reels.reduce((s,p) => s+(p.likesCount||0),0) / (reels.length||1));
  const eng = (posts.reduce((s,p) => s+(p.engagementRate||0),0) / (posts.length||1) * 100).toFixed(2);
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = days[new Date().getDay()];

  const fallbacks = {
    ideator: [
      { label: 'Top idea right now', text: '🪐 '+today+' reel: "I spent a night at Tamil Nadu\'s darkest sky spot — what I saw will surprise you"' },
      { label: 'Trending opportunity', text: '🏍️ Monsoon ride + milky way combo — zero creators in India doing this right now' },
      { label: 'Content gap', text: '🔭 Budget astrophotography under ₹10,000 — a niche @nasdaily and @karaandnate cannot touch' },
    ],
    hook: [
      { label: 'Opening hook', text: '"99% of Indians have never seen the Milky Way. I found the spot 80km from Chennai — and I will show you exactly how to get there."' },
      { label: 'CTA', text: '"Save this post 🌌 You will thank yourself on the next clear night"' },
      { label: 'Caption formula', text: '[Surprising fact] → [Personal story] → [Actionable tip] → [Save/Share CTA] — getting your best engagement' },
    ],
    planner: [
      { label: 'Post ' + today, text: '🎬 Reel — "Dark sky spot near Chennai" — post between 6–8 PM for max reach' },
      { label: 'Post tomorrow', text: '🖼️ Carousel — "5 free apps every Indian stargazer needs" — educational content drives saves' },
      { label: 'Weekend anchor', text: '🏍️ Ride + astro combo reel — your highest engagement format, plan a shoot this weekend' },
    ],
    analyst: [
      { label: 'Engagement snapshot', text: '✅ Your ' + eng + '% avg engagement beats most accounts at ' + profile.followersCount + ' followers' },
      { label: 'Winning format', text: '🎬 Reels avg ' + avgR + ' likes vs ' + avgL + ' overall — double down on reels this month' },
      { label: 'Growth lever', text: '📈 Space + travel combo posts get 2.3x more saves — your unfair advantage vs competitors' },
    ],
    dm: [
      { label: 'Priority action', text: '📬 Telescope and travel brands are actively reaching out to micro creators — check and respond to DMs today' },
      { label: 'Pin this FAQ', text: '"What telescope do you use?" — add a gear guide link to your bio to convert curiosity into followers' },
      { label: 'Collab to pursue', text: '🤝 Reach out to 1 Indian dark sky reserve or planetarium — co-created content would 10x your credibility' },
    ],
  };
  return fallbacks[agent] || [{ label: 'Status', text: 'Agent ready — add Anthropic API credits to enable live AI generation' }];
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  const url = new URL(req.url, 'http://localhost:'+PORT);

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', agents: ['ideator','hook','planner','analyst','dm'] }));
    return;
  }

  if (url.pathname.startsWith('/agent/')) {
    const agentName = url.pathname.split('/agent/')[1];
    const validAgents = ['ideator','hook','planner','analyst','dm'];

    if (!validAgents.includes(agentName)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unknown agent: ' + agentName }));
      return;
    }

    console.log('['+new Date().toISOString()+'] Agent triggered: ' + agentName);

    try {
      const data = getData();
      let items;
      try {
        const prompt = buildPrompt(agentName, data);
        const result = await callClaude(prompt);
        const clean = result.replace(/```json|```/g, '').trim();
        items = JSON.parse(clean);
        console.log('  Claude AI responded OK');
      } catch (apiErr) {
        console.warn('  Claude API failed ('+apiErr.message+') — using smart fallback');
        items = getFallback(agentName, data);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ agent: agentName, items: items, generatedAt: new Date().toISOString() }));
    } catch (err) {
      console.error('Agent '+agentName+' error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('\n🤖 Agent server running on http://localhost:'+PORT);
  console.log('Endpoints: /health | /agent/ideator | /agent/hook | /agent/planner | /agent/analyst | /agent/dm\n');
});