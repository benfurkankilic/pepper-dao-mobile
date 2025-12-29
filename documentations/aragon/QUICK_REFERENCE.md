# Pepper DAO - Quick Reference

## 🎯 Essential Contract Info

### **Main Contracts (Always Use Proxy Addresses)**

| Purpose | Proxy Address | Implementation ABI From |
|---------|---------------|-------------------------|
| **Staged Processor** (Main) | `0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415` | `0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135` |
| **Token Voting** (Stage 2) | `0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff` | `0xf1b3ed4f41509f1661def5518d198e0b0257ffe1` |

### **ABI Files**

Create these in your project:

```typescript
// config/contracts.ts
export const CONTRACTS = {
  stagedProcessor: {
    address: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
    abi: STAGED_PROCESSOR_ABI, // From documentation
  },
  tokenVoting: {
    address: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
    abi: TOKEN_VOTING_ABI, // From documentation
  },
};
```

---

## 📖 Most Used Functions

### **Reading Proposals**

```typescript
// Get total proposals
readContract({
  address: CONTRACTS.stagedProcessor.address,
  abi: CONTRACTS.stagedProcessor.abi,
  functionName: 'proposalCount',
});

// Get proposal details
readContract({
  address: CONTRACTS.stagedProcessor.address,
  abi: CONTRACTS.stagedProcessor.abi,
  functionName: 'getProposal',
  args: [proposalId],
});

// Get proposal state (0=Active, 1=Succeeded, 2=Executed, 3=Defeated)
readContract({
  address: CONTRACTS.stagedProcessor.address,
  abi: CONTRACTS.stagedProcessor.abi,
  functionName: 'state',
  args: [proposalId],
});
```

### **Getting Vote Details**

```typescript
// Get vote tally
readContract({
  address: CONTRACTS.tokenVoting.address,
  abi: CONTRACTS.tokenVoting.abi,
  functionName: 'getProposal',
  args: [bodyProposalId],
});
// Returns: { open, executed, parameters, tally: {abstain, yes, no}, actions, ... }

// Check if user voted
readContract({
  address: CONTRACTS.tokenVoting.address,
  abi: CONTRACTS.tokenVoting.abi,
  functionName: 'getVote',
  args: [bodyProposalId, userAddress],
});
// Returns: { voteOption: 0-3, votingPower: uint256 }
```

### **Voting**

```typescript
// Check if can vote
readContract({
  address: CONTRACTS.tokenVoting.address,
  abi: CONTRACTS.tokenVoting.abi,
  functionName: 'canVote',
  args: [bodyProposalId, userAddress, voteOption],
});

// Cast vote
writeContract({
  address: CONTRACTS.tokenVoting.address,
  abi: CONTRACTS.tokenVoting.abi,
  functionName: 'vote',
  args: [
    bodyProposalId,   // uint256
    userAddress,      // address
    voteOption,       // 0=None, 1=Abstain, 2=Yes, 3=No
    votingPower,      // uint256
  ],
});
```

---

## 🔢 Enums & Constants

```typescript
enum VoteOption {
  None = 0,
  Abstain = 1,
  Yes = 2,
  No = 3,
}

enum ProposalState {
  Active = 0,
  Succeeded = 1,
  Executed = 2,
  Defeated = 3,
  Expired = 4,
}

// Stage indices (0-based)
const STAGE_MULTISIG = 0;  // Admin approval
const STAGE_TOKEN_VOTING = 1;  // Community votes
```

---

## ⚡ Common Patterns

### **Display Active Proposals**

```typescript
async function getActiveProposals() {
  const count = await readContract({
    address: CONTRACTS.stagedProcessor.address,
    abi: CONTRACTS.stagedProcessor.abi,
    functionName: 'proposalCount',
  });

  const proposals = [];
  for (let i = 0; i < count; i++) {
    const proposal = await readContract({
      address: CONTRACTS.stagedProcessor.address,
      abi: CONTRACTS.stagedProcessor.abi,
      functionName: 'getProposal',
      args: [BigInt(i)],
    });

    // Only Stage 2 (Token Voting), not executed, not canceled
    if (proposal.currentStage === 1 && !proposal.executed && !proposal.canceled) {
      proposals.push({ id: i, ...proposal });
    }
  }

  return proposals;
}
```

