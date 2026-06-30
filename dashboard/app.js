// ── ASTRONAUT + ANIMATED SOLAR SYSTEM ILLUSTRATION ──────────────────────────
// An astronaut floating in front of a small, genuinely-orbiting solar system
// (real SVG <animateTransform> motion, not a static graphic).
const ASTRONAUT_SVG = `
<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#1c1c3a"/>
      <stop offset="100%" stop-color="#07070f"/>
    </radialGradient>
    <linearGradient id="suit" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8e8ff"/>
      <stop offset="100%" stop-color="#9b9bd0"/>
    </linearGradient>
    <radialGradient id="visor" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#bfffe9"/>
      <stop offset="45%" stop-color="#00c9b0"/>
      <stop offset="100%" stop-color="#063b34"/>
    </radialGradient>
    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff7c2"/>
      <stop offset="55%" stop-color="#ffcf3f"/>
      <stop offset="100%" stop-color="#ff8c1a"/>
    </radialGradient>
  </defs>
  <rect width="240" height="240" fill="url(#bg)"/>
  <circle cx="32" cy="34" r="1.3" fill="#fff" opacity="0.7"/>
  <circle cx="208" cy="50" r="1" fill="#fff" opacity="0.6"/>
  <circle cx="20" cy="150" r="1.4" fill="#fff" opacity="0.6"/>
  <circle cx="216" cy="190" r="1" fill="#fff" opacity="0.5"/>

  <!-- ANIMATED SOLAR SYSTEM (orbiting, behind/above the astronaut) -->
  <g transform="translate(120,88)">
    <circle r="8.5" fill="url(#sunGlow)"/>
    <circle r="15" fill="none" stroke="#FFD700" opacity="0.18"/>

    <g transform="scale(1,0.42)">
      <ellipse r="26" fill="none" stroke="#9B7FE0" stroke-width="1" opacity="0.4"/>
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/>
        <circle cx="26" cy="0" r="2.6" fill="#4d96ff"/>
      </g>
    </g>
    <g transform="scale(1,0.42)">
      <ellipse r="40" fill="none" stroke="#9B7FE0" stroke-width="1" opacity="0.32"/>
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="7s" repeatCount="indefinite"/>
        <circle cx="40" cy="0" r="2.1" fill="#d1542e"/>
      </g>
    </g>
    <g transform="scale(1,0.42)">
      <ellipse r="55" fill="none" stroke="#9B7FE0" stroke-width="1" opacity="0.24"/>
      <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="11s" repeatCount="indefinite"/>
        <circle cx="55" cy="0" r="3.4" fill="#ead6a8"/>
        <ellipse cx="55" cy="0" rx="6" ry="1.6" fill="none" stroke="#C9B98A" stroke-width="0.8"/>
      </g>
    </g>
  </g>

  <!-- ASTRONAUT, floating lower-frame, facing up toward the solar system -->
  <g transform="translate(120,178) scale(0.78)">
    <rect x="-28" y="-8" width="56" height="68" rx="14" fill="#3a3a5e"/>
    <ellipse cx="0" cy="42" rx="46" ry="52" fill="url(#suit)"/>
    <ellipse cx="0" cy="42" rx="46" ry="52" fill="none" stroke="#6a6ab0" stroke-width="2" opacity="0.5"/>
    <rect x="-20" y="22" width="40" height="26" rx="5" fill="#1b1b38"/>
    <circle cx="-10" cy="35" r="3" fill="#00F5D4"/>
    <circle cx="0" cy="35" r="3" fill="#FFD700"/>
    <circle cx="10" cy="35" r="3" fill="#FF4466"/>
    <rect x="-14" y="40" width="28" height="4" rx="2" fill="#444470"/>
    <!-- arm raised toward the solar system -->
    <ellipse cx="-46" cy="-6" rx="15" ry="32" fill="url(#suit)" transform="rotate(-48 -46 -6)"/>
    <circle cx="-66" cy="-30" r="12" fill="#cfcfe8"/>
    <ellipse cx="52" cy="38" rx="16" ry="34" fill="url(#suit)" transform="rotate(18 52 38)"/>
    <circle cx="62" cy="72" r="13" fill="#cfcfe8"/>
    <!-- helmet -->
    <circle cx="0" cy="-32" r="50" fill="url(#suit)"/>
    <circle cx="0" cy="-32" r="50" fill="none" stroke="#6a6ab0" stroke-width="2" opacity="0.5"/>
    <circle cx="0" cy="-30" r="37" fill="url(#visor)"/>
    <ellipse cx="-14" cy="-45" rx="13" ry="7" fill="#ffffff" opacity="0.35"/>
    <!-- tiny reflected planet in the visor -->
    <circle cx="14" cy="-18" r="5" fill="#FFD700" opacity="0.85"/>
  </g>
</svg>`;

document.getElementById('heroPortraitImg').innerHTML = ASTRONAUT_SVG;
document.getElementById('lightboxPhoto').innerHTML = ASTRONAUT_SVG;

// ── STARFIELD (background, behind all views) ───────────────────────────────
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];

function initStars() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = Array.from({ length: 220 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.2 + 0.2,
    o: Math.random() * 0.7 + 0.1,
    speed: Math.random() * 0.3 + 0.05,
    twinkle: Math.random() * Math.PI * 2,
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const t = Date.now() / 1000;
  stars.forEach(s => {
    const opacity = s.o * (0.6 + 0.4 * Math.sin(t * s.speed + s.twinkle));
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,232,255,${opacity})`;
    ctx.fill();
  });
  const grad1 = ctx.createRadialGradient(canvas.width*0.2, canvas.height*0.3, 0, canvas.width*0.2, canvas.height*0.3, 300);
  grad1.addColorStop(0, 'rgba(123,47,190,0.04)'); grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const grad2 = ctx.createRadialGradient(canvas.width*0.8, canvas.height*0.7, 0, canvas.width*0.8, canvas.height*0.7, 250);
  grad2.addColorStop(0, 'rgba(0,245,212,0.03)'); grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2; ctx.fillRect(0, 0, canvas.width, canvas.height);
  requestAnimationFrame(drawStars);
}
window.addEventListener('resize', initStars);
initStars(); drawStars();

// ── CURSOR GLOW ──────────────────────────────────────────────────────────
const cursorGlow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, .body-pill, .const-pill, .hero-portrait-wrap, .nav-tab, .scroll-dot').forEach(el => {
  el.addEventListener('mouseenter', () => cursorGlow.classList.add('hover'));
  el.addEventListener('mouseleave', () => cursorGlow.classList.remove('hover'));
});

// ── CLOCK ─────────────────────────────────────────────────────────────────
const TZ_LABEL = Intl.DateTimeFormat('en', { timeZoneName: 'short' })
  .formatToParts(new Date()).find(p => p.type === 'timeZoneName').value;

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('clock').textContent = `${h}:${m}:${s} ${TZ_LABEL}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── HOVER TOOLTIP (shared by solar + constellations) ────────────────────
const tooltip = document.getElementById('hoverTooltip');
function showTooltip(x, y, name, type, desc) {
  document.getElementById('tt-name').textContent = name;
  document.getElementById('tt-type').textContent = type;
  document.getElementById('tt-desc').textContent = desc;
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.style.display = 'block';
}
function hideTooltip() { tooltip.style.display = 'none'; }

// ── TOP NAV SWITCHING ────────────────────────────────────────────────────
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + tab.dataset.view).classList.add('active');
    document.getElementById('scrollDots').style.display = tab.dataset.view === 'home' ? 'flex' : 'none';
    const showCinematic = tab.dataset.view === 'dashboard' || tab.dataset.view === 'briefing';
    document.getElementById('cinematicBg').classList.toggle('active', showCinematic);
    if (showCinematic) loadApodImages();
    if (tab.dataset.view === 'home') {
      setTimeout(onSolarResize, 50);
      setTimeout(onConstResize, 50);
      setTimeout(onGalaxyResize, 50);
      setTimeout(onUniverseResize, 50);
    }
    if (tab.dataset.view === 'briefing' && !briefingLoaded) { briefingLoaded = true; loadFeedColumns(); }
  });
});

// ── HERO LIGHTBOX (shared-element style expand) ──────────────────────────
const heroPortrait = document.getElementById('heroPortrait');
const heroLightbox = document.getElementById('heroLightbox');
heroPortrait.addEventListener('click', () => heroLightbox.classList.add('open'));
document.getElementById('lightboxClose').addEventListener('click', () => heroLightbox.classList.remove('open'));
heroLightbox.addEventListener('click', e => { if (e.target === heroLightbox) heroLightbox.classList.remove('open'); });
window.addEventListener('keydown', e => { if (e.key === 'Escape') heroLightbox.classList.remove('open'); });

// ── SCROLL DOTS (home sections) ──────────────────────────────────────────
const homeView = document.getElementById('view-home');
const sections = [
  document.getElementById('sec-hero'),
  document.getElementById('sec-solar'),
  document.getElementById('sec-galaxy'),
  document.getElementById('sec-universe'),
  document.getElementById('sec-const'),
];
document.querySelectorAll('.scroll-dot').forEach(dot => {
  dot.addEventListener('click', () => sections[+dot.dataset.section].scrollIntoView({ behavior: 'smooth' }));
});
let galaxyInited = false, universeInited = false, briefingLoaded = false;
const dotObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = sections.indexOf(entry.target);
      document.querySelectorAll('.scroll-dot').forEach((d,i) => d.classList.toggle('active', i===idx));
      hideTooltip();
    }
  });
}, { root: homeView, threshold: 0.5 });
sections.forEach(s => dotObserver.observe(s));

// Separate, much-earlier-firing observer purely for lazy-initializing each
// section's canvas — without this, a section's WebGL/2D scene only existed
// once 50% scrolled into view, so scrolling through it showed solid black
// for a moment first (looked like a broken "split screen"). Pre-loading
// ~1 viewport ahead means the canvas is already rendering by the time it's seen.
const lazyInitObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const idx = sections.indexOf(entry.target);
    if (idx === 1 && !solarInited) { solarInited = true; initSolarSystem(); }
    if (idx === 2 && !galaxyInited) { galaxyInited = true; initGalaxy(); }
    if (idx === 3 && !universeInited) { universeInited = true; initUniverse(); }
    if (idx === 4 && !constInited) { constInited = true; initConstellations(); }
  });
}, { root: homeView, rootMargin: '100% 0px 100% 0px', threshold: 0 });
sections.forEach(s => lazyInitObserver.observe(s));

// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD LOGIC
// ══════════════════════════════════════════════════════════════════════════
const AGENT_SERVER = 'http://localhost:3001';
function fmt(n) { if (n >= 1000000) return (n/1000000).toFixed(1)+'M'; if (n >= 1000) return (n/1000).toFixed(1)+'K'; return String(n); }
function avgLikes(posts) { if (!posts || !posts.length) return 0; return Math.round(posts.reduce((s,p) => s+(p.likesCount||0),0)/posts.length); }
function avgEng(posts) { if (!posts || !posts.length) return '0.00'; return (posts.reduce((s,p) => s+(p.engagementRate||0),0)/posts.length*100).toFixed(2); }
function mediaEmoji(t) { return t==='reel' ? '🎬' : t==='carousel' ? '🖼️' : '📷'; }
function renderItems(items) { return items.map(i => `<div class="output-item"><div class="output-label">${i.label}</div><div class="output-text">${i.text}</div></div>`).join(''); }

