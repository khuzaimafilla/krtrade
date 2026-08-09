'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/common/AppLogo';
import { TrendingUp, DollarSign, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
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
  const [username, setUsername] = useState(session?.user?.name?.replace(/\s+/g, '').toLowerCase() ?? '');
  const [bio, setBio] = useState('Trader aktif KRtrade Platform.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          bio,
          isOnboarded: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan profil. Coba lagi!');
        setIsLoading(false);
        return;
      }
      router.replace('/dashboard');
    } catch {
      setError('Terjadi kesalahan. Periksa koneksi internet Anda.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#042F2E] via-[#064E3B] to-[#042F2E] flex items-center justify-center p-4 font-poppins">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
        }}
      />

      <div className="relative w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <AppLogo size={40} showText={false} />
          </div>
          <h1 className="text-2xl font-black text-white font-montserrat">
            Selamat Datang! 🎉
          </h1>
          <p className="text-white/60 text-xs font-medium mt-1">
            Halo, <span className="text-[#10B981] font-bold">{session?.user?.name}</span>! Setup profil trading kamu dulu ya.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-5 shadow-2xl">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-white/80 text-xs font-extrabold uppercase tracking-wide">
              Username KRtrade
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="contoh: filla_trader"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm font-semibold outline-none focus:border-[#05C46B] transition-colors min-h-[44px]"
            />
            <p className="text-white/40 text-[10px] font-medium">
              Hanya huruf kecil, angka, dan underscore. Tidak bisa diubah nanti.
            </p>
          </div>

          {/* Trading Style */}
          <div className="space-y-2">
            <label className="text-white/80 text-xs font-extrabold uppercase tracking-wide">
              Gaya Trading
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRADING_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => setTradingStyle(style)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition-all min-h-[44px] active:scale-95 ${
                    tradingStyle === style
                      ? 'bg-[#05C46B] text-white shadow-lg shadow-[#05C46B]/30'
                      : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-white/80 text-xs font-extrabold uppercase tracking-wide">
              Mata Uang Akun
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CURRENCIES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setAccountCurrency(value)}
                  className={`py-2.5 rounded-xl text-center transition-all min-h-[44px] active:scale-95 ${
                    accountCurrency === value
                      ? 'bg-[#05C46B] text-white shadow-lg shadow-[#05C46B]/30'
                      : 'bg-white/10 text-white/60 border border-white/10 hover:bg-white/20'
                  }`}
                >
                  <p className="font-extrabold text-xs">{label}</p>
                  <p className={`text-[9px] font-medium ${accountCurrency === value ? 'text-white/80' : 'text-white/40'}`}>{desc.split('—')[1]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Initial Balance */}
          <div className="space-y-2">
            <label className="text-white/80 text-xs font-extrabold uppercase tracking-wide flex items-center space-x-1">
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
                className="w-full pl-4 pr-16 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm font-bold outline-none focus:border-[#05C46B] transition-colors min-h-[44px]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xs font-bold">
                {accountCurrency === 'IDR' ? 'Rp' : accountCurrency === 'CENT' ? 'USc' : '$'}
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-white/80 text-xs font-extrabold uppercase tracking-wide">
              Bio Singkat
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Ceritakan sedikit tentang gaya trading kamu..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-xs font-medium outline-none focus:border-[#05C46B] transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[#EF4444] text-xs font-bold text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleFinish}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm shadow-lg shadow-[#05C46B]/30 transition-all min-h-[52px] active:scale-95 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Selesai — Masuk Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
