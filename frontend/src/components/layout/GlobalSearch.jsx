import { motion, AnimatePresence } from 'framer-motion';
import { searchDropdownVariants, staggerContainerFast, fadeUpItem } from '../../utils/motionVariants';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../../api/search';
import { Search, Loader2, Image as ImageIcon, Layers, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounceLocal(query, 300);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { data, isFetching } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery).then((r) => r.data.data),
    enabled: debouncedQuery.length > 0,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBoard = (boardId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/boards/${boardId}`);
  };

  const hasResults = data && (data.boards.length > 0 || data.tiles.length > 0);

  return (
    <div className="relative flex-1 max-w-md" ref={containerRef}>
      <motion.div
        animate={{ boxShadow: isFocused ? '0 0 0 3px rgba(124,58,237,0.15)' : '0 0 0 0px rgba(124,58,237,0)' }}
        transition={{ duration: 0.2 }}
        className="relative group rounded-xl"
      >
        <motion.div
          animate={{ scale: isFocused ? 1.05 : 1 }}
          transition={{ duration: 0.18 }}
          className="absolute left-3 top-1/2 -translate-y-1/2"
        >
          <Search className={`w-4 h-4 transition-colors duration-200 ${isFocused ? 'text-primary-500' : 'text-slate-400'}`} />
        </motion.div>
        <input
          type="text"
          placeholder="Search boards, tags, captions..."
          className="input pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-transparent focus:border-primary-500 w-full"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim().length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            variants={searchDropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {isFetching ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 flex items-center justify-center text-slate-500"
              >
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </motion.div>
            ) : !hasResults ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center text-slate-500 text-sm"
              >
                No results found for &quot;{query}&quot;
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainerFast}
                initial="hidden"
                animate="visible"
                className="max-h-[400px] overflow-y-auto w-full p-2 space-y-4"
              >
                {/* Boards */}
                {data.boards?.length > 0 && (
                  <motion.div variants={fadeUpItem}>
                    <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Boards</h4>
                    <div className="space-y-1">
                      {data.boards.map(board => (
                        <motion.button
                          key={board._id}
                          whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          onClick={() => handleSelectBoard(board._id)}
                          className="w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-white" style={{ background: board.themeColor || '#6366f1' }}>
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="flex-1 truncate">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{board.title}</p>
                            {board.description && <p className="text-xs text-slate-500 truncate">{board.description}</p>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tiles */}
                {data.tiles?.length > 0 && (
                  <motion.div variants={fadeUpItem}>
                    <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inspirations</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {data.tiles.map(tile => (
                        <motion.button
                          key={tile._id}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          onClick={() => handleSelectBoard(tile.boardId?._id)}
                          className="flex flex-col gap-1 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                        >
                          <div className="h-20 w-full rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img src={tile.imageUrl} alt="Result" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mt-1">
                            {tile.caption || 'Untitled Pin'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            in {tile.boardId?.title}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