async function triggerAgent(cls) {
  const btn = document.getElementById('btn-'+cls);
  const out = document.getElementById('out-'+cls);
  const ts  = document.getElementById('ts-'+cls);
  btn.disabled = true;
  btn.innerHTML = '<span class="spinning">⟳</span> UPLINK...';
  out.style.opacity = '0.3';
  try {
    const res = await fetch(`${AGENT_SERVER}/agent/${cls}`);
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    out.innerHTML = renderItems(data.items);
    out.style.opacity = '1';
    ts.textContent = '✓ SYNCED ' + new Date(data.generatedAt).toLocaleTimeString();
    btn.innerHTML = '⚡ RE-UPLINK';
    btn.disabled = false;
  } catch(e) {
    out.style.opacity = '1';
    ts.textContent = '⚠ ' + e.message;
    btn.innerHTML = '⚡ RETRY';
    btn.disabled = false;
  }
}
window.triggerAgent = triggerAgent;

function renderAgents(data) {
  const posts  = data.posts['vpspaceman'] || [];
  const reels  = posts.filter(p => p.mediaType==='reel');
  const eng    = avgEng(posts);
  const avgR   = avgLikes(reels);
  const avgAll = avgLikes(posts);

  const agents = [
    { cls:'ideator', icon:'💡', id:'AGT-01', name:'Ideator', role:'Content intelligence & idea scouting',
      items:[
        {label:'Top idea', text:'🪐 "I visited India\'s only dark sky reserve — what I saw will change how you look up"'},
        {label:'Trending now', text:'🏍️ Monsoon ride + astrophotography combo — zero creators covering this'},
        {label:'Whitespace', text:'🔭 Budget stargazing under ₹10,000 — a gap no Indian creator owns yet'},
      ]},
    { cls:'hook', icon:'✍️', id:'AGT-02', name:'Hook & Script', role:'Hooks, captions & reel scripts',
      items:[
        {label:'Opening hook', text:'"99% of Indians have never seen the Milky Way. I found the spot 80km from Chennai."'},
        {label:'CTA', text:'"Save this 🌌 — you\'ll need it on the next clear night"'},
        {label:'Caption arc', text:'Surprising fact → personal story → actionable tip → save CTA'},
      ]},
    { cls:'planner', icon:'📅', id:'AGT-03', name:'Planner', role:'Daily content scheduling & timing',
      items:[
        {label:'Post today', text:'🎬 Reel — dark sky spot near Chennai — window: 6–8 PM'},
        {label:'Post tomorrow', text:'🖼️ Carousel — 5 apps every Indian stargazer needs'},
        {label:'Weekend', text:'🏍️ Munnar ride + Milky Way timelapse — your highest-eng format'},
      ]},
    { cls:'analyst', icon:'📊', id:'AGT-04', name:'Analyst', role:'Performance intelligence & benchmarking',
      items:[
        {label:'Signal strength', text:`✅ ${eng}% engagement — outperforming accounts at similar orbit`},
        {label:'Best format', text:`🎬 Reels avg ${avgR} likes vs ${avgAll} overall — double down`},
        {label:'Growth vector', text:'📈 Space + travel combos get 2.3× more saves — your unfair advantage'},
      ]},
    { cls:'dm', icon:'💬', id:'AGT-05', name:'DM Manager', role:'Inbound comms & collab intelligence',
      items:[
        {label:'Priority', text:'📬 Telescope & travel brands actively prospecting micro creators — check DMs'},
        {label:'FAQ to pin', text:'"What telescope do you use?" — add gear guide link to bio'},
        {label:'Collab target', text:'🤝 Indian dark sky reserve or planetarium — co-content = 10× credibility'},
      ]},
  ];

  document.getElementById('agentsGrid').innerHTML = agents.map(a => `
    <div class="agent-module ${a.cls}">
      <div class="module-header"><div class="module-icon">${a.icon}</div><div class="module-id">${a.id}</div></div>
      <div style="margin-bottom:12px">
        <div class="module-name">${a.name}</div>
        <div class="module-role">${a.role}</div>
        <div class="module-online" style="margin-top:6px"><div class="module-dot"></div>ONLINE</div>
      </div>
      <div class="module-outputs" id="out-${a.cls}">${renderItems(a.items)}</div>
      <button class="trigger-btn" id="btn-${a.cls}" onclick="triggerAgent('${a.cls}')">⚡ UPLINK AGENT</button>
      <div class="agent-ts" id="ts-${a.cls}"></div>
    </div>`).join('');
}

function renderTopPosts(data) {
  const posts = data.posts['vpspaceman'] || [];
  const top   = [...posts].sort((a,b) => b.likesCount-a.likesCount).slice(0,4);
  document.getElementById('topPosts').innerHTML = top.map((p,i) => `
    <div class="post-item">
      <div class="post-rank">${String(i+1).padStart(2,'0')}</div>
      <div class="post-type-badge">${mediaEmoji(p.mediaType)}</div>
      <div class="post-body">
        <div class="post-caption">${p.caption.slice(0,90)}${p.caption.length>90?'…':''}</div>
        <div class="post-stats"><span class="post-stat">❤ ${fmt(p.likesCount)}</span><span class="post-stat">💬 ${p.commentsCount}</span><span class="post-stat">⚡ ${(p.engagementRate*100).toFixed(1)}%</span></div>
      </div>
    </div>`).join('');
}

function renderCompetitors(data) {
  const all  = [data.me, ...data.competitors];
  const maxF = Math.max(...all.map(h => data.profiles[h]?.followersCount||0));
  const colors = ['#00F5D4','#7B2FBE','#FF4466','#FFD700','#1B4FD8'];
  document.getElementById('compList').innerHTML = all.map((h,i) => {
    const p   = data.profiles[h] || {};
    const posts = data.posts[h] || [];
    const pct = Math.round((p.followersCount||0)/maxF*100);
    const eng = avgEng(posts);
    const isMe = h === data.me;
    return `
    <div class="comp-item ${isMe?'you':''}">
      <div class="comp-row"><div class="comp-handle ${isMe?'you-handle':''}">@${h}${isMe?' ◈':''}</div><div class="comp-followers">${fmt(p.followersCount||0)}</div></div>
      <div class="comp-bar-bg"><div class="comp-bar-fill" style="width:${pct}%;background:linear-gradient(90deg,${colors[i]},${colors[(i+1)%colors.length]})"></div></div>
      <div class="comp-eng">${eng}% eng · ${fmt(avgLikes(posts))} avg likes</div>
    </div>`;
  }).join('');
}

function renderCalendar() {
  const days  = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const colors= ['#7B2FBE','#FF4466','#00F5D4','#FFD700','#1B4FD8','#FF8800','#9B4FDE'];
  const plans = [
    {type:'Reel',     text:'Dark sky spot 80km from Chennai — night ride + astrophotography'},
    {type:'Carousel', text:'5 free apps every Indian stargazer needs in 2026'},
    {type:'Story',    text:'Poll: Ride content or Space content this weekend?'},
    {type:'Reel',     text:'POV: Waking up at 3am to catch the ISS pass over Tamil Nadu'},
    {type:'Carousel', text:'Budget telescope guide — ₹5,000–₹20,000 range with real reviews'},
    {type:'Reel',     text:'Munnar ride + Milky Way core timelapse at the summit'},
    {type:'Image',    text:'Weekly wrap: best shot + what\'s coming next week'},
  ];
  const today = new Date();
  document.getElementById('calList').innerHTML = plans.map((p,i) => {
    const d    = new Date(today); d.setDate(today.getDate()+i);
    const label= i===0?'TODAY':i===1?'TMW':days[d.getDay()];
    const isToday = i===0;
    return `
    <div class="cal-item ${isToday?'today':''}">
      <div class="cal-day ${isToday?'today-label':''}">${label}</div>
      <div class="cal-orb" style="background:${colors[i]};box-shadow:0 0 6px ${colors[i]}55"></div>
      <div><div class="cal-text">${p.text}</div><div class="cal-format">${p.type}</div></div>
    </div>`;
  }).join('');
}

// ── LIVE SPACE DATA: launches (Launch Library 2) + space weather (NASA DONKI) ──
let liveSpaceDataLoaded = false;
async function loadLiveSpaceData() {
  if (liveSpaceDataLoaded) return;
  liveSpaceDataLoaded = true;
  loadLaunches();
  loadSpaceWeather();
}

