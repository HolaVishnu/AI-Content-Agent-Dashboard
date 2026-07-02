import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { STAR_SYSTEMS } from './starSystemsData';

const MAX_R = 50;

// ── Soft circular sprite texture ────────────────────────────────────────────
function useCircleTex() {
  return useMemo(() => {
    const S = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = S;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
    g.addColorStop(0,   'rgba(255,255,255,1)');
    g.addColorStop(0.2, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.8, 'rgba(255,255,255,0.1)');
    g.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(canvas);
  }, []);
}

// ── Galaxy geometry: spiral arms + halo + dust ──────────────────────────────
function useGalaxyGeo() {
  return useMemo(() => {
    // ─ Main arm stars
    const NUM_ARMS = 4, PPA = 2200;
    const total = NUM_ARMS * PPA;
    const aPos = new Float32Array(total * 3);
    const aCol = new Float32Array(total * 3);
    const aSz  = new Float32Array(total);

    let idx = 0;
    for (let arm = 0; arm < NUM_ARMS; arm++) {
      const offset = (arm / NUM_ARMS) * Math.PI * 2;
      const main   = arm < 2;
      for (let i = 0; i < PPA; i++) {
        const t     = i / PPA;
        const rNorm = 0.04 + t * 0.93;
        const angle = offset + t * Math.PI * 3.2
                    + (Math.random() - 0.5) * (main ? 0.28 : 0.55);
        const jit = (Math.random() - 0.5) * (main ? 0.038 : 0.068);
        const r   = (rNorm + jit) * MAX_R;

        aPos[idx*3]   = Math.cos(angle) * r;
        aPos[idx*3+1] = (Math.random()-0.5) * (rNorm < 0.18 ? 2.5 : 0.28);
        aPos[idx*3+2] = Math.sin(angle) * r;

        if (rNorm < 0.10) {
          // Core — hot yellow-white
          aCol[idx*3]=1.0; aCol[idx*3+1]=0.92; aCol[idx*3+2]=0.55;
          aSz[idx] = 1.4 + Math.random();
        } else if (rNorm < 0.22) {
          // Inner bulge — warm white
          aCol[idx*3]=1.0; aCol[idx*3+1]=0.97; aCol[idx*3+2]=0.82;
          aSz[idx] = 0.9 + Math.random()*0.5;
        } else if (rNorm < 0.50) {
          // Mid arm — blue-white
          aCol[idx*3]=0.88; aCol[idx*3+1]=0.92; aCol[idx*3+2]=1.0;
          aSz[idx] = 0.6 + Math.random()*0.35;
        } else {
          // Outer — cool blue
          aCol[idx*3]=0.50; aCol[idx*3+1]=0.68; aCol[idx*3+2]=1.0;
          aSz[idx] = 0.38 + Math.random()*0.22;
        }
        idx++;
      }
    }

    // ─ Dust lane (darker, between arms)
    const DUST = 1800;
    const dPos = new Float32Array(DUST * 3);
    const dCol = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const rN = 0.15 + Math.random() * 0.7;
      const ang = Math.random() * Math.PI * 2;
      const r   = rN * MAX_R;
      dPos[i*3]   = Math.cos(ang) * r;
      dPos[i*3+1] = (Math.random()-0.5) * 0.18;
      dPos[i*3+2] = Math.sin(ang) * r;
      dCol[i*3]=0.22; dCol[i*3+1]=0.16; dCol[i*3+2]=0.32;
    }

    // ─ Spherical halo (old red stars)
    const HALO = 900;
    const hPos = new Float32Array(HALO * 3);
    const hCol = new Float32Array(HALO * 3);
    for (let i = 0; i < HALO; i++) {
      const r   = (0.45 + Math.random()*0.55) * MAX_R * 1.3;
      const th  = Math.random() * Math.PI * 2;
      const phi = Math.acos(2*Math.random()-1);
      hPos[i*3]   = r * Math.sin(phi) * Math.cos(th);
      hPos[i*3+1] = r * Math.cos(phi) * 0.45;
      hPos[i*3+2] = r * Math.sin(phi) * Math.sin(th);
      hCol[i*3]=0.9+Math.random()*0.1; hCol[i*3+1]=0.55+Math.random()*0.25; hCol[i*3+2]=0.25+Math.random()*0.15;
    }

    return { aPos, aCol, aSz, total, dPos, dCol, hPos, hCol, DUST, HALO };
  }, []);
}

// ── Nebula color cloud ──────────────────────────────────────────────────────
function NebulaPlane({ position, color, size, rotation = 0, opacity = 0.07 }) {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.008; });
  return (
    <mesh ref={ref} position={position} rotation={[-Math.PI/2, rotation, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial color={color} transparent opacity={opacity}
        side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// ── Galactic core ───────────────────────────────────────────────────────────
function CoreGlow() {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.04; });
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[3.2, 24, 24]} />
        <meshBasicMaterial color={0xfff5b0} transparent opacity={0.82} />
      </mesh>
      {/* Inner halo ring */}
      <mesh rotation-x={-Math.PI/2}>
        <ringGeometry args={[3.4, 7.5, 64]} />
        <meshBasicMaterial color={0xffdd66} transparent opacity={0.14}
          side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial color={0xffbb30} transparent opacity={0.055}
          side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <Sparkles count={140} scale={9} size={3.5} speed={0.25} color="#ffe080" />
    </group>
  );
}

