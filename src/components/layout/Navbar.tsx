'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AppLogo from '@/components/common/AppLogo';
import CreatorBadge from '@/components/common/CreatorBadge';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Trophy,
  Settings,
  User,
  Globe,
  LogOut,
} from 'lucide-react';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';

export default function Navbar() {
  const pathname = usePathname();
  const { t, openLangModal, language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide nav on onboarding / auth
  if (pathname === '/welcome' || pathname === '/auth') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/journal', label: t('journal'), icon: BookOpen },
    { href: '/community', label: t('community'), icon: Users },
    { href: '/leaderboard', label: t('leaderboard'), icon: Trophy },
    { href: '/profile', label: 'Profil Saya', icon: User },
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E9E6] font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Branding */}
            <Link href="/dashboard" className="shrink-0">
              <AppLogo size={32} showText={true} />
            </Link>

            {/* Compact Icon Navigation Bar */}
            <nav className="hidden md:flex items-center space-x-1.5 bg-[#F8FAF9] p-1.5 rounded-2xl border border-[#E4E9E6]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`relative group flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      isActive
                        ? 'bg-white text-[#05C46B] shadow-sm border border-[#E4E9E6]'
                        : 'text-[#6B7C72] hover:text-[#1E2923] hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#05C46B]' : 'text-[#6B7C72]'}`} />
                    <span className="hidden xl:inline-block font-montserrat">{item.label}</span>

                    {/* Tooltip on hover for icon-only compact view */}
                    <span className="xl:hidden absolute -bottom-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E2923] text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Language & User Profile Section */}
            <div className="flex items-center space-x-2">
              <button
                onClick={openLangModal}
                title="Ganti Bahasa / Switch Language"
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-extrabold text-[#1E2923] hover:bg-[#E4E9E6] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#05C46B]" />
                <span className="uppercase text-[11px] font-mono">{language}</span>
              </button>

              {mounted && isAuthenticated && user && (
                <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-[#E4E9E6]">
                  <Link
                    href="/profile"
                    title={`Profil: ${user.username}`}
                    className="flex items-center space-x-2 group p-1 rounded-xl hover:bg-[#F8FAF9] transition-colors"
                  >
                    <img
                      src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Filla'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border border-[#05C46B] bg-[#E6F7F0] object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="text-left hidden lg:block">
                      <div className="flex items-center space-x-1">
                        <p className="text-xs font-extrabold text-[#1E2923] truncate max-w-[100px]">
                          {user.username}
                        </p>
                        <CreatorBadge username={user.username} size="sm" />
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    title={t('logout')}
                    className="p-1.5 text-[#6B7C72] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
