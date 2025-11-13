## Wallet & Onboarding — Overview

> **Note**: This document provides a high-level overview. For detailed specifications, see:
> - **[Onboarding Specification](./onboarding.md)** - 3-slide wizard for first-time users
> - **[Wallet Connection Specification](./wallet.md)** - Reown AppKit integration and chain guard

### Objective
Provide a smooth, beginner-friendly way to explore the app read-only and connect a wallet via Reown AppKit, with strict chain guard to Chiliz (88888).

### Scope
This combined flow includes two main phases:

#### Phase 1: Onboarding (First-Time Users)
- 3-slide wizard introducing app features
- Skip button for users who want to jump in
- Persistent completion flag to prevent re-showing
- See **[onboarding.md](./onboarding.md)** for full specification

#### Phase 2: Wallet Connection (After Onboarding)
- Dismissible wallet connection modal
- Read-only exploration before connection
- Reown AppKit integration for wallet connection
- Chain guard (88888) and friendly mismatch resolution
- Disconnect and session lifecycle management
- See **[wallet.md](./wallet.md)** for full specification

### User Stories

#### Onboarding Stories
- As a first-time user, I see a 3-slide wizard explaining key app features.
- As a user, I can skip the onboarding wizard at any time.
- As a user who completes onboarding, I immediately see the wallet connection prompt.

#### Wallet Connection Stories
- As a user who completes onboarding, I see a modal that lets me connect or explore without connecting.
- As a user who dismisses the modal, I can browse proposals and treasury in read-only mode.
- As a holder, I can connect via Reown AppKit and see my address and network status.
- As a user, I am prevented from sending transactions on the wrong network and told how to fix it.

### Data Model
```ts
type WalletProviderType = 'reown';

interface WalletSession {
  address: `0x${string}` | null;
  chainId: number | null;
  providerType: WalletProviderType | null;
  connectedAt: number | null; // epoch ms
  sessionExpiryMs?: number | null;
}
```

