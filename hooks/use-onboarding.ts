import { useCallback, useEffect, useState } from 'react';

import { STORAGE_KEYS, StorageService } from '@/lib/storage';
import { telemetry } from '@/lib/telemetry';

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding status on mount
  useEffect(() => {
    const completed = StorageService.getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED) ?? false;
    setHasCompletedOnboarding(completed);
    setIsLoading(false);
  }, []);

  /**
   * Mark onboarding as completed
   */
  const completeOnboarding = useCallback((action: 'explore' | 'connect') => {
    StorageService.setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    setHasCompletedOnboarding(true);
    
    // Track onboarding completion
    telemetry.track('onboarding_completed', { action });
  }, []);

  /**
   * Reset onboarding (for testing)
   */
  const resetOnboarding = useCallback(() => {
    StorageService.remove(STORAGE_KEYS.ONBOARDING_COMPLETED);
    setHasCompletedOnboarding(false);
    telemetry.track('onboarding_reset');
  }, []);

  return {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
    shouldShowOnboarding: !isLoading && !hasCompletedOnboarding,
  };
}

