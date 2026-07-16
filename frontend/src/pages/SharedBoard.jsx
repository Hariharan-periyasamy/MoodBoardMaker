import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { shareApi } from '../api/share';
import { ArrowLeft, Layers, User, Calendar, Image as ImageIcon } from 'lucide-react';
import { formatShort } from '../utils/dateUtils';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

export default function SharedBoard() {
  const { token } = useParams();
  const [selectedImage, setSelectedImage] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['sharedBoard', token],
    queryFn: () => shareApi.getSharedBoard(token).then((r) => r.data.data),
    retry: false, // Don't retry if token is invalid
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" text="Loading shared board..." />
      </div>
    );
  }

  if (isError || !data?.board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <div className="card p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Board Unavailable</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            This shared link is invalid, has expired, or the owner has disabled public access.
          </p>
          <Link to="/" className="btn btn-primary mt-6 inline-flex">
            Go to MoodBoard
          </Link>
        </div>
      </div>
    );
  }

  const { board, tiles } = data;
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
  const gradient = gradients[board.themeColor] || 'from-slate-500 to-slate-700';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
      {/* Read-only Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white hidden sm:block">
              MoodBoard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              Read-Only View
            </span>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* Hero Section */}
        <div className={`h-64 rounded-3xl bg-gradient-to-br ${gradient} p-8 relative overflow-hidden flex flex-col justify-end shadow-lg`}>
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
          <div className="relative z-10 space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">
              {board.title}
            </h1>
            {board.description && (
              <p className="text-white/90 text-sm sm:text-base max-w-2xl line-clamp-2 leading-relaxed font-medium drop-shadow-sm">
                {board.description}
              </p>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard icon={User} label="Owner" value={board.owner?.name || 'Unknown'} />
          <InfoCard icon={Layers} label="Tiles" value={tiles.length} />
          <InfoCard icon={Calendar} label="Last Updated" value={formatShort(board.updatedAt)} />
          <InfoCard icon={Calendar} label="Created" value={formatShort(board.createdAt)} />
        </div>

        {/* Grid Setup */}
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Inspiration Grid</h2>
          </div>

          {tiles.length === 0 ? (
            <div className="card py-20 text-center">
              <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">This board is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {tiles.map((tile) => (
                <div 
                  key={tile._id} 
                  className="card group overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative"
                >
                  <div className="h-1.5 w-full" style={{ backgroundColor: tile.themeColor }} />
                  <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center cursor-zoom-in" onClick={() => setSelectedImage(tile)}>
                    <img
                      src={tile.imageUrl}
                      alt={tile.caption || 'Tile'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-2.5">
                    {tile.caption ? (
                      <h4 className="font-semibold text-slate-850 dark:text-slate-150 text-sm line-clamp-2 leading-tight">
                        {tile.caption}
                      </h4>
                    ) : (
                      <p className="text-xs italic text-slate-400 dark:text-slate-500">Untitled Inspiration</p>
                    )}

                    {tile.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tile.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-all select-none">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dominant Palette Swatches */}
                    {tile.colorPalette && tile.colorPalette.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">Colors:</span>
                        <div className="flex gap-1 overflow-x-auto py-0.5">
                          {tile.colorPalette.map((hex) => (
                            <div
                              key={hex}
                              className="w-4 h-4 rounded-md border border-slate-200 dark:border-slate-700"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <Modal 
          isOpen={true} 
          onClose={() => setSelectedImage(null)} 
          size="4xl" 
          title={selectedImage.caption || 'View Image'}
        >
          <div className="flex flex-col items-center">
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.caption} 
              className="max-h-[70vh] rounded-lg object-contain w-full"
            />
            {selectedImage.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {selectedImage.tags.map((tag) => (
                  <span key={tag} className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="card px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-transparent shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 line-clamp-1 break-all">
          {value}
        </p>
      </div>
    </div>
  );
}
