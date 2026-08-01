'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, TradingStyle, AccountCurrency } from '@/types';
import { getStoredUserProfile, setStoredUserProfile } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (emailOrUser: string, pass: string) => Promise<boolean>;
  register: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    tradingStyle: TradingStyle;
    isAgreedTamak: boolean;
    isAgreedFillaRichest: boolean;
  }) => Promise<boolean>;
  verifyOtp: (email: string, token: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (profilePartial: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = ['/dashboard', '/journal', '/community', '/leaderboard', '/settings'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('krtrade_is_authenticated');
      if (isAuth === 'true') {
        return getStoredUserProfile();
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('krtrade_is_authenticated') === 'true';
    }
    return false;
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const mappedUser: UserProfile = {
              id: profile.id,
              fullName: profile.full_name,
              email: session.user.email || '',
              username: profile.username,
              tradingStyle: profile.trading_style as TradingStyle,
              isAgreedTamak: profile.accepts_tamak_promise,
              isAgreedFillaRichest: profile.acknowledges_filla_richest,
              avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
              bio: profile.bio || 'Trader aktif KRtrade Platform.',
              initialBalance: profile.initial_balance ? Number(profile.initial_balance) : 10000,
              accountCurrency: (profile.account_currency as AccountCurrency) || 'USD',
            };
            setUser(mappedUser);
            setIsAuthenticated(true);
            setStoredUserProfile(mappedUser);
            localStorage.setItem('krtrade_is_authenticated', 'true');
          }
        }
      } else {
        const savedUser = getStoredUserProfile();
        const isAuth = localStorage.getItem('krtrade_is_authenticated');
        if (isAuth === 'true' && savedUser) {
          setUser(savedUser);
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setIsAuthenticated(true);
          localStorage.setItem('krtrade_is_authenticated', 'true');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('krtrade_is_authenticated');
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  // Protected Route Guard
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && PROTECTED_ROUTES.includes(pathname)) {
        router.push('/auth');
      }
    }
  }, [isAuthenticated, pathname, loading, router]);

  const login = async (emailOrUser: string, pass: string): Promise<boolean> => {
    let resolvedEmail = emailOrUser;

    if (isSupabaseConfigured) {
      // Username to Email resolution
      if (!emailOrUser.includes('@')) {
        const { data: foundProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', emailOrUser)
          .single();

        if (foundProfile) {
          // Find auth email by profile id or lookup
          resolvedEmail = `${emailOrUser}@krtrade.com`;
        }
      }

      const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: pass,
      });

      if (!authError && authResult.session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authResult.session.user.id)
          .single();

        if (profile) {
          const loggedUser: UserProfile = {
            id: profile.id,
            fullName: profile.full_name,
            email: authResult.session.user.email || resolvedEmail,
            username: profile.username,
            tradingStyle: profile.trading_style as TradingStyle,
            isAgreedTamak: profile.accepts_tamak_promise,
            isAgreedFillaRichest: profile.acknowledges_filla_richest,
            avatarUrl: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          setStoredUserProfile(loggedUser);
          localStorage.setItem('krtrade_is_authenticated', 'true');
          return true;
        }
      }
    }

    // Direct / Local Fallback Authentication
    const existing = getStoredUserProfile();
    const loggedUser: UserProfile = (existing && existing.username === emailOrUser) ? existing : {
      id: 'usr_' + Date.now(),
      fullName: emailOrUser || 'Filla Calon Wong Sugih 9 Naga',
      email: emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@krtrade.com`,
      username: emailOrUser || 'Filla_Ferari9Naga',
      tradingStyle: 'Scalping',
      isAgreedTamak: true,
      isAgreedFillaRichest: true,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUser}`,
    };

    setUser(loggedUser);
    setIsAuthenticated(true);
    setStoredUserProfile(loggedUser);
    localStorage.setItem('krtrade_is_authenticated', 'true');
    return true;
  };

  const register = async (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    tradingStyle: TradingStyle;
    isAgreedTamak: boolean;
    isAgreedFillaRichest: boolean;
  }): Promise<boolean> => {
    let authUserId = 'usr_' + Date.now();

    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (!authError && authData.user) {
        authUserId = authData.user.id;
        await supabase.from('profiles').upsert({
          id: authUserId,
          username: data.username,
          full_name: data.fullName,
          trading_style: data.tradingStyle,
          accepts_tamak_promise: data.isAgreedTamak,
          acknowledges_filla_richest: data.isAgreedFillaRichest,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
        });
      }
    }

    const newUser: UserProfile = {
      id: authUserId,
      fullName: data.fullName,
      email: data.email,
      username: data.username,
      tradingStyle: data.tradingStyle,
      isAgreedTamak: data.isAgreedTamak,
      isAgreedFillaRichest: data.isAgreedFillaRichest,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    setStoredUserProfile(newUser);
    localStorage.setItem('krtrade_is_authenticated', 'true');
    return true;
  };

  const verifyOtp = async (email: string, token: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) {
        console.error('OTP Verification Error:', error.message);
        return false;
      }
    }
    return true;
  };

  const loginWithGoogle = async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
    } else {
      await login('Filla_GoogleTrader', 'google_oauth_pass');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('krtrade_is_authenticated');
    localStorage.removeItem('krtrade_user_profile');
    router.push('/welcome');
  };

  const updateUser = async (profilePartial: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...profilePartial };
    setUser(updated);
    setStoredUserProfile(updated);

    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({
        full_name: updated.fullName,
        username: updated.username,
        avatar_url: updated.avatarUrl,
        bio: updated.bio,
        initial_balance: updated.initialBalance,
        account_currency: updated.accountCurrency,
      }).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        verifyOtp,
        loginWithGoogle,
        logout,
        updateUser,
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
