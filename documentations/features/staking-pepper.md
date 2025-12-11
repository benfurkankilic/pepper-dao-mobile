## Staking ($PEPPER) — Feature Specification

### Objective
Allow holders to approve the token, stake/unstake, and claim rewards with clear states and safeguards. The feature supports both development (Spicy Testnet) and production (Chiliz Mainnet) environments.

---

### Network Configuration

#### Environment-Aware Chain Selection
The app uses React Native's `__DEV__` global to automatically switch between networks:

| Environment | Network | Chain ID | RPC Endpoint | Explorer |
|-------------|---------|----------|--------------|----------|
| Development (`__DEV__ = true`) | Chiliz Spicy Testnet | 88882 | `https://spicy-rpc.chiliz.com/` | `https://testnet.chiliscan.com/` |
| Production (`__DEV__ = false`) | Chiliz Mainnet | 88888 | `https://rpc.ankr.com/chiliz` | `https://chiliscan.com/` |

#### Chain Configuration Pattern
```typescript
// config/chains.ts
export const CHILIZ_CHAIN_ID = 88888;
export const CHILIZ_SPICY_CHAIN_ID = 88882;

export const ACTIVE_CHAIN_ID = __DEV__ ? CHILIZ_SPICY_CHAIN_ID : CHILIZ_CHAIN_ID;
```

#### Contract Addresses
```typescript
// config/staking.ts
export const STAKING_CONTRACT = {
  mainnet: '0x5cA4C88339D89B2547a001003Cca84F62F557A72',
  testnet: '<TESTNET_CONTRACT_ADDRESS>',
};

export function getStakingContractAddress(): string {
  return __DEV__ ? STAKING_CONTRACT.testnet : STAKING_CONTRACT.mainnet;
}
```

---

### Contracts & Functions

#### ERC-20 $PEPPER Token
- `balanceOf(address)` → uint256
- `allowance(address owner, address spender)` → uint256
- `approve(address spender, uint256 value)` → bool

#### Staking Contract
- `stake(uint256 amount)` - Stake PEPPER tokens
- `unstake(uint256 amount)` or `withdraw(uint256 amount)` - Withdraw staked tokens
- `claim()` or `getReward()` - Claim accumulated rewards
- Views:
  - `stakedBalance(address)` → uint256 - User's staked balance
  - `earned(address)` → uint256 - Claimable rewards
  - `totalStaked()` → uint256 - Total staked in contract
  - `lockOptions()` (optional) - Available lock tiers

---

### Implementation Architecture

#### File Structure
```
config/
├── chains.ts          # Network definitions with __DEV__ selection
├── staking.ts         # Staking contract config, ABI, addresses
├── appkit.ts          # Updated for dual-network support

services/
└── staking-api.ts     # Contract interaction layer using ethers.js

hooks/
└── use-staking.ts     # React hook for staking operations

components/
└── staking/
    ├── index.ts           # Barrel exports
    ├── staking-panel.tsx  # Main staking UI container
    └── stake-input.tsx    # Amount input with percentage chips
```

#### Integration with Reown AppKit

The staking feature leverages the existing wallet connection infrastructure:

```typescript
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit-react-native';
import { Contract, BrowserProvider, parseUnits, formatUnits } from 'ethers';

function useStakingContract() {
  const { walletProvider } = useAppKitProvider('eip155');
  const { address, isConnected } = useAppKitAccount();

  async function stake(amount: string) {
    if (!walletProvider || !isConnected) throw new Error('Wallet not connected');
    
    const provider = new BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new Contract(getStakingContractAddress(), STAKING_ABI, signer);
    
    const tx = await contract.stake(parseUnits(amount, 18));
    return tx.wait();
  }

  return { stake, unstake, claim, getBalances };
}
```

#### Chain Guard Enforcement

All write operations must use the `useProtectedAction` hook:

```typescript
import { useProtectedAction } from '@/hooks/use-protected-action';

function StakingPanel() {
  const { executeProtected, canExecute, isReady } = useProtectedAction();
  const { stake } = useStaking();

  async function handleStake(amount: string) {
    await executeProtected(async () => {
      await stake(amount);
    });
  }
}
```

---

### Flows

#### 1. Approve Token
- Check `allowance(user, stakingContract)` before staking
- If allowance < amount: prompt approval transaction
- Prefer exact amount approval; optionally offer "max/∞" with warning
- Wait for confirmation before proceeding to stake

#### 2. Stake
- Input field with wallet balance display
- Quick percentage chips: 25% | 50% | 75% | 100%
- Submit transaction; show pending → success states
- Refresh balances after confirmation

#### 3. Unstake
- Input field with staked balance display
- Quick percentage chips for partial unstake
- Handle lock periods/cooldowns if applicable
- Submit transaction; refresh state on success

#### 4. Claim Rewards
- Display claimable amount prominently
- Disable claim button when rewards = 0
- Submit transaction; refresh all balances post-success

---

### UI Components

#### Staking Panel
- **Wallet Balance**: Available PEPPER to stake
- **Allowance Status**: Current approval amount
- **Staked Balance**: User's staked PEPPER
- **Claimable Rewards**: Pending rewards to claim
- **Action Buttons**: Approve, Stake, Unstake, Claim