### Configuration
- **Project ID**: Obtain from [Reown Dashboard](https://cloud.reown.com)
- **Environment Variable**: `EXPO_PUBLIC_REOWN_PROJECT_ID`
- **App Scheme**: `pepperdaomobile://` (configured in `app.json`)
- **Storage**: AsyncStorage-backed persistence for session and modal dismissal state

### Integrations
- Reown AppKit React Native with Ethers adapter
- EIP-155 chain 88888 (Chiliz Chain)
- Chain guard: verify `chainId === 88888` before any write; show mismatch UI
- Telemetry: tracks connection events, network mismatch, and user actions

### Combined Flow

#### 1. First App Launch (New User)
1. App loads → `OnboardingGate` checks storage
2. `ONBOARDING_COMPLETED` is `false` → show `OnboardingWizard`
3. User sees 3-slide wizard with app features
4. User completes or skips wizard
5. `ONBOARDING_COMPLETED` set to `true`
6. `WalletConnectionModal` immediately appears
7. Modal displays: "Connect Wallet" (primary) and "Explore Without Connecting" (secondary)

#### 2. Connect Wallet
- Tap "Connect Wallet" → Opens Reown AppKit modal
- User selects wallet app → authorizes connection → app receives address + chainId
- Modal auto-dismisses on successful connection
- Session persists via AppKit storage

#### 3. Explore Without Connecting
- Tap "Explore Without Connecting" → Dismissal state saved to storage
- Modal won't show again (until user manually resets or uninstalls)
- User can browse app in read-only mode
- Connect button remains available in app UI

#### 4. Chain Guard
- If `chainId !== 88888`, wallet context sets `isWrongNetwork: true`
- Protected actions (transactions, signatures) are blocked via `useProtectedAction` hook
- UI shows network mismatch warning with instructions to switch in wallet app

#### 5. Disconnect
- User taps disconnect → AppKit disconnects session
- Clear local session metadata; return to read-only state
- Cached data (proposals, treasury) remains available

#### 6. Returning User
- App loads → `OnboardingGate` checks storage
- `ONBOARDING_COMPLETED` is `true` → skip wizard
- AppKit automatically restores wallet session if available
- User lands on main app with restored connection state

### UI & Copy
- **Modal Title**: "Connect Wallet"
- **Modal Description**: "Connect your wallet to participate in governance, staking, and earn rewards. Or explore without connecting in read-only mode."
- **Primary CTA**: "Connect Wallet" (retro pink button)
- **Secondary CTA**: "Explore Without Connecting" (outlined button)
- **Status Display**: Connected (short address) / Not connected / Wrong network
- **Design**: Retro gaming aesthetic with chunky borders, pixel fonts, and bold colors

### Acceptance Criteria

#### Onboarding
- ✅ New users see 3-slide wizard on first app launch
- ✅ Skip button works on all slides
- ✅ Completing or skipping sets `ONBOARDING_COMPLETED` flag
- ✅ Wizard never shows again after completion
- ✅ Wallet modal appears immediately after onboarding

#### Wallet Connection
- ✅ Modal shows after onboarding when disconnected and not previously dismissed
- ✅ Works on iOS and Android with Reown AppKit
- ✅ Dismissible modal allows read-only exploration
- ✅ Wrong-network state blocks writes and shows guidance
- ✅ Session persists across app restarts via AppKit storage
- ✅ Telemetry tracks all connection and onboarding events
- ✅ Chain guard enforces Chiliz network (88888) for transactions

### Error Handling
- Wallet connection errors handled by Reown AppKit UI
- Network mismatch: show clear message with instructions
- Missing Project ID: console warning with setup instructions
- Session restoration: automatic via AppKit on app restart

### Security
- No custody; never store private keys.
- Verify `chainId` for writes; display destination chain in confirmations.
- Display addresses checksummed and shortened.

### Telemetry

#### Onboarding Events
- `onboarding_started` - Wizard begins
- `onboarding_step_viewed` {step, stepTitle} - User lands on a slide
- `onboarding_completed` {action: 'explore'} - User finishes wizard
- `onboarding_skipped` {skippedAtStep} - User taps skip

#### Wallet Connection Events
- `wallet_connect_opened` {provider: 'reown'} - Modal "Connect Wallet" pressed
- `wallet_connected` {provider: 'reown', chainId, address} - Connection succeeds
- `network_mismatch_shown` {currentChainId, expectedChainId: 88888} - Wrong network detected
- `wallet_disconnected` - User disconnects

See individual feature docs for complete telemetry specifications.

### Performance
- Avoid bundling heavy SDKs on cold path; lazy-load WC if needed.
- Debounce connection state updates to avoid UI thrash.

### Tests
- Connect/disconnect via Reown AppKit
- Wrong-network gating blocks protected actions
- Session restore after restart
- Modal dismissal persists across sessions
- Telemetry events fire correctly

### Dependencies
- `@reown/appkit-react-native` - Core AppKit library
- `@reown/appkit-ethers-react-native` - Ethers adapter for EVM chains
- `@react-native-async-storage/async-storage` - Storage persistence
- `@walletconnect/react-native-compat` - Required polyfills
- Additional peer deps: `react-native-get-random-values`, `react-native-svg`, `@react-native-community/netinfo`, `expo-application`
- Chiliz RPC: `https://rpc.ankr.com/chiliz`

### Implementation Files

#### Onboarding
- `components/onboarding/onboarding-wizard.tsx` - 3-slide wizard UI
- `components/onboarding/onboarding-gate.tsx` - Flow orchestration
- `contexts/onboarding-context.tsx` - Onboarding state
- `hooks/use-onboarding.ts` - Onboarding logic

#### Wallet Connection
- `config/appkit.ts` - AppKit initialization and configuration
- `config/appkit-storage.ts` - AsyncStorage adapter for AppKit
- `components/onboarding/wallet-connection-modal.tsx` - Connection modal UI
- `contexts/wallet-context.tsx` - Wallet state management bridging AppKit
- `hooks/use-protected-action.ts` - Chain guard enforcement
- `hooks/use-wallet-actions.ts` - Wallet action wrappers
- `hooks/use-wallet-state.ts` - Wallet state selectors

#### Shared
- `lib/telemetry.ts` - Event tracking
- `lib/storage.ts` - Storage service and keys

### Out of Scope (MVP)
- Multi-account management UI
- Hardware wallet specific flows
- Social login integrations (disabled in AppKit config)
- On-ramp features (disabled in AppKit config)

### Future Enhancements
- Enable social login via Reown AppKit
- Recent wallets carousel
- Session key / passkey research for mobile UX
- Custom wallet branding and theming