async function loadLaunches() {
  const el = document.getElementById('launchList');
  try {
    const res = await fetch('launches.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const launches = data.launches || [];
    if (!launches.length) { el.innerHTML = '<div class="live-data-empty">No launch data — run scripts/pull-launches.js</div>'; return; }
    el.innerHTML = launches.map(l => {
      const dt = new Date(l.net);
      const isGo = /go|confirmed/i.test(l.status);
      return `
      <div class="launch-item">
        <div class="launch-item-top">
          <div class="launch-name">${l.name}</div>
          <div class="launch-status ${isGo ? '' : 'tbd'}">${l.statusAbbrev || l.status}</div>
        </div>
        <div class="launch-meta">${l.provider} · ${l.rocket} · ${dt.toLocaleDateString(undefined,{month:'short',day:'numeric'})} ${dt.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</div>
      </div>`;
    }).join('');
  } catch (e) {
    el.innerHTML = `<div class="live-data-empty">⚠ Failed to load: ${e.message}</div>`;
  }
}

async function loadSpaceWeather() {
  const el = document.getElementById('weatherList');
  try {
    const res = await fetch('spaceweather.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const events = data.events || [];
    if (!events.length) { el.innerHTML = '<div class="live-data-empty">No solar activity in the last 7 days — quiet skies.</div>'; return; }
    el.innerHTML = events.map(e => `
      <div class="weather-item">
        <div class="weather-item-top"><span class="weather-icon">${e.icon}</span><span class="weather-type">${e.type}</span></div>
        <div class="weather-detail">${e.detail}</div>
        <div class="weather-time">${new Date(e.time).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
      </div>`).join('');
  } catch (e) {
    el.innerHTML = `<div class="live-data-empty">⚠ Failed to load: ${e.message}</div>`;
  }
}

function updateTelemetry(data) {
  const p     = data.profiles['vpspaceman'] || {};
  const posts = data.posts['vpspaceman'] || [];
  const reels = posts.filter(x => x.mediaType==='reel');
  document.getElementById('t-followers').textContent = fmt(p.followersCount||840);
  document.getElementById('t-posts').textContent     = p.postsCount||47;
  document.getElementById('t-eng').textContent       = avgEng(posts)+'%';
  document.getElementById('t-likes').textContent     = fmt(avgLikes(posts));
  document.getElementById('t-reels').textContent     = reels.length;
  document.getElementById('t-source').textContent    = (data.postDataSource||'sample').toUpperCase().slice(0,6);
  const sync = new Date(data.pulledAt);
  document.getElementById('t-sync').textContent      = sync.toLocaleDateString();
  document.getElementById('foot-date').textContent   = sync.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
}

const REFRESH_INTERVAL_MS = 30000;
let dashboardLoadedOnce = false;
let lastRefreshAt = null;

function setLiveStatus(text) {
  const el = document.getElementById('liveRefreshText');
  if (el) el.textContent = text;
}

function renderFeedColumn(elId, items) {
  const el = document.getElementById(elId);
  if (!items || !items.length) { el.innerHTML = '<div class="feed-col-empty">No headlines yet</div>'; return; }
  el.innerHTML = items.map(item => `
    <a class="feed-item" href="${item.link}" target="_blank" rel="noopener">
      <div class="feed-item-title">${item.title}</div>
      <div class="feed-item-meta">${timeAgo(item.pubDate)} · ${new URL(item.link).hostname.replace('www.','')}</div>
    </a>`).join('');
}

async function loadFeedColumns() {
  try {
    const res = await fetch('news.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const cols = data.columns || {};
    renderFeedColumn('feedSpace', cols.space);
    renderFeedColumn('feedAi', cols.ai);
    renderFeedColumn('feedBikes', cols.bikes);
    renderFeedColumn('feedWorld', cols.world);
    renderFeedColumn('feedStocks', cols.stocks);
  } catch (e) {
    ['feedSpace','feedAi','feedBikes','feedWorld','feedStocks'].forEach(id => {
      document.getElementById(id).innerHTML = `<div class="feed-col-empty">⚠ Failed to load</div>`;
    });
  }
}

async function refreshDashboard() {
  try {
    const res  = await fetch('data.json?t=' + Date.now()); // cache-bust so polling actually re-reads the file
    if (!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    updateTelemetry(data);
    renderTopPosts(data);
    renderCompetitors(data);
    if (!dashboardLoadedOnce) {
      renderAgents(data);   // only render agent cards once — re-rendering would wipe live "UPLINK AGENT" results
      renderCalendar();
      loadLiveSpaceData();
      dashboardLoadedOnce = true;
    }
    lastRefreshAt = Date.now();
    setLiveStatus('LIVE · SYNCED ' + new Date().toLocaleTimeString());
  } catch(e) {
    console.error('Failed to load data.json:', e);
    setLiveStatus('⚠ SYNC FAILED — RETRYING');
  }
}

function tickLiveStatus() {
  if (!lastRefreshAt) return;
  const secs = Math.round((Date.now() - lastRefreshAt) / 1000);
  if (secs >= 3) setLiveStatus(`LIVE · NEXT SYNC IN ${Math.max(0, Math.round(REFRESH_INTERVAL_MS/1000 - secs))}s`);
}

refreshDashboard();
setInterval(refreshDashboard, REFRESH_INTERVAL_MS);
setInterval(tickLiveStatus, 1000);

// ══════════════════════════════════════════════════════════════════════════
// SOLAR SYSTEM (Three.js, hover tooltip)
// ══════════════════════════════════════════════════════════════════════════
// spinDays = real rotation period in Earth days (negative = retrograde, i.e. Venus/Uranus
// visibly spin backwards relative to their orbit, same as in reality).
// CORS-friendly texture host (jsDelivr serves GitHub raw content with
// Access-Control-Allow-Origin: * — the original solarsystemscope.com URLs were
// blocking cross-origin hotlinking, which silently failed every texture load).
const TEX = 'https://cdn.jsdelivr.net/gh/N3rson/Solar-System-3D@main/src/images/';
const PLANETS = [
  { key:'mercury', name:'Mercury', type:'Terrestrial Planet', color:0x9c9c9c, texture: TEX+'mercurymap.jpg', radius:0.38, orbit:14, period:0.24, spinDays:58.6,
    desc:'The smallest, fastest planet — a scorched, cratered world baked by the closest orbit to the Sun.' },
  { key:'venus', name:'Venus', type:'Terrestrial Planet', color:0xe8c27a, texture: TEX+'venusmap.jpg', radius:0.6, orbit:19, period:0.62, spinDays:-243,
    desc:'Earth\'s twin in size, but a runaway greenhouse hell under crushing CO₂ skies — and it spins backwards.' },
  { key:'earth', name:'Earth', type:'Terrestrial Planet', color:0x4d96ff, texture: TEX+'earth_daymap.jpg', radius:0.64, orbit:25, period:1, spinDays:1,
    desc:'Home. The only known world with liquid oceans, breathable air, and life.' },
  { key:'mars', name:'Mars', type:'Terrestrial Planet', color:0xd1542e, texture: TEX+'marsmap.jpg', radius:0.5, orbit:32, period:1.88, spinDays:1.03,
    desc:'The Red Planet — iron oxide dust, polar ice, and the tallest volcano in the solar system.' },
  { key:'jupiter', name:'Jupiter', type:'Gas Giant', color:0xd9a06b, texture: TEX+'jupiter.jpg', radius:2.2, orbit:48, period:11.86, spinDays:0.41,
    desc:'The largest planet — a churning hydrogen giant with a storm bigger than Earth. Spins so fast its day is under 10 hours.' },
  { key:'saturn', name:'Saturn', type:'Gas Giant', color:0xead6a8, texture: TEX+'saturnmap.jpg', radius:1.9, orbit:66, period:29.46, spinDays:0.45, hasRing:true,
    desc:'Famed for its dazzling ice-and-rock ring system — low density enough to float in water.' },
  { key:'uranus', name:'Uranus', type:'Ice Giant', color:0x9fe3e3, texture: TEX+'uranus.jpg', radius:1.3, orbit:82, period:84.01, spinDays:-0.72,
    desc:'Tipped almost completely on its side, rolling around the Sun like a ball — and also spins backwards.' },
  { key:'neptune', name:'Neptune', type:'Ice Giant', color:0x4169e1, texture: TEX+'neptune.jpg', radius:1.25, orbit:96, period:164.8, spinDays:0.67,
    desc:'The windiest world known — supersonic methane storms at the dark edge of the system.' },
];

// Real major moons (and one artificial satellite) per planet, with relative
// orbit radius/period scaled for a clear visual on top of the planet's own spin.
const MOONS = {
  earth: [
    { key:'moon', name:'The Moon', type:'Natural Satellite', color:0xcfcfcf, texture:'https://cdn.jsdelivr.net/gh/N3rson/Solar-System-3D@main/src/images/moonmap.jpg', radius:0.17, orbit:1.7, periodDays:27.3,
      desc:'Earth\'s only natural satellite — formed ~4.5 billion years ago, likely from a giant impact.' },
    { key:'iss', name:'ISS', type:'Artificial Satellite (symbolic)', color:0xffffff, radius:0.06, orbit:0.95, periodDays:0.065,
      desc:'The International Space Station orbits Earth roughly every 92 minutes — shown here symbolically, not to scale.' },
  ],
  mars: [
    { key:'phobos', name:'Phobos', type:'Natural Satellite', color:0x9c8a7a, radius:0.07, orbit:0.85, periodDays:0.32,
      desc:'The larger, closer of Mars\' two moons — a lumpy captured asteroid slowly spiraling inward.' },
    { key:'deimos', name:'Deimos', type:'Natural Satellite', color:0xada094, radius:0.05, orbit:1.25, periodDays:1.26,
      desc:'The smaller, more distant Martian moon — likely another captured asteroid.' },
  ],
  jupiter: [
    { key:'io', name:'Io', type:'Galilean Moon', color:0xe9d18a, radius:0.22, orbit:3.0, periodDays:1.77,
      desc:'The most volcanically active body in the solar system, wracked by Jupiter\'s tidal forces.' },
    { key:'europa', name:'Europa', type:'Galilean Moon', color:0xd8c9b0, radius:0.19, orbit:3.8, periodDays:3.55,
      desc:'An ice-shelled moon hiding a global ocean — one of the best bets for life beyond Earth.' },
    { key:'ganymede', name:'Ganymede', type:'Galilean Moon', color:0xa89a86, radius:0.27, orbit:4.7, periodDays:7.15,
      desc:'The largest moon in the solar system — bigger than the planet Mercury.' },
    { key:'callisto', name:'Callisto', type:'Galilean Moon', color:0x8a8076, radius:0.25, orbit:5.6, periodDays:16.7,
      desc:'Jupiter\'s heavily cratered outermost large moon, among the oldest surfaces in the solar system.' },
  ],
  saturn: [
    { key:'titan', name:'Titan', type:'Major Moon', color:0xe0b659, radius:0.26, orbit:4.2, periodDays:15.9,
      desc:'Saturn\'s largest moon — the only moon with a dense atmosphere and liquid methane lakes.' },
    { key:'rhea', name:'Rhea', type:'Major Moon', color:0xc9c2b8, radius:0.14, orbit:3.2, periodDays:4.5,
      desc:'Saturn\'s second-largest moon, a heavily cratered icy world.' },
    { key:'enceladus', name:'Enceladus', type:'Major Moon', color:0xeaf2f5, radius:0.09, orbit:2.5, periodDays:1.37,
      desc:'A small icy moon erupting water-ice geysers from a hidden subsurface ocean.' },
  ],
  uranus: [
    { key:'titania', name:'Titania', type:'Major Moon', color:0xb0aab5, radius:0.15, orbit:3.0, periodDays:8.7,
      desc:'Uranus\' largest moon, a icy-rocky world with canyons larger than Earth\'s Grand Canyon.' },
    { key:'oberon', name:'Oberon', type:'Major Moon', color:0xa49e9c, radius:0.14, orbit:3.8, periodDays:13.5,
      desc:'Uranus\' second-largest and outermost major moon.' },
  ],
  neptune: [
    { key:'triton', name:'Triton', type:'Major Moon', color:0xcfd8da, radius:0.2, orbit:2.8, periodDays:5.88,
      desc:'A captured Kuiper Belt object orbiting backwards — geologically active with nitrogen-ice geysers.' },
  ],
};

// Real orbital elements (heliocentric, J2000-ish, ecliptic-flattened for visualization).
// a = semi-major axis (AU), e = eccentricity, period = orbital period (years),
// epoch = a real past perihelion date used as the reference point for Kepler's equation.
// sceneA = visual semi-major axis (scene units) — compressed so wildly elongated
// long-period comets stay on-screen; orbital SHAPE/MOTION/DATES are still computed
// from the real a/e/period/epoch, only the display scale is artistic.
const COMETS = [
  { key:'halley', name: "Halley's Comet", designation:'1P/Halley', a:17.8, e:0.967, period:75.32,
    epoch:'1986-02-09', sceneA:140, omega: 30, color:0xbfe9ff,
    desc:'The most famous periodic comet, visible to the naked eye every ~76 years. Last seen 1986, returns 2061.' },
  { key:'encke', name:'Comet Encke', designation:'2P/Encke', a:2.22, e:0.848, period:3.30,
    epoch:'2023-10-22', sceneA:55, omega: 160, color:0xffd9a0,
    desc:'The shortest known orbital period of any comet at 3.3 years — observed on more returns than any other.' },
  { key:'67p', name:'67P/Churyumov–Gerasimenko', designation:'67P', a:3.46, e:0.641, period:6.44,
    epoch:'2021-11-02', sceneA:80, omega: 280, color:0xc7ffb0,
    desc:'Target of ESA\'s Rosetta mission (2014–2016) — the first spacecraft to orbit and land on a comet.' },
  { key:'neowise', name:'Comet NEOWISE', designation:'C/2020 F3', a:358, e:0.999, period:6800,
    epoch:'2020-07-03', sceneA:200, omega: 90, color:0xffb0d9,
    desc:'A long-period comet that dazzled naked-eye observers in 2020. Won\'t return for roughly 6,800 years.' },
];

// Solve Kepler's equation M = E - e·sin(E) for eccentric anomaly E via Newton-Raphson.
function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 8; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

// Position (scene-space x,z + real heliocentric distance r in AU) for a comet right now.
function cometPositionNow(comet, now) {
  const epochMs = new Date(comet.epoch).getTime();
  const periodDays = comet.period * 365.25;
  const n = (2 * Math.PI) / periodDays; // mean motion, rad/day
  const daysSincePerihelion = (now.getTime() - epochMs) / 86400000;
  const M = (((daysSincePerihelion * n) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
  const E = solveKepler(M, comet.e);
  const nu = 2 * Math.atan2(Math.sqrt(1+comet.e) * Math.sin(E/2), Math.sqrt(1-comet.e) * Math.cos(E/2));
  const rAU = comet.a * (1 - comet.e * Math.cos(E));
  const rScene = comet.sceneA * (1 - comet.e * Math.cos(E));
  const angle = nu + (comet.omega * Math.PI/180);
  return { x: Math.cos(angle) * rScene, z: Math.sin(angle) * rScene, rAU };
}

// Next time the comet's heliocentric distance crosses Earth's orbit (~1 AU) —
// i.e. the next date it's at the same distance from the Sun as Earth.
function nextEarthOrbitCrossing(comet, now) {
  const q = comet.a * (1 - comet.e), Q = comet.a * (1 + comet.e);
  if (1 < q || 1 > Q) return null; // orbit never reaches 1 AU
  const periodDays = comet.period * 365.25;
  const n = (2 * Math.PI) / periodDays;
  const cosNu = Math.max(-1, Math.min(1, (comet.a * (1 - comet.e*comet.e) / 1 - 1) / comet.e));
  const nu0 = Math.acos(cosNu);
  const epochMs = new Date(comet.epoch).getTime();

  const datesForSign = (nu) => {
    const E = 2 * Math.atan2(Math.sqrt(1-comet.e) * Math.sin(nu/2), Math.sqrt(1+comet.e) * Math.cos(nu/2));
    const M = E - comet.e * Math.sin(E);
    const daysFromPerihelion = M / n;
    let t = epochMs + daysFromPerihelion * 86400000;
    // walk forward by whole periods until this lands after "now"
    const periodMs = periodDays * 86400000;
    while (t < now.getTime()) t += periodMs;
    return t;
  };

  const t1 = datesForSign(nu0);
  const t2 = datesForSign(-nu0);
  return new Date(Math.min(t1, t2));
}

let solarScene, solarCamera, solarRenderer, solarControls;
let planetMeshes = [], cometMeshes = [], moonMeshes = [], orbitGroup, simRunning = true, timeWarp = 40, solarInited = false;
let selectedBody = null, cameraFly = null, starMaterial = null;

// Real current planet positions from NASA JPL Horizons (scripts/pull-planet-positions.js).
// Used to start each planet at its actual real-world ecliptic angle "right now"
// instead of a random one, before the time-warped animation takes over.
let realPlanetPositions = null;
fetch('planet-positions.json?t=' + Date.now())
  .then(r => r.ok ? r.json() : null)
  .then(d => { realPlanetPositions = (d && d.positions) || {}; applyRealPlanetPositions(); })
  .catch(() => { realPlanetPositions = {}; });

function applyRealPlanetPositions() {
  if (!realPlanetPositions || !planetMeshes.length) return;
  planetMeshes.forEach(({ pivot, data }) => {
    const real = realPlanetPositions[data.key];
    if (pivot && real) pivot.rotation.y = -real.angleDeg * Math.PI / 180;
  });
}

function easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

function flyCameraTo(targetPos, viewDistance) {
  // Always fly to a fixed, predictable "3/4 above" viewing angle rather than reusing
  // whatever offset the camera happened to have from a previous selection — guarantees
  // every body is framed cleanly and consistently, with no dependence on drift/history.
  const dir = new THREE.Vector3(0.55, 0.62, 1).normalize().multiplyScalar(viewDistance);
  cameraFly = {
    fromCam: solarCamera.position.clone(), toCam: targetPos.clone().add(dir),
    fromTarget: solarControls.target.clone(), toTarget: targetPos.clone(),
    start: performance.now(), duration: 700,
  };
}

function highlightOrbit(selected) {
  [...planetMeshes, ...cometMeshes, ...moonMeshes].forEach(b => {
    if (!b.orbitLine) return;
    const isSelected = selected && b === selected;
    b.orbitLine.material.opacity = isSelected ? 0.95 : (selected ? b.baseOpacity * 0.25 : b.baseOpacity);
    b.orbitLine.material.color.set(isSelected ? 0x00F5D4 : b.baseColor);
  });
}

function selectBody(body) {
  selectedBody = body;
  highlightOrbit(body);
  const worldPos = new THREE.Vector3();
  body.mesh.getWorldPosition(worldPos);
  body.lastWorldPos = worldPos.clone(); // camera tracks the body frame-to-frame from here on, since planets/comets keep orbiting
  const d = body.data;
  const isComet = !!d.isComet || cometMeshes.includes(body);
  const isMoon = !!d.isMoon || moonMeshes.includes(body);
  const radius = d.radius || 4.2;
  flyCameraTo(worldPos, Math.max(radius * 9, isMoon ? 3 : 10));

  const panel = document.getElementById('bodyDetailPanel');
  panel.classList.add('open');
  document.getElementById('bd-name').textContent = body === planetMeshes[0] ? 'Sun' : d.name;
  document.getElementById('bd-type').textContent = body === planetMeshes[0] ? 'G-Type Star' : (d.type || (isComet ? `Comet (${d.designation})` : ''));

  const statsEl = document.getElementById('bd-stats');
  if (isComet) {
    const now = new Date();
    const pos = cometPositionNow(d, now);
    const crossing = nextEarthOrbitCrossing(d, now);
    document.getElementById('bd-desc').textContent = d.desc;
    statsEl.innerHTML = `
      <div class="body-detail-stat"><span>Distance from Sun</span><span>${pos.rAU.toFixed(2)} AU</span></div>
      <div class="body-detail-stat"><span>Orbital Period</span><span>${d.period.toLocaleString()} years</span></div>
      <div class="body-detail-stat"><span>Eccentricity</span><span>${d.e}</span></div>
      <div class="body-detail-stat"><span>Last Perihelion</span><span>${d.epoch}</span></div>
      <div class="body-detail-stat"><span>Next Earth-Orbit Crossing</span><span>${crossing ? crossing.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : 'Never (orbit too distant)'}</span></div>`;
  } else if (isMoon) {
    document.getElementById('bd-desc').textContent = d.desc;
    statsEl.innerHTML = `
      <div class="body-detail-stat"><span>Orbits</span><span>${d.parentPlanet}</span></div>
      <div class="body-detail-stat"><span>Orbital Period</span><span>${d.periodDays < 1 ? Math.round(d.periodDays*24)+' hours' : d.periodDays+' days'}</span></div>`;
  } else if (body === planetMeshes[0]) {
    document.getElementById('bd-desc').textContent = d.desc;
    statsEl.innerHTML = `<div class="body-detail-stat"><span>Diameter</span><span>1,391,000 km</span></div>
      <div class="body-detail-stat"><span>Orbiting Bodies</span><span>8 planets</span></div>`;
  } else {
    document.getElementById('bd-desc').textContent = d.desc;
    const moonCount = MOONS[d.key] ? MOONS[d.key].length : 0;
    statsEl.innerHTML = `
      <div class="body-detail-stat"><span>Orbital Period</span><span>${d.period} ${d.period===1?'Earth year':'Earth years'}</span></div>
      <div class="body-detail-stat"><span>Rotation Period</span><span>${Math.abs(d.spinDays) < 1 ? Math.round(Math.abs(d.spinDays)*24)+' hours' : Math.abs(d.spinDays)+' days'}${d.spinDays<0?' (retrograde)':''}</span></div>
      <div class="body-detail-stat"><span>Relative Orbit Radius</span><span>${d.orbit} units</span></div>
      ${moonCount ? `<div class="body-detail-stat"><span>Moons Shown</span><span>${moonCount}</span></div>` : ''}`;
  }

  document.querySelectorAll('.body-pill').forEach(el => el.classList.toggle('active', el.dataset.key === d.key));
}

function deselectBody() {
  selectedBody = null;
  highlightOrbit(null);
  document.getElementById('bodyDetailPanel').classList.remove('open');
  document.querySelectorAll('.body-pill').forEach(el => el.classList.remove('active'));
}

// WebGL caps THREE.Line width at 1px on most GPUs/browsers regardless of the
// `linewidth` material setting — that's why orbit rings looked invisible even
// at high opacity. A thin TubeGeometry along the same path renders with real,
// camera-distance-correct thickness instead, so it's actually visible.
function makeOrbitTube(points, color, opacity, tubeRadius = 0.07) {
  const curve = new THREE.CatmullRomCurve3(points, true);
  const geo = new THREE.TubeGeometry(curve, points.length, tubeRadius, 6, true);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Mesh(geo, mat);
}

function initSolarSystem() {
  const wrap = document.getElementById('solarCanvasWrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;

  solarScene = new THREE.Scene();
  solarCamera = new THREE.PerspectiveCamera(50, w/h, 0.1, 2000);
  solarCamera.position.set(0, 60, 130);

  solarRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  solarRenderer.setSize(w, h);
  solarRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  wrap.appendChild(solarRenderer.domElement);

  solarControls = new THREE.OrbitControls(solarCamera, solarRenderer.domElement);
  solarControls.enableDamping = true;
  solarControls.dampingFactor = 0.08;
  solarControls.minDistance = 10;
  solarControls.maxDistance = 400;

  solarScene.add(new THREE.AmbientLight(0x404060, 1.2));
  solarScene.add(new THREE.PointLight(0xffffff, 3, 0, 0.15));

  const starGeo = new THREE.BufferGeometry();
  const starCount = 2000, positions = new Float32Array(starCount*3), phases = new Float32Array(starCount), speeds = new Float32Array(starCount), sizes = new Float32Array(starCount);
  for (let i=0;i<starCount;i++) {
    const r = 600 + Math.random()*400;
    const theta = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1);
    positions[i*3] = r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    positions[i*3+2] = r*Math.cos(phi);
    phases[i] = Math.random()*Math.PI*2;
    speeds[i] = 0.5 + Math.random()*2.2;
    sizes[i] = 1.6 + Math.random()*2.6;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases,1));
  starGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds,1));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes,1));

  // Real per-star twinkle (not a single global pulse) via a tiny custom shader —
  // each star's brightness oscillates independently using its own phase/speed.
  starMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      attribute float aPhase; attribute float aSpeed; attribute float aSize;
      uniform float uTime;
      varying float vTwinkle;
      void main() {
        vTwinkle = 0.25 + 0.85 * (0.5 + 0.5 * sin(uTime * aSpeed + aPhase));
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * 2.6;
        gl_Position = projectionMatrix * mvPosition;
      }`,
    fragmentShader: `
      varying float vTwinkle;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(1.0, 1.0, 1.0, min(1.0, vTwinkle * core * 1.4));
      }`,
    transparent: true, depthWrite: false,
  });
  solarScene.add(new THREE.Points(starGeo, starMaterial));

  const sunTexture = makeSunTexture();
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(4.2, 48, 48), new THREE.MeshBasicMaterial({ map: sunTexture }));
  sunMesh.userData = { key:'sun', name:'Sun', type:'G-Type Star', desc:'Fuses hydrogen into helium, radiating the energy that powers the whole system.' };
  solarScene.add(sunMesh);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xFFD700, transparent: true, opacity: 0.55, depthWrite:false }));
  sunGlow.scale.set(26,26,1);
  solarScene.add(sunGlow);

  orbitGroup = new THREE.Group();
  solarScene.add(orbitGroup);
  planetMeshes = [{ mesh: sunMesh, pivot: null, data: sunMesh.userData }];
  moonMeshes = [];

  const textureLoader = new THREE.TextureLoader();

  PLANETS.forEach(p => {
    const orbitCurve = new THREE.EllipseCurve(0,0, p.orbit, p.orbit, 0, 2*Math.PI, false, 0);
    const pts = orbitCurve.getPoints(128).map(pt => new THREE.Vector3(pt.x,0,pt.y));
    const orbitLine = makeOrbitTube(pts, 0xa899ff, 0.65, 0.09);
    orbitGroup.add(orbitLine);

    const pivot = new THREE.Object3D();
    pivot.rotation.y = Math.random()*Math.PI*2;
    orbitGroup.add(pivot);

    // Real photographic textures (CC-licensed, NASA-derived imagery) instead of
    // flat color spheres. Falls back to the flat color if the texture fails to load.
    const planetMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness:0.85, metalness:0.02, emissive: p.color, emissiveIntensity:0.04 });
    if (p.texture) {
      textureLoader.load(p.texture, tex => { planetMat.map = tex; planetMat.color.set(0xffffff); planetMat.needsUpdate = true; },
        undefined, () => { planetMat.color.set(p.color); }); // texture failed to load — keep flat color
    } else {
      planetMat.color.set(p.color);
    }
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 32, 32), planetMat);
    mesh.position.x = p.orbit;
    mesh.userData = p;
    pivot.add(mesh);

    if (p.hasRing) {
      const ringTex = textureLoader.load(TEX + 'saturn_ring.png');
      const ring = new THREE.Mesh(new THREE.RingGeometry(p.radius*1.4, p.radius*2.4, 64),
        new THREE.MeshBasicMaterial({ map: ringTex, color:0xffffff, side:THREE.DoubleSide, transparent:true, opacity:0.85 }));
      ring.rotation.x = Math.PI/2 - 0.4;
      mesh.add(ring);
    }
    planetMeshes.push({ pivot, mesh, data:p, orbitLine, baseOpacity:0.65, baseColor:0xa899ff });

    // MOONS / SATELLITES — orbit the planet's position in the sun-orbit pivot,
    // independent of the planet's own spin so they don't get dragged by it.
    const moonList = MOONS[p.key];
    if (moonList) {
      const moonGroup = new THREE.Object3D();
      moonGroup.position.copy(mesh.position);
      pivot.add(moonGroup);
      moonList.forEach(m => {
        const moonOrbitPts = new THREE.EllipseCurve(0,0, m.orbit, m.orbit, 0, 2*Math.PI, false, 0)
          .getPoints(48).map(pt => new THREE.Vector3(pt.x,0,pt.y));
        const moonOrbitLine = makeOrbitTube(moonOrbitPts, 0x8888bb, 0.5, 0.025);
        moonGroup.add(moonOrbitLine);

        const moonPivot = new THREE.Object3D();
        moonPivot.rotation.y = Math.random()*Math.PI*2;
        moonGroup.add(moonPivot);

        const moonMat = new THREE.MeshStandardMaterial({ color: m.color, roughness:0.8, emissive:m.color, emissiveIntensity:0.06 });
        if (m.texture) textureLoader.load(m.texture, tex => { moonMat.map = tex; moonMat.color.set(0xffffff); moonMat.needsUpdate = true; });
        const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(m.radius, 16, 16), moonMat);
        const moonUserData = { key: `${p.key}-${m.key}`, name: m.name, type: `${m.type} of ${p.name}`, desc: m.desc, orbit: m.orbit, periodDays: m.periodDays, radius: m.radius, isMoon: true, parentPlanet: p.name };
        moonMesh.userData = moonUserData;

        // Moons render tiny (down to ~0.05 units) — a real-size hit target is nearly
        // impossible to hover/click. Wrap each in an invisible, much larger sphere used
        // only for raycasting, so selecting a moon is actually feasible at any zoom level.
        const moonHitMesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(m.radius * 4, 0.55), 8, 8),
          new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false }));
        moonHitMesh.userData = moonUserData;
        moonHitMesh.position.x = m.orbit;
        moonHitMesh.add(moonMesh);
        moonPivot.add(moonHitMesh);

        moonMeshes.push({ pivot: moonPivot, mesh: moonHitMesh, data: moonUserData, orbitLine: moonOrbitLine, baseOpacity:0.5, baseColor:0x8888bb, periodDays: m.periodDays });
      });
    }
  });

  // COMETS — true Keplerian ellipses (offset from focus), real-time position
  cometMeshes = [];
  COMETS.forEach(c => {
    const b = c.sceneA * Math.sqrt(1 - c.e*c.e);     // semi-minor axis
    const focusOffset = c.sceneA * c.e;               // Sun sits at the ellipse focus, not center
    const omegaRad = c.omega * Math.PI/180;
    const orbitCurve = new THREE.EllipseCurve(-focusOffset, 0, c.sceneA, b, 0, 2*Math.PI, false, 0);
    const pts = orbitCurve.getPoints(160).map(pt => {
      const x = pt.x*Math.cos(omegaRad) - pt.y*Math.sin(omegaRad);
      const z = pt.x*Math.sin(omegaRad) + pt.y*Math.cos(omegaRad);
      return new THREE.Vector3(x, 0, z);
    });
    const orbitLine = makeOrbitTube(pts, c.color, 0.6, 0.1);
    orbitGroup.add(orbitLine);

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ map: makeCometTexture(c.color), color: 0xffffff, roughness:0.95, emissive: c.color, emissiveIntensity:0.18 }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: c.color, transparent: true, opacity: 0.6, depthWrite:false }));
    glow.scale.set(6,6,1);
    mesh.add(glow);
    mesh.userData = { key: c.key, name: c.name, type: `Comet (${c.designation})`, isComet: true, comet: c };
    solarScene.add(mesh);
    cometMeshes.push({ mesh, data: c, orbitLine, baseOpacity:0.6, baseColor:c.color });
  });

  applyRealPlanetPositions(); // no-op if the fetch hasn't resolved yet — it'll self-apply when it does
  loadNeos();
  buildBodyPills();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredKey = null;
  solarRenderer.domElement.addEventListener('mousemove', (e) => {
    const rect = solarRenderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse, solarCamera);
    const hits = raycaster.intersectObjects([...planetMeshes.map(p=>p.mesh), ...cometMeshes.map(c=>c.mesh), ...moonMeshes.map(m=>m.mesh)]);
    if (hits.length) {
      const d = hits[0].object.userData;
      hoveredKey = d.key;
      document.querySelectorAll('.body-pill').forEach(el => el.classList.toggle('active', el.dataset.key===d.key));
      if (d.isComet) {
        const crossing = nextEarthOrbitCrossing(d.comet, new Date());
        const pos = cometPositionNow(d.comet, new Date());
        const crossingTxt = crossing
          ? `Next crosses Earth's orbit (~1 AU from Sun): ${crossing.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})} ${crossing.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}`
          : 'Orbit never reaches Earth\'s distance from the Sun.';
        showTooltip(e.clientX, e.clientY, d.name, d.type,
          `${d.comet.desc}\nCurrently ${pos.rAU.toFixed(2)} AU from the Sun.\n${crossingTxt}`);
      } else {
        showTooltip(e.clientX, e.clientY, d.name, d.type, d.desc);
      }
      solarRenderer.domElement.style.cursor = 'pointer';
    } else if (hoveredKey) {
      hoveredKey = null;
      document.querySelectorAll('.body-pill').forEach(el => el.classList.remove('active'));
      hideTooltip();
      solarRenderer.domElement.style.cursor = 'default';
    }
  });
  solarRenderer.domElement.addEventListener('mouseleave', hideTooltip);

  // CLICK — zoom in on the body, pin its detail panel open, highlight its orbit trail
  solarRenderer.domElement.addEventListener('click', (e) => {
    const rect = solarRenderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse, solarCamera);
    const allBodies = [...planetMeshes, ...cometMeshes, ...moonMeshes];
    const hits = raycaster.intersectObjects(allBodies.map(b=>b.mesh));
    if (hits.length) {
      const body = allBodies.find(b => b.mesh === hits[0].object);
      selectBody(body);
    } else {
      deselectBody();
    }
  });

  document.getElementById('bodyDetailClose').addEventListener('click', deselectBody);

  document.getElementById('simPause').addEventListener('click', () => {
    simRunning = !simRunning;
    document.getElementById('simPause').textContent = simRunning ? '⏸ Pause' : '▶ Resume';
  });
  document.getElementById('simSpeed').addEventListener('input', (e) => {
    timeWarp = +e.target.value;
    document.getElementById('simSpeedVal').textContent = timeWarp+'x';
  });

  animateSolar();
  window.addEventListener('resize', onSolarResize);
}

