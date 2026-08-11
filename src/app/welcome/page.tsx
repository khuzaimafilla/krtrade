'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import AppLogo from '@/components/common/AppLogo';
import { Crown, Sparkles, ArrowRight, TrendingUp, Gem, Globe, ShieldCheck } from 'lucide-react';

export default function WelcomePage() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-poppins overflow-x-hidden">
      
      {/* Main Card */}
      <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 rounded-[2rem] p-8 max-w-md w-full text-center relative overflow-hidden animate-fade-in">
        
        {/* Soft decorative blur inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#10B981]/5 blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#5865F2]/5 blur-2xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
            <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center space-x-1">
              <span>[ 💎 PORTAL TRADING ORANG KAYA 💎 ]</span>
            </p>
          </div>

          {/* Logo & Branding */}
          <div className="space-y-4 w-full">
            <div className="flex justify-center">
              <AppLogo size={56} showText={false} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 font-montserrat tracking-tight">
                {t('welcomeHeader')}
              </h1>
              <p className="text-[#10B981] font-bold text-xs mt-1 tracking-wider">BETA v0.0.0.1</p>
            </div>
          </div>

          {/* Value Proposition Highlights */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <TrendingUp className="w-5 h-5 text-[#10B981] mb-2" />
              <p className="font-bold text-xs text-slate-700">High Winrate</p>
              <p className="text-[10px] text-slate-500 mt-1">Pencatatan RRR & Strategy</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <Crown className="w-5 h-5 text-amber-400 mb-2" />
              <p className="font-bold text-xs text-slate-700">Leaderboard</p>
              <p className="text-[10px] text-slate-500 mt-1">Rank Komunitas & Friends</p>
            </div>
          </div>

          {/* Language Controls (ID / EN) */}
          <div className="flex items-center justify-center space-x-2 w-full p-1 bg-slate-50 border border-slate-100 rounded-2xl">
            <Globe className="w-4 h-4 text-slate-400 ml-2" />
            <div className="flex-1 flex p-1">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === 'id'
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                🇮🇩 ID
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  language === 'en'
                    ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Action Button: Selanjutnya / Next */}
          <Link
            href="/auth"
            className="bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md shadow-[#10B981]/20 transition-all duration-200 flex items-center justify-center gap-2 w-full min-h-[48px] cursor-pointer hover:-translate-y-0.5"
          >
            <span>{t('nextButton')} / Next</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-semibold pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>🔒 Encrypted & Verified Trading System</span>
          </div>
        </div>
      </div>
      
      <p className="text-center text-slate-400 text-[10px] font-semibold mt-8">
        KRTrade Beta v0.0.0.1 · By Khuzaima Filla
      </p>

    </div>
  );
}
