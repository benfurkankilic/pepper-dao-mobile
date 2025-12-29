# Governance (Aragon) — Feature Specification

**Feature:** Aragon DAO Governance Integration  
**Platform:** React Native (Expo)  
**Chain:** Chiliz (88888)  
**Last Updated:** December 17, 2024  
**Status:** Ready for Implementation ✅

---

## 📋 Overview

Enable PEPPER token holders to participate in DAO governance through a mobile-first interface. Users can browse active proposals, view detailed voting results, and cast votes using their locked PEPPER tokens.

### Key Capabilities

- ✅ Browse active governance proposals
- ✅ View proposal details with IPFS metadata
- ✅ Lock PEPPER tokens to vote (Lock-to-Vote mechanism)
- ✅ Cast votes (Yes/No/Abstain)
- ✅ Track voting history
- ✅ Monitor proposal status in real-time

---

## 🏗️ Governance Architecture

### **2-Stage Governance Flow**

Pepper DAO uses a **2-stage governance system** built on Aragon OSx:

```
Proposal Created
        ↓
┌─────────────────────────────────────────┐
│ STAGE 1: SPICY MINISTER APPROVAL        │
│                                         │
│ • 3 Spicy Ministers                    │
│ • Threshold: 2 out of 3 approvals     │
│ • Duration: 7 days                     │
│ • Multisig mechanism                   │
│ • Not visible to regular users         │
└─────────────┬───────────────────────────┘
              ↓ Auto-advances after 2/3 approval
┌─────────────────────────────────────────┐
│ STAGE 2: PUBLIC GOVERNANCE              │
│         (Lock-to-Vote)                  │
│                                         │
│ • All PEPPER token holders             │
│ • Lock tokens to vote                  │
│ • Voting Power = Locked PEPPER amount  │
│ • Duration: 7 days                     │
│ • Options: Yes / No / Abstain          │
│ • Tokens unlock after vote ends        │
└─────────────┬───────────────────────────┘
              ↓ If passed (majority Yes)
┌─────────────────────────────────────────┐
│ EXECUTION                               │
│ Anyone can call execute()               │
└─────────────────────────────────────────┘
```

### **Mobile App Scope**

**In Scope:**
- ✅ Stage 2 (Public Governance) proposals
- ✅ Voting interface for token holders
- ✅ Proposal details and vote tallies

**Out of Scope (Stage 1 Admin-Only):**
- ❌ Spicy Minister voting UI
- ❌ Stage 1 proposals (not shown to regular users)
- ❌ Proposal creation (admin only)

---

## 🔧 Technical Implementation

### **Smart Contracts**

| Contract | Proxy Address | Purpose |
|----------|---------------|---------|
| **Staged Proposal Processor** | `0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415` | Main governance orchestrator |
| **Token Voting** | `0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff` | Community voting (Stage 2) |

**Implementation ABIs Required:**
- Staged Processor Implementation: `0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135`
- Token Voting Implementation: `0xf1b3ed4f41509f1661def5518d198e0b0257ffe1`

**⚠️ Critical:** Use implementation ABIs with proxy addresses (not proxy ABIs)

### **Core Dependencies**

```json
{
  "viem": "^2.x",
  "wagmi": "^2.x",
  "@tanstack/react-query": "^5.x"
}
```

### **Contract Configuration**

```typescript
// config/aragon-contracts.ts
export const ARAGON_CONTRACTS = {
  stagedProcessor: {
    address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415' as const,
    abi: STAGED_PROCESSOR_ABI,
  },
  tokenVoting: {
    address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff' as const,
    abi: TOKEN_VOTING_ABI,
  },
} as const;

export const CHAIN_ID = 88888; // Chiliz
```

---

## 🎯 User Stories

### **As a PEPPER holder, I want to...**

1. **View Active Proposals**
   - See all Stage 2 (Public Governance) proposals
   - Filter by status (Active/Passed/Failed)
   - Sort by creation date or ending soon

2. **Read Proposal Details**
   - View full proposal title and description (from IPFS)
   - See current vote tallies (Yes/No/Abstain)
   - Check time remaining to vote
   - View voting parameters (quorum, approval threshold)

