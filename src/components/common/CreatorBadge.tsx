'use client';

import React from 'react';
import { Code2, ShieldCheck } from 'lucide-react';
import { isCreatorUser } from '@/types';

interface CreatorBadgeProps {
  username?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function CreatorBadge({ username, size = 'md', className = '' }: CreatorBadgeProps) {
  if (!isCreatorUser(username)) return null;

  if (size === 'sm') {
    return (
      <span
        title="App Developer & Creator"
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#05C46B] text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-sm shadow-[#D4AF37]/30 border border-[#D4AF37]/60 font-montserrat ${className}`}
      >
        <Code2 className="w-2.5 h-2.5 text-slate-900" />
        <span>DEVELOPER</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF3A7] to-[#05C46B] text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-[#D4AF37]/40 border border-[#D4AF37] font-montserrat ${className}`}
      >
        <Code2 className="w-3.5 h-3.5 text-slate-950" />
        <span>DEVELOPER</span>
        <ShieldCheck className="w-3.5 h-3.5 text-slate-950 ml-0.5" />
      </div>
    );
  }

  return (
    <span
      title="App Developer & Creator"
      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#05C46B] text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-sm shadow-[#D4AF37]/30 border border-[#D4AF37]/50 font-montserrat ${className}`}
    >
      <Code2 className="w-3 h-3 text-slate-900" />
      <span>DEVELOPER</span>
    </span>
  );
}
