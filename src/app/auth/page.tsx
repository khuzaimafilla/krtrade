'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/common/AppLogo';
import { Loader2, ShieldCheck, TrendingUp, BookOpen, Users, Trophy } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, label: 'Trading Journal', desc: 'Catat setiap trade dengan R:R, screenshot, & strategi' },
  { icon: BookOpen, label: 'Chart Analysis', desc: 'Analisis chart interaktif dengan tool R:R langsung di app' },
  { icon: Users, label: 'Komunitas', desc: 'Bergabung grup trading, share insight, & berkembang bersama' },
  { icon: Trophy, label: 'Leaderboard', desc: 'Kompetisi sehat — lihat performa terbaik antar trader' },
];

export default function AuthPage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('discord', { callbackUrl: '/dashboard' });
    } catch {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <Loader2 className="w-8 h-8 text-[#05C46B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-poppins">
      
      {/* Main Login Card */}
      <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 rounded-[2rem] p-8 max-w-md w-full text-center relative overflow-hidden">
        
        {/* Soft decorative blur inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#10B981]/5 blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-[#5865F2]/5 blur-2xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 flex flex-col items-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
            <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase">
              [ 💎 PORTAL TRADING ORANG KAYA 💎 ]
            </p>
          </div>

          {/* Logo & Branding */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <AppLogo size={56} showText={false} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 font-montserrat tracking-tight">
                Welcome to KRtrade!
              </h1>
              <p className="text-[#10B981] font-bold text-xs mt-1 tracking-wider">BETA v0.0.0.1</p>
              <p className="text-slate-500 text-sm mt-3 font-medium px-4">
                Platform jurnal trading & komunitas eksklusif untuk trader profesional.
              </p>
            </div>
          </div>

          {/* Discord Login Button */}
          <button
            id="discord-login-btn"
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="bg-[#5865F2] hover:bg-[#4752C4] active:scale-95 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-[#5865F2]/25 transition-all duration-200 flex items-center justify-center gap-3 w-full min-h-[48px] cursor-pointer hover:-translate-y-0.5 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menghubungkan ke Discord...</span>
              </>
            ) : (
              <>
                {/* Discord icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.08.114 18.102.13 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Login via Discord</span>
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-semibold pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>🔒 Encrypted & Verified Trading System</span>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="mt-8 grid grid-cols-2 gap-3 max-w-md w-full px-2">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md hover:border-slate-200 transition-all"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-[#10B981]" />
              <span className="text-slate-700 text-[11px] font-extrabold uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-slate-500 text-[10px] font-medium leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      
      <p className="text-center text-slate-400 text-[10px] font-semibold mt-8">
        KRtrade Beta v0.0.0.1 · By Khuzaima Filla
      </p>

    </div>
  );
}
