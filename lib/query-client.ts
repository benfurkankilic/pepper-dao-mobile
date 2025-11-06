import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { AppStateStatus } from 'react-native';
import { AppState, Platform } from 'react-native';

/**
 * Configure QueryClient with optimized defaults for React Native
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 24 hours by default
      gcTime: 1000 * 60 * 60 * 24,
      // Retry failed requests 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Stale time of 5 minutes
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

/**
 * Setup app state listener for React Native
 * Manages query refetching when app comes to foreground
 */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

/**
 * Hook to setup TanStack Query for React Native
 * Must be called in the root component
 */
export function useAppStateListener() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);

    return () => subscription.remove();
  }, []);
}

/**
 * Configure online manager (to be implemented with NetInfo)
 * This will be integrated when network state management is added
 */
export function setupOnlineManager() {
  // TODO: Integrate with @react-native-community/netinfo or expo-network
  // For now, we'll assume the device is always online
  onlineManager.setOnline(true);
}