3. **Lock PEPPER to Vote**
   - Select vote option (Yes/No/Abstain)
   - Choose amount of PEPPER to lock
   - See clear message: "Tokens will be locked until [end date]"
   - Confirm transaction in wallet

4. **Track My Votes**
   - View proposals I've voted on
   - See my vote option and locked amount
   - Know when tokens will unlock
   - Change my vote (re-locks same amount)

5. **Monitor Proposal Status**
   - Real-time vote count updates
   - Progress bars for Yes/No/Abstain
   - Countdown timer for active proposals
   - Final status (Passed/Failed/Executed)

---

## 📱 UI/UX Specifications

### **List View: Proposals Screen**

**Location:** Main tab navigation

**Layout:**
```
┌─────────────────────────────────────┐
│ 🎯 Governance                       │
│                                     │
│ [All] [Active] [Passed] [Failed]   │ ← Filter chips
│                                     │
│ ┌───────────────────────────────┐  │
│ │ 🟢 ACTIVE          5d 12h left│  │
│ │ Proposal #42                  │  │
│ │ Increase Token Rewards        │  │
│ │                               │  │
│ │ ████░░░░░░ 42% Yes  24% No    │  │ ← Vote bars
│ │ 1.2M PEPPER locked • 89 votes │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ ⏸️ VOTING          3d 2h left │  │
│ │ Proposal #41                  │  │
│ │ Update DAO Constitution       │  │
│ │ ...                           │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Card Components:**
- Status badge (Active/Passed/Failed with color)
- Time remaining (countdown)
- Proposal title (truncated to 2 lines)
- Vote progress bars (Yes/No/Abstain)
- Participation stats (total locked, vote count)
- Tap to open details

**Empty State:**
```
┌─────────────────────────────────────┐
│          🗳️                         │
│    No Active Proposals              │
│                                     │
│  Check back soon for new            │
│  governance proposals!              │
└─────────────────────────────────────┘
```

### **Detail View: Proposal Details Screen**

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Back                              │
│                                     │
│ Proposal #42                        │
│ 🟢 ACTIVE • 5d 12h left            │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ 📝 Description                     │
│ This proposal suggests increasing   │
│ the token rewards for active        │
│ participants by 20% to encourage... │
│ [Read more ↓]                       │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ 📊 Voting Results                  │
│                                     │
│ ✅ YES  42% ████████░░░░░░  504K   │
│ ❌ NO   24% █████░░░░░░░░░  288K   │
│ ⚪ ABSTAIN 8% ██░░░░░░░░░░   96K   │
│                                     │
│ Total Locked: 1,200,000 PEPPER      │
│ Votes Cast: 89 addresses            │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ ⚙️ Parameters                      │
│ • Min Participation: 15%            │
│ • Approval Threshold: 50%           │
│ • Voting Period: 7 days             │
│                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│ [   Lock PEPPER to Vote   ]        │ ← Primary CTA
│                                     │
└─────────────────────────────────────┘
```

**Sections:**
1. **Header:**
   - Proposal ID and title
   - Status badge and countdown
   - Created date

2. **Description:**
   - Rich text from IPFS
   - Expandable if long
   - External links (open in browser)

3. **Voting Results:**
   - Progress bars for each option
   - Percentages and absolute amounts
   - Total participation stats

4. **Parameters:**
   - Min participation threshold
   - Approval threshold
   - Voting period
   - Start/end dates

5. **Action Button:**
   - Primary: "Lock PEPPER to Vote"
   - If already voted: "You voted [option] • Change Vote"
   - If ended: "Voting Ended • View Results"

### **Voting Flow Modal**

**Step 1: Select Option**
```
┌─────────────────────────────────────┐
│ Cast Your Vote                      │
│                                     │
│ Select your vote:                   │
│                                     │
│ ⭘ ✅ YES                           │
│   I support this proposal           │
│                                     │
│ ⭘ ❌ NO                            │
│   I oppose this proposal            │
│                                     │
│ ⭘ ⚪ ABSTAIN                       │
│   I choose to abstain               │
│                                     │
│              [Next]                 │
└─────────────────────────────────────┘
```

