'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TradeLog } from '@/types';
import { getStoredTrades } from '@/lib/storage';
import EquityChart from '@/components/dashboard/EquityChart';
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
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [trades, setTrades] = useState<TradeLog[]>([]);

  useEffect(() => {
    setTrades(getStoredTrades());
  }, []);

  // Compute Metrics
  const totalPnl = trades.reduce((sum, trd) => sum + trd.pnl, 0);
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
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in">
      {/* Greeting Banner required by spec */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#E6F7F0]/40 to-white border border-[#E4E9E6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-bold mb-2 border border-[#05C46B]/20">
            <span>🐉 9 Naga Level Status: ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923]">
            {t('greetingBanner')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1">
            Trader Profile: <strong className="text-[#1E2923]">{user?.fullName || 'Filla Calon Wong Sugih 9 Naga'}</strong> | Style: <span className="text-[#05C46B] font-extrabold">{user?.tradingStyle || 'Scalping'}</span>
          </p>
        </div>

        <Link
          href="/journal"
          className="shrink-0 px-5 py-3 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-bold text-sm shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addTradeBtn')}</span>
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total PnL */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-xs font-bold uppercase">{t('totalPnl')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold ${totalPnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-[#6B7C72] mt-1 font-medium">Net Realized Profit</p>
        </div>

        {/* Win Rate */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-xs font-bold uppercase">{t('winRate')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#1E2923]">
            {winRate}%
          </p>
          <p className="text-[11px] text-[#6B7C72] mt-1 font-medium">{wins.length} Wins / {losses.length} Losses</p>
        </div>

        {/* Profit Factor */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-xs font-bold uppercase">{t('profitFactor')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#D4AF37] rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#D4AF37]">
            {profitFactor}
          </p>
          <p className="text-[11px] text-[#6B7C72] mt-1 font-medium">Gross Win vs Loss</p>
        </div>

        {/* Avg RR */}
        <div className="tradewire-card p-4">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-xs font-bold uppercase">{t('avgRR')}</span>
            <div className="p-2 bg-[#E6F7F0] text-[#05C46B] rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-[#1E2923]">
            1:{avgRR}
          </p>
          <p className="text-[11px] text-[#6B7C72] mt-1 font-medium">Risk Reward Average</p>
        </div>

        {/* Streak */}
        <div className="tradewire-card p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[#6B7C72] mb-2">
            <span className="text-xs font-bold uppercase">{t('streak')}</span>
            <div className={`p-2 rounded-xl ${isWinStreak ? 'bg-[#E6F7F0] text-[#05C46B]' : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'}`}>
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-extrabold ${isWinStreak ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}`}>
            {streakCount} {isWinStreak ? 'WIN 🔥' : 'LOSS'}
          </p>
          <p className="text-[11px] text-[#6B7C72] mt-1 font-medium">Current Consecutive</p>
        </div>
      </div>

      {/* Equity Curve Chart Component */}
      <EquityChart trades={trades} />

      {/* Recent Trades Table */}
      <div className="tradewire-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[#1E2923] text-lg">
            {t('recentTradesTitle')}
          </h3>
          <Link
            href="/journal"
            className="text-xs font-bold text-[#05C46B] hover:underline flex items-center"
          >
            <span>{t('viewAllTrades')}</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E9E6] text-[11px] font-extrabold uppercase text-[#6B7C72]">
                <th className="py-3 px-3">Pair</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Entry Price</th>
                <th className="py-3 px-3">Exit Price</th>
                <th className="py-3 px-3">Lot</th>
                <th className="py-3 px-3">RRR</th>
                <th className="py-3 px-3">Strategy</th>
                <th className="py-3 px-3 text-right">PnL ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E9E6] text-xs font-semibold">
              {recentTrades.map((trd) => (
                <tr key={trd.id} className="hover:bg-[#F8FAF9] transition-colors">
                  <td className="py-3 px-3 font-extrabold text-[#1E2923]">
                    {trd.pair}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        trd.type === 'BUY'
                          ? 'bg-[#E6F7F0] text-[#05C46B]'
                          : 'bg-[#FF4D4D]/10 text-[#FF4D4D]'
                      }`}
                    >
                      {trd.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#1E2923]">
                    {trd.entryPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-[#1E2923]">
                    {trd.exitPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-[#6B7C72]">
                    {trd.lotSize}
                  </td>
                  <td className="py-3 px-3 text-[#1E2923]">
                    1:{trd.rrRatio}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-[#F8FAF9] border border-[#E4E9E6] text-[10px] text-[#6B7C72]">
                      {trd.strategy}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold">
                    <span
                      className={`inline-flex items-center ${
                        trd.pnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'
                      }`}
                    >
                      {trd.pnl >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                      )}
                      {trd.pnl >= 0 ? '+' : ''}${trd.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
