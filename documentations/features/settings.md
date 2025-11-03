## Settings — Feature Specification

### Objective
Provide controls for wallet connection, notifications, privacy, and diagnostics.

### Sections
- Wallet
  - Connect/Disconnect
  - Address, chain, provider type (ReOwn/WC)
- Notifications
  - Governance (toggle), Staking (toggle)
  - Optional Quiet Hours (start/end)
- Privacy
  - Telemetry opt-out toggle
- About & Diagnostics
  - App version, build number
  - RPC status, last sync times
  - Links: Aragon DAO, Chiliscan token, Terms/Privacy

### Data Model
```ts
interface SettingsState {
  notifications: { governance: boolean; staking: boolean; quietHours?: { start: string; end: string } | null };
  telemetryEnabled: boolean;
}
```

### Acceptance Criteria
- All toggles persist across app restarts
- Changing notification settings takes effect without restart
- Wallet disconnect clears session but preserves settings

### Error Handling
- If notifications are disabled at OS level, show guidance to enable
- If RPC is unreachable, display status as degraded without blocking UI

### Telemetry
- `settings_opened`
- `settings_changed` {key}

### Performance
- Lightweight; no heavy queries on open

### Tests
- Persistence of toggles
- Deep link to OS notification settings
- Disconnect flow from settings

### Dependencies
- Wallet session provider, notifications module

### Out of Scope (MVP)
- Advanced network selection UI

### Future Enhancements
- Theme selection (dark/light/system)
- Language localization


