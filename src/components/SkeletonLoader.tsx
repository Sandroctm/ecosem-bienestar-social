import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'table' | 'card' | 'text' | 'dashboard';
  rows?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'table',
  rows = 4,
}) => {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-8 bg-slate-800/80 rounded w-2/3" />
            <div className="h-3 bg-slate-800/50 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-900/80 border border-slate-800 rounded-3xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-slate-900/60 border border-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Default 'table' or 'text'
  return (
    <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3 animate-pulse">
      <div className="h-6 bg-slate-800 rounded w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 py-2 border-b border-slate-800/50">
          <div className="h-8 w-8 bg-slate-800 rounded-full shrink-0" />
          <div className="h-4 bg-slate-800/80 rounded w-1/3" />
          <div className="h-4 bg-slate-800/60 rounded w-1/4" />
          <div className="h-4 bg-slate-800/40 rounded w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
};
