import { createContext, useContext } from 'react';

import { useOnboarding } from '@/hooks/use-onboarding';

/**
 * Onboarding Context Value
 */
interface OnboardingContextValue {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  shouldShowOnboarding: boolean;
  completeOnboarding: (action: 'explore' | 'connect') => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

/**
 * Onboarding Provider Component
 */
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const onboarding = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * Hook to access onboarding context
 */
export function useOnboardingContext(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
}

