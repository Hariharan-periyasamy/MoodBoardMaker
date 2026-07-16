import { motion, AnimatePresence, useMotionTemplate } from 'framer-motion';
import { dropdownVariants } from '../../utils/motionVariants';
import { use3DTilt } from '../../hooks/use3DTilt';
import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tilesApi } from '../../api/tiles';
import { MoreVertical, Edit2, Copy, RefreshCw, Download, Trash2, GripVertical, Calendar } from 'lucide-react';
import { format } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

export default function TileCard({ tile, onEdit, onDelete, onDuplicate, onTagClick, isDragDisabled = false }) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { ref: tiltRef, rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave } = use3DTilt(7);
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;

  const extractMutation = useMutation({
    mutationFn: () => tilesApi.extractPalette(tile._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles', tile.boardId] });
      toast.success('AI Colors extracted! 🎨');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to extract dominant colors'),
  });

  const handleCopyHex = (e, hex) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    toast.success(`HEX: ${hex} copied! 📋`);
  };

  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: tile._id, disabled: isDragDisabled });

  const style = { transform: CSS.Transform.toString(transform), transition };

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tile.imageUrl);
    toast.success('Image Link copied!');
    setMenuOpen(false);
  };

  const handleDownload = async () => {
    toast.loading('Preparing download...');
    try {
      const response = await tilesApi.downloadProxyUrl(tile.imageUrl);
      const blob = response.data;
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const contentType = response.headers['content-type'] || '';
      let ext = 'jpg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('gif')) ext = 'gif';
      else if (contentType.includes('webp')) ext = 'webp';
      else { const match = tile.imageUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)/i); if (match) ext = match[1].toLowerCase(); }
      const defaultFilename = tile.caption ? tile.caption.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'moodboard_inspiration';
      link.download = `${defaultFilename}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.dismiss();
      toast.success('Download started! 💾');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to download image.');
    }
    setMenuOpen(false);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        ref={tiltRef}
        onMouseMove={!isDragging ? onMouseMove : undefined}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX: isDragging ? 0 : rotateX,
          rotateY: isDragging ? 0 : rotateY,
          transformPerspective: 900,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isDragging ? 1.06 : 1,
          opacity: isDragging ? 0.55 : 1,
          boxShadow: isDragging
            ? '0 32px 64px -8px rgba(0,0,0,0.35), 0 0 0 2px rgba(124,58,237,0.6)'
            : '0 1px 4px rgba(0,0,0,0.06)',
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="card group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative overflow-hidden"
      >
        {/* 3D Glare overlay */}
        {!isDragging && (
          <motion.div
            className="absolute inset-0 z-20 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: glareBackground }}
          />
        )}

        {/* Accent border line on top */}
        <motion.div
          className="h-1 w-full rounded-t-[15px]"
          style={{ backgroundColor: tile.themeColor }}
          whileHover={{ height: 3 }}
          transition={{ duration: 0.2 }}
        />

        {/* Top hover overlay controls */}
        <motion.div
          className="absolute inset-x-0 top-1 p-3 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between z-30"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          {!isDragDisabled && (
            <motion.div
              {...attributes}
              {...listeners}
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/65 flex items-center justify-center text-white cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4" />
            </motion.div>
          )}

          <div ref={menuRef} className="relative ml-auto">
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-lg bg-black/40 hover:bg-black/65 flex items-center justify-center text-white backdrop-blur-sm"
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
                  className="absolute right-0 top-9 w-46 card shadow-2xl z-40 py-1 border border-slate-200 dark:border-slate-700"
                >
                  {[
                    { label: 'Edit details', icon: Edit2, action: () => { onEdit(tile); setMenuOpen(false); } },
                    { label: 'Duplicate', icon: RefreshCw, action: () => { onDuplicate(tile); setMenuOpen(false); } },
                    { label: 'Download image', icon: Download, action: handleDownload },
                    { label: 'Copy Image URL', icon: Copy, action: handleCopyLink },
                  ].map(({ label, icon: Icon, action }, i) => (
                    <motion.button
                      key={label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ x: 5, backgroundColor: 'rgba(124,58,237,0.06)' }}
                      onClick={action}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </motion.button>
                  ))}
                  <hr className="my-1 border-slate-100 dark:border-slate-800" />
                  <motion.button
                    whileHover={{ x: 5 }}
                    onClick={() => { onDelete(tile); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Image — parallax inside the tilt */}
        <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center">
          <motion.img
            src={tile.imageUrl}
            alt={tile.caption || 'Moodboard Tile'}
            className="w-full h-full object-cover select-none pointer-events-none"
            style={{
              translateX: useMotionTemplate`calc(${rotateY} * -1.5px)`,
              translateY: useMotionTemplate`calc(${rotateX} * 1.5px)`,
            }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Color-tinted overlay on hover */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.12 }}
            style={{ backgroundColor: tile.themeColor }}
          />
        </div>

        {/* Info card footer — lifted in 3D */}
        <div className="p-4 space-y-2 select-none" style={{ transform: 'translateZ(6px)' }}>
          {tile.caption ? (
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-tight">
              {tile.caption}
            </h4>
          ) : (
            <p className="text-xs italic text-slate-400 dark:text-slate-500">Untitled Inspiration</p>
          )}

          {/* Tags */}
          {tile.tags && tile.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tile.tags.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2, backgroundColor: `${tile.themeColor}22` }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onTagClick(tag)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 hover:bg-primary-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 border border-slate-100 dark:border-slate-800 transition-colors select-none"
                >
                  #{tag}
                </motion.button>
              ))}
            </div>
          )}

          {/* Color Swatches */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {tile.colorPalette && tile.colorPalette.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 whitespace-nowrap">Colors:</span>
                <div className="flex gap-1">
                  {tile.colorPalette.map((hex, i) => (
                    <motion.button
                      key={hex}
                      type="button"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 400, damping: 18 }}
                      whileHover={{ scale: 1.5, y: -3, boxShadow: `0 4px 12px ${hex}66` }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleCopyHex(e, hex)}
                      className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      style={{ backgroundColor: hex }}
                      title={`Copy HEX: ${hex}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400 italic">No colors extracted</span>
                <motion.button
                  type="button"
                  disabled={extractMutation.isPending}
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); extractMutation.mutate(); }}
                  className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
                >
                  {extractMutation.isPending ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="inline-block">
                      ⟳
                    </motion.span>
                  ) : 'Extract Colors 🎨'}
                </motion.button>
              </div>
            )}
          </div>

          {/* Date + accent dot */}
          <div className="flex items-center justify-between text-[10px] text-slate-400/80 pt-2 border-t border-slate-50 dark:border-slate-800/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(tile.createdAt)}
            </span>
            <motion.div
              whileHover={{ scale: 1.8, boxShadow: `0 0 8px ${tile.themeColor}` }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: tile.themeColor }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
