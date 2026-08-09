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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
        <Loader2 className="w-8 h-8 text-[#05C46B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#042F2E] bg-gradient-to-br from-[#042F2E] via-[#064E3B] to-[#042F2E] flex flex-col items-center justify-center relative overflow-x-hidden font-poppins">
      {/* Decorative background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 40px)',
        }}
      />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#05C46B]/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur border border-white/20 shadow-2xl">
              <AppLogo size={48} showText={false} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white font-montserrat tracking-tight">
              KRtrade
            </h1>
            <p className="text-[#10B981] font-bold text-sm">Kronik Reward — Trading Journal</p>
            <p className="text-white/50 text-xs mt-1 font-medium">
              Platform jurnal trading & komunitas untuk trader 9 Naga
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="text-center">
            <p className="text-white font-extrabold text-base font-montserrat">
              Masuk ke Akun Anda
            </p>
            <p className="text-white/60 text-xs font-medium mt-1">
              Gunakan akun Discord untuk login cepat & aman
            </p>
          </div>

          {/* Discord Login Button */}
          <button
            id="discord-login-btn"
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-extrabold text-white text-sm transition-all duration-200 ease-in-out min-h-[48px] touch-manipulation ${
              isLoading
                ? 'bg-[#5865F2]/50 cursor-not-allowed shadow-none'
                : 'bg-[#5865F2] hover:bg-[#4752C4] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5865F2]/30 active:scale-95 active:translate-y-0 shadow-md'
            }`}
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
                <span>👾 Login via Discord</span>
              </>
            )}
          </button>

          {/* Security note */}
          <div className="flex items-center justify-center space-x-2 text-white/40 text-[10px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Aman · Tidak menyimpan password · OAuth 2.0</span>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-2.5">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-3 space-y-1.5"
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-white text-[10px] font-extrabold">{label}</span>
              </div>
              <p className="text-white/40 text-[9px] font-medium leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-[10px] font-medium">
          KRtrade Beta v0.0.0.1 · By Khuzaima Filla
        </p>
      </div>
    </div>
  );
}
