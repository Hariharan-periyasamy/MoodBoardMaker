import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';

export default function Navbar({ sidebarCollapsed }) {
  const { isDark, toggle } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.header
      animate={{ left: sidebarCollapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className={`
        fixed top-0 right-0 z-30
        h-16 flex items-center gap-4 px-6
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-b border-slate-200/70 dark:border-slate-800/70
      `}
    >
      {/* Global Search bar */}
      <GlobalSearch />

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Sun className="w-5 h-5 text-amber-400" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Live notification bell */}
        <NotificationBell />

        {/* Avatar + profile nav */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 ml-1 rounded-xl p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="View profile"
        >
          <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
        </motion.button>
      </div>
    </motion.header>
  );
}
