/**
 * Staking API Service
 *
 * Provides contract interaction methods for PEPPER token staking.
 * Uses ethers.js for contract calls and integrates with Reown AppKit
 * for wallet provider access.
 */

import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import { createPublicClient, http } from 'viem';

import { ACTIVE_CHAIN } from '@/config/chains';
import {
  ERC20_ABI,
  getPepperTokenAddress,
  getStakingContractAddress,
  MAX_APPROVAL,
  parseStakingError,
  PEPPER_DECIMALS,
  STAKING_ABI,
  type StakingData,
  type StakingTransactionResult,
} from '@/config/staking';

/**
 * EIP-1193 compatible provider interface
 * Works with both ethers Eip1193Provider and AppKit's Provider
 */
interface Eip1193Provider {
  request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
}

/**
 * Public client for read-only operations
 */
const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(),
});

/**
 * Fetch staking data for a user address
 * Reads wallet balance, staked balance, earned rewards, and allowance
 */
export async function fetchStakingData(userAddress: string): Promise<StakingData> {
  const tokenAddress = getPepperTokenAddress() as `0x${string}`;
  const stakingAddress = getStakingContractAddress() as `0x${string}`;
  const user = userAddress as `0x${string}`;

  // Define ABIs for viem
  const erc20Abi = [
    {
      type: 'function',
      name: 'balanceOf',
      stateMutability: 'view',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'allowance',
      stateMutability: 'view',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'decimals',
      stateMutability: 'view',
      inputs: [],
      outputs: [{ name: '', type: 'uint8' }],
    },
  ] as const;

  const stakingAbi = [
    {
      type: 'function',
      name: 'getStake',
      stateMutability: 'view',
      inputs: [
        { name: 'staker', type: 'address' },
        { name: 'token', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
    },
    {
      type: 'function',
      name: 'getStakeData',
      stateMutability: 'view',
      inputs: [
        { name: 'staker', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'perEventType', type: 'bool' },
      ],
      outputs: [
        {
          name: '',
          type: 'tuple',
          components: [
            { name: 'totalStake', type: 'uint256' },
            { name: 'totalUnstakable', type: 'uint256' },
            { name: 'totalLocked', type: 'uint256' },
            { name: 'totalLockedFlexible', type: 'uint256' },
            { name: 'totalClaimable', type: 'uint256' },
            { name: 'totalPendingUnstake', type: 'uint256' },
            { name: 'totalExemptFromCooldownPeriod', type: 'uint256' },
            { name: 'totalLockedPerEventType', type: 'uint256[]' },
          ],
        },
      ],
    },
    {
      type: 'function',
      name: 'getTotalStake',
      stateMutability: 'view',
      inputs: [{ name: 'token', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
    },
  ] as const;

  try {
    // Batch all read calls
    const [walletBalance, allowance, decimals, stakeData, totalStaked] =
      await Promise.all([
        // Token contract calls
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [user],
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [user, stakingAddress],
        }),
        publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'decimals',
        }),
        // Staking contract calls
        publicClient.readContract({
          address: stakingAddress,
          abi: stakingAbi,
          functionName: 'getStakeData',
          args: [user, tokenAddress, false],
        }),
        publicClient.readContract({
          address: stakingAddress,
          abi: stakingAbi,
          functionName: 'getTotalStake',
          args: [tokenAddress],
        }),
      ]);

    // Extract staked balance and claimable rewards from stakeData struct
    const stakedBalance = stakeData.totalStake;
    const earnedRewards = stakeData.totalClaimable;

    return {
      walletBalance,
      stakedBalance,
      earnedRewards,
      allowance,
      totalStaked,
      decimals: Number(decimals),
    };
  } catch (error) {
    console.error('[StakingAPI] Failed to fetch staking data:', error);
    // Return default values on error
    return {
      walletBalance: BigInt(0),
      stakedBalance: BigInt(0),
      earnedRewards: BigInt(0),
      allowance: BigInt(0),
      totalStaked: BigInt(0),
      decimals: PEPPER_DECIMALS,
    };
  }
}

/**
 * Create ethers provider and signer from Reown wallet provider
 */
async function getProviderAndSigner(walletProvider: Eip1193Provider) {
  const provider = new BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  return { provider, signer };
}

/**
 * Approve tokens for staking
 * @param walletProvider - EIP-1193 provider from Reown AppKit
 * @param amount - Amount to approve (in human-readable format, e.g., "100")
 * @param useMaxApproval - If true, approves max uint256 amount
 */
export async function approveTokens(
  walletProvider: Eip1193Provider,
  amount: string,
  useMaxApproval = false
): Promise<StakingTransactionResult> {
  try {
    const { signer } = await getProviderAndSigner(walletProvider);
    const tokenAddress = getPepperTokenAddress();
    const stakingAddress = getStakingContractAddress();

    const tokenContract = new Contract(tokenAddress, ERC20_ABI, signer);

    const approvalAmount = useMaxApproval
      ? MAX_APPROVAL
      : parseUnits(amount, PEPPER_DECIMALS);

    console.log('[StakingAPI] Approving tokens:', {
      tokenAddress,
      stakingAddress,
      amount: approvalAmount.toString(),
      useMaxApproval,
    });

    const tx = await tokenContract.approve(stakingAddress, approvalAmount);
    
    console.log('[StakingAPI] Approval tx submitted:', tx.hash);
    
    // Wait for confirmation (can return null if not mined)
    const receipt = await tx.wait();
    const txHash = receipt?.hash ?? tx.hash;
    
    console.log('[StakingAPI] Approval confirmed:', txHash);

    return {
      status: 'success',
      txHash,
    };
  } catch (error) {
    console.error('[StakingAPI] Approval failed:', error);
    return {
      status: 'error',
      error: parseStakingError(error),
    };
  }
}

