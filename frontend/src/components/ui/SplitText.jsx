import { motion } from 'framer-motion';

/**
 * SplitText — Animates each character of a string independently.
 * Creates a premium staggered letter reveal like high-end portfolio sites.
 *
 * Props:
 *   text      — string to animate
 *   className — CSS classes for the wrapper
 *   delay     — initial delay before animation starts
 *   stagger   — delay between each character (default 0.03s)
 *   as        — element type ('h1', 'h2', 'p', 'span' ...)
 */
export default function SplitText({
  text = '',
  className = '',
  delay = 0,
  stagger = 0.03,
  as: Tag = 'span',
}) {
  const chars = text.split('');

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const charVariant = {
    hidden: {
      opacity: 0,
      y: '110%',
      rotateZ: 6,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: '0%',
      rotateZ: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        stiffness: 320,
        damping: 22,
      },
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={`inline-flex flex-wrap overflow-hidden ${className}`}
      aria-label={text}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          variants={charVariant}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * RevealText — Clips text with a sliding overlay, like a curtain lifting.
 * Elegant single-line reveal animation.
 */
export function RevealText({ text, className = '', delay = 0, as: Tag = 'span' }) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 24,
          delay,
        }}
      >
        {text}
      </motion.span>
    </span>
  );
}
