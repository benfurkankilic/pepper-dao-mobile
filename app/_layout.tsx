// Crypto polyfill must be imported first for Web3 libraries
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { OnboardingGate } from '@/components/onboarding';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { WalletProvider } from '@/contexts/wallet-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient, useAppStateListener } from '@/lib/query-client';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Setup app state listener for query refetching
  useAppStateListener();

  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <WalletProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <OnboardingGate>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
            </OnboardingGate>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WalletProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
