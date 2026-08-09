'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from './AppLogo';

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

    // 5 second progress counter
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 font-poppins ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-8 text-center p-6 max-w-sm w-full animate-fade-in">
        {/* Popping-out Logo Container */}
        <div className="relative group transform transition-transform duration-700 hover:scale-105">
          <div className="absolute -inset-4 bg-[#E6F7F0] rounded-full blur-xl opacity-70 animate-pulse" />
          <div className="relative bg-white p-4 rounded-3xl border border-[#E4E9E6] shadow-xl">
            <AppLogo size={72} showText={true} />
          </div>
        </div>

        {/* Loading Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="w-full h-2 bg-[#F8FAF9] border border-[#E4E9E6] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#05C46B] to-[#04A75B] rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7C72]">
            <span className="font-montserrat uppercase tracking-wider text-[#05C46B]">
              Memuat KRTrade Platform...
            </span>
            <span className="font-mono text-[#1E2923] font-extrabold">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
