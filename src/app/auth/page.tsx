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

  // Password visibility state
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Login form state - EMPTY INITIAL STATE (No prefilled default credentials!)
  const [loginEmailUser, setLoginEmailUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTradingStyle, setRegTradingStyle] = useState<TradingStyle>('Scalping');

  // Mandatory checkboxes
  const [isAgreedTamak, setIsAgreedTamak] = useState(false);
  const [isAgreedFillaRichest, setIsAgreedFillaRichest] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  // Handle Login Submit
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

  // Handle Register Submit
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
      setErrorMessage('Anda harus menyetujui Janji Trader & Pengakuan Filla!');
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

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4 py-8 font-poppins">
      <div className="w-full max-w-md bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-in relative text-left">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <AppLogo size={48} showText={false} className="mb-2" />
          <h1 className="text-2xl font-black text-[#1E2923] font-montserrat tracking-tight">
            {mode === 'login' ? t('loginTitle') : t('registerTitle')}
          </h1>
          <p className="text-xs text-[#6B7C72] mt-1 font-semibold">
            {t('appSubtitle')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#F8FAF9] p-1.5 rounded-2xl border border-[#E4E9E6] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#05C46B] shadow-sm border border-[#E4E9E6]'
                : 'text-[#6B7C72] hover:text-[#1E2923]'
            }`}
          >
            {t('loginNow')}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              mode === 'register'
                ? 'bg-white text-[#05C46B] shadow-sm border border-[#E4E9E6]'
                : 'text-[#6B7C72] hover:text-[#1E2923]'
            }`}
          >
            {t('registerNow')}
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-2xl bg-[#FF4D4D]/10 border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-bold flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('emailOrUsername')}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={loginEmailUser}
                  onChange={(e) => setLoginEmailUser(e.target.value)}
                  placeholder="Ketik username atau email akun Anda..."
                  className="w-full p-3.5 pl-10 rounded-2xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
                />
                <User className="w-4 h-4 text-[#6B7C72] absolute left-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase">
                  {t('password')}
                </label>
                <a href="#" className="text-[11px] font-bold text-[#05C46B] hover:underline">
                  {t('forgotPassword')}
                </a>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password Anda..."
                  className="w-full p-3.5 pl-10 pr-10 rounded-2xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#6B7C72] absolute left-3.5" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 text-[#6B7C72] hover:text-[#1E2923]"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-black text-sm rounded-2xl shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
            >
              <span>{t('loginNow')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Khuzaima Filla Januartha"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('username')}
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="khuzaimafilla"
                className="w-full p-3 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('password')}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Password aman..."
                  className="w-full p-3 pr-10 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 text-[#6B7C72] hover:text-[#1E2923]"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('confirmPassword')}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ulangi password..."
                  className="w-full p-3 pr-10 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-sm text-[#1E2923] font-semibold outline-none focus:border-[#05C46B]"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3 text-[#6B7C72] hover:text-[#1E2923]"
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Trading Style Selection */}
            <div>
              <label className="block text-[11px] font-extrabold text-[#1E2923] uppercase mb-1">
                {t('selectTradingStyle')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Scalping', 'Intraday', 'Swing Trade'] as TradingStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setRegTradingStyle(style)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      regTradingStyle === style
                        ? 'bg-[#05C46B] text-white shadow-sm'
                        : 'bg-[#F8FAF9] border border-[#E4E9E6] text-[#6B7C72] hover:text-[#1E2923]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#6B7C72] mt-1 italic">
                {t('tradingStyleWarning')}
              </p>
            </div>

            {/* Mandatory Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-[#E4E9E6]">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAgreedTamak}
                  onChange={(e) => setIsAgreedTamak(e.target.checked)}
                  className="mt-0.5 rounded text-[#05C46B] focus:ring-[#05C46B]"
                />
                <span className="text-[10px] text-[#6B7C72] font-semibold leading-tight">
                  {t('checkboxTamak')}
                </span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAgreedFillaRichest}
                  onChange={(e) => setIsAgreedFillaRichest(e.target.checked)}
                  className="mt-0.5 rounded text-[#05C46B] focus:ring-[#05C46B]"
                />
                <span className="text-[10px] text-[#6B7C72] font-semibold leading-tight">
                  {t('checkboxFillaRichest')}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isAgreedTamak || !isAgreedFillaRichest}
              className={`w-full py-3 rounded-2xl font-black text-sm transition-all ${
                isAgreedTamak && isAgreedFillaRichest
                  ? 'bg-[#05C46B] hover:bg-[#04A75B] text-white shadow-md shadow-[#05C46B]/20 cursor-pointer'
                  : 'bg-[#E4E9E6] text-[#6B7C72] cursor-not-allowed'
              }`}
            >
              {t('registerBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
