# Mock Data Verification for Governance

## Overview
The governance system now uses mock data based on the Aragon IProposal interface structure. This document verifies that mock data works for both the proposal list and detail pages.

## Mock Data Structure

All mock proposals follow the Aragon `IProposal` interface:
- `proposalId` (uint256) - On-chain proposal ID
- `creator`/`proposer` (address) - Plugin address that created the proposal
- `startDate` (uint64) - Unix timestamp when voting starts
- `endDate` (uint64) - Unix timestamp when voting ends
- `executed` (boolean) - Whether the proposal has been executed
- `approvals` - Current number of approvals
- `minApprovals` - Minimum approvals required
- `actions[]` - Array of actions with `to`, `value`, and `data`
- `allowFailureMap` (uint256) - Bitmap for allowing action failures

## Mock Proposals

### 1. Active Multisig Proposal
- **ID**: `0x1fecf1c23dd2e8c7adf937583b345277d39bd554_0`
- **Status**: ACTIVE (2/3 approvals, 3 days left)
- **Actions**: 1 (Transfer 1 CHZ)

### 2. Executed PEP Proposal
- **ID**: `0x8d639bd52301d7265ebd1e6d4b0813f1cf190415_0`
- **Status**: EXECUTED (5/3 approvals, ended 1 day ago)
- **Actions**: 1 (Approve 1 CHZ)

### 3. Pending Multisig Proposal
- **ID**: `0x1fecf1c23dd2e8c7adf937583b345277d39bd554_1`
- **Status**: PENDING (0/3 approvals, starts in 2 days)
- **Actions**: 2 (Transfer 2 CHZ + Token transfer)

### 4. Succeeded PEP Proposal
- **ID**: `0x8d639bd52301d7265ebd1e6d4b0813f1cf190415_1`
- **Status**: SUCCEEDED (4/3 approvals, ended 1 hour ago)
- **Actions**: 1 (Transfer 10 CHZ)

### 5. Defeated Multisig Proposal
- **ID**: `0x1fecf1c23dd2e8c7adf937583b345277d39bd554_2`
- **Status**: DEFEATED (1/3 approvals, ended 2 hours ago)
- **Actions**: 1 (Approve tokens)

### 6. Another Active PEP Proposal
- **ID**: `0x8d639bd52301d7265ebd1e6d4b0813f1cf190415_2`
- **Status**: ACTIVE (3/5 approvals, 3.5 days left)
- **Actions**: 1 (Transfer 3 CHZ)

## Flow Verification

### Proposal List Page (`app/(tabs)/governance.tsx`)
1. ✅ Component calls `useGovernanceProposals()` hook
2. ✅ Hook calls `fetchGovernanceProposals()` from `services/governance-api.ts`
3. ✅ Function returns mock data via `getMockProposals()`
4. ✅ Data is transformed using `transformOnChainProposal()`
5. ✅ Proposals are filtered by status (ALL, ACTIVE, EXECUTED, PENDING)
6. ✅ Pagination support added (first, skip parameters)
7. ✅ Each proposal card displays: status, type, title, description, proposer

### Proposal Detail Page (`app/governance/[proposalId].tsx`)
1. ✅ Component receives `proposalId` from route params (format: `pluginAddress_proposalId`)
2. ✅ Component calls `useGovernanceProposal({ proposalId })` hook
3. ✅ Hook calls `fetchGovernanceProposalById(proposalId)` from `services/governance-api.ts`
4. ✅ Function finds proposal in mock data using `mockProposals.find((p) => p.id === id)`
5. ✅ Proposal is transformed using `transformOnChainProposal()`
6. ✅ Detail page displays: key, title, description, status

## Navigation Test

To test navigation from list to detail:
1. Go to Governance tab
2. Click on any proposal card
3. ProposalCard passes `proposal.id` to the detail route
4. Detail page receives the ID and fetches the proposal
5. Detail page displays the proposal information

## Example IDs for Testing

You can test the detail page directly by navigating to:
- `/governance/0x1fecf1c23dd2e8c7adf937583b345277d39bd554_0` - Active Multisig
- `/governance/0x8d639bd52301d7265ebd1e6d4b0813f1cf190415_0` - Executed PEP
- `/governance/0x1fecf1c23dd2e8c7adf937583b345277d39bd554_1` - Pending Multisig
- `/governance/0x8d639bd52301d7265ebd1e6d4b0813f1cf190415_1` - Succeeded PEP
- `/governance/0x1fecf1c23dd2e8c7adf937583b345277d39bd554_2` - Defeated Multisig
- `/governance/0x8d639bd52301d7265ebd1e6d4b0813f1cf190415_2` - Active PEP

## Status Badge Colors

The proposals will display different status badges:
- 🟢 **ACTIVE** - Green badge
- ✅ **EXECUTED** - Blue/Success badge
- 🔵 **PENDING** - Gray/Neutral badge
- ❌ **DEFEATED** - Red badge
- 🎯 **SUCCEEDED** - Gold/Success badge (not yet executed)

## Implementation Notes

### Changes Made:
1. ✅ Added `getMockProposals()` function with 6 diverse proposals
2. ✅ Updated `fetchGovernanceProposals()` to use mock data
3. ✅ Updated `fetchGovernanceProposalById()` to find proposals in mock data
4. ✅ Added pagination support (first, skip parameters)
5. ✅ Maintained all original transformation and filtering logic
6. ✅ Removed unused imports (getAllProposals, getMultisigProposal, getSppProposal)

### Preserved Functionality:
- ✅ `mapPluginType()` - Maps MULTISIG/SPP to display types
- ✅ `deriveStatus()` - Calculates proposal status based on dates/approvals
- ✅ `transformOnChainProposal()` - Transforms to app format
- ✅ `filterProposals()` - Filters by status
- ✅ `getGovernanceSummary()` - Calculates statistics
- ✅ `getGovernanceConfig()` - Returns config

## Verification Checklist

- [x] Mock data structure matches Aragon IProposal interface
- [x] Proposal list page fetches and displays proposals
- [x] Proposal detail page fetches and displays individual proposals
- [x] Status filtering works (ALL, ACTIVE, EXECUTED, PENDING)
- [x] Time labels are calculated correctly
- [x] Navigation from list to detail works
- [x] Pagination support added
- [x] No linter errors
- [x] TypeScript types are correct

## Next Steps

When ready to switch to real on-chain data:
1. Replace `getMockProposals()` call with `getAllProposals()` in `fetchGovernanceProposals()`
2. Update `fetchGovernanceProposalById()` to use original plugin query logic
3. Restore imports for `getAllProposals`, `getMultisigProposal`, `getSppProposal`
4. Test with real Chiliz testnet/mainnet data
