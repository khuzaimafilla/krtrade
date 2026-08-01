'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AppLogo from '@/components/common/AppLogo';
import CreatorBadge from '@/components/common/CreatorBadge';
import { convertFileToBase64 } from '@/lib/imageHelper';
import {
  User,
  Mail,
  Lock,
  Save,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  DollarSign,
  FileText,
  TrendingUp,
  Percent,
  BookOpen,
  Award,
} from 'lucide-react';
import ConfirmSaveModal from '@/components/modals/ConfirmSaveModal';
import { isCreatorUser, AccountCurrency } from '@/types';

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [initialBalance, setInitialBalance] = useState<string>(
    (user?.initialBalance !== undefined ? user.initialBalance : 10000).toString()
  );
  const [accountCurrency, setAccountCurrency] = useState<AccountCurrency>(
    user?.accountCurrency || 'USD'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'trader'}`
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string | null>(null);

  const isCreator = isCreatorUser(username);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmSaveOpen(true);
  };

  const handleExecuteSave = async () => {
    const finalAvatar = pendingAvatar || avatarUrl;
    const numBalance = parseFloat(initialBalance) || 0;

    setAvatarUrl(finalAvatar);
    await updateUser({
      fullName,
      email,
      username,
      bio,
      initialBalance: numBalance,
      accountCurrency,
      avatarUrl: finalAvatar,
    });

    setPendingAvatar(null);
    setIsConfirmSaveOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 5000);
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
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2923] font-montserrat">
            Profil Trader Saya
          </h1>
          <CreatorBadge username={username} size="lg" />
        </div>
        <p className="text-xs text-[#6B7C72] mt-1 font-medium">
          Kelola informasi identitas, foto profil, bio, dan kustomisasi saldo awal trading Anda
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-[#E6F7F0] border border-[#05C46B]/40 text-[#05C46B] font-bold text-sm flex items-center space-x-2 shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#05C46B] shrink-0" />
          <div>
            <p className="font-extrabold">✅ Profil berhasil disimpan!</p>
            <p className="text-xs font-medium text-[#05C46B]/80 mt-0.5">Semua perubahan profil dan foto telah diperbarui.</p>
          </div>
        </div>
      )}

      {/* Main Profile Summary Header Card */}
      <div className="tradewire-card p-6 bg-gradient-to-r from-white via-[#E6F7F0]/30 to-white relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar with Camera Uploader */}
          <div className="relative group shrink-0">
            <img
              src={
                pendingAvatar ||
                avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
              }
              alt="Profile Avatar"
              className={`w-24 h-24 rounded-full border-4 object-cover bg-white shadow-md ${
                isCreator ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/30' : 'border-[#05C46B]'
              }`}
            />
            <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="w-6 h-6" />
              <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
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

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-1">
              <h2 className="text-xl font-extrabold text-[#1E2923] font-montserrat">
                {fullName}
              </h2>
              <CreatorBadge username={username} size="sm" />
            </div>

            <p className="text-xs font-bold text-[#6B7C72] mb-3">@{username}</p>

            <p className="text-xs text-[#6B7C72] bg-white p-3 rounded-2xl border border-[#E4E9E6] italic max-w-xl">
              "{bio}"
            </p>
          </div>
        </div>
      </div>

      {/* Profile Edit Form Card */}
      <div className="tradewire-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-[#E6F7F0] text-[#05C46B]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#1E2923] font-montserrat">
              Edit Data Profil
            </h3>
            <p className="text-xs text-[#6B7C72] font-medium">
              Perbarui identitas pribadi, foto, bio, dan saldo akun
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
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
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            {/* Flexible Account Starting Balance & Currency Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1E2923] uppercase flex items-center justify-between">
                <span>Saldo Awal Trading & Kategori Mata Uang</span>
                <span className="text-[10px] text-[#05C46B] lowercase font-normal">
                  (Bebas & Fleksibel)
                </span>
              </label>

              {/* Currency Selector Pills */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(['USD', 'CENT', 'IDR'] as AccountCurrency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setAccountCurrency(curr)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      accountCurrency === curr
                        ? 'bg-[#05C46B] text-white shadow-sm'
                        : 'bg-[#F8FAF9] border border-[#E4E9E6] text-[#6B7C72] hover:text-[#1E2923]'
                    }`}
                  >
                    {curr === 'USD' ? 'USD ($)' : curr === 'CENT' ? 'CENT (USc)' : 'IDR (Rp)'}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center">
                <DollarSign className="w-4 h-4 text-[#05C46B] absolute left-3.5" />
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="e.g. 10, 100, 10000..."
                  className="w-full p-3.5 pl-10 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-extrabold outline-none focus:border-[#05C46B]"
                />
              </div>
              <p className="text-[10px] text-[#6B7C72] italic font-medium">
                Bisa diisi fleksibel dari $0, $10, $50, hingga nominal berapapun sesuai tipe akun Anda.
              </p>
            </div>
          </div>

          {/* Bio Textarea */}
          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
              Bio / Kata Mutiara Trader
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Deskripsikan strategi, kutipan favorit, atau prinsip trading Anda..."
              className="w-full p-3.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] outline-none focus:border-[#05C46B]"
            />
          </div>

          {/* Photo File Uploader Card */}
          <div>
            <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
              Unggah Foto Profil Baru (HP / Laptop)
            </label>
            <div className="flex items-center space-x-4 bg-[#F8FAF9] p-4 rounded-2xl border border-[#E4E9E6]">
              <img
                src={
                  pendingAvatar ||
                  avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
                }
                alt="Preview"
                className="w-14 h-14 rounded-full border-2 border-[#05C46B] object-cover bg-white shadow-sm"
              />
              <div className="flex-1">
                <label className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold cursor-pointer shadow-sm transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Pilih File Foto</span>
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
                  Mendukung foto galeri HP atau kamera laptop (PNG, JPG, WebP)
                </p>
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
                <span className="font-extrabold text-sm text-[#1E2923]">Gaya Trading Utama:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#05C46B] text-xs font-extrabold border border-[#05C46B]/30">
                  {user?.tradingStyle || 'Scalping'}
                </span>
              </div>
              <p className="text-xs text-[#6B7C72] mt-1 font-medium">
                Gaya trading telah dikunci pada saat registrasi awal untuk menjaga disiplin strategi.
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-[#E4E9E6]">
            <button
              type="submit"
              className="px-6 py-3 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#05C46B]/20 flex items-center space-x-2 transition-transform hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirm Save Modal */}
      <ConfirmSaveModal
        isOpen={isConfirmSaveOpen}
        onConfirm={handleExecuteSave}
        onClose={() => {
          setIsConfirmSaveOpen(false);
          setPendingAvatar(null);
        }}
      />
    </div>
  );
}
