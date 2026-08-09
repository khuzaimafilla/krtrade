'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
// Supabase removed — friend search uses localStorage
const supabase = null as any;
const isSupabaseConfigured = false;
import CreatorBadge from '@/components/common/CreatorBadge';
import UserProfileModal, { PublicUserProfile } from '@/components/modals/UserProfileModal';
import { Search, UserPlus, X, ShieldCheck, UserCheck, Eye, Clock } from 'lucide-react';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

type FriendshipStatusMap = Record<string, 'none' | 'pending' | 'accepted'>;

export default function AddFriendModal({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) {
  const { user } = useAuth();
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [friendshipMap, setFriendshipMap] = useState<FriendshipStatusMap>({});

  // Public User Profile Preview Modal
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicUserProfile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load existing friendships to know status per user
  const loadFriendshipStatuses = useCallback(async (userIds: string[]) => {
    if (!isSupabaseConfigured || !user?.id || userIds.length === 0) return;

    const { data } = await supabase
      .from('friendships')
      .select('requester_id, addressee_id, status')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!data) return;

    const map: FriendshipStatusMap = {};
    userIds.forEach((uid) => { map[uid] = 'none'; });

    data.forEach((f: any) => {
      const otherId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
      if (map[otherId] !== undefined || userIds.includes(otherId)) {
        map[otherId] = f.status as 'pending' | 'accepted';
      }
    });

    setFriendshipMap(map);
  }, [user]);

  // Live search with debounce
  useEffect(() => {
    if (!isOpen) return;
    const query = searchUsername.trim();

    const executeSearch = async () => {
      setIsSearching(true);
      if (isSupabaseConfigured) {
        let req = supabase.from('profiles').select('id, username, full_name, avatar_url, trading_style, bio').limit(15);
        if (query) req = req.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
        if (user?.id) req = req.neq('id', user.id);

        const { data, error } = await req;
        if (!error && data) {
          setSearchResults(data);
          loadFriendshipStatuses(data.map((u: any) => u.id));
        } else {
          setSearchResults([]);
        }
      }
      setIsSearching(false);
    };

    const timer = setTimeout(executeSearch, 200);
    return () => clearTimeout(timer);
  }, [searchUsername, isOpen, user, loadFriendshipStatuses]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearchUsername('');
      setSearchResults([]);
      setStatusMsg('');
      setFriendshipMap({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sendFriendRequest = async (targetUser: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user?.id || !targetUser.id) return;
    if (friendshipMap[targetUser.id] && friendshipMap[targetUser.id] !== 'none') return;

    // Optimistic update
    setFriendshipMap((prev) => ({ ...prev, [targetUser.id]: 'accepted' }));

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: targetUser.id,
        status: 'accepted', // auto-accept (follow model)
      });
      if (error) {
        console.error('Add friend error:', error.message);
        // Rollback on error
        setFriendshipMap((prev) => ({ ...prev, [targetUser.id]: 'none' }));
        setStatusMsg(`Gagal: ${error.message.includes('duplicate') ? 'Sudah berteman/pernah mengirim request.' : error.message}`);
        return;
      }
    }

    setStatusMsg(`✅ Berhasil berteman dengan @${targetUser.username}!`);
    if (onFriendAdded) onFriendAdded();
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleOpenPreview = async (targetUser: any) => {
    // Fetch real stats from DB
    let winRate = 0, totalPnl = 0, totalTrades = 0, groups: PublicUserProfile['groups'] = [];

    if (isSupabaseConfigured) {
      const [tradesRes, groupsRes] = await Promise.all([
        supabase.from('trades').select('pnl').eq('user_id', targetUser.id),
        supabase
          .from('group_members')
          .select('group_id, groups(id, name, code)')
          .eq('user_id', targetUser.id),
      ]);

      if (tradesRes.data) {
        const trades = tradesRes.data;
        totalTrades = trades.length;
        totalPnl = trades.reduce((sum: number, t: any) => sum + Number(t.pnl || 0), 0);
        const wins = trades.filter((t: any) => Number(t.pnl) > 0).length;
        winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
      }

      if (groupsRes.data) {
        groups = groupsRes.data
          .filter((r: any) => r.groups)
          .map((r: any) => ({ id: r.groups.id, name: r.groups.name, code: r.groups.code }));
      }
    }

    setSelectedUserProfile({
      id: targetUser.id,
      username: targetUser.username,
      fullName: targetUser.full_name || targetUser.username,
      avatarUrl: targetUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.username}`,
      tradingStyle: targetUser.trading_style || 'Scalping',
      bio: targetUser.bio || 'Trader aktif KRtrade Platform.',
      winRate,
      totalPnl,
      totalTrades,
      isFriend: friendshipMap[targetUser.id] === 'accepted',
      groups,
    });
    setIsPreviewOpen(true);
  };

  const statusBadge = (uid: string) => {
    const s = friendshipMap[uid];
    if (s === 'accepted') return (
      <span className="px-3 py-1.5 rounded-xl bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30 flex items-center space-x-1">
        <UserCheck className="w-3.5 h-3.5" />
        <span>Berteman</span>
      </span>
    );
    if (s === 'pending') return (
      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-extrabold border border-amber-200 flex items-center space-x-1">
        <Clock className="w-3.5 h-3.5" />
        <span>Pending</span>
      </span>
    );
    return (
      <button
        type="button"
        onClick={(e) => sendFriendRequest(uid, e)}
        className="px-3.5 py-1.5 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold shadow-sm flex items-center space-x-1 transition-all"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Add</span>
      </button>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E9E6] pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-[#E6F7F0] text-[#05C46B]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1E2923] text-lg font-montserrat">
                  Cari &amp; Tambah Teman
                </h3>
                <p className="text-[11px] text-[#6B7C72] font-medium">
                  Cari trader lain berdasarkan username
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#6B7C72] hover:text-[#1E2923] hover:bg-[#F8FAF9] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex items-center mb-4">
            <input
              type="text"
              autoFocus
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Ketik username atau nama..."
              className="w-full p-3.5 pl-10 pr-4 rounded-2xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
            />
            <Search className="w-4 h-4 text-[#6B7C72] absolute left-3.5" />
          </div>

          {statusMsg && (
            <div className="p-3 mb-4 rounded-2xl bg-[#E6F7F0] border border-[#05C46B]/30 text-[#05C46B] text-xs font-extrabold flex items-center space-x-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Results */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {isSearching ? (
              <div className="text-center py-8 text-[#6B7C72]">
                <p className="text-xs font-bold animate-pulse">Mencari trader...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-[#6B7C72]">
                <p className="text-xs font-bold">Tidak ada trader yang ditemukan.</p>
                <p className="text-[10px] mt-1">Coba ketik kata kunci username lain.</p>
              </div>
            ) : (
              searchResults.map((res) => (
                <div
                  key={res.id}
                  onClick={() => handleOpenPreview(res)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#E4E9E6] bg-[#F8FAF9] hover:bg-white hover:border-[#05C46B]/40 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <img
                      src={res.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.username}`}
                      alt={res.username}
                      className="w-10 h-10 rounded-full border border-[#05C46B] object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 truncate">
                        <p className="text-xs font-extrabold text-[#1E2923] truncate">
                          @{res.username}
                        </p>
                        <CreatorBadge username={res.username} size="sm" />
                      </div>
                      <p className="text-[10px] text-[#6B7C72] truncate font-medium">
                        {res.full_name || res.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleOpenPreview(res); }}
                      className="p-2 rounded-xl bg-white border border-[#E4E9E6] text-[#6B7C72] hover:text-[#1E2923] hover:bg-[#F8FAF9] transition-colors"
                      title="Lihat Profil"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {statusBadge(res.id)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <UserProfileModal
        user={selectedUserProfile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onAddFriend={(uname) => {
          const res = searchResults.find((r) => r.username === uname);
          if (res) setFriendshipMap((prev) => ({ ...prev, [res.id]: 'accepted' }));
          setStatusMsg(`✅ Berhasil berteman dengan @${uname}!`);
          if (onFriendAdded) onFriendAdded();
          setTimeout(() => setStatusMsg(''), 3000);
        }}
      />
    </>
  );
}
