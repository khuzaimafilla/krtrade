'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import CreatorBadge from '@/components/common/CreatorBadge';
import {
  X,
  UserPlus,
  UserCheck,
  TrendingUp,
  Percent,
  Award,
  BookOpen,
  Globe,
  Calendar,
  ShieldCheck,
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
}

interface UserProfileModalProps {
  user: PublicUserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onAddFriend?: (username: string) => void;
}

export default function UserProfileModal({
  user,
  isOpen,
  onClose,
  onAddFriend,
}: UserProfileModalProps) {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [isFriendAdded, setIsFriendAdded] = useState(false);

  if (!isOpen || !user) return null;

  const isOwnProfile = currentUser?.username === user.username;
  const isCreator = isCreatorUser(user.username);

  const handleAddFriendClick = () => {
    setIsFriendAdded(true);
    if (onAddFriend) onAddFriend(user.username);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1.5 rounded-xl hover:bg-[#F8FAF9] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header Banner */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-[#E4E9E6]">
          <div className="relative mb-3">
            <img
              src={
                user.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
              }
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

          {/* Trading Style Badge */}
          <span className="px-3 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30">
            {user.tradingStyle || 'Scalping'} Trader
          </span>

          {/* User Bio */}
          <p className="text-xs text-[#6B7C72] mt-3 max-w-xs leading-relaxed italic">
            "{user.bio || 'Trader aktif KRtrade Platform. Disiplin risk management & konsistensi pnl.'}"
          </p>
        </div>

        {/* Trading Metrics Performance Grid */}
        <div className="grid grid-cols-3 gap-2 my-6 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E4E9E6]">
          <div className="text-center">
            <p className="text-[10px] uppercase font-extrabold text-[#6B7C72] flex items-center justify-center">
              <Percent className="w-3 h-3 mr-1 text-[#D4AF37]" />
              Win Rate
            </p>
            <p className="text-base font-extrabold text-[#1E2923] mt-0.5">
              {user.winRate !== undefined ? `${user.winRate}%` : '68.5%'}
            </p>
          </div>

          <div className="text-center border-x border-[#E4E9E6]">
            <p className="text-[10px] uppercase font-extrabold text-[#6B7C72] flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1 text-[#05C46B]" />
              Total PnL
            </p>
            <p className="text-base font-extrabold text-[#05C46B] mt-0.5">
              +${user.totalPnl !== undefined ? (user.totalPnl / 1000).toFixed(1) : '12.4'}k
            </p>
          </div>

          <div className="text-center">
            <p className="text-[10px] uppercase font-extrabold text-[#6B7C72] flex items-center justify-center">
              <BookOpen className="w-3 h-3 mr-1 text-[#6B7C72]" />
              Trades
            </p>
            <p className="text-base font-extrabold text-[#1E2923] mt-0.5">
              {user.totalTrades !== undefined ? user.totalTrades : 42}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="pt-2">
            {user.isFriend || isFriendAdded ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-[#E6F7F0] border border-[#05C46B]/40 text-[#05C46B] font-extrabold text-xs flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Teman Terhubung</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddFriendClick}
                className="w-full py-3 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-transform hover:scale-[1.01]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Teman</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
