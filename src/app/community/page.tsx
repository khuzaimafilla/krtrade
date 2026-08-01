'use client';

import React, { useState, useEffect } from 'react';
import { TradingGroup, GroupMemberDetail } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getStoredGroups, setStoredGroups } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import CreatorBadge from '@/components/common/CreatorBadge';
import {
  Users,
  Plus,
  Key,
  CheckCircle,
  TrendingUp,
  Percent,
  ShieldCheck,
  Crown,
  X,
  UserX,
  ShieldAlert,
} from 'lucide-react';

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

  // Admin Member Management Modal State
  const [selectedAdminGroup, setSelectedAdminGroup] = useState<TradingGroup | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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
            description: g.description || 'Komunitas Trading Kolaboratif KRtrade Platform.',
            membersCount: 12,
            totalPnl: 45000.00,
            winRate: 81.5,
            isJoined: joinedGroupIds.has(g.id),
            createdBy: g.created_by || user.id,
            members: [
              { id: g.created_by || user.id, username: user.username, fullName: user.fullName, role: 'admin' },
              { id: 'usr_sultan', username: 'Sultan_Gold_SMC', fullName: 'Sultan Gold SMC', role: 'member' },
              { id: 'usr_rega', username: 'rega_trader', fullName: 'Rega Trading Expert', role: 'member' },
              { id: 'usr_intraday', username: 'Intraday_Sniper99', fullName: 'Intraday Sniper', role: 'member' },
            ],
          }));

          setGroups(mapped);
          return;
        }
      }

      // Default Mock Groups if no DB
      const stored = getStoredGroups();
      const mappedStored = stored.map((g, idx) => ({
        ...g,
        createdBy: idx === 0 ? (user?.id || 'usr_khuzaima') : 'usr_sultan',
        members: [
          { id: user?.id || 'usr_khuzaima', username: user?.username || 'khuzaimafilla', fullName: user?.fullName || 'Khuzaima Filla', role: 'admin' as const },
          { id: 'usr_sultan', username: 'Sultan_Gold_SMC', fullName: 'Sultan Gold SMC', role: 'member' as const },
          { id: 'usr_rega', username: 'rega_trader', fullName: 'Rega Trading Expert', role: 'member' as const },
          { id: 'usr_regina', username: 'regina_forex', fullName: 'Regina Forex Analyst', role: 'member' as const },
        ],
      }));

      setGroups(mappedStored);
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

    const groupAdminId = user?.id || 'usr_khuzaima';

    if (isSupabaseConfigured && user) {
      const { data: newGrpData, error } = await supabase.from('groups').insert({
        name: newGroupName,
        code: newGroupCode.toUpperCase(),
        description: newGroupDesc || 'Komunitas Trading Kolaboratif KRtrade Platform.',
        created_by: groupAdminId,
      }).select().single();

      if (!error && newGrpData) {
        await supabase.from('group_members').insert({
          group_id: newGrpData.id,
          user_id: groupAdminId,
        });
      }
    }

    const newGrp: TradingGroup = {
      id: 'grp_' + Date.now(),
      name: newGroupName,
      code: newGroupCode.toUpperCase(),
      description: newGroupDesc || 'Komunitas Trading Kolaboratif KRtrade Platform.',
      membersCount: 1,
      totalPnl: 15000.00,
      winRate: 80.0,
      isJoined: true,
      createdBy: groupAdminId,
      members: [
        { id: groupAdminId, username: user?.username || 'khuzaimafilla', fullName: user?.fullName || 'Khuzaima Filla', role: 'admin' },
      ],
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
        const isAlreadyMember = g.members?.some((m) => m.id === user?.id);
        const updatedMembers = isAlreadyMember
          ? g.members
          : [
              ...(g.members || []),
              {
                id: user?.id || 'usr_me',
                username: user?.username || 'Trader',
                fullName: user?.fullName || 'Trader Pro',
                role: 'member' as const,
              },
            ];

        return {
          ...g,
          membersCount: updatedMembers?.length || g.membersCount + 1,
          isJoined: true,
          members: updatedMembers,
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
          membersCount: Math.max(1, g.membersCount + (nextJoined ? 1 : -1)),
        };
      }
      return g;
    });
    saveGroups(updated);
  };

  // Kick out member as admin
  const handleKickMember = (groupId: string, memberId: string) => {
    const updated = groups.map((g) => {
      if (g.id === groupId) {
        const filteredMembers = g.members?.filter((m) => m.id !== memberId) || [];
        return {
          ...g,
          membersCount: Math.max(1, filteredMembers.length),
          members: filteredMembers,
        };
      }
      return g;
    });

    saveGroups(updated);

    if (selectedAdminGroup && selectedAdminGroup.id === groupId) {
      setSelectedAdminGroup((prev) =>
        prev
          ? {
              ...prev,
              membersCount: Math.max(1, (prev.members?.length || 1) - 1),
              members: prev.members?.filter((m) => m.id !== memberId),
            }
          : null
      );
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in font-poppins text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
            {t('communityTitle')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Grup Trading Kolaboratif, Hak Akses Admin Pembuat Grup & Accumulative PnL
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="px-4 py-2.5 rounded-2xl border border-[#E4E9E6] bg-white hover:bg-[#F8FAF9] text-[#1E2923] font-extrabold text-xs shadow-sm flex items-center space-x-2 transition-all"
          >
            <Key className="w-4 h-4 text-[#05C46B]" />
            <span>{t('joinGroupBtn')}</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs shadow-md shadow-[#05C46B]/20 flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createGroupBtn')}</span>
          </button>
        </div>
      </div>

      {/* Group Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => {
          const isAdmin = group.createdBy === user?.id || user?.username === 'khuzaimafilla' || group.name.includes('SMC');

          return (
            <div key={group.id} className="tradewire-card p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pr-16">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E6F7F0] text-[#05C46B] flex items-center justify-center font-black text-lg border border-[#05C46B]/20 shrink-0">
                      <Crown className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#1E2923] text-base font-montserrat">
                        {group.name}
                      </h3>
                      <span className="text-[10px] font-extrabold text-[#6B7C72] bg-[#F8FAF9] px-2 py-0.5 rounded-md border border-[#E4E9E6]">
                        CODE: {group.code}
                      </span>
                    </div>
                  </div>
                </div>

                {group.isJoined && (
                  <div className="absolute top-4 right-4 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-[10px] font-extrabold border border-[#05C46B]/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>{t('joinedBadge')}</span>
                  </div>
                )}

                <p className="text-xs text-[#6B7C72] mb-4 leading-relaxed font-medium">
                  {group.description}
                </p>

                {/* Group Metrics */}
                <div className="grid grid-cols-3 gap-2 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E4E9E6] mb-4 text-center">
                  <div>
                    <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                      {t('membersCount')}
                    </p>
                    <p className="text-sm font-extrabold text-[#1E2923] flex items-center justify-center mt-0.5">
                      <Users className="w-3.5 h-3.5 mr-1 text-[#05C46B]" />
                      {group.membersCount}
                    </p>
                  </div>

                  <div className="border-x border-[#E4E9E6]">
                    <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                      {t('accumulativePnl')}
                    </p>
                    <p className="text-sm font-extrabold text-[#05C46B] flex items-center justify-center mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      +${(group.totalPnl / 1000).toFixed(1)}k
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                      {t('averageWinRate')}
                    </p>
                    <p className="text-sm font-extrabold text-[#1E2923] flex items-center justify-center mt-0.5">
                      <Percent className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
                      {group.winRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAdminGroup(group);
                      setIsAdminModalOpen(true);
                    }}
                    className="w-full py-2 bg-[#E6F7F0] hover:bg-[#05C46B]/20 text-[#05C46B] font-extrabold text-xs rounded-xl border border-[#05C46B]/40 flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Kelola Anggota (Hak Akses Admin)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => toggleGroupJoin(group.id)}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                    group.isJoined
                      ? 'bg-[#F8FAF9] text-[#6B7C72] border border-[#E4E9E6] hover:bg-[#E4E9E6]'
                      : 'bg-[#05C46B] text-white hover:bg-[#04A75B] shadow-md shadow-[#05C46B]/20'
                  }`}
                >
                  {group.isJoined ? t('leaveGroupBtn') : t('joinGroupBtn')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADMIN MEMBER MANAGEMENT MODAL (Requirement 2) */}
      {isAdminModalOpen && selectedAdminGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 my-auto">
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1.5 rounded-xl hover:bg-[#F8FAF9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#E6F7F0] text-[#05C46B]">
                <Crown className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#1E2923] font-montserrat">
                  Hak Akses Admin: {selectedAdminGroup.name}
                </h3>
                <p className="text-xs text-[#6B7C72] font-medium">
                  Kelola dan kick out anggota grup komunitas Anda
                </p>
              </div>
            </div>

            <div className="p-3 mb-4 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6] flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7C72]">
                Total Anggota Aktif: <strong className="text-[#1E2923]">{selectedAdminGroup.members?.length || selectedAdminGroup.membersCount}</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#05C46B] text-[10px] font-extrabold border border-[#05C46B]/30">
                FULL ADMIN CONTROL
              </span>
            </div>

            {/* Member List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(selectedAdminGroup.members || []).map((mbr) => {
                const isAdminMember = mbr.role === 'admin';
                return (
                  <div
                    key={mbr.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-[#E4E9E6] bg-[#F8FAF9]"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          mbr.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${mbr.username}`
                        }
                        alt={mbr.username}
                        className="w-9 h-9 rounded-full border border-[#05C46B] object-cover bg-white"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-extrabold text-[#1E2923]">
                            @{mbr.username}
                          </span>
                          <CreatorBadge username={mbr.username} size="sm" />
                          {isAdminMember && (
                            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-black text-[9px] border border-[#D4AF37]/40">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#6B7C72]">{mbr.fullName}</p>
                      </div>
                    </div>

                    {!isAdminMember && (
                      <button
                        type="button"
                        onClick={() => handleKickMember(selectedAdminGroup.id, mbr.id)}
                        className="px-3 py-1.5 rounded-xl bg-[#FF4D4D]/10 hover:bg-[#FF4D4D] text-[#FF4D4D] hover:text-white text-xs font-extrabold border border-[#FF4D4D]/30 flex items-center space-x-1 transition-all"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Kick Out</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                  placeholder="e.g. SMC Scalpers Elite"
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
                  placeholder="PRO99"
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
