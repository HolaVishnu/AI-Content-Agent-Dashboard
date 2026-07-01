import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS, MOONS, COMETS } from './starSystemsData';
import { cometPositionNow } from './orbitalMath';
import { useJsonFetch } from '../../hooks/useJsonFetch';

// ── Lazy canvas-texture cache (module-level, browser-safe) ────────────────────
const _tex = {};
function radialGrad(stops, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  stops.forEach(([t, col]) => g.addColorStop(t, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
function gTex(key, make) { return _tex[key] || (_tex[key] = make()); }

// Sun glow sprites (yellow core → orange mid → red outer corona)
function sunInnerTex() {
  return gTex('si', () => radialGrad([
    [0,    'rgba(255,255,220,1)'],
    [0.18, 'rgba(255,240,160,0.95)'],
    [0.45, 'rgba(255,190,50,0.45)'],
    [0.72, 'rgba(255,120,10,0.12)'],
    [1.0,  'rgba(0,0,0,0)'],
  ]));
}
function sunMidTex() {
  return gTex('sm', () => radialGrad([
    [0,    'rgba(255,150,15,0.65)'],
    [0.38, 'rgba(255,90,5,0.38)'],
    [0.72, 'rgba(255,50,0,0.08)'],
    [1.0,  'rgba(0,0,0,0)'],
  ]));
}
function sunOuterTex() {
  return gTex('so', () => radialGrad([
    [0,    'rgba(255,60,0,0.28)'],
    [0.42, 'rgba(255,30,0,0.09)'],
    [0.78, 'rgba(200,5,0,0.02)'],
    [1.0,  'rgba(0,0,0,0)'],
  ]));
}
// Planet atmosphere ring (transparent center, bright rim, fade out)
function haloTex() {
  return gTex('halo', () => radialGrad([
    [0,    'rgba(255,255,255,0)'],
    [0.5,  'rgba(255,255,255,0)'],
    [0.68, 'rgba(255,255,255,0.38)'],
    [0.84, 'rgba(255,255,255,0.10)'],
    [1.0,  'rgba(255,255,255,0)'],
  ], 128));
}
// Circular sprite for asteroid belt points (fixes WebGL square artifacts)
function asteroidTex() {
  return gTex('ast', () => radialGrad([
    [0,   'rgba(235,215,170,1)'],
    [0.45,'rgba(190,165,120,0.75)'],
    [1.0, 'rgba(0,0,0,0)'],
  ], 64));
}

// ── Deterministic hash for stable NEO positions ───────────────────────────────
function nameHash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0) / 0xffffffff;
}

// ── Orbit ring ─────────────────────────────────────────────────────────────────
function getOrbitColor(r) {
  if (r <= 35) return 0x2a5299;
  if (r <= 80) return 0x7a5820;
  return 0x1a6a88;
}

function OrbitRing({ r, selected = false }) {
  const obj = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    return new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color: selected ? 0x00F5D4 : getOrbitColor(r),
        transparent: true,
        opacity: selected ? 0.88 : 0.18,
      }),
    );
  }, [r, selected]);
  return <primitive object={obj} />;
}

// ── Saturn rings ───────────────────────────────────────────────────────────────
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

// ── Sprite-based planet atmosphere halo ───────────────────────────────────────
function PlanetHalo({ r, color, intensity = 1 }) {
  const scale = r * 3.6;
  return (
    <sprite scale={[scale, scale, scale]}>
      <spriteMaterial
        attach="material"
        map={haloTex()}
        color={new THREE.Color(color)}
        transparent
        opacity={0.65 * intensity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

// ── Planet mesh ────────────────────────────────────────────────────────────────
function TexMesh({ url, r, onEvt }) {
  const tex = useTexture(url);
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 48, 48]} />
      <meshStandardMaterial map={tex} roughness={0.68} metalness={0.04} />
    </mesh>
  );
}
function ColorMesh({ r, color, onEvt }) {
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.68} metalness={0.04} />
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

// ── Moon ───────────────────────────────────────────────────────────────────────
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

// ── Planet ─────────────────────────────────────────────────────────────────────
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
  return (
    <>
      <OrbitRing r={data.orbit} selected={selected} />
      <group ref={pivotRef}>
        <group position={[data.orbit, 0, 0]}>
          <group ref={selfRef}>
            <PlanetMesh data={data} onEvt={onEvt} />
            <PlanetHalo r={data.radius} color={data.color} />
            {selected && (
              <>
                <mesh>
                  <sphereGeometry args={[data.radius * 1.14, 24, 24]} />
                  <meshBasicMaterial color={0x00F5D4} wireframe transparent opacity={0.2} />
                </mesh>
                <PlanetHalo r={data.radius} color={0x00F5D4} intensity={1.6} />
              </>
            )}
          </group>
          {data.hasRing && (
            <SaturnRings innerR={data.radius * 1.22} outerR={data.radius * 2.4} />
          )}
          {moons.map((m) => (
            <Moon key={m.key} data={m} simRunning={simRunning} timeWarp={timeWarp} onSelect={onSelect} />
          ))}
        </group>
      </group>
    </>
  );
}

