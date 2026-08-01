'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function AppLogo({ className = '', size = 40, showText = true }: AppLogoProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center space-x-3 group ${className}`}>
      {!imgError ? (
        <img
          src="/logo.png"
          alt="KRtrade Logo"
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="rounded-xl object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
        />
      ) : (
        <div
          style={{ width: `${size}px`, height: `${size}px` }}
          className="rounded-xl bg-gradient-to-tr from-[#05C46B] to-[#04A75B] flex items-center justify-center text-white shadow-md shadow-[#05C46B]/20 group-hover:scale-105 transition-transform"
        >
          <TrendingUp className="w-3/5 h-3/5 text-white" />
        </div>
      )}

      {showText && (
        <div className="text-left">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-xl tracking-tight text-[#1E2923] font-montserrat">
              KRtrade
            </span>
          </div>
          <p className="text-[10px] font-semibold text-[#6B7C72] font-poppins">
            <span className="text-[#05C46B] font-bold">BETA Version 0.0.0.1</span>
          </p>
        </div>
      )}
    </div>
  );
}
