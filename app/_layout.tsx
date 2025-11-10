// Crypto polyfill must be imported first for Web3 libraries
import 'react-native-get-random-values';
import 'react-native-reanimated';
import '../global.css';

import { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';

import { Stack } from 'expo-router';

import { QueryClientProvider } from '@tanstack/react-query';

import { OnboardingGate } from '@/components/onboarding';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { WalletProvider } from '@/contexts/wallet-context';

import { loadFontsAsync } from '@/lib/fonts';
import { queryClient, useAppStateListener } from '@/lib/query-client';

// Import AppKit configuration and component
// This must be imported to initialize AppKit
import { appKit, AppKit } from '@/config/appkit';
import { AppKitProvider } from '@reown/appkit-react-native';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Setup app state listener for query refetching
  useAppStateListener();

  useEffect(() => {
    async function prepare() {
      try {
        await loadFontsAsync();
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppKitProvider instance={appKit}>
        <QueryClientProvider client={queryClient}>
          <OnboardingProvider>
            <WalletProvider>
              <OnboardingGate>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
              </OnboardingGate>
              <StatusBar style="dark" />
              
              {/* AppKit Modal - Android requires absolute positioning with Expo Router */}
              {Platform.OS === 'android' ? (
                <View style={{ position: 'absolute', height: '100%', width: '100%' }}>
                  <AppKit />
                </View>
              ) : (
                <AppKit />
              )}
            </WalletProvider>
          </OnboardingProvider>
        </QueryClientProvider>
      </AppKitProvider>
    </SafeAreaProvider>
  );
}
