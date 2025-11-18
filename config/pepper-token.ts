/**
 * Pepper token configuration and domain interfaces.
 *
 * Centralizes contract addresses and shared types used by
 * the Pepper token dashboard and related features.
 */

/**
 * Pepper ERC-20 token contract on Chiliz Chain.
 * Source: https://scan.chiliz.com/token/0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67
 */
export const PEPPER_TOKEN_ADDRESS = '0x60F397acBCfB8f4e3234C659A3E10867e6fA6b67';

/**
 * DAO treasury addresses holding Pepper.
 *
 * This array is intentionally designed to support multiple
 * addresses so new vaults can be added without changing
 * the data fetching logic.
 */
export const PEPPER_TREASURY_ADDRESSES: Array<string> = [
  '0x1d70027242A82362fd2c818bb2A3a2cAaA513816',
];

/**
 * Canonical burn and staking sources will be populated in a
 * follow-up once the DAO confirms the relevant addresses.
 * For now, these are left empty but exported so that the
 * aggregation logic can depend on a stable shape.
 */
export const PEPPER_BURN_ADDRESSES: Array<string> = [];

export const PEPPER_STAKING_CONTRACT_ADDRESSES: Array<string> = [
  '0x5cA4C88339D89B2547a001003Cca84F62F557A72', // This is the staking contract address
];

/**
 * Core Pepper token metrics used by the home dashboard.
 *
 * All numeric quantities are expressed in raw token units
 * (i.e. before applying decimals) to avoid precision loss.
 */
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

/**
 * Optional segmentation of treasury holdings, modelled after
 * the Treasury Snapshot specification. This is not strictly
 * required for the initial dashboard but keeps the domain
 * model ready for future segmented views.
 */
export interface PepperTreasurySegment {
  id: string;
  label: string;
  addresses: Array<string>;
}


