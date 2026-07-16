import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * SlotCounter — Numbers spin like a slot machine and land on the final value.
 * Premium stat display — used on Dashboard/Profile stats.
 *
 * Props:
 *   value     — target number to count to
 *   duration  — total animation duration in seconds (default 1.2)
 *   delay     — start delay (default 0)
 */
export default function SlotCounter({ value, duration = 1.2, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const numericValue = typeof value === 'number' ? value : parseInt(value, 10);
  const isValid = !isNaN(numericValue);

  useEffect(() => {
    if (!isInView || !isValid) return;

    const delayTimer = setTimeout(() => {
      setIsSpinning(true);
      const startTime = performance.now();
      const startValue = 0;
      const endValue = numericValue;

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

      const tick = (now) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = Math.round(startValue + (endValue - startValue) * eased);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          setDisplayValue(endValue);
          setIsSpinning(false);
        }
      };

      requestAnimationFrame(tick);
    }, delay * 1000);

    return () => clearTimeout(delayTimer);
  }, [isInView, numericValue, duration, delay, isValid]);

  if (!isValid) return <span>{value}</span>;

  return (
    <span ref={ref} className="inline-block tabular-nums">
      {displayValue}
    </span>
  );
}

/**
 * TickerDigit — Individual digit that spins vertically like a slot reel.
 * More theatrical; used for single-digit-precision displays.
 */
export function TickerDigit({ digit }) {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const targetIndex = digits.indexOf(String(digit));

  return (
    <div className="relative overflow-hidden inline-block" style={{ height: '1.2em', lineHeight: '1.2em' }}>
      <motion.div
        animate={{ y: `-${targetIndex * 100}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: Math.random() * 0.2 }}
        className="flex flex-col"
      >
        {digits.map((d) => (
          <span key={d} className="block" style={{ height: '1.2em', lineHeight: '1.2em' }}>
            {d}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
