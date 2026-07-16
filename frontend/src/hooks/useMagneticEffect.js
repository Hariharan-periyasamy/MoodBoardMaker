import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

/**
 * useMagneticEffect
 * Makes an element elastically attract toward the cursor when nearby.
 * Returns { ref, x, y, handlers } — spread handlers on the motion element.
 */
export function useMagneticEffect(strength = 0.4, radius = 80) {
  const ref = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness: 200, damping: 18, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 200, damping: 18, mass: 0.5 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < radius) {
      const pull = (1 - dist / radius) * strength;
      rawX.set(dx * pull);
      rawY.set(dy * pull);
    }
  }, [rawX, rawY, strength, radius]);

  const handleMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, x, y, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
