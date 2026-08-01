'use client';

import React, { useState, useEffect } from 'react';
import { TradingGroup } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getStoredGroups, setStoredGroups } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Users, Plus, Key, CheckCircle, TrendingUp, Percent, ShieldCheck, Crown, X } from 'lucide-react';

export default function CommunityPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [groups, setGroups] = useState<TradingGroup[]>([]);

  // Create Group Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Join Group State
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  useEffect(() => {
    async function loadGroups() {
      if (isSupabaseConfigured && user) {
        const { data: dbGroups, error } = await supabase.from('groups').select('*');
        if (!error && dbGroups) {
          const { data: myMemberships } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', user.id);

          const joinedGroupIds = new Set(myMemberships?.map((m: any) => m.group_id));

          const mapped: TradingGroup[] = dbGroups.map((g: any) => ({
            id: g.id,
            name: g.name,
            code: g.code,
            description: g.description || 'Komunitas Trading KRtrade 9 Naga.',
            membersCount: 12,
            totalPnl: 45000.00,
            winRate: 81.5,
            isJoined: joinedGroupIds.has(g.id),
          }));

          setGroups(mapped);
          return;
        }
      }
      setGroups(getStoredGroups());
    }
    loadGroups();
  }, [user]);

  const saveGroups = (updated: TradingGroup[]) => {
    setGroups(updated);
    setStoredGroups(updated);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupCode) return;

    if (isSupabaseConfigured && user) {
      const { data: newGrpData, error } = await supabase.from('groups').insert({
        name: newGroupName,
        code: newGroupCode.toUpperCase(),
        description: newGroupDesc || 'Komunitas Trading KRtrade 9 Naga.',
        created_by: user.id,
      }).select().single();

      if (!error && newGrpData) {
        await supabase.from('group_members').insert({
          group_id: newGrpData.id,
          user_id: user.id,
        });
      }
    }

    const newGrp: TradingGroup = {
      id: 'grp_' + Date.now(),
      name: newGroupName,
      code: newGroupCode.toUpperCase(),
      description: newGroupDesc || 'Komunitas Trading KRtrade 9 Naga.',
      membersCount: 1,
      totalPnl: 15000.00,
      winRate: 80.0,
      isJoined: true,
    };

    saveGroups([newGrp, ...groups]);
    setIsCreateOpen(false);
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupDesc('');
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput) return;

    const code = joinCodeInput.trim().toUpperCase();

    if (isSupabaseConfigured && user) {
      const { data: targetGrp } = await supabase
        .from('groups')
        .select('*')
        .eq('code', code)
        .single();

      if (targetGrp) {
        await supabase.from('group_members').insert({
          group_id: targetGrp.id,
          user_id: user.id,
        });
      }
    }
    const updated = groups.map((g) => {
      if (g.code === code) {
        return {
          ...g,
          membersCount: g.membersCount + (g.isJoined ? 0 : 1),
          isJoined: true,
        };
      }
      return g;
    });

    saveGroups(updated);
    setIsJoinOpen(false);
    setJoinCodeInput('');
  };

  const toggleGroupJoin = (id: string) => {
    const updated = groups.map((g) => {
      if (g.id === id) {
        const nextJoined = !g.isJoined;
        return {
          ...g,
          isJoined: nextJoined,
          membersCount: g.membersCount + (nextJoined ? 1 : -1),
        };
      }
      return g;
    });
    saveGroups(updated);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923]">
            {t('communityTitle')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1">
            Grup Trading, Kolaborasi Strategi, & Accumulative PnL 9 Naga
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="px-4 py-2.5 rounded-2xl border border-[#E4E9E6] bg-white hover:bg-[#F8FAF9] text-[#1E2923] font-bold text-xs shadow-sm flex items-center space-x-2"
          >
            <Key className="w-4 h-4 text-[#05C46B]" />
            <span>{t('joinGroupBtn')}</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-bold text-xs shadow-md shadow-[#05C46B]/20 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createGroupBtn')}</span>
          </button>
        </div>
      </div>

      {/* Group Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group.id} className="tradewire-card p-5 relative overflow-hidden flex flex-col justify-between">
            {group.isJoined && (
              <div className="absolute top-4 right-4 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-[10px] font-extrabold border border-[#05C46B]/30">
                <CheckCircle className="w-3 h-3" />
                <span>{t('joinedBadge')}</span>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-[#E6F7F0] text-[#05C46B] flex items-center justify-center font-black text-lg border border-[#05C46B]/20">
                  <Crown className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#1E2923] text-base">
                    {group.name}
                  </h3>
                  <span className="text-[10px] font-bold text-[#6B7C72] bg-[#F8FAF9] px-2 py-0.5 rounded border border-[#E4E9E6]">
                    CODE: {group.code}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#6B7C72] mb-5 leading-relaxed">
                {group.description}
              </p>

              {/* Group Metrics required by spec */}
              <div className="grid grid-cols-3 gap-2 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E4E9E6] mb-5">
                <div>
                  <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                    {t('membersCount')}
                  </p>
                  <p className="text-sm font-extrabold text-[#1E2923] flex items-center mt-0.5">
                    <Users className="w-3.5 h-3.5 mr-1 text-[#05C46B]" />
                    {group.membersCount}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                    {t('accumulativePnl')}
                  </p>
                  <p className="text-sm font-extrabold text-[#05C46B] flex items-center mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +${(group.totalPnl / 1000).toFixed(1)}k
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                    {t('averageWinRate')}
                  </p>
                  <p className="text-sm font-extrabold text-[#1E2923] flex items-center mt-0.5">
                    <Percent className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
                    {group.winRate}%
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleGroupJoin(group.id)}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                group.isJoined
                  ? 'border border-[#E4E9E6] text-[#6B7C72] hover:bg-[#FF4D4D]/10 hover:text-[#FF4D4D]'
                  : 'bg-[#05C46B] hover:bg-[#04A75B] text-white shadow-md shadow-[#05C46B]/20'
              }`}
            >
              {group.isJoined ? 'Keluar Group' : t('joinAction')}
            </button>
          </div>
        ))}
      </div>

      {/* CREATE GROUP MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1.5 rounded-xl hover:bg-[#F8FAF9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-[#1E2923] mb-4 font-montserrat">
              {t('createGroupBtn')}
            </h3>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  Nama Komunitas / Group
                </label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. SMC Scalpers 9 Naga"
                  className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  Kode Undangan Unik (Max 6 Karakter)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={newGroupCode}
                  onChange={(e) => setNewGroupCode(e.target.value)}
                  placeholder="NAGA99"
                  className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm uppercase text-[#1E2923] font-bold outline-none focus:border-[#05C46B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Deskripsikan aturan & gaya trading komunitas..."
                  className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] outline-none focus:border-[#05C46B]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E4E9E6]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#6B7C72] hover:bg-[#F8FAF9] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#05C46B]/20 transition-all"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN GROUP MODAL */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 text-center my-auto">
            <button
              type="button"
              onClick={() => setIsJoinOpen(false)}
              className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1.5 rounded-xl hover:bg-[#F8FAF9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-[#1E2923] mb-1 font-montserrat">
              {t('joinGroupBtn')}
            </h3>
            <p className="text-xs text-[#6B7C72] mb-5 font-medium">
              Masukkan 6-digit kode komunitas untuk bergabung.
            </p>

            <form onSubmit={handleJoinGroup} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder={t('groupCodePlaceholder')}
                className="w-full p-3.5 text-center text-lg font-black tracking-widest uppercase rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-[#1E2923] focus:border-[#05C46B] outline-none"
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(false)}
                  className="py-2.5 rounded-xl text-xs font-extrabold text-[#6B7C72] border border-[#E4E9E6] bg-[#F8FAF9] hover:bg-[#E4E9E6] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#05C46B]/20 transition-all"
                >
                  {t('joinAction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
