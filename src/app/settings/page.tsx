'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AppLogo from '@/components/common/AppLogo';
import { convertFileToBase64 } from '@/lib/imageHelper';
import { Globe, User, Shield, Lock, Save, Sparkles, Crown, LogOut, Camera, Upload, CheckCircle2 } from 'lucide-react';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';
import ConfirmSaveModal from '@/components/modals/ConfirmSaveModal';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { user, updateUser, logout } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Filla Calon Wong Sugih 9 Naga');
  const [email, setEmail] = useState(user?.email || 'filla.ferari@krtrade.com');
  const [username, setUsername] = useState(user?.username || 'Filla_Ferari9Naga');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Filla'}`);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmSaveOpen(true);
  };

  const handleExecuteSave = async () => {
    const finalAvatar = pendingAvatar || avatarUrl;
    setAvatarUrl(finalAvatar);
    await updateUser({
      fullName,
      email,
      username,
      avatarUrl: finalAvatar,
    });
    setPendingAvatar(null);
    setIsConfirmSaveOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleImageSelected = async (file: File) => {
    const base64 = await convertFileToBase64(file);
    setPendingAvatar(base64);
    setIsConfirmSaveOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8 animate-fade-in max-w-4xl mx-auto font-poppins">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-[#6B7C72] mt-1 font-medium">
          Pengaturan Bahasa Aplikasi & Profil Trader 9 Naga
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-[#E6F7F0] border border-[#05C46B]/40 text-[#05C46B] font-bold text-sm flex items-center space-x-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#05C46B]" />
          <span>Berhasil! Perubahan profil & foto profil Anda telah disimpan.</span>
        </div>
      )}

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

      {/* Trader Profile Management */}
      <div className="tradewire-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-[#E6F7F0] text-[#05C46B]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#1E2923] font-montserrat">
              {t('profileSection')}
            </h3>
            <p className="text-xs text-[#6B7C72] font-medium">
              Kelola informasi diri & foto identitas trader
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                Foto Profil Trader (Upload File / Kamera)
              </label>
              <div className="flex items-center space-x-3 bg-[#F8FAF9] p-3 rounded-2xl border border-[#E4E9E6]">
                <div className="relative group shrink-0">
                  <img
                    src={pendingAvatar || avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || 'Filla'}`}
                    alt="Profile Avatar"
                    className="w-12 h-12 rounded-full border-2 border-[#05C46B] object-cover bg-white shadow-sm"
                  />
                  <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelected(file);
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1">
                  <label className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold cursor-pointer shadow-sm transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelected(file);
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-[#6B7C72] mt-1 font-semibold">
                    Dukung file PNG, JPG, GIF dari HP atau Laptop
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Locked Trading Style Notice */}
          <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-[#E4E9E6] flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-white text-[#6B7C72] border border-[#E4E9E6]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-[#1E2923]">
                  {t('tradingStyleLocked')}:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30">
                  {user?.tradingStyle || 'Scalping'}
                </span>
              </div>
              <p className="text-xs text-[#6B7C72] mt-1 font-medium">
                {t('lockedNote')} ("Anda tidak bisa ubah gaya trading anda, 1 aja jangan kebanyakan gaya!")
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E4E9E6]">
            <button
              type="submit"
              className="px-6 py-3 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#05C46B]/20 flex items-center space-x-2 transition-transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>{t('save')} Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Logout Account Card */}
      <div className="tradewire-card p-6 bg-white border border-[#FF4D4D]/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#1E2923] text-base font-montserrat flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-[#FF4D4D]" />
              <span>Keluar dari Akun KRtrade</span>
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
          <span className="text-[#D4AF37] font-bold">BETA Version 0.0.0.1</span> | PWA Web Application
        </p>
      </div>

      {/* Confirm Save Profile/Photo Modal */}
      <ConfirmSaveModal
        isOpen={isConfirmSaveOpen}
        onConfirm={handleExecuteSave}
        onClose={() => {
          setIsConfirmSaveOpen(false);
          setPendingAvatar(null);
        }}
      />

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