**Step 2: Lock Amount**
```
┌─────────────────────────────────────┐
│ Lock PEPPER Tokens                  │
│                                     │
│ Your PEPPER Balance: 10,000         │
│ Currently Locked: 2,500             │
│ Available: 7,500                    │
│                                     │
│ ┌─────────────────────────────┐    │
│ │ Amount to Lock              │    │
│ │ [     5,000     ] PEPPER    │    │ ← Input
│ │ [25%] [50%] [75%] [MAX]     │    │ ← Quick select
│ └─────────────────────────────┘    │
│                                     │
│ ⚠️ Your tokens will be locked       │
│    until: Dec 24, 2024 14:30       │
│                                     │
│ Voting Power: 5,000                 │
│                                     │
│     [Cancel]  [Confirm Vote]        │
└─────────────────────────────────────┘
```

**Step 3: Transaction Confirmation**
```
┌─────────────────────────────────────┐
│ ⏳ Confirming Transaction...        │
│                                     │
│ Please confirm in your wallet       │
│                                     │
│ Voting: YES                         │
│ Locking: 5,000 PEPPER               │
│ Until: Dec 24, 2024                 │
│                                     │
│          [●●●●●●○○○○]              │
└─────────────────────────────────────┘
```

**Step 4: Success**
```
┌─────────────────────────────────────┐
│ ✅ Vote Submitted!                  │
│                                     │
│ Your vote has been recorded:        │
│                                     │
│ • Vote: YES                         │
│ • Locked: 5,000 PEPPER              │
│ • Unlocks: Dec 24, 2024 14:30      │
│                                     │
│ [View on Explorer]                  │
│                                     │
│      [Back to Proposals]            │
└─────────────────────────────────────┘
```

---

## 🔐 Access Control & Permissions

### **Read-Only (No Wallet)**
- ✅ View proposal list
- ✅ View proposal details
- ✅ View vote tallies
- ❌ Cannot vote

### **Connected Wallet (No PEPPER)**
- ✅ All read-only features
- ❌ Cannot vote (no voting power)
- ℹ️ Show message: "Lock PEPPER tokens to participate"

### **Connected Wallet (Has PEPPER)**
- ✅ All features
- ✅ Can lock PEPPER and vote
- ✅ Can change vote (re-locks)
- ✅ Can view locked balances

### **Voting Eligibility Checks**

```typescript
// Check before showing vote button
async function canUserVote(proposalId: bigint, userAddress: string): Promise<boolean> {
  // 1. Check if proposal is open
  const proposal = await getProposal(proposalId);
  if (!proposal.open) return false;
  
  // 2. Check if user is a member (has PEPPER)
  const isMember = await readContract({
    address: ARAGON_CONTRACTS.tokenVoting.address,
    abi: ARAGON_CONTRACTS.tokenVoting.abi,
    functionName: 'isMember',
    args: [userAddress],
  });
  
  return isMember;
}
```

---

## 📊 Data Schema

### **Proposal (from Staged Processor)**

```typescript
interface Proposal {
  id: number;
  creator: `0x${string}`;
  currentStage: number; // 0=Stage1, 1=Stage2
  lastStageTransition: bigint; // Timestamp
  executed: boolean;
  canceled: boolean;
  actions: Array<Action>;
  targetConfig: TargetConfig;
  
  // Computed fields
  status: 'active' | 'passed' | 'failed' | 'executed';
  timeRemaining: number; // seconds
  endDate: Date;
}
```

### **Vote Details (from Token Voting)**

```typescript
interface ProposalVoteDetails {
  open: boolean;
  executed: boolean;
  parameters: {
    votingMode: number;
    supportThresholdRatio: number;
    startDate: bigint;
    endDate: bigint;
    minParticipationRatio: bigint;
    minApprovalRatio: bigint;
  };
  tally: {
    abstain: bigint;
    yes: bigint;
    no: bigint;
  };
  actions: Array<Action>;
}
```

### **User Vote Entry**

```typescript
interface UserVote {
  proposalId: number;
  voteOption: VoteOption; // 0=None, 1=Abstain, 2=Yes, 3=No
  votingPower: bigint; // Locked PEPPER amount
  timestamp: Date;
}
```

