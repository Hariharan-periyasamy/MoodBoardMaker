import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ParticleField — Renders n animated floating dots that drift and pulse.
 * Used on empty states and hero sections for a premium ambient feel.
 * Fully CSS/canvas-free — uses tiny motion divs.
 *
 * Props:
 *   count     — number of particles (default 18)
 *   color     — base color class or hex (default uses purple palette)
 *   className — wrapper class
 */
export default function ParticleField({ count = 18, className = '' }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,      // % across container
    y: Math.random() * 100,
    size: 2 + Math.random() * 4, // px
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    drift: (Math.random() - 0.5) * 30,
    opacity: 0.15 + Math.random() * 0.35,
  }));

  const colors = [
    'rgba(139,92,246,VAL)',   // violet
    'rgba(99,102,241,VAL)',   // indigo
    'rgba(59,130,246,VAL)',   // blue
    'rgba(168,85,247,VAL)',   // purple
    'rgba(236,72,153,VAL)',   // pink
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {particles.map((p) => {
        const baseColor = colors[p.id % colors.length].replace('VAL', p.opacity.toFixed(2));
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: baseColor,
            }}
            animate={{
              y: [0, p.drift, 0, -p.drift * 0.7, 0],
              x: [0, p.drift * 0.4, -p.drift * 0.3, 0],
              opacity: [p.opacity, p.opacity * 0.4, p.opacity, p.opacity * 0.6, p.opacity],
              scale: [1, 1.6, 0.8, 1.2, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * OrbitRing — Decorative animated ring of dots orbiting a center point.
 * Use as a background element for hero/empty state containers.
 */
export function OrbitRing({ radius = 60, dotCount = 8, color = 'rgba(139,92,246,0.3)', duration = 8 }) {
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    id: i,
    angle: (360 / dotCount) * i,
    size: 3 + (i % 3),
  }));

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ width: radius * 2, height: radius * 2 }}
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      {dots.map((dot) => {
        const rad = (dot.angle * Math.PI) / 180;
        const x = radius + Math.cos(rad) * radius - dot.size / 2;
        const y = radius + Math.sin(rad) * radius - dot.size / 2;
        return (
          <motion.div
            key={dot.id}
            className="absolute rounded-full"
            style={{ left: x, top: y, width: dot.size, height: dot.size, backgroundColor: color }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: dot.id * (2 / dotCount), ease: 'easeInOut' }}
          />
        );
      })}
    </motion.div>
  );
}