// Procedural "burning surface" texture for the Sun — layered turbulent blotches
// of red/orange/yellow/white, redrawn periodically to fake convective flicker.
function drawSunTextureFrame(ctx, size) {
  ctx.clearRect(0, 0, size, size);
  const base = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  base.addColorStop(0, '#fff7c2');
  base.addColorStop(0.4, '#ffcf3f');
  base.addColorStop(0.75, '#ff8c1a');
  base.addColorStop(1, '#d3450a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const blotchColors = ['rgba(255,255,210,0.5)', 'rgba(255,140,0,0.45)', 'rgba(200,40,0,0.35)', 'rgba(255,210,90,0.4)'];
  for (let i = 0; i < 55; i++) {
    const x = Math.random()*size, y = Math.random()*size;
    const r = 6 + Math.random()*26;
    const grad = ctx.createRadialGradient(x,y,0,x,y,r);
    const color = blotchColors[i % blotchColors.length];
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
}

function makeSunTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawSunTextureFrame(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // Re-roll the turbulence every ~250ms for a boiling/flickering surface.
  setInterval(() => { drawSunTextureFrame(ctx, size); texture.needsUpdate = true; }, 250);
  return texture;
}

// Procedural rocky/icy texture for comet nuclei — mottled craggy surface instead
// of a flat solid color, tinted toward each comet's accent color.
function makeCometTexture(hexColor) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = new THREE.Color(hexColor);
  const rgb = `${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)}`;
  ctx.fillStyle = `rgb(40,40,48)`;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const x = Math.random()*size, y = Math.random()*size, r = 2 + Math.random()*9;
    const grad = ctx.createRadialGradient(x,y,0,x,y,r);
    const lightness = Math.random() > 0.5 ? `rgba(${rgb},${0.25+Math.random()*0.3})` : `rgba(20,20,26,${0.3+Math.random()*0.3})`;
    grad.addColorStop(0, lightness);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function makeGlowTexture() {
  const c = document.createElement('canvas'); c.width=c.height=128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64,64,0,64,64,64);
  grad.addColorStop(0,'rgba(255,255,255,1)'); grad.addColorStop(0.3,'rgba(255,215,0,0.6)'); grad.addColorStop(1,'rgba(255,215,0,0)');
  g.fillStyle = grad; g.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
}

function buildBodyPills() {
  const sunPill = `<div class="body-pill" data-key="sun">☀ Sun</div>`;
  const list = PLANETS.map(p => `<div class="body-pill" data-key="${p.key}">${p.name}</div>`).join('');
  const cometList = COMETS.map(c => `<div class="body-pill comet-pill" data-key="${c.key}">☄ ${c.name}</div>`).join('');
  document.getElementById('bodyPills').innerHTML = sunPill + list + cometList;
  document.querySelectorAll('.body-pill').forEach(el => {
    el.addEventListener('click', () => {
      const body = [...planetMeshes, ...cometMeshes].find(b => (b.data.key || 'sun') === el.dataset.key);
      if (body) selectBody(body);
    });
  });
}

// ── NEAR-EARTH OBJECTS (real data, NASA NeoWs via scripts/pull-neows.js) ───
let neosLoaded = false;
async function loadNeos() {
  if (neosLoaded) return;
  neosLoaded = true;
  const listEl = document.getElementById('neoList');
  const countEl = document.getElementById('neoCount');
  try {
    const res = await fetch('neows.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const objects = data.objects || [];
    countEl.textContent = `(${objects.length})`;
    if (!objects.length) { listEl.innerHTML = '<div class="neo-empty">No data — run scripts/pull-neows.js</div>'; return; }
    listEl.innerHTML = objects.map((o, i) => `
      <div class="neo-item ${o.hazardous ? 'hazardous' : ''}" data-idx="${i}">
        <div class="neo-item-name">${o.hazardous ? '⚠ ' : '☄ '}${o.name}</div>
        <div class="neo-item-meta">${o.closeApproachDate} · ${o.missDistanceLunar} LD${o.hazardous ? ' · <span class="haz-tag">HAZARDOUS</span>' : ''}</div>
      </div>`).join('');
    document.querySelectorAll('.neo-item').forEach(el => {
      el.addEventListener('click', () => showNeoDetail(objects[+el.dataset.idx]));
    });
  } catch (e) {
    listEl.innerHTML = `<div class="neo-empty">⚠ Failed to load: ${e.message}</div>`;
  }
}

function showNeoDetail(o) {
  selectedBody = null; // not a renderable 3D body — just informational
  highlightOrbit(null);
  const panel = document.getElementById('bodyDetailPanel');
  panel.classList.add('open');
  document.getElementById('bd-name').textContent = o.name;
  document.getElementById('bd-type').textContent = o.hazardous ? 'Near-Earth Asteroid — Potentially Hazardous' : 'Near-Earth Asteroid';
  document.getElementById('bd-desc').textContent = `Real close-approach data from NASA's NeoWs catalog. Closest approach: ${o.closeApproachDate} UTC.`;
  document.getElementById('bd-stats').innerHTML = `
    <div class="body-detail-stat"><span>Close Approach</span><span>${o.closeApproachDate}</span></div>
    <div class="body-detail-stat"><span>Miss Distance</span><span>${o.missDistanceLunar} lunar distances</span></div>
    <div class="body-detail-stat"><span>Miss Distance (km)</span><span>${o.missDistanceKm.toLocaleString()} km</span></div>
    <div class="body-detail-stat"><span>Relative Velocity</span><span>${o.velocityKmS} km/s</span></div>
    <div class="body-detail-stat"><span>Estimated Diameter</span><span>${o.diameterMinM}–${o.diameterMaxM} m</span></div>
    <div class="body-detail-stat"><span>Hazardous</span><span>${o.hazardous ? 'Yes' : 'No'}</span></div>`;
}

const TWO_PI = Math.PI * 2;
function wrapAngle(obj) { obj.rotation.y = obj.rotation.y % TWO_PI; } // keeps trig precision stable over long sessions

// Comets start at their REAL current position (true "right now"), then advance on
// a time-warped virtual clock like everything else — true real-time motion is far
// too slow to ever see move on screen (Encke alone takes 3.3 years per orbit).
let cometVirtualMs = Date.now();
let lastCometFrameMs = null;

function animateSolar() {
  requestAnimationFrame(animateSolar);
  if (starMaterial) starMaterial.uniforms.uTime.value = performance.now() / 1000;
  if (simRunning) {
    planetMeshes.forEach(({pivot, data}) => { if (pivot) { pivot.rotation.y += (0.02/(data.period||1)) * (timeWarp/40); wrapAngle(pivot); } });
    // Self-rotation (spin) now uses each planet's REAL relative day length, so Mercury/Venus
    // visibly crawl, Earth/Mars spin at a comparable clip, the gas giants whip around fast,
    // and Venus/Uranus spin backwards (retrograde) — instead of one flat rate for everyone.
    planetMeshes.forEach(({mesh, data}) => {
      if (!data.spinDays) { if (data.key === 'sun') { mesh.rotation.y += 0.0025; wrapAngle(mesh); } return; } // sun rolls slowly for the burning-surface effect
      const spinSpeed = (0.045 / Math.abs(data.spinDays)) * Math.sign(data.spinDays) * (timeWarp/40);
      mesh.rotation.y += spinSpeed;
      wrapAngle(mesh);
    });
    moonMeshes.forEach(({ pivot, periodDays }) => { pivot.rotation.y += (0.6/periodDays) * (timeWarp/40); wrapAngle(pivot); });
  }

  const realNowMs = performance.timeOrigin + performance.now();
  if (lastCometFrameMs === null) lastCometFrameMs = realNowMs;
  if (simRunning) cometVirtualMs += (realNowMs - lastCometFrameMs) * timeWarp;
  lastCometFrameMs = realNowMs;
  const cometNow = new Date(cometVirtualMs);
  cometMeshes.forEach(({ mesh, data }) => {
    const pos = cometPositionNow(data, cometNow);
    mesh.position.set(pos.x, 0, pos.z);
    if (simRunning) { mesh.rotation.y += 0.012; mesh.rotation.x += 0.006; }
  });

  if (cameraFly) {
    const t = Math.min(1, (performance.now() - cameraFly.start) / cameraFly.duration);
    const eased = easeInOutCubic(t);
    solarCamera.position.lerpVectors(cameraFly.fromCam, cameraFly.toCam, eased);
    solarControls.target.lerpVectors(cameraFly.fromTarget, cameraFly.toTarget, eased);
    if (t >= 1) { cameraFly = null; if (selectedBody) selectedBody.mesh.getWorldPosition(selectedBody.lastWorldPos); }
  } else if (selectedBody) {
    // Selected body keeps orbiting — translate camera + target by its frame-to-frame
    // delta so the lock-on follows smoothly without snapping the view.
    const liveWorldPos = new THREE.Vector3();
    selectedBody.mesh.getWorldPosition(liveWorldPos);
    const delta = liveWorldPos.clone().sub(selectedBody.lastWorldPos);
    if (delta.lengthSq() > 0) {
      solarCamera.position.add(delta);
      solarControls.target.add(delta);
    }
    selectedBody.lastWorldPos.copy(liveWorldPos);
  }

  solarControls.update();
  solarRenderer.render(solarScene, solarCamera);
}

function onSolarResize() {
  if (!solarRenderer) return;
  const wrap = document.getElementById('solarCanvasWrap');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  solarCamera.aspect = w/h; solarCamera.updateProjectionMatrix();
  solarRenderer.setSize(w,h);
}

// ══════════════════════════════════════════════════════════════════════════
// CONSTELLATIONS (Canvas 2D, hover tooltip)
// ══════════════════════════════════════════════════════════════════════════
const CONSTELLATIONS = [
  { key:'orion', name:'Orion', type:'Hunter · Equatorial', season:'Nov – Feb',
    desc:'Marked by the unmistakable three-star Belt, Orion is a gateway to deep-sky targets like the Orion Nebula.',
    stars:[[300,80,1.5],[260,140,2.2],[340,150,2.0],[230,230,1.2],[280,260,1.0],[320,260,1.0],[360,230,1.2],[260,320,1.5],[300,380,1.8],[340,320,1.5]],
    lines:[[0,2],[0,1],[1,3],[2,6],[3,4],[4,5],[5,6],[4,8],[5,8],[3,7],[6,9],[7,8],[8,9]] },
  { key:'ursa-major', name:'Ursa Major', type:'Great Bear · Northern', season:'Mar – Jun',
    desc:'Home to the Big Dipper asterism, used for millennia by navigators to find Polaris and true north.',
    stars:[[100,200,1.6],[160,180,1.4],[220,190,1.6],[280,170,1.4],[300,230,1.4],[260,280,1.6],[200,300,1.4]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]] },
  { key:'ursa-minor', name:'Ursa Minor', type:'Little Bear · Northern', season:'Year-round (N)',
    desc:'Its tail star, Polaris, sits almost exactly above the celestial north pole.',
    stars:[[300,80,1.8],[290,150,1.2],[280,210,1.2],[260,260,1.4],[220,250,1.2],[200,200,1.2],[230,160,1.2]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,2]] },
  { key:'cassiopeia', name:'Cassiopeia', type:'Queen · Northern', season:'Sep – Jan',
    desc:'Five bright stars forming a distinctive "W" shape, sitting opposite the Big Dipper across Polaris.',
    stars:[[150,250,1.5],[220,180,1.6],[290,230,1.8],[360,170,1.5],[420,220,1.4]],
    lines:[[0,1],[1,2],[2,3],[3,4]] },
  { key:'scorpius', name:'Scorpius', type:'Scorpion · Southern', season:'Jun – Aug',
    desc:'A sprawling curved line of stars with red supergiant Antares glowing as its fiery heart.',
    stars:[[300,80,1.6],[280,140,1.3],[260,200,1.3],[290,250,1.8],[330,290,1.3],[370,330,1.3],[400,370,1.3],[430,400,1.0],[440,360,1.0]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[6,8]] },
  { key:'leo', name:'Leo', type:'Lion · Northern', season:'Feb – May',
    desc:'A sickle-shaped head leads to a bright triangular hindquarters — genuinely resembles its namesake.',
    stars:[[180,150,1.6],[230,120,1.3],[280,140,1.3],[320,190,1.4],[400,180,1.8],[440,230,1.3],[400,280,1.3],[330,260,1.0]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,3]] },
  { key:'cygnus', name:'Cygnus', type:'Swan · Northern', season:'Jun – Sep',
    desc:'Flies along the Milky Way; its main stars form the Northern Cross asterism, anchored by Deneb.',
    stars:[[300,90,1.8],[300,170,1.3],[300,260,1.2],[300,350,1.4],[210,180,1.3],[390,180,1.3]],
    lines:[[0,1],[1,2],[2,3],[1,4],[1,5]] },
  { key:'lyra', name:'Lyra', type:'Lyre · Northern', season:'Jun – Sep',
    desc:'Small but unmistakable, anchored by Vega — a corner of the Summer Triangle.',
    stars:[[260,100,1.9],[230,170,1.1],[300,180,1.1],[290,250,1.2],[240,250,1.2]],
    lines:[[0,1],[0,2],[1,4],[2,3],[3,4]] },
  { key:'crux', name:'Crux', type:'Southern Cross · Southern', season:'Apr – Jun (S)',
    desc:'The smallest constellation, appearing on the flags of Australia, Brazil, New Zealand and Papua New Guinea.',
    stars:[[300,90,1.7],[300,300,1.4],[200,200,1.3],[400,210,1.0]],
    lines:[[0,1],[2,3]] },
  { key:'sagittarius', name:'Sagittarius', type:'Archer · Southern', season:'Jun – Sep',
    desc:'A teapot-shaped asterism pointing toward the dense star clouds at the centre of the Milky Way.',
    stars:[[200,150,1.4],[270,140,1.3],[330,170,1.5],[340,230,1.3],[290,260,1.3],[230,250,1.3],[180,210,1.3]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,5]] },
];

