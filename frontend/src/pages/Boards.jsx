import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInItem, floatAnimation } from '../utils/motionVariants';
import { useState, useRef } from 'react';
import { Plus, Layers, Filter, Upload, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '../api/boards';
import BoardCard from '../components/boards/BoardCard';
import BoardForm from '../components/boards/BoardForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Boards() {
  const [searchParams] = useSearchParams();
  const isArchivedView = searchParams.get('archived') === 'true';
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBoard, setEditBoard] = useState(null);
  const [deleteBoard, setDeleteBoard] = useState(null);
  const [search, setSearch] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const importRef = useRef(null);

  const { data: boards = [], isLoading } = useQuery({
    queryKey: ['boards', isArchivedView],
    queryFn: () =>
      boardsApi.getAll({ archived: isArchivedView }).then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => boardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      setCreateOpen(false);
      toast.success('Board created! ✨');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create board'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => boardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      setEditBoard(null);
      toast.success('Board updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update board'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => boardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      setDeleteBoard(null);
      toast.success('Board deleted');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => boardsApi.toggleArchive(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      toast.success(res.data.message);
    },
  });

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast.error('Please select a valid JSON export file');
      return;
    }
    setImportLoading(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = await boardsApi.importBoard(parsed);
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      toast.success(`Board "${result.data.data.title}" imported! 🎉`);
      navigate(`/boards/${result.data.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import board');
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  const filtered = boards.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <motion.div variants={fadeInItem}>
          <h1 className="page-title">
            {isArchivedView ? '🗄 Archived Boards' : '🎨 My Boards'}
          </h1>
          <motion.p
            key={filtered.length}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-slate-500 dark:text-slate-400 text-sm mt-1"
          >
            {filtered.length} {filtered.length === 1 ? 'board' : 'boards'} found
          </motion.p>
        </motion.div>
        {!isArchivedView && (
          <motion.div variants={fadeInItem} className="flex items-center gap-2">
            <input
              type="file"
              accept=".json"
              ref={importRef}
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => importRef.current?.click()}
              loading={importLoading}
              title="Import board from JSON"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button onClick={() => setCreateOpen(true)} size="lg">
              <Plus className="w-5 h-5" /> New Board
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Search filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input pl-9"
          placeholder="Filter boards by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="md" text="Loading your boards…" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card py-24 flex flex-col items-center gap-5 text-center"
        >
          <motion.div
            animate={floatAnimation}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-900/30 dark:to-violet-900/30 flex items-center justify-center"
          >
            <Layers className="w-10 h-10 text-primary-400" />
          </motion.div>
          <div className="space-y-1">
            <p className="font-bold text-lg text-slate-700 dark:text-slate-300">
              {search ? 'No boards match your filter' : isArchivedView ? 'No archived boards' : 'Start your creative journey'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {!search && !isArchivedView && 'Create your first mood board and start adding inspiration'}
            </p>
          </div>
          {!search && !isArchivedView && (
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Button size="lg" onClick={() => setCreateOpen(true)}>
                <Plus className="w-5 h-5" /> Create First Board
              </Button>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence>
            {filtered.map((board) => (
              <motion.div
                key={board._id}
                variants={fadeInItem}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                layout
              >
                <BoardCard
                  board={board}
                  onEdit={setEditBoard}
                  onDelete={setDeleteBoard}
                  onArchive={(b) => archiveMutation.mutate(b._id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Board">
        <BoardForm
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editBoard} onClose={() => setEditBoard(null)} title="Edit Board">
        {editBoard && (
          <BoardForm
            defaultValues={editBoard}
            onSubmit={(data) => updateMutation.mutate({ id: editBoard._id, data })}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteBoard} onClose={() => setDeleteBoard(null)} title="Delete Board" size="sm">
        <div className="text-center space-y-5">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto"
          >
            <Layers className="w-8 h-8 text-red-600 dark:text-red-400" />
          </motion.div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Delete this board?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Permanently delete <strong>&quot;{deleteBoard?.title}&quot;</strong> and all its tiles. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteBoard(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteBoard._id)}>Delete Board</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
