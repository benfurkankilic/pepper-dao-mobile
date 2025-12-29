-- Pepper DAO Governance Tables
-- Migration: Create tables for proposal indexing and push notifications
-- Created: 2024-12-29

-- ============================================================================
-- PROPOSALS TABLE
-- Stores indexed governance proposals from the Aragon Staged Processor
-- ============================================================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id INTEGER NOT NULL,
  plugin_address TEXT NOT NULL,
  plugin_type TEXT NOT NULL CHECK (plugin_type IN ('SPP', 'TOKEN_VOTING', 'MULTISIG')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'SUCCEEDED', 'DEFEATED', 'EXECUTED', 'CANCELED')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  
  -- Voting tallies (stored as text to handle large numbers)
  tally_yes TEXT DEFAULT '0',
  tally_no TEXT DEFAULT '0',
  tally_abstain TEXT DEFAULT '0',
  total_voting_power TEXT DEFAULT '0',
  
  -- Voting settings
  support_threshold INTEGER DEFAULT 0,
  min_participation INTEGER DEFAULT 0,
  min_duration INTEGER DEFAULT 0,
  approvals INTEGER DEFAULT 0,
  min_approvals INTEGER DEFAULT 0,
  
  -- Stage info
  current_stage INTEGER DEFAULT 0,
  is_canceled BOOLEAN DEFAULT false,
  is_open BOOLEAN DEFAULT true,
  
  -- Actions (JSON array)
  actions JSONB DEFAULT '[]'::jsonb,
  
  -- Blockchain metadata
  block_number INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint on proposal_id + plugin_address
  UNIQUE (proposal_id, plugin_address)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_plugin ON proposals(plugin_address);
CREATE INDEX IF NOT EXISTS idx_proposals_start_date ON proposals(start_date DESC);

-- ============================================================================
-- DEVICE_TOKENS TABLE
-- Stores Expo push notification tokens for registered devices
-- ============================================================================
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expo_push_token TEXT NOT NULL UNIQUE,
  wallet_address TEXT,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_device_tokens_wallet ON device_tokens(wallet_address);

-- ============================================================================
-- SYNC_STATE TABLE
-- Tracks blockchain sync progress for incremental indexing
-- ============================================================================
CREATE TABLE IF NOT EXISTS sync_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  last_synced_block INTEGER NOT NULL DEFAULT 10000000,
  last_sync_at TIMESTAMPTZ,
  sync_in_progress BOOLEAN DEFAULT false,
  error_message TEXT
);

-- Insert default sync state if not exists
INSERT INTO sync_state (id, last_synced_block)
VALUES ('default', 10000000)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NOTIFICATION_HISTORY TABLE
-- Tracks sent notifications to prevent duplicates
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_proposal', 'vote_reminder', 'proposal_ended', 'proposal_executed')),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  recipients_count INTEGER DEFAULT 0,
  
  -- Unique constraint to prevent duplicate notifications
  UNIQUE (proposal_id, notification_type)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_history_proposal ON notification_history(proposal_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Proposals: Anyone can read, only service role can write
CREATE POLICY "Proposals are publicly readable"
  ON proposals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage proposals"
  ON proposals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Device tokens: Users can manage their own tokens
CREATE POLICY "Users can read their own tokens"
  ON device_tokens FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert their tokens"
  ON device_tokens FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their tokens"
  ON device_tokens FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can manage device tokens"
  ON device_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Sync state: Only service role
CREATE POLICY "Service role can manage sync state"
  ON sync_state FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Notification history: Only service role
CREATE POLICY "Service role can manage notification history"
  ON notification_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to proposals
DROP TRIGGER IF EXISTS proposals_updated_at ON proposals;
CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Apply trigger to device_tokens
DROP TRIGGER IF EXISTS device_tokens_updated_at ON device_tokens;
CREATE TRIGGER device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

