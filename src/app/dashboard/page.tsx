'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TradeLog, formatCurrencyAmount } from '@/types';
import { getStoredTrades } from '@/lib/storage';
import EquityChart from '@/components/dashboard/EquityChart';
import CreatorBadge from '@/components/common/CreatorBadge';
import {
  TrendingUp,
  Percent,
  Award,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Plus,
  Wallet,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [trades, setTrades] = useState<TradeLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTrades(getStoredTrades());
  }, [user]);

  // Compute Metrics
  const currency = user?.accountCurrency || 'USD';
  const initialBalance = user?.initialBalance || 10000;
  const totalPnl = trades.reduce((sum, trd) => sum + trd.pnl, 0);
  const currentBalance = initialBalance + totalPnl;

  const wins = trades.filter((trd) => trd.pnl > 0);
  const losses = trades.filter((trd) => trd.pnl < 0);
  const winRate = trades.length > 0 ? ((wins.length / trades.length) * 100).toFixed(1) : '0';

  const grossProfit = wins.reduce((sum, trd) => sum + trd.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, trd) => sum + trd.pnl, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '99.9' : '0.00';

  const avgRR = trades.length > 0
    ? (trades.reduce((sum, trd) => sum + trd.rrRatio, 0) / trades.length).toFixed(1)
    : '0.0';

  // Streak calculation
  let streakCount = 0;
  let isWinStreak = true;
  if (trades.length > 0) {
    const sorted = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    isWinStreak = sorted[0].pnl >= 0;
    for (const trd of sorted) {
      if ((trd.pnl >= 0) === isWinStreak) {
        streakCount++;
      } else {
        break;
      }
    }
  }

  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in font-poppins">
      {/* Greeting Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#E6F7F0]/40 to-white border border-[#E4E9E6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trader Status: ACTIVE TRADER</span>
            </span>
            {mounted && user?.username && (
              <CreatorBadge username={user.username} size="sm" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
            {t('greetingBanner')}
          </h1>

          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Trader Profile:{' '}
            <strong className="text-[#1E2923]">
              {mounted ? (user?.fullName || 'Trader Pro') : 'Trader Pro'}
            </strong>{' '}
            | Style:{' '}
            <span className="text-[#05C46B] font-extrabold">
              {mounted ? (user?.tradingStyle || 'Scalping') : 'Scalping'}
            </span>
          </p>
        </div>

        <Link
          href="/journal"
          className="shrink-0 px-5 py-3 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTradeBtn')}</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Account Balance */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-[10px] font-extrabold uppercase">Total Equity</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#1E2923]">
            {formatCurrencyAmount(currentBalance, user?.accountCurrency || 'USD')}
          </p>
          <p className="text-[10px] text-[#6B7C72] font-medium mt-1">
            Saldo Awal: {formatCurrencyAmount(initialBalance, user?.accountCurrency || 'USD')}
          </p>
        </div>

        {/* Total PnL */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-[10px] font-extrabold uppercase">{t('totalPnl')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold ${totalPnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}`}>
            {totalPnl >= 0 ? '+' : ''}{formatCurrencyAmount(Math.abs(totalPnl), currency)}
          </p>
          <p className="text-[10px] text-[#6B7C72] font-medium mt-1">Net Cumulative PnL</p>
        </div>

        {/* Win Rate */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-[10px] font-extrabold uppercase">{t('winRate')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#1E2923]">
            {winRate}%
          </p>
          <p className="text-[10px] text-[#6B7C72] font-medium mt-1">
            {wins.length} Win / {losses.length} Loss
          </p>
        </div>

        {/* Profit Factor */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-[10px] font-extrabold uppercase">{t('profitFactor')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#1E2923]">
            {profitFactor}
          </p>
          <p className="text-[10px] text-[#6B7C72] font-medium mt-1">Ratio Profit / Loss</p>
        </div>

        {/* Win/Loss Streak */}
        <div className="tradewire-card p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-[10px] font-extrabold uppercase">{t('streak')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold ${isWinStreak ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}`}>
            {streakCount} {isWinStreak ? 'WIN' : 'LOSS'}
          </p>
          <p className="text-[10px] text-[#6B7C72] font-medium mt-1">Beruntun Terakhir</p>
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="tradewire-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#1E2923] font-montserrat">
              {t('equityCurveTitle')}
            </h3>
            <p className="text-xs text-[#6B7C72] font-medium">
              Kurva akumulasi pertumbuhan saldo akun trading
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30">
            Initial: {formatCurrencyAmount(initialBalance, currency)}
          </div>
        </div>

        <EquityChart trades={trades} initialBalance={initialBalance} currency={currency} />
      </div>

      {/* Recent Trades Table */}
      <div className="tradewire-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-[#1E2923] font-montserrat">
            {t('recentTradesTitle')}
          </h3>
          <Link
            href="/journal"
            className="text-xs font-extrabold text-[#05C46B] hover:text-[#04A75B] flex items-center space-x-1"
          >
            <span>{t('viewAllTrades')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTrades.length === 0 ? (
          <div className="text-center py-10 text-[#6B7C72]">
            <p className="text-sm font-bold">Belum ada transaksi trading dicatat.</p>
            <p className="text-xs mt-1">
              Klik tombol <strong className="text-[#05C46B] font-extrabold">&ldquo;+ Catat Transaksi Baru&rdquo;</strong> di atas untuk mulai mencatat transaksi pertama Anda!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-[#6B7C72] font-extrabold uppercase border-b border-[#E4E9E6]">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Pair</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Lot</th>
                  <th className="p-3">Entry / Exit</th>
                  <th className="p-3">Strategi</th>
                  <th className="p-3 text-right">PnL ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E6]">
                {recentTrades.map((trd) => (
                  <tr key={trd.id} className="hover:bg-[#F8FAF9] transition-colors font-medium">
                    <td className="p-3 text-[#6B7C72]">
                      {new Date(trd.date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="p-3 font-extrabold text-[#1E2923]">{trd.pair}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          trd.type === 'BUY'
                            ? 'bg-[#E6F7F0] text-[#05C46B]'
                            : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                        }`}
                      >
                        {trd.type}
                      </span>
                    </td>
                    <td className="p-3 text-[#1E2923]">{trd.lotSize}</td>
                    <td className="p-3 text-[#6B7C72]">
                      {trd.entryPrice} $\rightarrow$ {trd.exitPrice}
                    </td>
                    <td className="p-3 text-[#6B7C72]">{trd.strategy}</td>
                    <td
                      className={`p-3 text-right font-extrabold ${
                        trd.pnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'
                      }`}
                    >
                      {trd.pnl >= 0 ? '+' : ''}{formatCurrencyAmount(Math.abs(trd.pnl), currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
