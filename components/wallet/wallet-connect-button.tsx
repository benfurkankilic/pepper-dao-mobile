import { Button } from '@/components/ui/button';
import { useWalletActions } from '@/hooks/use-wallet-actions';
import { useWalletState } from '@/hooks/use-wallet-state';

interface WalletConnectButtonProps {
  onPress?: () => void;
  className?: string;
}

/**
 * Retro-styled wallet connection button
 * Shows "Connect Wallet" when disconnected, short address when connected
 */
export function WalletConnectButton({ onPress, className = '' }: WalletConnectButtonProps) {
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

  const buttonText = isConnecting
    ? 'Connecting...'
    : isConnected
      ? displayAddress || 'Connected'
      : 'Connect Wallet';

  const variant = isConnected ? 'success' : 'primary';

  return (
    <Button
      onPress={handlePress}
      variant={variant}
      disabled={isConnecting}
      className={className}
    >
      {buttonText}
    </Button>
  );
}

