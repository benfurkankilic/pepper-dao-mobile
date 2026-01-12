import { useEffect, useRef } from 'react';

import { useUser } from '@/contexts/user-context';
import { useWallet } from '@/contexts/wallet-context';

/**
 * Wallet Profile Linker
 *
 * Automatically links wallet address to user profile when connected.
 * This component should be rendered inside both UserProvider and WalletProvider.
 */
export function WalletProfileLinker({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useWallet();
  const { profile, updateWalletAddress } = useUser();
  const previousAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    async function linkWallet() {
      // Only link if:
      // 1. Wallet is connected
      // 2. We have an address
      // 3. We have a profile
      // 4. The address is different from what's stored
      // 5. The address changed (to prevent loops)
      if (
        isConnected &&
        address &&
        profile &&
        profile.wallet_address !== address &&
        previousAddressRef.current !== address
      ) {
        console.log('[WalletProfileLinker] Linking wallet to profile:', address);
        previousAddressRef.current = address;

        try {
          await updateWalletAddress(address);
          console.log('[WalletProfileLinker] Wallet linked successfully');
        } catch (error) {
          console.error('[WalletProfileLinker] Failed to link wallet:', error);
        }
      }

      // Clear reference when disconnected
      if (!isConnected) {
        previousAddressRef.current = undefined;
      }
    }

    linkWallet();
  }, [address, isConnected, profile, updateWalletAddress]);

  return <>{children}</>;
}