### **Vote Option Enum**

```typescript
enum VoteOption {
  None = 0,
  Abstain = 1,
  Yes = 2,
  No = 3,
}
```

---

## 🔄 Data Flow & State Management

### **Proposal List**

```typescript
// hooks/use-proposals.ts
function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      // 1. Get total proposal count
      const count = await readContract({
        address: ARAGON_CONTRACTS.stagedProcessor.address,
        abi: ARAGON_CONTRACTS.stagedProcessor.abi,
        functionName: 'proposalCount',
      });
      
      // 2. Fetch all proposals
      const proposals = [];
      for (let i = 0; i < count; i++) {
        const proposal = await readContract({
          address: ARAGON_CONTRACTS.stagedProcessor.address,
          abi: ARAGON_CONTRACTS.stagedProcessor.abi,
          functionName: 'getProposal',
          args: [BigInt(i)],
        });
        
        // Only show Stage 2 (Public Governance) proposals
        if (proposal.currentStage === 1) {
          proposals.push(transformProposal(proposal, i));
        }
      }
      
      return proposals;
    },
    staleTime: 30_000, // 30 seconds
  });
}
```

### **Proposal Details**

```typescript
// hooks/use-proposal-details.ts
function useProposalDetails(proposalId: number) {
  return useQueries({
    queries: [
      {
        queryKey: ['proposal', proposalId],
        queryFn: () => getProposal(proposalId),
      },
      {
        queryKey: ['proposal-metadata', proposalId],
        queryFn: () => fetchIPFSMetadata(proposalId),
      },
      {
        queryKey: ['proposal-votes', proposalId],
        queryFn: () => getVoteDetails(proposalId),
      },
    ],
  });
}
```

### **User Vote Status**

```typescript
// hooks/use-user-vote.ts
function useUserVote(proposalId: number) {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: ['user-vote', proposalId, address],
    queryFn: async () => {
      if (!address) return null;
      
      return await readContract({
        address: ARAGON_CONTRACTS.tokenVoting.address,
        abi: ARAGON_CONTRACTS.tokenVoting.abi,
        functionName: 'getVote',
        args: [BigInt(proposalId), address],
      });
    },
    enabled: !!address,
  });
}
```

### **Voting Action**

```typescript
// hooks/use-vote.ts
function useVote() {
  const queryClient = useQueryClient();
  
  const { writeContractAsync } = useWriteContract();
  
  return useMutation({
    mutationFn: async ({ 
      proposalId, 
      voteOption, 
      votingPower 
    }: VoteParams) => {
      return await writeContractAsync({
        address: ARAGON_CONTRACTS.tokenVoting.address,
        abi: ARAGON_CONTRACTS.tokenVoting.abi,
        functionName: 'vote',
        args: [
          BigInt(proposalId),
          address as `0x${string}`,
          voteOption,
          votingPower,
        ],
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ 
        queryKey: ['proposal-votes', variables.proposalId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user-vote', variables.proposalId] 
      });
    },
  });
}
```

---

## 🧪 Testing Requirements

### **Unit Tests**

```typescript
describe('Governance', () => {
  describe('Proposal Display', () => {
    it('displays only Stage 2 proposals', () => {});
    it('filters out executed proposals', () => {});
    it('calculates time remaining correctly', () => {});
    it('shows correct status badges', () => {});
  });
  
  describe('Vote Calculations', () => {
    it('calculates vote percentages correctly', () => {});
    it('handles zero votes gracefully', () => {});
    it('formats large numbers correctly', () => {});
  });
  
  describe('Voting Eligibility', () => {
    it('allows voting when proposal is open', () => {});
    it('prevents voting on closed proposals', () => {});
    it('checks user PEPPER balance', () => {});
    it('validates lock amount', () => {});
  });
});
```

### **Integration Tests**

