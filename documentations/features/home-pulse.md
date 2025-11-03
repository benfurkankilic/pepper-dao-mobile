## Home — The Pulse — Feature Specification

### Objective
Make treasury growth feel alive with a live CHZ inflow visualization and a concise treasury snapshot.

### Data & Calculations
- Inputs: DAO treasury/vault addresses (CHZ holdings) provided by DAO.
- Sampling: poll balances every 15–30s.
- 24h delta: compute `delta24h = latestBalance - balance24hAgo` using sampled history.
- Flow speed mapping: let `r = inflowPerMinute` (CHZ/min). Map to animation speed:
  - `speed = clamp(minSpeed, maxSpeed, base + k * ln(1 + r))`
  - Defaults: `base=0.6`, `k=0.35`, `minSpeed=0.4`, `maxSpeed=2.2`
- Smoothing: EMA with α=0.3 for visual stability.

### UI
- Liquid flow animation (Lottie/Reanimated+SVG) reflecting current smoothed inflow rate.
- Snapshot cards: Total CHZ, segmented vaults (staking, grants, liquidity, marketing).
- Tap segment → opens Treasury details screen.

### Caching & Offline
- Cache last snapshot in storage; show with “Last updated Xm ago” when offline.
- react-query cacheTime ≥ 5m; background refresh on focus.

### Acceptance Criteria
- Animation speed changes smoothly with inflow; no jarring jumps.
- Snapshot totals sum to segments; cards update max every 30s.
- Works without wallet connection.

### Error Handling
- If RPC fetch fails: show stale data banner; retry with backoff.
- If some vaults fail: show partial with labels and ‘–’ for unknown.

### Telemetry
- `pulse_viewed`
- `snapshot_refreshed` {vaults, durationMs}
- `snapshot_error` {code}

### Performance
- Minimize draws: throttle animation parameter updates to ≤10 Hz.
- Memoize charts; avoid re-renders on unrelated state.

### Tests
- Inflow-to-speed mapping unit test for representative rates.
- Snapshot reconciliation test (segments sum to total).
- Offline restore shows cached snapshot and stale indicator.

### Dependencies
- Treasury/vault addresses & labels
- Chiliz RPC (88888)

### Out of Scope (MVP)
- USD quoting if no reliable price feed is available.

### Future Enhancements
- Price overlay (CHZ→USD) with source attribution
- Seasonal themes for the animation


