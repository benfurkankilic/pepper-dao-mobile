# 🌶️ Pepper Dashboard & Chiliz Integration — Implementation Summary

## ✅ What’s Been Implemented

### 1. Home Pepper Dashboard
**Screen**: `app/(tabs)/index.tsx`  
**Component**: `components/home/pepper-dashboard.tsx`

The Home tab now shows a static (non-scrollable) Pepper dashboard that surfaces live token metrics from Chiliz:

- Retro hero block with:
  - Pepper logo
  - `$PEPPER IS FOR THE PEOPLE` headline
  - Primary CTA: **GET PEPPER** (FanX, to wire later)
  - Secondary CTA: **STAKE & VOTE** (governance / staking, to wire later)
- **Treasury Snapshot** section with 4 metric tiles:
  - **Pepper Supply** (total token supply)
  - **Pepper Treasury** (Pepper held by DAO treasury addresses)
  - **Staked Pepper** (placeholder, awaiting staking contracts)
  - **Burnt Pepper** (placeholder, awaiting burn addresses)
- Each tile uses a dedicated pixel-art icon (via `expo-image`) and a bold, integer-only number for readability.
- The layout is strictly vertical and fits within one screen; no scrolling is used on Home.

### 2. Chiliz RPC Integration for Token Data
**Module**: `services/chiliz-api.ts`

Instead of depending on a block explorer REST API, the dashboard reads data straight from the Chiliz RPC using `viem`:

- Creates a **public client** pinned to `PRIMARY_CHAIN` (`config/chains.ts`, Chiliz chainId `88888`).
- Defines a minimal **ERC‑20 ABI**:
  - `decimals() → uint8`
  - `totalSupply() → uint256`
  - `balanceOf(address) → uint256`
- Exposes typed helpers:
  - `fetchTokenMetadata(tokenAddress)` → `PepperTokenMetadata`
  - `fetchPepperTokenMetadata()` → metadata for `PEPPER_TOKEN_ADDRESS`
  - `fetchAddressPepperBalance(address)` → single-address balance
  - `fetchPepperBalances(addresses)` → `Promise<Array<PepperAddressBalance>>`
  - `fetchPepperTreasuryBalances()` → balances for all `PEPPER_TREASURY_ADDRESSES`

All reads are **read-only view calls** (no signing, no wallet required).

### 3. Pepper Token Configuration & Metrics Model
**Config**: `config/pepper-token.ts`

Centralizes key addresses and shared types:

- `PEPPER_TOKEN_ADDRESS`: Pepper ERC‑20 on Chiliz.
- `PEPPER_TREASURY_ADDRESSES`: array of DAO treasury addresses.
- `PEPPER_BURN_ADDRESSES`: empty array for now (future burn sources).
- `PEPPER_STAKING_CONTRACT_ADDRESSES`: empty array (future staking / vault contracts).

**Core metrics type**:

```ts
export interface PepperTokenMetrics {
  totalSupply: bigint;
  burnedAmount: bigint;
  stakedAmount: bigint;
  treasuryBalance: bigint;
  circulatingSupply: bigint;
  decimals: number;
  updatedAt: string;
  hasBurnData: boolean;
  hasStakedData: boolean;
}
```

All values are stored as `bigint` in raw token units (pre-decimals) to avoid precision issues.

### 4. Data Fetching & Aggregation Hook
**Hook**: `hooks/use-pepper-token-metrics.ts`

This hook is the single source of truth for dashboard data:

- Uses **TanStack Query** with key `['pepper', 'token-metrics']`.
- On each fetch:
  - Reads token metadata (`totalSupply`, `decimals`).
  - Reads treasury balances (all `PEPPER_TREASURY_ADDRESSES`).
  - Reads burn balances (`PEPPER_BURN_ADDRESSES`).
  - Reads staking balances (`PEPPER_STAKING_CONTRACT_ADDRESSES`).
- Utility helpers:
  - `sumBalances(balances)` → sum of `balance` fields.
  - `calculateCirculatingSupply(total, burned, staked, treasury)`  
    `circulating = max(0, total - burned - staked - treasury)`.
- Query options:
  - `staleTime`: 30s
  - `refetchInterval`: 30s (background)
  - `refetchOnMount`: `'always'`

**Return shape**:

```ts
{
  metrics?: PepperTokenMetrics;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;      // background refresh
  lastUpdated: string | null;
  refetch: () => void;      // currently unused in UI (auto-refresh only)
}
```

### 5. Dashboard Rendering & Formatting
**Component**: `PepperDashboard`

- Reads data from `usePepperTokenMetrics`.
- Displays metric tiles via a local `MetricTile` subcomponent:
  - Left-aligned icon (`expo-image`, 48×48).
  - Title (caption) + value stacked, vertically centered.
- Formatting:
  - `formatPepperAmount(raw, decimals, fractionDigits = 0)`:
    - Converts `bigint` to integer string using decimals.
    - Adds thousands separators.
    - Omits units and decimals for a clean, retro numeric look.
  - `formatTimeSince(timestamp)`:
    - `<1m` → `just now`
    - `<1h` → `Xm`
    - `<24h` → `Xh`
    - `>=24h` → `Xd`

