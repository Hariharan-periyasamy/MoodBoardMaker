import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import TileCard from './TileCard';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleField, { OrbitRing } from '../ui/ParticleField';

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.85, transition: { duration: 0.18 } },
};

export default function TileGrid({
  tiles,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  onTagClick,
  onAddClick,
  isReorderActive = true,
}) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e) => { setActiveId(e.active.id); };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveId(null);
    if (over && active.id !== over.id) {
      const oldIndex = tiles.findIndex((t) => t._id === active.id);
      const newIndex = tiles.findIndex((t) => t._id === over.id);
      const reordered = arrayMove(tiles, oldIndex, newIndex);
      const updatedSortOrders = reordered.map((item, index) => ({ ...item, sortOrder: index }));
      onReorder(updatedSortOrders);
    }
  };

  if (!tiles || tiles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card py-24 flex flex-col items-center justify-center gap-5 text-center relative overflow-hidden"
      >
        {/* Ambient particles */}
        <ParticleField count={16} />

        {/* Orbiting icon */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitRing radius={48} dotCount={9} color="rgba(124,58,237,0.28)" duration={9} />
          </div>
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/30 relative z-10"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>
        </div>

        <div className="relative z-10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No inspiration added yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Upload images, paste URLs, add tags, and style accent colors to compile your mood board.
          </p>
        </div>

        <motion.div className="relative z-10" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Button onClick={onAddClick}>Add First Tile</Button>
        </motion.div>
      </motion.div>
    );
  }

  const activeTile = tiles.find((t) => t._id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tiles.map((t) => t._id)} strategy={rectSortingStrategy}>
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.div
                key={tile._id}
                variants={tileVariants}
                exit="exit"
                layout
              >
                <TileCard
                  tile={tile}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onTagClick={onTagClick}
                  isDragDisabled={!isReorderActive}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </SortableContext>

      {/* Drag Overlay for smooth element moving preview */}
      <DragOverlay adjustScale={true}>
        {activeId && activeTile ? (
          <div className="w-full shadow-2xl scale-[1.04] rounded-2xl overflow-hidden border-2 border-primary-500">
            <TileCard
              tile={activeTile}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onTagClick={onTagClick}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
