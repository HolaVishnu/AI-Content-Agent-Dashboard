// ── ASTRONAUT ILLUSTRATION (original SVG, swap with a real <img> if desired) ──
const ASTRONAUT_SVG = `
<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="35%" cy="25%" r="75%">
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
  </defs>
  <rect width="240" height="240" fill="url(#bg)"/>
  <circle cx="70" cy="40" r="1.4" fill="#fff" opacity="0.8"/>
  <circle cx="190" cy="60" r="1" fill="#fff" opacity="0.6"/>
  <circle cx="205" cy="170" r="1.6" fill="#fff" opacity="0.7"/>
  <circle cx="40" cy="190" r="1" fill="#fff" opacity="0.5"/>
  <circle cx="160" cy="25" r="1.2" fill="#fff" opacity="0.6"/>
  <!-- backpack -->
  <rect x="92" y="120" width="56" height="70" rx="14" fill="#3a3a5e"/>
  <!-- body -->
  <ellipse cx="120" cy="165" rx="46" ry="55" fill="url(#suit)"/>
  <ellipse cx="120" cy="165" rx="46" ry="55" fill="none" stroke="#6a6ab0" stroke-width="2" opacity="0.5"/>
  <!-- chest panel -->
  <rect x="100" y="145" width="40" height="26" rx="5" fill="#1b1b38"/>
  <circle cx="110" cy="158" r="3" fill="#00F5D4"/>
  <circle cx="120" cy="158" r="3" fill="#FFD700"/>
  <circle cx="130" cy="158" r="3" fill="#FF4466"/>
  <rect x="106" y="163" width="28" height="4" rx="2" fill="#444470"/>
  <!-- arms -->
  <ellipse cx="68" cy="160" rx="16" ry="34" fill="url(#suit)" transform="rotate(-18 68 160)"/>
  <ellipse cx="172" cy="160" rx="16" ry="34" fill="url(#suit)" transform="rotate(18 172 160)"/>
  <circle cx="58" cy="195" r="13" fill="#cfcfe8"/>
  <circle cx="182" cy="195" r="13" fill="#cfcfe8"/>
  <!-- helmet -->
  <circle cx="120" cy="92" r="54" fill="url(#suit)"/>
  <circle cx="120" cy="92" r="54" fill="none" stroke="#6a6ab0" stroke-width="2" opacity="0.5"/>
  <circle cx="120" cy="94" r="40" fill="url(#visor)"/>
  <ellipse cx="105" cy="78" rx="14" ry="8" fill="#ffffff" opacity="0.35"/>
  <!-- reflection of a tiny planet in visor -->
  <circle cx="138" cy="106" r="7" fill="#FFD700" opacity="0.8"/>
  <circle cx="138" cy="106" r="10" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.4"/>
  <!-- antenna -->
  <circle cx="160" cy="46" r="4" fill="#FF4466"/>
  <line x1="160" y1="46" x2="150" y2="62" stroke="#9b9bd0" stroke-width="3" stroke-linecap="round"/>
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
    if (tab.dataset.view === 'home') setTimeout(onSolarResize, 50), setTimeout(onConstResize, 50);
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
const sections = [document.getElementById('sec-hero'), document.getElementById('sec-solar'), document.getElementById('sec-const')];
document.querySelectorAll('.scroll-dot').forEach(dot => {
  dot.addEventListener('click', () => sections[+dot.dataset.section].scrollIntoView({ behavior: 'smooth' }));
});
const dotObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = sections.indexOf(entry.target);
      document.querySelectorAll('.scroll-dot').forEach((d,i) => d.classList.toggle('active', i===idx));
      if (idx === 1 && !solarInited) { solarInited = true; initSolarSystem(); }
      if (idx === 2 && !constInited) { constInited = true; initConstellations(); }
    }
  });
}, { root: homeView, threshold: 0.5 });
sections.forEach(s => dotObserver.observe(s));

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
const PLANETS = [
  { key:'mercury', name:'Mercury', type:'Terrestrial Planet', color:0x9c9c9c, radius:0.38, orbit:14, period:0.24,
    desc:'The smallest, fastest planet — a scorched, cratered world baked by the closest orbit to the Sun.' },
  { key:'venus', name:'Venus', type:'Terrestrial Planet', color:0xe8c27a, radius:0.6, orbit:19, period:0.62,
    desc:'Earth\'s twin in size, but a runaway greenhouse hell under crushing CO₂ skies.' },
  { key:'earth', name:'Earth', type:'Terrestrial Planet', color:0x4d96ff, radius:0.64, orbit:25, period:1,
    desc:'Home. The only known world with liquid oceans, breathable air, and life.' },
  { key:'mars', name:'Mars', type:'Terrestrial Planet', color:0xd1542e, radius:0.5, orbit:32, period:1.88,
    desc:'The Red Planet — iron oxide dust, polar ice, and the tallest volcano in the solar system.' },
  { key:'jupiter', name:'Jupiter', type:'Gas Giant', color:0xd9a06b, radius:2.2, orbit:48, period:11.86,
    desc:'The largest planet — a churning hydrogen giant with a storm bigger than Earth.' },
  { key:'saturn', name:'Saturn', type:'Gas Giant', color:0xead6a8, radius:1.9, orbit:66, period:29.46, hasRing:true,
    desc:'Famed for its dazzling ice-and-rock ring system — low density enough to float in water.' },
  { key:'uranus', name:'Uranus', type:'Ice Giant', color:0x9fe3e3, radius:1.3, orbit:82, period:84.01,
    desc:'Tipped almost completely on its side, rolling around the Sun like a ball.' },
  { key:'neptune', name:'Neptune', type:'Ice Giant', color:0x4169e1, radius:1.25, orbit:96, period:164.8,
    desc:'The windiest world known — supersonic methane storms at the dark edge of the system.' },
];

let solarScene, solarCamera, solarRenderer, solarControls;
let planetMeshes = [], orbitGroup, simRunning = true, timeWarp = 40, solarInited = false;

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
  const starCount = 2000, positions = new Float32Array(starCount*3);
  for (let i=0;i<starCount;i++) {
    const r = 600 + Math.random()*400;
    const theta = Math.random()*Math.PI*2, phi = Math.acos(2*Math.random()-1);
    positions[i*3] = r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    positions[i*3+2] = r*Math.cos(phi);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  solarScene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color:0xE8E8FF, size:1.1, sizeAttenuation:false })));

  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(4.2, 48, 48), new THREE.MeshBasicMaterial({ color: 0xFFD700 }));
  sunMesh.userData = { key:'sun', name:'Sun', type:'G-Type Star', desc:'Fuses hydrogen into helium, radiating the energy that powers the whole system.' };
  solarScene.add(sunMesh);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlowTexture(), color: 0xFFD700, transparent: true, opacity: 0.55, depthWrite:false }));
  sunGlow.scale.set(26,26,1);
  solarScene.add(sunGlow);

  orbitGroup = new THREE.Group();
  solarScene.add(orbitGroup);
  planetMeshes = [{ mesh: sunMesh, pivot: null, data: sunMesh.userData }];

  PLANETS.forEach(p => {
    const orbitCurve = new THREE.EllipseCurve(0,0, p.orbit, p.orbit, 0, 2*Math.PI, false, 0);
    const pts = orbitCurve.getPoints(128).map(pt => new THREE.Vector3(pt.x,0,pt.y));
    orbitGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7B2FBE, transparent:true, opacity:0.25 })));

    const pivot = new THREE.Object3D();
    pivot.rotation.y = Math.random()*Math.PI*2;
    orbitGroup.add(pivot);

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.radius, 32, 32),
      new THREE.MeshStandardMaterial({ color: p.color, roughness:0.7, metalness:0.05, emissive: p.color, emissiveIntensity:0.08 }));
    mesh.position.x = p.orbit;
    mesh.userData = p;
    pivot.add(mesh);

    if (p.hasRing) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(p.radius*1.4, p.radius*2.4, 64),
        new THREE.MeshBasicMaterial({ color:0xC9B98A, side:THREE.DoubleSide, transparent:true, opacity:0.55 }));
      ring.rotation.x = Math.PI/2 - 0.4;
      mesh.add(ring);
    }
    planetMeshes.push({ pivot, mesh, data:p });
  });

  buildBodyPills();

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hoveredKey = null;
  solarRenderer.domElement.addEventListener('mousemove', (e) => {
    const rect = solarRenderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse, solarCamera);
    const hits = raycaster.intersectObjects(planetMeshes.map(p=>p.mesh));
    if (hits.length) {
      const d = hits[0].object.userData;
      hoveredKey = d.key;
      document.querySelectorAll('.body-pill').forEach(el => el.classList.toggle('active', el.dataset.key===d.key));
      showTooltip(e.clientX, e.clientY, d.name, d.type, d.desc);
      solarRenderer.domElement.style.cursor = 'pointer';
    } else if (hoveredKey) {
      hoveredKey = null;
      document.querySelectorAll('.body-pill').forEach(el => el.classList.remove('active'));
      hideTooltip();
      solarRenderer.domElement.style.cursor = 'default';
    }
  });
  solarRenderer.domElement.addEventListener('mouseleave', hideTooltip);

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
  document.getElementById('bodyPills').innerHTML = sunPill + list;
}

function animateSolar() {
  requestAnimationFrame(animateSolar);
  if (simRunning) {
    planetMeshes.forEach(({pivot, data}) => { if (pivot) pivot.rotation.y += (0.02/(data.period||1)) * (timeWarp/40); });
    planetMeshes.forEach(({mesh}) => { mesh.rotation.y += 0.01; });
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
