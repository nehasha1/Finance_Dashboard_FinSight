import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Wallet Base (Value) */}
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      
      {/* The "Sight" Lens (Vision/Insight) */}
      <circle cx="12" cy="14" r="3" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      
      {/* Insight Sparkle (representing the 'Sight' in FinSight) */}
      <path d="M7 11h.01" />
      <path d="M17 11h.01" />
    </svg>
  );
};

export default Logo;
