-- Add WALLET_CONNECTED event type to activities table
-- Migration: Add WALLET_CONNECTED to event_type CHECK constraint
-- Created: 2026-01-25

-- Drop and recreate the CHECK constraint to include WALLET_CONNECTED
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_event_type_check;

ALTER TABLE activities ADD CONSTRAINT activities_event_type_check
CHECK (event_type IN (
  'WALLET_CONNECTED',
  'FIRST_VOTE',
  'VOTE',
  'PROPOSAL_SUBMITTED',
  'PROPOSAL_ENGAGED',
  'PROPOSAL_PASSED',
  'PROPOSAL_EXECUTED',
  'STREAK_MILESTONE',
  'STREAK_BROKEN',
  'RANK_UP',
  'STAKING_BONUS',
  'DELEGATION_RECEIVED'
));
