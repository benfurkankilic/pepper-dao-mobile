import { useEffect, useRef } from 'react';

import { useUser } from '@/contexts/user-context';
import { useWallet } from '@/contexts/wallet-context';

/**
 * Wallet Profile Linker
 *
 * Automatically links wallet address to user profile when connected.
 * Also handles rank recalculation for profiles that already have a wallet.
 * This component should be rendered inside both UserProvider and WalletProvider.
 */
export function WalletProfileLinker({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useWallet();
  const { profile, updateWalletAddress } = useUser();
  const previousAddressRef = useRef<string | undefined>(undefined);
  const hasRecalculatedRankRef = useRef(false);

  useEffect(() => {
    async function linkWallet() {
      if (!isConnected || !address || !profile) {
        // Clear references when disconnected
        if (!isConnected) {
          previousAddressRef.current = undefined;
          hasRecalculatedRankRef.current = false;
        }
        return;
      }

      // Case 1: New wallet address - link it
      const isNewAddress = profile.wallet_address !== address && previousAddressRef.current !== address;

      // Case 2: Wallet already linked but rank is OBSERVER (needs recalculation)
      // This handles profiles created before rank promotion was implemented
      const needsRankRecalculation =
        profile.wallet_address === address &&
        profile.rank === 'OBSERVER' &&
        !hasRecalculatedRankRef.current;

      if (isNewAddress || needsRankRecalculation) {
        const reason = isNewAddress ? 'new address' : 'rank recalculation';
        console.log(`[WalletProfileLinker] Updating wallet (${reason}):`, address);

        previousAddressRef.current = address;
        if (needsRankRecalculation) {
          hasRecalculatedRankRef.current = true;
        }

        try {
          await updateWalletAddress(address);
          console.log('[WalletProfileLinker] Wallet updated successfully');
        } catch (error) {
          console.error('[WalletProfileLinker] Failed to update wallet:', error);
        }
      }
    }

    linkWallet();
  }, [address, isConnected, profile, updateWalletAddress]);

  return <>{children}</>;
}
