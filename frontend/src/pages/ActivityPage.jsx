import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUpItem, timelineItem } from '../utils/motionVariants';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activity';
import { boardsApi } from '../api/boards';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Search, Filter, Calendar, Layout, Info } from 'lucide-react';
import { useEffect } from 'react';

function useDebounceLocal(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounceLocal(search, 300);
  const [dateRange, setDateRange] = useState('');
  const [boardId, setBoardId] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data: boardsData } = useQuery({
    queryKey: ['boards'],
    queryFn: () => boardsApi.getAll().then(r => r.data.data),
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activity', { q: debouncedSearch, dateRange, boardId, action: actionFilter }],
    queryFn: () => activityApi.getAll({ 
      search: debouncedSearch, dateRange, boardId, action: actionFilter 
    }).then(r => r.data.data),
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <motion.div variants={fadeUpItem}>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Activity Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track everything happening across your boards.
          </p>
        </motion.div>
      </motion.div>

      {/* Filters Area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card p-4 flex flex-col md:flex-row md:items-center gap-4"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities..."
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
             <Info className="w-4 h-4 text-slate-400" />
             <select
               className="bg-transparent text-sm focus:outline-none pr-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
               value={actionFilter}
               onChange={(e) => setActionFilter(e.target.value)}
             >
               <option value="">All Actions</option>
               <option value="BOARD_CREATED">Board Created</option>
               <option value="BOARD_UPDATED">Board Updated</option>
               <option value="TILE_ADDED">Inspiration Added</option>
               <option value="TILE_UPDATED">Inspiration Updated</option>
               <option value="TILE_MOVED">Inspiration Reordered</option>
               <option value="SHARE_ENABLED">Share Enabled</option>
               <option value="TILE_DELETED">Item Deleted</option>
               <option value="BOARD_DELETED">Board Deleted</option>
             </select>
          </div>

          {/* Board Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
             <Layout className="w-4 h-4 text-slate-400" />
             <select
               className="bg-transparent text-sm focus:outline-none pr-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer max-w-[120px] truncate"
               value={boardId}
               onChange={(e) => setBoardId(e.target.value)}
             >
               <option value="">All Boards</option>
               {boardsData?.map(b => (
                 <option key={b._id} value={b._id}>{b.title}</option>
               ))}
             </select>
          </div>

          {/* Date Filter */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700">
             <Calendar className="w-4 h-4 text-slate-400" />
             <select
               className="bg-transparent text-sm focus:outline-none pr-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
             >
               <option value="">All Time</option>
               <option value="today">Today</option>
               <option value="7days">Last 7 Days</option>
               <option value="month">This Month</option>
             </select>
          </div>
        </div>
      </motion.div>

      {/* Activity Timeline Area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center h-48"
            >
              <LoadingSpinner size="md" text="Loading timeline..." />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ActivityTimeline activities={activities || []} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