```typescript
describe('Voting Flow', () => {
  it('completes full voting flow', async () => {
    // 1. Load proposals
    const proposals = await getProposals();
    expect(proposals.length).toBeGreaterThan(0);
    
    // 2. Select proposal
    const proposal = proposals[0];
    expect(proposal.currentStage).toBe(1);
    
    // 3. Check eligibility
    const canVote = await canUserVote(proposal.id, userAddress);
    expect(canVote).toBe(true);
    
    // 4. Cast vote
    const tx = await vote(proposal.id, VoteOption.Yes, lockAmount);
    expect(tx).toBeDefined();
    
    // 5. Verify vote recorded
    const userVote = await getUserVote(proposal.id, userAddress);
    expect(userVote.voteOption).toBe(VoteOption.Yes);
  });
});
```

### **E2E Tests**

- ✅ User can browse proposals without wallet
- ✅ User can connect wallet and see voting button
- ✅ User can complete vote transaction
- ✅ Vote appears in user's history
- ✅ Proposal tally updates after vote
- ✅ User can change vote
- ✅ Locked tokens display correctly

---

## 🚨 Error Handling

### **Common Errors**

| Error | Cause | User Message | Action |
|-------|-------|--------------|--------|
| **Not Eligible** | No PEPPER tokens | "You need PEPPER tokens to vote" | Show link to token info |
| **Already Voted** | Same option again | "You've already voted [option]" | Show "Change Vote" option |
| **Proposal Closed** | Voting period ended | "Voting has ended for this proposal" | Disable vote button |
| **Insufficient Balance** | Not enough PEPPER | "Insufficient PEPPER balance" | Show current balance |
| **Transaction Failed** | Network/gas issue | "Transaction failed. Please try again" | Retry button |
| **RPC Error** | Chiliz RPC down | "Unable to connect. Check your connection" | Retry button |
| **Wrong Network** | Not on Chiliz | "Please switch to Chiliz network" | Network switcher |

### **Error Handling Pattern**

```typescript
try {
  await vote(proposalId, voteOption, votingPower);
  showSuccess('Vote submitted successfully!');
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    showInfo('Transaction cancelled');
  } else if (error.message.includes('not eligible')) {
    showError('You are not eligible to vote', 'Get PEPPER');
  } else if (error.message.includes('already voted')) {
    showError('You already voted', 'Change Vote');
  } else {
    showError('Vote failed', 'Try Again');
    logError('vote_failed', { proposalId, error });
  }
}
```

---

## 🔒 Security Considerations

### **Chain Validation**

```typescript
// Always verify chain ID before transactions
if (chain?.id !== CHAIN_ID) {
  throw new Error('Wrong network. Please switch to Chiliz');
}
```

### **Address Validation**

```typescript
// Validate contract addresses match expected values
function validateContractAddress(address: string) {
  const validAddresses = [
    ARAGON_CONTRACTS.stagedProcessor.address,
    ARAGON_CONTRACTS.tokenVoting.address,
  ];
  
  if (!validAddresses.includes(address.toLowerCase())) {
    throw new Error('Invalid contract address');
  }
}
```

### **Input Sanitization**

```typescript
// Sanitize voting power input
function sanitizeLockAmount(amount: string, maxBalance: bigint): bigint {
  const parsed = parseUnits(amount, 18);
  
  if (parsed <= 0n) {
    throw new Error('Amount must be greater than 0');
  }
  
  if (parsed > maxBalance) {
    throw new Error('Amount exceeds balance');
  }
  
  return parsed;
}
```

### **Transaction Display**

```typescript
// Always show transaction details before confirming
<TransactionPreview>
  <Row label="Action" value="Vote on Proposal" />
  <Row label="Proposal ID" value={proposalId} />
  <Row label="Vote Option" value={voteOptionLabel} />
  <Row label="Locking Amount" value={`${lockAmount} PEPPER`} />
  <Row label="Unlock Date" value={formatDate(unlockDate)} />
  <Row label="Contract" value={truncateAddress(contractAddress)} />
  <Row label="Network" value="Chiliz (88888)" />
</TransactionPreview>
```

---

## 📈 Analytics & Telemetry

### **Events to Track**

