# Pepper DAO - Complete Integration Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Contract Addresses & ABIs](#contract-addresses--abis)
3. [Governance Flow](#governance-flow)
4. [Reading Proposals](#reading-proposals)
5. [Voting Implementation](#voting-implementation)
6. [Integration Steps](#integration-steps)
7. [API Reference](#api-reference)
8. [Example Code Snippets](#example-code-snippets)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [Testing Checklist](#testing-checklist)

---

## 🏗️ Architecture Overview

### **System Components**

Pepper DAO uses a **multi-stage governance system** built on Aragon OSx:

```
┌─────────────────────────────────────────────────────────────┐
│                    PEPPER DAO GOVERNANCE                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         Staged Proposal Processor (Main Coordinator)         │
│           0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415        │
│  • Creates proposals                                         │
│  • Orchestrates multi-stage workflow                         │
│  • Executes approved proposals                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
              ┌───────────────┴───────────────┐
              ↓                               ↓
┌─────────────────────────┐   ┌─────────────────────────────┐
│   STAGE 1: MULTISIG     │   │ STAGE 2: TOKEN VOTING ⭐     │
│   (Admin Approval)      │   │   (Community Votes)          │
├─────────────────────────┤   ├─────────────────────────────┤
│ 0x1FecF1c23dD2E8C7...  │   │ 0x4D1a5e3AFe6d5bC9...       │
│ • Admin-only            │   │ • PEPPER token holders       │
│ • 7 days duration       │   │ • 7 days duration           │
│ • 1 approval needed     │   │ • Vote with locked tokens   │
│ • NOT for mobile users  │   │ • Yes/No/Abstain options    │
└─────────────────────────┘   └─────────────────────────────┘
                                              ↓
                              ┌───────────────────────────┐
                              │ Token Voting Implementation│
                              │ 0xf1b3ed4f41509f1661...   │
                              │ • Actual vote() function   │
                              │ • Vote tallying            │
                              │ • Member checking          │
                              └───────────────────────────┘
```

### **How It Works**

1. **Proposal Creation**: User creates proposal on Staged Processor
2. **Stage 1 (Multisig)**: Admins approve (automatically advances)
3. **Stage 2 (Token Voting)**: PEPPER holders vote Yes/No/Abstain
4. **Execution**: If passed, anyone can execute the proposal

---

## 📍 Contract Addresses & ABIs

### **1. Staged Proposal Processor (Main Coordinator)**

**Proxy (User-facing address):**
```
0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
```

**Implementation (Use this ABI):**
```
0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
```

**ABI Location:** `ARAGON_INTEGRATION_SUMMARY.md` (Staged Processor ABI)

**Key Functions:**
- `proposalCount()` → Get total proposals
- `getProposal(uint256)` → Get proposal details
- `getStages(uint256)` → Get stage configuration
- `state(uint256)` → Get proposal state
- `advanceProposal(uint256)` → Advance to next stage
- `execute(uint256)` → Execute approved proposal
- `createProposal(...)` → Create new proposal

---

### **2. Token Voting Body (Stage 2 Voting)**

**Proxy (User-facing address):**
```
0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff
```

**Implementation (Use this ABI):**
```
0xf1b3ed4f41509f1661def5518d198e0b0257ffe1
```

**Plugin Type:** Token-Based Majority Voting

**Key Functions:**
- `vote(proposalId, voter, voteOption, votingPower)` → Cast/update vote
- `canVote(proposalId, voter, voteOption)` → Check if can vote
- `getVote(proposalId, voter)` → Get user's vote
- `getProposal(proposalId)` → Get proposal with tally
- `proposalCount()` → Get total proposals
- `isMember(address)` → Check if address can vote
- `token()` → Get PEPPER token address
- `usedVotingPower(proposalId, voter)` → Get power used

---

### **3. Vote Options Enum**

```typescript
enum VoteOption {
  None = 0,      // Not voted yet
  Abstain = 1,   // Abstain from voting
  Yes = 2,       // Vote in favor
  No = 3         // Vote against
}
```

---

### **4. Proposal States**

```typescript
enum ProposalState {
  Active = 0,     // Voting is open
  Succeeded = 1,  // Passed and can be executed
  Executed = 2,   // Already executed
  Defeated = 3,   // Did not pass
  Expired = 4     // Ended without execution
}
```

---

## 🔄 Governance Flow

### **Complete Proposal Lifecycle**

```
┌─────────────────────┐
│ 1. PROPOSAL CREATED │
│   by user/admin     │
└──────────┬──────────┘
           ↓
┌─────────────────────────────┐
│ 2. STAGE 1: MULTISIG        │
│   Duration: 7 days          │
│   Threshold: 1 approval     │
│   Participants: Admins only │
└──────────┬──────────────────┘
           ↓ (Auto-advances after approval)
┌─────────────────────────────────────┐
│ 3. STAGE 2: TOKEN VOTING ⭐         │
│   Duration: 7 days                  │
│   Participants: PEPPER holders      │
│   Options: Yes / No / Abstain       │
│   Voting Power: Locked PEPPER tokens│
└──────────┬──────────────────────────┘
           ↓ (If passed)
┌─────────────────────┐
│ 4. EXECUTION        │
│   Anyone can call   │
│   execute()         │
└─────────────────────┘
```

### **For Mobile App Users**

**What Users See:**
1. List of active proposals (Stage 2 only)
2. Proposal details (title, description, votes)
3. Voting interface (Yes/No/Abstain)
4. Their voting power and vote history

**What Users Can Do:**
- ✅ View proposals in Stage 2 (Token Voting)
- ✅ Vote with their locked PEPPER tokens
- ✅ Change their vote before voting ends
- ✅ See real-time vote tallies
- ❌ Cannot participate in Stage 1 (Multisig - admin only)

---

## 📖 Reading Proposals

### **Approach 1: From Staged Processor (Main Contract)**

This gives you the **overall proposal state** but NOT the vote tallies.

```typescript
// 1. Get total proposals
const totalProposals = await readContract({
  address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415', // Proxy
  abi: STAGED_PROCESSOR_ABI,
  functionName: 'proposalCount',
});

// 2. Get specific proposal
const proposal = await readContract({
  address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
  abi: STAGED_PROCESSOR_ABI,
  functionName: 'getProposal',
  args: [proposalId],
});

// Returns:
// - allowFailureMap
// - lastStageTransition
// - currentStage (0 = Stage 1, 1 = Stage 2)
// - stageConfigIndex
// - executed (boolean)
// - canceled (boolean)
// - creator (address)
// - actions (array of actions to execute)
// - targetConfig

// 3. Get proposal state
const state = await readContract({
  address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
  abi: STAGED_PROCESSOR_ABI,
  functionName: 'state',
  args: [proposalId],
});
```

### **Approach 2: From Token Voting Body (Stage 2)**

This gives you **vote tallies and voting details**.

```typescript
// 1. Get proposal count from Token Voting
const tokenVotingProposals = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff', // Proxy
  abi: TOKEN_VOTING_ABI,
  functionName: 'proposalCount',
});

// 2. Get proposal with voting details
const votingProposal = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'getProposal',
  args: [proposalId],
});

// Returns:
// - open (boolean) - Is voting open?
// - executed (boolean) - Was it executed?
// - parameters:
//   - votingMode
//   - supportThresholdRatio
//   - startDate
//   - endDate
//   - minParticipationRatio
//   - minApprovalRatio
// - tally:
//   - abstain (uint256) - Abstain votes
//   - yes (uint256) - Yes votes
//   - no (uint256) - No votes
// - actions (array)
// - allowFailureMap
// - targetConfig
```

### **Recommended Flow for Mobile App**

```typescript
async function fetchProposalsForMobile() {
  // Step 1: Get proposals from Staged Processor
  const mainProposals = await fetchFromStagedProcessor();
  
  // Step 2: Filter for Stage 2 (Token Voting)
  const stage2Proposals = mainProposals.filter(p => p.currentStage === 1); // 0-indexed
  
  // Step 3: For each Stage 2 proposal, get voting details
  for (const proposal of stage2Proposals) {
    const bodyProposalId = await getBodyProposalId(proposal.id, 1, tokenVotingAddress);
    const votingDetails = await fetchVotingDetails(bodyProposalId);
    
    // Merge data
    proposal.tally = votingDetails.tally;
    proposal.votingOpen = votingDetails.open;
  }
  
  return stage2Proposals;
}
```

---

## 🗳️ Voting Implementation

### **Pre-Voting Checks**

Before allowing a user to vote:

```typescript
// 1. Check if user is a member (has PEPPER tokens)
const isMember = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'isMember',
  args: [userAddress],
});

// 2. Check if proposal is open
const proposal = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'getProposal',
  args: [proposalId],
});

if (!proposal.open) {
  throw new Error('Voting is closed');
}

// 3. Check if user can vote with specific option
const canVoteYes = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'canVote',
  args: [proposalId, userAddress, 2], // VoteOption.Yes
});

// 4. Get user's current vote (if any)
const currentVote = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'getVote',
  args: [proposalId, userAddress],
});

// Returns: { voteOption: 0-3, votingPower: uint256 }
```

### **Casting a Vote**

```typescript
// Parameters:
// - proposalId: The proposal ID in the Token Voting contract
// - voter: The address of the voter (msg.sender in most cases)
// - voteOption: 0=None, 1=Abstain, 2=Yes, 3=No
// - votingPower: Amount of voting power to use (locked PEPPER tokens)

await writeContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'vote',
  args: [
    proposalId,      // uint256
    userAddress,     // address
    voteOption,      // VoteOption enum (0-3)
    votingPower      // uint256 - use all available power
  ],
});

// Event emitted:
// VoteCast(proposalId, voter, voteOption, votingPower)
```

### **Getting Voting Power**

The voting power comes from **locked PEPPER tokens**. The exact mechanism depends on the `lockManager` contract:

```typescript
// Get the lock manager address
const lockManager = await readContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'lockManager',
});

// The lock manager determines voting power
// This likely tracks staked/locked PEPPER tokens
// You'll need to query the lock manager for user's voting power
```

### **Changing a Vote**

Users can change their vote while voting is open:

```typescript
// Just call vote() again with different option
await writeContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'vote',
  args: [proposalId, userAddress, newVoteOption, votingPower],
});

// The new vote replaces the old one
// Event: VoteCast will be emitted again
```

### **Removing a Vote (Optional)**

```typescript
// Clear your vote (if allowed)
await writeContract({
  address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
  abi: TOKEN_VOTING_ABI,
  functionName: 'clearVote',
  args: [proposalId, voterAddress],
});

// Event: VoteCleared(proposalId, voter)
```

---

## 🔧 Integration Steps

### **Phase 1: Read-Only Implementation (Week 1)**

**Goal:** Display proposals and vote tallies

**Tasks:**
1. ✅ Create contract configuration file
   - Store all addresses
   - Import both ABIs (Staged Processor + Token Voting)

2. ✅ Implement `fetchProposals()` function
   - Query Staged Processor for all proposals
   - Filter for Stage 2 (Token Voting)
   - Fetch voting details from Token Voting contract
   - Merge data and return

3. ✅ Implement `fetchProposalDetails(proposalId)` function
   - Get full proposal data
   - Get vote tally
   - Calculate percentages

4. ✅ Create UI components
   - ProposalList screen
   - ProposalCard component
   - VoteTally display
   - ProposalDetails screen

5. ✅ Handle IPFS metadata
   - Proposals have metadata URI (IPFS hash)
   - Fetch title/description from IPFS
   - Cache metadata locally

**Acceptance Criteria:**
- [ ] App displays list of active proposals
- [ ] Each proposal shows title, description, vote counts
- [ ] Vote percentages are calculated correctly
- [ ] Proposal status is clear (Active, Passed, Failed)

---

### **Phase 2: Voting Implementation (Week 2)**

**Goal:** Users can vote with PEPPER tokens

**Tasks:**
1. ✅ Implement wallet connection
   - WalletConnect integration
   - Check if user has PEPPER tokens
   - Display user's voting power

2. ✅ Implement `vote()` function
   - Pre-voting checks
   - Transaction signing
   - Error handling
   - Success feedback

3. ✅ Implement voting UI
   - Vote buttons (Yes/No/Abstain)
   - Voting power display
   - Transaction status
   - Vote confirmation

4. ✅ Show user's vote history
   - Check if user has voted
   - Display their current vote
   - Allow vote changes

5. ✅ Real-time updates
   - Listen for VoteCast events
   - Update tally when new votes come in
   - Refresh proposal status

**Acceptance Criteria:**
- [ ] Users can connect wallet
- [ ] Users can see their voting power
- [ ] Users can vote (Yes/No/Abstain)
- [ ] Users can change their vote
- [ ] Transaction errors are handled gracefully
- [ ] Vote tallies update in real-time

---

### **Phase 3: Polish & Testing (Week 3)**

**Goal:** Production-ready governance module

**Tasks:**
1. ✅ Error handling
   - Network errors
   - Transaction failures
   - Insufficient gas
   - User rejections

2. ✅ Loading states
   - Skeleton screens
   - Spinners during transactions
   - Optimistic updates

3. ✅ Notifications
   - Vote submitted successfully
   - Proposal executed
   - Voting period ending soon

4. ✅ Testing
   - Unit tests for contract interactions
   - Integration tests
   - E2E testing on testnet
   - User acceptance testing

5. ✅ Documentation
   - User guide
   - FAQ
   - Troubleshooting

**Acceptance Criteria:**
- [ ] All error cases handled
- [ ] Smooth UX with loading states
- [ ] Users receive notifications
- [ ] All tests passing
- [ ] Documentation complete

---

## 📚 API Reference

### **Staged Proposal Processor Functions**

#### `proposalCount() → uint256`
Returns the total number of proposals created.

#### `getProposal(uint256 _proposalId) → Proposal`
Returns proposal details:
- `allowFailureMap`: Bitmask for action failures
- `lastStageTransition`: Timestamp of last stage change
- `currentStage`: 0 = Stage 1 (Multisig), 1 = Stage 2 (Token Voting)
- `stageConfigIndex`: Configuration version used
- `executed`: Has been executed?
- `canceled`: Has been canceled?
- `creator`: Proposal creator address
- `actions`: Array of actions to execute
- `targetConfig`: Execution target configuration

#### `state(uint256 _proposalId) → ProposalState`
Returns current state (Active, Succeeded, Executed, Defeated, Expired).

#### `advanceProposal(uint256 _proposalId)`
Move proposal to next stage (if conditions met).

#### `execute(uint256 _proposalId)`
Execute the proposal (if passed and in final stage).

---

### **Token Voting Functions**

#### `proposalCount() → uint256`
Returns total proposals in THIS voting body (Stage 2).

#### `getProposal(uint256 _proposalId) → (bool open, bool executed, ProposalParameters, Tally, Action[], uint256, TargetConfig)`
Returns complete proposal data including:
- `open`: Is voting currently open?
- `executed`: Has been executed?
- `parameters`: Voting parameters (thresholds, dates)
- `tally`: Vote counts (`abstain`, `yes`, `no`)
- `actions`: Actions to execute
- `allowFailureMap`: Failure handling
- `targetConfig`: Execution target

#### `vote(uint256 _proposalId, address _voter, VoteOption _voteOption, uint256 _newVotingPower)`
Cast or update vote.
- `_proposalId`: Proposal to vote on
- `_voter`: Voter address (usually msg.sender)
- `_voteOption`: 0=None, 1=Abstain, 2=Yes, 3=No
- `_newVotingPower`: Amount of voting power to use

**Emits:** `VoteCast(proposalId, voter, voteOption, votingPower)`

#### `canVote(uint256 _proposalId, address _voter, VoteOption _voteOption) → bool`
Check if voter can vote with specified option.

#### `getVote(uint256 _proposalId, address _voter) → (VoteOption, uint256)`
Returns voter's current vote and voting power used.

#### `isMember(address _account) → bool`
Check if address is eligible to vote (has PEPPER tokens).

#### `isProposalOpen(uint256 _proposalId) → bool`
Check if voting is currently open.

#### `hasSucceeded(uint256 _proposalId) → bool`
Check if proposal has passed all thresholds.

#### `token() → address`
Returns the PEPPER token contract address.

#### `lockManager() → address`
Returns the lock manager contract (handles staking/voting power).

#### `usedVotingPower(uint256 _proposalId, address _voter) → uint256`
Returns voting power used by voter on this proposal.

---

## 💡 Example Code Snippets

### **Fetching and Displaying Proposals**

```typescript
import { readContract } from 'wagmi';

async function fetchActiveProposals() {
  // 1. Get proposals from Staged Processor
  const count = await readContract({
    address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
    abi: STAGED_PROCESSOR_ABI,
    functionName: 'proposalCount',
  });

  const proposals = [];
  
  for (let i = 0; i < count; i++) {
    const proposal = await readContract({
      address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
      abi: STAGED_PROCESSOR_ABI,
      functionName: 'getProposal',
      args: [BigInt(i)],
    });

    // Only show Stage 2 proposals (Token Voting)
    if (proposal.currentStage === 1 && !proposal.executed && !proposal.canceled) {
      // Get voting details from Token Voting contract
      const bodyProposalId = await getBodyProposalId(i);
      const votingDetails = await readContract({
        address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
        abi: TOKEN_VOTING_ABI,
        functionName: 'getProposal',
        args: [bodyProposalId],
      });

      proposals.push({
        id: i,
        creator: proposal.creator,
        stage: 'Token Voting',
        open: votingDetails.open,
        tally: {
          yes: votingDetails.tally.yes,
          no: votingDetails.tally.no,
          abstain: votingDetails.tally.abstain,
        },
        startDate: votingDetails.parameters.startDate,
        endDate: votingDetails.parameters.endDate,
      });
    }
  }

  return proposals;
}
```

### **Casting a Vote**

```typescript
import { writeContract } from 'wagmi';

async function voteOnProposal(proposalId: number, voteOption: number, userAddress: string) {
  // 1. Pre-flight checks
  const canVote = await readContract({
    address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
    abi: TOKEN_VOTING_ABI,
    functionName: 'canVote',
    args: [BigInt(proposalId), userAddress, voteOption],
  });

  if (!canVote) {
    throw new Error('Cannot vote on this proposal');
  }

  // 2. Get voting power (simplified - you need actual lock manager query)
  const votingPower = await getUserVotingPower(userAddress);

  // 3. Cast vote
  const tx = await writeContract({
    address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
    abi: TOKEN_VOTING_ABI,
    functionName: 'vote',
    args: [BigInt(proposalId), userAddress, voteOption, votingPower],
  });

  // 4. Wait for confirmation
  await tx.wait();

  return { success: true, transactionHash: tx.hash };
}
```

### **Checking User's Vote**

```typescript
async function getUserVoteStatus(proposalId: number, userAddress: string) {
  const vote = await readContract({
    address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
    abi: TOKEN_VOTING_ABI,
    functionName: 'getVote',
    args: [BigInt(proposalId), userAddress],
  });

  return {
    hasVoted: vote.voteOption !== 0,
    voteOption: vote.voteOption, // 0=None, 1=Abstain, 2=Yes, 3=No
    votingPowerUsed: vote.votingPower,
  };
}
```

---

## 🎨 UI/UX Guidelines

### **Proposal List Screen**

**Display:**
- Proposal title (from IPFS metadata)
- Current status badge (Active, Passed, Failed, Executed)
- Vote tally bar chart (Yes%, No%, Abstain%)
- Time remaining (e.g., "5 days left")
- User's vote indicator (if voted)

**Interactions:**
- Tap proposal → Go to detail screen
- Pull to refresh proposals
- Filter: Active / Ended / All

**Example Layout:**
```
┌────────────────────────────────────┐
│ Active Proposals                   │
├────────────────────────────────────┤
│ 📋 Treasury Allocation Proposal    │
│ Status: Active • 5 days left       │
│ ▓▓▓▓▓▓▓▓▓▓░░░░ 75% Yes  🗳️ Voted  │
│ ░░░░░░░░░░░░░░ 20% No             │
│ ░░░░░░░░░░░░░░  5% Abstain        │
└────────────────────────────────────┘
```

---

### **Proposal Detail Screen**

**Display:**
- Full proposal title and description
- Proposer address (truncated)
- Voting period (start → end dates)
- Current tally with numbers and percentages
- Actions that will be executed
- User's voting power
- User's current vote (if any)

**Interactions:**
- Vote buttons (Yes / No / Abstain)
- Change vote button (if already voted)
- Share proposal link
- View on Aragon website (external link)

**Example Layout:**
```
┌────────────────────────────────────┐
│ ← Treasury Allocation Proposal     │
├────────────────────────────────────┤
│ Allocate 100,000 PEPPER tokens    │
│ for development grants...          │
│                                    │
│ Proposed by: 0x1234...5678         │
│ Voting: Dec 1 - Dec 8             │
├────────────────────────────────────┤
│ Current Results:                   │
│ ✅ Yes: 750,000 PEPPER (75%)       │
│ ❌ No:  200,000 PEPPER (20%)       │
│ ⚪ Abstain: 50,000 PEPPER (5%)     │
│                                    │
│ Your Voting Power: 10,000 PEPPER  │
│ You voted: ✅ Yes                  │
├────────────────────────────────────┤
│ [Change Vote]  [View on Aragon]   │
└────────────────────────────────────┘
```

---

### **Voting Flow**

**Step 1: Connect Wallet**
```
┌────────────────────────────────────┐
│ 🔒 Connect Wallet to Vote          │
│                                    │
│ [Connect Wallet]                   │
└────────────────────────────────────┘
```

**Step 2: Choose Vote**
```
┌────────────────────────────────────┐
│ How do you vote?                   │
│                                    │
│ [✅ Yes]  [❌ No]  [⚪ Abstain]     │
│                                    │
│ Voting Power: 10,000 PEPPER        │
└────────────────────────────────────┘
```

**Step 3: Confirm Transaction**
```
┌────────────────────────────────────┐
│ ⏳ Confirm in your wallet...        │
│                                    │
│ Transaction Details:               │
│ • Action: Vote Yes                 │
│ • Voting Power: 10,000 PEPPER      │
│ • Estimated Gas: ~$0.50            │
└────────────────────────────────────┘
```

**Step 4: Success**
```
┌────────────────────────────────────┐
│ ✅ Vote Submitted!                  │
│                                    │
│ Your Yes vote has been recorded   │
│ with 10,000 PEPPER voting power   │
│                                    │
│ [View Transaction]  [Done]         │
└────────────────────────────────────┘
```

---

## ✅ Testing Checklist

### **Read-Only Features**

- [ ] Fetch total proposal count
- [ ] Fetch individual proposal details
- [ ] Display proposal title/description from IPFS
- [ ] Show accurate vote tallies
- [ ] Calculate vote percentages correctly
- [ ] Show proposal status (Active/Passed/Failed)
- [ ] Display time remaining for active proposals
- [ ] Handle proposals with no votes
- [ ] Handle executed proposals
- [ ] Handle canceled proposals

### **Voting Features**

- [ ] Connect wallet successfully
- [ ] Check if user has PEPPER tokens
- [ ] Display user's voting power correctly
- [ ] Allow voting Yes on active proposal
- [ ] Allow voting No on active proposal
- [ ] Allow voting Abstain on active proposal
- [ ] Prevent voting on closed proposals
- [ ] Prevent voting without tokens
- [ ] Allow changing vote
- [ ] Show user's current vote
- [ ] Update tally after vote
- [ ] Handle transaction rejection
- [ ] Handle insufficient gas
- [ ] Handle network errors
- [ ] Show transaction in progress
- [ ] Confirm transaction success

### **Edge Cases**

- [ ] User has no PEPPER tokens
- [ ] User wallet disconnects mid-flow
- [ ] Proposal ends while user is voting
- [ ] Network switches during transaction
- [ ] Multiple votes in quick succession
- [ ] Very large numbers (voting power)
- [ ] Proposal with 0 votes
- [ ] Proposal at exactly 50/50 split

### **Performance**

- [ ] Proposals load within 3 seconds
- [ ] Vote transaction completes within 30 seconds
- [ ] App doesn't freeze during RPC calls
- [ ] Handles 100+ proposals
- [ ] Efficient caching of IPFS metadata
- [ ] Real-time updates don't slow down app

---

## 🚀 Deployment Checklist

### **Pre-Launch**

- [ ] All ABIs are correct and up to date
- [ ] Contract addresses are correct for Chiliz mainnet
- [ ] IPFS gateway is configured
- [ ] RPC endpoint is reliable (not public node)
- [ ] Error tracking is set up (Sentry, etc.)
- [ ] Analytics are configured
- [ ] User documentation is ready
- [ ] FAQ is published
- [ ] Support channel is ready

### **Launch Day**

- [ ] Monitor RPC performance
- [ ] Watch for transaction failures
- [ ] Track user adoption metrics
- [ ] Respond to user feedback quickly
- [ ] Have rollback plan ready

### **Post-Launch**

- [ ] Gather user feedback
- [ ] Monitor gas costs
- [ ] Track voting participation rates
- [ ] Optimize slow queries
- [ ] Plan feature improvements

---

## 📞 Support & Resources

### **Aragon Resources**

- **OSX Docs:** https://docs.aragon.org/osx-contracts/
- **IProposal Interface:** https://github.com/aragon/osx-commons/
- **Aragon App:** https://app.aragon.org/

### **Chiliz Resources**

- **Chiliscan:** https://chiliscan.com/
- **Chiliz RPC:** https://rpc.ankr.com/chiliz
- **Chain ID:** 88888

### **Contract Explorers**

- **Staged Processor:** https://chiliscan.com/address/0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
- **Token Voting:** https://chiliscan.com/address/0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff

---

## 📝 Next Steps

1. **Review this documentation** with your team
2. **Create implementation tasks** from the Integration Steps
3. **Set up development environment** with contract addresses and ABIs
4. **Start with Phase 1** (Read-Only implementation)
5. **Test thoroughly** on Chiliz mainnet (or testnet if available)
6. **Proceed to Phase 2** (Voting implementation)
7. **Polish and launch** 🚀

---

**Document Version:** 1.0
**Last Updated:** December 17, 2024
**Status:** Ready for Implementation ✅
