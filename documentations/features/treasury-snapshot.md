## Treasury Snapshot — Feature Specification

### Objective
Provide a transparent breakdown of DAO assets by vault segments and holdings.

### Data
- Inputs: List of treasury addresses grouped by segment (staking, grants, liquidity, marketing).
- For each address: read CHZ and relevant ERC-20 balances.
- Optional: price feed for CHZ→USD (if available and reliable).

### Calculations
- Segment total = sum of balances across addresses in segment.
- Portfolio total = sum of all segment totals.
- Percent of total per segment = `segment / portfolioTotal`.
- Display precision: CHZ to 4 dp (≥1), 6 dp (<1); thousands separators.

### UI
- Donut or stacked bars per segment with legend.
- Holdings list: token icon, symbol, amount, percent of total.
- Tapping a holding opens explorer link (Chiliscan) for the address.

### Acceptance Criteria
- Segment totals reconcile to the portfolio total.
- Missing data shows as ‘–’ and does not break layout.
- Works read-only; refresh every 30–60s.

### Error Handling
- Price feed unavailable → display CHZ-only amounts with clear label.
- RPC partial failures → show partial results and retry silently.

### Telemetry
- `treasury_viewed`
- `treasury_refreshed` {segments, durationMs}
- `treasury_error` {code}

### Performance
- Batch RPC via multicall when possible.
- Cache per-segment results; diff-only updates on refresh.

### Tests
- Segment aggregation unit tests.
- Formatting snapshot tests (precision, separators).
- Partial failure handling.

### Dependencies
- Treasury/vault addresses & labels
- Optional price feed

### Out of Scope (MVP)
- Complex PnL analytics
- Historical portfolio allocation charts

### Future Enhancements
- Time-series breakdowns with trend indicators
- CSV export of holdings snapshot


