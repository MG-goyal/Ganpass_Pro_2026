import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return <div className={`animate-pulse bg-stone-200/80 rounded-lg ${className}`} />;
};

export const MandalCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="pt-2">
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col md:flex-row">
      <Skeleton className="h-48 md:h-auto md:w-64 shrink-0 rounded-none" />
      <div className="p-5 space-y-3 flex-1">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <div className="pt-3 flex gap-3">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