/**
 * Stake PEPPER tokens
 * @param walletProvider - EIP-1193 provider from Reown AppKit
 * @param amount - Amount to stake (in human-readable format, e.g., "100")
 */
export async function stakeTokens(
  walletProvider: Eip1193Provider,
  amount: string
): Promise<StakingTransactionResult> {
  try {
    const { signer } = await getProviderAndSigner(walletProvider);
    const stakingAddress = getStakingContractAddress();
    const tokenAddress = getPepperTokenAddress();

    const stakingContract = new Contract(stakingAddress, STAKING_ABI, signer);
    const stakeAmount = parseUnits(amount, PEPPER_DECIMALS);

    console.log('[StakingAPI] Staking tokens:', {
      stakingAddress,
      tokenAddress,
      amount: stakeAmount.toString(),
    });

    const tx = await stakingContract.stake(stakeAmount, tokenAddress);
    
    console.log('[StakingAPI] Stake tx submitted:', tx.hash);
    
    // Wait for confirmation (can return null if not mined)
    const receipt = await tx.wait();
    const txHash = receipt?.hash ?? tx.hash;
    
    console.log('[StakingAPI] Stake confirmed:', txHash);

    return {
      status: 'success',
      txHash,
    };
  } catch (error) {
    console.error('[StakingAPI] Stake failed:', error);
    return {
      status: 'error',
      error: parseStakingError(error),
    };
  }
}

/**
 * Unstake PEPPER tokens
 * @param walletProvider - EIP-1193 provider from Reown AppKit
 * @param amount - Amount to unstake (in human-readable format, e.g., "100")
 */
export async function unstakeTokens(
  walletProvider: Eip1193Provider,
  amount: string
): Promise<StakingTransactionResult> {
  try {
    const { signer } = await getProviderAndSigner(walletProvider);
    const stakingAddress = getStakingContractAddress();
    const tokenAddress = getPepperTokenAddress();

    const stakingContract = new Contract(stakingAddress, STAKING_ABI, signer);
    const unstakeAmount = parseUnits(amount, PEPPER_DECIMALS);

    console.log('[StakingAPI] Unstaking tokens:', {
      stakingAddress,
      tokenAddress,
      amount: unstakeAmount.toString(),
    });

    const tx = await stakingContract.unstake(unstakeAmount, tokenAddress);
    
    console.log('[StakingAPI] Unstake tx submitted:', tx.hash);
    
    // Wait for confirmation (can return null if not mined)
    const receipt = await tx.wait();
    const txHash = receipt?.hash ?? tx.hash;
    
    console.log('[StakingAPI] Unstake confirmed:', txHash);

    return {
      status: 'success',
      txHash,
    };
  } catch (error) {
    console.error('[StakingAPI] Unstake failed:', error);
    return {
      status: 'error',
      error: parseStakingError(error),
    };
  }
}

/**
 * Claim staking rewards
 * @param walletProvider - EIP-1193 provider from Reown AppKit
 */
export async function claimRewards(
  walletProvider: Eip1193Provider
): Promise<StakingTransactionResult> {
  try {
    const { signer } = await getProviderAndSigner(walletProvider);
    const stakingAddress = getStakingContractAddress();
    const tokenAddress = getPepperTokenAddress();

    const stakingContract = new Contract(stakingAddress, STAKING_ABI, signer);

    console.log('[StakingAPI] Claiming rewards:', { stakingAddress, tokenAddress });

    const tx = await stakingContract.claim(tokenAddress);
    
    console.log('[StakingAPI] Claim tx submitted:', tx.hash);
    
    // Wait for confirmation (can return null if not mined)
    const receipt = await tx.wait();
    const txHash = receipt?.hash ?? tx.hash;
    
    console.log('[StakingAPI] Claim confirmed:', txHash);

    return {
      status: 'success',
      txHash,
    };
  } catch (error) {
    console.error('[StakingAPI] Claim failed:', error);
    return {
      status: 'error',
      error: parseStakingError(error),
    };
  }
}

/**
 * Format token amount from raw bigint to human-readable string
 */
export function formatTokenAmount(amount: bigint, decimals: number = PEPPER_DECIMALS): string {
  return formatUnits(amount, decimals);
}

/**
 * Parse token amount from human-readable string to bigint
 */
export function parseTokenAmount(amount: string, decimals: number = PEPPER_DECIMALS): bigint {
  return parseUnits(amount, decimals);
}

/**
 * Check if user has sufficient allowance for staking
 */
export function hasAllowance(allowance: bigint, amount: string): boolean {
  const amountBigInt = parseUnits(amount, PEPPER_DECIMALS);
  return allowance >= amountBigInt;
}

/**
 * Check if user has sufficient wallet balance for staking
 */
export function hasWalletBalance(walletBalance: bigint, amount: string): boolean {
  const amountBigInt = parseUnits(amount, PEPPER_DECIMALS);
  return walletBalance >= amountBigInt;
}

/**
 * Check if user has sufficient staked balance for unstaking
 */
export function hasStakedBalance(stakedBalance: bigint, amount: string): boolean {
  const amountBigInt = parseUnits(amount, PEPPER_DECIMALS);
  return stakedBalance >= amountBigInt;
}


