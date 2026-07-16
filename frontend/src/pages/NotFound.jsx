import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0f] p-6">
      <div className="text-center animate-slide-up max-w-lg">
        {/* Giant 404 */}
        <div className="relative mb-8 inline-block">
          <span className="text-[10rem] font-black leading-none text-transparent bg-gradient-to-br from-primary-200 to-violet-200 dark:from-primary-900/50 dark:to-violet-900/50 bg-clip-text select-none">
            404
          </span>
          <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-primary-400/20 to-violet-400/20 rounded-full" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another location.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary btn-lg">
            <Home className="w-5 h-5" /> Go to Dashboard
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary btn-lg">
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
