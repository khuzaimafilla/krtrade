'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { TradingStyle, LeaderboardEntry } from '@/types';
import AddFriendModal from '@/components/modals/AddFriendModal';
import UserProfileModal, { PublicUserProfile } from '@/components/modals/UserProfileModal';
import CreatorBadge from '@/components/common/CreatorBadge';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Users, UserCheck, Crown, UserPlus, RefreshCw, Eye } from 'lucide-react';

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // User Profile Modal state
  const [selectedUser, setSelectedUser] = useState<PublicUserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Scope Switcher Tabs
  const [scopeTab, setScopeTab] = useState<'friends' | 'community'>('friends');

  // Trading Style Filters
  const [styleFilter, setStyleFilter] = useState<'ALL' | TradingStyle>('ALL');

  // Set of user IDs that are community members in the same groups as currentUser
  const [communityMemberIds, setCommunityMemberIds] = useState<Set<string>>(new Set());
  const [userGroupIds, setUserGroupIds] = useState<Set<string>>(new Set());

  // ── Load community group memberships ──────────────────────────────────────
  const loadUserGroups = useCallback(async () => {
    if (!isSupabaseConfigured || !currentUser) return;
    try {
      // Fetch all group_ids the current user is in (as member or creator)
      const [memberRes, createdRes] = await Promise.all([
        supabase.from('group_members').select('group_id').eq('user_id', currentUser.id),
        supabase.from('groups').select('id').eq('created_by', currentUser.id),
      ]);

      const myGroupIds = new Set<string>();
      memberRes.data?.forEach((r: any) => myGroupIds.add(r.group_id));
      createdRes.data?.forEach((g: any) => myGroupIds.add(g.id));
      setUserGroupIds(myGroupIds);

      if (myGroupIds.size === 0) {
        setCommunityMemberIds(new Set([currentUser.id]));
        return;
      }

      // Fetch ALL members of those groups in one query
      const { data: allGroupMembers } = await supabase
        .from('group_members')
        .select('user_id')
        .in('group_id', Array.from(myGroupIds));

      const memberSet = new Set<string>([currentUser.id]);
      allGroupMembers?.forEach((m: any) => memberSet.add(m.user_id));
      setCommunityMemberIds(memberSet);
    } catch (err) {
      console.error('loadUserGroups error:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserGroups();
  }, [loadUserGroups]);

  // ── Fetch leaderboard data ─────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        // Batch all queries in parallel — no N+1
        const [profilesRes, tradesRes, friendshipsRes, groupMembersRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('trades').select('user_id, pnl'),
          supabase
            .from('friendships')
            .select('requester_id, addressee_id, status')
            .or(`requester_id.eq.${currentUser?.id},addressee_id.eq.${currentUser?.id}`)
            .eq('status', 'accepted'),
          // Fetch group membership for all users (for groupIds)
          supabase.from('group_members').select('user_id, group_id'),
        ]);

        const profilesData = profilesRes.data || [];
        const tradesData = tradesRes.data || [];
        const friendshipsData = friendshipsRes.data || [];
        const groupMembersData = groupMembersRes.data || [];

        // Build friend set
        const friendUserIds = new Set<string>();
        if (currentUser) {
          friendshipsData.forEach((f: any) => {
            const otherId = f.requester_id === currentUser.id ? f.addressee_id : f.requester_id;
            friendUserIds.add(otherId);
          });
        }

        // Build group membership map: userId -> groupIds[]
        const userGroupMap: Record<string, string[]> = {};
        groupMembersData.forEach((m: any) => {
          if (!userGroupMap[m.user_id]) userGroupMap[m.user_id] = [];
          userGroupMap[m.user_id].push(m.group_id);
        });

        // Build entries
        const dbEntries: LeaderboardEntry[] = profilesData.map((p: any) => {
          const userTrades = tradesData.filter((t: any) => t.user_id === p.id);
          const totalTrades = userTrades.length;
          const wins = userTrades.filter((t: any) => Number(t.pnl) > 0).length;
          const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
          const totalPnl = userTrades.reduce((acc: number, t: any) => acc + Number(t.pnl || 0), 0);

          const isMe = Boolean(currentUser && p.id === currentUser.id);
          const finalAvatar = isMe && currentUser?.avatarUrl
            ? currentUser.avatarUrl
            : (p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.username}`);
          const finalFullName = isMe && currentUser?.fullName
            ? currentUser.fullName
            : (p.full_name || p.username);

          return {
            id: p.id,
            rank: 0,
            username: p.username,
            fullName: finalFullName,
            avatarUrl: finalAvatar,
            bio: isMe ? (currentUser?.bio || p.bio) : (p.bio || ''),
            tradingStyle: (p.trading_style as TradingStyle) || 'Scalping',
            totalTrades,
            winRate,
            returnPercentage: 0,
            totalPnl,
            isFriend: !isMe && friendUserIds.has(p.id),
            isMe,
            groupIds: userGroupMap[p.id] || [],
          };
        });

        // Sort by win rate desc, then total trades desc for tie-breaking
        dbEntries.sort((a, b) => b.winRate - a.winRate || b.totalTrades - a.totalTrades);
        dbEntries.forEach((e, idx) => { e.rank = idx + 1; });

        setLeaderboardEntries(dbEntries);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      }
    }

    // Fallback — minimal data
    const fallback: LeaderboardEntry[] = [];
    if (currentUser) {
      fallback.push({
        id: currentUser.id,
        rank: 1,
        username: currentUser.username,
        fullName: currentUser.fullName,
        avatarUrl: currentUser.avatarUrl,
        bio: currentUser.bio,
        tradingStyle: currentUser.tradingStyle,
        totalTrades: 0,
        winRate: 0,
        returnPercentage: 0,
        totalPnl: 0,
        isFriend: false,
        isMe: true,
        groupIds: [],
      });
    }
    setLeaderboardEntries(fallback);
    setLoading(false);
  }, [currentUser]);

  // ── Initial load + Realtime subscriptions ─────────────────────────────────
  useEffect(() => {
    fetchLeaderboard();

    if (!isSupabaseConfigured || !currentUser) return;

    const channel = supabase
      .channel(`leaderboard-rt-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchLeaderboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => fetchLeaderboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => fetchLeaderboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_members' }, () => {
        fetchLeaderboard();
        loadUserGroups();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, fetchLeaderboard, loadUserGroups]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    const filtered = leaderboardEntries.filter((entry) => {
      // Scope filter
      if (scopeTab === 'friends') {
        // Show self + friends (accepted)
        if (!entry.isMe && !entry.isFriend) return false;
      }
      if (scopeTab === 'community') {
        // Strictly: only users who are in the same group(s) as current user
        if (communityMemberIds.size === 0) return false;
        if (!communityMemberIds.has(entry.id || '')) return false;
      }
      // Style filter
      if (styleFilter !== 'ALL' && entry.tradingStyle !== styleFilter) return false;
      return true;
    });

    return filtered.map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [leaderboardEntries, scopeTab, styleFilter, communityMemberIds]);

  // ── Open user profile modal ───────────────────────────────────────────────
  const handleOpenUserPreview = async (entry: LeaderboardEntry) => {
    if (!entry.id) return;

    // Fetch groups for this user
    let groups: PublicUserProfile['groups'] = [];
    if (isSupabaseConfigured) {
      const { data: memberRows } = await supabase
        .from('group_members')
        .select('group_id, groups(id, name, code)')
        .eq('user_id', entry.id);
      if (memberRows) {
        groups = memberRows
          .filter((r: any) => r.groups)
          .map((r: any) => ({ id: r.groups.id, name: r.groups.name, code: r.groups.code }));
      }
    }

    setSelectedUser({
      id: entry.id,
      username: entry.username,
      fullName: entry.fullName,
      avatarUrl: entry.avatarUrl,
      tradingStyle: entry.tradingStyle,
      bio: entry.bio || (entry.username === 'khuzaimafilla' ? 'Developer & Creator KRtrade Platform.' : ''),
      winRate: entry.winRate,
      totalPnl: entry.totalPnl,
      totalTrades: entry.totalTrades,
      isFriend: entry.isFriend,
      isMe: entry.isMe,
      groups,
    });
    setIsProfileModalOpen(true);
  };

  const hasCommunity = userGroupIds.size > 0;

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
            Papan Peringkat Trader berdasarkan Win Rate — Diperbarui Real-time
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
        {/* Scope Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#E4E9E6] pb-3 overflow-x-auto">
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
          <button
            onClick={() => setScopeTab('community')}
            disabled={!hasCommunity}
            title={!hasCommunity ? 'Bergabung ke komunitas terlebih dahulu' : ''}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              scopeTab === 'community'
                ? 'bg-[#E6F7F0] text-[#05C46B] shadow-sm'
                : !hasCommunity
                ? 'text-[#C0C8C4] cursor-not-allowed'
                : 'text-[#6B7C72] hover:bg-[#F8FAF9]'
            }`}
          >
            🏘️ Komunitas Saya
            {!hasCommunity && (
              <span className="ml-1 text-[9px] font-bold opacity-60">(Belum ada grup)</span>
            )}
          </button>
        </div>

        {/* Style Filter Pills */}
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
            <p className="text-xs font-extrabold">Memuat Papan Peringkat...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-[#6B7C72]">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">
              {scopeTab === 'friends'
                ? 'Belum ada teman yang ditambahkan.'
                : 'Belum ada anggota grup komunitas Anda.'}
            </p>
            <p className="text-xs mt-1">
              {scopeTab === 'friends'
                ? 'Klik "+ Tambah Teman" untuk mencari dan berteman dengan trader lain.'
                : 'Buka halaman Komunitas untuk mengajak trader bergabung ke grup Anda.'}
            </p>
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
                  <th className="p-3.5 text-right">Net PnL</th>
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
                            {entry.isFriend && !entry.isMe && (
                              <span title="Teman">
                                <UserCheck className="w-3.5 h-3.5 text-[#05C46B]" />
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

                    {/* Net PnL */}
                    <td className={`p-3.5 text-right font-black text-sm ${entry.totalPnl >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}`}>
                      {entry.totalPnl >= 0 ? '+' : ''}${entry.totalPnl.toLocaleString()}
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
          fetchLeaderboard();
          setIsAddFriendOpen(false);
        }}
      />

      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onAddFriend={() => {
          fetchLeaderboard();
        }}
      />
    </div>
  );
}
