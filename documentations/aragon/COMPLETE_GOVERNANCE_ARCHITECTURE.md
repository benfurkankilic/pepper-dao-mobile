# Complete Pepper DAO Governance Architecture

## 🏗️ **Contract Structure**

### **Main Governance System (Staged Proposal Processor)**

**Proxy Contract:**
- Address: `0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415`
- Purpose: User-facing contract for creating/advancing proposals

**Implementation Contract:**
- Address: `0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135`  
- Plugin Type: **Staged Proposal Processor**
- Purpose: Orchestrates multi-stage proposal workflow

---

## 🗳️ **2-Stage Governance Flow**

### **Stage 1: Multisig Approval (Admin)**
- **Duration:** 7 days (168 hours)
- **Body Contract:** `0x1FecF1c23dD2E8C7adF937583b345277d39bD554` (Proxy)
- **Purpose:** Initial approval by multisig members
- **Threshold:** 1 approval required
- **User Access:** Admin-only, NOT for mobile app users

### **Stage 2: Community Token Voting** ⭐

**Token Voting Body (Proxy):**
- Address: `0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff`
- Purpose: Proxy for token voting

**Token Voting Implementation:** 🎯 **THIS IS WHERE USERS VOTE**
- Address: **`0xf1b3ed4f41509f1661def5518d198e0b0257ffe1`**
- Purpose: **Actual voting logic with PEPPER tokens**
- Duration: 7 days (168 hours)
- Threshold: 1 approval required

---

## 📋 **ABIs We Have**

### ✅ **Staged Proposal Processor** (Main Coordinator)
- Contract: `0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135`
- ABI: ✅ Received
- Key Functions:
  - `proposalCount()` - Get total proposals
  - `getProposal(uint256)` - Get proposal details  
  - `getStages(uint256)` - Get stage configuration
  - `advanceProposal(uint256)` - Move to next stage
  - `execute(uint256)` - Execute approved proposal
  - `state(uint256)` - Get proposal state

### ❌ **Token Voting Implementation** (User Voting)
- Contract: `0xf1b3ed4f41509f1661def5518d198e0b0257ffe1`
- ABI: **⏳ WAITING FOR THIS**
- Expected Functions:
  - `vote(uint256 proposalId, ...)` - Cast vote
  - `canVote(uint256 proposalId, address voter)` - Check if can vote
  - `getVotingPower(address voter)` - Get voting power
  - `hasVoted(uint256 proposalId, address voter)` - Check if already voted

---

## 🔄 **How Proposals Work**

### **1. Proposal Creation**
```typescript
// Call on main proxy (0x8d639...190415)
createProposal(metadata, actions, startDate, proposalParams)
```

### **2. Stage 1: Multisig Approval**
- Multisig members approve via `0x1FecF...D554`
- Proposal automatically advances after 1 approval

### **3. Stage 2: Community Voting** ⭐
- PEPPER token holders vote via `0xf1b3...ffe1`
- Voting happens on the **implementation contract**
- Vote with staked PEPPER tokens
- After threshold met, can execute

### **4. Execution**
```typescript
// Call on main proxy (0x8d639...190415)
execute(proposalId)
```

---

## 📱 **Mobile App Implementation Plan**

### **Phase 1: Read Proposals (Current Priority)**

**Data Flow:**
```
Mobile App
    ↓
Query Main Proxy (0x8d639...190415) with Implementation ABI
    ↓
Get proposalCount()
    ↓
For each proposal:
  - getProposal(id) → Basic info
  - state(id) → Current state
  - getProposalTally(id, stageId) → Vote counts
```

**Functions to Call:**
1. `proposalCount()` → Total proposals
2. `getProposal(proposalId)` → Proposal details
3. `state(proposalId)` → Check if active/executed/canceled
4. `getProposalTally(proposalId, 1)` → Stage 2 (token voting) results

---

### **Phase 2: Voting (After Getting Token Voting ABI)**

**Data Flow:**
```
Mobile App
    ↓
User connects wallet with PEPPER tokens
    ↓
Check if in Stage 2 (token voting)
    ↓
Call Token Voting Implementation (0xf1b3...ffe1)
    ↓
canVote(proposalId, userAddress)
    ↓
vote(proposalId, voteOption)
```