### **Vote on Proposal**

```typescript
async function voteOnProposal(proposalId: bigint, option: VoteOption, user: string) {
  // 1. Check eligibility
  const isMember = await readContract({
    address: CONTRACTS.tokenVoting.address,
    abi: CONTRACTS.tokenVoting.abi,
    functionName: 'isMember',
    args: [user],
  });

  if (!isMember) throw new Error('Not eligible to vote');

  // 2. Get voting power (from lock manager or token balance)
  const votingPower = await getVotingPower(user);

  // 3. Vote
  return await writeContract({
    address: CONTRACTS.tokenVoting.address,
    abi: CONTRACTS.tokenVoting.abi,
    functionName: 'vote',
    args: [proposalId, user, option, votingPower],
  });
}
```

### **Calculate Vote Percentages**

```typescript
function calculateVotePercentages(tally: { yes: bigint; no: bigint; abstain: bigint }) {
  const total = tally.yes + tally.no + tally.abstain;
  
  if (total === 0n) {
    return { yes: 0, no: 0, abstain: 0 };
  }

  return {
    yes: Number((tally.yes * 10000n) / total) / 100,
    no: Number((tally.no * 10000n) / total) / 100,
    abstain: Number((tally.abstain * 10000n) / total) / 100,
  };
}
```

---

## 🐛 Common Issues

### **"proposalCount() reverts with 0x1bebc115"**
❌ **Problem:** Using proxy ABI instead of implementation ABI
✅ **Solution:** Use implementation ABI with proxy address

### **"Cannot find proposal"**
❌ **Problem:** Wrong proposal ID or querying wrong contract
✅ **Solution:** 
- Main proposals: Query Staged Processor
- Voting details: Query Token Voting with bodyProposalId

### **"User cannot vote"**
❌ **Problem:** User has no locked PEPPER tokens
✅ **Solution:** Check `isMember()` and lock manager for voting power

### **"Vote transaction fails"**
❌ **Problem:** Proposal not open, or user already voted with same option
✅ **Solution:** Check `isProposalOpen()` and `canVote()` before transaction

---

## 📊 Data Structure Reference

### **Staged Processor Proposal**

```typescript
interface StagedProposal {
  allowFailureMap: bigint;
  lastStageTransition: bigint;  // Timestamp
  currentStage: number;         // 0 or 1
  stageConfigIndex: number;
  executed: boolean;
  canceled: boolean;
  creator: address;
  actions: Action[];
  targetConfig: TargetConfig;
}
```

### **Token Voting Proposal**

```typescript
interface TokenVotingProposal {
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
  actions: Action[];
  allowFailureMap: bigint;
  targetConfig: TargetConfig;
}
```

### **Vote Entry**

```typescript
interface VoteEntry {
  voteOption: VoteOption;  // 0-3
  votingPower: bigint;
}
```

---

## 🔗 Important Links

- **Staged Processor:** https://chiliscan.com/address/0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
- **Token Voting:** https://chiliscan.com/address/0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff
- **Aragon OSX Docs:** https://docs.aragon.org/osx-contracts/
- **Full Integration Guide:** See `PEPPER_DAO_INTEGRATION_GUIDE.md`

---

## ⏱️ Quick Implementation Timeline

| Phase | Time | Deliverables |
|-------|------|--------------|
| **Phase 1: Read** | 3-5 days | Display proposals, vote tallies |
| **Phase 2: Vote** | 3-5 days | Connect wallet, cast votes |
| **Phase 3: Polish** | 2-3 days | Error handling, testing, docs |
| **Total** | **8-13 days** | Production-ready governance module |

---

**Last Updated:** December 17, 2024
