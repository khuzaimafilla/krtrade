'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  User,
  LogOut,
  BarChart2,
  ChevronDown
} from 'lucide-react';
import LogoutConfirmModal from '@/components/modals/LogoutConfirmModal';

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (pathname === '/welcome' || pathname === '/auth' || pathname === '/onboarding') {
    return null;
  }

  const navItems = [
    { href: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { href: '/journal', label: t('nav_journal'), icon: BookOpen },
    { href: '/chart', label: t('nav_chart'), icon: BarChart2 },
    { href: '/community', label: t('nav_community'), icon: Users },
    { href: '/leaderboard', label: t('nav_leaderboard'), icon: Trophy },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 font-poppins">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5">
          
          {/* Kiri: Brand Section */}
          <Link href="/dashboard" className="flex items-center space-x-2 shrink-0">
            <AppLogo size={28} showText={true} />
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[10px] font-black text-emerald-500 uppercase tracking-widest hidden sm:inline-block">
              BETA
            </span>
          </Link>

          {/* Tengah: Compact macOS Dock Navigation Pill */}
          <nav className="hidden md:flex items-center space-x-1.5 p-1 bg-white/50 border border-slate-200/60 rounded-full shadow-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              if (isActive) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className="flex items-center space-x-2 bg-emerald-500 text-white shadow-sm px-4 py-1.5 rounded-full text-sm font-medium transition-all relative"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.href === '/chart' && (
                      <span className="absolute -top-1 -right-2 bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">NEW</span>
                    )}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center relative group"
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {item.href === '/chart' && (
                    <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">NEW</span>
                  )}
                  {/* Tooltip */}
                  <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-md pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Kanan: Profile Section */}
          <div className="flex items-center justify-end shrink-0 relative" ref={dropdownRef}>
            {mounted && isAuthenticated && user ? (
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username || 'User'}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover shadow-sm bg-white"
                />
                <div className="hidden lg:flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {user.username}
                  </span>
                  
                  {/* <> DEV Badge (Conditional for khuzaimafilla) */}
                  {user.username?.toLowerCase() === 'khuzaimafilla' && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-900 shadow-sm flex-shrink-0 cursor-default">
                      &lt;/&gt; DEV
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
              </div>
            ) : (
              <div className="w-8 h-8" />
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 z-50 w-56 bg-white/95 backdrop-blur-xl border border-slate-200/70 rounded-2xl shadow-xl overflow-hidden animate-fade-in p-2 font-poppins">
                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="font-semibold">{t('nav_profile')}</span>
                </Link>
                
                <Link
                  href="/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-semibold">{t('nav_settings')}</span>
                </Link>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setIsLogoutModalOpen(true);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-sm font-semibold text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
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
