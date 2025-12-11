import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { StakingPanel } from '@/components/staking';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import {
    NetworkMismatchWarning,
    WalletConnectButton,
    WalletStatusPill,
} from '@/components/wallet';
import { ACTIVE_CHAIN_ID } from '@/config/chains';
import { FOREST_GREEN } from '@/constants/theme';
import { useWallet } from '@/contexts/wallet-context';

export default function WalletScreen() {
  const {
    chainId,
    isConnected,
    isWrongNetwork,
    error,
    disconnect,
    switchToChiliz,
    getShortAddress,
  } = useWallet();

  const displayAddress = getShortAddress() || 'Not connected';
  const displayChainId = chainId?.toString() || 'N/A';
  const isCorrectNetwork = isConnected && !isWrongNetwork;
  const canTransact = isConnected && isCorrectNetwork;

  // Determine network name based on environment
  const networkName = __DEV__ ? 'Spicy Testnet' : 'Chiliz Chain';

  async function handleDisconnect() {
    try {
      await disconnect();
      Alert.alert('Disconnected', 'Wallet disconnected successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }

  return (
    <ThemedView
      className="flex-1"
      style={{ backgroundColor: FOREST_GREEN }}
    >
      <ScrollView contentContainerClassName="p-4 pb-12">
        <View className="mt-16 space-y-6">
          {/* Wallet Status Card */}
          <Card
            elevation="lg"
            className="w-full border-4 border-white p-6"
            style={{ backgroundColor: FOREST_GREEN }}
          >
            <View className="mb-6 items-center">
              <ThemedText
                type="display"
                lightColor="#FFFFFF"
                className="mb-2 text-center font-bold text-white"
              >
                PEPPER WALLET
              </ThemedText>
              {__DEV__ && (
                <View className="mt-2 border-2 border-[#FFD700] bg-[#FFD700]/20 px-3 py-1">
                  <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#FFD700]">
                    Development Mode - {networkName}
                  </Text>
                </View>
              )}
            </View>


            <View className="space-y-6">
              <View className="space-y-4">
                <ThemedText
                  type="subtitle"
                  lightColor="#FFFFFF"
                  className="text-lg font-bold uppercase tracking-wider text-white"
                >
                  Wallet Status
                </ThemedText>

                <WalletStatusPill />

                <View className="space-y-3 border-3 border-white bg-[#1a1a1a] p-4">
                  <View>
                    <Text className="mb-1 text-xs uppercase text-[#00FF80]">
                      Connection
                    </Text>
                    <Text className="text-sm text-white">
                      {isConnected ? '✓ Connected' : '✗ Not Connected'}
                    </Text>
                  </View>

                  <View>
                    <Text className="mb-1 text-xs uppercase text-[#00FF80]">
                      Short Address
                    </Text>
                    <Text className="font-mono text-sm text-white">
                      {displayAddress}
                    </Text>
                  </View>

                  <View>
                    <Text className="mb-1 text-xs uppercase text-[#00FF80]">
                      Chain ID
                    </Text>
                    <Text className="text-sm text-white">
                      {displayChainId}
                      {isConnected && (
                        <Text
                          className={
                            isWrongNetwork ? 'text-[#FF006E]' : 'text-[#00FF80]'
                          }
                        >
                          {' '}
                          {isWrongNetwork
                            ? '(Wrong Network)'
                            : `(${networkName})`}
                        </Text>
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text className="mb-1 text-xs uppercase text-[#00FF80]">
                      Expected Chain
                    </Text>
                    <Text className="text-sm text-white">
                      {ACTIVE_CHAIN_ID} ({networkName})
                    </Text>
                  </View>

                  <View>
                    <Text className="mb-1 text-xs uppercase text-[#00FF80]">
                      Can Transact
                    </Text>
                    <Text className="text-sm text-white">
                      {canTransact ? '✓ Yes' : '✗ No'}
                      {isWrongNetwork && ' - Wrong Network'}
                      {!isConnected && ' - Not Connected'}
                    </Text>
                  </View>

                  {error && (
                    <View className="mt-2 border-2 border-[#FF006E] bg-[#330011] p-3">
                      <Text className="mb-1 text-xs uppercase text-[#FF006E]">
                        Error
                      </Text>
                      <Text className="text-xs text-white">
                        {error.message}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {isWrongNetwork && (
                <View className="space-y-2">
                  <ThemedText
                    type="subtitle"
                    lightColor="#FFFFFF"
                    className="text-lg font-bold uppercase tracking-wider text-white"
                  >
                    Network Error
                  </ThemedText>
                  <NetworkMismatchWarning />
                </View>
              )}

              <View className="mt-4 space-y-4">
                <ThemedText
                  type="subtitle"
                  lightColor="#FFFFFF"
                  className="text-lg font-bold uppercase tracking-wider text-white"
                >
                  Actions
                </ThemedText>

                <View className="space-y-3">
                  <WalletConnectButton />

                  {isConnected && (
                    <Pressable
                      onPress={handleDisconnect}
                      className="border-4 border-white bg-[#FF006E] px-6 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      <Text className="text-center text-sm font-bold uppercase tracking-wider text-white">
                        Disconnect
                      </Text>
                    </Pressable>
                  )}

                  {isWrongNetwork && (
                    <Pressable
                      onPress={switchToChiliz}
                      className="border-4 border-white bg-[#0080FF] px-6 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      <Text className="text-center text-sm font-bold uppercase tracking-wider text-white">
                        Switch Network
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

            </View>
          </Card>

          {/* Staking Panel */}
          <View style={{ backgroundColor: FOREST_GREEN }}>
            <StakingPanel />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
