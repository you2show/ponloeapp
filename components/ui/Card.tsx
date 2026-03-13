import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: 'default' | 'bordered' | 'flat';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  variant = 'default',
}) => {
  const { theme } = useTheme();

  const baseStyles = "rounded-2xl transition-all duration-300 overflow-hidden";
  
  const variantStyles = {
    default: theme === 'dark' 
      ? "bg-slate-900 border border-slate-800 shadow-sm" 
      : "bg-white border border-gray-100 shadow-sm",
    bordered: theme === 'dark'
      ? "bg-transparent border border-slate-800"
      : "bg-transparent border border-gray-200",
    flat: theme === 'dark'
      ? "bg-slate-900/50"
      : "bg-gray-50",
  };

  const hoverStyles = hoverable 
    ? "hover:shadow-md hover:scale-[1.01] cursor-pointer active:scale-[0.99]" 
    : "";

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-b border-gray-100 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`p-4 border-t border-gray-100 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);
