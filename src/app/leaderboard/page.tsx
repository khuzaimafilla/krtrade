'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { TradingStyle, LeaderboardEntry } from '@/types';
import AddFriendModal from '@/components/modals/AddFriendModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Trophy, Users, UserCheck, Crown, UserPlus, RefreshCw } from 'lucide-react';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Scope Switcher Tabs: [ Friends Only | Community Members | Global ]
  const [scopeTab, setScopeTab] = useState<'friends' | 'community' | 'global'>('global');

  // Trading Style Filters: [ All Methods | Scalping | Intraday | Swing Trade ]
  const [styleFilter, setStyleFilter] = useState<'ALL' | TradingStyle>('ALL');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);

      if (isSupabaseConfigured) {
        try {
          // Fetch profiles
          const { data: profilesData } = await supabase.from('profiles').select('*');
          // Fetch trades
          const { data: tradesData } = await supabase.from('trades').select('*');
          // Fetch friendships
          const { data: friendshipsData } = await supabase.from('friendships').select('*');

          if (profilesData && profilesData.length > 0) {
            const friendUserIds = new Set<string>();
            if (currentUser && friendshipsData) {
              friendshipsData.forEach((f) => {
                if (f.requester_id === currentUser.id) friendUserIds.add(f.addressee_id);
                if (f.addressee_id === currentUser.id) friendUserIds.add(f.requester_id);
              });
            }

            const entries: LeaderboardEntry[] = profilesData.map((p, index) => {
              const userTrades = tradesData ? tradesData.filter((t) => t.user_id === p.id) : [];
              const totalTrades = userTrades.length;
              const winningTrades = userTrades.filter((t) => Number(t.pnl) > 0).length;
              const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;
              const totalPnl = userTrades.reduce((acc, t) => acc + Number(t.pnl || 0), 0);
              const returnPercentage = totalTrades > 0 ? Math.round((totalPnl / 10000) * 100) : 0;

              return {
                id: p.id,
                rank: index + 1,
                username: p.username,
                fullName: p.full_name || p.username,
                avatarUrl: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`,
                tradingStyle: p.trading_style as TradingStyle,
                totalTrades,
                winRate,
                returnPercentage,
                totalPnl,
                isFriend: friendUserIds.has(p.id) || p.id === currentUser?.id,
              };
            });

            // Sort by Net PnL descending
            entries.sort((a, b) => b.totalPnl - a.totalPnl);
            entries.forEach((e, idx) => { e.rank = idx + 1; });

            setLeaderboardEntries(entries);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error fetching real leaderboard:', err);
        }
      }

      // If no Database records yet, show logged-in active user cleanly (0 dummy users)
      if (currentUser) {
        setLeaderboardEntries([
          {
            id: currentUser.id,
            rank: 1,
            username: currentUser.username,
            fullName: currentUser.fullName,
            avatarUrl: currentUser.avatarUrl,
            tradingStyle: currentUser.tradingStyle,
            totalTrades: 0,
            winRate: 0,
            returnPercentage: 0,
            totalPnl: 0,
            isFriend: true,
          },
        ]);
      } else {
        setLeaderboardEntries([]);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, [currentUser]);

  const filteredEntries = useMemo(() => {
    return leaderboardEntries.filter((entry) => {
      // Filter 1: Scope Tab
      if (scopeTab === 'friends' && !entry.isFriend) return false;
      if (scopeTab === 'community' && !entry.communityId) return false;

      // Filter 2: Trading Style
      if (styleFilter !== 'ALL' && entry.tradingStyle !== styleFilter) return false;

      return true;
    });
  }, [leaderboardEntries, scopeTab, styleFilter]);

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>REALTIME SUPABASE LEADERBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
            {t('leaderboardTitle')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Peringkat Trader Terdaftar Berdasarkan Real Data Transaksi & Net PnL
          </p>
        </div>

        <button
          onClick={() => setIsAddFriendOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Teman</span>
        </button>
      </div>

      {/* Scope Switcher Tabs */}
      <div className="tradewire-card p-4 space-y-4">
        <div>
          <label className="block text-[11px] font-extrabold uppercase text-[#6B7C72] mb-2">
            1. Scope Switcher (Filter Cakupan)
          </label>
          <div className="grid grid-cols-3 gap-2 bg-[#F8FAF9] p-1.5 rounded-2xl border border-[#E4E9E6]">
            <button
              type="button"
              onClick={() => setScopeTab('friends')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                scopeTab === 'friends'
                  ? 'bg-[#05C46B] text-white shadow-md shadow-[#05C46B]/20'
                  : 'text-[#6B7C72] hover:text-[#1E2923]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('tabFriends')}</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeTab('community')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                scopeTab === 'community'
                  ? 'bg-[#05C46B] text-white shadow-md shadow-[#05C46B]/20'
                  : 'text-[#6B7C72] hover:text-[#1E2923]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('tabCommunity')}</span>
            </button>

            <button
              type="button"
              onClick={() => setScopeTab('global')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                scopeTab === 'global'
                  ? 'bg-[#05C46B] text-white shadow-md shadow-[#05C46B]/20'
                  : 'text-[#6B7C72] hover:text-[#1E2923]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{t('tabGlobal')}</span>
            </button>
          </div>
        </div>

        {/* Method / Style Filters */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase text-[#6B7C72] mb-2">
            2. Method / Style Filter (Gaya Trading)
          </label>
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'Scalping', 'Intraday', 'Swing Trade'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setStyleFilter(style)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  styleFilter === style
                    ? 'bg-[#1E2923] text-white shadow-sm'
                    : 'bg-[#F8FAF9] text-[#6B7C72] border border-[#E4E9E6] hover:text-[#1E2923]'
                }`}
              >
                {style === 'ALL' ? t('filterAllMethods') : style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="tradewire-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#6B7C72]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#05C46B] mb-2" />
            <p className="text-xs font-bold">Memuat Real Data Database...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-12 h-12 text-[#6B7C72]/30 mx-auto mb-3" />
            <h3 className="font-extrabold text-[#1E2923] text-base mb-1 font-montserrat">
              Belum Ada Trader Terdaftar
            </h3>
            <p className="text-xs text-[#6B7C72] max-w-sm mx-auto font-medium">
              Trader yang melakukan registrasi dan mencatat jurnal trading akan otomatis masuk ke peringkat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E4E9E6] text-[11px] font-extrabold text-[#6B7C72] uppercase">
                  <th className="py-3.5 px-4 text-center">Rank</th>
                  <th className="py-3.5 px-4">Trader 9 Naga</th>
                  <th className="py-3.5 px-4">Gaya Trading</th>
                  <th className="py-3.5 px-4 text-right">Return (%)</th>
                  <th className="py-3.5 px-4 text-right">Win Rate</th>
                  <th className="py-3.5 px-4 text-right">Total Trades</th>
                  <th className="py-3.5 px-4 text-right">Net PnL ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E6] text-sm">
                {filteredEntries.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  const isCurrentUser = currentUser?.id === entry.id;

                  return (
                    <tr
                      key={entry.id}
                      className={`hover:bg-[#F8FAF9] transition-colors ${
                        isCurrentUser ? 'bg-[#E6F7F0]/40 font-bold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center font-extrabold">
                        {entry.rank === 1 && (
                          <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto shadow-sm">
                            <Crown className="w-4 h-4" />
                          </div>
                        )}
                        {entry.rank === 2 && (
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto font-extrabold text-xs">
                            2
                          </div>
                        )}
                        {entry.rank === 3 && (
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-extrabold text-xs">
                            3
                          </div>
                        )}
                        {!isTop3 && <span className="text-[#6B7C72] font-extrabold">{entry.rank}</span>}
                      </td>

                      {/* Trader Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={entry.avatarUrl}
                            alt={entry.username}
                            className="w-10 h-10 rounded-full border border-[#05C46B] bg-[#E6F7F0] shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-extrabold text-[#1E2923]">
                                {entry.username}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-md bg-[#05C46B] text-white">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B7C72] font-semibold">{entry.fullName}</p>
                          </div>
                        </div>
                      </td>

                      {/* Trading Style */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30">
                          {entry.tradingStyle}
                        </span>
                      </td>

                      {/* Return % */}
                      <td className="py-4 px-4 text-right font-extrabold text-[#05C46B]">
                        +{entry.returnPercentage}%
                      </td>

                      {/* Win Rate */}
                      <td className="py-4 px-4 text-right font-bold text-[#1E2923]">
                        {entry.winRate}%
                      </td>

                      {/* Total Trades */}
                      <td className="py-4 px-4 text-right font-semibold text-[#6B7C72]">
                        {entry.totalTrades}
                      </td>

                      {/* Net PnL ($) */}
                      <td className="py-4 px-4 text-right font-black text-[#05C46B]">
                        +${entry.totalPnl.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
      />
    </div>
  );
}