```typescript
// View events
analytics.track('proposals_list_viewed', {
  filter: 'active' | 'all' | 'passed' | 'failed',
  count: number,
});

analytics.track('proposal_detail_viewed', {
  proposalId: number,
  status: string,
  currentStage: number,
});

// Interaction events
analytics.track('vote_button_clicked', {
  proposalId: number,
  hasWallet: boolean,
  hasPepper: boolean,
});

analytics.track('vote_option_selected', {
  proposalId: number,
  voteOption: VoteOption,
});

analytics.track('lock_amount_entered', {
  proposalId: number,
  amount: string,
  percentageOfBalance: number,
});

// Transaction events
analytics.track('vote_transaction_initiated', {
  proposalId: number,
  voteOption: VoteOption,
  lockAmount: string,
});

analytics.track('vote_transaction_confirmed', {
  proposalId: number,
  voteOption: VoteOption,
  lockAmount: string,
  txHash: string,
  duration: number,
});

analytics.track('vote_transaction_failed', {
  proposalId: number,
  error: string,
  errorCode: string,
});

// Success events
analytics.track('vote_cast_success', {
  proposalId: number,
  voteOption: VoteOption,
  lockAmount: string,
  isChange: boolean, // True if changing previous vote
});
```

---

## ⚡ Performance Optimization

### **Caching Strategy**

```typescript
// Proposal list: Cache for 30 seconds
const proposals = useQuery({
  queryKey: ['proposals'],
  queryFn: getProposals,
  staleTime: 30_000,
  cacheTime: 300_000, // Keep in cache for 5 minutes
});

// Proposal details: Cache for 1 minute
const proposalDetails = useQuery({
  queryKey: ['proposal', id],
  queryFn: () => getProposal(id),
  staleTime: 60_000,
});

// User votes: Cache until invalidated
const userVote = useQuery({
  queryKey: ['user-vote', id, address],
  queryFn: () => getUserVote(id, address),
  staleTime: Infinity, // Don't auto-refetch
});
```

### **Pagination**

```typescript
// Load proposals in batches
function usePaginatedProposals(pageSize = 10) {
  const [page, setPage] = useState(0);
  
  return useInfiniteQuery({
    queryKey: ['proposals', 'paginated'],
    queryFn: ({ pageParam = 0 }) => 
      getProposals(pageParam * pageSize, pageSize),
    getNextPageParam: (lastPage, pages) => 
      lastPage.length === pageSize ? pages.length : undefined,
  });
}
```

### **Optimistic Updates**

```typescript
// Show vote immediately, update after confirmation
const { mutate: vote } = useMutation({
  mutationFn: castVote,
  onMutate: async (variables) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['proposal-votes', variables.proposalId]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['proposal-votes', variables.proposalId]);
    
    // Optimistically update
    queryClient.setQueryData(['proposal-votes', variables.proposalId], (old) => ({
      ...old,
      tally: calculateNewTally(old.tally, variables),
    }));
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ['proposal-votes', variables.proposalId],
      context.previous
    );
  },
});
```

### **Lazy Loading**

```typescript
// Lazy load IPFS metadata
<Suspense fallback={<SkeletonDescription />}>
  <ProposalDescription proposalId={id} />
</Suspense>

// Lazy load vote history
const VoteHistory = lazy(() => import('./vote-history'));
```

---

## 🎨 Design System Integration

### **Colors**

```typescript
// Governance-specific colors
export const GOVERNANCE_COLORS = {
  active: '#4CAF50',      // Green for active proposals
  passed: '#2196F3',      // Blue for passed
  failed: '#F44336',      // Red for failed
  executed: '#9C27B0',    // Purple for executed
  
  voteYes: '#4CAF50',     // Green for Yes
  voteNo: '#F44336',      // Red for No
  voteAbstain: '#9E9E9E', // Gray for Abstain
};
```

### **Components**

- `ProposalCard` - Reusable proposal list item
- `ProposalStatus` - Status badge with color
- `VoteBar` - Progress bar for votes
- `VoteModal` - Voting flow modal
- `CountdownTimer` - Time remaining display
- `LockAmountInput` - Token lock input
- `TransactionStatus` - TX pending/success/fail states

### **Typography**

