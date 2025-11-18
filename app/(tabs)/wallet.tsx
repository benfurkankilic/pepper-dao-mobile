import { router } from 'expo-router';
import { Alert, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FOREST_GREEN, INK } from '@/constants/theme';
import { useOnboardingContext } from '@/contexts/onboarding-context';
import { useWalletState } from '@/hooks/use-wallet-state';

export default function WalletScreen() {
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
          },
        },
      ],
    );
  }

  return (
    <ThemedView className="flex-1 p-4">
      <ScrollView contentContainerClassName="pb-12">
        <View className="items-center">
          <Card
            elevation="lg"
            className="w-full border-4 border-white p-8"
            style={{ backgroundColor: FOREST_GREEN }}
          >
            <ThemedText type="display" className="mb-2 text-center text-white">
              🎮 PEPPER WALLET
            </ThemedText>
            <ThemedText type="caption" className="mb-8 text-center text-mint">
              CONNECTION & ONBOARDING
            </ThemedText>

            <Card
              elevation="sm"
              variant="alt"
              className="mb-6 border-white p-4"
              style={{ backgroundColor: INK }}
            >
              <ThemedText type="caption" className="mb-2 text-white">
                <ThemedText type="caption" className="font-bold">
                  Onboarding:
                </ThemedText>{' '}
                {hasCompletedOnboarding ? '✓ Complete' : '✗ Not Complete'}
              </ThemedText>
              <ThemedText type="caption" className="text-white">
                <ThemedText type="caption" className="font-bold">
                  Wallet:
                </ThemedText>{' '}
                {isConnected ? `✓ ${displayAddress}` : '✗ Not Connected'}
              </ThemedText>
            </Card>

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

            <Button
              onPress={handleResetOnboarding}
              variant="secondary"
              className="w-full"
            >
              🔄 RESET ONBOARDING
            </Button>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}


