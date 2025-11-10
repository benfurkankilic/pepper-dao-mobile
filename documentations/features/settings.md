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

## Theme System

The app uses a Peppercoin-aligned light theme design system:

### Colors
- **Primary**: Pepper Red (#E54545) - Used for primary actions, links, and accents
- **Secondary**: Forest Green (#1E4F3A) - Used for secondary elements
- **Surfaces**: White (#FFFFFF) and Surface Alt (#F3F6F4) - For card backgrounds
- **Text**: Ink (#11181C) - Primary text color
- **Background**: Off White (#FAFAF7) - Main app background

All colors are defined in `constants/theme.ts` and available as Tailwind classes.

### Typography
- **Display/Headlines**: PPNeueBit-Bold (pixel font) - For headings, buttons, and labels
- **Body Text**: PPMondwest-Regular - For paragraphs and body content

Fonts are loaded from `@/assets/fonts` and available via:
- `font-pixel` Tailwind class
- `font-sans` Tailwind class
- `ThemedText` component with type variants: `display`, `headline`, `body`, `caption`, `link`

### Components
- **Button**: Available in `components/ui/button.tsx` with variants: `primary`, `secondary`, `ghost`
- **Card**: Available in `components/ui/card.tsx` with elevation options
- **ThemedView**: Supports `surface` prop for consistent backgrounds

### Usage
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Using components
<ThemedView surface="default">
  <ThemedText type="headline">Title</ThemedText>
  <ThemedText type="body">Body text</ThemedText>
  <Button variant="primary">Action</Button>
</ThemedView>
```


