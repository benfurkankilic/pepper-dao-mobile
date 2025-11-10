import { router } from 'expo-router';
import { Alert } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, FOREST_GREEN, INK } from '@/constants/theme';
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
    <ThemedView className="flex-1 items-center justify-center p-6">
      {/* Main Card */}
      <Card elevation="lg" className="p-8 border-4 border-white" style={{ backgroundColor: FOREST_GREEN }}>
        <ThemedText type="display" className="text-white text-center mb-2">
          🎮 PEPPER DAO
        </ThemedText>
        <ThemedText type="caption" className="text-mint text-center mb-8">
          HOME BASE
        </ThemedText>

        {/* Status Info */}
        <Card elevation="sm" variant="alt" className="mb-6 p-4 border-white" style={{ backgroundColor: INK }}>
          <ThemedText type="caption" className="text-white mb-2">
            <ThemedText type="caption" className="font-bold">Onboarding:</ThemedText>{' '}
            {hasCompletedOnboarding ? '✓ Complete' : '✗ Not Complete'}
          </ThemedText>
          <ThemedText type="caption" className="text-white">
            <ThemedText type="caption" className="font-bold">Wallet:</ThemedText>{' '}
            {isConnected ? `✓ ${displayAddress}` : '✗ Not Connected'}
          </ThemedText>
        </Card>

        {/* Action Buttons */}
        <Button
          onPress={() => router.push('/wallet-demo')}
          variant="primary"
          className="mb-4 w-full"
        >
          WALLET DEMO
        </Button>

        <Button
          onPress={() => router.push('/modal')}
          variant="secondary"
          className="mb-4 w-full"
        >
          SETTINGS
        </Button>

        {/* Reset Onboarding Button */}
        <Button
          onPress={handleResetOnboarding}
          variant="ghost"
          className="w-full"
        >
          🔄 RESET ONBOARDING
        </Button>
      </Card>

      {/* Footer */}
      <ThemedView className="mt-8 px-8">
        <ThemedText type="caption" className="text-mint text-center">
          ✨ PEPPERCOIN DESIGN SYSTEM • POWERED BY NATIVEWIND ✨
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
