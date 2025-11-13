## Wallet Connection — Feature Specification

### Objective
Provide secure wallet connection via Reown AppKit (WalletConnect v2) with strict chain guard to Chiliz Chain (88888), enabling users to participate in governance, staking, and transactions.

### Scope
- Reown AppKit integration for wallet connection
- Chain guard enforcement (Chiliz Chain 88888 only)
- Wallet connection modal after onboarding completion
- Session persistence and lifecycle management
- Network mismatch detection and user guidance
- Read-only mode for unconnected users

### User Stories
- As a user who completes onboarding, I see a modal prompting me to connect my wallet or explore without connecting.
- As a user, I can connect my wallet via Reown AppKit and see my address and network status.
- As a user on the wrong network, I am blocked from sending transactions and guided to switch networks.
- As a user, I can disconnect my wallet and return to read-only mode.
- As a returning user, my wallet session persists across app restarts.

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

interface WalletState extends WalletSession {
  connectionState: 'disconnected' | 'connecting' | 'connected';
  networkState: 'correct' | 'wrong_network';
  isConnected: boolean;
  isConnecting: boolean;
  isWrongNetwork: boolean;
}

interface WalletError {
  code: string;
  message: string;
  details: unknown;
}
```

### Configuration

#### Environment Variables
- **EXPO_PUBLIC_REOWN_PROJECT_ID**: Obtain from [Reown Cloud Dashboard](https://cloud.reown.com)
- Required for AppKit initialization

#### App Configuration
- **Scheme**: `pepperdao://` (configured in `app.json`)
- Used for deep linking wallet app responses back to Pepper DAO

#### Supported Chain
- **Chain ID**: 88888 (Chiliz Chain)
- **RPC**: `https://rpc.ankr.com/chiliz`
- **Chain Name**: Chiliz
- **Currency**: CHZ
- **Explorer**: `https://scan.chiliz.com`

#### Storage Keys
- `STORAGE_KEYS.WALLET_SESSION` - Full wallet session object
- `STORAGE_KEYS.WALLET_PROVIDER_TYPE` - Provider type ('reown')
- `STORAGE_KEYS.WALLET_CONNECTED_AT` - Connection timestamp
- `STORAGE_KEYS.ONBOARDING_DISMISSED` - Modal dismissal flag

### Integrations

#### Reown AppKit
- **Library**: `@reown/appkit-react-native`
- **Adapter**: `@reown/appkit-ethers-react-native`
- **Features**:
  - EIP-155 (Ethereum) compatible
  - WalletConnect v2 protocol
  - Native mobile wallet integration
  - QR code scanning for desktop wallets
  - Session persistence via AsyncStorage

#### Required Peer Dependencies
- `@react-native-async-storage/async-storage` - Storage adapter
- `@walletconnect/react-native-compat` - Polyfills for WalletConnect
- `react-native-get-random-values` - Crypto polyfill
- `react-native-svg` - SVG support for QR codes
- `@react-native-community/netinfo` - Network status detection
- `expo-application` - App metadata

### UI Components

#### WalletConnectionModal
- **Location**: `components/onboarding/wallet-connection-modal.tsx`
- **Trigger**: Appears after onboarding completion if user is not connected and hasn't dismissed it
- **Features**:
  - Modal overlay with retro gaming design
  - Primary CTA: "Connect Wallet" (opens Reown AppKit)
  - Secondary CTA: "Explore Without Connecting" (dismisses modal)
  - Haptic feedback on interactions
- **Storage**: Sets `ONBOARDING_DISMISSED` on secondary CTA
- **Auto-dismiss**: Closes when wallet successfully connects

#### WalletConnectButton
- **Location**: `components/wallet/wallet-connect-button.tsx`
- **Purpose**: Reusable button to trigger wallet connection from anywhere in app
- **States**: Disconnected, Connecting, Connected

#### WalletStatusPill
- **Location**: `components/wallet/wallet-status-pill.tsx`
- **Purpose**: Display connection status and shortened address
- **States**: 
  - Not Connected (gray)
  - Connected (green with address)
  - Wrong Network (red with warning)

