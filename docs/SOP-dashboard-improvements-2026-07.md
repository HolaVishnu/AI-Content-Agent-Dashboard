# SOP — Dashboard Improvements (July 2026)

**Scope:** VPSpaceman React app (`web/`). Fixes and redesigns to the NASA feed, the
Intelligence Agents, the NEOWISE comet, and the Constellation atlas.
**Date:** 2026-07-02
**Author:** Vishnu Priyan (@vpspaceman) with Claude Code

---

## 0. Summary of what changed

| # | Area | Change |
|---|------|--------|
| 1 | NASA Live Feed | New panels (APOD, Mars Rover, NASA Image Library) + module-level fetch cache to stop `DEMO_KEY` 429s; section moved below **ISS Command** on the Dashboard |
| 2 | Intelligence Agents | Moved from Dashboard → **Daily Briefing** (below APOD + Shoot Window) |
| 3 | UPLINK button | Rewired from paid Claude/agent-server to **free, client-side Instagram insights** |
| 4 | NEOWISE comet | Added `visualPeriod` so the long-period comet visibly orbits |
| 5 | Constellations | Full visual redesign + accurate Orion / Big Dipper geometry |

---

## 1. NASA Live Feed panels + rate-limit fix

**Files:** `web/src/components/dashboard/NasaApiPanels.jsx` (new),
`web/src/views/DashboardView.jsx`, `web/src/components/dashboard/Dashboard.css`

**Steps taken**
1. Built three panels: `ApodPanel`, `MarsRoverPanel` (curiosity/perseverance toggle),
   `NasaGalleryPanel` (NASA Image Library — no key needed).
2. Added a module-level `cachedFetch(url, ttl)` cache. React StrictMode double-invokes
   effects and route changes re-fetch; the cache prevents burning through the
   `DEMO_KEY` quota (≈30 req/hour).
3. Added `.nasa-grid` styles (3-column, responsive).
4. Positioned the **NASA Live Feed** section directly under **ISS Command**.

**Why:** APOD + Mars Rover were showing "unavailable" due to HTTP 429 rate limiting on
the shared `DEMO_KEY`. The cache stops repeat calls; the Image Library panel needs no key
and always works.

**Follow-up (recommended):** register a free key at <https://api.nasa.gov> (1,000 req/hr)
and set `VITE_NASA_API_KEY` in a `.env`, then change `const KEY = 'DEMO_KEY'` to
`import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'`.

---

## 2. Intelligence Agents moved to Daily Briefing

**Files:** `web/src/views/BriefingView.jsx`, `web/src/views/DashboardView.jsx`

**Steps taken**
1. Removed the Intelligence Agents section (and unused imports/builder) from
   `DashboardView`.
2. Rendered the 5-agent grid in `BriefingView`, placed **below** the APOD + Shoot Window
   command row and above the Signal Feeds.
3. Imported `Dashboard.css` into `BriefingView` so the `.agents-grid` / `.section-label`
   / `.agent-*` styles are available on that route (routes are code-split).

---

## 3. UPLINK button → free Instagram-only insights

**Files:** `web/src/utils/agentInsights.js` (new),
`web/src/components/dashboard/AgentCard.jsx`, `web/src/views/BriefingView.jsx`

**Background:** The `⚡ UPLINK AGENT` button used to call a local Node server
(`scripts/agent-server.js`) which called **Claude / Anthropic (paid)**. Instagram data
(free Graph API) only *fed* that call. The button failed because the server was offline
and needed an Anthropic key.

**Steps taken**
1. Wrote `agentInsights.js` — a pure client-side engine that computes **real** insights
   from `data.json` (the file the Instagram Graph API pull writes). Per agent it derives:
   top post, best-performing format, top hashtags, best posting day (by avg likes),
   engagement %, and most-commented post.
2. Rewired `AgentCard.uplink()` to re-fetch `data.json` (cache-busted) and recompute
   locally — **no backend, no AI, fully free**. Button relabelled
   `⚡ UPLINK AGENT` → `⚡ REFRESH INSIGHTS`; shows when the data was last pulled.
