## Pepperverse (Gamified Layer) — Feature Specification

### Objective
Motivate participation with an interactive, playful world featuring unlockable regions and badge collectibles.

### Core Concepts
- Regions: themed areas tied to DAO milestones
  - Treasury Mountain — unlock at treasury balance milestones
  - Voting Valley — unlock by executed proposals count
  - Integration Island — unlock when partner integrations reach thresholds
- Badges: ERC-721/1155 cosmetic NFTs for voters, early adopters, events

### Unlock Logic (Deterministic)
```ts
interface Milestones {
  treasuryChzThresholds: number[]; // e.g., [100_000, 250_000, 500_000]
  executedProposalsThresholds: number[]; // e.g., [5, 15, 30]
  integrationsThresholds: number[]; // optional, manual count
}

type RegionKey = 'treasury_mountain' | 'voting_valley' | 'integration_island';

interface RegionUnlockState {
  key: RegionKey;
  unlocked: boolean;
  progress: number; // 0..1 toward next milestone
  currentMilestoneIndex: number;
}
```

### Data
- Treasury CHZ total (from snapshot module)
- Executed proposals count (Aragon SDK)
- Integrations (manual config for MVP)
- Badge ownership (ERC-721/1155 `balanceOf`, `ownerOf`, optional `tokenURI`)

### UI
- World map illustration with regions; locked regions are grayed with padlock.
- Progress bars under each locked region: “82% to next unlock”.
- Badge gallery: grid of owned badges with titles and descriptions; placeholders for unowned.

### Acceptance Criteria
- Unlock states computed purely from on-chain/readable metrics; reproducible across sessions.
- Badge gallery shows owned and unowned distinctly; loads metadata lazily.

### Error Handling
- If metadata fetch fails, show generic badge tile and retry silently.
- If DAO metrics unavailable, show last known progress with a stale indicator.

### Telemetry
- `pepperverse_viewed`
- `region_unlocked_viewed` {region}
- `badge_tile_opened` {tokenId}

### Performance
- Lazy-load badge metadata and images (progressive thumbnails).
- Cache unlock state; recompute only on source changes.

### Tests
- Unlock logic unit tests for boundary thresholds.
- Badge rendering with mixed 721/1155 ownership.
- Metadata failure fallback.

### Dependencies
- Treasury snapshot, Aragon proposals API
- Badge contract addresses (optional for MVP)

### Out of Scope (MVP)
- In-app minting of badges
- Real-time multiplayer map interactions

### Future Enhancements
- Seasonal maps and dynamic weather effects
- Badge crafting/combining mechanics


