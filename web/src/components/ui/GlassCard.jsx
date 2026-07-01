import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import './GlassCard.css';

export function GlassCard({ children, className = '', style, onClick }) {
  const ref = useRef(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [7, -7]), { stiffness: 380, damping: 40 });
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-7, 7]),  { stiffness: 380, damping: 40 });

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <motion.div
      ref={ref}
      className={`glass-card ${className}`}
      style={{ rotateX, rotateY, perspective: 1000, ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
