import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { boardsApi } from '../api/boards';
import { tilesApi } from '../api/tiles';
import { shareApi } from '../api/share';
import { useBoardSocket } from '../hooks/useBoardSocket';
import {
  ArrowLeft, Globe, Lock, Calendar, Layers, Plus, Search,
  Filter, RotateCcw, AlertTriangle, Layers3, Hash, Share2,
  Download, Upload, Users, MousePointer2, Sparkles
} from 'lucide-react';
import { formatShort } from '../utils/dateUtils';
import LoadingSpinner, { PageLoader } from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import TileGrid from '../components/tiles/TileGrid';
import AddTileModal from '../components/tiles/AddTileModal';
import ShareModal from '../components/boards/ShareModal';
import CollaboratorsPanel from '../components/boards/CollaboratorsPanel';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import AIDesignAssistant from '../components/ai/AIDesignAssistant';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search, Filter and Menu states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('reorder'); // reorder | newest | oldest | alpha | updated
  const [selectedTag, setSelectedTag] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editTile, setEditTile] = useState(null);
  const [deleteTile, setDeleteTile] = useState(null);
  const [collabOpen, setCollabOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiSuggestedColor, setAiSuggestedColor] = useState(null);
  const boardContainerRef = useRef(null);

  // Handle incoming tile sync from socket
  const handleSocketTileMutate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tiles', id] });
  }, [id, queryClient]);

  const { collaborators: socketCollaborators, cursors, emitCursorMove, emitTileMutation } = useBoardSocket(id, handleSocketTileMutate);

  // Fetch Board details
  const { data: board, isLoading: boardLoading, isError: boardError } = useQuery({
    queryKey: ['board', id],
    queryFn: () => boardsApi.getById(id).then((r) => r.data.data),
  });

  // Fetch Tiles inside the board
  const { data: tilesData = [], isLoading: tilesLoading } = useQuery({
    queryKey: ['tiles', id],
    queryFn: () => tilesApi.getAll(id).then((r) => r.data.data),
    select: (data) => {
      // Return tiles sorted by sortOrder initially
      return [...data].sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });

  // Mutation: Create Tile
  const createMutation = useMutation({
    mutationFn: (newTile) => tilesApi.create({ ...newTile, boardId: id }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['tiles', id] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      setAddModalOpen(false);
      toast.success('Inspiration added! ✨');

      // Auto-trigger AI Color Palette extraction asynchronously
      const newTileObj = res.data?.data;
      if (newTileObj?._id) {
        tilesApi.extractPalette(newTileObj._id)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['tiles', id] });
          })
          .catch((err) => console.warn('Auto palette extract failed:', err));
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add tile');
    },
  });

  // Mutation: Edit Tile
  const updateMutation = useMutation({
    mutationFn: ({ tileId, updatedData }) => tilesApi.update(tileId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles', id] });
      setEditTile(null);
      toast.success('Tile updated successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update tile');
    },
  });

  // Mutation: Delete Tile
  const deleteMutation = useMutation({
    mutationFn: (tileId) => tilesApi.delete(tileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles', id] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      setDeleteTile(null);
      toast.success('Inspiration tile removed');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Deletion failed');
    },
  });

  // Mutation: Duplicate Tile
  const duplicateMutation = useMutation({
    mutationFn: (tileId) => tilesApi.duplicate(tileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles', id] });
      queryClient.invalidateQueries({ queryKey: ['board-stats'] });
      toast.success('Tile duplicated successfully! 👥');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Duplication failed');
    },
  });

  // Mutation: Reorder Tiles (dnd-kit reorder)
  const reorderMutation = useMutation({
    mutationFn: (updatedTiles) => {
      // Optimistically set the query cache
      queryClient.setQueryData(['tiles', id], updatedTiles);
      
      const payload = updatedTiles.map((t, idx) => ({ id: t._id, sortOrder: idx }));
      return tilesApi.reorder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles', id] });
    },
    onError: () => {
      toast.error('Reorder update failed to sync with database');
      queryClient.invalidateQueries({ queryKey: ['tiles', id] });
    },
  });

  // Mutations: Share Board
  const enableShareMutation = useMutation({
    mutationFn: () => shareApi.enable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      toast.success('Public sharing enabled');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to enable sharing'),
  });

  const disableShareMutation = useMutation({
    mutationFn: () => shareApi.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      toast.success('Public sharing disabled');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to disable sharing'),
  });

  const regenerateShareMutation = useMutation({
    mutationFn: () => shareApi.regenerate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      toast.success('Share link regenerated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to regenerate link'),
  });

  // Unique list of tags for filtering dropdown
  const allTags = Array.from(
    new Set(tilesData.flatMap((t) => t.tags || []))
  );

  // Client-side search and filters
  const getProcessedTiles = () => {
    let processed = [...tilesData];

    // Search query match
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(
        (t) =>
          t.caption?.toLowerCase().includes(query) ||
          t.imageUrl?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter match
    if (selectedTag) {
      processed = processed.filter((t) => t.tags?.includes(selectedTag));
    }

    // Sorting overrides (default is manual drag-and-drop sort order)
    if (sortBy === 'newest') {
      processed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      processed.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'alpha') {
      processed.sort((a, b) => (a.caption || '').localeCompare(b.caption || ''));
    } else if (sortBy === 'updated') {
      processed.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return processed;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('reorder');
    setSelectedTag('');
    toast.success('Filters reset');
  };

  if (boardLoading) return <PageLoader text="Loading visual board..." />;

  if (boardError || !board) {
    return (
      <div className="card p-10 max-w-lg mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Board not found</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          This board may have been deleted, archived, or you don&apos;t have permissions to access it.
        </p>
        <Button className="mt-6" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const gradients = {
    '#7C3AED': 'from-violet-500 to-purple-700',
    '#2563EB': 'from-blue-500 to-indigo-700',
    '#059669': 'from-emerald-500 to-teal-700',
    '#D97706': 'from-amber-500 to-orange-600',
    '#DC2626': 'from-red-500 to-rose-700',
    '#DB2777': 'from-pink-500 to-fuchsia-700',
    '#0891B2': 'from-cyan-500 to-sky-700',
    '#65A30D': 'from-lime-500 to-green-700',
  };
  const gradient = gradients[board.themeColor] || 'from-violet-500 to-purple-700';

  const processedTiles = getProcessedTiles();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn-ghost btn p-1.5 rounded-lg text-sm flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Header Banner */}
      <div className={`h-48 rounded-2xl bg-gradient-to-br ${gradient} p-6 relative overflow-hidden flex flex-col justify-end shadow-md`}>
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
        
        {/* Visibility tag badge & Action buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2 flex-wrap justify-end">
          {/* Live presence avatars */}
          {socketCollaborators.length > 0 && (
            <div className="flex items-center gap-1">
              {socketCollaborators.slice(0, 4).map((collab) => (
                <div key={collab.socketId} className="relative" title={`${collab.name} — ${collab.isEditing ? 'Editing…' : 'Viewing'}`}>
                  <Avatar name={collab.name} color={collab.avatarColor} size="xs" />
                  {collab.isEditing && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
                  )}
                </div>
              ))}
              {socketCollaborators.length > 4 && (
                <span className="text-[10px] text-white/80">+{socketCollaborators.length - 4}</span>
              )}
            </div>
          )}
          <button
            onClick={() => setCollabOpen(true)}
            className="btn-ghost bg-white/10 hover:bg-white/20 text-white border-transparent px-2 py-1.5 h-auto text-xs rounded-full gap-1 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              boardsApi.exportBoard(id).then((res) => {
                const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${board?.title || 'board'}_export.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Board exported! 📦');
              }).catch(() => toast.error('Export failed'));
            }}
            className="btn-ghost bg-white/10 hover:bg-white/20 text-white border-transparent px-2 py-1.5 h-auto text-xs rounded-full gap-1 transition-colors"
            title="Export board as JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShareModalOpen(true)}
            className="btn-ghost bg-white/10 hover:bg-white/20 text-white border-transparent px-3 py-1.5 h-auto text-xs rounded-full gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button
            onClick={() => setAiPanelOpen((v) => !v)}
            className={`btn-ghost border-transparent px-3 py-1.5 h-auto text-xs rounded-full gap-1.5 transition-all ${
              aiPanelOpen
                ? 'bg-white text-primary-700 shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="AI Design Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI
          </button>
          <span className={`badge ${board.visibility === 'public' ? 'bg-white/20 text-white border-white/20 shadow' : 'bg-black/25 text-white border-transparent'}`}>
            {board.visibility === 'public' ? (
              <><Globe className="w-3 h-3" /> Public</>
            ) : (
              <><Lock className="w-3 h-3" /> Private</>
            )}
          </span>
        </div>

        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {board.title}
          </h1>
          {board.description && (
            <p className="text-white/90 text-sm max-w-xl line-clamp-2 leading-snug font-medium drop-shadow-sm">
              {board.description}
            </p>
          )}
        </div>
      </div>

      {/* Board Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetaCard icon={Calendar} label="Created Date" value={formatShort(board.createdAt)} />
        <MetaCard icon={Calendar} label="Last Updated" value={formatShort(board.updatedAt)} />
        <MetaCard icon={Layers} label="Total Tiles" value={tilesData.length} />
        <MetaCard icon={Layers3} label="Visible Items" value={processedTiles.length} />
      </div>

      {/* Controls: Search, Sort and Filters */}
      <div className="card-glass p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by caption, tags, or url..."
            className="input pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tags Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-205 dark:border-slate-700">
            <Hash className="w-4 h-4 text-slate-400" />
            <select
              className="bg-transparent text-sm focus:outline-none pr-3 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">Filter by Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 border border-slate-205 dark:border-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="bg-transparent text-sm focus:outline-none pr-3 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="reorder">Manual Sort (Drag & Drop)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alpha">Alphabetical</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || selectedTag || sortBy !== 'reorder') && (
            <button
              onClick={handleResetFilters}
              className="btn-secondary btn px-3 py-2 flex items-center gap-1 text-xs hover:text-red-500"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}

          {/* Action trigger button */}
          <Button onClick={() => setAddModalOpen(true)} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Inspiration
          </Button>
        </div>
      </div>

      {/* Grid + AI Panel side-by-side */}
      <div className="flex gap-4 relative">
        {/* Grid Display Grid Layout container */}
        <div className="flex-1 min-w-0">
          {tilesLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" text="Arranging pins..." />
            </div>
          ) : (
            <div className="relative min-h-[300px]">
              <TileGrid
                tiles={processedTiles}
                onEdit={setEditTile}
                onDelete={setDeleteTile}
                onDuplicate={(tile) => duplicateMutation.mutate(tile._id)}
                onReorder={(reorderedList) => reorderMutation.mutate(reorderedList)}
                onTagClick={setSelectedTag}
                onAddClick={() => setAddModalOpen(true)}
                isReorderActive={sortBy === 'reorder'}
              />
            </div>
          )}
        </div>

        {/* AI Design Assistant Panel */}
        <AnimatePresence>
          {aiPanelOpen && (
            <motion.div
              key="ai-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl"
              style={{ height: 'fit-content', position: 'sticky', top: 20 }}
            >
              <div style={{ width: 340 }}>
                <AIDesignAssistant
                  boardId={id}
                  onApplyColor={(hex) => {
                    setAiSuggestedColor(hex);
                    toast.success(`Color ${hex} ready — open or edit a tile to apply it!`, { duration: 4000 });
                  }}
                  onClose={() => setAiPanelOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Adding / Editing Modal */}
      <AddTileModal
        isOpen={addModalOpen || !!editTile}
        onClose={() => {
          setAddModalOpen(false);
          setEditTile(null);
        }}
        editTile={editTile}
        aiSuggestedColor={aiSuggestedColor}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(data) => {
          if (editTile) {
            updateMutation.mutate({ tileId: editTile._id, updatedData: data });
          } else {
            createMutation.mutate(data);
          }
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        board={board}
        onEnableSharing={() => enableShareMutation.mutate()}
        onDisableSharing={() => disableShareMutation.mutate()}
        onRegenerate={() => regenerateShareMutation.mutate()}
        isLoading={enableShareMutation.isPending || disableShareMutation.isPending || regenerateShareMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTile} onClose={() => setDeleteTile(null)} title="Delete Inspiration" size="sm">
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto text-red-500">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Delete this inspiration?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Are you sure you want to permanently remove this pin? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteTile(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTile._id)}
            >
              Delete Pin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Collaborators Panel */}
      <CollaboratorsPanel
        board={{ ...board, ownerName: 'You (Owner)' }}
        isOpen={collabOpen}
        onClose={() => setCollabOpen(false)}
      />
    </div>
  );
}

function MetaCard({ icon: Icon, label, value }) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-primary-500">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-medium truncate">{label}</p>
        <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}
