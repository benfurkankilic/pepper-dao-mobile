## DAO Feed — Feature Specification

### Objective
Provide a timely, readable stream of DAO events (governance, treasury, staking) and community highlights.

### Data Sources (MVP)
- Governance: new proposal created, executed (Aragon SDK or contract events)
- Treasury: large CHZ transfers in/out of treasury vaults (ETH logs; filter by addresses)
- Staking: notable stake/unstake/claim events (contract logs)
- Spotlight: recent voters and proposal authors (where available)

### Event Model
```ts
type FeedEventType = 'proposal_created' | 'proposal_executed' | 'treasury_transfer' | 'stake' | 'unstake' | 'claim';

interface FeedEvent {
  id: string; // blockNumber-txIndex-logIndex or SDK id
  type: FeedEventType;
  title: string;
  subtitle?: string;
  timestamp: number; // epoch ms
  txHash?: `0x${string}`;
  address?: `0x${string}`; // relevant contract or user
  metadata?: Record<string, unknown>;
}
```

### UI
- Vertical list of event cards sorted by time (desc).
- Each card: icon by type, title, timestamp (relative), optional subtitle, link to detail or explorer.

### Acceptance Criteria
- Loads within ~1.2s on median device for last N events (configurable, default 25).
- Tapping an event navigates to the relevant detail screen or explorer.
- Works read-only; updates periodically (30–60s) and on focus.

### Error Handling
- If any source fails: show partial feed and a banner “Some events may be missing.”
- Retry silently with backoff.

### Telemetry
- `feed_viewed`
- `feed_event_clicked` {type}
- `feed_error` {source}

### Performance
- Merge events in-memory; avoid duplicate entries by id.
- Virtualized list for smooth scrolling.

### Tests
- Merge logic correctness with overlapping sources.
- Event rendering for each type.
- Partial failure banner.

### Dependencies
- Contracts & DAO addresses; Aragon SDK

### Out of Scope (MVP)
- Full-text search or advanced filters

### Future Enhancements
- Follow/favorite entities (proposals, addresses)
- Pin important announcements