#### NetworkMismatchWarning
- **Location**: `components/wallet/network-mismatch-warning.tsx`
- **Purpose**: Alert banner when user is on wrong network
- **Action**: Instructs user to switch to Chiliz Chain in wallet app

### Wallet Context & Hooks

#### WalletContext
- **Location**: `contexts/wallet-context.tsx`
- **Purpose**: Global wallet state management
- **Provides**:
  - `wallet` (WalletState)
  - `error` (WalletError | null)
  - `connect()` - Opens Reown AppKit
  - `disconnect()` - Disconnects and clears session
  - `switchToChiliz()` - Guides user to switch network
  - `isChainSupported(chainId)` - Checks if chain is supported
  - `getShortAddress()` - Returns formatted address (0x1234...5678)

#### useWallet Hook
- **Location**: `contexts/wallet-context.tsx`
- **Usage**: Access wallet state and actions from any component
- **Example**:
  ```tsx
  const { wallet, connect, disconnect } = useWallet();
  ```

#### useWalletActions Hook
- **Location**: `hooks/use-wallet-actions.ts`
- **Purpose**: Convenient wrapper for wallet actions with error handling
- **Provides**:
  - `connectWallet()` - Connect with try/catch
  - `disconnectWallet()` - Disconnect with try/catch
  - `handleNetworkMismatch()` - Guide user to switch network
  - `isLoading` - Connection loading state
  - `error` - Connection error

#### useProtectedAction Hook
- **Location**: `hooks/use-protected-action.ts`
- **Purpose**: Chain guard enforcement for write operations
- **Provides**:
  - `executeProtected(action)` - Wraps action with connection/network checks
  - `canExecute()` - Returns error message or null if ready
  - `isReady` - Boolean indicating if protected actions can run
- **Throws**: `ProtectedActionError` with reasons:
  - `NOT_CONNECTED` - Wallet not connected
  - `WRONG_NETWORK` - Connected to wrong chain
  - `CONNECTING` - Connection in progress

### Flows

#### 1. Connect Wallet (After Onboarding)
1. User completes onboarding wizard
2. `WalletConnectionModal` appears (if not previously dismissed)
3. User taps "Connect Wallet"
4. Haptic feedback triggers
5. Telemetry: `wallet_connect_opened` (provider: 'reown')
6. Reown AppKit modal opens
7. User selects wallet app (e.g., MetaMask, Trust Wallet)
8. Wallet app opens with connection request
9. User approves connection
10. AppKit receives address and chainId
11. `WalletContext` syncs state
12. Telemetry: `wallet_connected` (provider: 'reown', chainId, address)
13. Session saved to storage via AppKit
14. `WalletConnectionModal` auto-dismisses
15. User sees connected state in UI

#### 2. Explore Without Connecting
1. User taps "Explore Without Connecting" in modal
2. Haptic feedback triggers
3. `ONBOARDING_DISMISSED` set to `true` in storage
4. Modal closes
5. User can browse app in read-only mode
6. Connect button remains available in app UI (e.g., settings, profile)

#### 3. Chain Guard (Wrong Network)
1. User connects wallet on Polygon (chainId: 137)
2. `WalletContext` detects `chainId !== 88888`
3. Sets `wallet.isWrongNetwork = true`
4. Sets `wallet.networkState = 'wrong_network'`
5. Telemetry: `network_mismatch_shown` (currentChainId: 137, expectedChainId: 88888)
6. `NetworkMismatchWarning` banner appears
7. Protected actions are blocked:
   ```tsx
   const { executeProtected } = useProtectedAction();
   
   // This will throw ProtectedActionError with reason 'WRONG_NETWORK'
   await executeProtected(async () => {
     await voteOnProposal(proposalId);
   });
   ```
8. User instructed to switch network in wallet app
9. User switches to Chiliz Chain in wallet
10. `WalletContext` detects chainId change to 88888
11. Sets `wallet.isWrongNetwork = false`
12. Warning banner disappears
13. Protected actions now allowed

#### 4. Disconnect Wallet
1. User taps disconnect button (e.g., in settings)
2. `disconnect()` called on `WalletContext`
3. AppKit disconnects session
4. Telemetry: `wallet_disconnected`
5. Session cleared from storage
6. `WalletContext` resets to initial state
7. User returns to read-only mode
8. Cached data (proposals, treasury) remains available

