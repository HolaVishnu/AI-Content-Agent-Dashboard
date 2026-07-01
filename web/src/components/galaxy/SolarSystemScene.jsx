import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS, MOONS, COMETS } from './starSystemsData';
import { cometPositionNow } from './orbitalMath';
import { useJsonFetch } from '../../hooks/useJsonFetch';

// ── Stable deterministic hash (avoids Math.random in useMemo deps) ───────────
function nameHash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  return (h >>> 0) / 0xffffffff;
}

// ── Orbit zone colors ─────────────────────────────────────────────────────────
function getOrbitColor(orbit) {
  if (orbit <= 35) return 0x3a6aae; // inner — blue
  if (orbit <= 80) return 0x8a6a3a; // gas giants — warm gold
  return 0x3a8aaa;                  // ice giants — teal
}

function OrbitRing({ r, selected = false }) {
  const obj = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color:       selected ? 0x00F5D4 : getOrbitColor(r),
      transparent: true,
      opacity:     selected ? 0.95 : 0.32,
    });
    return new THREE.LineLoop(geo, mat);
  }, [r, selected]);

  return <primitive object={obj} />;
}

// ── Saturn rings ──────────────────────────────────────────────────────────────
function SaturnRings({ innerR, outerR }) {
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(innerR, outerR, 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [innerR, outerR]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={0xd4bfa0} transparent opacity={0.65} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Atmosphere glow halo ──────────────────────────────────────────────────────
function AtmosphereGlow({ r, color, intensity = 0.18 }) {
  return (
    <mesh>
      <sphereGeometry args={[r * 1.22, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Planet mesh with texture ──────────────────────────────────────────────────
function TexMesh({ url, r, onEvt }) {
  const tex = useTexture(url);
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 48, 48]} />
      <meshStandardMaterial map={tex} roughness={0.72} metalness={0.05} />
    </mesh>
  );
}
function ColorMesh({ r, color, onEvt }) {
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={0.05} />
    </mesh>
  );
}
function PlanetMesh({ data, onEvt }) {
  if (!data.texture) return <ColorMesh r={data.radius} color={data.color} onEvt={onEvt} />;
  return (
    <Suspense fallback={<ColorMesh r={data.radius} color={data.color} onEvt={onEvt} />}>
      <TexMesh url={data.texture} r={data.radius} onEvt={onEvt} />
    </Suspense>
  );
}

// ── Moon ─────────────────────────────────────────────────────────────────────
function Moon({ data, simRunning, timeWarp, onSelect }) {
  const pivotRef = useRef();
  useFrame(() => {
    if (pivotRef.current && simRunning)
      pivotRef.current.rotation.y += (0.6 / data.periodDays) * (timeWarp / 40);
  });
  const onEvt = {
    onClick:       (e) => { e.stopPropagation(); onSelect(data); },
    onPointerOver: () => { document.body.style.cursor = 'pointer'; },
    onPointerOut:  () => { document.body.style.cursor = 'default'; },
  };
  return (
    <>
      <OrbitRing r={data.orbit} />
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
    if (pivotRef.current && simRunning)
      pivotRef.current.rotation.y += (0.02 / (data.period || 1)) * (timeWarp / 40);
    if (selfRef.current && data.spinDays && simRunning)
      selfRef.current.rotation.y +=
        (0.045 / Math.abs(data.spinDays)) * Math.sign(data.spinDays) * (timeWarp / 40);
  });
  const moons = MOONS[data.key] || [];
  const onEvt = {
    onClick:       (e) => { e.stopPropagation(); onSelect(data); },
    onPointerOver: () => { document.body.style.cursor = 'pointer'; },
    onPointerOut:  () => { document.body.style.cursor = 'default'; },
  };
  const atmColor = new THREE.Color(data.color);
  return (
    <>
      <OrbitRing r={data.orbit} selected={selected} />
      <group ref={pivotRef}>
        <group position={[data.orbit, 0, 0]}>
          <group ref={selfRef}>
            <PlanetMesh data={data} onEvt={onEvt} />
            <AtmosphereGlow r={data.radius} color={atmColor} intensity={0.15} />
            {selected && (
              <>
                <mesh>
                  <sphereGeometry args={[data.radius * 1.14, 24, 24]} />
                  <meshBasicMaterial color={0x00F5D4} wireframe transparent opacity={0.22} />
                </mesh>
                <AtmosphereGlow r={data.radius} color={0x00F5D4} intensity={0.3} />
              </>
            )}
          </group>
          {data.hasRing && (
            <SaturnRings innerR={data.radius * 1.22} outerR={data.radius * 2.4} />
          )}
          {moons.map((m) => (
            <Moon
              key={m.key}
              data={m}
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
    <group>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(data); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[1.2, 12, 12]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.color}
          emissiveIntensity={0.6}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

// ── Asteroid belt (point cloud between Mars & Jupiter) ────────────────────────
function AsteroidBelt() {
  const groupRef = useRef();

  const { positions, colors } = useMemo(() => {
    const count = 320;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    // Use deterministic pseudo-random via sin to avoid Math.random instability
    for (let i = 0; i < count; i++) {
      const t1 = Math.sin(i * 7.3 + 1.2) * 0.5 + 0.5;
      const t2 = Math.sin(i * 3.7 + 4.1) * 0.5 + 0.5;
      const t3 = Math.sin(i * 11.1 + 2.5) * 0.5 + 0.5;
      const angle = t1 * Math.PI * 2;
      const r = 36 + t2 * 10;
      const y = (t3 - 0.5) * 3;
      pos[i * 3]     = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      const brightness = 0.28 + t3 * 0.28;
      col[i * 3]     = brightness * 1.1;
      col[i * 3 + 1] = brightness * 0.95;
      col[i * 3 + 2] = brightness * 0.8;
    }
    return { positions: pos, colors: col };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.00006;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geo}>
        <pointsMaterial
          size={0.55}
          vertexColors
          transparent
          opacity={0.72}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// ── NEO markers (near Earth's orbit) ─────────────────────────────────────────
const EARTH_R = 25;

function NeoOrbiters({ neos, onSelect }) {
  const items = useMemo(() => {
    return neos.slice(0, 45).map((neo) => {
      const h1 = nameHash(neo.name);
      const h2 = nameHash(neo.name + '_r');
      const h3 = nameHash(neo.name + '_y');
      const angle = h1 * Math.PI * 2;
      const missLunar = parseFloat(neo.missDistanceLunar) || 8;
      // Scale miss distance to ±4.5 scene units around Earth's orbit
      const rOff = (Math.min(missLunar, 40) / 40) * 4.5;
      const sign = h2 > 0.5 ? 1 : -1;
      const r = EARTH_R + sign * rOff;
      const y = (h3 - 0.5) * 6;
      return {
        key: neo.name,
        pos: [Math.cos(angle) * r, y, Math.sin(angle) * r],
        hazardous: neo.hazardous,
        displayRadius: neo.hazardous ? 0.68 : 0.44,
        neo,
      };
    });
  }, [neos]);

  return items.map(({ key, pos, hazardous, displayRadius, neo }) => (
    <mesh
      key={key}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({
          name: neo.name,
          type: 'Near-Earth Object',
          desc: `Closest approach: ${neo.closeApproachDate} · Miss distance: ${neo.missDistanceLunar} LD · Velocity: ${neo.velocityKmS} km/s · Diameter: ${neo.diameterMinM}–${neo.diameterMaxM} m${neo.hazardous ? ' · ⚠ POTENTIALLY HAZARDOUS' : ''}`,
        });
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[displayRadius, 8, 8]} />
      <meshStandardMaterial
        color={hazardous ? 0xff2233 : 0xff8833}
        emissive={hazardous ? 0xff1122 : 0xff6611}
        emissiveIntensity={hazardous ? 1.1 : 0.6}
        roughness={0.4}
      />
    </mesh>
  ));
}

// ── Sun with corona ───────────────────────────────────────────────────────────
const SUN_DATA = {
  key: 'sun', name: 'The Sun', type: 'G2V Yellow Dwarf', radius: 7,
  desc: 'Our star — a 4.6-billion-year-old ball of plasma fusing hydrogen to helium, generating all the light and heat that sustains life on Earth.',
};

function CoronaLayer({ r, color, opacity }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.1 + r) * 0.022;
      ref.current.scale.setScalar(pulse);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Sun({ onSelect }) {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });
  return (
    <group>
      {/* Outer corona halos */}
      <CoronaLayer r={24} color={0xff2200} opacity={0.03} />
      <CoronaLayer r={18} color={0xff5500} opacity={0.055} />
      <CoronaLayer r={13} color={0xff9900} opacity={0.09} />
      <CoronaLayer r={9.5} color={0xffcc44} opacity={0.16} />
      {/* Sun surface */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(SUN_DATA); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[7, 48, 48]} />
        <meshStandardMaterial
          color={0xfff0a0}
          emissive={0xffb820}
          emissiveIntensity={2.2}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

// ── Scene (uses R3F hooks — must be inside Canvas) ────────────────────────────
function SolarContent({ simRunning, timeWarp, selectedKey, onSelectBody, neos }) {
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
      <color attach="background" args={['#020308']} />
      <fog attach="fog" args={['#020308', 320, 700]} />
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0, 0]} intensity={5.0} color={0xfff0c8} distance={650} decay={1.0} />
      <pointLight position={[0, 0, 0]} intensity={2.0} color={0xff9900} distance={230} decay={1.8} />
      {/* Fill light for deep-space planets */}
      <pointLight position={[200, 100, -200]} intensity={0.6} color={0x8899ff} distance={500} decay={1.4} />
      <Stars radius={600} depth={140} count={7000} factor={3.5} saturation={0.5} />

      <Sun onSelect={onSelectBody} />
      <AsteroidBelt />

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

      {neos.length > 0 && (
        <NeoOrbiters neos={neos} onSelect={onSelectBody} />
      )}

      <OrbitControls
        makeDefault
        minDistance={8}
        maxDistance={420}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

// ── Body quick-select pills ───────────────────────────────────────────────────
function BodyPills({ selected, onSelect }) {
  return (
    <div className="body-pills">
      <button
        className={`body-pill sun-pill${selected?.key === 'sun' ? ' active' : ''}`}
        onClick={() => onSelect(SUN_DATA)}
      >☀ Sun</button>
      {PLANETS.map((p) => (
        <button
          key={p.key}
          className={`body-pill${selected?.key === p.key ? ' active' : ''}`}
          onClick={() => onSelect(p)}
        >{p.name}</button>
      ))}
      {COMETS.map((c) => (
        <button
          key={c.key}
          className={`body-pill comet-pill${selected?.key === c.key ? ' active' : ''}`}
          onClick={() => onSelect(c)}
        >☄ {c.name}</button>
      ))}
    </div>
  );
}

// ── NEO overlay legend ────────────────────────────────────────────────────────
function NeoLegend({ total, hazCount }) {
  if (!total) return null;
  const safeCount = total - hazCount;
  return (
    <div className="neo-scene-legend">
      <span className="neo-legend-dot neo-safe-dot" />
      <span className="neo-legend-text">{safeCount} safe</span>
      <span className="neo-legend-dot neo-haz-dot" />
      <span className="neo-legend-text">{hazCount} hazardous</span>
      <span className="neo-legend-label">· NEOs near Earth orbit · click to inspect</span>
    </div>
  );
}

// ── Exported component ────────────────────────────────────────────────────────
export function SolarSystemScene({ simRunning, timeWarp, selectedBody, onSelectBody }) {
  const { data } = useJsonFetch('/neows.json');
  const neos = data?.objects || [];
  const displayed = neos.slice(0, 45);
  const hazCount = displayed.filter((n) => n.hazardous).length;

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
          neos={displayed}
        />
      </Canvas>
      <BodyPills selected={selectedBody} onSelect={onSelectBody} />
      <NeoLegend total={displayed.length} hazCount={hazCount} />
    </div>
  );
}
