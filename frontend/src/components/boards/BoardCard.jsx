import { motion, AnimatePresence, useMotionTemplate } from 'framer-motion';
import { dropdownVariants } from '../../utils/motionVariants';
import { use3DTilt } from '../../hooks/use3DTilt';
import { format } from '../../utils/dateUtils';
import { Globe, Lock, Archive, MoreVertical, Edit2, Trash2, ArchiveRestore } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BoardCard({ board, onEdit, onDelete, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const { ref, rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave } = use3DTilt(10);

  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (e) => {
    if (menuRef.current && menuRef.current.contains(e.target)) return;
    navigate(`/boards/${board._id}`);
  };

  const gradients = {
    '#7C3AED': 'from-violet-500 via-purple-600 to-indigo-700',
    '#2563EB': 'from-blue-400 via-blue-600 to-indigo-700',
    '#059669': 'from-emerald-400 via-teal-500 to-cyan-700',
    '#D97706': 'from-amber-400 via-orange-500 to-red-500',
    '#DC2626': 'from-red-400 via-rose-600 to-pink-700',
    '#DB2777': 'from-pink-400 via-fuchsia-600 to-purple-700',
    '#0891B2': 'from-cyan-400 via-sky-600 to-blue-700',
    '#65A30D': 'from-lime-400 via-green-500 to-teal-700',
  };

  const gradient = gradients[board.themeColor] || 'from-violet-500 via-purple-600 to-indigo-700';

  return (
    <motion.div
      ref={ref}
      onClick={handleCardClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ z: 20 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="card group cursor-pointer overflow-hidden border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-2xl transition-[border-color,shadow] relative"
    >
      {/* 3D glare overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glareBackground }}
      />

      {/* Cover */}
      <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {/* Animated mesh gradient shimmer */}
        <motion.div
          className="absolute inset-0 opacity-40"
          animate={{
            background: [
              `radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
              `radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
              `radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
        {board.isArchived && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-archived">
              <Archive className="w-3 h-3" /> Archived
            </span>
          </div>
        )}
        {/* Menu */}
        <div ref={menuRef} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.15, rotate: 90 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="w-7 h-7 rounded-lg bg-black/25 hover:bg-black/45 flex items-center justify-center text-white backdrop-blur-sm"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-9 w-44 card shadow-xl z-10 py-1"
              >
                {[
                  { label: 'Edit Board', icon: Edit2, action: () => { setMenuOpen(false); onEdit(board); } },
                  { label: board.isArchived ? 'Unarchive' : 'Archive', icon: board.isArchived ? ArchiveRestore : Archive, action: () => { setMenuOpen(false); onArchive(board); } },
                ].map(({ label, icon: Icon, action }) => (
                  <motion.button key={label} whileHover={{ x: 5, backgroundColor: 'rgba(124,58,237,0.06)' }} onClick={(e) => { e.stopPropagation(); action(); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 transition-colors">
                    <Icon className="w-4 h-4" /> {label}
                  </motion.button>
                ))}
                <hr className="my-1 border-slate-200 dark:border-slate-700" />
                <motion.button whileHover={{ x: 5 }} onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(board); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete Board
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content — lifted in 3D */}
      <div className="p-4" style={{ transform: 'translateZ(8px)' }}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {board.title}
          </h3>
          <span className={`badge flex-shrink-0 ${board.visibility === 'public' ? 'badge-public' : 'badge-private'}`}>
            {board.visibility === 'public' ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
          </span>
        </div>

        {board.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{board.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Updated {format(board.updatedAt)}</span>
          <motion.div
            whileHover={{ scale: 1.6, boxShadow: `0 0 10px ${board.themeColor}88` }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: board.themeColor }}
          />
        </div>
      </div>
    </motion.div>
  );
}
