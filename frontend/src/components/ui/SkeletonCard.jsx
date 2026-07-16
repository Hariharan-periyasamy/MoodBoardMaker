import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, floatAnimation } from '../../utils/motionVariants';

export default function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm"
    >
      {/* Visual media bar wrapper */}
      <div className="bg-slate-200 dark:bg-slate-800 h-48 w-full relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      {/* Description text area */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: 0.1 }}
          />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear', delay: 0.2 }}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {Array.from({ length: count }).map((_, index) => (
        <motion.div key={index} variants={fadeUpItem}>
          <SkeletonCard />
        </motion.div>
      ))}
    </motion.div>
  );
}
