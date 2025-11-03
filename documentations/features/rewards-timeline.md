## Rewards Timeline — Feature Specification

### Objective
Visualize accrued staking rewards over time with minimal dependencies (no external indexer for MVP).

### Data Approaches
- MVP (Sampling): periodically read `earned(address)` and derive deltas to form time buckets (daily/weekly).
- Enhanced (Events): parse `RewardPaid`, `Stake`, `Unstake` logs to reconstruct precise accruals.

### Sampling Method (MVP)
- Poll `earned(address)` every 60–120s while the screen is active.
- Maintain local time series in storage with `(timestamp, earnedTotal)`.
- For chart buckets, compute differences between min/max within each bucket.
- Reset on successful `claim()` by subtracting claimed amount from baseline.

### UI
- Area/line chart with period toggle: 7D / 30D / 90D.
- Summary KPIs: Total earned (period), current APR (if provided), last claim time.

### Acceptance Criteria
- Chart reflects monotonic growth with sampling; step down on claim.
- Empty state when no staking position; guidance to stake.

### Error Handling
- Missing reads → leave bucket as gap; show subtle note.
- Clock skew between reads → tolerate; use client timestamps consistently.

### Telemetry
- `rewards_timeline_viewed` {period}
- `rewards_timeline_error` {code}

### Performance
- Decimate samples to ≤ 200 points before rendering.
- Memoize chart; avoid re-renders on wallet state changes.

### Tests
- Sampling→bucket aggregation unit tests.
- Claim handling (baseline shift) test.
- Empty state when not staked.

### Dependencies
- Staking contract view methods
- Local storage for sampled series

### Out of Scope (MVP)
- Backfilling long history from genesis without an indexer

### Future Enhancements
- Event-based reconstruction for precision
- Export CSV of rewards history


