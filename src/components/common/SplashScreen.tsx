'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from './AppLogo';
import { Loader2 } from 'lucide-react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('krtrade_splash_shown');
    if (hasLoaded) {
      setIsVisible(false);
      return;
    }

    // 4.5 second progress counter
    const startTime = Date.now();
    const duration = 4500; // 4.5s load + 0.5s fade out = 5s total

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => {
          setIsVisible(false);
          sessionStorage.setItem('krtrade_splash_shown', 'true');
        }, 500);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f8fafc] transition-opacity duration-500 font-poppins ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center p-6 max-w-sm w-full animate-fade-in relative">
        {/* Soft decorative blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#10B981]/10 blur-3xl pointer-events-none" />

        {/* Logo Container */}
        <div className="relative group transform transition-transform duration-700 hover:scale-105 mb-10">
          <div className="relative bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
            <AppLogo size={72} showText={false} />
          </div>
        </div>

        {/* Loading Progress Bar & Percentage */}
        <div className="w-full max-w-[240px] space-y-3 relative z-10">
          <div className="flex items-center justify-center space-x-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Memuat KRTrade...
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      <p className="absolute bottom-8 text-center text-slate-400 text-[10px] font-semibold">
        KRTrade Beta v0.0.0.1
      </p>
    </div>
  );
}
