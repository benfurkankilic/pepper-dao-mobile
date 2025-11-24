import { CHILIZ_CHAIN_ID } from './chains';

/**
 * Governance configuration for the Pepper DAO Aragon instance.
 *
 * NOTE:
 * - The DAO identifier and plugins here are derived from the Aragon web URL
 *   shown in product specs (chiliz-mainnet DAO).
 * - If the Aragon instance is migrated or re‑deployed, update this config only.
 */
export interface AragonGovernanceConfig {
  daoAddress: string;
  daoNetworkKey: string;
  chainId: number;
  /**
   * Optional endpoint for fetching proposals from a subgraph or Aragon API.
   * Keeping it configurable avoids hard‑coding environment specific URLs.
   */
  proposalsApiUrl?: string;
  /**
   * Human‑readable plugin identifiers we care about for filtering.
   */
  plugins: {
    admin: string;
    evolution: string;
  };
  /**
   * Optional contract data for on-chain voting.
   * These can be wired to Aragon OSx Token Voting or Multisig contracts.
   */
  voting?: {
    contractAddress?: string;
    abi?: Array<unknown>;
  };
}

export const PEPPER_DAO_GOVERNANCE_CONFIG: AragonGovernanceConfig = {
  // DAO address as displayed in Aragon URL (verify if the DAO is redeployed)
  daoAddress: '0xDedD0A73c3EC17dfbd057b0bD3FE6D2152b7284B',
  // Network segment used in Aragon URLs, e.g. app.aragon.org/dao/chiliz-mainnet/<daoAddress>
  daoNetworkKey: 'chiliz-mainnet',
  chainId: CHILIZ_CHAIN_ID,
  // This can point to a subgraph or REST endpoint once finalized.
  // Example: 'https://api.aragon.org/graphql'
  proposalsApiUrl: undefined,
  plugins: {
    admin: 'admin',
    evolution: 'pepper-evolution',
  },
  voting: {
    contractAddress: undefined,
    abi: undefined,
  },
};


