import React from 'react';

interface StoreGridSkeletonProps {
  count?: number;
}

export const StoreCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs p-0 animate-pulse">
      {/* Top Banner Placeholder */}
      <div className="relative h-32 w-full bg-slate-200/80">
        <div className="absolute top-3 left-3 h-5 w-20 bg-slate-300 rounded-full" />
        <div className="absolute top-3 right-3 h-5 w-16 bg-slate-300 rounded-full" />
      </div>

      {/* Body Content Placeholder */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-3 w-1/2 bg-slate-200 rounded-md" />
          </div>
          <div className="h-5 w-12 bg-slate-200 rounded-lg shrink-0" />
        </div>

        {/* Metadata row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="h-3 w-24 bg-slate-200 rounded-md" />
          <div className="h-3 w-16 bg-slate-200 rounded-md" />
        </div>

        {/* Action Button */}
        <div className="h-9 w-full bg-slate-200 rounded-xl mt-2" />
      </div>
    </div>
  );
};

export const StoreGridSkeleton: React.FC<StoreGridSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <StoreCardSkeleton key={index} />
      ))}
    </div>
  );
};
