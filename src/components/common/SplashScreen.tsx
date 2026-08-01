'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from './AppLogo';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem('krtrade_splash_shown');
    if (hasLoaded) {
      setIsVisible(false);
      return;
    }

    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 1200);

    const timer2 = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('krtrade_splash_shown', 'true');
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FAF9] transition-opacity duration-400 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-6 animate-fade-in text-center p-6">
        <AppLogo size={64} showText={true} />

        <div className="w-48 h-1 bg-[#E4E9E6] rounded-full overflow-hidden relative">
          <div className="w-full h-full bg-[#05C46B] rounded-full animate-pulse origin-left" />
        </div>

        <p className="text-xs font-semibold text-[#6B7C72] tracking-wider font-poppins">
          Loading Pencatatan Orang Kaya...
        </p>
      </div>
    </div>
  );
}
