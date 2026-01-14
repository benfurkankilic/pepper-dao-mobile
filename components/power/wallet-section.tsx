import { Alert, Pressable, Text, View } from 'react-native';

import { StakingPanel } from '@/components/staking';
import { Card } from '@/components/ui/card';
import { NetworkMismatchWarning, WalletConnectButton, WalletStatusPill } from '@/components/wallet';
import { useWallet } from '@/contexts/wallet-context';

interface WalletSectionProps {
  showStaking?: boolean;
}

/**
 * Wallet Section Component
 *
 * Displays wallet connection status and staking panel
 */
export function WalletSection({ showStaking = true }: WalletSectionProps) {
  const {
    isConnected,
    isWrongNetwork,
    disconnect,
    switchToChiliz,
    getShortAddress,
  } = useWallet();

  const displayAddress = getShortAddress() || 'Not connected';

  async function handleDisconnect() {
    try {
      await disconnect();
      Alert.alert('Disconnected', 'Wallet disconnected successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }

  return (
    <View className="gap-4">
      <Card variant="default" className="p-4">
        <Text className="mb-3 font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#1E4F3A]">
          Wallet
        </Text>

        <WalletStatusPill />

        {isConnected && (
          <View className="mt-3 space-y-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/60">
                Address
              </Text>
              <Text className="font-['PPNeueBit-Bold'] text-sm text-[#1A2A22]">
                {displayAddress}
              </Text>
            </View>
          </View>
        )}

        {isWrongNetwork && (
          <View className="mt-3">
            <NetworkMismatchWarning />
          </View>
        )}

        <View className="mt-4 gap-2">
          <WalletConnectButton />

          {isConnected && (
            <Pressable
              onPress={handleDisconnect}
              className="border-4 border-black bg-[#FF006E] px-4 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Text className="text-center font-['PPNeueBit-Bold'] text-sm uppercase text-white">
                Disconnect
              </Text>
            </Pressable>
          )}

          {isWrongNetwork && (
            <Pressable
              onPress={switchToChiliz}
              className="border-4 border-black bg-[#0080FF] px-4 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Text className="text-center font-['PPNeueBit-Bold'] text-sm uppercase text-white">
                Switch Network
              </Text>
            </Pressable>
          )}
        </View>
      </Card>

      {/* Staking Panel */}
      {showStaking && isConnected && !isWrongNetwork && (
        <StakingPanel />
      )}
    </View>
  );
}
