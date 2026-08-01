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
  Crown,
  X,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  requestedAt: string;
}

function getStoredRequests(): JoinRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('krtrade_join_requests') || '[]');
  } catch {
    return [];
  }
}

function saveStoredRequests(requests: JoinRequest[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('krtrade_join_requests', JSON.stringify(requests));
}

export default function CommunityPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [groups, setGroups] = useState<TradingGroup[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);

  // Create Group Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Join Group State
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinMessage, setJoinMessage] = useState('');

  // Admin Member Management Modal State
  const [selectedAdminGroup, setSelectedAdminGroup] = useState<TradingGroup | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    async function loadGroups() {
      const storedLocal = getStoredGroups();
      const requests = getStoredRequests();
      setJoinRequests(requests);

      const userJoinedKey = user ? `krtrade_joined_${user.id}` : 'krtrade_joined_guest';
      const userJoinedSet = new Set<string>();
      if (typeof window !== 'undefined') {
        const storedJoined = localStorage.getItem(userJoinedKey);
        if (storedJoined) {
          try {
            JSON.parse(storedJoined).forEach((id: string) => userJoinedSet.add(id));
          } catch {}
        }
      }

      let finalGroups: TradingGroup[] = storedLocal.map((g) => {
        const isCreatedByMe = user && g.createdBy === user.id;
        const isUserJoined = isCreatedByMe || userJoinedSet.has(g.id);
        const realMembersCount = g.members?.length || (isUserJoined ? 1 : 0);

        return {
          ...g,
          isJoined: isUserJoined,
          membersCount: realMembersCount,
        };
      });

      if (isSupabaseConfigured && user) {
        try {
          const { data: dbGroups, error } = await supabase.from('groups').select('*');
          if (!error && dbGroups && dbGroups.length > 0) {
            const { data: myMemberships } = await supabase
              .from('group_members')
              .select('group_id')
              .eq('user_id', user.id);

            const joinedGroupIds = new Set(myMemberships?.map((m: any) => m.group_id));

            const mappedDb: TradingGroup[] = await Promise.all(
              dbGroups.map(async (g: any) => {
                const isMine = g.created_by === user.id;
                const isJoined = isMine || joinedGroupIds.has(g.id) || userJoinedSet.has(g.id);

                // Get actual member count from group_members table
                const { count } = await supabase
                  .from('group_members')
                  .select('*', { count: 'exact', head: true })
                  .eq('group_id', g.id);

                // Get member profiles
                const { data: memberRows } = await supabase
                  .from('group_members')
                  .select('user_id')
                  .eq('group_id', g.id);

                const memberDetails: GroupMemberDetail[] = [];
                if (memberRows) {
                  for (const row of memberRows) {
                    const { data: prof } = await supabase
                      .from('profiles')
                      .select('id, username, full_name, avatar_url')
                      .eq('id', row.user_id)
                      .single();
                    if (prof) {
                      memberDetails.push({
                        id: prof.id,
                        username: prof.username,
                        fullName: prof.full_name || prof.username,
                        avatarUrl: prof.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prof.username}`,
                        role: g.created_by === prof.id ? 'admin' : 'member',
                      });
                    }
                  }
                }

                return {
                  id: g.id,
                  name: g.name,
                  code: g.code,
                  description: g.description || 'Komunitas Trading Kolaboratif KRtrade Platform.',
                  membersCount: count || memberDetails.length || 1,
                  totalPnl: 0,
                  winRate: 0,
                  isJoined,
                  createdBy: g.created_by,
                  members: memberDetails,
                };
              })
            );

            const dbCodes = new Set(mappedDb.map((g) => g.code));
            const extraLocal = finalGroups.filter((g) => !dbCodes.has(g.code));
            finalGroups = [...mappedDb, ...extraLocal];
          }
          }

          // Fetch real pending join requests for groups I'm admin of
          const myAdminGroups = dbGroups?.filter((g: any) => g.created_by === user.id).map((g: any) => g.id) || [];
          if (myAdminGroups.length > 0) {
            const { data: dbRequests } = await supabase
              .from('group_join_requests')
              .select('id, group_id, user_id, status, created_at, profiles(username, full_name, avatar_url)')
              .in('group_id', myAdminGroups)
              .eq('status', 'pending');

            if (dbRequests && dbRequests.length > 0) {
              const mappedRequests: JoinRequest[] = dbRequests.map((r: any) => ({
                id: r.id,
                groupId: r.group_id,
                userId: r.user_id,
                username: r.profiles?.username || 'user',
                fullName: r.profiles?.full_name || 'User',
                avatarUrl: r.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.profiles?.username}`,
                requestedAt: r.created_at,
              }));

              // Merge with local requests to avoid duplicates
              const dbRequestIds = new Set(mappedRequests.map(r => `${r.groupId}-${r.userId}`));
              const filteredLocal = requests.filter(r => !dbRequestIds.has(`${r.groupId}-${r.userId}`));
              setJoinRequests([...mappedRequests, ...filteredLocal]);
            }
          }

        } catch (err) {
          console.error('Error loading DB groups or requests:', err);
        }
      }

      setGroups(finalGroups);
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

    let newGroupId = 'grp_' + Date.now();

    if (isSupabaseConfigured && user) {
      const { data: newGrpData, error } = await supabase.from('groups').insert({
        name: newGroupName,
        code: newGroupCode.toUpperCase(),
        description: newGroupDesc || 'Komunitas Trading Kolaboratif KRtrade Platform.',
        created_by: groupAdminId,
      }).select().single();

      if (!error && newGrpData) {
        newGroupId = newGrpData.id;
        await supabase.from('group_members').insert({
          group_id: newGroupId,
          user_id: groupAdminId,
        });
      }
    }

    // Admin is automatically a member
    const adminMember: GroupMemberDetail = {
      id: groupAdminId,
      username: user?.username || 'admin',
      fullName: user?.fullName || 'Admin',
      avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'admin'}`,
      role: 'admin',
      joinedAt: new Date().toISOString(),
    };

    const newGrp: TradingGroup = {
      id: newGroupId,
      name: newGroupName,
      code: newGroupCode.toUpperCase(),
      description: newGroupDesc || 'Komunitas Trading Kolaboratif KRtrade Platform.',
      membersCount: 1,
      totalPnl: 0,
      winRate: 0,
      isJoined: true,
      createdBy: groupAdminId,
      members: [adminMember],
    };

    // Save joined state
    const userJoinedKey = user ? `krtrade_joined_${user.id}` : 'krtrade_joined_guest';
    const currentJoined = JSON.parse(localStorage.getItem(userJoinedKey) || '[]');
    localStorage.setItem(userJoinedKey, JSON.stringify([...new Set([...currentJoined, newGroupId])]));

    saveGroups([newGrp, ...groups]);
    setIsCreateOpen(false);
    setNewGroupName('');
    setNewGroupCode('');
    setNewGroupDesc('');
    showToast(`Grup "${newGroupName}" berhasil dibuat! Anda otomatis menjadi Admin.`);
  };

  const handleRequestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput) return;

    const code = joinCodeInput.trim().toUpperCase();
    const targetGroup = groups.find((g) => g.code === code);

    if (!targetGroup) {
      setJoinMessage('Kode komunitas tidak ditemukan. Pastikan kode yang dimasukkan benar.');
      return;
    }

    if (targetGroup.isJoined) {
      setJoinMessage('Anda sudah tergabung dalam komunitas ini.');
      return;
    }

    // Check if already requested
    const alreadyRequested = joinRequests.some(
      (r) => r.groupId === targetGroup.id && r.userId === user?.id
    );
    if (alreadyRequested) {
      setJoinMessage('Permintaan bergabung sudah dikirim. Menunggu persetujuan Admin.');
      return;
    }

    // Create join request
    const request: JoinRequest = {
      id: 'req_' + Date.now(),
      groupId: targetGroup.id,
      userId: user?.id || 'guest',
      username: user?.username || 'Guest',
      fullName: user?.fullName || 'Guest User',
      avatarUrl: user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`,
      requestedAt: new Date().toISOString(),
    };

    const updatedRequests = [...joinRequests, request];
    setJoinRequests(updatedRequests);
    saveStoredRequests(updatedRequests);

    if (isSupabaseConfigured && user) {
      await supabase.from('group_join_requests').insert({
        group_id: targetGroup.id,
        user_id: user.id,
        status: 'pending',
      });
    }

    setIsJoinOpen(false);
    setJoinCodeInput('');
    setJoinMessage('');
    showToast(`Permintaan bergabung ke "${targetGroup.name}" telah dikirim! Menunggu persetujuan Admin.`, 'info');
  };

  const handleAcceptRequest = (request: JoinRequest) => {
    // Add user to group as member
    const newMember: GroupMemberDetail = {
      id: request.userId,
      username: request.username,
      fullName: request.fullName,
      avatarUrl: request.avatarUrl,
      role: 'member',
      joinedAt: new Date().toISOString(),
    };

    const updated = groups.map((g) => {
      if (g.id === request.groupId) {
        const alreadyMember = g.members?.some((m) => m.id === request.userId);
        if (alreadyMember) return g;
        const updatedMembers = [...(g.members || []), newMember];
        return {
          ...g,
          members: updatedMembers,
          membersCount: updatedMembers.length,
          isJoined: g.isJoined,
        };
      }
      return g;
    });

    saveGroups(updated);

    // Save their joined state in localStorage
    const userJoinedKey = `krtrade_joined_${request.userId}`;
    const existing = JSON.parse(localStorage.getItem(userJoinedKey) || '[]');
    localStorage.setItem(userJoinedKey, JSON.stringify([...new Set([...existing, request.groupId])]));

    // Remove request
    const filteredRequests = joinRequests.filter((r) => r.id !== request.id);
    setJoinRequests(filteredRequests);
    saveStoredRequests(filteredRequests);

    if (isSupabaseConfigured) {
      // 1. Update request status to accepted
      supabase.from('group_join_requests').update({ status: 'accepted' }).eq('id', request.id).then();
      // 2. Insert into group_members
      supabase.from('group_members').insert({
        group_id: request.groupId,
        user_id: request.userId,
      }).then();
    }

    // Update admin modal
    if (selectedAdminGroup?.id === request.groupId) {
      const updatedGroup = updated.find((g) => g.id === request.groupId);
      if (updatedGroup) setSelectedAdminGroup(updatedGroup);
    }

    showToast(`@${request.username} berhasil diterima sebagai anggota!`);
  };

  const handleRejectRequest = (request: JoinRequest) => {
    const filteredRequests = joinRequests.filter((r) => r.id !== request.id);
    setJoinRequests(filteredRequests);
    saveStoredRequests(filteredRequests);

    if (isSupabaseConfigured) {
      supabase.from('group_join_requests').update({ status: 'rejected' }).eq('id', request.id).then();
    }

    showToast(`Permintaan dari @${request.username} ditolak.`, 'error');
  };

  const handleLeaveGroup = (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (!group) return;

    // Prevent admin from leaving their own group
    if (group.createdBy === user?.id) {
      showToast('Admin tidak bisa keluar dari grup sendiri. Hapus grup untuk menutupnya.', 'error');
      return;
    }

    const userJoinedKey = user ? `krtrade_joined_${user.id}` : 'krtrade_joined_guest';
    const updated = groups.map((g) => {
      if (g.id === id) {
        const filteredMembers = g.members?.filter((m) => m.id !== user?.id) || [];
        const currentJoined = JSON.parse(localStorage.getItem(userJoinedKey) || '[]');
        localStorage.setItem(
          userJoinedKey,
          JSON.stringify(currentJoined.filter((gid: string) => gid !== id))
        );
        return {
          ...g,
          isJoined: false,
          members: filteredMembers,
          membersCount: Math.max(1, filteredMembers.length),
        };
      }
      return g;
    });
    saveGroups(updated);
    showToast(`Anda telah keluar dari grup "${group.name}".`, 'info');
  };

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
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-5 py-3.5 rounded-2xl shadow-xl font-bold text-sm flex items-center space-x-2.5 animate-fade-in max-w-sm ${
            toast.type === 'success'
              ? 'bg-[#E6F7F0] border border-[#05C46B]/40 text-[#05C46B]'
              : toast.type === 'error'
              ? 'bg-[#FF4D4D]/10 border border-[#FF4D4D]/40 text-[#FF4D4D]'
              : 'bg-[#E6F7F0] border border-[#05C46B]/40 text-[#1E2923]'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : toast.type === 'error' ? <XCircle className="w-5 h-5 shrink-0" /> : <Clock className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
            {t('communityTitle')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1 font-medium">
            Grup Trading Kolaboratif — Bergabung dengan kode unik atau buat grup sendiri
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

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="tradewire-card p-12 text-center text-[#6B7C72]">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-bold text-[#1E2923]">Belum ada komunitas yang tersedia.</p>
          <p className="text-xs mt-1">Buat grup pertama Anda atau bergabung menggunakan kode undangan.</p>
        </div>
      )}

      {/* Group Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => {
          const isAdmin = group.createdBy === user?.id;
          const pendingForThisGroup = joinRequests.filter((r) => r.groupId === group.id);
          const realMembersCount = group.members?.length || group.membersCount;

          return (
            <div key={group.id} className="tradewire-card p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pr-20">
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

                {/* Joined Badge */}
                {group.isJoined && (
                  <div className="absolute top-4 right-4 inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#E6F7F0] text-[#05C46B] text-[10px] font-extrabold border border-[#05C46B]/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>{isAdmin ? 'ADMIN' : t('joinedBadge')}</span>
                  </div>
                )}

                <p className="text-xs text-[#6B7C72] mb-4 leading-relaxed font-medium">
                  {group.description}
                </p>

                {/* Group Metrics - REAL DATA */}
                <div className="grid grid-cols-3 gap-2 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E4E9E6] mb-4 text-center">
                  <div>
                    <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                      {t('membersCount')}
                    </p>
                    <p className="text-sm font-extrabold text-[#1E2923] flex items-center justify-center mt-0.5">
                      <Users className="w-3.5 h-3.5 mr-1 text-[#05C46B]" />
                      {realMembersCount}
                    </p>
                  </div>

                  <div className="border-x border-[#E4E9E6]">
                    <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                      {t('accumulativePnl')}
                    </p>
                    <p className="text-sm font-extrabold text-[#05C46B] flex items-center justify-center mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      {group.totalPnl > 0 ? `+$${(group.totalPnl / 1000).toFixed(1)}k` : '$0'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-extrabold text-[#6B7C72]">
                      {t('averageWinRate')}
                    </p>
                    <p className="text-sm font-extrabold text-[#1E2923] flex items-center justify-center mt-0.5">
                      <Percent className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" />
                      {group.winRate > 0 ? `${group.winRate}%` : '—'}
                    </p>
                  </div>
                </div>

                {/* Pending Requests (admin only) */}
                {isAdmin && pendingForThisGroup.length > 0 && (
                  <div className="mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <p className="text-xs font-extrabold text-amber-700 mb-2 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pendingForThisGroup.length} Permintaan Bergabung</span>
                    </p>
                    <div className="space-y-1.5">
                      {pendingForThisGroup.map((req) => (
                        <div key={req.id} className="flex items-center justify-between bg-white rounded-xl p-2 border border-amber-100">
                          <div className="flex items-center space-x-2">
                            <img
                              src={req.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.username}`}
                              alt={req.username}
                              className="w-7 h-7 rounded-full border border-[#05C46B] object-cover"
                            />
                            <span className="text-xs font-bold text-[#1E2923]">@{req.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleAcceptRequest(req)}
                              className="p-1.5 rounded-lg bg-[#E6F7F0] text-[#05C46B] hover:bg-[#05C46B] hover:text-white transition-all border border-[#05C46B]/30"
                              title="Terima"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(req)}
                              className="p-1.5 rounded-lg bg-[#FF4D4D]/10 text-[#FF4D4D] hover:bg-[#FF4D4D] hover:text-white transition-all border border-[#FF4D4D]/30"
                              title="Tolak"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    <span>Kelola Anggota (Admin)</span>
                  </button>
                )}

                {group.isJoined ? (
                  !isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleLeaveGroup(group.id)}
                      className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-[#F8FAF9] text-[#6B7C72] border border-[#E4E9E6] hover:bg-[#E4E9E6] transition-all"
                    >
                      {t('leaveGroupBtn')}
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setJoinCodeInput(group.code);
                      setIsJoinOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl font-extrabold text-xs bg-[#05C46B] text-white hover:bg-[#04A75B] shadow-md shadow-[#05C46B]/20 transition-all"
                  >
                    Minta Bergabung
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADMIN MEMBER MANAGEMENT MODAL */}
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
                  Admin: {selectedAdminGroup.name}
                </h3>
                <p className="text-xs text-[#6B7C72] font-medium">
                  Kelola anggota dan permintaan bergabung
                </p>
              </div>
            </div>

            <div className="p-3 mb-4 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6] flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B7C72]">
                Total Anggota: <strong className="text-[#1E2923]">{selectedAdminGroup.members?.length || selectedAdminGroup.membersCount}</strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#05C46B] text-[10px] font-extrabold border border-[#05C46B]/30">
                ADMIN CONTROL
              </span>
            </div>

            {/* Pending Requests in Admin Modal */}
            {joinRequests.filter((r) => r.groupId === selectedAdminGroup.id).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-extrabold text-amber-600 mb-2 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Permintaan Menunggu Persetujuan</span>
                </p>
                <div className="space-y-2">
                  {joinRequests
                    .filter((r) => r.groupId === selectedAdminGroup.id)
                    .map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-3 rounded-2xl border border-amber-200 bg-amber-50">
                        <div className="flex items-center space-x-3">
                          <img
                            src={req.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.username}`}
                            alt={req.username}
                            className="w-9 h-9 rounded-full border border-amber-300 object-cover"
                          />
                          <div>
                            <span className="text-xs font-extrabold text-[#1E2923]">@{req.username}</span>
                            <p className="text-[10px] text-[#6B7C72]">{req.fullName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(req)}
                            className="px-3 py-1.5 rounded-xl bg-[#E6F7F0] hover:bg-[#05C46B] text-[#05C46B] hover:text-white text-xs font-extrabold border border-[#05C46B]/30 flex items-center space-x-1 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terima</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectRequest(req)}
                            className="px-3 py-1.5 rounded-xl bg-[#FF4D4D]/10 hover:bg-[#FF4D4D] text-[#FF4D4D] hover:text-white text-xs font-extrabold border border-[#FF4D4D]/30 flex items-center space-x-1 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Member List */}
            <p className="text-xs font-extrabold text-[#6B7C72] mb-2">Daftar Anggota</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {(selectedAdminGroup.members || []).length === 0 ? (
                <p className="text-xs text-[#6B7C72] text-center py-4">Belum ada anggota.</p>
              ) : (
                (selectedAdminGroup.members || []).map((mbr) => {
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${mbr.username}`;
                          }}
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
                          <span>Kick</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
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

            <h3 className="text-xl font-extrabold text-[#1E2923] mb-1 font-montserrat">
              {t('createGroupBtn')}
            </h3>
            <p className="text-xs text-[#6B7C72] font-medium mb-4">
              Anda otomatis menjadi Admin dari grup yang dibuat.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  Nama Komunitas / Grup
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
                  onChange={(e) => setNewGroupCode(e.target.value.toUpperCase())}
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
                  Buat Grup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN GROUP (REQUEST) MODAL */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 text-center my-auto">
            <button
              type="button"
              onClick={() => { setIsJoinOpen(false); setJoinMessage(''); setJoinCodeInput(''); }}
              className="absolute right-4 top-4 text-[#6B7C72] hover:text-[#1E2923] p-1.5 rounded-xl hover:bg-[#F8FAF9] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-[#1E2923] mb-1 font-montserrat">
              Minta Bergabung ke Grup
            </h3>
            <p className="text-xs text-[#6B7C72] mb-5 font-medium">
              Masukkan kode komunitas. Permintaan Anda akan dikirim ke Admin untuk disetujui.
            </p>

            <form onSubmit={handleRequestJoin} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                required
                value={joinCodeInput}
                onChange={(e) => { setJoinCodeInput(e.target.value.toUpperCase()); setJoinMessage(''); }}
                placeholder={t('groupCodePlaceholder')}
                className="w-full p-3.5 text-center text-lg font-black tracking-widest uppercase rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-[#1E2923] focus:border-[#05C46B] outline-none"
              />

              {joinMessage && (
                <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  {joinMessage}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsJoinOpen(false); setJoinMessage(''); setJoinCodeInput(''); }}
                  className="py-2.5 rounded-xl text-xs font-extrabold text-[#6B7C72] border border-[#E4E9E6] bg-[#F8FAF9] hover:bg-[#E4E9E6] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#05C46B]/20 transition-all"
                >
                  Kirim Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
