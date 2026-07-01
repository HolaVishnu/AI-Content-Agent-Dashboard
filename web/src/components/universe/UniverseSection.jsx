import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import './Universe.css';

const COSMIC_SCALES = [
  { key:'solar-system', name:'Solar System', type:'~1 light-day across', rNorm:0.12,
    desc:'The Sun and its eight planets — vanishingly small at this scale, but home.' },
  { key:'local-bubble', name:'Local Bubble', type:'~1,000 light-years across', rNorm:0.28,
    desc:'A low-density cavity in the interstellar medium, carved by ancient supernovae, that the Sun currently drifts through.' },
  { key:'milky-way', name:'Milky Way', type:'~100,000 light-years across', rNorm:0.46,
    desc:'Our home galaxy — a barred spiral of 200–400 billion stars, 13.6 billion years old.' },
  { key:'local-group', name:'Local Group', type:'~10 million light-years across', rNorm:0.64,
    desc:'A gravitationally bound group of ~80 galaxies including the Milky Way, Andromeda, and Triangulum.' },
  { key:'virgo-supercluster', name:'Virgo Supercluster', type:'~110 million light-years across', rNorm:0.82,
    desc:'A vast supercluster of galaxy groups, including the Local Group, all loosely bound by gravity.' },
  { key:'observable-universe', name:'Observable Universe', type:'~93 billion light-years across', rNorm:0.98,
    desc:'The full extent of space we can observe from Earth, containing an estimated 2 trillion galaxies.' },
];

const RING_COLORS = [
  new THREE.Color(0x4488ff),
  new THREE.Color(0x6655ff),
  new THREE.Color(0x9944ee),
  new THREE.Color(0xcc44cc),
  new THREE.Color(0xee4488),
  new THREE.Color(0xff6644),
];

// Animated concentric ring
function CosmicRing({ scale, idx, hovered, onHover, onLeave, onClick }) {
  const obj = useMemo(() => {
    const r = scale.rNorm * 28;
    const pts = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: RING_COLORS[idx] || RING_COLORS[5],
      transparent: true,
      opacity: hovered ? 0.95 : 0.38 + idx * 0.08,
    });
    return new THREE.LineLoop(geo, mat);
  // Recreate when hovered state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, scale.rNorm, hovered]);

  const meshRef = useRef();
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Pulse when hovered
    if (hovered) {
      obj.material.opacity = 0.7 + 0.25 * Math.sin(Date.now() * 0.004);
    }
    meshRef.current.rotation.z += delta * (0.004 + idx * 0.001);
  });

  const r = scale.rNorm * 28;
  const hitR = 1.5;

  return (
    <group ref={meshRef}>
      <primitive object={obj} />
      {/* Invisible hit mesh ring for pointer events */}
      <mesh
        position={[r * 0.707, r * 0.707, 0]}
        onPointerOver={(e) => { e.stopPropagation(); onHover(scale.key); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); onLeave(); document.body.style.cursor = 'default'; }}
        onClick={(e) => { e.stopPropagation(); onClick(scale); }}
      >
        <sphereGeometry args={[hitR, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {hovered && (
        <Html position={[r * 0.707, r * 0.707, 0]} center distanceFactor={60} style={{ pointerEvents: 'none' }}>
          <div className="universe-tooltip">
            <div className="universe-tooltip-name">{scale.name}</div>
            <div className="universe-tooltip-type">{scale.type}</div>
            <p className="universe-tooltip-desc">{scale.desc}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// "You Are Here" dot at center
function YouAreHere() {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * 0.8;
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshBasicMaterial color={0x00F5D4} />
      </mesh>
      <mesh ref={meshRef}>
        <ringGeometry args={[0.55, 0.75, 24]} />
        <meshBasicMaterial color={0x00F5D4} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Galaxy dots scattered in background
function GalaxyField() {
  const positions = useMemo(() => {
    const pos = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const r = (Math.random() * 0.9 + 0.05) * 28;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return pos;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={600} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color={0xaabbff} transparent opacity={0.4} />
    </points>
  );
}

function UniverseContent({ onSelect }) {
  const [hoveredKey, setHoveredKey] = useState(null);

  return (
    <>
      <color attach="background" args={['#030308']} />
      <fog attach="fog" args={['#030308', 80, 180]} />
      <ambientLight intensity={0.5} />
      <Stars radius={200} depth={60} count={3000} factor={2} saturation={0} />
      <GalaxyField />
      <YouAreHere />

      {COSMIC_SCALES.map((scale, i) => (
        <CosmicRing
          key={scale.key}
          scale={scale}
          idx={i}
          hovered={hoveredKey === scale.key}
          onHover={setHoveredKey}
          onLeave={() => setHoveredKey(null)}
          onClick={onSelect}
        />
      ))}
    </>
  );
}

export function UniverseSection() {
  const [ref, inView] = useInView({ rootMargin: '120% 0px 120% 0px' });
  const [selected, setSelected] = useState(null);

  return (
    <section className="universe-section" ref={ref} aria-label="Observable universe scale explorer">
      <div className="universe-header">
        <div className="universe-eyebrow">◈ Cosmic Perspective</div>
        <h2 className="universe-title">The Observable Universe</h2>
        <p className="universe-sub">
          Each ring represents a scale of existence — hover to explore, click for details
        </p>
      </div>

      <div className="universe-stage">
        {inView && (
          <Canvas
            camera={{ position: [0, 0, 55], fov: 60 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <UniverseContent onSelect={setSelected} />
          </Canvas>
        )}
        {!inView && <div className="universe-placeholder">Loading universe…</div>}
      </div>

      {/* Scale pills */}
      <div className="universe-pills">
        {COSMIC_SCALES.map((s, i) => (
          <button
            key={s.key}
            className={`universe-pill${selected?.key === s.key ? ' active' : ''}`}
            style={{ '--pill-color': `#${RING_COLORS[i].getHexString()}` }}
            onClick={() => setSelected(s)}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Selected detail */}
      {selected && (
        <motion.div
          className="universe-detail"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          key={selected.key}
        >
          <button className="universe-detail-close" onClick={() => setSelected(null)}>✕</button>
          <div className="universe-detail-name">{selected.name}</div>
          <div className="universe-detail-type">{selected.type}</div>
          <p className="universe-detail-desc">{selected.desc}</p>
        </motion.div>
      )}
    </section>
  );
}
