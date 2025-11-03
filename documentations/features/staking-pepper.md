## Staking ($PEPPER) — Feature Specification

### Objective
Allow holders to approve the token, stake/unstake, and claim rewards with clear states and safeguards.

### Contracts & Functions (indicative)
- ERC-20 $PEPPER
  - `balanceOf(address)` → uint256
  - `allowance(address owner, address spender)` → uint256
  - `approve(address spender, uint256 value)` → bool
- Staking Contract
  - `stake(uint256 amount)`
  - `unstake(uint256 amount)` or `withdraw(uint256 amount)`
  - `claim()` or `getReward()`
  - Views: `stakedBalance(address)`, `earned(address)`, `totalStaked()`, optional `lockOptions()`

### Flows
1) Approve
- If allowance < amount: prompt approval. Prefer exact amount; optionally offer “max/∞” with warning.

2) Stake
- Input with balance and quick % chips (25/50/75/100%). Submit tx; show pending → success.

3) Unstake
- Input with staked balance and chips. Handle locks/cooldowns if applicable.

4) Claim Rewards
- Show claimable; disabled at 0; submit tx; refresh state post-success.

### UI
- Panels: Wallet balance, Allowance status, Staked balance, Claimable rewards.
- Action buttons: Approve, Stake, Unstake, Claim.
- If lock durations/APRs exist: selector with calculated APR notes.

### Acceptance Criteria
- Prevent over-stake/unstake; zero-amount disabled.
- Chain guard (88888) on all write actions.
- Explorer links for tx; state refresh after confirmations.

### Error Handling
- Insufficient balance/allowance → inline hints and quick actions.
- Revert codes mapped to friendly messages; retry guidance.

### Security
- Default to exact-amount approval; warn on unlimited.
- Display contract addresses; confirm chain.
- Guard against stale UI amounts (refetch before submit or use slop).

### Telemetry
- `stake_submit` {amount}
- `stake_success` {txHash}
- `stake_failure` {code}
- `claim_success` {txHash}

### Performance
- Batch reads via multicall; cache with react-query.
- Debounce input to avoid repeated formatting.

### Tests
- Approve→Stake happy path; partial unstake.
- Claim with zero guard; state sync after tx.
- Error mapping for common revert scenarios.

### Dependencies
- $PEPPER token address, Staking contract address + ABI
- Chiliz RPC 88888

### Out of Scope (MVP)
- Complex auto-compounding strategies

### Future Enhancements
- Gasless claim (if supported)
- Lock tiers with boosted APR


