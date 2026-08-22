import React, { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'editorial' | 'editorial-outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  pill = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-wider transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#F27D26]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none';

  const radiusClass = pill ? 'rounded-full' : 'rounded-xl';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8 uppercase tracking-wider',
    md: 'text-xs px-5 py-2.5 gap-2 h-10 uppercase tracking-widest',
    lg: 'text-sm px-7 py-3.5 gap-2.5 h-12 uppercase tracking-widest',
  };

  const variantClasses = {
    primary: 'bg-[#1A1A1A] text-white hover:bg-[#F27D26] hover:border-[#F27D26] shadow-xs border border-[#1A1A1A]',
    editorial: 'bg-[#F27D26] text-white hover:bg-[#e06d19] shadow-sm border border-[#F27D26]',
    'editorial-outline': 'bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white',
    amber: 'bg-[#F27D26] text-white hover:bg-[#e06d19] shadow-sm border border-[#F27D26]',
    secondary: 'bg-stone-100 text-[#1A1A1A] hover:bg-stone-200 border border-stone-200/80',
    outline: 'bg-transparent border border-stone-300 text-stone-800 hover:bg-stone-100 hover:text-stone-900',
    ghost: 'bg-transparent text-stone-600 hover:bg-stone-100/80 hover:text-stone-900',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs',
  };

  return (
    <button
      className={`${baseClasses} ${radiusClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
