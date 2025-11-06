# Wallet & Onboarding Setup Guide

## ✅ Completed Setup

### 1. Core Dependencies
All required libraries have been installed:
- ✅ `viem@^2.38.6` - TypeScript interface for Ethereum
- ✅ `@tanstack/react-query@^5.90.7` - Data fetching and caching
- ✅ `@walletconnect/modal-react-native@^1.1.0` - WalletConnect v2 modal
- ✅ `@walletconnect/react-native-compat@^2.23.0` - Compatibility layer
- ✅ `@walletconnect/utils@^2.23.0` - WalletConnect utilities
- ✅ `react-native-mmkv@^4.0.0` - Fast, secure storage
- ✅ `react-native-get-random-values@^2.0.0` - Crypto polyfill
- ✅ `react-native-svg@^15.14.0` - SVG support

### 2. Project Structure

```
├── app/
│   └── _layout.tsx                  # ✅ Updated with providers
├── components/
│   └── wallet/
│       ├── wallet-connect-button.tsx    # ✅ Connect button
│       ├── wallet-status-pill.tsx       # ✅ Status indicator
│       ├── network-mismatch-warning.tsx # ✅ Wrong network alert
│       └── index.ts                     # ✅ Exports
├── config/
│   ├── chains.ts                    # ✅ Chiliz chain definition
│   ├── wallet-connect.ts            # ✅ WalletConnect config
│   └── README.md                    # ✅ Setup instructions
├── contexts/
│   └── wallet-context.tsx           # ✅ Wallet state management
├── hooks/
│   ├── use-wallet-actions.ts        # ✅ Connection actions
│   ├── use-wallet-state.ts          # ✅ State queries
│   └── use-protected-action.ts      # ✅ Chain guard enforcement
├── lib/
│   ├── storage.ts                   # ✅ MMKV wrapper
│   ├── query-client.ts              # ✅ TanStack Query setup
│   └── telemetry.ts                 # ✅ Event tracking
└── types/
    └── wallet.ts                    # ✅ TypeScript types
```

### 3. Configuration Setup

#### ✅ Crypto Polyfills
- Imported at the top of `app/_layout.tsx`
- Enables Web3 crypto operations in React Native

#### ✅ Chiliz Chain
- Chain ID: 88888
- Configured in `config/chains.ts`
- RPC: `https://rpc.ankr.com/chiliz`
- Explorer: `https://explorer.chiliz.com`

#### ✅ Storage Layer
- MMKV for secure, fast key-value storage
- Session persistence enabled
- Type-safe wrapper in `lib/storage.ts`

#### ✅ TanStack Query
- Configured with React Native adapters
- App focus listener for refetching
- Integrated in root layout

#### ✅ Wallet Context
- State management for wallet connection
- Session restoration from storage
- Network state tracking
- Type-safe hooks for components

#### ✅ Chain Guard
- Enforced via `useProtectedAction` hook
- Blocks transactions on wrong network (chainId !== 88888)
- Provides user-friendly error messages

#### ✅ Telemetry System
- Event tracking for all wallet actions
- Matches specification from feature doc:
  - `wallet_connect_opened`
  - `wallet_connected`
  - `wallet_disconnected`
  - `network_mismatch_shown`
  - `session_restored`

#### ✅ UI Components
- Retro gaming aesthetic (per design system)
- `WalletConnectButton` - Connection button
- `WalletStatusPill` - Status indicator
- `NetworkMismatchWarning` - Wrong network alert

---

## ⚠️ Required Configuration

### 1. WalletConnect Project ID

**You must obtain a WalletConnect Project ID before the wallet can connect.**

#### Steps:
1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project:
   - **Name**: Pepper DAO
   - **Description**: Pepper DAO Mobile App
4. Copy your Project ID

#### Option A: Environment Variable (Recommended)
Create a `.env` file in the project root:
```bash
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

#### Option B: Direct Configuration (Development Only)
Edit `config/wallet-connect.ts`:
```typescript
export const WALLETCONNECT_PROJECT_ID = 'your_project_id_here';
```

⚠️ **Never commit your Project ID to version control if using Option B**

---

## 🚧 Implementation TODOs

### High Priority

#### 1. Implement WalletConnect Integration
**Location**: `contexts/wallet-context.tsx`

The `connect()` function is a placeholder. You need to:

```typescript
// In connect() function
import { Core } from '@walletconnect/core';
import { Web3Modal } from '@walletconnect/modal-react-native';
import { WalletConnectModal } from '@walletconnect/modal-react-native';

// Initialize WalletConnect
const core = new Core({
  projectId: WALLETCONNECT_PROJECT_ID
});

// Show connection modal
const modal = new WalletConnectModal({
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata: WALLETCONNECT_METADATA,
  providerMetadata: {
    name: 'Pepper DAO',
    url: 'https://pepperprotocol.io'
  }
});

// Handle connection
const session = await modal.connect();
const address = session.namespaces.eip155.accounts[0].split(':')[2];
const chainId = parseInt(session.namespaces.eip155.accounts[0].split(':')[1]);

// Update state
setWallet({
  address: address as `0x${string}`,
  chainId,
  providerType: 'walletconnect',
  connectedAt: Date.now(),
  connectionState: 'connected',
  networkState: getNetworkState(chainId),
  isConnected: true,
  isConnecting: false,
  isWrongNetwork: chainId !== CHILIZ_CHAIN_ID,
});

// Save session
saveWalletSession({
  address: address as `0x${string}`,
  chainId,
  providerType: 'walletconnect',
  connectedAt: Date.now(),
});

