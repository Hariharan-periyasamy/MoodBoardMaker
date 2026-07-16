import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, timelineItem, fadeUpItem } from '../../utils/motionVariants';
import { format } from '../../utils/dateUtils';
import { 
  PlusCircle, Edit, Trash2, Move, Share2, EyeOff, RefreshCw, 
  Layout, Image as ImageIcon, Box
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ACTION_CONFIG = {
  'BOARD_CREATED': { icon: PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  'BOARD_UPDATED': { icon: Edit, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  'BOARD_DELETED': { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  'TILE_ADDED': { icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  'TILE_UPDATED': { icon: Edit, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  'TILE_DELETED': { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
  'TILE_MOVED': { icon: Move, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  'SHARE_ENABLED': { icon: Share2, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  'SHARE_DISABLED': { icon: EyeOff, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  'LINK_REGENERATED': { icon: RefreshCw, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  'DEFAULT': { icon: Box, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' }
};

export function ActivityCard({ activity, index = 0 }) {
  const config = ACTION_CONFIG[activity.action] || ACTION_CONFIG['DEFAULT'];
  const Icon = config.icon;
  const boardThemeColor = activity.boardId?.themeColor || '#e2e8f0';

  return (
    <motion.div
      variants={timelineItem}
      className="relative group"
    >
      {/* Timeline connector line (visible except on last item) */}
      <div className="absolute top-8 bottom-[-24px] left-[1.125rem] w-px bg-slate-200 dark:bg-slate-700 group-last:hidden" />
      
      <div className="flex items-start gap-4 mb-6">
        {/* Icon Circle */}
        <motion.div
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 ${config.bg} ${config.color}`}
        >
          <Icon className="w-4 h-4" />
        </motion.div>

        {/* Content Box */}
        <motion.div
          whileHover={{ x: 3, boxShadow: '0 4px 16px -4px rgba(0,0,0,0.10)' }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="flex-1 card p-4"
        >
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm text-slate-800 dark:text-slate-200">
              {activity.description}
            </p>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 whitespace-nowrap ml-4">
              {format(activity.timestamp)}
            </span>
          </div>

          {/* Context Tag */}
          <div className="mt-2 flex items-center gap-2">
             <span className="text-xs text-slate-500">Board: </span>
             {activity.boardId ? (
                <motion.div whileHover={{ scale: 1.04 }} transition={{ type: 'spring', stiffness: 400, damping: 24 }}>
                  <Link 
                    to={`/boards/${activity.boardId._id}`} 
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: boardThemeColor }} />
                    {activity.boardId.title}
                  </Link>
                </motion.div>
             ) : (
                <span className="text-xs text-slate-400 italic">Deleted Board</span>
             )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function ActivityTimeline({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 card border-dashed"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        </motion.div>
        <h3 className="text-slate-700 dark:text-slate-300 font-medium">No activity yet</h3>
        <p className="text-sm text-slate-500 mt-1">Actions performed will appear here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="pb-4"
    >
      <AnimatePresence>
        {activities.map((activity, i) => (
          <ActivityCard key={activity._id} activity={activity} index={i} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
