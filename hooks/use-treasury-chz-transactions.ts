import { useQuery } from '@tanstack/react-query';

import {
  fetchTreasuryChzTxs,
  type TreasuryChzTx,
  type TreasuryWindow,
} from '@/services/chiliz-api';

interface UseTreasuryChzTransactionsResult {
  transactions?: Array<TreasuryChzTx>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTreasuryChzTransactions(
  window: TreasuryWindow,
  enabled: boolean,
): UseTreasuryChzTransactionsResult {
  const query = useQuery<Array<TreasuryChzTx>, Error>({
    queryKey: ['pepper', 'treasury-txs', window],
    queryFn: () => fetchTreasuryChzTxs(window),
    enabled,
    staleTime: 60 * 1000,
    refetchOnMount: 'always',
  });

  return {
    transactions: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
    refetch: () => {
      void query.refetch();
    },
  };
}


