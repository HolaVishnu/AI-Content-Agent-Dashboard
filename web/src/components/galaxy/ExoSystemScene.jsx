import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// ── Shared texture cache ──────────────────────────────────────────────────────
const _tex = {};
const tc = (key, make) => _tex[key] || (_tex[key] = make());

// White radial gradient circle — tinted via spriteMaterial.color per star
const glowCircleTex = () => tc('gc', () => {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.92)');
  g.addColorStop(0.46, 'rgba(255,255,255,0.50)');
  g.addColorStop(0.74, 'rgba(255,255,255,0.08)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
});

// ── Spectral class → visual properties ───────────────────────────────────────
function spectralProps(spectral = '') {
  const ch = (spectral.trim()[0] || 'G').toUpperCase();
  switch (ch) {
    case 'O': return { core:'#b0c8ff', mid:'#8aa8ff', rim:'#3050cc',
                       emissive:0x90b8ff, light:0xaac4ff, intensity:6.5 };
    case 'B': return { core:'#d0e4ff', mid:'#a8c4ff', rim:'#5070e0',
                       emissive:0xb8d0ff, light:0xd0e8ff, intensity:5.5 };
    case 'A': return { core:'#f0f5ff', mid:'#c4d8ff', rim:'#7888ee',
                       emissive:0xd8e8ff, light:0xe8f2ff, intensity:4.5 };
    case 'F': return { core:'#fffef0', mid:'#e0ecff', rim:'#9aacf0',
                       emissive:0xe8f0ff, light:0xf4f8ff, intensity:4.0 };
    case 'K': return { core:'#ffdda0', mid:'#ff9a30', rim:'#c03800',
                       emissive:0xffb050, light:0xffcc80, intensity:3.2 };
    case 'M': return { core:'#ff9060', mid:'#e04010', rim:'#7a0c00',
                       emissive:0xff5030, light:0xff7850, intensity:2.5 };
    default:  return { core:'#fffde4', mid:'#ffbc30', rim:'#bb2400',  // G
                       emissive:0xffaa20, light:0xfff0c0, intensity:3.5 };
  }
}

// ── Star billboard texture: circular clip + limb-darkening + granulation ──────
// Drawn as a clipped circle (not a full-rect) so corners are alpha=0.
// Used on a Sprite so it always faces the camera — no sphere = no black edge.
function makeStarSurfTex(cacheKey, props) {
  return tc(`surf4-${cacheKey}`, () => {
    const S = 512, c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    // Clip to circle so outside is fully transparent
    ctx.beginPath();
    ctx.arc(S/2, S/2, S/2, 0, Math.PI * 2);
    ctx.clip();
    // Limb-darkening radial gradient
    const bg = ctx.createRadialGradient(S/2, S/2, 0, S/2, S/2, S/2);
    bg.addColorStop(0.00, props.core);
    bg.addColorStop(0.20, props.core);
    bg.addColorStop(0.52, props.mid);
    bg.addColorStop(0.80, props.rim);
    bg.addColorStop(0.93, props.rim);
    bg.addColorStop(1.00, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, S, S);
    // Granulation convection cells (deterministic sin-based pseudo-random)
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 480; i++) {
      const h1 = Math.sin(i*7.31+1.17)*0.5+0.5;
      const h2 = Math.sin(i*3.73+4.09)*0.5+0.5;
      const h3 = Math.sin(i*11.07+2.53)*0.5+0.5;
      const h4 = Math.sin(i*5.91+7.83)*0.5+0.5;
      const x = h1*S, y = h2*S;
      const dx = x-S/2, dy = y-S/2;
      if (Math.sqrt(dx*dx+dy*dy)/(S/2) > 0.88) continue;
      const r = 5+h3*18, alpha = 0.10+h3*0.20;
      const g2 = ctx.createRadialGradient(x,y,0,x,y,r);
      if (h4 > 0.40) {
        g2.addColorStop(0, `rgba(255,255,230,${alpha})`);
        g2.addColorStop(1, 'rgba(0,0,0,0)');
      } else {
        g2.addColorStop(0, `rgba(60,0,0,${alpha*0.65})`);
        g2.addColorStop(1, 'rgba(0,0,0,0)');
      }
      ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    return new THREE.CanvasTexture(c);
  });
}

