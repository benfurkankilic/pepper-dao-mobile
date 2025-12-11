/**
 * Staking contract configuration for PEPPER token staking.
 *
 * This module provides environment-aware contract addresses and ABIs
 * for the staking functionality on Chiliz Chain (mainnet) and
 * Spicy Testnet (development).
 */

import { PEPPER_TOKEN_ADDRESS } from './pepper-token';

/**
 * Staking contract addresses by network
 */
export const STAKING_CONTRACT_ADDRESSES = {
  mainnet: '0x5cA4C88339D89B2547a001003Cca84F62F557A72',
  testnet: '0x5cA4C88339D89B2547a001003Cca84F62F557A72', // TODO: Update with actual testnet address
} as const;

/**
 * PEPPER token addresses by network
 */
export const PEPPER_TOKEN_ADDRESSES = {
  mainnet: PEPPER_TOKEN_ADDRESS,
  testnet: PEPPER_TOKEN_ADDRESS, // TODO: Update with testnet token address if different
} as const;

/**
 * Get the staking contract address based on environment
 */
export function getStakingContractAddress(): string {
  return __DEV__ ? STAKING_CONTRACT_ADDRESSES.testnet : STAKING_CONTRACT_ADDRESSES.mainnet;
}

/**
 * Get the PEPPER token address based on environment
 */
export function getPepperTokenAddress(): string {
  return __DEV__ ? PEPPER_TOKEN_ADDRESSES.testnet : PEPPER_TOKEN_ADDRESSES.mainnet;
}

/**
 * ERC-20 Token ABI (subset for staking operations)
 */
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
] as const;

/**
 * Staking Contract ABI
 * Standard staking contract interface for stake/unstake/claim operations
 */
export const STAKING_ABI = [
  // Write functions
  'function stake(uint256 amount) external',
  'function unstake(uint256 amount) external',
  'function withdraw(uint256 amount) external', // Alternative to unstake
  'function claim() external',
  'function getReward() external', // Alternative to claim
  'function exit() external', // Unstake all + claim rewards

  // Read functions
  'function stakedBalance(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)', // Alternative to stakedBalance
  'function earned(address account) view returns (uint256)',
  'function totalStaked() view returns (uint256)',
  'function totalSupply() view returns (uint256)', // Alternative to totalStaked
  'function rewardRate() view returns (uint256)',
  'function rewardPerToken() view returns (uint256)',
  'function lastUpdateTime() view returns (uint256)',
  'function periodFinish() view returns (uint256)',

  // Events
  'event Staked(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
  'event RewardPaid(address indexed user, uint256 reward)',
] as const;

/**
 * Staking data interface for user balances and rewards
 */
export interface StakingData {
  walletBalance: bigint;
  stakedBalance: bigint;
  earnedRewards: bigint;
  allowance: bigint;
  totalStaked: bigint;
  decimals: number;
}

/**
 * Transaction status for staking operations
 */
export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

/**
 * Staking transaction result
 */
export interface StakingTransactionResult {
  status: TransactionStatus;
  txHash?: string;
  error?: string;
}

/**
 * Staking error codes mapped to user-friendly messages
 */
export const STAKING_ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_BALANCE: 'Not enough PEPPER tokens in your wallet',
  INSUFFICIENT_ALLOWANCE: 'Please approve tokens before staking',
  INSUFFICIENT_STAKED: 'Not enough staked tokens to withdraw',
  AMOUNT_ZERO: 'Amount must be greater than 0',
  LOCK_ACTIVE: 'Your tokens are still locked',
  USER_REJECTED: 'Transaction was cancelled',
  NETWORK_ERROR: 'Network error, please try again',
  CONTRACT_ERROR: 'Contract error, please try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

/**
 * Parse staking contract error to user-friendly message
 */
export function parseStakingError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('user rejected') || message.includes('user denied')) {
      return STAKING_ERROR_MESSAGES.USER_REJECTED;
    }
    if (message.includes('insufficient balance') || message.includes('exceeds balance')) {
      return STAKING_ERROR_MESSAGES.INSUFFICIENT_BALANCE;
    }
    if (message.includes('insufficient allowance') || message.includes('allowance')) {
      return STAKING_ERROR_MESSAGES.INSUFFICIENT_ALLOWANCE;
    }
    if (message.includes('network') || message.includes('timeout')) {
      return STAKING_ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    return error.message;
  }
  
  return STAKING_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Maximum approval amount (uint256 max)
 */
export const MAX_APPROVAL = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

/**
 * Default token decimals for PEPPER
 */
export const PEPPER_DECIMALS = 18;


