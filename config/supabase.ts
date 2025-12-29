import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

/**
 * Supabase Configuration for Pepper DAO
 *
 * This client is used to:
 * - Fetch cached governance proposals (fast reads)
 * - Register device push notification tokens
 * - Query sync state
 *
 * Environment Variables:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing environment variables: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // We don't need auth for this app
    autoRefreshToken: false,
  },
});

/**
 * Edge function URLs for triggering syncs
 */
export const EDGE_FUNCTION_URLS = {
  syncProposals: `${SUPABASE_URL}/functions/v1/sync-proposals`,
  sendNotification: `${SUPABASE_URL}/functions/v1/send-notification`,
} as const;

/**
 * Trigger a manual sync of proposals from the blockchain
 * Rate limited to prevent abuse
 */
export async function triggerProposalSync(): Promise<{
  success: boolean;
  message: string;
  newProposals?: number;
}> {
  try {
    const response = await fetch(EDGE_FUNCTION_URLS.syncProposals, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Supabase] Sync failed:', error);
      return { success: false, message: error };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Sync completed',
      newProposals: data.newProposals,
    };
  } catch (error) {
    console.error('[Supabase] Failed to trigger sync:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

