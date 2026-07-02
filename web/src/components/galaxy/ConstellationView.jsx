import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Default spectral color by magnitude (brightest → blue-white, dimmer → warm).
// Individual marquee stars can override this via a 4th value in their tuple.
const SPECTRAL_COLORS = [
  { maxMag: 1.4, color: 0xcfe0ff },
  { maxMag: 1.9, color: 0xf2f0ff },
  { maxMag: 2.5, color: 0xfff4d8 },
  { maxMag: 99,  color: 0xffe6bc },
];
function starColor(magnitude) {
  for (const s of SPECTRAL_COLORS) if (magnitude <= s.maxMag) return s.color;
  return 0xffe6bc;
}

const CONSTELLATIONS = [
  { key:'orion', name:'Orion', myth:'The Hunter', type:'Equatorial', season:'Nov – Feb',
    desc:'Marked by the unmistakable three-star Belt, Orion is a gateway to deep-sky targets like the Orion Nebula (M42).',
    starNames:['Meissa','Betelgeuse','Bellatrix','Mintaka','Alnilam','Alnitak','Saiph','Rigel'],
    // 0 head · 1-2 shoulders · 3-4-5 belt · 6-7 feet
    stars:[[300,75,1.2],[212,150,2.6,0xffb27a],[388,138,1.9,0xcfe0ff],
           [345,250,1.7],[300,258,2.0,0xdfe8ff],[258,266,1.8],
           [238,378,1.8,0xb9ccff],[372,384,2.7,0xa8c0ff]],
    lines:[[0,1],[0,2],[1,2],[1,5],[2,3],[3,4],[4,5],[5,6],[3,7]] },
  { key:'ursa-major', name:'Ursa Major', myth:'The Great Bear', type:'Northern', season:'Mar – Jun',
    desc:'Home to the Big Dipper asterism, used for millennia by navigators to find Polaris and true north.',
    starNames:['Dubhe','Merak','Phecda','Megrez','Alioth','Mizar','Alkaid'],
    stars:[[178,175,1.9,0xffd9a8],[178,240,1.7],[258,250,1.6],[250,190,1.3],[318,198,1.7],[374,214,1.6],[430,236,1.9]],
    lines:[[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]] },
  { key:'ursa-minor', name:'Ursa Minor', myth:'The Little Bear', type:'Northern', season:'Year-round',
    desc:'Its tail star, Polaris, sits almost exactly above the celestial north pole — the ultimate navigation star.',
    starNames:['Polaris','Kochab','Pherkad','','','',''],
    stars:[[300,80,1.9,0xfff4d8],[292,150,1.2],[282,212,1.2],[262,262,1.4],[220,252,1.2],[200,200,1.2],[232,160,1.2]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,2]] },
  { key:'cassiopeia', name:'Cassiopeia', myth:'The Queen', type:'Northern', season:'Sep – Jan',
    desc:'Five bright stars forming a distinctive "W" shape, sitting opposite the Big Dipper across Polaris.',
    starNames:['Schedar','Caph','Gamma Cas','Ruchbah','Segin'],
    stars:[[140,240,1.6],[215,175,1.7],[295,225,1.9],[370,165,1.6],[440,215,1.5]],
    lines:[[0,1],[1,2],[2,3],[3,4]] },
  { key:'scorpius', name:'Scorpius', myth:'The Scorpion', type:'Southern', season:'Jun – Aug',
    desc:'A sprawling curved line of stars with red supergiant Antares glowing as its fiery heart.',
    starNames:['Antares','','','Graffias','','','','',''],
    stars:[[300,80,2.3,0xff6b52],[280,140,1.3],[262,200,1.3],[292,252,1.7],[332,292,1.3],[372,332,1.3],[402,372,1.3],[432,402,1.1],[442,362,1.1]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[6,8]] },
  { key:'leo', name:'Leo', myth:'The Lion', type:'Northern', season:'Feb – May',
    desc:'A sickle-shaped head leads to a bright triangular hindquarters — genuinely resembles its namesake.',
    starNames:['Regulus','','Algieba','','Denebola','','',''],
    stars:[[180,150,2.0,0xcfe0ff],[230,120,1.3],[282,140,1.4],[320,192,1.4],[402,180,1.8],[442,230,1.3],[402,280,1.3],[332,260,1.1]],
    lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,3]] },
  { key:'cygnus', name:'Cygnus', myth:'The Swan', type:'Northern', season:'Jun – Sep',
    desc:'Flies along the Milky Way; its main stars form the Northern Cross asterism, anchored by Deneb.',
    starNames:['Deneb','Sadr','','Albireo','Gienah','Fawaris'],
    stars:[[300,88,2.1,0xeaf0ff],[300,172,1.4],[300,262,1.2],[300,352,1.4],[206,180,1.3],[394,180,1.3]],
    lines:[[0,1],[1,2],[2,3],[1,4],[1,5]] },
  { key:'lyra', name:'Lyra', myth:'The Lyre', type:'Northern', season:'Jun – Sep',
    desc:'Small but unmistakable, anchored by Vega — one of the brightest stars in the sky and a corner of the Summer Triangle.',
    starNames:['Vega','Sheliak','Sulafat','',''],
    stars:[[262,100,2.3,0xbcd0ff],[230,172,1.1],[302,182,1.1],[290,252,1.2],[240,252,1.2]],
    lines:[[0,1],[0,2],[1,4],[2,3],[3,4]] },
  { key:'crux', name:'Crux', myth:'The Southern Cross', type:'Southern', season:'Apr – Jun',
    desc:'The smallest constellation, appearing on the flags of Australia, Brazil, New Zealand and Papua New Guinea.',
    starNames:['Acrux','Mimosa','Gacrux','Delta Cru'],
    stars:[[300,90,1.9,0xdfe8ff],[300,300,1.5],[198,200,1.4,0xff9a6b],[402,212,1.1]],
    lines:[[0,1],[2,3]] },
  { key:'sagittarius', name:'Sagittarius', myth:'The Archer', type:'Southern', season:'Jun – Sep',
    desc:'A teapot-shaped asterism pointing toward the dense star clouds at the centre of the Milky Way.',
    starNames:['Nunki','','Kaus Australis','','Ascella','',''],
    stars:[[200,150,1.5],[270,140,1.3],[330,170,1.6],[340,230,1.3],[290,262,1.3],[230,252,1.3],[180,210,1.3]],
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
const glowTex = () => makeTex('glow', (ctx, s) => {
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.42, 'rgba(255,255,255,0.28)');
  g.addColorStop(0.75, 'rgba(255,255,255,0.05)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
});
const coreTex = () => makeTex('core', (ctx, s) => {
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.9)');
  g.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
}, 64);
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
const nebulaTex = () => makeTex('neb', (ctx, s) => {
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0,   'rgba(120,90,220,0.5)');
  g.addColorStop(0.5, 'rgba(70,50,150,0.14)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
}, 256);

