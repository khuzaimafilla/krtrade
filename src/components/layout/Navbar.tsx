'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AppLogo from '@/components/common/AppLogo';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Trophy,
  Settings,
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
    { href: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E4E9E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Branding */}
            <Link href="/dashboard">
              <AppLogo size={36} showText={true} />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#E6F7F0] text-[#05C46B] font-extrabold'
                        : 'text-[#6B7C72] hover:text-[#1E2923] hover:bg-[#F8FAF9]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#05C46B]' : 'text-[#6B7C72]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Language & User Profile Section */}
            <div className="flex items-center space-x-2">
              <button
                onClick={openLangModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#E4E9E6] bg-[#F8FAF9] text-xs font-extrabold text-[#1E2923] hover:bg-[#E4E9E6] transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-[#05C46B]" />
                <span className="uppercase">{language}</span>
              </button>

              {mounted && isAuthenticated && user && (
                <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-[#E4E9E6]">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Filla'}
                      alt={user.username}
                      className="w-8 h-8 rounded-full border border-[#05C46B] bg-[#E6F7F0]"
                    />
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-[#1E2923] truncate max-w-[120px]">
                        {user.username}
                      </p>
                      <p className="text-[10px] text-[#6B7C72] font-semibold">
                        {user.tradingStyle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    title={t('logout')}
                    className="p-2 text-[#6B7C72] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 rounded-xl transition-colors"
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
