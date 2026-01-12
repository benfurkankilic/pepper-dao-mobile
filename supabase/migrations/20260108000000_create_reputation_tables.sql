-- Pepper DAO Reputation System Tables
-- Migration: Create tables for user profiles, votes, activities, and streaks
-- Created: 2026-01-08

-- ============================================================================
-- PROFILES TABLE
-- Stores user profile data linked to Supabase auth.users via anonymous auth
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT UNIQUE,
  reputation_points INTEGER DEFAULT 0,
  rank TEXT DEFAULT 'OBSERVER' CHECK (rank IN ('OBSERVER', 'MEMBER', 'PARTICIPANT', 'STEWARD', 'INITIATOR', 'GOVERNOR')),
  current_streak_weeks INTEGER DEFAULT 0,
  longest_streak_weeks INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address);

-- ============================================================================
-- VOTES TABLE
-- Tracks user votes on proposals (linked to proposals table by proposal_id)
-- ============================================================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proposal_id INTEGER NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('YES', 'NO', 'ABSTAIN')),
  transaction_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, proposal_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_votes_profile ON votes(profile_id);
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);

-- ============================================================================
-- STREAKS TABLE
-- Tracks detailed streak history for users (must be created before activities)
-- ============================================================================
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  streak_type TEXT DEFAULT 'GOVERNANCE' CHECK (streak_type IN ('GOVERNANCE', 'VOTING', 'STAKING')),
  start_date DATE NOT NULL,
  end_date DATE,
  length_weeks INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  broken_reason TEXT CHECK (broken_reason IN ('MISSED_PERIOD', 'MANUAL_RESET', NULL)),
  activities_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_streaks_profile ON streaks(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_streaks_dates ON streaks(start_date, end_date);

-- ============================================================================
-- ACTIVITIES TABLE
-- Stores reputation history and activity feed for users
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'FIRST_VOTE', 'VOTE', 'PROPOSAL_SUBMITTED', 'PROPOSAL_ENGAGED',
    'PROPOSAL_PASSED', 'PROPOSAL_EXECUTED', 'STREAK_MILESTONE',
    'STREAK_BROKEN', 'RANK_UP', 'STAKING_BONUS', 'DELEGATION_RECEIVED'
  )),
  points INTEGER NOT NULL DEFAULT 0,
  total_after INTEGER NOT NULL,
  rank_before TEXT,
  rank_after TEXT,
  proposal_id INTEGER,
  streak_id UUID REFERENCES streaks(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching user's activity feed
CREATE INDEX IF NOT EXISTS idx_activities_profile ON activities(profile_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, but only update their own
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Votes: Users can read all, insert/update their own
CREATE POLICY "Votes are publicly readable"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Service role can manage votes"
  ON votes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Streaks: Users can read all, but only service role can write
CREATE POLICY "Streaks are publicly readable"
  ON streaks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage streaks"
  ON streaks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Activities: Users can read their own, service role can manage all
CREATE POLICY "Users can read their own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Service role can manage activities"
  ON activities FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Apply trigger to streaks
DROP TRIGGER IF EXISTS streaks_updated_at ON streaks;
CREATE TRIGGER streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create profile on first sign-in (can be called from app)
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();