let constCtx, constSelected = null, constInited = false, constBgStars = [], hoveredStarIdx = null;

function initConstellations() {
  const canvasEl = document.getElementById('constCanvas');
  constCtx = canvasEl.getContext('2d');
  onConstResize();
  buildConstPills();
  selectConstellation(CONSTELLATIONS[0].key);

  canvasEl.addEventListener('mousemove', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const c = CONSTELLATIONS.find(c=>c.key===constSelected);
    if (!c) return;
    const hit = hitTestStar(c, mx, my);
    if (hit !== null) {
      hoveredStarIdx = hit;
      showTooltip(e.clientX, e.clientY, c.name, c.type, c.desc + `  (${c.season})`);
      canvasEl.style.cursor = 'pointer';
    } else if (hoveredStarIdx !== null) {
      hoveredStarIdx = null;
      hideTooltip();
      canvasEl.style.cursor = 'default';
    }
  });
  canvasEl.addEventListener('mouseleave', () => { hoveredStarIdx = null; hideTooltip(); });

  window.addEventListener('resize', onConstResize);
  animateConstBackground();
}

function buildConstPills() {
  document.getElementById('constPills').innerHTML = CONSTELLATIONS.map(c =>
    `<div class="const-pill" data-key="${c.key}">${c.name}</div>`).join('');
  document.querySelectorAll('.const-pill').forEach(el => {
    el.addEventListener('mouseenter', () => selectConstellation(el.dataset.key));
    el.addEventListener('click', () => selectConstellation(el.dataset.key));
  });
}

