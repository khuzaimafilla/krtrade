'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import CreatorBadge from '@/components/common/CreatorBadge';
// Supabase removed — profile view uses localStorage
const supabase = null as any;
const isSupabaseConfigured = false;
import {
  X,
  UserPlus,
  UserCheck,
  TrendingUp,
  Percent,
  BookOpen,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { isCreatorUser } from '@/types';

export interface PublicUserProfile {
  id?: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  tradingStyle?: string;
  bio?: string;
  winRate?: number;
  totalPnl?: number;
  totalTrades?: number;
  isFriend?: boolean;
  isMe?: boolean;
  groups?: Array<{ id: string; name: string; code: string }>;
}

interface UserProfileModalProps {
  user: PublicUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFriend?: (username: string) => void;
}

type FriendStatus = 'none' | 'pending' | 'accepted';

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  onAddFriend,
}: UserProfileModalProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [isAddingFriend, setIsAddingFriend] = useState(false);

  // Fetch real friendship status on open
  useEffect(() => {
    if (!isOpen || !user?.id || !currentUser?.id || user.isMe) return;

    // Pre-set from prop
    setFriendStatus(user.isFriend ? 'accepted' : 'none');

    if (!isSupabaseConfigured) return;

    supabase
      .from('friendships')
      .select('status')
      .or(
        `and(requester_id.eq.${currentUser.id},addressee_id.eq.${user.id}),and(requester_id.eq.${user.id},addressee_id.eq.${currentUser.id})`
      )
      .limit(1)
      .then(({ data }: { data: any }) => {
        if (data && data.length > 0) {
          setFriendStatus(data[0].status as FriendStatus);
        } else {
          setFriendStatus('none');
        }
      });
  }, [isOpen, user, currentUser]);

  if (!isOpen || !user) return null;

  const isOwnProfile = user.isMe || currentUser?.username === user.username;
  const isCreator = isCreatorUser(user.username);

  const handleAddFriend = async () => {
    if (!currentUser || !user.id || isAddingFriend) return;
    setIsAddingFriend(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('friendships').insert({
        requester_id: currentUser.id,
        addressee_id: user.id,
        status: 'accepted', // auto-accept (follow model)
      });
      if (error) {
        console.error('Friend request error:', error.message);
        setIsAddingFriend(false);
        return;
      }
    }

    setFriendStatus('accepted');
    setIsAddingFriend(false);
    if (onAddFriend) onAddFriend(user.username);
  };

  const pnlFormatted = () => {
    const val = user.totalPnl ?? 0;
    if (Math.abs(val) >= 1000) return `${val >= 0 ? '+' : ''}${(val / 1000).toFixed(1)}k`;
    return `${val >= 0 ? '+' : ''}${val}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1.5 rounded-xl hover:bg-[#F8FAF9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-5 border-b border-[#E4E9E6]">
          <div className="relative mb-3">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className={`w-20 h-20 rounded-full object-cover bg-white border-2 shadow-md ${
                isCreator ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/20' : 'border-[#05C46B]'
              }`}
            />
            {isCreator && (
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#D4AF37] to-[#05C46B] text-slate-950 p-1 rounded-full shadow-md border border-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 mb-1">
            <h3 className="text-xl font-extrabold text-[#1E2923] font-montserrat">
              {user.fullName || user.username}
            </h3>
            <CreatorBadge username={user.username} size="sm" />
          </div>

          <p className="text-xs font-bold text-[#6B7C72] mb-2">@{user.username}</p>

          <span className="px-3 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30">
            {user.tradingStyle || 'Scalping'} Trader
          </span>

          <p className="text-xs text-[#6B7C72] mt-3 max-w-xs leading-relaxed italic">
            &quot;{user.bio || 'Trader aktif KRTrade Platform.'}&quot;
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-5 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E4E9E6]">
          <div className="text-center">
            <p className="text-[10px] uppercase font-extrabold text-[#6B7C72] flex items-center justify-center">
              <Percent className="w-3 h-3 mr-1 text-[#D4AF37]" />
              Win Rate
            </p>
            <p className="text-base font-extrabold text-[#1E2923] mt-0.5">
              {user.winRate !== undefined ? `${user.winRate}%` : '—'}
            </p>
          </div>

          <div className="text-center border-x border-[#E4E9E6]">
            <p className="text-[10px] uppercase font-extrabold text-[#6B7C72] flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1 text-[#05C46B]" />
              Total PnL
            </p>
            <p className={`text-base font-extrabold mt-0.5 ${(user.totalPnl ?? 0) >= 0 ? 'text-[#05C46B]' : 'text-[#FF4D4D]'}`}>
              {pnlFormatted()}
            </p>
          </div>

          <div className="text-center">
            <p className="text-[10px] uppercase font-extrabold text-[#6B7C72] flex items-center justify-center">
              <BookOpen className="w-3 h-3 mr-1 text-[#6B7C72]" />
              Trades
            </p>
            <p className="text-base font-extrabold text-[#1E2923] mt-0.5">
              {user.totalTrades ?? '—'}
            </p>
          </div>
        </div>

        {/* Community Groups */}
        {user.groups && user.groups.length > 0 && (
          <div className="mb-5">
            <p className="text-[10px] font-extrabold text-[#6B7C72] uppercase mb-2 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Komunitas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.groups.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 rounded-xl bg-[#E6F7F0] border border-[#05C46B]/30 text-[10px] font-extrabold text-[#05C46B]"
                >
                  [{g.code}] {g.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {!isOwnProfile && (
          <div className="pt-2">
            {friendStatus === 'accepted' ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-[#E6F7F0] border border-[#05C46B]/40 text-[#05C46B] font-extrabold text-xs flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Teman Terhubung</span>
              </button>
            ) : friendStatus === 'pending' ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-xs flex items-center justify-center space-x-2"
              >
                <span>Permintaan Terkirim</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddFriend}
                disabled={isAddingFriend}
                className="w-full py-3 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01] disabled:opacity-60"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isAddingFriend ? 'Menambahkan...' : 'Tambah Teman'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
