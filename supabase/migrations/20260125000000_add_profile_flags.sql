-- Add tracking flags for rank requirements
-- Migration: Add has_voted, has_engaged_proposal, has_passed_proposal columns to profiles
-- Created: 2026-01-25

-- Add new columns for tracking rank requirement flags
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_voted BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_engaged_proposal BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_passed_proposal BOOLEAN DEFAULT FALSE;

-- Add RLS policy to allow users to insert their own activities
-- (Previously only service_role could insert activities)
CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());
