import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './MagneticButton.css';

export function MagneticButton({ children, className = '', onClick, disabled, ...rest }) {
  const ref  = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 220, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 220, damping: 22 });

  const onMove = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left - rect.width  / 2) / rect.width  * 18);
    rawY.set((e.clientY - rect.top  - rect.height / 2) / rect.height * 10);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  const handleClick = (e) => {
    if (disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = 'btn-ripple';
    span.style.left = (e.clientX - rect.left) + 'px';
    span.style.top  = (e.clientY - rect.top)  + 'px';
    ref.current.appendChild(span);
    setTimeout(() => span.remove(), 700);
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      className={`magnetic-btn ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={handleClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {}  : { scale: 0.97 }}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
