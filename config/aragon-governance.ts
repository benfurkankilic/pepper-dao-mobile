import { CHILIZ_CHAIN_ID } from './chains';

/**
 * Governance configuration for the Pepper DAO Aragon OSx instance.
 *
 * The DAO uses the Aragon Backend API to fetch proposals, which handles
 * plugin discovery automatically. The plugin addresses below are for
 * reference and for direct on-chain interactions if needed.
 *
 * Pepper DAO Governance Structure:
 * - Multisig Plugin: For proposals requiring multiple approvals
 * - SPP (Staged Proposal Plugin): For staged governance with multiple voting phases
 */
export interface AragonGovernanceConfig {
  /** The DAO contract address on Chiliz mainnet */
  daoAddress: `0x${string}`;
  /** Network segment used in Aragon URLs and API */
  daoNetworkKey: string;
  /** Chain ID for the network */
  chainId: number;
  /** Plugin contract addresses (discovered from Aragon Backend API) */
  plugins: {
    /** Multisig plugin instance address */
    multisig: `0x${string}`;
    /** SPP (Staged Proposal Plugin) address - for PEP proposals */
    spp: `0x${string}`;
  };
}

export const PEPPER_DAO_GOVERNANCE_CONFIG: AragonGovernanceConfig = {
  // DAO address as displayed in Aragon URL
  daoAddress: '0xDedD0A73c3EC17dfbd057b0bD3FE6D2152b7284B',
  // Network segment used in Aragon URLs and API
  daoNetworkKey: 'chiliz-mainnet',
  chainId: CHILIZ_CHAIN_ID,

  /**
   * Plugin addresses - discovered from Aragon Backend API
   * These are the actual installed plugin instance addresses
   */
  plugins: {
    // Multisig plugin instance (discovered from API)
    multisig: '0x1FecF1c23dD2E8C7adF937583b345277d39bD554',
    // SPP (Staged Proposal Plugin) for PEP proposals
    spp: '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415',
  },
};
