import { useAccount } from '@reown/appkit-react-native';
import { ActivityIndicator, View } from 'react-native';

import { useOnboardingContext } from '@/contexts/onboarding-context';

import { WalletConnectionModal, useWalletConnectionModal } from './wallet-connection-modal';

interface OnboardingGateProps {
  children: React.ReactNode;
}

/**
 * Onboarding Gate Component
 * Shows wallet connection modal to users who haven't connected,
 * or app content to users who are connected or have dismissed the modal
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLoading } = useOnboardingContext();
  const { isConnected } = useAccount();
  const { visible, handleDismiss } = useWalletConnectionModal(isConnected);

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#00FF80" />
      </View>
    );
  }

  return (
    <>
      {children}
      <WalletConnectionModal visible={visible} onDismiss={handleDismiss} />
    </>
  );
}

