# How to Update ABIs

**Last Updated:** December 17, 2024

---

## 🎯 Overview

The project now uses a centralized ABI configuration file at `config/aragon-abis.ts`. This file currently contains **minimal ABIs** with the most essential functions. To enable full functionality, you need to replace them with **complete implementation ABIs** from Chiliscan.

---

## 📂 What Was Changed

### **New Files Created**

1. **`config/aragon-abis.ts`** - Centralized ABI configuration
   - Contains `STAGED_PROCESSOR_ABI`
   - Contains `TOKEN_VOTING_ABI`
   - Contains `MULTISIG_PLUGIN_ABI`
   - Exports `ARAGON_CONTRACTS` configuration object

2. **`scripts/fetch-abi-from-chiliscan.sh`** - Helper script to fetch ABIs
   - Automatically downloads ABIs from Chiliscan API
   - Saves to temporary files for easy copying

### **Updated Files**

1. **`lib/aragon-onchain.ts`** - Updated to use new ABI structure
   - Now imports ABIs from `config/aragon-abis.ts`
   - Uses `ARAGON_CONTRACTS` configuration
   - Fixed Staged Processor `getProposal()` to handle 8 return values
   - Added new helper functions: `canVote()`, `getUserVote()`, `isEligibleToVote()`

---

## ⚠️ Important: Update Required

The current ABIs in `config/aragon-abis.ts` are **minimal** and only include basic functions. For full functionality, you need to replace them with the **complete implementation ABIs**.

---

## 🚀 Quick Update Method (Recommended)

### **Option 1: Use the Fetch Script**

```bash
# 1. Make script executable
chmod +x scripts/fetch-abi-from-chiliscan.sh

# 2. Run the script
./scripts/fetch-abi-from-chiliscan.sh

# 3. Open the generated files
open /tmp/staged-processor-abi.json
open /tmp/token-voting-abi.json

# 4. Copy each ABI array into config/aragon-abis.ts
```

The script fetches ABIs from:
- **Staged Processor**: `0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135`
- **Token Voting**: `0xf1b3ed4f41509f1661def5518d198e0b0257ffe1`

---

### **Option 2: Manual Download from Chiliscan**

#### **Step 1: Get Staged Processor ABI**

1. Visit: https://chiliscan.com/address/0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
2. Click **"Contract"** tab
3. Scroll to **"Contract ABI"** section
4. Click **"Copy"** button
5. Open `config/aragon-abis.ts`
6. Replace the entire `STAGED_PROCESSOR_ABI` array with the copied ABI

#### **Step 2: Get Token Voting ABI**

1. Visit: https://chiliscan.com/address/0xf1b3ed4f41509f1661def5518d198e0b0257ffe1
2. Click **"Contract"** tab
3. Scroll to **"Contract ABI"** section
4. Click **"Copy"** button
5. Open `config/aragon-abis.ts`
6. Replace the entire `TOKEN_VOTING_ABI` array with the copied ABI

---

### **Option 3: Using curl (Command Line)**

```bash
# Fetch Staged Processor ABI
curl "https://api.chiliscan.com/api?module=contract&action=getabi&address=0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135" \
  | jq -r '.result' \
  > staged-processor-abi.json

# Fetch Token Voting ABI
curl "https://api.chiliscan.com/api?module=contract&action=getabi&address=0xf1b3ed4f41509f1661def5518d198e0b0257ffe1" \
  | jq -r '.result' \
  > token-voting-abi.json
```

Then copy the contents into `config/aragon-abis.ts`.

---

## 📝 How to Replace ABIs

### **1. Open the ABI Config File**

```bash
open config/aragon-abis.ts
```

### **2. Replace STAGED_PROCESSOR_ABI**

Find this section:

```typescript
export const STAGED_PROCESSOR_ABI = [
  // TODO: Replace with full implementation ABI from Chiliscan
  // Temporary minimal ABI for basic functionality
  {
    inputs: [],
    name: 'proposalCount',
    // ... rest of minimal ABI
  },
] as const;
```

Replace the **entire array** (from `[` to `]`) with the ABI you copied from Chiliscan.

**Make sure to keep:**
- `export const STAGED_PROCESSOR_ABI = ` at the beginning
- `as const;` at the end

### **3. Replace TOKEN_VOTING_ABI**

Find this section:

```typescript
export const TOKEN_VOTING_ABI = [
  // TODO: Replace with full implementation ABI from Chiliscan
  // Temporary minimal ABI for basic functionality
  {
    inputs: [],
    name: 'proposalCount',
    // ... rest of minimal ABI
  },
] as const;
```

Replace the **entire array** with the Token Voting ABI from Chiliscan.

**Keep the same format:**
- `export const TOKEN_VOTING_ABI = `
- `as const;`

---

## ✅ Verify the Update Works

### **Test Script**

Create a test file to verify the ABIs work:

