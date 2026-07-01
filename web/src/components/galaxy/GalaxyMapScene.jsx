import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { STAR_SYSTEMS } from './starSystemsData';

const MAX_R = 50;

function useGalaxyGeo() {
  return useMemo(() => {
    const NUM_ARMS = 4;
    const PPA = 700;
    const total = NUM_ARMS * PPA;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);

    let idx = 0;
    for (let arm = 0; arm < NUM_ARMS; arm++) {
      const offset = (arm / NUM_ARMS) * Math.PI * 2;
      for (let i = 0; i < PPA; i++) {
        const t = i / PPA;
        const rNorm = 0.03 + t * 0.95;
        const angle = offset + t * Math.PI * 2.6 + (Math.random() - 0.5) * 0.45;
        const jitter = (Math.random() - 0.5) * 0.06 * (1 - t * 0.5);
        const r = (rNorm + jitter) * MAX_R;

        pos[idx * 3]     = Math.cos(angle) * r;
        pos[idx * 3 + 1] = (Math.random() - 0.5) * 0.4;
        pos[idx * 3 + 2] = Math.sin(angle) * r;

        if (rNorm < 0.15) {
          col[idx * 3] = 1; col[idx * 3 + 1] = 0.85; col[idx * 3 + 2] = 0.1;
        } else if (rNorm < 0.5) {
          col[idx * 3] = 0.91; col[idx * 3 + 1] = 0.91; col[idx * 3 + 2] = 1;
        } else {
          col[idx * 3] = 0.6; col[idx * 3 + 1] = 0.78; col[idx * 3 + 2] = 1;
        }
        idx++;
      }
    }
    return { pos, col, count: total };
  }, []);
}

function StarMarker({ sys, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const r = sys.rNorm * MAX_R;
  const x = Math.cos(sys.angle) * r;
  const z = Math.sin(sys.angle) * r;
  const color = sys.isSol ? '#00F5D4' : sys.markerColor ? `rgb(${sys.markerColor})` : '#e8e8ff';
  const baseSize = sys.isSol ? 1.1 : 0.65;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = hovered ? 1.5 : 1.0;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, target, delta * 8),
    );
  });

  return (
    <group position={[x, 0.3, z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(sys.key); }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[baseSize, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {sys.isSol && (
        <mesh rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.5, 2.3, 32]} />
          <meshBasicMaterial color={0x00F5D4} transparent opacity={0.22} side={THREE.DoubleSide} />
        </mesh>
      )}

      {hovered && (
        <Html center distanceFactor={100} style={{ pointerEvents: 'none' }}>
          <div className="galaxy-tooltip">
            <div className="galaxy-tooltip-name">{sys.name}</div>
            <div className="galaxy-tooltip-sub">
              {sys.isSol
                ? 'You Are Here · Click to Explore'
                : `${sys.distanceLy.toLocaleString()} ly · Click to Explore`}
            </div>
            <p className="galaxy-tooltip-desc">{sys.desc}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function GalaxyDisk({ onSelect }) {
  const groupRef = useRef();
  const { pos, col, count } = useGalaxyGeo();

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.018;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} count={count} />
          <bufferAttribute attach="attributes-color" args={[col, 3]} count={count} />
        </bufferGeometry>
        <pointsMaterial size={0.28} vertexColors sizeAttenuation transparent opacity={0.88} />
      </points>

      {STAR_SYSTEMS.map((sys) => (
        <StarMarker key={sys.key} sys={sys} onSelect={onSelect} />
      ))}
    </group>
  );
}

function CoreGlow() {
  return (
    <mesh>
      <sphereGeometry args={[2.5, 16, 16]} />
      <meshBasicMaterial color={0xffd080} transparent opacity={0.55} />
    </mesh>
  );
}

function GalaxyContent({ onSelect }) {
  return (
    <>
      <color attach="background" args={['#020308']} />
      <fog attach="fog" args={['#020308', 160, 320]} />
      <ambientLight intensity={0.3} />
      <Stars radius={300} depth={80} count={4000} factor={3} saturation={0} />
      <CoreGlow />
      <GalaxyDisk onSelect={onSelect} />
    </>
  );
}

export function GalaxyMapScene({ onSelectSystem }) {
  return (
    <motion.div
      className="galaxy-canvas-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Canvas
        camera={{ position: [0, 90, 55], fov: 55 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <GalaxyContent onSelect={onSelectSystem} />
      </Canvas>

      <div className="galaxy-caption">
        <span className="galaxy-caption-text">
          ◈ The Milky Way · 6 notable star systems · Click any star to explore
        </span>
      </div>
    </motion.div>
  );
}
