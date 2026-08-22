import React from 'react';
import { EventStatus } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'stone' | 'featured';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap',
    md: 'text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap',
  };

  const variantClasses = {
    default: 'bg-stone-100 text-stone-700 border border-stone-200/80',
    stone: 'bg-stone-900 text-white',
    amber: 'bg-amber-50 text-amber-900 border border-amber-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    indigo: 'bg-indigo-50 text-indigo-800 border border-indigo-200/80',
    featured: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-900 border border-amber-300 font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: EventStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'LIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          LIVE NOW
        </span>
      );
    case 'UPCOMING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          UPCOMING
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200 ${className}`}
        >
          COMPLETED
        </span>
      );
    default:
      return null;
  }
};
