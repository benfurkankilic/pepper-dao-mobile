## Wallet & Onboarding — Feature Specification

### Objective
Provide a smooth, beginner-friendly way to explore the app read-only and connect a wallet via ReOwn (primary) or WalletConnect (fallback), with strict chain guard to Chiliz (88888).

### Scope
- Read-only exploration before connection
- ReOwn connect flow, WalletConnect fallback
- Chain guard (88888) and friendly mismatch resolution
- Disconnect and session lifecycle management

### User Stories
- As a newcomer, I can browse proposals and treasury without connecting.
- As a holder, I can connect with ReOwn or WalletConnect and see my address and network.
- As a user, I am prevented from sending transactions on the wrong network and told how to fix it.

### Data Model
```ts
type WalletProviderType = 'reown' | 'walletconnect';

interface WalletSession {
  address: `0x${string}` | null;
  chainId: number | null;
  providerType: WalletProviderType | null;
  connectedAt: number | null; // epoch ms
  sessionExpiryMs?: number | null;
}
```

### Integrations
- ReOwn SDK (primary): deep links / in-app provider handoff
- WalletConnect v2 (fallback): QR/deep link session, EIP-155 chain 88888
- Chain guard: verify `chainId === 88888` before any write; show mismatch UI

### Flows
1) Welcome
- Show short intro, CTA: “Explore” or “Connect Wallet”.

2) Connect (ReOwn primary)
- Tap Connect → ReOwn prompt → user authorizes → app receives address + chainId.
- If ReOwn unavailable or fails → offer WalletConnect.

3) Connect (WalletConnect fallback)
- Initiate WC session → user selects wallet → approve → app receives address + chainId.

4) Chain Guard
- If `chainId !== 88888`, block writes; show prompt to switch to Chiliz; link to instructions.

5) Disconnect
- Clear session and cached signer; return to read-only state without losing cached data.

### UI & Copy
- Status pill: Connected (short address) / Not connected / Wrong network.
- Clear CTAs: Connect, Switch Network, Disconnect.
- Beginner copy: “You can explore without connecting. Connect to vote and stake.”

### Acceptance Criteria
- Works on iOS and Android with ReOwn and WalletConnect.
- Wrong-network state blocks writes and offers guidance.
- Session persists app restarts; safe auto-reconnect if possible.

### Error Handling
- Wallet rejected, timeout, unsupported methods → actionable messages + retry.
- Lost session: detect and show reconnect CTA.

### Security
- No custody; never store private keys.
- Verify `chainId` for writes; display destination chain in confirmations.
- Display addresses checksummed and shortened.

### Telemetry
- `wallet_connect_opened` {provider}
- `wallet_connected` {provider, chainId}
- `network_mismatch_shown` {currentChainId}
- `wallet_disconnected`

### Performance
- Avoid bundling heavy SDKs on cold path; lazy-load WC if needed.
- Debounce connection state updates to avoid UI thrash.

### Tests
- Connect/disconnect via ReOwn and WalletConnect
- Wrong-network gating blocks writes
- Session restore after restart

### Dependencies
- ReOwn SDK, WalletConnect v2
- Chiliz RPC (88888)

### Out of Scope (MVP)
- Multi-account management UI
- Hardware wallet specific flows

### Future Enhancements
- Recent wallets carousel
- Session key / passkey research for mobile UX


