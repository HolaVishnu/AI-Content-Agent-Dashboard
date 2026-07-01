import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

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

function starsTo3D(stars) {
  const BASE_W = 600, BASE_H = 450, SCALE = 16;
  return stars.map(([x, y, m]) => ({
    pos: new THREE.Vector3(
      ((x - BASE_W / 2) / BASE_W) * SCALE,
      (-(y - BASE_H / 2) / BASE_H) * SCALE,
      (m - 1.5) * 0.4,
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

function ConstellationMesh({ constellation }) {
  const groupRef = useRef();
  const [hov, setHov] = useState(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.010;
  });

  const stars3d = useMemo(() => starsTo3D(constellation.stars), [constellation]);
  const linePos = useMemo(() => buildLinePositions(stars3d, constellation.lines), [stars3d, constellation.lines]);

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} count={constellation.lines.length * 2} />
        </bufferGeometry>
        <lineBasicMaterial color={0x9B4FDE} transparent opacity={0.7} />
      </lineSegments>

      {stars3d.map(({ pos, magnitude }, i) => (
        <group key={i} position={pos.toArray()}>
          <mesh
            onPointerOver={(e) => { e.stopPropagation(); setHov(i); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e)  => { e.stopPropagation(); setHov(null); document.body.style.cursor = 'default'; }}
          >
            <sphereGeometry args={[magnitude * 0.13 + (hov === i ? 0.08 : 0), 10, 10]} />
            <meshBasicMaterial color={hov === i ? 0x00F5D4 : 0xffffff} />
          </mesh>
          <mesh>
            <sphereGeometry args={[magnitude * 0.26, 8, 8]} />
            <meshBasicMaterial color={0xccccff} transparent opacity={0.20} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ConstScene({ selected }) {
  const c = CONSTELLATIONS.find((x) => x.key === selected) || CONSTELLATIONS[0];
  return (
    <>
      <color attach="background" args={['#020812']} />
      <ambientLight intensity={0.55} />
      <Stars radius={200} depth={60} count={4000} factor={2.2} saturation={0.2} />
      <ConstellationMesh constellation={c} />
    </>
  );
}

export function ConstellationView() {
  const [selected, setSelected] = useState('orion');
  const current = CONSTELLATIONS.find((c) => c.key === selected) || CONSTELLATIONS[0];

  return (
    <div className="constellation-view">
      {/* 3D canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          className="const-canvas-inner"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3 }}
        >
          <Canvas camera={{ position: [0, 0, 18], fov: 60 }}
            gl={{ antialias: true, powerPreference: 'default' }}>
            <ConstScene selected={selected} />
          </Canvas>
        </motion.div>
      </AnimatePresence>

      {/* Info overlay */}
      <div className="cv-info-overlay">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="cv-const-name">{current.name}</div>
            <div className="cv-const-type">{current.type} · {current.season}</div>
            <p className="cv-const-desc">{current.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Constellation selector pills */}
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
