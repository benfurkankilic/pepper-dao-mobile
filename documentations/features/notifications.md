## Notifications — Feature Specification

### Objective
Keep users informed about governance and staking events with opt-in, actionable notifications.

### Event Types (MVP)
- Governance: new proposal created, proposal closing soon, proposal executed
- Staking: rewards claimable threshold reached (if detectable), successful claim reminder

### Delivery
- Local notifications via app when in foreground/background
- Push notifications (optional in M3) using Expo Notifications; requires user opt-in

### Permission & Settings
- On first prompt, explain value clearly and offer opt-in
- Settings toggles: Governance (on/off), Staking (on/off), Quiet Hours (optional)

### Triggers
- Poll Aragon proposals for new items and closing windows
- Read staking `earned(address)`; if ≥ threshold (configurable), suggest claim
- Debounce to avoid spamming; min interval per type (e.g., 6h)

### Deep Links
- Tapping notification opens app and routes to detail (proposal/staking)

### Acceptance Criteria
- Users can opt-in/out; preferences persist
- Notifications are deduplicated and rate-limited
- Deep links navigate to correct screen with preloaded data

### Error Handling
- Permission denied → fallback to in-app banners
- Delivery failures logged; no crashes

### Telemetry
- `notifications_enabled` {categories}
- `notification_delivered` {type}
- `notification_opened` {type}

### Performance
- Schedule/poll at modest intervals; batch checks with existing refresh cycles

### Tests
- Opt-in/out flows
- Trigger logic correctness for closing soon and rewards threshold
- Deep link handling from cold start

### Dependencies
- Aragon proposals polling, staking views
- Expo Notifications (if push enabled)

### Out of Scope (MVP)
- Rich media notifications
- User-defined custom triggers beyond provided categories

### Future Enhancements
- Server-side push with indexer-backed precision
- Snooze and per-proposal subscriptions


