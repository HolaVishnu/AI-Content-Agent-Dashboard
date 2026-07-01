import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useMousePosition } from '../../hooks/useMousePosition';

const STAR_COUNT = 2600;

// Per-star independent twinkle via a tiny custom shader, the same technique
// used by the Sol scene's starfield in the original app — each star's
// brightness oscillates on its own phase/speed instead of one global pulse.
const vertexShader = `
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uReduced;
  varying float vTwinkle;
  void main() {
    vTwinkle = uReduced > 0.5
      ? 0.7
      : 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * aSpeed + aPhase));
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
  varying float vTwinkle;
  void main() {
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(0.91, 0.91, 0.99, min(1.0, vTwinkle * core * 1.3));
  }
`;

function StarPoints({ reducedMotion }) {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const mouse = useMousePosition();

  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const phases = new Float32Array(STAR_COUNT);
    const speeds = new Float32Array(STAR_COUNT);
    const sizes = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 60 + Math.random() * 140;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi) - 80; // bias behind the camera's resting position
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.4 + Math.random() * 1.8;
      sizes[i] = 1.4 + Math.random() * 2.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  useFrame((state) => {
    if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (groupRef.current && !reducedMotion) {
      // subtle mouse parallax — drift the whole field a few degrees opposite
      // the cursor, lerped so it never feels twitchy
      const targetX = mouse.current.y * 0.06;
      const targetY = mouse.current.x * 0.06;
      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.02;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 }, uReduced: { value: reducedMotion ? 1 : 0 } }}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Fixed, full-viewport, non-interactive 3D starfield behind all page content
// — replaces the original 2D canvas starfield with real depth (z-variance +
// mouse parallax) per the brief's "depth using lighting/parallax" ask.
export function StarfieldBackground() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60, near: 0.1, far: 400 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <StarPoints reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
