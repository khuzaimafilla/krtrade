'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import AppLogo from '@/components/common/AppLogo';
import { Crown, Sparkles, ArrowRight, TrendingUp, Gem, Globe } from 'lucide-react';

export default function WelcomePage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#05C46B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 text-center animate-fade-in">
        {/* Logo Component */}
        <div className="flex justify-center mb-4">
          <AppLogo size={52} showText={false} />
        </div>

        {/* Luxury Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#E6F7F0] border border-[#05C46B]/30 text-[#05C46B] text-xs font-extrabold mb-4 shadow-sm">
          <Gem className="w-4 h-4 text-[#D4AF37]" />
          <span>PORTAL TRADING ORANG KAYA</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Main Header */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] leading-tight mb-2 font-montserrat">
          {t('welcomeHeader')}
        </h1>

        {/* Bold App Name */}
        <div className="my-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#05C46B] drop-shadow-sm font-montserrat">
            KRtrade
          </span>
        </div>

        {/* Version Tag */}
        <div className="inline-block px-4 py-1 rounded-xl bg-[#F8FAF9] border border-[#D4AF37]/40 mb-6">
          <p className="text-xs font-bold text-[#6B7C72]">
            <span className="text-[#D4AF37] font-extrabold">BETA Version 0.0.0.1</span>
          </p>
        </div>

        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6]">
            <TrendingUp className="w-5 h-5 text-[#05C46B] mb-1" />
            <p className="font-bold text-xs text-[#1E2923]">High Winrate Journal</p>
            <p className="text-[11px] text-[#6B7C72]">Pencatatan RRR & Strategy Tag</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6]">
            <Crown className="w-5 h-5 text-[#D4AF37] mb-1" />
            <p className="font-bold text-xs text-[#1E2923]">Leaderboard 9 Naga</p>
            <p className="text-[11px] text-[#6B7C72]">Rank Komunitas & Friends</p>
          </div>
        </div>

        {/* Language Controls (ID / EN) */}
        <div className="flex items-center justify-center space-x-2 p-2.5 mb-6 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6]">
          <Globe className="w-4 h-4 text-[#05C46B] mr-1" />
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              language === 'id'
                ? 'bg-[#05C46B] text-white shadow-sm font-extrabold'
                : 'text-[#6B7C72] hover:text-[#1E2923]'
            }`}
          >
            🇮🇩 ID
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-[#05C46B] text-white shadow-sm font-extrabold'
                : 'text-[#6B7C72] hover:text-[#1E2923]'
            }`}
          >
            🇬🇧 EN
          </button>
        </div>

        {/* Action Button: Selanjutnya / Next */}
        <Link
          href="/auth"
          className="w-full py-4 px-6 bg-gradient-to-r from-[#05C46B] to-[#04A75B] hover:from-[#04A75B] hover:to-[#038A4B] text-white font-black text-base rounded-2xl shadow-xl shadow-[#05C46B]/30 transition-all flex items-center justify-center space-x-2 group hover:scale-[1.02]"
        >
          <span>{t('nextButton')} / Next</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-[11px] text-[#6B7C72] mt-4 font-semibold">
          🔒 Encrypted & Verified Trading System
        </p>
      </div>
    </div>
  );
}
