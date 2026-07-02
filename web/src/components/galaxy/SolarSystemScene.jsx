import { useRef, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { NeoPanel } from './NeoPanel';
import { PLANETS, MOONS, COMETS } from './starSystemsData';
import { cometPositionNow } from './orbitalMath';
import { useJsonFetch } from '../../hooks/useJsonFetch';

// ── Module-level canvas texture cache ─────────────────────────────────────────
const _tex = {};
function radialGrad(stops, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const h = size / 2;
  const g = ctx.createRadialGradient(h, h, 0, h, h, h);
  stops.forEach(([t, col]) => g.addColorStop(t, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
function gTex(key, make) { return _tex[key] || (_tex[key] = make()); }

// Sun sprite textures
const sunInnerTex = () => gTex('si', () => radialGrad([
  [0,    'rgba(255,255,220,1)'],
  [0.18, 'rgba(255,240,160,0.95)'],
  [0.42, 'rgba(255,200,60,0.48)'],
  [0.70, 'rgba(255,130,15,0.14)'],
  [1.0,  'rgba(0,0,0,0)'],
]));
const sunMidTex  = () => gTex('sm', () => radialGrad([
  [0,    'rgba(255,160,20,0.70)'],
  [0.36, 'rgba(255,100,5,0.40)'],
  [0.70, 'rgba(255,55,0,0.09)'],
  [1.0,  'rgba(0,0,0,0)'],
]));
const sunOuterTex = () => gTex('so', () => radialGrad([
  [0,    'rgba(255,70,0,0.30)'],
  [0.40, 'rgba(255,35,0,0.10)'],
  [0.78, 'rgba(200,8,0,0.02)'],
  [1.0,  'rgba(0,0,0,0)'],
]));

// Sun photosphere — limb-darkening gradient + granulation convection cells
const sunSurfaceTex = () => gTex('sunSurf', () => {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  // Limb-darkening base (hot white core → deep red rim)
  const bg = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
  bg.addColorStop(0.00, '#fffde4');
  bg.addColorStop(0.20, '#fff3a8');
  bg.addColorStop(0.46, '#ffbc30');
  bg.addColorStop(0.68, '#ff6c00');
  bg.addColorStop(0.86, '#cc2800');
  bg.addColorStop(1.00, '#7a0e00');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  // Granulation cells — overlay mode blends light/dark blobs over the gradient
  ctx.globalCompositeOperation = 'overlay';
  for (let i = 0; i < 540; i++) {
    const h1 = Math.sin(i * 7.31 + 1.17) * 0.5 + 0.5;
    const h2 = Math.sin(i * 3.73 + 4.09) * 0.5 + 0.5;
    const h3 = Math.sin(i * 11.07 + 2.53) * 0.5 + 0.5;
    const h4 = Math.sin(i * 5.91 + 7.83) * 0.5 + 0.5;
    const x = h1 * S, y = h2 * S;
    const dx = x - S/2, dy = y - S/2;
    if (Math.sqrt(dx*dx + dy*dy) / (S/2) > 0.93) continue;
    const r = 5 + h3 * 20;
    const alpha = 0.12 + h3 * 0.22;
    const g2 = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (h4 > 0.42) {
      g2.addColorStop(0,    `rgba(255,250,210,${alpha})`);
      g2.addColorStop(0.55, `rgba(255,200,60,${alpha * 0.35})`);
      g2.addColorStop(1,    'rgba(0,0,0,0)');
    } else {
      g2.addColorStop(0,    `rgba(155,30,0,${alpha * 0.65})`);
      g2.addColorStop(0.5,  `rgba(75,8,0,${alpha * 0.25})`);
      g2.addColorStop(1,    'rgba(0,0,0,0)');
    }
    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  return new THREE.CanvasTexture(c);
});

// Planet glow — FULL circle gradient (no transparent center → no black-spot)
// Additive blend over the planet surface = brightens it, adds edge halo
const planetGlowTex = () => gTex('pg', () => radialGrad([
  [0,    'rgba(255,255,255,0.55)'],
  [0.30, 'rgba(255,255,255,0.30)'],
  [0.62, 'rgba(255,255,255,0.10)'],
  [0.85, 'rgba(255,255,255,0.03)'],
  [1.0,  'rgba(0,0,0,0)'],
], 128));

// Circular point texture for asteroid belt (eliminates WebGL square artifacts)
const asteroidTex = () => gTex('ast', () => radialGrad([
  [0,   'rgba(235,215,170,1)'],
  [0.45,'rgba(190,165,120,0.75)'],
  [1.0, 'rgba(0,0,0,0)'],
], 64));

// ── Deterministic hash for NEO positions ──────────────────────────────────────
function nameHash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0) / 0xffffffff;
}

// ── Unified simulation time scale ────────────────────────────────────────────
// All revolution & rotation rates are derived from these two numbers.
// VISUAL_YR  = screen-seconds per 1 real year   (at timeWarp = 40)
// VISUAL_DAY = screen-seconds per 1 Earth-day spin (at timeWarp = 40)
// Change either value to globally rescale the whole simulation.
const VISUAL_YR  = 8;   // Earth completes one orbit in 8 screen-seconds
const VISUAL_DAY = 4;   // Earth completes one spin  in 4 screen-seconds
// Per-frame rates at 60 fps, timeWarp=40:
const ORB_K  = (2 * Math.PI) / (VISUAL_YR  * 60); // rad/frame for a 1-year  orbit
const SPIN_K = (2 * Math.PI) / (VISUAL_DAY * 60); // rad/frame for a 1-day   spin
// Virtual-ms per real-ms for Keplerian comet positions (timeWarp=40).
// Chosen so a comet with period P years takes P × VISUAL_YR screen-seconds per orbit —
// identical time-scale as planets.
const COMET_K = (365.25 * 86400 * 1000) / (VISUAL_YR * 1000); // ≈ 3 944 700

// ── Orbit ring (visible, zoned by distance) ───────────────────────────────────
function getOrbitColor(r) {
  if (r <= 35) return 0x4488dd;   // inner — brighter blue
  if (r <= 80) return 0xaa8844;   // gas giants — warm gold
  return 0x44aacc;                 // ice giants — teal
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
        color:       selected ? 0x00F5D4 : getOrbitColor(r),
        transparent: true,
        opacity:     selected ? 0.95 : 0.45,   // was 0.18 — much more visible now
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
      <meshBasicMaterial color={0xd8c8a0} transparent opacity={0.75} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Planet glow sprite (full-circle, additive — NO transparent-center black spot) ──
function PlanetGlow({ r, color }) {
  const scale = r * 3.2;
  return (
    <sprite scale={[scale, scale, scale]}>
      <spriteMaterial
        attach="material"
        map={planetGlowTex()}
        color={new THREE.Color(color)}
        transparent
        opacity={0.55}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}

// ── Planet mesh (texture + emissive so dark side isn't pure black) ────────────
function TexMesh({ url, r, color, onEvt }) {
  const tex = useTexture(url);
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 48, 48]} />
      <meshStandardMaterial
        map={tex}
        roughness={0.60}
        metalness={0.0}
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.18}   // subtle self-glow so dark side stays colorful
      />
    </mesh>
  );
}
function ColorMesh({ r, color, onEvt }) {
  return (
    <mesh {...onEvt}>
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.60}
        metalness={0.0}
        emissive={new THREE.Color(color)}
        emissiveIntensity={0.22}
      />
    </mesh>
  );
}
function PlanetMesh({ data, onEvt }) {
  if (!data.texture)
    return <ColorMesh r={data.radius} color={data.color} onEvt={onEvt} />;
  return (
    <Suspense fallback={<ColorMesh r={data.radius} color={data.color} onEvt={onEvt} />}>
      <TexMesh url={data.texture} r={data.radius} color={data.color} onEvt={onEvt} />
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
            <meshStandardMaterial color={data.color} roughness={0.85}
              emissive={new THREE.Color(data.color)} emissiveIntensity={0.1} />
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
      pivotRef.current.rotation.y += (ORB_K / (data.period || 1)) * (timeWarp / 40);
    if (selfRef.current && data.spinDays && simRunning)
      selfRef.current.rotation.y +=
        (SPIN_K / Math.abs(data.spinDays)) * Math.sign(data.spinDays) * (timeWarp / 40);
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
            {/* Full-circle glow — brightens planet + adds edge halo, no black spots */}
            <PlanetGlow r={data.radius} color={data.color} />
            {selected && (
              <>
                <mesh>
                  <sphereGeometry args={[data.radius * 1.14, 24, 24]} />
                  <meshBasicMaterial color={0x00F5D4} wireframe transparent opacity={0.22} />
                </mesh>
                <sprite scale={[data.radius * 4, data.radius * 4, data.radius * 4]}>
                  <spriteMaterial attach="material" map={planetGlowTex()}
                    color={0x00F5D4} transparent opacity={0.55}
                    blending={THREE.AdditiveBlending} depthWrite={false} />
                </sprite>
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

// ── Comet elliptical orbit trail ───────────────────────────────────────────────
// Traces the true Keplerian ellipse using the comet's sceneA/e/omega parameters.
function CometOrbitTrail({ comet, selected }) {
  const obj = useMemo(() => {
    const pts = [];
    // semi-latus rectum in scene units
    const lat = comet.sceneA * (1 - comet.e * comet.e);
    const omegaRad = comet.omega * Math.PI / 180;
    for (let i = 0; i <= 300; i++) {
      const nu = (i / 300) * Math.PI * 2;
      const denom = 1 + comet.e * Math.cos(nu);
      if (denom < 0.001) continue;
      const r = lat / denom;
      if (r <= 0 || r > 320) continue; // skip the invisible far end of high-e orbits
      pts.push(new THREE.Vector3(Math.cos(nu + omegaRad) * r, 0, Math.sin(nu + omegaRad) * r));
    }
    if (pts.length < 2) return null;
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color:       selected ? new THREE.Color(comet.color) : 0x3a6080,
        transparent: true,
        opacity:     selected ? 0.80 : 0.22,
      }),
    );
  }, [comet, selected]);
  return obj ? <primitive object={obj} /> : null;
}

// ── Comet nucleus + coma glow + anti-solar tail + orbit trail ─────────────────
// IMPORTANT: CometOrbitTrail is a sibling of the moving group (NOT a child),
// because its points are already in world space (centered on the Sun).
// Putting it inside the displaced group would shift the trail by the comet's position.
function Comet({ data, cometVirtualMsRef, onSelect, selected }) {
  const groupRef = useRef();
  const tailRef  = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const pos = cometPositionNow(data, new Date(cometVirtualMsRef.current));
    groupRef.current.position.set(pos.x, 0, pos.z);
    // Move tail sprite anti-solar (away from origin) in local space
    if (tailRef.current) {
      const len = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      const nx = len > 0 ? pos.x / len : 1;
      const nz = len > 0 ? pos.z / len : 0;
      tailRef.current.position.set(nx * 8, 0, nz * 8);
    }
  });

  return (
    <>
      {/* Orbit trail at scene root — world-space ellipse centered on Sun */}
      <CometOrbitTrail comet={data} selected={selected} />

      {/* Moving group: nucleus + coma + tail only */}
      <group ref={groupRef}>
        {/* Nucleus */}
        <mesh
          onClick={(e) => { e.stopPropagation(); onSelect(data); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          <sphereGeometry args={[1.4, 12, 12]} />
          <meshStandardMaterial color={data.color} emissive={new THREE.Color(data.color)}
            emissiveIntensity={2.0} roughness={0.25} />
        </mesh>

        {/* Coma — bright inner glow */}
        <sprite scale={[5.5, 5.5, 5.5]}>
          <spriteMaterial map={planetGlowTex()} color={new THREE.Color(data.color)}
            transparent opacity={0.60} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>

        {/* Ion tail — repositioned in useFrame to anti-solar direction */}
        <sprite ref={tailRef} scale={[5, 14, 1]}>
          <spriteMaterial map={planetGlowTex()} color={new THREE.Color(data.color)}
            transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      </group>
    </>
  );
}

// ── Asteroid belt ──────────────────────────────────────────────────────────────
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
      const b = 0.35 + t3 * 0.35;
      col[i*3] = b * 1.1; col[i*3+1] = b * 0.95; col[i*3+2] = b * 0.82;
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
        <pointsMaterial size={1.5} map={asteroidTex()} vertexColors
          transparent opacity={0.88} sizeAttenuation depthWrite={false} alphaTest={0.02} />
      </points>
    </group>
  );
}

