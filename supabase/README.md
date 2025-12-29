# Supabase Backend

This directory contains the Supabase configuration, migrations, and Edge Functions for the Pepper DAO Mobile app.

## Project Info

- **Project ID**: `dwzuolcegznclqfyijic`
- **Project URL**: `https://dwzuolcegznclqfyijic.supabase.co`
- **Region**: (check Supabase Dashboard)

## Directory Structure

```
supabase/
├── config.toml              # Supabase local config
├── migrations/              # Database migrations
│   └── 20241229000000_create_governance_tables.sql
├── functions/               # Edge Functions
│   ├── sync-proposals/      # Indexes blockchain events
│   │   └── index.ts
│   └── send-notification/   # Sends push notifications
│       └── index.ts
└── README.md
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `proposals` | Indexed governance proposals from Aragon SPP |
| `device_tokens` | Expo push notification tokens |
| `sync_state` | Blockchain sync progress tracking |
| `notification_history` | Sent notification deduplication |

### Entity Relationship

```
proposals
├── proposal_id (int)
├── plugin_address (text)
├── status (ACTIVE/SUCCEEDED/DEFEATED/EXECUTED/CANCELED)
├── tally_yes/no/abstain (text - BigInt)
├── current_stage (int)
└── actions (jsonb)

device_tokens
├── expo_push_token (text, unique)
├── wallet_address (text, optional)
├── platform (ios/android/web)
└── is_active (boolean)

sync_state
├── id ('default')
├── last_synced_block (int)
└── sync_in_progress (boolean)

notification_history
├── proposal_id (int)
├── notification_type (new_proposal/vote_reminder/...)
└── recipients_count (int)
```

## Edge Functions

### sync-proposals

Indexes `ProposalCreated` events from the Aragon Staged Processor contract.

**Endpoint**: `POST /functions/v1/sync-proposals`

**Features**:
- Queries events in 1,000 block chunks (Ankr Public tier limit)
- Rate limited to 1 sync per 60 seconds
- Only indexes Stage 1+ proposals (passed Spicy Ministers)
- Updates vote tallies for active proposals
- Triggers push notifications for new proposals

**Deploy**:
```bash
supabase functions deploy sync-proposals --no-verify-jwt
```

### send-notification

Sends push notifications via Expo Push API.

**Endpoint**: `POST /functions/v1/send-notification`

**Body**:
```json
{
  "type": "new_proposal",
  "proposalId": 1,
  "title": "PEP Proposal #1"
}
```

**Notification Types**:
- `new_proposal` - New proposal created
- `vote_reminder` - Reminder to vote
- `proposal_ended` - Voting ended
- `proposal_executed` - Proposal executed

**Deploy**:
```bash
supabase functions deploy send-notification
```

## Setup

### Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Link to Project

```bash
supabase link --project-ref dwzuolcegznclqfyijic
```

### Run Migrations

```bash
# Apply migrations to remote
supabase db push

# Generate types
supabase gen types typescript --project-id dwzuolcegznclqfyijic > types/supabase.ts
```

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy sync-proposals --no-verify-jwt
supabase functions deploy send-notification

# View logs
supabase functions logs sync-proposals
supabase functions logs send-notification
```

## Environment Variables

The Edge Functions use these environment variables (auto-injected by Supabase):

- `SUPABASE_URL` - Project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

For the mobile app, add to `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://dwzuolcegznclqfyijic.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Cron Job (Optional)

To automatically sync proposals every 5 minutes, set up pg_cron:

```sql
-- Enable pg_cron extension (via Supabase Dashboard > Database > Extensions)

-- Create cron job
SELECT cron.schedule(
  'sync-proposals-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://dwzuolcegznclqfyijic.supabase.co/functions/v1/sync-proposals',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

## Ankr RPC Limits

Using Ankr Public tier (`https://rpc.ankr.com/chiliz`):

| Limit | Value |
|-------|-------|
| Max block range | 1,000 blocks |
| Rate limit | ~1,800 req/min |
| WebSocket | Not available |

Reference: https://www.ankr.com/docs/rpc-service/service-plans/

## Troubleshooting

### Sync stuck (sync_in_progress = true)

```sql
UPDATE sync_state SET sync_in_progress = false WHERE id = 'default';
```

### Reset sync to specific block

```sql
UPDATE sync_state SET last_synced_block = 10000000 WHERE id = 'default';
```

### Check sync status

```sql
SELECT * FROM sync_state;
SELECT COUNT(*) as total, status FROM proposals GROUP BY status;
```

