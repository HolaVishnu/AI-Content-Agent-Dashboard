import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useMousePosition } from '../../hooks/useMousePosition';

const PLANETS = [
  { radius: 3.0,  tilt:  0.21, color: '#4d96ff', size: 0.22, period: 4.5  },
  { radius: 4.6,  tilt: -0.31, color: '#d1542e', size: 0.18, period: 7.2  },
  { radius: 6.2,  tilt:  0.14, color: '#ead6a8', size: 0.30, period: 11.5, ring: true },
];

function OrbitingPlanet({ planet, reducedMotion }) {
  const pivotRef = useRef(null);

  useFrame(({ clock }) => {
    if (!pivotRef.current || reducedMotion) return;
    pivotRef.current.rotation.y = (clock.elapsedTime / planet.period) * Math.PI * 2;
  });

  return (
    <group rotation={[planet.tilt, 0, 0]}>
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.radius - 0.012, planet.radius + 0.012, 96]} />
        <meshBasicMaterial color="#7b6fff" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Pivot group — rotates around Y to orbit */}
      <group ref={pivotRef}>
        <mesh position={[planet.radius, 0, 0]}>
          <sphereGeometry args={[planet.size, 28, 28]} />
          <meshStandardMaterial
            color={planet.color}
            roughness={0.72}
            metalness={0.04}
            emissive={planet.color}
            emissiveIntensity={0.1}
          />
        </mesh>
        {planet.ring && (
          <mesh position={[planet.radius, 0, 0]} rotation={[Math.PI * 0.45, 0.3, 0]}>
            <ringGeometry args={[planet.size + 0.13, planet.size + 0.48, 40]} />
            <meshBasicMaterial color="#C9B98A" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function SolarSystem({ reducedMotion }) {
  return (
    <Float floatIntensity={0.35} speed={1.1} rotationIntensity={0.1}>
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[0.58, 40, 40]} />
        <meshStandardMaterial color="#ffcf3f" emissive="#ff8c1a" emissiveIntensity={2.6} roughness={0.15} />
      </mesh>
      {/* Sun glow light */}
      <pointLight color="#ffe4a0" intensity={5} distance={22} decay={2} />

      {PLANETS.map((p, i) => (
        <OrbitingPlanet key={i} planet={p} reducedMotion={reducedMotion} />
      ))}
    </Float>
  );
}

function SceneContent({ reducedMotion }) {
  const groupRef = useRef(null);
  const mouse = useMousePosition();

  useFrame(() => {
    if (!groupRef.current || reducedMotion) return;
    groupRef.current.rotation.x += (-mouse.current.y * 0.10 - groupRef.current.rotation.x) * 0.025;
    groupRef.current.rotation.y += ( mouse.current.x * 0.12 - groupRef.current.rotation.y) * 0.025;
  });

  return (
    <>
      <ambientLight intensity={0.14} color="#3a2870" />
      <pointLight position={[-6, 5, 4]} color="#00aaff" intensity={2.2} distance={35} decay={2} />
      <group ref={groupRef}>
        <SolarSystem reducedMotion={reducedMotion} />
        {/* Purple nebula sparkles for depth */}
        <Sparkles
          count={100}
          scale={[20, 14, 10]}
          size={1.4}
          speed={0.25}
          opacity={0.55}
          color="#9b6fff"
          noise={0.3}
        />
      </group>
    </>
  );
}

export function HeroScene() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 2.5, 11], fov: 52, near: 0.1, far: 200 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <SceneContent reducedMotion={reducedMotion} />
    </Canvas>
  );
}