// ── Comet ──────────────────────────────────────────────────────────────────────
function Comet({ data, cometVirtualMsRef, onSelect }) {
  const meshRef = useRef();
  useFrame(() => {
    if (!meshRef.current) return;
    const pos = cometPositionNow(data, new Date(cometVirtualMsRef.current));
    meshRef.current.position.set(pos.x, 0, pos.z);
    meshRef.current.rotation.y += 0.012;
  });
  return (
    <mesh
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); onSelect(data); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[1.2, 12, 12]} />
      <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={0.6} roughness={0.5} />
    </mesh>
  );
}

// ── Asteroid belt (circular sprite points) ─────────────────────────────────────
function AsteroidBelt() {
  const groupRef = useRef();
  const { positions, colors } = useMemo(() => {
    const count = 320;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t1 = Math.sin(i * 7.3 + 1.2) * 0.5 + 0.5;
      const t2 = Math.sin(i * 3.7 + 4.1) * 0.5 + 0.5;
      const t3 = Math.sin(i * 11.1 + 2.5) * 0.5 + 0.5;
      const ang = t1 * Math.PI * 2;
      const r   = 36 + t2 * 10;
      pos[i*3]   = Math.cos(ang) * r;
      pos[i*3+1] = (t3 - 0.5) * 3;
      pos[i*3+2] = Math.sin(ang) * r;
      const b = 0.28 + t3 * 0.28;
      col[i*3] = b * 1.1; col[i*3+1] = b * 0.95; col[i*3+2] = b * 0.8;
    }
    return { positions: pos, colors: col };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame(() => { if (groupRef.current) groupRef.current.rotation.y += 0.00006; });

  return (
    <group ref={groupRef}>
      <points geometry={geo}>
        <pointsMaterial
          size={1.4}
          map={asteroidTex()}
          vertexColors
          transparent
          opacity={0.82}
          sizeAttenuation
          depthWrite={false}
          alphaTest={0.02}
        />
      </points>
    </group>
  );
}

// ── NEO markers (near Earth orbit, much smaller than before) ──────────────────
const EARTH_R = 25;
function NeoOrbiters({ neos, onSelect }) {
  const items = useMemo(() => neos.slice(0, 45).map((neo) => {
    const h1 = nameHash(neo.name);
    const h2 = nameHash(neo.name + '_r');
    const h3 = nameHash(neo.name + '_y');
    const angle = h1 * Math.PI * 2;
    const miss  = parseFloat(neo.missDistanceLunar) || 8;
    const rOff  = (Math.min(miss, 40) / 40) * 4.5;
    const r     = EARTH_R + (h2 > 0.5 ? 1 : -1) * rOff;
    return {
      key: neo.name,
      pos: [Math.cos(angle) * r, (h3 - 0.5) * 6, Math.sin(angle) * r],
      haz: neo.hazardous,
      neo,
    };
  }), [neos]);

  return items.map(({ key, pos, haz, neo }) => (
    <mesh
      key={key}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({
          name: neo.name, type: 'Near-Earth Object',
          desc: `Close approach: ${neo.closeApproachDate} · Miss dist: ${neo.missDistanceLunar} LD · Velocity: ${neo.velocityKmS} km/s · Diameter: ${neo.diameterMinM}–${neo.diameterMaxM} m${neo.hazardous ? ' · ⚠ HAZARDOUS' : ''}`,
        });
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[haz ? 0.18 : 0.12, 8, 8]} />
      <meshStandardMaterial
        color={haz ? 0xff2233 : 0xff8833}
        emissive={haz ? 0xff1122 : 0xff6611}
        emissiveIntensity={haz ? 1.3 : 0.8}
        roughness={0.35}
      />
    </mesh>
  ));
}

// ── Sun with proper sprite-based corona glow ───────────────────────────────────
const SUN_DATA = {
  key: 'sun', name: 'The Sun', type: 'G2V Yellow Dwarf', radius: 7,
  desc: 'Our star — a 4.6-billion-year-old ball of plasma fusing hydrogen to helium, generating all the light and heat that sustains life on Earth.',
};