function selectConstellation(key) {
  constSelected = key;
  document.querySelectorAll('.const-pill').forEach(el => el.classList.toggle('active', el.dataset.key===key));
  const c = CONSTELLATIONS.find(c=>c.key===key);
  if (c) drawConstellation(c);
}

function onConstResize() {
  const wrap = document.getElementById('constCanvasWrap');
  const canvasEl = document.getElementById('constCanvas');
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  canvasEl.width = w; canvasEl.height = h;
  if (constBgStars.length === 0) {
    constBgStars = Array.from({length:140}, () => ({ x:Math.random()*w, y:Math.random()*h, r:Math.random()*0.8+0.3, o:Math.random()*0.5+0.1 }));
  }
  const c = CONSTELLATIONS.find(c=>c.key===constSelected);
  if (c) drawConstellation(c);
}

function getScaledPoints(c, w, h) {
  const baseW = 600, baseH = 450;
  const scale = Math.min(w/baseW, h/baseH) * 0.85;
  const offX = (w - baseW*scale)/2, offY = (h - baseH*scale)/2;
  return c.stars.map(([x,y,m]) => [x*scale+offX, y*scale+offY, m]);
}

function hitTestStar(c, mx, my) {
  const canvasEl = document.getElementById('constCanvas');
  const pts = getScaledPoints(c, canvasEl.width, canvasEl.height);
  for (let i=0;i<pts.length;i++) {
    const [x,y,m] = pts[i];
    const r = (m||1)*3.2*4 + 6;
    if (Math.hypot(mx-x, my-y) <= r) return i;
  }
  return null;
}

