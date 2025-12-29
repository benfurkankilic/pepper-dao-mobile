/**
 * Supabase Database Types
 *
 * Generated types for the Pepper DAO Supabase tables.
 * These should match the database schema created in migrations.
 */

export interface Database {
  public: {
    Tables: {
      proposals: {
        Row: {
          id: string;
          proposal_id: number;
          plugin_address: string;
          plugin_type: 'MULTISIG' | 'SPP';
          title: string;
          description: string | null;
          status: 'PENDING' | 'ACTIVE' | 'SUCCEEDED' | 'DEFEATED' | 'EXECUTED' | 'CANCELED';
          start_date: string;
          end_date: string;
          executed_at: string | null;
          created_at: string;
          updated_at: string;
          tally_yes: string | null;
          tally_no: string | null;
          tally_abstain: string | null;
          total_voting_power: string | null;
          support_threshold: number | null;
          min_participation: number | null;
          min_duration: number | null;
          approvals: number | null;
          min_approvals: number | null;
          current_stage: number | null;
          is_canceled: boolean | null;
          is_open: boolean | null;
          actions: Array<{
            to: string;
            value: string;
            data: string;
          }>;
          block_number: number | null;
          transaction_hash: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['proposals']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['proposals']['Insert']>;
      };
      device_tokens: {
        Row: {
          id: string;
          expo_push_token: string;
          wallet_address: string | null;
          platform: 'ios' | 'android' | 'web' | null;
          device_name: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
          last_used_at: string | null;
        };
        Insert: Omit<
          Database['public']['Tables']['device_tokens']['Row'],
          'id' | 'created_at' | 'updated_at'
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['device_tokens']['Insert']>;
      };
      sync_state: {
        Row: {
          id: string;
          last_synced_block: number;
          last_sync_at: string | null;
          sync_in_progress: boolean | null;
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['sync_state']['Row'],
          'created_at' | 'updated_at'
        > & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sync_state']['Insert']>;
      };
      notification_history: {
        Row: {
          id: string;
          proposal_id: number;
          notification_type: 'new_proposal' | 'vote_reminder' | 'proposal_ended' | 'proposal_executed';
          sent_at: string;
          recipients_count: number | null;
        };
        Insert: Omit<
          Database['public']['Tables']['notification_history']['Row'],
          'id' | 'sent_at'
        > & {
          id?: string;
          sent_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notification_history']['Insert']>;
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for easier usage
export type Proposal = Database['public']['Tables']['proposals']['Row'];
export type ProposalInsert = Database['public']['Tables']['proposals']['Insert'];
export type DeviceToken = Database['public']['Tables']['device_tokens']['Row'];
export type DeviceTokenInsert = Database['public']['Tables']['device_tokens']['Insert'];
export type SyncState = Database['public']['Tables']['sync_state']['Row'];
export type NotificationHistory = Database['public']['Tables']['notification_history']['Row'];

