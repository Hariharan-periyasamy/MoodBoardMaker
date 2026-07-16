import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { staggerContainer, sidebarNavItem } from '../../utils/motionVariants';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Archive, User, Settings,
  LogOut, Sparkles, ChevronRight, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#7C3AED' },
  { to: '/boards', icon: Layers, label: 'My Boards', color: '#2563EB' },
  { to: '/boards?archived=true', icon: Archive, label: 'Archived', color: '#059669' },
  { to: '/activity', icon: Activity, label: 'Activity Log', color: '#0891B2' },
  { to: '/profile', icon: User, label: 'Profile', color: '#DB2777' },
  { to: '/settings', icon: Settings, label: 'Settings', color: '#D97706' },
];

// Spotlight cursor follower inside the sidebar
function NavItemSpotlight({ color, children, className, ...rest }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 24 });
  const springY = useSpring(y, { stiffness: 300, damping: 24 });

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
      {...rest}
    >
      {/* Spotlight */}
      <motion.div
        className="absolute w-24 h-24 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 -translate-x-1/2 -translate-y-1/2"
        style={{ left: springX, top: springY, background: `radial-gradient(circle, ${color}25 0%, transparent 70%)` }}
      />
      {children}
    </motion.div>
  );
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="h-screen flex flex-col fixed left-0 top-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        {/* Morphing glow logo */}
        <motion.div
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0 relative"
          style={{ boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}
          animate={{ boxShadow: ['0 0 16px rgba(124,58,237,0.4)', '0 0 28px rgba(168,85,247,0.6)', '0 0 16px rgba(124,58,237,0.4)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -14, filter: 'blur(4px)' }}
              transition={{ duration: 0.22 }}
              className="font-bold text-lg text-gradient whitespace-nowrap"
            >
              MoodBoard
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.12, backgroundColor: 'rgba(124,58,237,0.08)' }}
          whileTap={{ scale: 0.88 }}
          onClick={onToggle}
          className="ml-auto btn p-1 rounded-lg text-slate-400 flex-shrink-0 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-0.5"
        >
          {NAV_ITEMS.map(({ to, icon: Icon, label, color }, index) => {
            const isArchive = to.includes('archived');
            const isActive = isArchive
              ? location.search.includes('archived')
              : location.pathname === to;

            return (
              <motion.div
                key={label}
                variants={sidebarNavItem}
                custom={index}
              >
                <NavItemSpotlight color={color} className="rounded-xl group">
                  <NavLink
                    to={to}
                    end={to === '/dashboard'}
                    title={collapsed ? label : undefined}
                  >
                    {() => (
                      <motion.div
                        whileHover={{ x: collapsed ? 0 : 4 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors relative ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        } ${collapsed ? 'justify-center' : ''}`}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavBar"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                            style={{ backgroundColor: color }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}

                        <motion.div
                          animate={isActive ? { color, scale: [1, 1.2, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                        </motion.div>

                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              key={`label-${label}`}
                              initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                              exit={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                              transition={{ duration: 0.18 }}
                              className="whitespace-nowrap text-sm"
                            >
                              {label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </NavLink>
                </NavItemSpotlight>
              </motion.div>
            );
          })}
        </motion.div>
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="user-full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.15, color: '#ef4444', rotate: 12 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleLogout}
                className="btn p-1.5 rounded-lg text-slate-400"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="user-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.12, color: '#ef4444' }}
              whileTap={{ scale: 0.88 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