function starsTo3D(stars) {
  const BASE_W = 600, BASE_H = 450, SCALE = 16;
  return stars.map(([x, y, m, color]) => ({
    pos: new THREE.Vector3(
      ((x - BASE_W / 2) / BASE_W) * SCALE,
      (-(y - BASE_H / 2) / BASE_H) * SCALE,
      (m - 1.5) * 0.5,
    ),
    magnitude: m || 1,
    color: color ?? starColor(m || 1),
  }));
}

// ── One star: colored halo + white-hot core + diffraction spikes + twinkle ────
function StarSprite({ star, index, name, isHovered, onHover, onLeave }) {
  const coreRef = useRef();
  const glowRef = useRef();
  const spikeRef = useRef();
  const isHot = star.magnitude >= 1.8;
  const glowColor = useMemo(() => new THREE.Color(isHovered ? 0x00F5D4 : star.color), [isHovered, star.color]);

  const glowS  = 0.7 + star.magnitude * 0.62;
  const coreS  = 0.22 + star.magnitude * 0.16;
  const spikeS = 1.3 + star.magnitude * 0.95;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const tw = 0.82 + Math.sin(t * 2.1 + index * 1.7) * 0.18;
    const hb = isHovered ? 1.55 : 1;
    if (coreRef.current) coreRef.current.scale.setScalar(coreS * tw * hb);
    if (glowRef.current) {
      glowRef.current.scale.setScalar(glowS * (0.94 + tw * 0.1) * hb);
      glowRef.current.material.opacity = (isHovered ? 0.95 : 0.6) * tw;
    }
    if (spikeRef.current) {
      spikeRef.current.scale.setScalar(spikeS * (0.9 + tw * 0.14) * hb);
      spikeRef.current.material.rotation = t * 0.04 + index;
    }
  });

  return (
    <group position={star.pos.toArray()}>
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onHover(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e)  => { e.stopPropagation(); onLeave(); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[Math.max(0.5, glowS * 0.5), 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isHot && (
        <sprite ref={spikeRef}>
          <spriteMaterial map={spikeTex()} color={glowColor} transparent opacity={isHovered ? 0.55 : 0.4}
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

      {isHovered && name && (
        <Html center distanceFactor={16} style={{ pointerEvents: 'none' }}>
          <div className="cv-star-label">{name}</div>
        </Html>
      )}
    </group>
  );
}

// ── Glowing constellation line (wide soft pass + crisp pass) ──────────────────
function ConLine({ a, b }) {
  const pts = useMemo(() => [a.toArray(), b.toArray()], [a, b]);
  return (
    <>
      <Line points={pts} color={0x7b5cff} lineWidth={5}   transparent opacity={0.12} />
      <Line points={pts} color={0xc2b2ff} lineWidth={1.4} transparent opacity={0.6} />
    </>
  );
}

function ConstellationMesh({ constellation }) {
  const groupRef = useRef();
  const [hovStar, setHovStar] = useState(null);
  const stars3d = useMemo(() => starsTo3D(constellation.stars), [constellation]);

  // Gentle sway keeps the figure recognisable while adding depth parallax
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.22) * 0.26;
    groupRef.current.rotation.x = Math.sin(t * 0.16) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {constellation.lines.map(([a, b], i) => (
        <ConLine key={i} a={stars3d[a].pos} b={stars3d[b].pos} />
      ))}
      {stars3d.map((s, i) => (
        <StarSprite
          key={i}
          star={s}
          index={i}
          name={constellation.starNames?.[i] || ''}
          isHovered={hovStar === i}
          onHover={() => setHovStar(i)}
          onLeave={() => setHovStar(null)}
        />
      ))}
    </group>
  );
}

