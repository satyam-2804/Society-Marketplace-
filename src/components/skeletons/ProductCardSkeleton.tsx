import React from 'react';

interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs animate-pulse">
      {/* Top Image Placeholder */}
      <div className="relative h-44 sm:h-48 w-full bg-slate-200/80 p-2 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-slate-300/60" />
        <div className="absolute top-3 left-3 h-4 w-14 bg-slate-300 rounded-full" />
      </div>

      {/* Details Placeholder */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-2.5 w-1/3 bg-slate-200 rounded" />
          <div className="h-4 w-4/5 bg-slate-200 rounded" />
          <div className="h-3 w-1/4 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-200 rounded" />
        </div>

        {/* Rating & Stock row */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-3.5 w-16 bg-slate-200 rounded" />
          <div className="h-3.5 w-14 bg-slate-200 rounded" />
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="space-y-1">
            <div className="h-5 w-16 bg-slate-200 rounded-md" />
            <div className="h-3 w-10 bg-slate-200 rounded" />
          </div>
          <div className="h-8 w-20 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
