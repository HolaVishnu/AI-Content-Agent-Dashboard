import { useEffect, useRef } from 'react';

// Tracks normalized mouse position (-1..1 on each axis, like NDC space) in a
// ref rather than state, so consumers (R3F useFrame loops, parallax effects)
// can read the latest value every frame without triggering React re-renders.
export function useMousePosition() {
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return pos;
}
