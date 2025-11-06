import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useOnboardingContext } from '@/contexts/onboarding-context';
import { useWalletActions } from '@/hooks/use-wallet-actions';
import { useWalletState } from '@/hooks/use-wallet-state';

/**
 * Settings / Debug Modal
 * Provides access to app settings and debug features
 */
export default function ModalScreen() {
  const { resetOnboarding, hasCompletedOnboarding } = useOnboardingContext();
  const { isConnected, displayAddress } = useWalletState();
  const { disconnectWallet } = useWalletActions();

  function handleResetOnboarding() {
    Alert.alert(
      'Reset Onboarding',
      'This will show the welcome screen next time you open the app. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Success', 'Onboarding reset! Restart the app to see the welcome screen.');
          },
        },
      ],
    );
  }

  async function handleDisconnect() {
    Alert.alert('Disconnect Wallet', 'Are you sure you want to disconnect?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          try {
            await disconnectWallet();
            Alert.alert('Disconnected', 'Wallet disconnected successfully');
          } catch {
            Alert.alert('Error', 'Failed to disconnect wallet');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 space-y-6">
        {/* Header */}
        <View className="border-4 border-white bg-[#8000FF] p-6 shadow-[4px_4px_0px_#FFFFFF]">
          <Text className="font-bold text-2xl text-white uppercase tracking-wider mb-2">
            SETTINGS
          </Text>
          <Text className="text-sm text-white opacity-90">
            Configure your app preferences
          </Text>
        </View>

        {/* Wallet Section */}
        <View className="space-y-3">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            WALLET
          </Text>

          <View className="border-3 border-white bg-[#1a1a1a] p-4">
            <Text className="text-white text-sm mb-2">
              <Text className="font-bold">Status:</Text>{' '}
              {isConnected ? '✓ Connected' : '✗ Not Connected'}
            </Text>
            {isConnected && (
              <Text className="text-white text-sm mb-4">
                <Text className="font-bold">Address:</Text> {displayAddress}
              </Text>
            )}

            {isConnected && (
              <Pressable
                onPress={handleDisconnect}
                className="bg-[#FF006E] border-3 border-white px-6 py-3 shadow-[3px_3px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
                  DISCONNECT
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Onboarding Section */}
        <View className="space-y-3">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            ONBOARDING
          </Text>

          <View className="border-3 border-white bg-[#1a1a1a] p-4">
            <Text className="text-white text-sm mb-4">
              <Text className="font-bold">Completed:</Text>{' '}
              {hasCompletedOnboarding ? 'Yes ✓' : 'No ✗'}
            </Text>

            <Pressable
              onPress={handleResetOnboarding}
              className="bg-[#808080] border-3 border-white px-6 py-3 shadow-[3px_3px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
                RESET ONBOARDING
              </Text>
            </Pressable>

            <Text className="text-[#808080] text-xs mt-3">
              Restart the app after resetting to see the welcome screen
            </Text>
          </View>
        </View>

        {/* Navigation */}
        <View className="space-y-3 pb-8">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            NAVIGATION
          </Text>

          <Pressable
            onPress={() => router.push('/wallet-demo')}
            className="bg-[#0080FF] border-3 border-white px-6 py-3 shadow-[3px_3px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
              WALLET DEMO
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            className="bg-[#00FF80] border-3 border-white px-6 py-3 shadow-[3px_3px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Text className="font-bold text-sm text-black uppercase tracking-wider text-center">
              ← BACK TO APP
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
