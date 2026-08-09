'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/common/AppLogo';
import { DollarSign, Loader2, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { AccountCurrency, TradingStyle } from '@/types';

const TRADING_STYLES: TradingStyle[] = ['Scalping', 'Intraday', 'Swing Trade'];
const CURRENCIES: { value: AccountCurrency; label: string; desc: string }[] = [
  { value: 'USD', label: 'USD', desc: 'US Dollar — $' },
  { value: 'CENT', label: 'CENT', desc: 'Cent Account — USc' },
  { value: 'IDR', label: 'IDR', desc: 'Rupiah Indonesia — Rp' },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [tradingStyle, setTradingStyle] = useState<TradingStyle>('Scalping');
  const [initialBalance, setInitialBalance] = useState('10000');
  const [accountCurrency, setAccountCurrency] = useState<AccountCurrency>('USD');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill username when session loads
  React.useEffect(() => {
    if (session?.user?.name && !username) {
      const sanitized = session.user.name.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setUsername(sanitized);
    }
  }, [session?.user?.name]);

  const handleFinish = async () => {
    if (!username.trim()) {
      setError('Username wajib diisi!');
      return;
    }
    if (username.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          tradingStyle,
          initialBalance: parseFloat(initialBalance) || 10000,
          accountCurrency,
          bio: 'Trader aktif KRTrade Platform.', // Default bio
          isOnboarded: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan profil. Coba lagi!');
        setIsLoading(false);
        return;
      }
      
      // Force reload to update session and contexts
      window.location.href = '/dashboard';
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-poppins overflow-x-hidden">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <AppLogo size={48} showText={false} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 font-montserrat tracking-tight">
            Selamat Datang! 🎉
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Halo, <strong className="text-[#05C46B]">{session?.user?.name}</strong>! Setup profil trading kamu dulu ya.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden space-y-6">
          
          {/* Soft decorative blur inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#10B981]/5 blur-2xl pointer-events-none -mr-16 -mt-16" />

          {/* Username */}
          <div className="space-y-2 relative z-10">
            <label className="text-slate-500 text-xs font-black uppercase tracking-wide">
              Username KRTrade
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="contoh: filla_trader"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-bold outline-none focus:border-[#05C46B] focus:ring-1 focus:ring-[#05C46B] transition-all"
            />
            <p className="text-slate-400 text-[10px] font-semibold">
              Hanya huruf kecil, angka, dan underscore. Tidak bisa diubah nanti.
            </p>
          </div>

          {/* Trading Style */}
          <div className="space-y-2 relative z-10">
            <label className="text-slate-500 text-xs font-black uppercase tracking-wide">
              Gaya Trading
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRADING_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setTradingStyle(style)}
                  className={`py-3 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                    tradingStyle === style
                      ? 'bg-[#05C46B] text-white shadow-md shadow-[#05C46B]/20 border border-[#05C46B]'
                      : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-100 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 text-[10px] font-bold leading-relaxed">
                Peringatan: Gaya Trading yang dipilih akan dikunci permanen untuk menjaga kedisiplinan jurnal Anda!
              </p>
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2 relative z-10">
            <label className="text-slate-500 text-xs font-black uppercase tracking-wide">
              Mata Uang Akun
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setAccountCurrency(value)}
                  className={`py-2.5 rounded-xl text-center transition-all active:scale-95 border ${
                    accountCurrency === value
                      ? 'bg-[#05C46B] text-white shadow-md shadow-[#05C46B]/20 border-[#05C46B]'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <p className="font-extrabold text-xs">{label}</p>
                  <p className={`text-[9px] font-bold ${accountCurrency === value ? 'text-white/80' : 'text-slate-400'}`}>{desc.split('—')[1]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2 relative z-10">
            <label className="text-slate-500 text-xs font-black uppercase tracking-wide flex items-center space-x-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Modal Awal</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="10000"
                min="0"
                className="w-full pl-4 pr-16 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-extrabold outline-none focus:border-[#05C46B] focus:ring-1 focus:ring-[#05C46B] transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">
                {accountCurrency === 'IDR' ? 'Rp' : accountCurrency === 'CENT' ? 'USc' : '$'}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleFinish}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-xl bg-[#1E2923] hover:bg-black text-white font-extrabold text-sm shadow-lg shadow-slate-900/20 transition-all min-h-[52px] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2 relative z-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#05C46B]" />
                <span>Selesai — Masuk Dashboard</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