// ── NEO markers (tiny glowing dots near Earth orbit) ──────────────────────────
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
      haz: neo.hazardous, neo,
    };
  }), [neos]);
  return items.map(({ key, pos, haz, neo }) => (
    <mesh key={key} position={pos}
      onClick={(e) => { e.stopPropagation(); onSelect({ name: neo.name, type: 'Near-Earth Object',
        desc: `Close approach: ${neo.closeApproachDate} · Miss dist: ${neo.missDistanceLunar} LD · Vel: ${neo.velocityKmS} km/s · Ø ${neo.diameterMinM}–${neo.diameterMaxM} m${neo.hazardous ? ' · ⚠ HAZARDOUS' : ''}` }); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[haz ? 0.20 : 0.13, 8, 8]} />
      <meshStandardMaterial color={haz ? 0xff2233 : 0xff8833}
        emissive={haz ? 0xff1122 : 0xff6611} emissiveIntensity={haz ? 1.5 : 0.9} roughness={0.3} />
    </mesh>
  ));
}

// ── Solar prominence — one animated flame spike ────────────────────────────────
function SolarProminence({ position, quaternion, height, width, speed, offset, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 0.15 + Math.abs(Math.sin(clock.elapsedTime * speed + offset)) * 0.85;
    ref.current.scale.y = s;
    ref.current.material.opacity = 0.10 + s * 0.48;
  });
  return (
    <mesh ref={ref} position={position} quaternion={quaternion}>
      <coneGeometry args={[width, height, 4, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0.45}
        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Sun with textured photosphere + prominence flames ─────────────────────────
const SUN_DATA = {
  key: 'sun', name: 'The Sun', type: 'G2V Yellow Dwarf', radius: 7,
  desc: 'Our star — a 4.6-billion-year-old ball of plasma fusing hydrogen to helium, generating all the light and heat that sustains life on Earth.',
};

function Sun({ onSelect }) {
  const coreRef  = useRef();
  const innerRef = useRef();
  const sunTex   = useMemo(() => sunSurfaceTex(), []);

  // Fibonacci sphere distribution — 26 prominences evenly spread over the surface
  const prominences = useMemo(() => {
    const COUNT = 26, SUN_R = 7;
    const phi   = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: COUNT }, (_, i) => {
      const y   = 1 - (i / (COUNT - 1)) * 2;
      const r   = Math.sqrt(Math.max(0, 1 - y * y));
      const dir = new THREE.Vector3(Math.cos(phi * i) * r, y, Math.sin(phi * i) * r).normalize();
      const h1  = Math.sin(i * 7.31 + 1.17) * 0.5 + 0.5;
      const h2  = Math.sin(i * 3.73 + 4.09) * 0.5 + 0.5;
      const h3  = Math.sin(i * 11.07 + 2.53) * 0.5 + 0.5;
      return {
        position:   dir.clone().multiplyScalar(SUN_R * 0.90).toArray(),
        quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir),
        height:     SUN_R * (0.28 + h1 * 0.72),
        width:      SUN_R * (0.028 + h2 * 0.038),
        speed:      0.30 + h3 * 1.05,
        offset:     i * 0.71,
        color:      h1 > 0.65 ? 0xff9900 : h1 > 0.35 ? 0xff4500 : 0xffcc00,
      };
    });
  }, []);

  useFrame(({ clock, delta }) => {
    if (coreRef.current)  coreRef.current.rotation.y += (delta || 0.016) * 0.04;
    if (innerRef.current) innerRef.current.scale.setScalar(
      22 * (1 + Math.sin(clock.elapsedTime * 0.85) * 0.022),
    );
  });

  return (
    <group>
      {/* Outer corona halo */}
      <sprite scale={[80, 80, 80]}>
        <spriteMaterial attach="material" map={sunOuterTex()} transparent opacity={0.20}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Mid corona */}
      <sprite scale={[46, 46, 46]}>
        <spriteMaterial attach="material" map={sunMidTex()} transparent opacity={0.36}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Inner corona — pulsates */}
      <sprite ref={innerRef} scale={[22, 22, 22]}>
        <spriteMaterial attach="material" map={sunInnerTex()} transparent opacity={0.72}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* Solar prominences / flame spikes */}
      {prominences.map((p, i) => <SolarProminence key={i} {...p} />)}

      {/* Photosphere core — real surface texture with limb darkening */}
      <mesh ref={coreRef}
        onClick={(e) => { e.stopPropagation(); onSelect(SUN_DATA); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[7, 64, 64]} />
        <meshStandardMaterial
          map={sunTex}
          emissiveMap={sunTex}
          emissive={new THREE.Color(0xff8800)}
          emissiveIntensity={1.6}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

// ── Full scene (must be inside Canvas) ────────────────────────────────────────
function SolarContent({ simRunning, timeWarp, selectedKey, onSelectBody, neos }) {
  // Start near Halley's 2061 perihelion so all comets are visibly active
  const cometMsRef   = useRef(new Date('2060-06-01').getTime());
  const lastFrameRef = useRef(null);
  const controlsRef  = useRef();
  const flyTarget    = useRef(null);
  const { camera }   = useThree();

  // Fly camera to selected body
  useEffect(() => {
    if (!selectedKey) return;
    if (selectedKey === 'sun') {
      flyTarget.current = {
        pos:  new THREE.Vector3(45, 28, 50),
        look: new THREE.Vector3(0, 0, 0),
      };
      return;
    }
    const planet = PLANETS.find((p) => p.key === selectedKey);
    if (planet) {
      const r    = planet.orbit;
      const pull = Math.max(planet.radius * 9, 18);
      flyTarget.current = {
        pos:  new THREE.Vector3(r + pull * 0.9, pull * 0.55, pull * 0.75),
        look: new THREE.Vector3(r, 0, 0),
      };
      return;
    }
    const comet = COMETS.find((c) => c.key === selectedKey);
    if (comet) {
      const pos  = cometPositionNow(comet, new Date(cometMsRef.current));
      const pull = 22;
      flyTarget.current = {
        pos:  new THREE.Vector3(pos.x + pull * 0.8, pull * 0.5, pos.z + pull * 0.8),
        look: new THREE.Vector3(pos.x, 0, pos.z),
      };
    }
  }, [selectedKey]);

  useFrame(() => {
    const now = performance.timeOrigin + performance.now();
    if (lastFrameRef.current === null) lastFrameRef.current = now;
    // COMET_K keeps comets on the same time-scale as planets: a comet with period P years
    // completes one orbit in P × VISUAL_YR screen-seconds, same as any planet.
    if (simRunning) cometMsRef.current += (now - lastFrameRef.current) * COMET_K * (timeWarp / 40);
    lastFrameRef.current = now;

    // Smooth camera fly-to
    if (flyTarget.current && controlsRef.current) {
      const ctrl = controlsRef.current;
      ctrl.enabled = false;
      camera.position.lerp(flyTarget.current.pos,  0.055);
      ctrl.target.lerp(flyTarget.current.look, 0.055);
      ctrl.update();
      if (camera.position.distanceTo(flyTarget.current.pos) < 1.2) {
        flyTarget.current = null;
        ctrl.enabled = true;
      }
    }
  });

  return (
    <>
      <color attach="background" args={['#020912']} />
      <fog attach="fog" args={['#010608', 280, 730]} />

      {/* High ambient so dark-sides of planets aren't pure black */}
      <ambientLight intensity={0.70} />
      {/* Hemisphere: deep-space blue sky / near-black ground */}
      <hemisphereLight args={[0x1840b0, 0x060818, 0.60]} />

      {/* Sun as primary directional source */}
      <pointLight position={[0,0,0]} intensity={6.0} color={0xfff0c8} distance={750} decay={0.95} />
      <pointLight position={[0,0,0]} intensity={2.5} color={0xff9900} distance={250} decay={1.8} />

      {/* Blue fill lights from all directions — illuminates planet dark-sides */}
      <pointLight position={[-300, 0,   0  ]} intensity={1.1} color={0x2244cc} distance={750} decay={0.9} />
      <pointLight position={[ 0,   0, -300 ]} intensity={0.9} color={0x2244bb} distance={750} decay={0.9} />
      <pointLight position={[ 200, 150,-200]} intensity={0.7} color={0x1133aa} distance={600} decay={1.0} />
      <pointLight position={[ 0,  -200, 200]} intensity={0.6} color={0x3355bb} distance={500} decay={1.0} />

      <Stars radius={600} depth={150} count={8000} factor={3.8} saturation={0.55} />

      <Sun onSelect={onSelectBody} />
      <AsteroidBelt />

      {PLANETS.map((p) => (
        <Planet key={p.key} data={p} simRunning={simRunning} timeWarp={timeWarp}
          onSelect={onSelectBody} selected={selectedKey === p.key} />
      ))}
      {COMETS.map((c) => (
        <Comet key={c.key} data={c} cometVirtualMsRef={cometMsRef}
          onSelect={onSelectBody} selected={selectedKey === c.key} />
      ))}
      {neos.length > 0 && <NeoOrbiters neos={neos} onSelect={onSelectBody} />}

      <OrbitControls ref={controlsRef} makeDefault minDistance={8} maxDistance={420} enableDamping dampingFactor={0.08} />
    </>
  );
}

// ── Quick-select pills ────────────────────────────────────────────────────────
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

export function SolarSystemScene({ simRunning, timeWarp, selectedBody, onSelectBody }) {
  const { data } = useJsonFetch('/neows.json');
  const neos  = data?.objects || [];
  const shown = neos.slice(0, 45);

  return (
    <div className="solar-canvas-wrap">
      <Canvas camera={{ position: [0, 80, 130], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}>
        <SolarContent simRunning={simRunning} timeWarp={timeWarp}
          selectedKey={selectedBody?.key} onSelectBody={onSelectBody} neos={shown} />
      </Canvas>
      {/* NEO HUD — absolute overlay, doesn't shrink the canvas */}
      <NeoPanel onSelect={onSelectBody} />
      <BodyPills selected={selectedBody} onSelect={onSelectBody} />
    </div>
  );
}