function animateConstBackground() {
  requestAnimationFrame(animateConstBackground);
  if (!constCtx || !document.getElementById('view-home').classList.contains('active')) return;
  const c = CONSTELLATIONS.find(c=>c.key===constSelected);
  if (c) drawConstellation(c);
}

function drawConstellation(c) {
  const canvasEl = document.getElementById('constCanvas');
  const w = canvasEl.width, h = canvasEl.height;
  constCtx.clearRect(0,0,w,h);

  constBgStars.forEach(s => {
    constCtx.beginPath(); constCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    constCtx.fillStyle = `rgba(232,232,255,${s.o*0.5})`; constCtx.fill();
  });

  const pts = getScaledPoints(c, w, h);

  constCtx.strokeStyle = 'rgba(155,79,222,0.7)';
  constCtx.lineWidth = 1.3;
  c.lines.forEach(([a,b]) => {
    const [x1,y1] = pts[a]; const [x2,y2] = pts[b];
    constCtx.beginPath(); constCtx.moveTo(x1,y1); constCtx.lineTo(x2,y2); constCtx.stroke();
  });

  pts.forEach(([x,y,m], i) => {
    const r = (m||1)*3.2;
    const isHover = i === hoveredStarIdx;
    const grad = constCtx.createRadialGradient(x,y,0,x,y,r*4);
    grad.addColorStop(0, isHover ? 'rgba(0,245,212,1)' : 'rgba(255,255,255,0.9)');
    grad.addColorStop(1,'rgba(0,245,212,0)');
    constCtx.fillStyle = grad; constCtx.beginPath(); constCtx.arc(x,y,r*4,0,Math.PI*2); constCtx.fill();
    constCtx.fillStyle = '#E8E8FF'; constCtx.beginPath(); constCtx.arc(x,y,r,0,Math.PI*2); constCtx.fill();
  });

  constCtx.font = '11px "Space Mono", monospace';
  constCtx.fillStyle = 'rgba(155,79,222,0.9)';
  constCtx.textAlign = 'center';
  const baseW = 600, baseH = 450;
  const scale = Math.min(w/baseW, h/baseH) * 0.85;
  const offY = (h - baseH*scale)/2;
  constCtx.fillText(c.name.toUpperCase(), w/2, offY + baseH*scale + 24);
}

// ══════════════════════════════════════════════════════════════════════════
// GALAXY (Canvas 2D — Milky Way spiral, hover regions)
// ══════════════════════════════════════════════════════════════════════════
const GALAXY_REGIONS = [
  { key:'core', name:'Galactic Core', type:'Sagittarius A* · Supermassive Black Hole', rNorm:0.04, labelAngle:-2.35,
    desc:'A 4-million-solar-mass black hole anchors the center of the Milky Way, ~26,000 light-years from Earth.' },
  { key:'bar', name:'Central Bar', type:'Stellar Bar', rNorm:0.16, labelAngle:-1.75,
    desc:'A dense bar of older stars stretches across the galactic center, funneling gas inward and shaping the spiral arms.' },
  { key:'orion-arm', name:'Orion Arm', type:'Minor Spiral Arm — You Are Here', rNorm:0.42, labelAngle:-1.15,
    desc:'A minor spiral arm (also called the Local Arm) between the larger Sagittarius and Perseus arms — home to the Sun and Earth.' },
  { key:'perseus-arm', name:'Perseus Arm', type:'Major Spiral Arm', rNorm:0.62, labelAngle:-0.55,
    desc:'One of the Milky Way\'s prominent spiral arms, rich in young star-forming regions and nebulae.' },
  { key:'halo', name:'Galactic Halo', type:'Globular Cluster Halo', rNorm:0.92, labelAngle:0.05,
    desc:'A sparse, roughly spherical region of old stars and globular clusters surrounding the entire galactic disk.' },
];

let galaxyCtx, galaxyParticles = [], galaxyHoverKey = null, galaxyRotation = 0;

