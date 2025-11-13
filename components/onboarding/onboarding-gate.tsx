import { useAccount } from '@reown/appkit-react-native';
import { ActivityIndicator, View } from 'react-native';

import { useOnboardingContext } from '@/contexts/onboarding-context';

import { OnboardingWizard } from './onboarding-wizard';
import { WalletConnectionModal, useWalletConnectionModal } from './wallet-connection-modal';

interface OnboardingGateProps {
  children: React.ReactNode;
}

/**
 * Onboarding Gate Component
 * Shows onboarding wizard for first-time users,
 * then wallet connection modal for connection,
 * or app content for users who have completed onboarding
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLoading, shouldShowOnboarding, hasCompletedOnboarding, completeOnboarding } = useOnboardingContext();
  const { isConnected } = useAccount();
  const { visible, handleDismiss } = useWalletConnectionModal(isConnected, hasCompletedOnboarding);

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF006E" />
      </View>
    );
  }

  // Show onboarding wizard if not completed
  if (shouldShowOnboarding) {
    return (
      <OnboardingWizard
        onComplete={() => completeOnboarding('explore')}
        onSkip={() => completeOnboarding('explore')}
      />
    );
  }

  // Show app content with wallet modal overlay
  return (
    <>
      {children}
      <WalletConnectionModal visible={visible} onDismiss={handleDismiss} />
    </>
  );
}

