'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AppLogo from '@/components/common/AppLogo';
import CreatorBadge from '@/components/common/CreatorBadge';
import { Globe, User, LogOut, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in max-w-4xl mx-auto font-poppins text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-[#6B7C72] mt-1 font-medium">
          Pengaturan Bahasa Aplikasi & Konfigurasi Pengguna KRTrade
        </p>
      </div>

      {/* User Profile Overview & Link to Dedicated /profile page */}
      <div className="tradewire-card p-6 bg-gradient-to-r from-white via-[#E6F7F0]/30 to-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={
              user?.avatarUrl ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'khuzaimafilla'}`
            }
            alt="Profile Avatar"
            className="w-14 h-14 rounded-full border-2 border-[#05C46B] object-cover bg-white shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-[#1E2923] font-montserrat">
                {user?.fullName || 'Filla Calon Wong Sugih'}
              </h3>
              <CreatorBadge username={user?.username} size="sm" />
            </div>
            <p className="text-xs font-semibold text-[#6B7C72]">@{user?.username || 'khuzaimafilla'}</p>
            <p className="text-[11px] text-[#05C46B] font-extrabold mt-0.5">
              Saldo Awal: ${(user?.initialBalance || 10000).toLocaleString()}
            </p>
          </div>
        </div>

        <Link
          href="/profile"
          className="px-4 py-2.5 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold shadow-md shadow-[#05C46B]/20 flex items-center space-x-2 transition-all hover:scale-105"
        >
          <User className="w-4 h-4" />
          <span>Edit Profil Saya</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Language Preference Section */}
      <div className="tradewire-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-xl bg-[#E6F7F0] text-[#05C46B]">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#1E2923] font-montserrat">
              {t('languageSection')}
            </h3>
            <p className="text-xs text-[#6B7C72] font-medium">
              Pilih bahasa pengantar tampilan antarmuka aplikasi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
              language === 'id'
                ? 'bg-[#E6F7F0] border-[#05C46B] text-[#05C46B] font-black shadow-sm'
                : 'bg-[#F8FAF9] border-[#E4E9E6] text-[#1E2923]'
            }`}
          >
            <span className="text-2xl">🇮🇩</span>
            <div className="text-left">
              <p className="text-sm font-extrabold">Bahasa Indonesia</p>
              <p className="text-[10px] text-[#6B7C72]">Bahasa Utama</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
              language === 'en'
                ? 'bg-[#E6F7F0] border-[#05C46B] text-[#05C46B] font-black shadow-sm'
                : 'bg-[#F8FAF9] border-[#E4E9E6] text-[#1E2923]'
            }`}
          >
            <span className="text-2xl">🇬🇧</span>
            <div className="text-left">
              <p className="text-sm font-extrabold">English</p>
              <p className="text-[10px] text-[#6B7C72]">Global Language</p>
            </div>
          </button>
        </div>
      </div>

      {/* Logout Account Card */}
      <div className="tradewire-card p-6 bg-white border border-[#FF4D4D]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#1E2923] text-base font-montserrat flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-[#FF4D4D]" />
              <span>Keluar dari Akun KRTrade</span>
            </h3>
            <p className="text-xs text-[#6B7C72] mt-1 font-medium">
              Akhiri sesi login pengguna aktif dan kembali ke halaman Welcome.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="px-5 py-2.5 bg-[#FF4D4D] hover:bg-[#E63939] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#FF4D4D]/20 transition-all flex items-center space-x-2 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>

      {/* App Info Card */}
      <div className="tradewire-card p-6 bg-gradient-to-r from-white via-[#E6F7F0]/30 to-white text-center flex flex-col items-center">
        <AppLogo size={44} showText={true} className="mb-2" />
        <p className="text-xs text-[#6B7C72] mt-1">
          <span className="text-[#05C46B] font-bold">BETA Version 0.0.0.1</span> | PWA Web Application
        </p>
      </div>

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