// Track telemetry
telemetry.trackWalletConnected('walletconnect', chainId, address);
```

#### 2. Implement Chain Switching
**Location**: `contexts/wallet-context.tsx`

The `switchToChiliz()` function needs implementation:

```typescript
// Request chain switch via WalletConnect
await walletConnectClient.request({
  topic: session.topic,
  chainId: `eip155:${CHILIZ_CHAIN_ID}`,
  request: {
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: `0x${CHILIZ_CHAIN_ID.toString(16)}` }],
  },
});

telemetry.trackNetworkSwitchAttempted(CHILIZ_CHAIN_ID);
```

#### 3. Implement Session Persistence
**Location**: `contexts/wallet-context.tsx`

Add session expiry checks and auto-reconnection:

```typescript
useEffect(() => {
  const session = loadWalletSession();
  
  if (session && session.address) {
    // Check if session has expired
    if (session.sessionExpiryMs && Date.now() > session.sessionExpiryMs) {
      telemetry.trackSessionExpired('expired_timestamp');
      clearWalletSession();
      return;
    }
    
    // Restore session
    // ... existing code ...
  }
}, []);
```

### Medium Priority

#### 4. Add ReOwn SDK Support
The spec mentions ReOwn as the primary provider with WalletConnect as fallback. Research ReOwn SDK integration.

#### 5. Integrate Analytics Service
**Location**: `lib/telemetry.ts`

Replace the TODO with actual analytics integration:

```typescript
// Example with Mixpanel
import { Mixpanel } from 'mixpanel-react-native';

track(eventName: string, properties?: TelemetryEventProps): void {
  if (!this.enabled) return;
  
  Mixpanel.track(eventName, properties);
  
  if (this.debugMode) {
    console.log('[Telemetry]', eventName, properties);
  }
}
```

#### 6. Add Error Boundaries
Wrap wallet operations in error boundaries for better error handling.

#### 7. Add Haptic Feedback
Use `expo-haptics` for button presses (already installed):

```typescript
import * as Haptics from 'expo-haptics';

// In WalletConnectButton onPress
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

### Low Priority

#### 8. Add Loading States
Enhance UI with skeleton loaders during connection.

#### 9. Add Wallet Icon Support
Display wallet provider icons (MetaMask, Trust Wallet, etc.).

#### 10. Add Deep Link Handling
Configure app to handle wallet deep links for better UX.

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Connect wallet via WalletConnect
- [ ] Wallet session persists after app restart
- [ ] Wrong network warning appears on incorrect chain
- [ ] Switch network button works
- [ ] Disconnect wallet clears session
- [ ] Protected actions blocked on wrong network
- [ ] Telemetry events logged in debug mode

### Edge Cases
- [ ] Connection timeout handling
- [ ] User rejects connection
- [ ] Session expiry handling
- [ ] Network unavailable during connection
- [ ] Multiple connection attempts
- [ ] App backgrounded during connection

---

## 📱 Usage Examples

### In a Component

```typescript
import { useWalletState } from '@/hooks/use-wallet-state';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { WalletConnectButton, NetworkMismatchWarning } from '@/components/wallet';

export default function GovernanceScreen() {
  const { isConnected, displayAddress, isWrongNetwork } = useWalletState();
  const { executeProtected, canExecute } = useProtectedAction();

  async function handleVote(proposalId: string, support: boolean) {
    try {
      await executeProtected(async () => {
        // This will only run if wallet is connected and on correct network
        await submitVote(proposalId, support);
      });
    } catch (error) {
      if (error instanceof ProtectedActionError) {
        // Show user-friendly error
        Alert.alert('Cannot Vote', error.message);
      }
    }
  }

  return (
    <View>
      <WalletConnectButton />
      
      {isWrongNetwork && <NetworkMismatchWarning />}
      
      {isConnected && (
        <Text>Connected: {displayAddress}</Text>
      )}
      
      <Button
        title="Vote Yes"
        onPress={() => handleVote('prop-123', true)}
        disabled={!canExecute()}
      />
    </View>
  );
}
```

---

## 🔒 Security Notes

1. ✅ **No Private Keys**: The app never stores or handles private keys
2. ✅ **Chain Verification**: All transactions verified against chainId 88888
3. ✅ **Secure Storage**: MMKV with encryption for session data
4. ⚠️ **Project ID**: Keep WalletConnect Project ID secure
5. ⚠️ **Analytics**: Anonymize addresses in telemetry

---

## 📚 Documentation References

- [WalletConnect v2 Docs](https://docs.walletconnect.com/)
- [Viem Documentation](https://viem.sh/)
- [TanStack Query](https://tanstack.com/query/latest)
- [MMKV Storage](https://github.com/mrousavy/react-native-mmkv)
- [Chiliz Chain Docs](https://docs.chiliz.com/)

---

## 🆘 Troubleshooting

### "WalletConnect is not configured"
→ Add your Project ID (see Required Configuration above)

### "Module not found: react-native-get-random-values"
→ Ensure polyfill is imported at top of `app/_layout.tsx`

### "Chain guard blocking transactions"
→ User must be on Chiliz network (88888)

### Session not persisting
→ Check MMKV storage is initialized correctly

---

## 📞 Next Steps

1. **Get WalletConnect Project ID** (required immediately)
2. **Implement WalletConnect connection logic** (high priority)
3. **Test on physical device** (WalletConnect requires real device/emulator)
4. **Add analytics integration** (when ready for production)
5. **Implement ReOwn SDK** (per spec requirements)

---

**Status**: ✅ Infrastructure Complete | ⚠️ Integration Required
**Last Updated**: November 6, 2025