// ── Galaxy disk assembly ────────────────────────────────────────────────────
function GalaxyDisk({ onSelect, circleTex }) {
  const groupRef = useRef();
  const { aPos, aCol, total, dPos, dCol, hPos, hCol, DUST, HALO } = useGalaxyGeo();

  useFrame((_, d) => {
    if (groupRef.current) groupRef.current.rotation.y += d * 0.010;
  });

  return (
    <group ref={groupRef}>
      {/* Arm stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[aPos, 3]} count={total} />
          <bufferAttribute attach="attributes-color"    args={[aCol, 3]} count={total} />
        </bufferGeometry>
        <pointsMaterial size={1.05} vertexColors sizeAttenuation transparent
          opacity={1.0} alphaMap={circleTex} alphaTest={0.001} depthWrite={false}
          blending={THREE.AdditiveBlending} />
      </points>

      {/* Dust */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dPos, 3]} count={DUST} />
          <bufferAttribute attach="attributes-color"    args={[dCol, 3]} count={DUST} />
        </bufferGeometry>
        <pointsMaterial size={1.6} vertexColors sizeAttenuation transparent
          opacity={0.55} alphaMap={circleTex} alphaTest={0.001} depthWrite={false} />
      </points>

      {/* Halo */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[hPos, 3]} count={HALO} />
          <bufferAttribute attach="attributes-color"    args={[hCol, 3]} count={HALO} />
        </bufferGeometry>
        <pointsMaterial size={0.55} vertexColors sizeAttenuation transparent
          opacity={0.5} alphaMap={circleTex} alphaTest={0.001} depthWrite={false} />
      </points>

      {/* Nebula clouds */}
      <NebulaPlane position={[18,0,10]}   color={0x4466ff} size={32} opacity={0.09} />
      <NebulaPlane position={[-20,0,-10]} color={0xaa33ee} size={28} opacity={0.08} rotation={1.1} />
      <NebulaPlane position={[10,0,-22]}  color={0xff5522} size={24} opacity={0.07} rotation={0.6} />
      <NebulaPlane position={[-12,0,20]}  color={0x22aaff} size={26} opacity={0.09} rotation={2.1} />
      <NebulaPlane position={[-5,0,8]}    color={0xff44aa} size={18} opacity={0.06} rotation={0.3} />

      {STAR_SYSTEMS.map((sys) => (
        <StarMarker key={sys.key} sys={sys} onSelect={onSelect} />
      ))}
    </group>
  );
}

// ── Star system marker ──────────────────────────────────────────────────────
function StarMarker({ sys, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const ringRef = useRef();

  const r     = sys.rNorm * MAX_R;
  const x     = Math.cos(sys.angle) * r;
  const z     = Math.sin(sys.angle) * r;
  const color = sys.isSol ? '#00F5D4' : sys.markerColor ? `rgb(${sys.markerColor})` : '#e8e8ff';
  const base  = sys.isSol ? 1.3 : 0.75;

  useFrame((_, d) => {
    if (meshRef.current) {
      const target = hovered ? 1.7 : 1.0;
      meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, target, d * 8));
    }
    if (ringRef.current) ringRef.current.rotation.z += d * 0.6;
  });

  return (
    <group position={[x, 0.3, z]}>
      <mesh ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(sys.key); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true);  document.body.style.cursor = 'pointer'; }}
        onPointerOut ={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[base, 14, 14]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Orbit ring */}
      <mesh ref={sys.isSol ? ringRef : undefined} rotation-x={-Math.PI/2}>
        <ringGeometry args={[base + 0.6, base + 1.1, 32]} />
        <meshBasicMaterial color={color} transparent opacity={sys.isSol ? 0.5 : 0.28}
          side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Glow sprite */}
      <sprite scale={[base * 5, base * 5, 1]}>
        <spriteMaterial color={color} transparent opacity={0.18}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {hovered && (
        <Html center distanceFactor={100} style={{ pointerEvents: 'none' }}>
          <div className="galaxy-tooltip">
            <div className="galaxy-tooltip-name">{sys.name}</div>
            <div className="galaxy-tooltip-sub">
              {sys.isSol ? 'You Are Here · Click to Explore'
                         : `${sys.distanceLy.toLocaleString()} ly · Click to Explore`}
            </div>
            <p className="galaxy-tooltip-desc">{sys.desc}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Camera drift ────────────────────────────────────────────────────────────
function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    camera.position.y = 65 + Math.sin(t * 0.09) * 9;
    camera.position.x = Math.sin(t * 0.06) * 6;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ── Scene ───────────────────────────────────────────────────────────────────
function GalaxyContent({ onSelect }) {
  const circleTex = useCircleTex();
  return (
    <>
      <color attach="background" args={['#020308']} />
      <fog attach="fog" args={['#020308', 180, 340]} />
      <ambientLight intensity={0.25} />
      <Stars radius={320} depth={90} count={5000} factor={3.5} saturation={0.2} fade />
      <CoreGlow />
      <GalaxyDisk onSelect={onSelect} circleTex={circleTex} />
      <CameraRig />
    </>
  );
}

export function GalaxyMapScene({ onSelectSystem }) {
  return (
    <motion.div
      className="galaxy-canvas-wrap"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5, ease: [0.22, 0.68, 0.36, 1] }}
    >
      <Canvas
        camera={{ position: [0, 72, 40], fov: 58 }}
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
