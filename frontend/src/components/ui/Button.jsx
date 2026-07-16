import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';
import { useMagneticEffect } from '../../hooks/useMagneticEffect';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const sizeMap = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

const variantMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  magnetic = true,
  className = '',
  ...props
}) {
  const { ref, x, y, onMouseMove, onMouseLeave } = useMagneticEffect(0.3, 70);

  // Ripple effect state
  const [ripples, setRipples] = useState([]);

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: rx, y: ry }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    if (props.onClick) props.onClick(e);
  }, [props.onClick]);

  const isPrimary = variant === 'primary';

  return (
    <motion.button
      ref={ref}
      style={magnetic ? { x, y } : {}}
      onMouseMove={magnetic ? onMouseMove : undefined}
      onMouseLeave={magnetic ? onMouseLeave : undefined}
      whileHover={{
        scale: 1.04,
        ...(isPrimary && { boxShadow: '0 0 32px -4px rgba(124,58,237,0.55)' }),
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={cn('btn relative overflow-hidden', variantMap[variant], sizeMap[size], className)}
      disabled={loading || props.disabled}
      {...props}
      onClick={handleClick}
    >
      {/* Ripple effect */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
          initial={{ width: 0, height: 0, opacity: 0.7 }}
          animate={{ width: 160, height: 160, opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
      ))}

      {/* Shimmer sweep on primary buttons */}
      {isPrimary && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          initial={false}
          whileHover={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)' }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