```typescript
// Proposal titles: Bold 18px
// Vote counts: Medium 24px
// Descriptions: Regular 14px
// Time remaining: Medium 12px (uppercase)
```

---

## 📝 Acceptance Criteria

### **Must Have (MVP)**

- [x] Display all active Stage 2 (Public Governance) proposals
- [x] Show proposal details with IPFS metadata
- [x] Display current vote tallies and percentages
- [x] Show countdown timer for active proposals
- [x] Connect wallet on Chiliz network
- [x] Lock PEPPER tokens to cast vote
- [x] Submit vote transaction (Yes/No/Abstain)
- [x] Show transaction status and confirmation
- [x] Display user's vote history
- [x] Show when tokens will unlock
- [x] Handle all error states gracefully
- [x] Work offline/read-only without wallet

### **Nice to Have (Post-MVP)**

- [ ] Push notifications for proposal updates
- [ ] Proposal search and advanced filters
- [ ] Export voting history
- [ ] Share proposals to social media
- [ ] In-app proposal discussion/comments
- [ ] Voting power delegation
- [ ] Proposal impact analysis
- [ ] Historical voting records graph

### **Out of Scope**

- [ ] Proposal creation UI (admin only)
- [ ] Spicy Minister voting interface (admin only)
- [ ] DAO treasury management
- [ ] Multi-chain governance
- [ ] On-chain execution UI

---

## 📅 Implementation Timeline

### **Phase 1: Read-Only (3-5 days)**

- [ ] Set up contract configuration
- [ ] Implement proposal fetching
- [ ] Build proposal list UI
- [ ] Build proposal detail UI
- [ ] Integrate IPFS metadata
- [ ] Add countdown timers
- [ ] Implement filtering/sorting
- [ ] Add loading/error states

### **Phase 2: Voting (3-5 days)**

- [ ] Integrate wallet connection
- [ ] Build voting modal flow
- [ ] Implement lock amount input
- [ ] Add eligibility checks
- [ ] Implement vote transaction
- [ ] Add transaction status UI
- [ ] Handle all error cases
- [ ] Add optimistic updates

### **Phase 3: Polish (2-3 days)**

- [ ] Add animations/transitions
- [ ] Optimize performance
- [ ] Add analytics tracking
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Update documentation
- [ ] QA testing
- [ ] Bug fixes

**Total: 8-13 days** → Production-ready governance feature

---

## 🔗 Dependencies & References

### **Smart Contract Documentation**

- Full Architecture: `documentations/aragon/COMPLETE_GOVERNANCE_ARCHITECTURE.md`
- Implementation Guide: `documentations/aragon/PEPPER_DAO_INTEGRATION_GUIDE.md`
- Quick Reference: `documentations/aragon/QUICK_REFERENCE.md`
- Corrections: `documentations/aragon/CORRECTIONS_AND_CLARIFICATIONS.md`

### **External Resources**

- Aragon OSx Docs: https://docs.aragon.org/osx-contracts/
- Staged Processor: https://chiliscan.com/address/0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
- Token Voting: https://chiliscan.com/address/0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff
- Chiliz RPC: https://rpc.chiliz.com
- IPFS Gateway: https://ipfs.io/ipfs/

### **Internal Dependencies**

- Wallet connection: `documentations/features/wallet.md`
- Onboarding: `documentations/features/onboarding.md`
- Design system: `.cursor/rules/design-system.mdc`

---

## 🎯 Success Metrics

### **User Engagement**

- % of users viewing governance proposals
- Average time spent on proposal details
- % of PEPPER holders who have voted
- Average lock amount per vote
- Voter retention (voted on multiple proposals)

### **Technical Performance**

- Proposal list load time < 2s
- Vote transaction success rate > 95%
- App crash rate < 0.1%
- RPC error rate < 5%

### **Business Goals**

- Increase DAO participation by 30%
- 50% of active users view governance weekly
- Average 100+ votes per proposal
- Growing total PEPPER locked over time

---

**Status:** ✅ Ready for Implementation  
**Priority:** P0 (Core Feature)  
**Estimated Effort:** 8-13 days  
**Team:** Mobile + Smart Contract Integration  

**Last Updated:** December 17, 2024
