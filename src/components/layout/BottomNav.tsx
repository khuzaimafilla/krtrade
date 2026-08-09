'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Trophy,
  User,
  Settings,
  BarChart2,
} from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname === '/welcome' || pathname === '/auth' || pathname === '/onboarding') {
    return null;
  }

  const items = [
    { href: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
    { href: '/journal', label: t('nav_journal'), icon: BookOpen },
    { href: '/chart', label: t('nav_chart'), icon: BarChart2 },
    { href: '/community', label: t('nav_community'), icon: Users },
    { href: '/leaderboard', label: t('nav_leaderboard'), icon: Trophy },
    { href: '/profile', label: t('nav_profile'), icon: User },
    { href: '/settings', label: t('nav_settings'), icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E4E9E6] px-1 py-1.5 font-poppins">
      <nav className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
                isActive ? 'text-[#05C46B]' : 'text-[#6B7C72]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-transform ${
                  isActive ? 'bg-[#E6F7F0] scale-110' : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
