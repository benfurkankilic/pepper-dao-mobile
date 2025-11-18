import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
  PEPPER_BURN_ADDRESSES,
  PEPPER_STAKING_CONTRACT_ADDRESSES,
  PepperTokenMetrics,
} from '@/config/pepper-token';
import { telemetry } from '@/lib/telemetry';
import {
  fetchPepperBalances,
  fetchPepperTokenMetadata,
  fetchPepperTreasuryBalances,
  type PepperAddressBalance,
} from '@/services/chiliz-api';

export function sumBalances(balances: Array<PepperAddressBalance>): bigint {
  return balances.reduce<bigint>((sum, item) => {
    return sum + item.balance;
  }, BigInt(0));
}

export function calculateCirculatingSupply(
  totalSupply: bigint,
  burnedAmount: bigint,
  stakedAmount: bigint,
  treasuryBalance: bigint,
): bigint {
  const circulating = totalSupply - burnedAmount - stakedAmount - treasuryBalance;

  if (circulating < BigInt(0)) {
    return BigInt(0);
  }

  return circulating;
}

async function loadPepperTokenMetrics(): Promise<PepperTokenMetrics> {
  const [metadata, treasuryBalances, burnBalances, stakingBalances] =
    await Promise.all([
      fetchPepperTokenMetadata(),
      fetchPepperTreasuryBalances(),
      fetchPepperBalances(PEPPER_BURN_ADDRESSES),
      fetchPepperBalances(PEPPER_STAKING_CONTRACT_ADDRESSES),
    ]);

  const treasuryBalance = sumBalances(treasuryBalances);
  const burnedAmount = sumBalances(burnBalances);
  const stakedAmount = sumBalances(stakingBalances);

  const circulatingSupply = calculateCirculatingSupply(
    metadata.totalSupply,
    burnedAmount,
    stakedAmount,
    treasuryBalance,
  );

  return {
    totalSupply: metadata.totalSupply,
    burnedAmount,
    stakedAmount,
    treasuryBalance,
    circulatingSupply,
    decimals: metadata.decimals,
    updatedAt: new Date().toISOString(),
    hasBurnData: PEPPER_BURN_ADDRESSES.length > 0,
    hasStakedData: PEPPER_STAKING_CONTRACT_ADDRESSES.length > 0,
  };
}

interface UsePepperTokenMetricsResult {
  metrics?: PepperTokenMetrics;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  lastUpdated: string | null;
  refetch: () => void;
}

export function usePepperTokenMetrics(): UsePepperTokenMetricsResult {
  const query = useQuery<PepperTokenMetrics, Error>({
    queryKey: ['pepper', 'token-metrics'],
    queryFn: loadPepperTokenMetrics,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }

    telemetry.trackPepperMetricsRefreshed(query.data.updatedAt);
  }, [query.data]);

  useEffect(() => {
    if (!query.error) {
      return;
    }

    telemetry.trackPepperMetricsError(query.error.message);
  }, [query.error]);

  return {
    metrics: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => {
      void query.refetch();
    },
    isFetching: query.isFetching,
    lastUpdated: query.data?.updatedAt ?? null,
  };
}


