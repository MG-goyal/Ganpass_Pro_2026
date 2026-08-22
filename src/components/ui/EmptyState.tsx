import React from 'react';
import { Button } from './Button';
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div className={`p-8 md:p-12 text-center rounded-2xl border border-stone-200/80 bg-white shadow-xs max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center mx-auto mb-4">
        {icon || <Sparkles className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-600 mb-6 leading-relaxed max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="amber" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}> = ({
  title = 'Something went wrong',
  description = "We couldn't load this information. Please check your connection and try again.",
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-8 md:p-12 text-center rounded-2xl border border-rose-200/80 bg-rose-50/50 max-w-lg mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-sm text-stone-600 mb-6 leading-relaxed max-w-sm mx-auto">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="md" leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
};
