import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Orbit ring (LineLoop)
function Ring({ r, opacity = 0.28, selected = false }) {
  const obj = (() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: selected ? 0x00F5D4 : 0x2a4060,
      transparent: true,
      opacity: selected ? 0.9 : opacity,
    });
    return new THREE.LineLoop(geo, mat);
  })();

  // Use useMemo pattern: ref won't change
  const ref = useRef(obj);
  return <primitive object={ref.current} />;
}

// Exoplanet orbiting the star
function ExoPlanet({ data, onSelect, selected }) {
  const pivotRef = useRef();

  useFrame((_, delta) => {
    if (pivotRef.current) {
      const speed = (2 * Math.PI) / (data.periodDays / 60);
      pivotRef.current.rotation.y += delta * speed;
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
          <sphereGeometry args={[data.radius, 32, 32]} />
          <meshStandardMaterial
            color={data.color}
            roughness={0.8}
            emissive={data.habitable ? 0x004422 : 0x000000}
            emissiveIntensity={data.habitable ? 0.3 : 0}
          />
          {selected && (
            <mesh scale={1.12}>
              <sphereGeometry args={[data.radius, 24, 24]} />
              <meshBasicMaterial color={0x00F5D4} wireframe transparent opacity={0.2} />
            </mesh>
          )}
        </mesh>
      </group>
    </>
  );
}

// The central star
function ExoStar({ system, onSelect }) {
  const meshRef = useRef();
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.06;
  });

  const r = (system.starRadius || 4) * 0.9;

  return (
    <mesh
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect({ key: system.key, name: system.name, type: system.spectral,
          distanceLy: system.distanceLy, spectral: system.spectral, desc: system.desc });
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <sphereGeometry args={[r, 32, 32]} />
      <meshStandardMaterial
        color={system.starColor || 0xfff0c0}
        emissive={system.starColor || 0xfff0c0}
        emissiveIntensity={0.9}
        roughness={1}
      />
    </mesh>
  );
}

// Habitable zone ring (green tinted)
function HabitableZone({ planets }) {
  const habs = planets.filter((p) => p.habitable);
  if (habs.length === 0) return null;
  const inner = Math.min(...habs.map((p) => p.sceneOrbit)) - 1.5;
  const outer = Math.max(...habs.map((p) => p.sceneOrbit)) + 1.5;

  const geo = new THREE.RingGeometry(inner, outer, 64);
  geo.rotateX(-Math.PI / 2);

  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={0x00aa44} transparent opacity={0.06} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Scene content
function ExoContent({ system, selectedKey, onSelectBody }) {
  const starColor = new THREE.Color(system.starColor || 0xfff0c0);
  const planets = system.planets || [];

  return (
    <>
      <color attach="background" args={['#030408']} />
      <fog attach="fog" args={['#030408', 200, 500]} />

      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 0]} intensity={3.0} color={starColor} distance={400} decay={1.3} />

      <Stars radius={500} depth={100} count={4000} factor={3} saturation={0.3} />

      <ExoStar system={system} onSelect={onSelectBody} />
      <HabitableZone planets={planets} />

      {planets.map((p) => (
        <ExoPlanet
          key={p.key}
          data={p}
          onSelect={onSelectBody}
          selected={selectedKey === p.key}
        />
      ))}

      <OrbitControls
        makeDefault
        minDistance={4}
        maxDistance={200}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

// Planet pills
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
        <button
          key={p.key}
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
        <ExoContent
          system={system}
          selectedKey={selectedBody?.key}
          onSelectBody={onSelectBody}
        />
      </Canvas>

      <ExoPills system={system} selected={selectedBody} onSelect={onSelectBody} />
    </div>
  );
}