function initGalaxy() {
  const canvasEl = document.getElementById('galaxyCanvas');
  galaxyCtx = canvasEl.getContext('2d');
  onGalaxyResize();

  const NUM_ARMS = 4, PARTICLES_PER_ARM = 700;
  galaxyParticles = [];
  for (let arm = 0; arm < NUM_ARMS; arm++) {
    const armOffset = (arm / NUM_ARMS) * Math.PI * 2;
    for (let i = 0; i < PARTICLES_PER_ARM; i++) {
      const t = i / PARTICLES_PER_ARM;
      const rNorm = 0.03 + t * 0.95;
      const angle = armOffset + t * Math.PI * 2.6 + (Math.random()-0.5) * 0.45;
      const jitter = (Math.random()-0.5) * 0.06 * (1 - t * 0.5);
      galaxyParticles.push({
        rNorm: rNorm + jitter,
        angle,
        size: Math.random() * 1.6 + 0.3,
        hue: rNorm < 0.15 ? '255,215,0' : rNorm < 0.5 ? '232,232,255' : '155,200,255',
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  canvasEl.addEventListener('mousemove', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const cx = canvasEl.width/2, cy = canvasEl.height/2;
    const maxR = Math.min(canvasEl.width, canvasEl.height) * 0.46;
    const dist = Math.hypot(mx-cx, my-cy) / maxR;
    let hit = null;
    for (const region of GALAXY_REGIONS) {
      if (Math.abs(dist - region.rNorm) < 0.045) { hit = region; break; }
    }
    if (hit) {
      galaxyHoverKey = hit.key;
      showTooltip(e.clientX, e.clientY, hit.name, hit.type, hit.desc);
      canvasEl.style.cursor = 'pointer';
    } else if (galaxyHoverKey) {
      galaxyHoverKey = null; hideTooltip(); canvasEl.style.cursor = 'default';
    }
  });
  canvasEl.addEventListener('mouseleave', () => { galaxyHoverKey = null; hideTooltip(); });

  window.addEventListener('resize', onGalaxyResize);
  animateGalaxy();
}

function onGalaxyResize() {
  const wrap = document.getElementById('galaxyCanvasWrap');
  const canvasEl = document.getElementById('galaxyCanvas');
  if (!wrap || !canvasEl) return;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  canvasEl.width = w; canvasEl.height = h;
}

function animateGalaxy() {
  requestAnimationFrame(animateGalaxy);
  if (!galaxyCtx || !document.getElementById('view-home').classList.contains('active')) return;
  const canvasEl = document.getElementById('galaxyCanvas');
  const w = canvasEl.width, h = canvasEl.height;
  if (!w || !h) return;
  galaxyCtx.clearRect(0,0,w,h);
  galaxyRotation += 0.0006;

  const cx = w/2, cy = h/2;
  const maxR = Math.min(w,h) * 0.46;
  const t = Date.now()/1000;

  galaxyParticles.forEach(p => {
    const a = p.angle + galaxyRotation;
    const r = p.rNorm * maxR;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.42; // flatten into a disk perspective
    const tw = 0.5 + 0.5 * Math.sin(t*0.6 + p.twinkle);
    galaxyCtx.beginPath();
    galaxyCtx.arc(x, y, p.size, 0, Math.PI*2);
    galaxyCtx.fillStyle = `rgba(${p.hue},${0.3 + tw*0.5})`;
    galaxyCtx.fill();
  });

  // core glow
  const coreGlow = galaxyCtx.createRadialGradient(cx,cy,0,cx,cy, maxR*0.18);
  coreGlow.addColorStop(0, 'rgba(255,235,180,0.9)');
  coreGlow.addColorStop(1, 'rgba(255,215,0,0)');
  galaxyCtx.fillStyle = coreGlow;
  galaxyCtx.beginPath(); galaxyCtx.arc(cx,cy,maxR*0.18,0,Math.PI*2); galaxyCtx.fill();

  // region guide rings + fanned-out labels (each at its own angle + min radius so they never stack)
  const minLabelR = maxR * 0.58;
  GALAXY_REGIONS.forEach(region => {
    const r = region.rNorm * maxR;
    const isHover = region.key === galaxyHoverKey;
    galaxyCtx.beginPath();
    galaxyCtx.ellipse(cx, cy, r, r*0.42, 0, 0, Math.PI*2);
    galaxyCtx.strokeStyle = isHover ? 'rgba(0,245,212,0.9)' : 'rgba(180,140,255,0.45)';
    galaxyCtx.lineWidth = isHover ? 2.5 : 1.5;
    galaxyCtx.stroke();

    // ring-edge point this label refers to, vs. the label's own (fanned-out) position
    const ringX = cx + Math.cos(region.labelAngle) * r, ringY = cy + Math.sin(region.labelAngle) * r * 0.42;
    const labelR = Math.max(r, minLabelR);
    let lx = cx + Math.cos(region.labelAngle) * labelR, ly = cy + Math.sin(region.labelAngle) * labelR * 0.42;

    // thin connector from ring to its label when they're pushed apart
    if (labelR > r + 4) {
      galaxyCtx.beginPath();
      galaxyCtx.moveTo(ringX, ringY); galaxyCtx.lineTo(lx, ly);
      galaxyCtx.strokeStyle = isHover ? 'rgba(0,245,212,0.5)' : 'rgba(180,140,255,0.3)';
      galaxyCtx.lineWidth = 1;
      galaxyCtx.stroke();
    }

    const label = region.name.toUpperCase();
    galaxyCtx.font = isHover ? 'bold 13px "Space Mono", monospace' : 'bold 12px "Space Mono", monospace';
    const metrics = galaxyCtx.measureText(label);
    lx = Math.min(Math.max(lx, 10), w - metrics.width - 10); // keep pill on-canvas (text is left-aligned from lx)
    galaxyCtx.fillStyle = isHover ? 'rgba(0,245,212,0.22)' : 'rgba(10,10,26,0.78)';
    galaxyCtx.fillRect(lx - 6, ly - 12, metrics.width + 12, 18);
    galaxyCtx.fillStyle = isHover ? '#00F5D4' : '#E8E8FF';
    galaxyCtx.textAlign = 'left';
    galaxyCtx.fillText(label, lx, ly + 2);

    if (region.key === 'orion-arm') {
      const a = -galaxyRotation * 0.3;
      const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r * 0.42;
      galaxyCtx.beginPath(); galaxyCtx.arc(sx, sy, 4.5, 0, Math.PI*2);
      galaxyCtx.fillStyle = '#00F5D4'; galaxyCtx.shadowColor = '#00F5D4'; galaxyCtx.shadowBlur = 16;
      galaxyCtx.fill(); galaxyCtx.shadowBlur = 0;
      const sunLabel = '☉ YOU ARE HERE';
      galaxyCtx.font = 'bold 10px "Space Mono", monospace';
      const sunMetrics = galaxyCtx.measureText(sunLabel);
      galaxyCtx.fillStyle = 'rgba(10,10,26,0.78)';
      galaxyCtx.fillRect(sx - sunMetrics.width/2 - 5, sy - 26, sunMetrics.width + 10, 16);
      galaxyCtx.fillStyle = '#00F5D4';
      galaxyCtx.textAlign = 'center';
      galaxyCtx.fillText(sunLabel, sx, sy - 14);
    }
  });

  galaxyCtx.font = 'bold 12px "Space Mono", monospace';
  galaxyCtx.fillStyle = '#E8E8FF';
  galaxyCtx.textAlign = 'center';
  const caption = 'MILKY WAY — ~100,000 LY DIAMETER · ~100–400 BILLION STARS';
  const capW = galaxyCtx.measureText(caption).width;
  galaxyCtx.fillStyle = 'rgba(10,10,26,0.8)';
  galaxyCtx.fillRect(cx - capW/2 - 10, cy + maxR*0.42 + 16, capW + 20, 22);
  galaxyCtx.fillStyle = '#E8E8FF';
  galaxyCtx.fillText(caption, cx, cy + maxR*0.42 + 31);
}

// ══════════════════════════════════════════════════════════════════════════
// UNIVERSE (Canvas 2D — cosmic scale rings, hover regions)
// ══════════════════════════════════════════════════════════════════════════
const COSMIC_SCALES = [
  { key:'solar-system', name:'Solar System', type:'~1 light-day across', rNorm:0.12,
    desc:'The Sun and its eight planets — vanishingly small at this scale, but home.' },
  { key:'local-bubble', name:'Local Bubble', type:'~1,000 light-years across', rNorm:0.28,
    desc:'A low-density cavity in the interstellar medium, carved by ancient supernovae, that the Sun currently drifts through.' },
  { key:'milky-way', name:'Milky Way Galaxy', type:'~100,000 light-years across', rNorm:0.46,
    desc:'Our home galaxy — one of an estimated 2 trillion galaxies in the observable universe.' },
  { key:'local-group', name:'Local Group', type:'~10 million light-years across', rNorm:0.64,
    desc:'A gravitationally bound group of ~80 galaxies including the Milky Way, Andromeda, and Triangulum.' },
  { key:'virgo-supercluster', name:'Virgo Supercluster', type:'~110 million light-years across', rNorm:0.82,
    desc:'A vast supercluster of galaxy groups, including the Local Group, all loosely bound by gravity.' },
  { key:'observable-universe', name:'Observable Universe', type:'~93 billion light-years across', rNorm:0.98,
    desc:'The full extent of space we can observe from Earth, containing an estimated 2 trillion galaxies.' },
];

let universeCtx, universeHoverKey = null, universeStars = [];

function initUniverse() {
  const canvasEl = document.getElementById('universeCanvas');
  universeCtx = canvasEl.getContext('2d');
  onUniverseResize();

  canvasEl.addEventListener('mousemove', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const cx = canvasEl.width/2, cy = canvasEl.height/2;
    const maxR = Math.min(canvasEl.width, canvasEl.height) * 0.46;
    const dist = Math.hypot(mx-cx, my-cy) / maxR;
    let hit = null;
    for (const scale of COSMIC_SCALES) {
      if (Math.abs(dist - scale.rNorm) < 0.035) { hit = scale; break; }
    }
    if (hit) {
      universeHoverKey = hit.key;
      showTooltip(e.clientX, e.clientY, hit.name, hit.type, hit.desc);
      canvasEl.style.cursor = 'pointer';
    } else if (universeHoverKey) {
      universeHoverKey = null; hideTooltip(); canvasEl.style.cursor = 'default';
    }
  });
  canvasEl.addEventListener('mouseleave', () => { universeHoverKey = null; hideTooltip(); });

  window.addEventListener('resize', onUniverseResize);
  animateUniverse();
}

function onUniverseResize() {
  const wrap = document.getElementById('universeCanvasWrap');
  const canvasEl = document.getElementById('universeCanvas');
  if (!wrap || !canvasEl) return;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) return;
  canvasEl.width = w; canvasEl.height = h;
  if (universeStars.length === 0) {
    universeStars = Array.from({length:300}, () => ({
      x: Math.random()*w, y: Math.random()*h, r: Math.random()*1+0.3, o: Math.random()*0.6+0.1,
    }));
  }
}

function animateUniverse() {
  requestAnimationFrame(animateUniverse);
  if (!universeCtx || !document.getElementById('view-home').classList.contains('active')) return;
  const canvasEl = document.getElementById('universeCanvas');
  const w = canvasEl.width, h = canvasEl.height;
  if (!w || !h) return;
  universeCtx.clearRect(0,0,w,h);

  universeStars.forEach(s => {
    universeCtx.beginPath(); universeCtx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    universeCtx.fillStyle = `rgba(232,232,255,${s.o*0.5})`; universeCtx.fill();
  });

  const cx = w/2, cy = h/2;
  const maxR = Math.min(w,h) * 0.46;
  const t = Date.now()/1000;

  COSMIC_SCALES.forEach((scale, i) => {
    const r = scale.rNorm * maxR;
    const isHover = scale.key === universeHoverKey;
    const pulse = isHover ? 0.85 + 0.15*Math.sin(t*4) : 1;
    universeCtx.beginPath();
    universeCtx.arc(cx, cy, r * pulse, 0, Math.PI*2);
    universeCtx.strokeStyle = isHover ? 'rgba(0,245,212,0.95)' : `rgba(180,140,255,${0.35 + i*0.08})`;
    universeCtx.lineWidth = isHover ? 2.5 : 1.5;
    universeCtx.stroke();

    // label with a backing pill so it's legible against stars/rings behind it
    let lx = cx + r*Math.cos(-0.7), ly = cy + r*Math.sin(-0.7);
    const label = scale.name.toUpperCase();
    universeCtx.font = isHover ? 'bold 13px "Space Mono", monospace' : 'bold 12px "Space Mono", monospace';
    const metrics = universeCtx.measureText(label);
    lx = Math.min(lx, w - metrics.width - 24); // keep the pill on-canvas
    universeCtx.fillStyle = isHover ? 'rgba(0,245,212,0.22)' : 'rgba(10,10,26,0.78)';
    universeCtx.fillRect(lx, ly - 13, metrics.width + 14, 20);
    universeCtx.fillStyle = isHover ? '#00F5D4' : '#E8E8FF';
    universeCtx.textAlign = 'left';
    universeCtx.fillText(label, lx + 7, ly + 2);
  });

  // bright center point — "you are here"
  const glow = universeCtx.createRadialGradient(cx,cy,0,cx,cy,10);
  glow.addColorStop(0, 'rgba(255,255,255,1)'); glow.addColorStop(1, 'rgba(0,245,212,0)');
  universeCtx.fillStyle = glow;
  universeCtx.beginPath(); universeCtx.arc(cx,cy,10,0,Math.PI*2); universeCtx.fill();
}

// ══════════════════════════════════════════════════════════════════════════
// DAILY BRIEFING (Astronomy / NASA / Space / Rockets / Bikes headlines)
// ══════════════════════════════════════════════════════════════════════════
function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.round(diffMs / 3600000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs/24)}d ago`;
}

// ══════════════════════════════════════════════════════════════════════════
// BACKGROUND MUSIC (official YouTube IFrame Player API). Browsers block
// autoplay WITH SOUND before any user interaction — no website can override
// that, it's enforced by the browser itself. The closest legitimate approach:
// autoplay MUTED the instant the page loads (browsers do allow this), so the
// track is already playing silently — one click on the button just unmutes
// it instantly, instead of starting playback from scratch after a click.
let ytPlayer = null, ytReady = false, ytMuted = true, ytLoadFailed = false;
const YT_VIDEO_ID = 'yJg-Y5byMMw'; // "Mortals" — Warriyo ft. Laura Brehm [NCS Release] (verified via ncs.io/mortals, the official catalog page)

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('ytPlayerHost', {
    height: '180', width: '320',
    videoId: YT_VIDEO_ID,
    playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: YT_VIDEO_ID, playsinline: 1 },
    events: {
      onReady: (e) => {
        ytReady = true;
        e.target.playVideo();
        document.getElementById('musicToggle').textContent = '🔇 Unmute Music';
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) ytPlayer.playVideo(); // manual loop
      },
      onError: () => {
        ytLoadFailed = true;
        document.getElementById('musicToggle').textContent = '⚠ Music unavailable';
      },
    },
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

// If the IFrame API script itself fails to load/init (network block, ad-blocker,
// etc.) within a few seconds, stop showing a perpetual "Loading…" with no way out.
setTimeout(() => {
  if (!ytReady && !ytLoadFailed) {
    document.getElementById('musicToggle').textContent = '⚠ Music unavailable';
  }
}, 8000);

document.getElementById('musicToggle').addEventListener('click', () => {
  const btn = document.getElementById('musicToggle');
  if (ytLoadFailed) return;
  if (!ytReady) { btn.textContent = '⏳ Loading…'; return; }
  if (ytMuted) {
    ytPlayer.unMute();
    ytMuted = false;
    btn.textContent = '🔊 Playing';
    btn.classList.add('playing');
  } else {
    ytPlayer.mute();
    ytMuted = true;
    btn.textContent = '🔇 Unmute Music';
    btn.classList.remove('playing');
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ROTATING CINEMATIC BACKGROUND (real NASA APOD photos, Dashboard/Briefing)
// ══════════════════════════════════════════════════════════════════════════
const NASA_APOD_KEY = 'DEMO_KEY'; // public NASA demo key — fine for this low-volume use
let apodImages = [];
let apodIndex = 0;
let apodLoaded = false;
let apodRotateTimer = null;
let apodShowingA = true;

async function loadApodImages() {
  if (apodLoaded) return;
  apodLoaded = true;
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_APOD_KEY}&count=8`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const items = await res.json();
    apodImages = items
      .filter(it => it.media_type === 'image' && it.url)
      .map(it => it.hdurl || it.url);
    if (apodImages.length) {
      document.getElementById('bgPhotoA').style.backgroundImage = `url('${apodImages[0]}')`;
      apodIndex = 1;
      startApodRotation();
    }
  } catch (e) {
    console.error('NASA APOD background failed to load:', e.message);
  }
}

function startApodRotation() {
  if (apodRotateTimer || apodImages.length < 2) return;
  apodRotateTimer = setInterval(() => {
    const nextUrl = apodImages[apodIndex % apodImages.length];
    apodIndex++;
    const incoming = document.getElementById(apodShowingA ? 'bgPhotoB' : 'bgPhotoA');
    const outgoing = document.getElementById(apodShowingA ? 'bgPhotoA' : 'bgPhotoB');
    incoming.style.backgroundImage = `url('${nextUrl}')`;
    incoming.classList.add('show');
    outgoing.classList.remove('show');
    apodShowingA = !apodShowingA;
  }, 15000);
}