3. `BriefingView.buildAgents()` now uses `AGENT_META` + `deriveInsights(data)` so cards
   show real data on first load (deleted the old hardcoded placeholder text).

**To refresh with brand-new numbers:** run `node scripts/pull-real-posts.js` (free
Instagram Graph API, needs your token). It rewrites `data.json`; the button picks it up.

---

## 4. NEOWISE comet visible motion

**Files:** `web/src/components/galaxy/orbitalMath.js`,
`web/src/components/galaxy/starSystemsData.js`

**Problem:** NEOWISE's real `period: 300 yr` gave it a tiny mean motion — one orbit took
~40 min on screen, so it looked frozen. Other comets (Encke 3.3 yr, 67P 6.44 yr,
Halley 75 yr) visibly move.

**Steps taken**
1. `cometPositionNow()` now uses an optional `visualPeriod` for animation speed only,
   falling back to `period` when absent.
2. Added `visualPeriod: 12` to NEOWISE.

**Why this way:** only the on-screen speed changes. The orbit shape (`a`/`e`/`sceneA`/
`omega`) and the displayed `period` (still "300 yr", "returns in ~6,800 years") are
untouched — no data is faked, just the playback speed.

---

## 5. Constellation atlas redesign

**File:** `web/src/components/galaxy/ConstellationView.jsx`
(Note: `components/constellations/ConstellationsSection.jsx` is an **unused duplicate** —
the rendered file is `galaxy/ConstellationView.jsx`.)

**Steps taken**
1. **Fixed geometry:** rebuilt Orion into a correct figure (collinear 3-star belt,
   hourglass shoulders→belt→feet, Rigel + Betelgeuse brightest) and the Big Dipper into
   a proper bowl-and-handle.
2. **Redesigned star rendering:** each star is now 3 additive sprites — a white-hot crisp
   core, a spectrally-colored halo (Betelgeuse orange, Rigel blue, Antares red, Vega
   blue-white, Dubhe amber), and 4-point diffraction spikes on bright stars — plus a
   per-star twinkle.
3. **Glowing constellation lines** via drei `<Line>` (wide soft violet pass + crisp
   bright pass).
4. Added a soft nebula backdrop and changed continuous spin → gentle **sway** so the
   figure stays recognizable. Hovering a star shows its name.

---

## API reference — free vs paid, as of this task

| API | Free/Paid | Notes |
|-----|-----------|-------|
| NASA APOD, Mars Rover, NeoWs, DONKI | **Free** | `DEMO_KEY` = 30 req/hr; free registered key = 1,000 req/hr |
| NASA Image Library (`images-api.nasa.gov`) | **Free, no key** | No rate limit |
| Open-Meteo (shoot-window weather) | **Free, no key** | — |
| WhereTheISS.at (ISS tracker) | **Free, no key** | — |
| TheSpaceDevs (launches) | **Free tier** | Served from cached JSON |
| Instagram Graph API (post data) | **Free** | Needs access token; feeds `data.json` |
| Anthropic API (old UPLINK backend) | **Paid** | **No longer used** after change #3 |

---

## Verification performed

- No console errors on Dashboard or Briefing routes after each change.
- All 5 agent cards render real computed values; REFRESH button updates timestamp
  (`✓ REFRESHED · data from …`) with no server.
- NEOWISE motion validated: ~7 scene units / 3s of playback (was ~0.3 — frozen).
- Orion geometry validated: belt collinear; shoulders(176) > belt(87) < feet(134);
  brightest = Rigel, Betelgeuse.

## Notes / limitations

- Preview screenshots of WebGL-heavy scenes time out in the automation environment, and
  the galaxy section's lazy-mount IntersectionObserver doesn't trip under programmatic
  scroll — verify constellations manually in a real browser (Space Explorer →
  Constellations tab).
- For production, add a registered NASA key (see §1) to eliminate DEMO_KEY 429s entirely.