function ConstScene({ constellation }) {
  return (
    <>
      <color attach="background" args={['#04040c']} />
      <sprite position={[0, 0, -6]} scale={[34, 34, 1]}>
        <spriteMaterial map={nebulaTex()} transparent opacity={0.26}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      <Stars radius={140} depth={70} count={3200} factor={2.6} saturation={0} fade speed={0.4} />
      <ConstellationMesh constellation={constellation} />
    </>
  );
}

export function ConstellationView() {
  const [selected, setSelected] = useState('orion');
  const current = CONSTELLATIONS.find((c) => c.key === selected) || CONSTELLATIONS[0];

  return (
    <div className="constellation-view">
      {/* Canvas — remounts on change for clean slate */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          className="const-canvas-inner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Canvas camera={{ position: [0, 0, 17], fov: 58 }}
            gl={{ antialias: true, powerPreference: 'default' }}>
            <ConstScene constellation={current} />
          </Canvas>
        </motion.div>
      </AnimatePresence>

      {/* Info overlay — bottom left */}
      <div className="cv-info-overlay">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="cv-myth-label">{current.myth}</div>
            <div className="cv-const-name">{current.name}</div>
            <div className="cv-const-type">{current.type} · {current.season}</div>
            <p className="cv-const-desc">{current.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Selector pills */}
      <div className="cv-pills">
        {CONSTELLATIONS.map((c) => (
          <button
            key={c.key}
            className={`cv-pill${selected === c.key ? ' active' : ''}`}
            onClick={() => setSelected(c.key)}
            onMouseEnter={() => setSelected(c.key)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
