import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import './Constellations.css';

// Spectral tints for marquee stars — everything else defaults to soft blue-white.
const WHITE = 0xf2f0ff;
const CONSTELLATIONS = [
  { key:'orion', name:'Orion', type:'Hunter · Equatorial', season:'Nov – Feb',
    desc:'Marked by the unmistakable three-star Belt, Orion is a gateway to deep-sky targets like the Orion Nebula (M42).',
    // 0 Meissa(head) 1 Betelgeuse(L shoulder) 2 Bellatrix(R shoulder)
    // 3 Mintaka 4 Alnilam 5 Alnitak (Belt) 6 Saiph(L foot) 7 Rigel(R foot)
    stars:[[300,75,1.0],[212,150,2.5,0xffb27a,'Betelgeuse'],[388,138,1.9,0xcfe0ff,'Bellatrix'],
           [345,250,1.6],[300,258,1.9,0xcfe0ff,'Alnilam'],[258,266,1.7],
           [238,378,1.8,0xb9ccff,'Saiph'],[372,384,2.6,0xa8c0ff,'Rigel']],
    lines:[[0,1],[0,2],[1,2],[1,5],[2,3],[3,4],[4,5],[5,6],[3,7]] },
  { key:'ursa-major', name:'Ursa Major', type:'Great Bear · Northern', season:'Mar – Jun',
    desc:'Home to the Big Dipper asterism, used for millennia by navigators to find Polaris and true north.',
    // Bowl: Dubhe, Merak, Phecda, Megrez · Handle: Alioth, Mizar, Alkaid
    stars:[[178,175,1.9,0xffd9a8,'Dubhe'],[178,240,1.7],[258,250,1.5],[250,190,1.2],
           [318,198,1.7],[374,214,1.6,0xdfe8ff,'Mizar'],[430,236,1.8]],
    lines:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]] },
  { key:'ursa-minor', name:'Ursa Minor', type:'Little Bear · Northern', season:'Year-round (N)',
    desc:'Its tail star, Polaris — the North Star — sits almost exactly above the celestial north pole.',
    stars:[[300,80,1.9,0xfff4d8,'Polaris'],[292,150,1.1],[282,212,1.1],[262,262,1.3],[220,252,1.1],[200,200,1.1],[232,158,1.1]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,2]] },
  { key:'cassiopeia', name:'Cassiopeia', type:'Queen · Northern', season:'Sep – Jan',
    desc:'Five bright stars forming a distinctive "W" shape, sitting opposite the Big Dipper across Polaris.',
    stars:[[140,240,1.5],[215,175,1.7],[295,225,1.9,0xdfe8ff,'Schedar'],[370,165,1.6],[440,215,1.4]],
    lines:[[0,1],[1,2],[2,3],[3,4]] },
  { key:'scorpius', name:'Scorpius', type:'Scorpion · Southern', season:'Jun – Aug',
    desc:'A sprawling curved line of stars with red supergiant Antares glowing as its fiery heart.',
    stars:[[300,80,1.5],[280,140,1.3],[262,200,1.3],[292,252,2.2,0xff6b52,'Antares'],[332,292,1.3],[372,332,1.3],[402,372,1.3],[432,402,1.1],[442,362,1.1]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[6,8]] },
  { key:'leo', name:'Leo', type:'Lion · Northern', season:'Feb – May',
    desc:'A sickle-shaped head leads to a bright triangular hindquarters — genuinely resembles its namesake.',
    stars:[[180,150,1.5],[230,120,1.3],[282,140,1.3],[320,192,2.0,0xdfe8ff,'Regulus'],[402,180,1.6],[442,230,1.3],[402,280,1.3],[332,260,1.1]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,3]] },
  { key:'cygnus', name:'Cygnus', type:'Swan · Northern', season:'Jun – Sep',
    desc:'Flies along the Milky Way; its main stars form the Northern Cross asterism, anchored by Deneb.',
    stars:[[300,88,2.0,0xeaf0ff,'Deneb'],[300,172,1.3],[300,262,1.2],[300,352,1.4,0xdfe8ff,'Albireo'],[206,180,1.3],[394,180,1.3]],
    lines:[[0,1],[1,2],[2,3],[1,4],[1,5]] },
  { key:'lyra', name:'Lyra', type:'Lyre · Northern', season:'Jun – Sep',
    desc:'Small but unmistakable, anchored by brilliant Vega — a corner of the Summer Triangle.',
    stars:[[262,100,2.2,0xbcd0ff,'Vega'],[230,172,1.1],[302,182,1.1],[290,252,1.2],[240,252,1.2]],
    lines:[[0,1],[0,2],[1,4],[2,3],[3,4]] },
  { key:'crux', name:'Crux', type:'Southern Cross · Southern', season:'Apr – Jun (S)',
    desc:'The smallest constellation, appearing on the flags of Australia, Brazil, New Zealand and Papua New Guinea.',
    stars:[[300,88,1.8,0xdfe8ff,'Acrux'],[300,302,1.5],[198,200,1.3],[402,212,1.1,0xff9a6b,'Gacrux']],
    lines:[[0,1],[2,3]] },
  { key:'sagittarius', name:'Sagittarius', type:'Archer · Southern', season:'Jun – Sep',
    desc:'A teapot-shaped asterism pointing toward the dense star clouds at the centre of the Milky Way.',
    stars:[[200,150,1.4],[270,140,1.3],[330,170,1.5],[340,230,1.3],[290,262,1.3],[230,252,1.3],[180,210,1.3]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[1,5]] },
];