**Last Updated**:
- A `lastUpdated` timestamp is set in `PepperTokenMetrics` when data is computed.
- The dashboard currently hides the text UI for this (wrapped in a commented block) but the utility is ready if we want to surface it again.

### 6. Telemetry
**Module**: `lib/telemetry.ts`

New events added:

- `pepper_dashboard_viewed` — fired when `PepperDashboard` mounts.
- `pepper_metrics_refreshed` — fired whenever query data changes (includes `updatedAt`).
- `pepper_metrics_error` — fired when the query encounters an error.

Hook integration:

- `usePepperTokenMetrics` watches `query.data` and `query.error` and calls the telemetry helpers accordingly.

### 7. Icons & Assets
**Assets**: `assets/images/pepper/`

Used via `expo-image`:

- `logo.png` — hero Pepper logo above the title.
- `total-supply.png` — icon for "Pepper Supply".
- `treasury.png` — icon for "Pepper Treasury".
- `vault.png` — icon for "Staked Pepper".
- `burn.png` — icon for "Burnt Pepper".

All tiles and CTAs follow the existing **retro design system** (chunky borders, sharp corners, flat shadows).

## 📁 New / Updated Files

```text
components/home/
└── pepper-dashboard.tsx      # Dashboard UI, metric tiles, formatting helpers

config/
└── pepper-token.ts           # Token addresses & PepperTokenMetrics interface

hooks/
└── use-pepper-token-metrics.ts  # Aggregation hook using TanStack Query

services/
└── chiliz-api.ts             # viem-based Chiliz RPC integration for PEPPER

documentations/flows/
└── PEPPER_DASHBOARD_SUMMARY.md  # This document
```

## 🔌 Data Flow Overview

```text
Chiliz RPC (PRIMARY_CHAIN)
      │
      ▼
services/chiliz-api.ts
  - readContract(totalSupply, decimals, balanceOf)
      │
      ▼
hooks/use-pepper-token-metrics.ts
  - fetchPepperTokenMetadata()
  - fetchPepperTreasuryBalances()
  - fetchPepperBalances(burn, staking)
  - compute PepperTokenMetrics + updatedAt
      │
      ▼
components/home/pepper-dashboard.tsx
  - usePepperTokenMetrics()
  - formatPepperAmount()
  - render MetricTile + icons
```

## 📊 Telemetry Events

1. **pepper_dashboard_viewed**
   - When the dashboard is first shown.
2. **pepper_metrics_refreshed**
   - After each successful fetch / background refresh.
   - Payload: `{ updatedAt: string }`.
3. **pepper_metrics_error**
   - On fetch errors.
   - Payload: `{ message: string }`.

These can be wired into an external analytics service later (currently logged via the internal telemetry service stub).

## 🧪 Testing & Validation

### Logic Tests
**File**: `tests/pepper-metrics.test.ts`

- Validates:
  - `sumBalances` aggregation.
  - `calculateCirculatingSupply` math.
  - `formatPepperAmount` formatting behaviour.

These tests are framework-agnostic helper checks that can be integrated with Jest/Vitest when the test harness is set up.

### Manual Testing Checklist

1. **Dashboard Load**
   - Launch app → Home tab.
   - Hero, CTAs, and four metric tiles render without scroll.
2. **Data Population**
   - Pepper Supply and Treasury values show as integers with comma separators.
   - Staked/Burnt tiles show `–` until addresses are configured.
3. **Auto Refresh**
   - Leave app open for >30 seconds.
   - Data silently refreshes; small indicator shows while `isFetching` is true (if enabled).
4. **Offline / Error Handling**
   - Disable network or break RPC temporarily.
   - Dashboard continues to render; `pepper_metrics_error` telemetry fires.

## 🔧 Configuration & Extensibility

- To add **additional treasury vaults**:
  - Append addresses to `PEPPER_TREASURY_ADDRESSES` in `config/pepper-token.ts`.
- To enable **staked Pepper**:
  - Add staking contract addresses into `PEPPER_STAKING_CONTRACT_ADDRESSES`.
  - Optionally extend the API layer with contract-specific view functions (e.g. `totalStaked()`).
- To enable **burnt Pepper**:
  - Add known burn / dead addresses into `PEPPER_BURN_ADDRESSES`.
  - Metrics hook automatically includes them in `burnedAmount`.

No changes to the dashboard UI are required when updating these addresses; the aggregation layer is already wired.

## 🚀 Next Steps

- Wire **GET PEPPER** to the live FanX / trading URL.
- Wire **STAKE & VOTE** to the governance / staking screen once those flows are implemented.
- Re-enable and style the **Last updated** subtitle once UX is finalized.
- Add error banners / toasts if RPC failures need to be surfaced more prominently.

---

**Status**: ✅ Pepper dashboard and Chiliz RPC integration are implemented and ready for use on the Home tab.  
**Dependencies**: `viem`, `@tanstack/react-query`, `expo-image`, existing design system.