#### Stake Input Component
- Numeric input with max validation
- Percentage chips (25/50/75/100%)
- Real-time balance validation
- Clear error states for invalid amounts

#### Visual States
- **Loading**: Skeleton/spinner during data fetch
- **Pending TX**: Animated indicator + tx hash link
- **Success**: Green confirmation with explorer link
- **Error**: Red alert with retry option

---

### Acceptance Criteria

- [ ] Prevent over-stake (amount > wallet balance)
- [ ] Prevent over-unstake (amount > staked balance)
- [ ] Disable actions when amount = 0
- [ ] Chain guard enforced on all write actions
- [ ] Different chain IDs enforced based on `__DEV__`
- [ ] Explorer links for all transactions
- [ ] State refresh after transaction confirmations
- [ ] Proper loading states during transactions

---

### Error Handling

| Error Type | User Message | Action |
|------------|--------------|--------|
| Insufficient balance | "Not enough PEPPER to stake" | Show wallet balance |
| Insufficient allowance | "Approval required" | Show approve button |
| Transaction rejected | "Transaction was rejected" | Allow retry |
| Network error | "Network error, please retry" | Retry button |
| Wrong network | "Please switch to {network}" | Show network warning |

#### Error Code Mapping
```typescript
const STAKING_ERRORS: Record<string, string> = {
  'INSUFFICIENT_BALANCE': 'Not enough PEPPER tokens',
  'INSUFFICIENT_ALLOWANCE': 'Please approve tokens first',
  'AMOUNT_ZERO': 'Amount must be greater than 0',
  'LOCK_ACTIVE': 'Tokens are still locked',
  'USER_REJECTED': 'Transaction was cancelled',
};
```

---

### Security

- **Exact-amount approval**: Default to approving only the stake amount
- **Unlimited approval warning**: Show clear warning if user opts for max approval
- **Contract address display**: Show staking contract address for verification
- **Chain confirmation**: Display current chain before transactions
- **Stale amount guard**: Refetch balances before submitting transactions
- **Protected actions**: All writes wrapped in `useProtectedAction`

---

### Telemetry Events

| Event | Properties | When |
|-------|------------|------|
| `stake_initiated` | `{ amount, network }` | User clicks stake button |
| `stake_approved` | `{ amount, txHash }` | Approval transaction confirmed |
| `stake_submitted` | `{ amount, txHash }` | Stake transaction submitted |
| `stake_success` | `{ amount, txHash }` | Stake transaction confirmed |
| `stake_failure` | `{ amount, errorCode }` | Stake transaction failed |
| `unstake_submitted` | `{ amount, txHash }` | Unstake transaction submitted |
| `unstake_success` | `{ amount, txHash }` | Unstake confirmed |
| `claim_submitted` | `{ txHash }` | Claim transaction submitted |
| `claim_success` | `{ amount, txHash }` | Claim confirmed |

---

### Performance

- **Batch reads**: Use multicall to fetch all balances in single RPC call
- **React Query caching**: Cache staking data with appropriate stale times
- **Debounced input**: Debounce amount input to reduce re-renders
- **Optimistic updates**: Update UI optimistically on transaction submit

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['staking', address, ACTIVE_CHAIN_ID],
  queryFn: () => fetchStakingData(address),
  staleTime: 30_000, // 30 seconds
  refetchInterval: 60_000, // 1 minute
});
```

---

### Testing

#### Unit Tests
- Approve → Stake happy path
- Partial unstake flow
- Claim with zero rewards (disabled state)
- State sync after transaction confirmation
- Error mapping for common revert scenarios

#### Integration Tests
- Full stake/unstake cycle on testnet
- Network switching behavior
- Session persistence across app restarts

#### Manual QA Checklist
- [ ] Connect wallet on correct network
- [ ] Approve tokens for staking
- [ ] Stake various amounts (25/50/75/100%)
- [ ] Verify staked balance updates
- [ ] Unstake partial and full amounts
- [ ] Claim rewards when available
- [ ] Test on wrong network (should be blocked)
- [ ] Test transaction rejection handling

---

### Dependencies

#### Packages
- `ethers` (v6) - Contract interactions
- `@tanstack/react-query` - Data fetching and caching
- `@reown/appkit-react-native` - Wallet provider

#### Contract Addresses
- **PEPPER Token**: `0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67`
- **Staking Contract (Mainnet)**: `0x5cA4C88339D89B2547a001003Cca84F62F557A72`
- **Staking Contract (Testnet)**: TBD

#### RPC Endpoints
- **Mainnet**: `https://rpc.ankr.com/chiliz`
- **Testnet**: `https://spicy-rpc.chiliz.com/`

---

### Out of Scope (MVP)

- Complex auto-compounding strategies
- Multiple staking pools
- NFT-gated staking tiers
- Governance voting power from staked tokens

---

### Future Enhancements

- Gasless claim (if supported by relayer)
- Lock tiers with boosted APR
- Staking analytics and historical data
- Push notifications for reward milestones
- Social sharing of staking achievements

---

### Related Documentation

- **Wallet Connection**: See `wallet.md` for wallet integration details
- **Chain Guard**: See `useProtectedAction` hook implementation
- **Reown AppKit**: https://docs.reown.com/appkit/react-native/core/installation
- **Chiliz Chain**: https://docs.chiliz.com/

