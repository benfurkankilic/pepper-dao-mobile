import { createPublicClient, http } from 'viem';

import { PRIMARY_CHAIN } from '../config/chains';
import {
  PEPPER_TOKEN_ADDRESS,
  PEPPER_TREASURY_ADDRESSES,
} from '../config/pepper-token';

export interface PepperTokenMetadata {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
}

export interface PepperAddressBalance {
  address: string;
  balance: bigint;
}

const ERC20_ABI = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const publicClient = createPublicClient({
  chain: PRIMARY_CHAIN,
  transport: http(),
});

/**
 * Fetch generic ERC-20 token metadata from Chiliscan.
 *
 * The exact API shape may differ between environments; this implementation
 * follows an Etherscan-compatible style and can be adapted if needed.
 */
export async function fetchTokenMetadata(
  tokenAddress: string,
): Promise<PepperTokenMetadata> {
  const [decimalsRaw, totalSupply] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    }),
    publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'totalSupply',
    }),
  ]);

  const decimals = Number(decimalsRaw);

  return {
    address: tokenAddress,
    name: 'Pepper',
    symbol: 'PEPPER',
    decimals,
    totalSupply: BigInt(totalSupply),
  };
}

/**
 * Fetch Pepper token metadata using the configured contract address.
 */
export async function fetchPepperTokenMetadata(): Promise<PepperTokenMetadata> {
  return fetchTokenMetadata(PEPPER_TOKEN_ADDRESS);
}

/**
 * Fetch the Pepper token balance for a single address.
 */
export async function fetchAddressPepperBalance(
  address: string,
): Promise<PepperAddressBalance> {
  const balance = await publicClient.readContract({
    address: PEPPER_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  return {
    address,
    balance,
  };
}

/**
 * Fetch Pepper balances for a list of addresses.
 * This is implemented as a simple Promise.all wrapper so it works even if
 * the underlying API does not support true batch calls.
 */
export async function fetchPepperBalances(
  addresses: Array<string>,
): Promise<Array<PepperAddressBalance>> {
  if (addresses.length === 0) {
    return [];
  }

  const promises = addresses.map((address) => fetchAddressPepperBalance(address));

  return Promise.all(promises);
}

/**
 * Convenience helper for fetching balances of the configured DAO
 * Pepper treasury addresses.
 */
export async function fetchPepperTreasuryBalances(): Promise<
  Array<PepperAddressBalance>
> {
  return fetchPepperBalances(PEPPER_TREASURY_ADDRESSES);
}


