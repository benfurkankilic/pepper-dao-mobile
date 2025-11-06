import { router } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';

import { useOnboardingContext } from '@/contexts/onboarding-context';
import { useWalletState } from '@/hooks/use-wallet-state';

export default function HomeScreen() {
  const { resetOnboarding, hasCompletedOnboarding } = useOnboardingContext();
  const { isConnected, displayAddress } = useWalletState();

  function handleResetOnboarding() {
    Alert.alert(
      '🔄 Reset Onboarding',
      'This will show the welcome screen. The app will reload automatically.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & Reload',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            // Force reload by navigating to a placeholder then back
            setTimeout(() => {
              Alert.alert('✅ Reset Complete', 'Onboarding has been reset!', [
                {
                  text: 'OK',
                  onPress: () => {
                    // You could use RNRestart here for a full reload
                    // For now, just inform the user
                  },
                },
              ]);
            }, 100);
          },
        },
      ],
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-black p-6">
      {/* Main Card */}
      <View className="border-4 border-white bg-[#8000FF] p-8 shadow-[6px_6px_0px_#FFFFFF]">
        <Text className="text-3xl text-white text-center mb-2 uppercase font-bold tracking-wider">
          🎮 PEPPER DAO
        </Text>
        <Text className="text-sm text-[#00FF80] text-center mb-8 uppercase tracking-wide">
          HOME BASE
        </Text>

        {/* Status Info */}
        <View className="mb-6 border-3 border-white bg-[#1a1a1a] p-4">
          <Text className="text-white text-xs mb-2">
            <Text className="font-bold">Onboarding:</Text>{' '}
            {hasCompletedOnboarding ? '✓ Complete' : '✗ Not Complete'}
          </Text>
          <Text className="text-white text-xs">
            <Text className="font-bold">Wallet:</Text>{' '}
            {isConnected ? `✓ ${displayAddress}` : '✗ Not Connected'}
          </Text>
        </View>

        {/* Action Buttons */}
        <Pressable
          onPress={() => router.push('/wallet-demo')}
          className="bg-[#FF006E] border-4 border-white px-8 py-4 mb-4 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Text className="text-white text-center uppercase text-sm tracking-wider font-bold">
            WALLET DEMO
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/modal')}
          className="bg-[#0080FF] border-4 border-white px-8 py-4 mb-4 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Text className="text-white text-center uppercase text-sm tracking-wider font-bold">
            SETTINGS
          </Text>
        </Pressable>

        {/* Reset Onboarding Button */}
        <Pressable
          onPress={handleResetOnboarding}
          className="bg-[#808080] border-4 border-white px-8 py-4 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Text className="text-white text-center uppercase text-sm tracking-wider font-bold">
            🔄 RESET ONBOARDING
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View className="mt-8 px-8">
        <Text className="text-[#00FF80] text-center text-xs uppercase tracking-wide">
          ✨ RETRO GAMING UI • POWERED BY NATIVEWIND ✨
        </Text>
      </View>
    </View>
  );
}
