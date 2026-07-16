import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';
import { staggerContainer, fadeUpItem, fadeInItem } from '../utils/motionVariants';
import { useState } from 'react';
import { Plus, Layers, Sparkles, Globe, Image as ImageIcon, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '../api/boards';
import { useAuth } from '../context/AuthContext';
import BoardCard from '../components/boards/BoardCard';
import BoardForm from '../components/boards/BoardForm';
import ActivityTimeline from '../components/activity/ActivityTimeline';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SlotCounter from '../components/ui/SlotCounter';
import SplitText from '../components/ui/SplitText';
import ParticleField, { OrbitRing } from '../components/ui/ParticleField';
import { use3DTilt } from '../hooks/use3DTilt';
import toast from 'react-hot-toast';

// ─── 3D Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, delay = 0 }) {
  const { ref, rotateX, rotateY, glareX, glareY, onMouseMove, onMouseLeave } = use3DTilt(8);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: 'preserve-3d' }}
        whileHover={{ z: 12 }}
        className="card p-5 flex items-center gap-4 cursor-default relative overflow-hidden"
      >
        {/* Animated background glow */}
        <motion.div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 ${bg}`}
          initial={false}
          whileHover={{ opacity: 0.06 }}
          transition={{ duration: 0.3 }}
        />
        {/* Glare overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.18) 0%, transparent 65%)`,
          }}
        />
        <motion.div
          whileHover={{ scale: 1.18, rotate: [0, -10, 10, 0] }}
          transition={{ type: 'spring', stiffness: 380, damping: 18 }}
          className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 shadow-lg`}
          style={{ transform: 'translateZ(16px)' }}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </motion.div>
        <div style={{ transform: 'translateZ(10px)' }}>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {typeof value === 'number' ? <SlotCounter value={value} delay={delay} /> : value}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBoard, setEditBoard] = useState(null);
  const [deleteBoard, setDeleteBoard] = useState(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['board-stats'],
    queryFn: () => boardsApi.getStats().then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => boardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setCreateOpen(false);
      toast.success('Board created! ✨');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create board'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => boardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setEditBoard(null);
      toast.success('Board updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update board'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => boardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setDeleteBoard(null);
      toast.success('Board deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete board'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => boardsApi.toggleArchive(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success(res.data.message);
    },
  });

  const firstName = user?.name?.split(' ')[0] || 'there';

  const statCards = [
    { label: 'Total Boards', value: statsData?.total ?? '—', icon: Layers, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20', delay: 0 },
    { label: 'Total Inspiration', value: statsData?.tiles ?? '—', icon: ImageIcon, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', delay: 0.07 },
    { label: 'Shared Boards', value: statsData?.shared ?? '—', icon: Globe, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20', delay: 0.14 },
    { label: 'Activities', value: statsData?.activitiesCount ?? '—', icon: Activity, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', delay: 0.21 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome — Character-by-character heading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            <SplitText text={`Hello, ${firstName}! 👋`} delay={0.05} stagger={0.04} />
          </h1>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 dark:text-slate-400 mt-1"
          >
            Here&apos;s what&apos;s happening with your boards today.
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.45 }}
        >
          <Button onClick={() => setCreateOpen(true)} size="lg" className="flex-shrink-0">
            <Plus className="w-5 h-5" /> New Board
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats — 3D tilt cards with slot counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} value={statsLoading ? 0 : card.value} />
        ))}
      </div>

      {/* Recent Boards */}
      <section>
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 22 }}
          className="flex items-center justify-between mb-4"
        >
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Boards</h2>
        </motion.div>

        {statsLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" text="Loading boards..." />
          </div>
        ) : statsData?.recentBoards?.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {statsData?.recentBoards?.map((board) => (
              <motion.div
                variants={fadeInItem}
                key={board._id}
                whileHover={{ zIndex: 10 }}
              >
                <BoardCard
                  board={board}
                  onEdit={setEditBoard}
                  onDelete={setDeleteBoard}
                  onArchive={(b) => archiveMutation.mutate(b._id)}
                />
              </motion.div>
            ))}
            {/* Create new card */}
            <motion.button
              variants={fadeInItem}
              onClick={() => setCreateOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="card border-dashed border-2 border-slate-300 dark:border-slate-700 min-h-[160px] flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group relative overflow-hidden"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_70%,rgba(124,58,237,0.06)_100%)] opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
              >
                <Plus className="w-8 h-8" />
              </motion.div>
              <span className="text-sm font-medium relative z-10">New Board</span>
            </motion.button>
          </motion.div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-8">
        {/* Recently Shared */}
        <section className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-slate-500" /> Publicly Shared
            </h2>
          </motion.div>
          {statsLoading ? (
            <div className="py-6 flex justify-center"><LoadingSpinner size="md" /></div>
          ) : statsData?.recentShared?.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="card py-8 flex flex-col items-center justify-center gap-2 text-center border-dashed border-2 bg-transparent shadow-none">
              <Globe className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 text-sm">No boards are publicly shared.</p>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {statsData?.recentShared?.map((board) => (
                <motion.div variants={fadeInItem} key={board._id} whileHover={{ zIndex: 10 }}>
                  <BoardCard board={board} onEdit={setEditBoard} onDelete={setDeleteBoard} onArchive={(b) => archiveMutation.mutate(b._id)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Recent Activity */}
        <section>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-500" /> Recent Activity
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-5">
            {statsLoading ? (
              <div className="py-12 flex justify-center"><LoadingSpinner size="md" /></div>
            ) : (
              <ActivityTimeline activities={statsData?.recentActivities || []} />
            )}
          </motion.div>
        </section>
      </div>

      {/* Modals */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Board">
        <BoardForm onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} submitLabel="Create Board" />
      </Modal>
      <Modal isOpen={!!editBoard} onClose={() => setEditBoard(null)} title="Edit Board">
        {editBoard && <BoardForm defaultValues={editBoard} onSubmit={(data) => updateMutation.mutate({ id: editBoard._id, data })} loading={updateMutation.isPending} submitLabel="Save Changes" />}
      </Modal>
      <Modal isOpen={!!deleteBoard} onClose={() => setDeleteBoard(null)} title="Delete Board" size="sm">
        <div className="text-center space-y-4">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7 text-red-600 dark:text-red-400" />
          </motion.div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Are you sure?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              This will permanently delete <strong>&quot;{deleteBoard?.title}&quot;</strong>. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteBoard(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteBoard._id)}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function EmptyState({ onCreateClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card py-24 flex flex-col items-center justify-center gap-4 text-center relative overflow-hidden"
    >
      {/* Ambient particle field */}
      <ParticleField count={20} className="opacity-60" />

      {/* Orbiting ring centered on icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <OrbitRing radius={52} dotCount={10} color="rgba(124,58,237,0.25)" duration={10} />
        </div>
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center shadow-xl shadow-primary-500/30 relative z-10"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No boards yet</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Create your first board and start collecting your inspiration, ideas, and creativity.
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <Button onClick={onCreateClick} size="lg">
          <Plus className="w-5 h-5" /> Create Your First Board
        </Button>
      </motion.div>
    </motion.div>
  );
}
