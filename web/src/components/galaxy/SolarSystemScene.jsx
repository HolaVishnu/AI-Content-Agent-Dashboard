import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS, MOONS, COMETS } from './starSystemsData';
import { cometPositionNow } from './orbitalMath';

// ── Orbit ring (LineLoop) ────────────────────────────────────────────────────
function OrbitRing({ r, opacity = 0.25, selected = false }) {
  const obj = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: selected ? 0x00F5D4 : 0x2a3a5e,
      transparent: true,
      opacity: selected ? 0.92 : opacity,
    });
    return new THREE.LineLoop(geo, mat);
  }, [r, opacity, selected]);

  return <primitive object={obj} />;
}

// ── Saturn ring disk ─────────────────────────────────────────────────────────
function SaturnRings({ innerR, outerR }) {
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(innerR, outerR, 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [innerR, outerR]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={0xe8d4a0} transparent opacity={0.55} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Planet surface (texture + fallback) ───────────────────────────────────────
function TexMesh({ url, r, color, onEvt }) {
  const tex = useTexture(url);
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 48, 48]} />
      <meshStandardMaterial map={tex} roughness={0.8} metalness={0.05} />
    </mesh>
  );
}

function ColorMesh({ r, color, onEvt }) {
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
    </mesh>
  );
}

function PlanetMesh({ data, onEvt }) {
  if (!data.texture) return <ColorMesh r={data.radius} color={data.color} onEvt={onEvt} />;
  return (
    <Suspense fallback={<ColorMesh r={data.radius} color={data.color} onEvt={onEvt} />}>
      <TexMesh url={data.texture} r={data.radius} color={data.color} onEvt={onEvt} />
    </Suspense>
  );
}

// ── Moon ─────────────────────────────────────────────────────────────────────
function Moon({ data, parentData, simRunning, timeWarp, onSelect }) {
  const pivotRef = useRef();
  useFrame(() => {
    if (pivotRef.current && simRunning) {
      pivotRef.current.rotation.y += (0.6 / data.periodDays) * (timeWarp / 40);
    }
  });

  const onEvt = {
    onClick:        (e) => { e.stopPropagation(); onSelect(data); },
    onPointerOver:  () => { document.body.style.cursor = 'pointer'; },
    onPointerOut:   () => { document.body.style.cursor = 'default'; },
  };

  return (
    <>
      <OrbitRing r={data.orbit} opacity={0.15} />
      <group ref={pivotRef}>
        <group position={[data.orbit, 0, 0]}>
          <mesh {...onEvt}>
            <sphereGeometry args={[data.radius, 16, 16]} />
            <meshStandardMaterial color={data.color} roughness={0.9} />
          </mesh>
        </group>
      </group>
    </>
  );
}

// ── Planet ────────────────────────────────────────────────────────────────────
function Planet({ data, simRunning, timeWarp, onSelect, selected }) {
  const pivotRef = useRef();
  const selfRef  = useRef();

  useFrame(() => {
    if (pivotRef.current && simRunning) {
      pivotRef.current.rotation.y += (0.02 / (data.period || 1)) * (timeWarp / 40);
    }
    if (selfRef.current && data.spinDays && simRunning) {
      selfRef.current.rotation.y +=
        (0.045 / Math.abs(data.spinDays)) * Math.sign(data.spinDays) * (timeWarp / 40);
    }
  });

  const moons = MOONS[data.key] || [];
  const onEvt = {
    onClick:       (e) => { e.stopPropagation(); onSelect(data); },
    onPointerOver: () => { document.body.style.cursor = 'pointer'; },
    onPointerOut:  () => { document.body.style.cursor = 'default'; },
  };

  return (
    <>
      <OrbitRing r={data.orbit} selected={selected} />
      <group ref={pivotRef}>
        <group position={[data.orbit, 0, 0]}>
          <group ref={selfRef}>
            <PlanetMesh data={data} onEvt={onEvt} />
            {selected && (
              <mesh>
                <sphereGeometry args={[data.radius * 1.12, 24, 24]} />
                <meshBasicMaterial color={0x00F5D4} wireframe transparent opacity={0.18} />
              </mesh>
            )}
          </group>
          {data.hasRing && (
            <SaturnRings innerR={data.radius * 1.22} outerR={data.radius * 2.4} />
          )}
          {moons.map((m) => (
            <Moon
              key={m.key}
              data={m}
              parentData={data}
              simRunning={simRunning}
              timeWarp={timeWarp}
              onSelect={onSelect}
            />
          ))}
        </group>
      </group>
    </>
  );
}