function Sun({ onSelect }) {
  const coreRef = useRef();
  const innerRef = useRef();
  useFrame(({ clock, delta }) => {
    if (coreRef.current)  coreRef.current.rotation.y += (delta || 0.016) * 0.04;
    if (innerRef.current) {
      const s = 20 * (1 + Math.sin(clock.elapsedTime * 0.9) * 0.022);
      innerRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* Outer red corona */}
      <sprite scale={[68, 68, 68]}>
        <spriteMaterial attach="material" map={sunOuterTex()} transparent opacity={0.18}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Mid orange halo */}
      <sprite scale={[38, 38, 38]}>
        <spriteMaterial attach="material" map={sunMidTex()} transparent opacity={0.30}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Inner yellow glow — animated pulse */}
      <sprite ref={innerRef} scale={[20, 20, 20]}>
        <spriteMaterial attach="material" map={sunInnerTex()} transparent opacity={0.62}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Sun core sphere */}
      <mesh
        ref={coreRef}
        onClick={(e) => { e.stopPropagation(); onSelect(SUN_DATA); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[7, 48, 48]} />
        <meshStandardMaterial color={0xffffff} emissive={0xffdd55} emissiveIntensity={3.5} roughness={1} />
      </mesh>
    </group>
  );
}

// ── Scene (all R3F hooks must be inside Canvas) ────────────────────────────────
function SolarContent({ simRunning, timeWarp, selectedKey, onSelectBody, neos }) {
  const cometMsRef   = useRef(Date.now());
  const lastFrameRef = useRef(null);
  useFrame(() => {
    const now = performance.timeOrigin + performance.now();
    if (lastFrameRef.current === null) lastFrameRef.current = now;
    if (simRunning) cometMsRef.current += (now - lastFrameRef.current) * timeWarp;
    lastFrameRef.current = now;
  });

  return (
    <>
      {/* Deep blue-purple space background — matches NASA reference palette */}
      <color attach="background" args={['#020810']} />
      <fog attach="fog" args={['#010608', 260, 720]} />

      {/* Hemisphere light: deep blue sky, almost-black ground — space feel */}
      <hemisphereLight args={[0x0a1840, 0x020308, 0.5]} />
      {/* Sun as main light source */}
      <pointLight position={[0, 0, 0]} intensity={5.5} color={0xfff0c8} distance={700} decay={1.0} />
      <pointLight position={[0, 0, 0]} intensity={2.2} color={0xff9900} distance={240} decay={1.8} />
      {/* Blue fill for outer solar system */}
      <pointLight position={[200, 80, -200]} intensity={0.5} color={0x4488ff} distance={500} decay={1.3} />

      <Stars radius={600} depth={150} count={8000} factor={3.8} saturation={0.6} />

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
        <Comet key={c.key} data={c} cometVirtualMsRef={cometMsRef} onSelect={onSelectBody} />
      ))}

      {neos.length > 0 && <NeoOrbiters neos={neos} onSelect={onSelectBody} />}

      <OrbitControls makeDefault minDistance={8} maxDistance={420} enableDamping dampingFactor={0.08} />
    </>
  );
}

// ── Body quick-select pills ────────────────────────────────────────────────────
function BodyPills({ selected, onSelect }) {
  return (
    <div className="body-pills">
      <button className={`body-pill sun-pill${selected?.key === 'sun' ? ' active' : ''}`}
        onClick={() => onSelect(SUN_DATA)}>☀ Sun</button>
      {PLANETS.map((p) => (
        <button key={p.key} className={`body-pill${selected?.key === p.key ? ' active' : ''}`}
          onClick={() => onSelect(p)}>{p.name}</button>
      ))}
      {COMETS.map((c) => (
        <button key={c.key} className={`body-pill comet-pill${selected?.key === c.key ? ' active' : ''}`}
          onClick={() => onSelect(c)}>☄ {c.name}</button>
      ))}
    </div>
  );
}

// ── NEO legend overlay ─────────────────────────────────────────────────────────
function NeoLegend({ total, hazCount }) {
  if (!total) return null;
  return (
    <div className="neo-scene-legend">
      <span className="neo-legend-dot neo-safe-dot" />
      <span className="neo-legend-text">{total - hazCount} safe</span>
      <span className="neo-legend-dot neo-haz-dot" />
      <span className="neo-legend-text">{hazCount} hazardous</span>
      <span className="neo-legend-label">· NEOs · click to inspect</span>
    </div>
  );
}

// ── Exported component ─────────────────────────────────────────────────────────
export function SolarSystemScene({ simRunning, timeWarp, selectedBody, onSelectBody }) {
  const { data } = useJsonFetch('/neows.json');
  const neos     = data?.objects || [];
  const shown    = neos.slice(0, 45);
  const hazCount = shown.filter((n) => n.hazardous).length;

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
          neos={shown}
        />
      </Canvas>
      <BodyPills selected={selectedBody} onSelect={onSelectBody} />
      <NeoLegend total={shown.length} hazCount={hazCount} />
    </div>
  );
}
