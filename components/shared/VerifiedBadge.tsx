import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon, CrownIcon } from '@hugeicons/core-free-icons';

interface VerifiedBadgeProps {
  role: 'admin' | 'scholar' | 'premium' | 'general' | string;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ role, className = '' }) => {
  if (role === 'scholar' || role === 'admin') {
    return (
      <HugeiconsIcon 
        icon={CheckmarkBadge01Icon} 
        strokeWidth={2} 
        className={`text-blue-500 fill-blue-500/20 ${className}`} 
      />
    );
  }
  
  if (role === 'premium') {
    return (
      <HugeiconsIcon 
        icon={CrownIcon} 
        strokeWidth={2} 
        className={`text-amber-500 fill-amber-500/20 ${className}`} 
      />
    );
  }

  // Fallback for general verified users if any
  return (
    <HugeiconsIcon 
      icon={CheckmarkBadge01Icon} 
      strokeWidth={2} 
      className={`text-emerald-500 fill-emerald-500/20 ${className}`} 
    />
  );
};
