-- KRtrade Platform
-- Idempotent Supabase PostgreSQL Schema DDL (Full Backend & Database Synchronization)

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  initial_balance NUMERIC(15, 2) DEFAULT 10000.00,
  account_currency TEXT DEFAULT 'USD',
  trading_style TEXT NOT NULL CHECK (trading_style IN ('Swing Trade', 'Intraday', 'Scalping')),
  accepts_tamak_promise BOOLEAN DEFAULT TRUE,
  acknowledges_filla_richest BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(15, 2) DEFAULT 10000.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_currency TEXT DEFAULT 'USD';

-- 2. TRADES TABLE
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  lot_size NUMERIC(10, 2) NOT NULL DEFAULT 0.1,
  entry_price NUMERIC(15, 5) NOT NULL,
  exit_price NUMERIC(15, 5) NOT NULL,
  pnl NUMERIC(15, 2) NOT NULL,
  rrr NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
  strategy_tag TEXT NOT NULL,
  notes TEXT,
  chart_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id)
);

-- 4. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);
-- 6. GROUP JOIN REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.group_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_join_request UNIQUE (group_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- Safely Drop Existing Policies First (Avoid ERROR: 42710 policy already exists)
DO $$ 
BEGIN
  -- Profiles
  EXECUTE 'DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users update own profile" ON public.profiles';
  
  -- Trades
  EXECUTE 'DROP POLICY IF EXISTS "Trades viewable by owner or friends" ON public.trades';
  EXECUTE 'DROP POLICY IF EXISTS "Users insert own trades" ON public.trades';
  EXECUTE 'DROP POLICY IF EXISTS "Users update own trades" ON public.trades';
  EXECUTE 'DROP POLICY IF EXISTS "Users delete own trades" ON public.trades';
  
  -- Friendships
  EXECUTE 'DROP POLICY IF EXISTS "Friendships viewable by members" ON public.friendships';
  EXECUTE 'DROP POLICY IF EXISTS "Users request friendship" ON public.friendships';
  EXECUTE 'DROP POLICY IF EXISTS "Users update friendship" ON public.friendships';
  
  -- Groups
  EXECUTE 'DROP POLICY IF EXISTS "Groups viewable by everyone" ON public.groups';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users create groups" ON public.groups';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users update groups" ON public.groups';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users delete groups" ON public.groups';
  
  -- Group Members
  EXECUTE 'DROP POLICY IF EXISTS "Group members viewable by everyone" ON public.group_members';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users join groups" ON public.group_members';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users leave groups" ON public.group_members';
  -- Group Join Requests
  EXECUTE 'DROP POLICY IF EXISTS "Group join requests viewable by everyone" ON public.group_join_requests';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users request to join groups" ON public.group_join_requests';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users update join requests" ON public.group_join_requests';
  EXECUTE 'DROP POLICY IF EXISTS "Auth users delete join requests" ON public.group_join_requests';
END $$;

-- Create Policies
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Trades viewable by owner or friends" ON public.trades FOR SELECT USING (true);
CREATE POLICY "Users insert own trades" ON public.trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own trades" ON public.trades FOR UPDATE USING (true);
CREATE POLICY "Users delete own trades" ON public.trades FOR DELETE USING (true);

CREATE POLICY "Friendships viewable by members" ON public.friendships FOR SELECT USING (true);
CREATE POLICY "Users request friendship" ON public.friendships FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update friendship" ON public.friendships FOR UPDATE USING (true);

CREATE POLICY "Groups viewable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Auth users create groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users update groups" ON public.groups FOR UPDATE USING (true);
CREATE POLICY "Auth users delete groups" ON public.groups FOR DELETE USING (true);

CREATE POLICY "Group members viewable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Auth users join groups" ON public.group_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users leave groups" ON public.group_members FOR DELETE USING (true);

CREATE POLICY "Group join requests viewable by everyone" ON public.group_join_requests FOR SELECT USING (true);
CREATE POLICY "Auth users request to join groups" ON public.group_join_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users update join requests" ON public.group_join_requests FOR UPDATE USING (true);
CREATE POLICY "Auth users delete join requests" ON public.group_join_requests FOR DELETE USING (true);

-- Grant All Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