// ── Comet ─────────────────────────────────────────────────────────────────────
function Comet({ data, cometVirtualMsRef, onSelect }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = cometPositionNow(data, new Date(cometVirtualMsRef.current));
    meshRef.current.position.set(pos.x, 0, pos.z);
    meshRef.current.rotation.y += 0.012;
    meshRef.current.rotation.x += 0.006;
  });

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[1.2, 12, 12]} />
      <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.4} roughness={0.6} />
    </mesh>
  );
}

// ── The Sun ───────────────────────────────────────────────────────────────────
const SUN_DATA = {
  key: 'sun', name: 'The Sun', type: 'G2V Yellow Dwarf', radius: 7,
  desc: 'Our star — a 4.6-billion-year-old ball of plasma fusing hydrogen to helium, generating all the light and heat that sustains life on Earth.',
};

function Sun({ onSelect }) {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.05;
  });
  return (
    <mesh
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); onSelect(SUN_DATA); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[7, 48, 48]} />
      <meshStandardMaterial
        color={0xfff2a0}
        emissive={0xffb820}
        emissiveIntensity={1.2}
        roughness={1}
      />
    </mesh>
  );
}

// ── Scene inner (uses R3F hooks) ───────────────────────────────────────────────
function SolarContent({ simRunning, timeWarp, selectedKey, onSelectBody }) {
  const cometVirtualMsRef = useRef(Date.now());
  const lastFrameMs = useRef(null);

  useFrame(() => {
    const now = performance.timeOrigin + performance.now();
    if (lastFrameMs.current === null) lastFrameMs.current = now;
    if (simRunning) cometVirtualMsRef.current += (now - lastFrameMs.current) * timeWarp;
    lastFrameMs.current = now;
  });

  return (
    <>
      <color attach="background" args={['#030408']} />
      <fog attach="fog" args={['#030408', 350, 700]} />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={3.5} color={0xfff2b0} distance={500} decay={1.2} />
      <pointLight position={[0, 0, 0]} intensity={1.0} color={0xff8800} distance={200} decay={1.8} />
      <Stars radius={600} depth={120} count={5000} factor={3} saturation={0.4} />

      <Sun onSelect={onSelectBody} />

      {PLANETS.map((p) => (
        <Planet
          key={p.key}
          data={p}
          simRunning={simRunning}
          timeWarp={timeWarp}
          onSelect={onSelectBody}
          selected={selectedKey === p.key}
        />
      ))}

      {COMETS.map((c) => (
        <Comet
          key={c.key}
          data={c}
          cometVirtualMsRef={cometVirtualMsRef}
          onSelect={onSelectBody}
        />
      ))}

      <OrbitControls
        makeDefault
        minDistance={8}
        maxDistance={400}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

// ── Quick-select body pills ───────────────────────────────────────────────────
function BodyPills({ selected, onSelect }) {
  return (
    <div className="body-pills">
      <button
        className={`body-pill sun-pill${selected?.key === 'sun' ? ' active' : ''}`}
        onClick={() => onSelect(SUN_DATA)}
      >
        ☀ Sun
      </button>
      {PLANETS.map((p) => (
        <button
          key={p.key}
          className={`body-pill${selected?.key === p.key ? ' active' : ''}`}
          onClick={() => onSelect(p)}
        >
          {p.name}
        </button>
      ))}
      {COMETS.map((c) => (
        <button
          key={c.key}
          className={`body-pill comet-pill${selected?.key === c.key ? ' active' : ''}`}
          onClick={() => onSelect(c)}
        >
          ☄ {c.name}
        </button>
      ))}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export function SolarSystemScene({ simRunning, timeWarp, selectedBody, onSelectBody }) {
  return (
    <div className="solar-canvas-wrap">
      <Canvas
        camera={{ position: [0, 80, 130], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <SolarContent
          simRunning={simRunning}
          timeWarp={timeWarp}
          selectedKey={selectedBody?.key}
          onSelectBody={onSelectBody}
        />
      </Canvas>
      <BodyPills selected={selectedBody} onSelect={onSelectBody} />
    </div>
  );
}
