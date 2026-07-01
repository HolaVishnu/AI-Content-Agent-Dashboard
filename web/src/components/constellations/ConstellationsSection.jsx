import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import './Constellations.css';

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

// Convert 2D pixel coords [x,y,magnitude] to 3D scene coords
// Base canvas was 600×450; normalize to [-8, 8] range
function starsTo3D(stars) {
  const BASE_W = 600, BASE_H = 450;
  const SCALE = 16;
  return stars.map(([x, y, m]) => ({
    pos: new THREE.Vector3(
      ((x - BASE_W / 2) / BASE_W) * SCALE,
      (-(y - BASE_H / 2) / BASE_H) * SCALE,
      (m - 1.5) * 0.4,  // slight depth by magnitude
    ),
    magnitude: m || 1,
  }));
}

function buildLinePositions(stars3d, lines) {
  const positions = [];
  lines.forEach(([a, b]) => {
    positions.push(...stars3d[a].pos.toArray(), ...stars3d[b].pos.toArray());
  });
  return new Float32Array(positions);
}

// Single constellation 3D scene
function ConstellationMesh({ constellation, active }) {
  const groupRef = useRef();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.012;
    }
  });

  const stars3d = useMemo(() => starsTo3D(constellation.stars), [constellation]);

  const linePositions = useMemo(
    () => buildLinePositions(stars3d, constellation.lines),
    [stars3d, constellation.lines],
  );

  const lineCount = constellation.lines.length * 2;

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} count={lineCount} />
        </bufferGeometry>
        <lineBasicMaterial color={active ? 0x9B4FDE : 0x4a2880} transparent opacity={active ? 0.75 : 0.3} />
      </lineSegments>

      {/* Stars */}
      {stars3d.map(({ pos, magnitude }, i) => (
        <group key={i} position={pos.toArray()}>
          <mesh
            onPointerOver={(e) => { e.stopPropagation(); setHoveredIdx(i); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHoveredIdx(null); document.body.style.cursor = 'default'; }}
          >
            <sphereGeometry args={[magnitude * 0.12 + (hoveredIdx === i ? 0.1 : 0), 10, 10]} />
            <meshBasicMaterial color={hoveredIdx === i ? 0x00F5D4 : (active ? 0xffffff : 0x8888bb)} />
          </mesh>

          {/* Glow */}
          <mesh>
            <sphereGeometry args={[magnitude * 0.22, 8, 8]} />
            <meshBasicMaterial color={active ? 0xccccff : 0x444466} transparent opacity={active ? 0.18 : 0.06} />
          </mesh>

          {hoveredIdx === i && (
            <Html center distanceFactor={24} style={{ pointerEvents: 'none' }}>
              <div className="const-tooltip">
                <div className="const-tooltip-name">{constellation.name}</div>
                <div className="const-tooltip-meta">{constellation.type} · {constellation.season}</div>
              </div>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}

function ConstContent({ selected }) {
  const c = CONSTELLATIONS.find((c) => c.key === selected) || CONSTELLATIONS[0];
  return (
    <>
      <color attach="background" args={['#030308']} />
      <ambientLight intensity={0.5} />
      <Stars radius={200} depth={60} count={3000} factor={2} saturation={0} />
      <ConstellationMesh constellation={c} active={true} />
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
              transition={{ duration: 0.3 }}
            >
              <Canvas
                camera={{ position: [0, 0, 18], fov: 60 }}
                gl={{ antialias: true, powerPreference: 'default' }}
              >
                <ConstContent selected={selected} />
              </Canvas>
            </motion.div>
          </AnimatePresence>
        )}
        {!inView && <div className="const-placeholder">Loading atlas…</div>}

        {/* Desc overlay */}
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

      {/* Constellation pills */}
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