```typescript
// test-abi-connection.ts
import { createPublicClient, http } from 'viem';
import { ARAGON_CONTRACTS } from './config/aragon-abis';
import { chiliz } from './config/chains';

const client = createPublicClient({
  chain: chiliz,
  transport: http(),
});

async function testABIs() {
  console.log('🧪 Testing ABI connections...\n');
  
  // Test 1: Staged Processor
  try {
    const count = await client.readContract({
      address: ARAGON_CONTRACTS.stagedProcessor.address,
      abi: ARAGON_CONTRACTS.stagedProcessor.abi,
      functionName: 'proposalCount',
    });
    console.log('✅ Staged Processor:', count.toString(), 'proposals');
  } catch (error) {
    console.error('❌ Staged Processor failed:', error.message);
  }
  
  // Test 2: Token Voting
  try {
    const count = await client.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: ARAGON_CONTRACTS.tokenVoting.abi,
      functionName: 'proposalCount',
    });
    console.log('✅ Token Voting:', count.toString(), 'proposals');
  } catch (error) {
    console.error('❌ Token Voting failed:', error.message);
  }
  
  // Test 3: Get token address
  try {
    const tokenAddress = await client.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: ARAGON_CONTRACTS.tokenVoting.abi,
      functionName: 'token',
    });
    console.log('✅ Token address:', tokenAddress);
  } catch (error) {
    console.error('❌ Token query failed:', error.message);
  }
}

testABIs();
```

Run the test:

```bash
npx tsx test-abi-connection.ts
```

**Expected Output:**
```
🧪 Testing ABI connections...

✅ Staged Processor: X proposals
✅ Token Voting: Y proposals
✅ Token address: 0x...
```

---

## 🔧 Troubleshooting

### **Error: "Function not found on ABI"**

**Problem:** The ABI doesn't contain the function being called.

**Solutions:**
1. Verify you copied the **complete** ABI (should be very large, 100+ functions)
2. Check you're using the **implementation** ABI, not the proxy ABI
3. Make sure you replaced the entire array

### **Error: "Contract reverted with 0x1bebc115"**

**Problem:** Using the wrong ABI or calling the wrong function signature.

**Solutions:**
1. Confirm you're using the implementation ABI from the correct addresses
2. Check the function exists in the ABI
3. Verify the contract addresses are correct

### **Error: "Cannot read properties of undefined"**

**Problem:** ABI not imported correctly or export syntax wrong.

**Solutions:**
1. Check the export syntax: `export const X_ABI = [...] as const;`
2. Verify the import in `lib/aragon-onchain.ts`
3. Restart TypeScript server in your editor

### **ABIs are Very Large (File Size)**

**This is normal!** Complete implementation ABIs can be:
- **Staged Processor:** ~50-100KB
- **Token Voting:** ~50-100KB

The large size includes all functions, events, and error definitions. This is expected for full contract functionality.

---

## 📋 Checklist

Before considering this complete:

- [ ] Fetched Staged Processor ABI from Chiliscan
- [ ] Fetched Token Voting ABI from Chiliscan
- [ ] Replaced `STAGED_PROCESSOR_ABI` in `config/aragon-abis.ts`
- [ ] Replaced `TOKEN_VOTING_ABI` in `config/aragon-abis.ts`
- [ ] Kept `as const;` at the end of each export
- [ ] Verified no TypeScript errors in the file
- [ ] Ran test script to confirm connection works
- [ ] Confirmed `proposalCount()` returns a number
- [ ] Confirmed `token()` returns an address
- [ ] Committed changes to git

---

## 🎯 What This Enables

Once you update the ABIs, the following features will work:

### **Staged Processor (Main Governance)**
- ✅ Get total proposal count
- ✅ Fetch proposal details (8 return values)
- ✅ Check proposal state
- ✅ Get stage information
- ✅ Execute passed proposals

### **Token Voting (Stage 2 - Public Governance)**
- ✅ Get total proposal count
- ✅ Fetch proposal with vote tallies
- ✅ Cast votes with locked PEPPER
- ✅ Check if user can vote
- ✅ Get user's vote history
- ✅ Check voting eligibility
- ✅ Query lock manager

### **Additional Functions**
- ✅ Query PEPPER token address
- ✅ Query lock manager address
- ✅ Check proposal open status
- ✅ All events (ProposalCreated, VoteCast, etc.)

---

## 🔗 References

- **Staged Processor Implementation:** https://chiliscan.com/address/0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
- **Token Voting Implementation:** https://chiliscan.com/address/0xf1b3ed4f41509f1661def5518d198e0b0257ffe1
- **Chiliscan API Docs:** https://docs.chiliscan.com/api
- **Feature Documentation:** `documentations/features/governance-aragon.md`
- **Quick Reference:** `documentations/aragon/QUICK_REFERENCE.md`

---

## 💡 Pro Tips

### **Keep a Backup**

Before replacing ABIs:

```bash
cp config/aragon-abis.ts config/aragon-abis.backup.ts
```

### **Format After Pasting**

After pasting large ABIs, format the file:

```bash
npx prettier --write config/aragon-abis.ts
```

### **Version Control**

Commit the updated ABIs separately:

```bash
git add config/aragon-abis.ts
git commit -m "feat: update to complete implementation ABIs"
```

---

**Status:** ⚠️ Action Required  
**Priority:** P0 (Blocking Feature)  
**Estimated Time:** 5-10 minutes

---

**Last Updated:** December 17, 2024