// ── Cached additive sprite textures ───────────────────────────────────────────
const _tex = {};
function makeTex(key, draw, size = 128) {
  if (_tex[key]) return _tex[key];
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  return (_tex[key] = new THREE.CanvasTexture(c));
}
// Soft round halo
const glowTex = () => makeTex('glow', (ctx, s) => {
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.42, 'rgba(255,255,255,0.28)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.05)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
// Tight bright core
const coreTex = () => makeTex('core', (ctx, s) => {
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.9)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
}, 64);
// 4-point diffraction spike (for the brightest stars)
const spikeTex = () => makeTex('spike', (ctx, s) => {
  ctx.clearRect(0, 0, s, s);
  ctx.filter = 'blur(0.6px)';
  const mid = s / 2;
  const bar = (horiz) => {
    const g = horiz ? ctx.createLinearGradient(0, mid, s, mid) : ctx.createLinearGradient(mid, 0, mid, s);
    g.addColorStop(0,   'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    if (horiz) ctx.fillRect(0, mid - 1, s, 2);
    else       ctx.fillRect(mid - 1, 0, 2, s);
  };
  bar(true); bar(false);
});
// Big faint backdrop nebula
const nebulaTex = () => makeTex('neb', (ctx, s) => {
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0,   'rgba(120,90,220,0.5)');
  g.addColorStop(0.5, 'rgba(70,50,150,0.14)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
}, 256);

// Convert 2D pixel coords → centred 3D scene coords
function starsTo3D(stars) {
  const BASE_W = 600, BASE_H = 450, SCALE = 16;
  return stars.map(([x, y, m, color, name]) => ({
    pos: new THREE.Vector3(
      ((x - BASE_W / 2) / BASE_W) * SCALE,
      (-(y - BASE_H / 2) / BASE_H) * SCALE,
      (m - 1.5) * 0.5,
    ),
    magnitude: m || 1,
    color: color ?? WHITE,
    name: name || null,
  }));
}

// ── One star: colored halo + white-hot core + diffraction spikes + twinkle ────
function Star({ star, index, hovered, onOver, onOut }) {
  const coreRef = useRef();
  const glowRef = useRef();
  const spikeRef = useRef();
  const isHot = star.magnitude >= 1.8;
  const glowColor = useMemo(() => new THREE.Color(hovered ? 0x00F5D4 : star.color), [hovered, star.color]);

  const glowS = 0.7 + star.magnitude * 0.62;
  const coreS = 0.22 + star.magnitude * 0.16;
  const spikeS = 1.3 + star.magnitude * 0.9;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const tw = 0.82 + Math.sin(t * 2.1 + index * 1.7) * 0.18; // per-star twinkle
    const hb = hovered ? 1.55 : 1;
    if (coreRef.current)  coreRef.current.scale.setScalar(coreS * tw * hb);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(glowS * (0.94 + tw * 0.1) * hb);
      glowRef.current.material.opacity = (hovered ? 0.9 : 0.6) * tw;
    }
    if (spikeRef.current) {
      spikeRef.current.scale.setScalar(spikeS * (0.9 + tw * 0.14) * hb);
      spikeRef.current.material.rotation = t * 0.05 + index;
    }
  });

  return (
    <group position={star.pos.toArray()}>
      {/* invisible generous hit target */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onOver(index); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); onOut(); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[Math.max(0.5, glowS * 0.5), 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isHot && (
        <sprite ref={spikeRef}>
          <spriteMaterial map={spikeTex()} color={glowColor} transparent opacity={hovered ? 0.55 : 0.4}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      )}
      <sprite ref={glowRef}>
        <spriteMaterial map={glowTex()} color={glowColor} transparent opacity={0.6}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <sprite ref={coreRef}>
        <spriteMaterial map={coreTex()} color={0xfffaf2} transparent opacity={0.95}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  );
}

