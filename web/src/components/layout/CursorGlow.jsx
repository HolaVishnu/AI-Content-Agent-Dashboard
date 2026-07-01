import { useEffect, useRef } from 'react';
import './CursorGlow.css';

// Ports the static site's #cursorGlow custom cursor. Uses event delegation
// on `document` (mouseover/mouseout + closest('a, button')) instead of the
// original's one-time querySelectorAll() — that ran once at page load, so
// any interactive element rendered later (agent cards, feed items, NEO
// list...) never got the hover effect. Delegation covers everything,
// present and future, with one pair of listeners.
export function CursorGlow() {
  const elRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return undefined; // skip on touch devices

    const el = elRef.current;
    const onMove = (e) => {
      el.style.left = e.clientX + 'px';
      el.style.top = e.clientY + 'px';
    };
    const onOver = (e) => {
      if (e.target.closest('a, button')) el.classList.add('hover');
    };
    const onOut = (e) => {
      if (e.target.closest('a, button')) el.classList.remove('hover');
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <div id="cursor-glow" ref={elRef} aria-hidden="true" />;
}
