import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { AstronautSVG } from './AstronautSVG';
import { HeroScene } from './HeroScene';
import { HeroLightbox } from './HeroLightbox';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import './Hero.css';

export function Hero() {
  const eyebrowRef = useRef(null);
  const portraitRef = useRef(null);
  const nameRef    = useRef(null);
  const subRef     = useRef(null);
  const cueRef     = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const els = [eyebrowRef, portraitRef, nameRef, subRef, cueRef].map((r) => r.current);
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', clearProps: 'all' } });
    tl.from(els[0], { opacity: 0, y: 22, duration: 0.7, delay: 0.15 })
      .from(els[1], { opacity: 0, y: 28, duration: 0.85 }, '-=0.45')
      .from(els[2], { opacity: 0, y: 20, duration: 0.75 }, '-=0.5')
      .from(els[3], { opacity: 0, y: 16, duration: 0.7  }, '-=0.45')
      .from(els[4], { opacity: 0, y: 12, duration: 0.6  }, '-=0.35');
    return () => tl.kill();
  }, [reducedMotion]);

  const openLightbox  = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  return (
    <section className="hero-section">
      {/* 3D solar system scene — behind the text */}
      <div className="hero-scene" aria-hidden="true">
        <HeroScene />
      </div>

      <div className="hero-content">
        <div className="hero-eyebrow" ref={eyebrowRef}>
          ◈ Transmission From Low Earth Orbit
        </div>

        <div
          className="hero-portrait-wrap"
          ref={portraitRef}
          onClick={openLightbox}
          onKeyDown={(e) => e.key === 'Enter' && openLightbox()}
          role="button"
          tabIndex={0}
          aria-label="View creator dossier"
        >
          <div className="hero-portrait-ring" aria-hidden="true" />
          <div className="hero-portrait-ring r2" aria-hidden="true" />
          <div className="hero-portrait">
            <AstronautSVG />
          </div>
          <div className="hero-click-hint" aria-hidden="true">
            ⊕ click to expand dossier
          </div>
        </div>

        <h1 className="hero-name" ref={nameRef}>VPSPACEMAN</h1>

        <p className="hero-sub" ref={subRef}>
          Astro-traveler · Night-sky chaser · Documenting the cosmos from a motorbike seat across India's darkest skies.
        </p>

        <div className="scroll-cue" ref={cueRef} aria-hidden="true">
          <span>Scroll to explore</span>
          <div className="scroll-cue-line" />
        </div>
      </div>

      <HeroLightbox open={lightboxOpen} onClose={closeLightbox} />
    </section>
  );
}
