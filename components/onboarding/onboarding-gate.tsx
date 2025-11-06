import { ActivityIndicator, View } from 'react-native';

import { useOnboardingContext } from '@/contexts/onboarding-context';

import { WelcomeScreen } from './welcome-screen';

interface OnboardingGateProps {
  children: React.ReactNode;
}

/**
 * Onboarding Gate Component
 * Shows onboarding screen to new users, or app content to returning users
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const { shouldShowOnboarding, isLoading, completeOnboarding } = useOnboardingContext();

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#00FF80" />
      </View>
    );
  }

  // Show onboarding for new users
  if (shouldShowOnboarding) {
    return <WelcomeScreen onComplete={completeOnboarding} />;
  }

  // Show main app for returning users
  return <>{children}</>;
}

