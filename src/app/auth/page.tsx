'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { TradingStyle } from '@/types';
import AppLogo from '@/components/common/AppLogo';
import {
  AlertCircle,
  Lock,
  User,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Password visibility state (Point 2)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Login form state
  const [loginEmailUser, setLoginEmailUser] = useState('Filla_Ferari9Naga');
  const [loginPassword, setLoginPassword] = useState('9naga_password');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTradingStyle, setRegTradingStyle] = useState<TradingStyle>('Scalping');

  // Mandatory checkboxes required by spec
  const [isAgreedTamak, setIsAgreedTamak] = useState(false);
  const [isAgreedFillaRichest, setIsAgreedFillaRichest] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  // Handle Login Submit -> Direct Authentication without OTP
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailUser || !loginPassword) {
      setErrorMessage('Harap isi Username/Email dan Password!');
      return;
    }
    setErrorMessage('');
    const success = await login(loginEmailUser, loginPassword);
    if (success) {
      router.push('/dashboard');
    } else {
      setErrorMessage('Gagal masuk. Periksa kembali Username/Email & Password!');
    }
  };

  // Handle Register Submit -> Validates mandatory checkboxes & trading style
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName || !regEmail || !regUsername || !regPassword) {
      setErrorMessage('Semua field wajib diisi!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    if (!isAgreedTamak || !isAgreedFillaRichest) {
      setErrorMessage('Anda WAJIB menyetujui kedua janji & pengakuan trader di bawah!');
      return;
    }

    register({
      fullName: regFullName,
      email: regEmail,
      username: regUsername,
      password: regPassword,
      tradingStyle: regTradingStyle,
      isAgreedTamak,
      isAgreedFillaRichest,
    });

    router.push('/dashboard');
  };

  const isRegisterDisabled = !isAgreedTamak || !isAgreedFillaRichest;

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-center items-center p-4 py-8 relative font-poppins">
      <div className="w-full max-w-lg bg-white border border-[#E4E9E6] rounded-3xl shadow-xl p-6 sm:p-8 relative z-10 animate-fade-in">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2">
            <AppLogo size={48} showText={false} />
          </div>
          <h2 className="text-2xl font-black text-[#1E2923] font-montserrat">
            {mode === 'login' ? t('loginTitle') : t('registerTitle')}
          </h2>
          <p className="text-xs text-[#6B7C72] mt-1 font-semibold">
            <span className="text-[#D4AF37]">BETA Version 0.0.0.1</span>
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8FAF9] p-1.5 rounded-2xl border border-[#E4E9E6] mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`py-2.5 rounded-xl font-extrabold text-sm transition-all font-montserrat ${
              mode === 'login'
                ? 'bg-white text-[#05C46B] shadow-sm'
                : 'text-[#6B7C72] hover:text-[#1E2923]'
            }`}
          >
            {t('loginNow')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`py-2.5 rounded-xl font-extrabold text-sm transition-all font-montserrat ${
              mode === 'register'
                ? 'bg-white text-[#05C46B] shadow-sm'
                : 'text-[#6B7C72] hover:text-[#1E2923]'
            }`}
          >
            {t('registerNow')}
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 flex items-start space-x-2 text-[#FF4D4D]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('emailOrUsername')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={loginEmailUser}
                  onChange={(e) => setLoginEmailUser(e.target.value)}
                  placeholder="Masukkan username atau email terdaftar"
                  className="w-full p-3.5 pl-10 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50"
                />
                <User className="w-4 h-4 text-[#6B7C72] absolute left-3.5 top-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1E2923] uppercase">
                  {t('password')}
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Instruksi reset password telah dikirim ke email Anda!'); }} className="text-xs font-bold text-[#05C46B] hover:underline">
                  {t('forgotPassword')}
                </a>
              </div>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full p-3.5 pl-10 pr-10 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50"
                />
                <Lock className="w-4 h-4 text-[#6B7C72] absolute left-3.5 top-4" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-4 text-[#6B7C72] hover:text-[#1E2923]"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#05C46B]/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('loginBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Masukkan nama lengkap sesuai identitas"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Masukkan alamat email aktif"
                  className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  {t('username')}
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Pilih username unik"
                  className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Buat password minimal 6 karakter"
                    className="w-full p-3 pr-9 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-3.5 text-[#6B7C72] hover:text-[#1E2923]"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1E2923] uppercase mb-1">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full p-3 pr-9 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold focus:border-[#05C46B] outline-none placeholder:text-slate-400 placeholder:opacity-50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2.5 top-3.5 text-[#6B7C72] hover:text-[#1E2923]"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Trading Style Selector */}
            <div className="p-3.5 rounded-2xl bg-[#E6F7F0]/60 border border-[#05C46B]/30">
              <label className="block text-xs font-extrabold text-[#1E2923] uppercase mb-1">
                {t('selectTradingStyle')}
              </label>

              <div className="grid grid-cols-3 gap-2 my-2">
                {(['Swing Trade', 'Intraday', 'Scalping'] as TradingStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setRegTradingStyle(style)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      regTradingStyle === style
                        ? 'bg-[#05C46B] text-white border-[#05C46B] shadow-sm'
                        : 'bg-white text-[#1E2923] border-[#E4E9E6]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>

              <div className="flex items-start space-x-1.5 mt-2 text-[#FF4D4D]">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold italic leading-tight">
                  "{t('tradingStyleWarning')}"
                </p>
              </div>
            </div>

            {/* Mandatory Checkboxes required by prompt */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start space-x-3 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4E9E6] cursor-pointer hover:border-[#05C46B]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isAgreedTamak}
                  onChange={(e) => setIsAgreedTamak(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#05C46B] rounded"
                />
                <span className="text-xs font-semibold text-[#1E2923] leading-snug">
                  "{t('checkboxTamak')}"
                </span>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4E9E6] cursor-pointer hover:border-[#05C46B]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isAgreedFillaRichest}
                  onChange={(e) => setIsAgreedFillaRichest(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#05C46B] rounded"
                />
                <span className="text-xs font-semibold text-[#1E2923] leading-snug">
                  "{t('checkboxFillaRichest')}"
                </span>
              </label>
            </div>

            {/* Register Button - Disabled validation state (Point 9) */}
            <button
              type="submit"
              disabled={isRegisterDisabled}
              className={`w-full py-3.5 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 mt-4 ${
                isRegisterDisabled
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-[#05C46B] hover:bg-[#04A75B] text-white shadow-lg shadow-[#05C46B]/25'
              }`}
            >
              <span>{t('registerBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