#### 5. Session Restore (App Restart)
1. User closes and reopens app
2. AppKit automatically restores session from storage
3. `WalletContext` syncs with restored session
4. If session valid:
   - Wallet state populated with address and chainId
   - Telemetry: `session_restored` (chainId)
   - User sees connected state immediately
5. If session expired:
   - Wallet state remains disconnected
   - Telemetry: `session_expired` (reason)
   - User must reconnect manually

### Telemetry Events

#### `wallet_connect_opened`
- **When**: "Connect Wallet" button pressed (modal or in-app button)
- **Properties**:
  - `provider` (string): 'reown'
- **Purpose**: Track funnel start for wallet connection

#### `wallet_connected`
- **When**: Wallet successfully connects and session established
- **Properties**:
  - `provider` (string): 'reown'
  - `chainId` (number): Connected chain ID
  - `address` (string): Shortened address (0x1234...5678)
- **Purpose**: Track successful connections and chain distribution

#### `wallet_disconnected`
- **When**: User manually disconnects wallet
- **Properties**: None
- **Purpose**: Track disconnection rate

#### `wallet_connection_failed`
- **When**: Connection attempt fails (rejection, timeout, error)
- **Properties**:
  - `provider` (string): 'reown'
  - `error` (string): Error message
  - `errorCode` (string, optional): Error code if available
- **Purpose**: Track and debug connection issues

#### `network_mismatch_shown`
- **When**: User connects on wrong network
- **Properties**:
  - `currentChainId` (number): User's current chain
  - `expectedChainId` (number): 88888 (Chiliz)
- **Purpose**: Track wrong network frequency by chain

#### `network_switch_attempted`
- **When**: User attempts to switch network (not applicable for mobile, but tracked)
- **Properties**:
  - `targetChainId` (number): 88888
- **Purpose**: Track switch attempts

#### `session_restored`
- **When**: App reopens and successfully restores wallet session
- **Properties**:
  - `chainId` (number): Restored chain ID
- **Purpose**: Track session persistence success rate

#### `session_expired`
- **When**: App reopens but session is no longer valid
- **Properties**:
  - `reason` (string): Expiry reason
- **Purpose**: Track session expiry rate

### Acceptance Criteria
- ✅ Modal appears after onboarding if user not connected
- ✅ AppKit modal opens when "Connect Wallet" pressed
- ✅ Supports iOS and Android wallet apps
- ✅ Session persists across app restarts
- ✅ Wrong network (chainId !== 88888) blocks transactions
- ✅ Network mismatch shows clear warning with instructions
- ✅ Disconnect clears session and returns to read-only
- ✅ "Explore Without Connecting" dismisses modal permanently
- ✅ All telemetry events fire correctly
- ✅ Shortened address displayed correctly (0x1234...5678)
- ✅ Haptic feedback on all button interactions

### Security Best Practices

#### Never Store Private Keys
- App is non-custodial; private keys never leave wallet app
- Only store address, chainId, and session metadata

#### Verify Chain ID
- Always check `wallet.chainId === 88888` before write operations
- Use `useProtectedAction` hook to enforce chain guard

#### Display Transaction Details
- Show destination chain in all transaction confirmations
- Display full contract addresses for user verification
- Checksummed addresses only

#### Session Management
- Sessions stored securely via AppKit's AsyncStorage adapter
- Encrypted storage via MMKV for session metadata
- Clear sessions on disconnect

### Error Handling

#### Connection Errors
- User rejects connection → Silent fail, keep modal open
- Wallet app not installed → AppKit shows QR code for desktop wallets
- Network timeout → Show error message, allow retry

#### Network Mismatch
- Non-blocking: User can still browse read-only
- Clear banner with "Switch to Chiliz Chain" message
- Instructions: "Open your wallet app and switch to Chiliz Chain (88888)"

#### Session Restoration Errors
- Failed restore → Log error, treat as disconnected
- Invalid session data → Clear storage, start fresh
- AppKit errors → Console warning with setup instructions

