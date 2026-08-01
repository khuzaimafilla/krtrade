'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, TradingStyle, AccountCurrency } from '@/types';
import { getStoredUserProfile, setStoredUserProfile } from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface AuthResult {
  success: boolean;
  message: string;
}

function getRegisteredUsers(): Array<{ email: string; username: string; password: string; profile: UserProfile }> {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('krtrade_registered_users');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUser(entry: { email: string; username: string; password: string; profile: UserProfile }) {
  if (typeof window === 'undefined') return;
  const users = getRegisteredUsers();
  users.push(entry);
  localStorage.setItem('krtrade_registered_users', JSON.stringify(users));
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (emailOrUser: string, pass: string) => Promise<AuthResult>;
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

  const login = async (emailOrUser: string, pass: string): Promise<AuthResult> => {
    if (!emailOrUser.trim() || !pass.trim()) {
      return { success: false, message: 'Username/Email dan Password wajib diisi!' };
    }

    let resolvedEmail = emailOrUser.trim();

    if (isSupabaseConfigured) {
      if (!emailOrUser.includes('@')) {
        const { data: foundProfile } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', emailOrUser)
          .single();

        if (foundProfile) {
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
            bio: profile.bio || 'Trader aktif KRtrade Platform.',
            initialBalance: profile.initial_balance ? Number(profile.initial_balance) : 10000,
            accountCurrency: (profile.account_currency as AccountCurrency) || 'USD',
          };
          setUser(loggedUser);
          setIsAuthenticated(true);
          setStoredUserProfile(loggedUser);
          localStorage.setItem('krtrade_is_authenticated', 'true');
          return { success: true, message: 'Login Berhasil! Mengalihkan ke Dashboard...' };
        }
      } else if (authError) {
        return { success: false, message: authError.message || 'Username/Email atau Password salah!' };
      }
    }

    // Direct / Local Registered Authentication Check
    const registeredList = getRegisteredUsers();
    const foundAcc = registeredList.find(
      (u) =>
        u.username.toLowerCase() === emailOrUser.toLowerCase() ||
        u.email.toLowerCase() === emailOrUser.toLowerCase()
    );

    if (foundAcc) {
      if (foundAcc.password !== pass) {
        return { success: false, message: 'Password yang Anda masukkan salah! Silakan periksa kembali.' };
      }

      setUser(foundAcc.profile);
      setIsAuthenticated(true);
      setStoredUserProfile(foundAcc.profile);
      localStorage.setItem('krtrade_is_authenticated', 'true');
      return { success: true, message: 'Login Berhasil! Selamat datang kembali.' };
    }

    // Default Seed Developer Check
    if (emailOrUser.toLowerCase() === 'khuzaimafilla' || emailOrUser.toLowerCase() === 'khuzaima') {
      if (pass !== '123456' && pass !== 'khuzaima123') {
        return { success: false, message: 'Password untuk akun khuzaimafilla salah!' };
      }
      const seedUser: UserProfile = {
        id: 'usr_khuzaima',
        fullName: 'Khuzaima Filla (Developer)',
        email: 'khuzaimafilla@krtrade.com',
        username: 'khuzaimafilla',
        tradingStyle: 'Scalping',
        isAgreedTamak: true,
        isAgreedFillaRichest: true,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khuzaimafilla',
        bio: 'Developer & Creator KRtrade Platform.',
        initialBalance: 10000,
        accountCurrency: 'USD',
      };
      setUser(seedUser);
      setIsAuthenticated(true);
      setStoredUserProfile(seedUser);
      localStorage.setItem('krtrade_is_authenticated', 'true');
      return { success: true, message: 'Login Berhasil sebagai Developer!' };
    }

    return {
      success: false,
      message: 'Username atau Email tidak terdaftar! Silakan pilih tab "Daftar Akun Baru".',
    };
  };

  const register = async (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    tradingStyle: TradingStyle;
    isAgreedTamak: boolean;
    isAgreedFillaRichest: boolean;
  }): Promise<AuthResult> => {
    let authUserId = 'usr_' + Date.now();

    if (isSupabaseConfigured) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        return { success: false, message: authError.message || 'Gagal mendaftar di database!' };
      }

      if (authData.user) {
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
      bio: 'Trader konsisten KRtrade Platform.',
      initialBalance: 10000,
      accountCurrency: 'USD',
    };

    saveRegisteredUser({
      email: data.email,
      username: data.username,
      password: data.password,
      profile: newUser,
    });

    setUser(newUser);
    setIsAuthenticated(true);
    setStoredUserProfile(newUser);
    localStorage.setItem('krtrade_is_authenticated', 'true');

    return { success: true, message: 'Registrasi Berhasil! Mengalihkan ke Dashboard...' };
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