// ── Glowing constellation line (wide soft pass + crisp pass) ──────────────────
function ConLine({ a, b }) {
  const pts = useMemo(() => [a.toArray(), b.toArray()], [a, b]);
  return (
    <>
      <Line points={pts} color={0x7b5cff} lineWidth={5}   transparent opacity={0.10} />
      <Line points={pts} color={0xbcaaff} lineWidth={1.4} transparent opacity={0.55} />
    </>
  );
}

function ConstellationMesh({ constellation }) {
  const groupRef = useRef();
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const stars3d = useMemo(() => starsTo3D(constellation.stars), [constellation]);

  // Gentle sway (not a full spin) so the figure stays readable but feels alive
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.22) * 0.26;
    groupRef.current.rotation.x = Math.sin(t * 0.16) * 0.05;
  });

  const hs = hoveredIdx != null ? stars3d[hoveredIdx] : null;

  return (
    <group ref={groupRef}>
      {constellation.lines.map(([a, b], i) => (
        <ConLine key={i} a={stars3d[a].pos} b={stars3d[b].pos} />
      ))}
      {stars3d.map((s, i) => (
        <Star key={i} star={s} index={i} hovered={hoveredIdx === i}
          onOver={setHoveredIdx} onOut={() => setHoveredIdx(null)} />
      ))}
      {hs && (
        <group position={hs.pos.toArray()}>
          <Html center distanceFactor={22} style={{ pointerEvents: 'none' }}>
            <div className="const-tooltip">
              <div className="const-tooltip-name">{hs.name || constellation.name}</div>
              <div className="const-tooltip-meta">
                {hs.name ? `${constellation.name} · ${constellation.season}` : `${constellation.type} · ${constellation.season}`}
              </div>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

function ConstContent({ selected }) {
  const c = CONSTELLATIONS.find((c) => c.key === selected) || CONSTELLATIONS[0];
  return (
    <>
      <color attach="background" args={['#04040c']} />
      <fog attach="fog" args={['#04040c', 22, 46]} />
      {/* soft nebula backdrop */}
      <sprite position={[0, 0, -6]} scale={[34, 34, 1]}>
        <spriteMaterial map={nebulaTex()} transparent opacity={0.28}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <Stars radius={120} depth={60} count={2600} factor={2.4} saturation={0} fade speed={0.4} />
      <ConstellationMesh constellation={c} />
    </>
  );
}

export function ConstellationsSection() {
  const [ref, inView] = useInView({ rootMargin: '120% 0px 120% 0px' });
  const [selected, setSelected] = useState('orion');
  const current = CONSTELLATIONS.find((c) => c.key === selected) || CONSTELLATIONS[0];

  return (
    <section className="const-section" ref={ref} aria-label="Constellation atlas">
      <div className="const-header">
        <div className="const-eyebrow">◈ Constellation Atlas</div>
        <h2 className="const-title">Star Patterns</h2>
        <p className="const-sub">{current.type} · Best viewed: {current.season}</p>
      </div>

      <div className="const-stage">
        {inView && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              className="const-canvas-wrap"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              <Canvas
                camera={{ position: [0, 0, 17], fov: 60 }}
                gl={{ antialias: true, powerPreference: 'default' }}
              >
                <ConstContent selected={selected} />
              </Canvas>
            </motion.div>
          </AnimatePresence>
        )}
        {!inView && <div className="const-placeholder">Loading atlas…</div>}

        <div className="const-desc-overlay">
          <AnimatePresence mode="wait">
            <motion.p
              key={selected}
              className="const-desc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {current.desc}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="const-pills">
        {CONSTELLATIONS.map((c) => (
          <button
            key={c.key}
            className={`const-pill${selected === c.key ? ' active' : ''}`}
            onClick={() => setSelected(c.key)}
            onMouseEnter={() => setSelected(c.key)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </section>
  );
}
