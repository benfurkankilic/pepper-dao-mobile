// Crypto polyfill must be imported first for Web3 libraries
import 'react-native-get-random-values';
import 'react-native-reanimated';
import '../global.css';

import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';

import { Stack, useRouter } from 'expo-router';

import { QueryClientProvider } from '@tanstack/react-query';
import type { EventSubscription } from 'expo-notifications';

import { OnboardingGate } from '@/components/onboarding';
import { WalletProfileLinker } from '@/components/wallet';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { UserProvider } from '@/contexts/user-context';
import { WalletProvider } from '@/contexts/wallet-context';

import { loadFontsAsync } from '@/lib/fonts';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  registerPushToken,
  setupNotificationChannel,
  type PushNotificationData,
} from '@/lib/push-notifications';
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
  const router = useRouter();

  // Refs for notification listeners
  const notificationReceivedRef = useRef<EventSubscription>();
  const notificationResponseRef = useRef<EventSubscription>();

  // Setup app state listener for query refetching
  useAppStateListener();

  /**
   * Handle push notification navigation
   */
  function handleNotificationNavigation(data: PushNotificationData) {
    console.log('[Layout] Handling notification:', data);

    if (data.type === 'new_proposal' && data.proposalId) {
      // Navigate to the specific proposal
      router.push(`/governance/${data.proposalId}`);
    } else if (data.screen === 'governance') {
      // Navigate to governance tab
      router.push('/(tabs)/governance');
    }
  }

  /**
   * Initialize push notifications
   */
  useEffect(() => {
    async function initPushNotifications() {
      try {
        // Setup Android notification channel
        await setupNotificationChannel();

        // Register push token with Supabase
        await registerPushToken();

        // Check if app was launched from a notification
        const lastResponse = await getLastNotificationResponse();
        if (lastResponse) {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            handleNotificationNavigation(lastResponse);
          }, 500);
        }

        // Listen for notifications received while app is in foreground
        notificationReceivedRef.current = addNotificationReceivedListener(
          (notification) => {
            console.log('[Layout] Notification received in foreground:', notification);
            // Optionally invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] });
          },
        );

        // Listen for notification responses (when user taps notification)
        notificationResponseRef.current = addNotificationResponseListener(
          handleNotificationNavigation,
        );

        console.log('[Layout] Push notifications initialized');
      } catch (error) {
        console.error('[Layout] Failed to initialize push notifications:', error);
      }
    }

    initPushNotifications();

    // Cleanup listeners on unmount
    return () => {
      notificationReceivedRef.current?.remove();
      notificationResponseRef.current?.remove();
    };
  }, []);

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
          <UserProvider>
            <OnboardingProvider>
              <WalletProvider>
                <WalletProfileLinker>
                  <OnboardingGate>
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                      <Stack.Screen
                        name="governance/[proposalId]"
                        options={{ title: 'Proposal' }}
                      />
                      <Stack.Screen
                        name="governance/create"
                        options={{
                          presentation: 'modal',
                          headerShown: false,
                        }}
                      />
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
                </WalletProfileLinker>
              </WalletProvider>
            </OnboardingProvider>
          </UserProvider>
        </QueryClientProvider>
      </AppKitProvider>
    </SafeAreaProvider>
  );
}
