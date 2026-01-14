-- Add creator column to store the wallet address that created the proposal
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS creator TEXT;

-- Update historical proposals with correct creator address
-- All 4 proposals were created by the same admin: 0xcA93d2EA8B53D7bc7b10CdE39D6B806fE96BF310
UPDATE proposals
SET creator = '0xcA93d2EA8B53D7bc7b10CdE39D6B806fE96BF310'
WHERE plugin_type = 'ADMIN' OR plugin_type = 'SPP';
