import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * use3DTilt
 * Returns motion values for rotateX, rotateY, and a highlight position
 * so you can create a realistic 3D card tilt that follows the cursor.
 *
 * Usage:
 *   const { ref, rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave } = use3DTilt();
 *   <motion.div style={{ rotateX, rotateY, transformPerspective: 1200 }} ... />
 */
export function use3DTilt(maxTilt = 14) {
  const ref = useRef(null);

  const rawRX = useMotionValue(0);
  const rawRY = useMotionValue(0);
  const rawGX = useMotionValue(50);
  const rawGY = useMotionValue(50);

  const rotateX = useSpring(rawRX, { stiffness: 280, damping: 26, mass: 0.6 });
  const rotateY = useSpring(rawRY, { stiffness: 280, damping: 26, mass: 0.6 });
  const glareX = useSpring(rawGX, { stiffness: 200, damping: 22 });
  const glareY = useSpring(rawGY, { stiffness: 200, damping: 22 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;   // 0–1
    const yPct = (e.clientY - rect.top)  / rect.height;  // 0–1

    rawRY.set((xPct - 0.5) * maxTilt * 2);
    rawRX.set((0.5 - yPct) * maxTilt * 2);
    rawGX.set(xPct * 100);
    rawGY.set(yPct * 100);
  }, [rawRX, rawRY, rawGX, rawGY, maxTilt]);

  const handleMouseLeave = useCallback(() => {
    rawRX.set(0);
    rawRY.set(0);
    rawGX.set(50);
    rawGY.set(50);
  }, [rawRX, rawRY, rawGX, rawGY]);

  return {
    ref,
    rotateX,
    rotateY,
    glareX,
    glareY,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