**Functions to Call (Token Voting Implementation):**
1. `canVote(proposalId, userAddress)` → Check eligibility
2. `getVotingPower(userAddress)` → Get user's voting power
3. `vote(proposalId, voteOption)` → Cast vote
4. `hasVoted(proposalId, userAddress)` → Check if already voted

---

## 🔧 **Implementation Steps**

### **Step 1: Update Contract ABIs** ⏳ WAITING FOR TOKEN VOTING ABI

```typescript
// lib/aragon-contracts.ts
export const CONTRACTS = {
  // Main governance coordinator
  stagedProcessor: {
    proxy: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
    implementation: '0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135',
    abi: STAGED_PROCESSOR_ABI, // Already have this
  },
  
  // Token voting (Stage 2)
  tokenVoting: {
    proxy: '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff',
    implementation: '0xf1b3ed4f41509f1661def5518d198e0b0257ffe1',
    abi: TOKEN_VOTING_ABI, // NEED THIS
  },
};
```

### **Step 2: Implement Proposal Fetching**

```typescript
// lib/aragon-governance.ts
export async function fetchProposals() {
  // Call proxy with implementation ABI
  const count = await readContract({
    address: CONTRACTS.stagedProcessor.proxy,
    abi: CONTRACTS.stagedProcessor.abi,
    functionName: 'proposalCount',
  });
  
  // Fetch each proposal
  for (let i = 0; i < count; i++) {
    const proposal = await readContract({
      address: CONTRACTS.stagedProcessor.proxy,
      abi: CONTRACTS.stagedProcessor.abi,
      functionName: 'getProposal',
      args: [i],
    });
    
    // Get stage 2 (token voting) tally
    const tally = await readContract({
      address: CONTRACTS.stagedProcessor.proxy,
      abi: CONTRACTS.stagedProcessor.abi,
      functionName: 'getProposalTally',
      args: [i, 1], // Stage 1 index (0-based) = Stage 2
    });
  }
}
```

### **Step 3: Implement Voting**

```typescript
// lib/aragon-voting.ts
export async function voteOnProposal(proposalId, voteOption, userAddress) {
  // First check if user can vote
  const canVote = await readContract({
    address: CONTRACTS.tokenVoting.proxy,
    abi: CONTRACTS.tokenVoting.abi,
    functionName: 'canVote',
    args: [proposalId, userAddress],
  });
  
  if (!canVote) throw new Error('Cannot vote');
  
  // Cast vote
  await writeContract({
    address: CONTRACTS.tokenVoting.proxy,
    abi: CONTRACTS.tokenVoting.abi,
    functionName: 'vote',
    args: [proposalId, voteOption],
  });
}
```

---

## ⚠️ **Important Notes**

### **Why Multiple Contracts?**
- **Staged Processor:** Orchestrates the workflow, manages proposal lifecycle
- **Token Voting Body:** Handles the actual voting with PEPPER tokens
- **Proxies:** Allow upgradability without changing addresses

### **Key Insight:**
You DON'T vote directly on the Staged Processor. Instead:
1. Staged Processor creates a "sub-proposal" in the Token Voting body
2. Users vote on the Token Voting body contract
3. Token Voting body reports results back to Staged Processor
4. Staged Processor advances/executes based on results

### **For Mobile App:**
- Show proposals from Staged Processor (main contract)
- Link to Stage 2 voting on Token Voting body
- When user votes, call Token Voting implementation
- Display results from both contracts

---

## 📞 **Immediate Action Required**

**To PM:** Please get the ABI from:
`https://chiliscan.com/address/0xf1b3ed4f41509f1661def5518d198e0b0257ffe1`

This is the LAST piece we need to implement voting!

Once we have this ABI, development can proceed:
- Day 1: Implement proposal fetching (read-only)
- Day 2: Implement voting functionality
- Day 3: Testing and UI polish

---

## 🎯 **Success Criteria**

### **Phase 1 (Read-Only):**
- ✅ Display list of active proposals
- ✅ Show proposal details (title, description, votes)
- ✅ Show current stage (Multisig or Community voting)
- ✅ Display vote tallies for Stage 2

### **Phase 2 (Voting):**
- ✅ User can vote with PEPPER tokens
- ✅ Show user's voting power
- ✅ Prevent double voting
- ✅ Display user's vote after casting
- ✅ Update tally in real-time

---

**Status:** ⏳ Blocked waiting for Token Voting Implementation ABI
**Next Step:** Get ABI from `0xf1b3ed4f41509f1661def5518d198e0b0257ffe1`
