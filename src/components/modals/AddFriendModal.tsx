'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Search, UserPlus, Check, X, ShieldCheck, UserCheck } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setIsSearching(true);
    setStatusMsg('');

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchUsername}%`)
        .neq('id', user?.id || '');

      if (!error && data) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } else {
      // Mock Search Results
      const mockUsers = [
        { id: 'usr_sultan', username: 'Sultan_Gold_SMC', full_name: 'Sultan Gold SMC', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SultanGold' },
        { id: 'usr_intraday', username: 'Intraday_Sniper99', full_name: 'Intraday Sniper', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IntradaySniper' },
        { id: 'usr_naga', username: 'Naga_Hijau_Profitable', full_name: 'Naga Hijau', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NagaHijau' },
      ].filter(u => u.username.toLowerCase().includes(searchUsername.toLowerCase()));

      setSearchResults(mockUsers);
    }
    setIsSearching(false);
  };

  const sendFriendRequest = async (targetUser: any) => {
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

    setStatusMsg(`Permintaan pertemanan berhasil dikirim ke ${targetUser.username}!`);
    if (onFriendAdded) onFriendAdded();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto">
        <div className="flex items-center justify-between border-b border-[#E4E9E6] pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#E6F7F0] text-[#05C46B]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#1E2923] text-lg">
              Cari & Tambah Teman
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7C72] hover:text-[#1E2923] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Cari berdasarkan username trader..."
              className="w-full p-3 pl-10 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
            />
            <Search className="w-4 h-4 text-[#6B7C72] absolute left-3.5" />
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 bg-[#05C46B] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              Cari
            </button>
          </div>
        </form>

        {statusMsg && (
          <div className="p-3 mb-3 rounded-xl bg-[#E6F7F0] border border-[#05C46B]/30 text-[#05C46B] text-xs font-bold flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-center text-xs text-[#6B7C72] py-6">
              {isSearching ? 'Mencari trader...' : 'Ketik username untuk mulai mencari.'}
            </p>
          ) : (
            searchResults.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] hover:bg-white transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={res.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trader'}
                    alt={res.username}
                    className="w-8 h-8 rounded-full border border-[#05C46B]"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#1E2923]">{res.username}</p>
                    <p className="text-[10px] text-[#6B7C72]">{res.full_name}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => sendFriendRequest(res)}
                  className="px-3 py-1.5 rounded-lg bg-[#05C46B] text-white text-xs font-bold shadow-sm flex items-center space-x-1 hover:bg-[#04A75B]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