// ── One animated prominence flame spike ───────────────────────────────────────
function StarProminence({ position, quaternion, height, width, speed, offset, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 0.12 + Math.abs(Math.sin(clock.elapsedTime * speed + offset)) * 0.88;
    ref.current.scale.y = s;
    ref.current.material.opacity = 0.08 + s * 0.44;
  });
  return (
    <mesh ref={ref} position={position} quaternion={quaternion}>
      <coneGeometry args={[width, height, 4, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0.40}
        blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── Central star: pure sprite-based (no sphere mesh = no black edge) ──────────
function ExoStar({ system, onSelect }) {
  const pulsRef = useRef();

  const props   = useMemo(() => spectralProps(system.spectral), [system.spectral]);
  const starR   = (system.starRadius || 4) * 0.9;
  const circTex = glowCircleTex();
  // Surface texture is a circular-clipped billboard — alpha=0 outside the disc
  const surfTex = useMemo(() => makeStarSurfTex(system.key, props), [system.key, props]);

  const prominences = useMemo(() => {
    const COUNT = 18, phi = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: COUNT }, (_, i) => {
      const y   = 1 - (i / (COUNT - 1)) * 2;
      const r   = Math.sqrt(Math.max(0, 1 - y * y));
      const dir = new THREE.Vector3(Math.cos(phi*i)*r, y, Math.sin(phi*i)*r).normalize();
      const h1  = Math.sin(i*7.31+1.17)*0.5+0.5;
      const h2  = Math.sin(i*3.73+4.09)*0.5+0.5;
      const h3  = Math.sin(i*11.07+2.53)*0.5+0.5;
      return {
        position:   dir.clone().multiplyScalar(starR * 0.90).toArray(),
        quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir),
        height:     starR * (0.28 + h1 * 0.65),
        width:      starR * (0.028 + h2 * 0.036),
        speed:      0.28 + h3 * 1.05,
        offset:     i * 0.71,
        color:      props.emissive,
      };
    });
  }, [system.key, starR, props.emissive]);

  useFrame(({ clock }) => {
    if (pulsRef.current) pulsRef.current.scale.setScalar(
      starR * 3.2 * (1 + Math.sin(clock.elapsedTime * 0.9) * 0.024),
    );
  });

  return (
    <group
      onClick={(e) => { e.stopPropagation(); onSelect({
        key: system.key, name: system.name, type: system.spectral,
        distanceLy: system.distanceLy, spectral: system.spectral, desc: system.desc,
      }); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Outer corona halo */}
      <sprite scale={[starR * 11, starR * 11, 1]}>
        <spriteMaterial map={circTex} color={props.emissive} transparent opacity={0.16}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Mid corona */}
      <sprite scale={[starR * 6.5, starR * 6.5, 1]}>
        <spriteMaterial map={circTex} color={props.emissive} transparent opacity={0.30}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* Photosphere — billboard sprite, never shows a black ring */}
      <sprite scale={[starR * 2.1, starR * 2.1, 1]}>
        <spriteMaterial map={surfTex} transparent opacity={0.98} depthWrite={false} />
      </sprite>
      {/* Inner corona pulsates */}
      <sprite ref={pulsRef} scale={[starR * 3.2, starR * 3.2, 1]}>
        <spriteMaterial map={circTex} color={props.light} transparent opacity={0.65}
          blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>

      {/* Prominence flames */}
      {prominences.map((p, i) => <StarProminence key={i} {...p} />)}

      {/* Invisible sphere — click/hover target only, zero visual contribution */}
      <mesh>
        <sphereGeometry args={[starR, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Orbit color by distance — matches the Solar System palette
function exoOrbitColor(r) {
  if (r <= 10) return 0x4488dd;   // close-in — blue
  if (r <= 18) return 0xaa8844;   // mid — warm gold
  return 0x44aacc;                 // outer — teal
}

// ── Orbit ring ─────────────────────────────────────────────────────────────────
function Ring({ r, selected = false }) {
  const obj = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    return new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({
        color:       selected ? 0x00F5D4 : exoOrbitColor(r),
        transparent: true,
        opacity:     selected ? 0.88 : 0.38,
      }),
    );
  }, [r, selected]);
  return <primitive object={obj} />;
}

// ── Exoplanet ──────────────────────────────────────────────────────────────────
function ExoPlanet({ data, onSelect, selected }) {
  const pivotRef = useRef();
  useFrame((_, delta) => {
    if (pivotRef.current) {
      // 0.25 real days per screen second — keeps fast hot-Jupiters visible but not a blur
      pivotRef.current.rotation.y += delta * (2 * Math.PI * 0.25) / data.periodDays;
    }
  });

  return (
    <>
      <Ring r={data.sceneOrbit} selected={selected} />
      <group ref={pivotRef}>
        <mesh
          position={[data.sceneOrbit, 0, 0]}
          onClick={(e) => { e.stopPropagation(); onSelect(data); }}
          onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'default'; }}
        >
          <sphereGeometry args={[data.radius, 36, 36]} />
          <meshStandardMaterial
            color={data.color}
            roughness={0.75}
            emissive={data.habitable ? 0x003322 : new THREE.Color(data.color).multiplyScalar(0.08)}
            emissiveIntensity={data.habitable ? 0.35 : 0.12}
          />
          {selected && (
            <mesh scale={1.14}>
              <sphereGeometry args={[data.radius, 24, 24]} />
              <meshBasicMaterial color={0x00F5D4} wireframe transparent opacity={0.22} />
            </mesh>
          )}
          {/* Planet glow sprite */}
          <sprite scale={[data.radius * 3.5, data.radius * 3.5, 1]}>
            <spriteMaterial map={glowCircleTex()}
              color={data.habitable ? 0x44ffaa : new THREE.Color(data.color)}
              transparent opacity={data.habitable ? 0.18 : 0.10}
              blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        </mesh>
      </group>
    </>
  );
}

