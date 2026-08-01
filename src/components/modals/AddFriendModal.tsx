'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import CreatorBadge from '@/components/common/CreatorBadge';
import UserProfileModal, { PublicUserProfile } from '@/components/modals/UserProfileModal';
import { Search, UserPlus, X, ShieldCheck, UserCheck, Eye } from 'lucide-react';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

export default function AddFriendModal({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [addedUserIds, setAddedUserIds] = useState<Record<string, boolean>>({});

  // Public User Profile Preview Modal
  const [selectedUserProfile, setSelectedUserProfile] = useState<PublicUserProfile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Mock Users Database for fallback
  const mockUsersList = [
    { id: 'usr_khuzaima', username: 'khuzaimafilla', full_name: 'Khuzaima Filla (Developer)', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khuzaimafilla', trading_style: 'Scalping', win_rate: 88.5, total_pnl: 45000 },
    { id: 'usr_sultan', username: 'Sultan_Gold_SMC', full_name: 'Sultan Gold SMC', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SultanGold', trading_style: 'Intraday', win_rate: 72.4, total_pnl: 18500 },
    { id: 'usr_rega', username: 'rega_trader', full_name: 'Rega Trading Expert', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rega', trading_style: 'Swing Trade', win_rate: 69.8, total_pnl: 14200 },
    { id: 'usr_regina', username: 'regina_forex', full_name: 'Regina Forex Analyst', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=regina', trading_style: 'Scalping', win_rate: 65.0, total_pnl: 9800 },
    { id: 'usr_intraday', username: 'Intraday_Sniper99', full_name: 'Intraday Sniper', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IntradaySniper', trading_style: 'Intraday', win_rate: 64.2, total_pnl: 8700 },
  ];

  // Instagram-style instant autocomplete live search as user types
  useEffect(() => {
    if (!isOpen) return;
    const query = searchUsername.trim();

    const executeInstantSearch = async () => {
      setIsSearching(true);

      if (isSupabaseConfigured) {
        let req = supabase
          .from('profiles')
          .select('*')
          .limit(10);

        if (query) {
          req = req.or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);
        }
        if (user?.id) {
          req = req.neq('id', user.id);
        }

        const { data, error } = await req;

        if (!error && data) {
          setSearchResults(data);
        } else {
          setSearchResults([]);
        }
      } else {
        // Local Filter
        const filtered = mockUsersList.filter((u) => {
          if (user && u.username === user.username) return false;
          if (!query) return true;
          return (
            u.username.toLowerCase().includes(query.toLowerCase()) ||
            u.full_name.toLowerCase().includes(query.toLowerCase())
          );
        });
        setSearchResults(filtered);
      }
      setIsSearching(false);
    };

    const timer = setTimeout(executeInstantSearch, 150);
    return () => clearTimeout(timer);
  }, [searchUsername, isOpen, user]);

  if (!isOpen) return null;

  const sendFriendRequest = async (targetUser: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (isSupabaseConfigured && user) {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: targetUser.id,
        status: 'pending',
      });
      if (error) {
        setStatusMsg(`Gagal mengirim permintaan pertemanan: ${error.message}`);
        return;
      }
    }

    setAddedUserIds((prev) => ({ ...prev, [targetUser.username]: true }));
    setStatusMsg(`Permintaan pertemanan berhasil dikirim ke @${targetUser.username}!`);
    if (onFriendAdded) onFriendAdded();
  };

  const handleOpenPreview = (targetUser: any) => {
    setSelectedUserProfile({
      id: targetUser.id,
      username: targetUser.username,
      fullName: targetUser.full_name || targetUser.fullName,
      avatarUrl: targetUser.avatar_url || targetUser.avatarUrl,
      tradingStyle: targetUser.trading_style || targetUser.tradingStyle,
      bio: targetUser.bio || 'Trader aktif KRtrade Platform.',
      winRate: targetUser.win_rate || 70.0,
      totalPnl: targetUser.total_pnl || 12500,
      totalTrades: 35,
      isFriend: addedUserIds[targetUser.username] || false,
    });
    setIsPreviewOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto text-left">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E4E9E6] pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-[#E6F7F0] text-[#05C46B]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1E2923] text-lg font-montserrat">
                  Cari & Tambah Teman
                </h3>
                <p className="text-[11px] text-[#6B7C72] font-medium">
                  Instant search secepat Instagram
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

          {/* Search Input Box */}
          <div className="relative flex items-center mb-4">
            <input
              type="text"
              autoFocus
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Ketik username (contoh: rega, khuzaima)..."
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

          {/* Real-time Results List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-[#6B7C72]">
                <p className="text-xs font-bold">
                  {isSearching ? 'Mencari trader...' : 'Tidak ada trader yang cocok ditemukan.'}
                </p>
                <p className="text-[10px] mt-1">Coba ketik kata kunci username lain.</p>
              </div>
            ) : (
              searchResults.map((res) => {
                const isAdded = addedUserIds[res.username];
                return (
                  <div
                    key={res.id || res.username}
                    onClick={() => handleOpenPreview(res)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-[#E4E9E6] bg-[#F8FAF9] hover:bg-white hover:border-[#05C46B]/40 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <img
                        src={
                          res.avatar_url ||
                          res.avatarUrl ||
                          res.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.username}`
                        }
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(res);
                        }}
                        className="p-2 rounded-xl bg-white border border-[#E4E9E6] text-[#6B7C72] hover:text-[#1E2923] hover:bg-[#F8FAF9] transition-colors"
                        title="Lihat Profil Selayang Pandang"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {isAdded ? (
                        <span className="px-3 py-1.5 rounded-xl bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30 flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Terkirim</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => sendFriendRequest(res, e)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold shadow-sm flex items-center space-x-1 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Selayang Pandang User Profile Modal */}
      <UserProfileModal
        user={selectedUserProfile}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onAddFriend={(uname) => {
          setAddedUserIds((prev) => ({ ...prev, [uname]: true }));
          setStatusMsg(`Permintaan pertemanan berhasil dikirim ke @${uname}!`);
        }}
      />
    </>
  );
}
