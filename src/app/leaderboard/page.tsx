'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { TradingStyle, LeaderboardEntry } from '@/types';
import AddFriendModal from '@/components/modals/AddFriendModal';
import UserProfileModal, { PublicUserProfile } from '@/components/modals/UserProfileModal';
import CreatorBadge from '@/components/common/CreatorBadge';
import { Users, Crown, UserPlus, RefreshCw, Eye } from 'lucide-react';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // User Profile Modal state
  const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Trading Style Filters
  const [styleFilter, setStyleFilter] = useState<'ALL' | TradingStyle>('ALL');

  // ── Fetch leaderboard data from Prisma API ────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        // Determine if each entry is the current user
        const entries = data.entries.map((entry: LeaderboardEntry) => ({
          ...entry,
          isMe: Boolean(currentUser && entry.id === currentUser.id),
        }));
        setLeaderboardEntries(entries);
      }
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    const filtered = leaderboardEntries.filter((entry) => {
      // Style filter
      if (styleFilter !== 'ALL' && entry.tradingStyle !== styleFilter) return false;
      return true;
    });

    // Re-rank after filter
    return filtered.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [leaderboardEntries, styleFilter]);

  // ── Open user profile modal ───────────────────────────────────────────────
  const handleOpenUserPreview = (entry: LeaderboardEntry) => {
    if (!entry.id) return;

    setSelectedUser({
      id: entry.id,
      username: entry.username,
      fullName: entry.fullName,
      avatarUrl: entry.avatarUrl,
      tradingStyle: entry.tradingStyle,
      bio: entry.bio || 'Trader aktif KRTrade Platform.',
      winRate: entry.winRate,
      totalPnl: entry.totalPnl,
      totalTrades: entry.totalTrades,
      isFriend: entry.isFriend,
      isMe: entry.isMe,
      groups: [],
    });
    setIsProfileModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in font-poppins">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
              {t('leaderboardTitle')}
            </h1>
            <Crown className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Papan Peringkat Trader Global berdasarkan Win Rate
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

      {/* Filter Bar */}
      <div className="tradewire-card p-4 space-y-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-extrabold text-[#6B7C72] shrink-0 mr-1">Filter:</span>
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
            <p className="text-xs font-extrabold">Memuat Papan Peringkat Global...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-[#6B7C72]">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">Belum ada trader di kategori ini.</p>
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
                  <th className="p-3.5 text-center">Win Rate ↓</th>
                  <th className="p-3.5 text-center">Profil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E9E6]">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.username}
                    onClick={() => handleOpenUserPreview(entry)}
                    className={`hover:bg-[#F8FAF9] transition-colors cursor-pointer group font-medium ${
                      entry.isMe ? 'bg-[#E6F7F0]/40' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-3.5 text-center font-black text-sm">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs">
                          👑 1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 text-xs">
                          🥈 2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 text-xs">
                          🥉 3
                        </span>
                      ) : (
                        `#${entry.rank}`
                      )}
                    </td>

                    {/* Trader Info */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={entry.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                          alt={entry.username}
                          className="w-9 h-9 rounded-full border border-[#05C46B] object-cover bg-white shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`;
                          }}
                        />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-[#1E2923] text-sm group-hover:text-[#05C46B] transition-colors">
                              {entry.fullName || entry.username}
                            </span>
                            <CreatorBadge username={entry.username} size="sm" />
                            {entry.isMe && (
                              <span className="px-1.5 py-0.5 rounded-lg bg-[#05C46B]/10 text-[#05C46B] text-[9px] font-extrabold">
                                SAYA
                              </span>
                            )}
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

                    {/* View Profile */}
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleOpenUserPreview(entry); }}
                        className="p-1.5 rounded-xl bg-white border border-[#E4E9E6] text-[#6B7C72] hover:text-[#05C46B] hover:border-[#05C46B]/40 transition-all shadow-sm"
                        title="Lihat Profil"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onFriendAdded={() => {
          setIsAddFriendOpen(false);
        }}
      />

      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onAddFriend={() => {}}
      />
    </div>
  );
}
