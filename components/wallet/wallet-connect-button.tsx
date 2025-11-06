import { Pressable, Text } from 'react-native';

import { useWalletActions } from '@/hooks/use-wallet-actions';
import { useWalletState } from '@/hooks/use-wallet-state';

interface WalletConnectButtonProps {
  onPress?: () => void;
}

/**
 * Retro-styled wallet connection button
 * Shows "Connect Wallet" when disconnected, short address when connected
 */
export function WalletConnectButton({ onPress }: WalletConnectButtonProps) {
  const { isConnected, displayAddress, isConnecting } = useWalletState();
  const { connectWallet } = useWalletActions();

  async function handlePress() {
    if (onPress) {
      onPress();
      return;
    }

    if (!isConnected && !isConnecting) {
      try {
        await connectWallet();
      } catch (error) {
        // Error is already handled in the hook
        console.error('Connection error:', error);
      }
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isConnecting}
      className={`
        border-4 border-white px-6 py-3
        shadow-[4px_4px_0px_#000000]
        active:shadow-none active:translate-x-1 active:translate-y-1
        ${isConnected ? 'bg-[#00FF80]' : 'bg-[#FF006E]'}
        ${isConnecting ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
        {isConnecting
          ? 'CONNECTING...'
          : isConnected
            ? displayAddress
            : 'CONNECT WALLET'}
      </Text>
    </Pressable>
  );
}

