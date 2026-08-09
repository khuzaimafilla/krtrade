'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, TradingStyle, AccountCurrency } from '@/types';
import { setStoredUserProfile } from '@/lib/storage';

// Keep the same AuthContextType interface so all consuming components work unchanged
export interface AuthResult {
  success: boolean;
  message: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Legacy methods — redirected to Discord OAuth
  login: (emailOrUser: string, pass: string) => Promise<AuthResult>;
  loginWithDiscord: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (profilePartial: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  // No-op stubs kept for backward compatibility
  register: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    tradingStyle: TradingStyle;
    isAgreedTamak: boolean;
    isAgreedFillaRichest: boolean;
  }) => Promise<AuthResult>;
  verifyOtp: (email: string, token: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = ['/dashboard', '/journal', '/community', '/leaderboard', '/settings', '/profile', '/chart'];

/**
 * Map a NextAuth session user → KRTrade UserProfile interface
 * This ensures all existing components work without modification.
 */
function sessionToProfile(sessionUser: NonNullable<ReturnType<typeof useSession>['data']>['user']): UserProfile {
  return {
    id: sessionUser.id ?? '',
    fullName: sessionUser.name ?? 'KRTrade Trader',
    email: sessionUser.email ?? '',
    username: sessionUser.username ?? (sessionUser.email?.split('@')[0] ?? 'trader'),
    tradingStyle: (sessionUser.tradingStyle as TradingStyle) ?? 'Scalping',
    isAgreedTamak: true,
    isAgreedFillaRichest: true,
    avatarUrl: sessionUser.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionUser.name}`,
    bio: sessionUser.bio ?? 'Trader aktif KRTrade Platform.',
    initialBalance: sessionUser.initialBalance ?? 10000,
    accountCurrency: (sessionUser.accountCurrency as AccountCurrency) ?? 'USD',
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && Boolean(session?.user?.id);
  const user = isAuthenticated && session?.user ? sessionToProfile(session.user) : null;

  // Sync user profile to localStorage for offline access & backward compat
  useEffect(() => {
    if (user) {
      setStoredUserProfile(user);
      localStorage.setItem('krtrade_is_authenticated', 'true');
    } else if (!isLoading) {
      localStorage.removeItem('krtrade_is_authenticated');
    }
  }, [user, isLoading]);

  // Route Guard
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        router.push('/auth');
      }
      // Redirect to onboarding if not yet onboarded
      if (isAuthenticated && session?.user?.isOnboarded === false && pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, session?.user?.isOnboarded]);

  // ── Auth Actions ─────────────────────────────────────────────────────────

  const loginWithDiscord = async () => {
    await signIn('discord', { callbackUrl: '/dashboard' });
  };

  const logout = async () => {
    localStorage.removeItem('krtrade_is_authenticated');
    localStorage.removeItem('krtrade_user_profile');
    await signOut({ callbackUrl: '/auth' });
  };

  const updateUser = async (profilePartial: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profilePartial.username,
          tradingStyle: profilePartial.tradingStyle,
          initialBalance: profilePartial.initialBalance,
          accountCurrency: profilePartial.accountCurrency,
          bio: profilePartial.bio,
          name: profilePartial.fullName,
        }),
      });
      if (res.ok) {
        // Force NextAuth session refresh so components re-render with updated data
        await updateSession();
      }
    } catch (err) {
      console.error('updateUser failed:', err);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
      });
      if (response.ok) {
        localStorage.removeItem('krtrade_user_profile');
        localStorage.removeItem('krtrade_is_authenticated');
        // Let signOut handle the redirect and cookie cleanup
        await signOut({ callbackUrl: '/welcome' });
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (err) {
      console.error('deleteAccount err:', err);
      throw err;
    }
  };

  // ── Legacy stubs (kept for backward compat) ──────────────────────────────

  const login = async (_emailOrUser: string, _pass: string): Promise<AuthResult> => {
    // Redirect to Discord OAuth
    await loginWithDiscord();
    return { success: true, message: 'Mengalihkan ke Discord...' };
  };

  const register = async (_data: {
    fullName: string; email: string; username: string; password: string;
    tradingStyle: TradingStyle; isAgreedTamak: boolean; isAgreedFillaRichest: boolean;
  }): Promise<AuthResult> => {
    await loginWithDiscord();
    return { success: true, message: 'Mengalihkan ke Discord...' };
  };

  const verifyOtp = async (_email: string, _token: string): Promise<boolean> => true;

  const loginWithGoogle = async () => {
    await loginWithDiscord();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithDiscord,
        logout,
        updateUser,
        deleteAccount,
        register,
        verifyOtp,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
