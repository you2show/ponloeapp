import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const { theme } = useTheme();

  const baseStyles = "inline-flex items-center justify-center font-bold rounded-full font-khmer";
  
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantStyles = {
    primary: theme === 'dark'
      ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50"
      : "bg-emerald-50 text-emerald-600 border border-emerald-100",
    secondary: theme === 'dark'
      ? "bg-slate-800 text-slate-300 border border-slate-700"
      : "bg-gray-100 text-gray-600 border border-gray-200",
    success: theme === 'dark'
      ? "bg-green-900/30 text-green-400 border border-green-800/50"
      : "bg-green-50 text-green-600 border border-green-100",
    danger: theme === 'dark'
      ? "bg-red-900/30 text-red-400 border border-red-800/50"
      : "bg-red-50 text-red-600 border border-red-100",
    warning: theme === 'dark'
      ? "bg-amber-900/30 text-amber-400 border border-amber-800/50"
      : "bg-amber-50 text-amber-600 border border-amber-100",
    info: theme === 'dark'
      ? "bg-blue-900/30 text-blue-400 border border-blue-800/50"
      : "bg-blue-50 text-blue-600 border border-blue-100",
    outline: theme === 'dark'
      ? "bg-transparent text-slate-400 border border-slate-700"
      : "bg-transparent text-gray-500 border border-gray-200",
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
