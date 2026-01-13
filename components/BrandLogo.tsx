
import React from 'react';
import { Sparkles } from 'lucide-react';

export const BrandLogo = ({ size = 40, className = "" }: { size?: number, className?: string }) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full"></div>
      <div className="relative z-10 w-full h-full bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
        <Sparkles size={size * 0.5} className="text-white fill-white/20" />
      </div>
    </div>
  );
};