// ── Habitable zone — thin boundary lines, not a green-filled disk ─────────────
function HabitableZone({ planets }) {
  const habs = planets.filter((p) => p.habitable);
  if (habs.length === 0) return null;
  const inner = Math.min(...habs.map((p) => p.sceneOrbit)) - 1.0;
  const outer = Math.max(...habs.map((p) => p.sceneOrbit)) + 1.0;

  const innerLine = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * inner, 0, Math.sin(a) * inner));
    }
    return new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x00cc55, transparent: true, opacity: 0.30 }),
    );
  }, [inner]);

  const outerLine = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * outer, 0, Math.sin(a) * outer));
    }
    return new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x00cc55, transparent: true, opacity: 0.18 }),
    );
  }, [outer]);

  const fillGeo = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 64);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [inner, outer]);

  return (
    <>
      {/* Very faint fill so you can tell the zone apart from empty space */}
      <mesh geometry={fillGeo}>
        <meshBasicMaterial color={0x00cc44} transparent opacity={0.018} side={THREE.DoubleSide} />
      </mesh>
      <primitive object={innerLine} />
      <primitive object={outerLine} />
    </>
  );
}

// ── Full scene ────────────────────────────────────────────────────────────────
function ExoContent({ system, selectedKey, onSelectBody }) {
  const props   = useMemo(() => spectralProps(system.spectral), [system.spectral]);
  const lightCol = useMemo(() => new THREE.Color(props.light), [props.light]);
  const planets  = system.planets || [];

  return (
    <>
      <color attach="background" args={['#030408']} />
      <fog attach="fog" args={['#030408', 200, 500]} />

      <ambientLight intensity={0.06} />
      {/* Primary star light */}
      <pointLight position={[0,0,0]} intensity={props.intensity}       color={lightCol} distance={450} decay={1.1} />
      {/* Secondary fill — softer inner glow */}
      <pointLight position={[0,0,0]} intensity={props.intensity * 0.4} color={lightCol} distance={100} decay={2.0} />

      <Stars radius={500} depth={100} count={4500} factor={3.2} saturation={0.35} />

      <ExoStar system={system} onSelect={onSelectBody} />
      <HabitableZone planets={planets} />

      {planets.map((p) => (
        <ExoPlanet key={p.key} data={p} onSelect={onSelectBody} selected={selectedKey === p.key} />
      ))}

      <OrbitControls makeDefault minDistance={3} maxDistance={200} enableDamping dampingFactor={0.08} />
    </>
  );
}

// ── Planet pills ───────────────────────────────────────────────────────────────
function ExoPills({ system, selected, onSelect }) {
  const planets = system.planets || [];
  return (
    <div className="body-pills">
      <button
        className={`body-pill sun-pill${selected?.key === system.key ? ' active' : ''}`}
        onClick={() => onSelect({ key: system.key, name: system.name, type: system.spectral,
          distanceLy: system.distanceLy, spectral: system.spectral, desc: system.desc })}
      >
        ⭐ {system.name}
      </button>
      {planets.map((p) => (
        <button key={p.key}
          className={`body-pill${selected?.key === p.key ? ' active' : ''}${p.habitable ? ' habitable' : ''}`}
          onClick={() => onSelect(p)}
        >
          {p.habitable ? '🌍' : '🪐'} {p.name}
        </button>
      ))}
    </div>
  );
}

export function ExoSystemScene({ system, selectedBody, onSelectBody }) {
  const cameraDistance = (system.planets?.length || 1) > 3 ? 90 : 60;
  return (
    <div className="solar-canvas-wrap">
      <Canvas
        camera={{ position: [0, cameraDistance * 0.7, cameraDistance], fov: 52 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ExoContent system={system} selectedKey={selectedBody?.key} onSelectBody={onSelectBody} />
      </Canvas>
      <ExoPills system={system} selected={selectedBody} onSelect={onSelectBody} />
    </div>
  );
}