#### Protected Action Errors
```tsx
try {
  await executeProtected(async () => {
    await stakeTokens(amount);
  });
} catch (error) {
  if (error instanceof ProtectedActionError) {
    if (error.reason === 'NOT_CONNECTED') {
      // Show "Connect wallet" prompt
    } else if (error.reason === 'WRONG_NETWORK') {
      // Show "Switch network" warning
    }
  }
}
```

### Performance Considerations

#### Lazy Loading
- AppKit bundle is ~2MB; already lazy-loaded by default
- Modal only rendered when needed (conditional render)

#### Debouncing
- Connection state updates debounced to avoid UI thrash
- Chain ID changes trigger single state update

#### Storage Optimization
- MMKV used for fast synchronous storage operations
- Session writes are atomic and encrypted

### Testing (Manual QA)

#### Connection Flow
- [ ] Tap "Connect Wallet" → AppKit modal opens
- [ ] Select wallet app → app opens with request
- [ ] Approve in wallet → connection succeeds
- [ ] See connected address in UI
- [ ] Check telemetry logs for events

#### Network Guard
- [ ] Connect on Polygon → see mismatch warning
- [ ] Try protected action → blocked with error
- [ ] Switch to Chiliz in wallet → warning disappears
- [ ] Protected action now works

#### Persistence
- [ ] Connect wallet → close app → reopen
- [ ] Session restores automatically
- [ ] Address and chainId correct

#### Disconnect
- [ ] Tap disconnect → session clears
- [ ] UI shows disconnected state
- [ ] Cached data still visible

#### Dismiss Modal
- [ ] Tap "Explore Without Connecting"
- [ ] Modal closes and doesn't reappear
- [ ] Connect button still available in app

### Dependencies
- `@reown/appkit-react-native` - Core AppKit library (v1.2.0+)
- `@reown/appkit-ethers-react-native` - Ethers adapter for EVM chains
- `@react-native-async-storage/async-storage` - Storage persistence
- `@walletconnect/react-native-compat` - Required polyfills
- `react-native-get-random-values` - Crypto polyfill
- `react-native-svg` - SVG support for QR codes
- `@react-native-community/netinfo` - Network detection
- `expo-application` - App metadata for WalletConnect
- `expo-haptics` - Haptic feedback

### Implementation Files
- `config/appkit.ts` - AppKit initialization and configuration
- `config/appkit-storage.ts` - AsyncStorage adapter for AppKit
- `config/chains.ts` - Chiliz chain configuration
- `components/onboarding/wallet-connection-modal.tsx` - Connection modal UI
- `components/wallet/wallet-connect-button.tsx` - Connect button component
- `components/wallet/wallet-status-pill.tsx` - Status display component
- `components/wallet/network-mismatch-warning.tsx` - Warning banner
- `contexts/wallet-context.tsx` - Wallet state management
- `hooks/use-wallet-actions.ts` - Wallet action wrappers
- `hooks/use-protected-action.ts` - Chain guard enforcement
- `hooks/use-wallet-state.ts` - Wallet state selectors
- `lib/telemetry.ts` - Event tracking
- `lib/storage.ts` - Storage service
- `types/wallet.ts` - TypeScript types

### Out of Scope (MVP)
- Multi-account management UI
- Hardware wallet specific flows (Ledger, Trezor)
- Social login via Reown AppKit (disabled in config)
- On-ramp features (disabled in config)
- ENS name resolution
- Wallet avatar/profile pictures
- Gas estimation and fee display
- Transaction history within app

### Future Enhancements
- Enable social login (email, Google) via Reown AppKit
- Recent wallets carousel for quick reconnection
- Session key / passkey research for mobile UX
- Custom wallet branding and theming
- Multi-chain support (add more networks)
- Hardware wallet integration
- Transaction simulation before signing
- Gas price optimization
- NFT avatar support

### Related Documentation
- **Onboarding**: See `onboarding.md` for wizard spec
- **General Flow**: See `wallet-and-onboarding.md` for combined overview
- **Reown AppKit Docs**: https://docs.reown.com/appkit/react-native/core/installation
- **Chiliz Chain**: https://docs.chiliz.com/

