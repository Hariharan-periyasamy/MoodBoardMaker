import { Sparkles } from 'lucide-react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeMap = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const borderMap = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`relative ${sizeMap[size]}`}>
        <div className={`${sizeMap[size]} ${borderMap[size]} border-slate-200 dark:border-slate-700 rounded-full`} />
        <div className={`absolute inset-0 ${sizeMap[size]} ${borderMap[size]} border-primary-600 border-t-transparent rounded-full animate-spin`} />
      </div>
      {text && <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = 'Loading…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-[#0a0a0f]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-brand-gradient opacity-20 blur-xl animate-pulse-slow" />
        <div className="w-10 h-10 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full animate-shimmer bg-[length:200%_100%]" />
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">{text}</p>
      </div>
    </div>
  );
}

// Inline shimmer skeleton
export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

