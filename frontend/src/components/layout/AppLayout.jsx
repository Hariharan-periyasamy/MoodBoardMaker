import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Clip-path wipe page transition:
 * Pages reveal via an expanding diagonal clip-path (top-left → bottom-right)
 * and collapse back out in the opposite direction.
 *
 * This is a much more premium and unique animation compared to standard
 * fade/slide — used by Framer, Linear, and Arc Browser.
 */
const pageVariants = {
  initial: {
    opacity: 0,
    clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: [0.16, 1, 0.3, 1],
      clipPath: { duration: 0.44, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    opacity: 0,
    clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
    filter: 'blur(4px)',
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <Navbar sidebarCollapsed={collapsed} />
      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 256 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="pt-16"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-6"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
}
