'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { TradingStyle, LeaderboardEntry } from '@/types';
import AddFriendModal from '@/components/modals/AddFriendModal';
import UserProfileModal, { PublicUserProfile } from '@/components/modals/UserProfileModal';
import CreatorBadge from '@/components/common/CreatorBadge';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Trophy, Users, UserCheck, Crown, UserPlus, RefreshCw, Eye } from 'lucide-react';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // User Profile Modal state
  const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Scope Switcher Tabs: [ Friends Only | Community Members | Global ]
  const [scopeTab, setScopeTab] = useState<'friends' | 'community' | 'global'>('global');

  // Trading Style Filters: [ All Methods | Scalping | Intraday | Swing Trade ]
  const [styleFilter, setStyleFilter] = useState<'ALL' | TradingStyle>('ALL');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);

      if (isSupabaseConfigured) {
        try {
          const { data: profilesData } = await supabase.from('profiles').select('*');
          const { data: tradesData } = await supabase.from('trades').select('*');
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

              const isMe = currentUser && (p.id === currentUser.id || p.username === currentUser.username);
              const finalAvatar = isMe && currentUser?.avatarUrl ? currentUser.avatarUrl : (p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`);
              const finalFullName = isMe && currentUser?.fullName ? currentUser.fullName : (p.full_name || p.username);

              return {
                id: p.id,
                rank: index + 1,
                username: p.username,
                fullName: finalFullName,
                avatarUrl: finalAvatar,
                tradingStyle: p.trading_style as TradingStyle,
                totalTrades,
                winRate,
                returnPercentage,
                totalPnl,
                isFriend: Boolean(friendUserIds.has(p.id) || isMe),
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

      // Initial Base Leaderboard Records (with Creator khuzaimafilla)
      const baseEntries: LeaderboardEntry[] = [
        {
          id: 'usr_khuzaima',
          rank: 1,
          username: 'khuzaimafilla',
          fullName: 'Khuzaima Filla (Developer)',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khuzaimafilla',
          tradingStyle: 'Scalping',
          totalTrades: 124,
          winRate: 88,
          returnPercentage: 450,
          totalPnl: 45000,
          isFriend: true,
        },
      ];

      if (currentUser && currentUser.username !== 'khuzaimafilla') {
        baseEntries.push({
          id: currentUser.id,
          rank: 2,
          username: currentUser.username,
          fullName: currentUser.fullName,
          avatarUrl: currentUser.avatarUrl,
          tradingStyle: currentUser.tradingStyle,
          totalTrades: 0,
          winRate: 0,
          returnPercentage: 0,
          totalPnl: 0,
          isFriend: true,
        });
      }

      setLeaderboardEntries(baseEntries);
      setLoading(false);
    }

    fetchLeaderboard();
  }, [currentUser]);

  // Filtered Entries based on Scope & Style
  const filteredEntries = useMemo(() => {
    return leaderboardEntries.filter((entry) => {
      // Scope Filter
      if (scopeTab === 'friends' && !entry.isFriend) return false;
      // Style Filter
      if (styleFilter !== 'ALL' && entry.tradingStyle !== styleFilter) return false;
      return true;
    });
  }, [leaderboardEntries, scopeTab, styleFilter]);

  const handleOpenUserPreview = (entry: LeaderboardEntry) => {
    setSelectedUser({
      id: entry.id,
      username: entry.username,
      fullName: entry.fullName,
      avatarUrl: entry.avatarUrl,
      tradingStyle: entry.tradingStyle,
      bio: entry.username === 'khuzaimafilla' ? 'Lead Architect & Creator of KRtrade Platform. Scalping Expert.' : 'Trader aktif KRtrade Platform.',
      winRate: entry.winRate,
      totalPnl: entry.totalPnl,
      totalTrades: entry.totalTrades,
      isFriend: entry.isFriend,
    });
    setIsProfileModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in font-poppins">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
              {t('leaderboardTitle')}
            </h1>
            <Crown className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Papan Peringkat Kinerja Trader Realtime & Transparan
          </p>
        </div>

        <button
          onClick={() => setIsAddFriendOpen(true)}
          className="px-5 py-2.5 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-md shadow-[#05C46B]/20 flex items-center space-x-2 shrink-0 transition-transform hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('addFriendBtn')}</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="tradewire-card p-4 space-y-4">
        {/* Scope Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#E4E9E6] pb-3 overflow-x-auto">
          <button
            onClick={() => setScopeTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              scopeTab === 'global'
                ? 'bg-[#E6F7F0] text-[#05C46B] shadow-sm'
                : 'text-[#6B7C72] hover:bg-[#F8FAF9]'
            }`}
          >
            🌐 {t('globalRank')}
          </button>
          <button
            onClick={() => setScopeTab('friends')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              scopeTab === 'friends'
                ? 'bg-[#E6F7F0] text-[#05C46B] shadow-sm'
                : 'text-[#6B7C72] hover:bg-[#F8FAF9]'
            }`}
          >
            👥 {t('friendsOnly')}
          </button>
        </div>

        {/* Trading Style Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-extrabold text-[#6B7C72] shrink-0 mr-1">Filter Method:</span>
          {(['ALL', 'Scalping', 'Intraday', 'Swing Trade'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setStyleFilter(style)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-all shrink-0 ${
                styleFilter === style
                  ? 'bg-[#05C46B] text-white shadow-sm'
                  : 'bg-[#F8FAF9] border border-[#E4E9E6] text-[#6B7C72] hover:text-[#1E2923]'
              }`}
            >
              {style === 'ALL' ? 'Semua Gaya' : style}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="tradewire-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#6B7C72]">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#05C46B]" />
            <p className="text-xs font-extrabold">Memuat Papan Peringkat Realtime...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-[#6B7C72]">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">Tidak ada data trader yang cocok.</p>
            <p className="text-xs mt-1">Coba ubah filter atau tambah teman baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-[#6B7C72] uppercase font-bold border-b border-[#E4E9E6]">
                <tr>
                  <th className="p-3.5 text-center">Rank</th>
                  <th className="p-3.5">Trader</th>
                  <th className="p-3.5">Gaya Trading</th>
                  <th className="p-3.5 text-center">Trades</th>
                  <th className="p-3.5 text-center">Win Rate</th>
                  <th className="p-3.5 text-right">Net PnL ($)</th>
                  <th className="p-3.5 text-center">Profil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E6]">
                {filteredEntries.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <tr
                      key={entry.username}
                      onClick={() => handleOpenUserPreview(entry)}
                      className="hover:bg-[#F8FAF9] transition-colors cursor-pointer group font-medium"
                    >
                      {/* Rank Column */}
                      <td className="p-3.5 text-center font-black text-sm">
                        {entry.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                            👑 1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700">
                            🥈 2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800">
                            🥉 3
                          </span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </td>

                      {/* Trader Info Column with CreatorBadge */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              entry.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`
                            }
                            alt={entry.username}
                            className="w-9 h-9 rounded-full border border-[#05C46B] object-cover bg-white shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-extrabold text-[#1E2923] text-sm group-hover:text-[#05C46B] transition-colors">
                                {entry.fullName || entry.username}
                              </span>
                              <CreatorBadge username={entry.username} size="sm" />
                            </div>
                            <span className="text-[10px] text-[#6B7C72] font-semibold">
                              @{entry.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trading Style */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-[10px] font-extrabold border border-[#05C46B]/30">
                          {entry.tradingStyle}
                        </span>
                      </td>

                      {/* Total Trades */}
                      <td className="p-3.5 text-center font-bold text-[#1E2923]">
                        {entry.totalTrades}
                      </td>

                      {/* Win Rate */}
                      <td className="p-3.5 text-center font-extrabold text-[#1E2923]">
                        {entry.winRate}%
                      </td>

                      {/* Net PnL */}
                      <td
                        className={`p-3.5 text-right font-black text-sm ${
                          entry.totalPnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'
                        }`}
                      >
                        {entry.totalPnl >= 0 ? '+' : ''}${entry.totalPnl.toLocaleString()}
                      </td>

                      {/* View Profile Action */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUserPreview(entry);
                          }}
                          className="p-1.5 rounded-xl bg-white border border-[#E4E9E6] text-[#6B7C72] hover:text-[#05C46B] hover:border-[#05C46B]/40 transition-all shadow-sm"
                          title="Lihat Profil"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
      />

      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
