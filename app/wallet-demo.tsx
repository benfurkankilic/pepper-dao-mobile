import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import {
  NetworkMismatchWarning,
  WalletConnectButton,
  WalletStatusPill,
} from '@/components/wallet';
import { CHILIZ_CHAIN_ID } from '@/config/chains';
import { useWallet } from '@/contexts/wallet-context';

/**
 * Wallet Demo Screen
 * Shows how to use wallet components and hooks with Reown
 */
export default function WalletDemoScreen() {
  const {
    address,
    chainId,
    isConnected,
    isWrongNetwork,
    error,
    disconnect,
    switchToChiliz,
    getShortAddress,
  } = useWallet();

  // Compute display values
  const displayAddress = getShortAddress() || 'Not connected';
  const fullAddress = address || 'Not connected';
  const displayChainId = chainId?.toString() || 'N/A';
  const isCorrectNetwork = isConnected && !isWrongNetwork;
  const canTransact = isConnected && isCorrectNetwork;

  /**
   * Example of a protected action (transaction)
   */
  async function handleExampleTransaction() {
    if (!canTransact) {
      Alert.alert(
        'Cannot Execute',
        isWrongNetwork
          ? `Please switch to Chiliz Chain (${CHILIZ_CHAIN_ID}) in your wallet`
          : 'Please connect your wallet first'
      );
      return;
    }

    try {
      // This code only runs if:
      // 1. Wallet is connected
      // 2. On correct network (Chiliz - 88888)
      
      Alert.alert('Success', 'Transaction would be sent here!');
      
      // Example: Send actual transaction
      // const tx = await contract.vote(proposalId, support);
      // await tx.wait();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
    }
  }

  /**
   * Handle disconnect
   */
  async function handleDisconnect() {
    try {
      await disconnect();
      Alert.alert('Disconnected', 'Wallet disconnected successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 space-y-6">
        {/* Header */}
        <View className="border-4 border-white bg-[#8000FF] p-6 shadow-[4px_4px_0px_#FFFFFF]">
          <Text className="font-bold text-2xl text-white uppercase tracking-wider mb-2">
            WALLET DEMO
          </Text>
          <Text className="text-sm text-white opacity-90">
            Test wallet connection and features
          </Text>
        </View>

        {/* Status Section */}
        <View className="space-y-4">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            WALLET STATUS
          </Text>
          
          <WalletStatusPill />
          
          <View className="border-3 border-white bg-[#1a1a1a] p-4 space-y-3">
            <View>
              <Text className="text-[#00FF80] text-xs uppercase mb-1">Connection</Text>
              <Text className="text-white text-sm">
                {isConnected ? '✓ Connected' : '✗ Not Connected'}
              </Text>
            </View>

            <View>
              <Text className="text-[#00FF80] text-xs uppercase mb-1">Short Address</Text>
              <Text className="text-white text-sm font-mono">{displayAddress}</Text>
            </View>

            <View>
              <Text className="text-[#00FF80] text-xs uppercase mb-1">Full Address</Text>
              <Text className="text-white text-xs font-mono break-all">
                {fullAddress}
              </Text>
            </View>

            <View>
              <Text className="text-[#00FF80] text-xs uppercase mb-1">Chain ID</Text>
              <Text className="text-white text-sm">
                {displayChainId}
                {isConnected && (
                  <Text className={isWrongNetwork ? 'text-[#FF006E]' : 'text-[#00FF80]'}>
                    {' '}
                    {isWrongNetwork ? '(Wrong Network)' : '(Chiliz Chain)'}
                  </Text>
                )}
              </Text>
            </View>

            <View>
              <Text className="text-[#00FF80] text-xs uppercase mb-1">Can Transact</Text>
              <Text className="text-white text-sm">
                {canTransact ? '✓ Yes' : '✗ No'}
                {isWrongNetwork && ' - Wrong Network'}
                {!isConnected && ' - Not Connected'}
              </Text>
            </View>

            {error && (
              <View className="border-2 border-[#FF006E] bg-[#330011] p-3 mt-2">
                <Text className="text-[#FF006E] text-xs uppercase mb-1">Error</Text>
                <Text className="text-white text-xs">{error.message}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Network Mismatch Warning */}
        {isWrongNetwork && (
          <View className="space-y-2">
            <Text className="font-bold text-lg text-white uppercase tracking-wider">
              NETWORK ERROR
            </Text>
            <NetworkMismatchWarning />
          </View>
        )}

        {/* Actions Section */}
        <View className="space-y-4">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            ACTIONS
          </Text>
          
          <View className="space-y-3">
            <WalletConnectButton />
            
            {isConnected && (
              <Pressable
                onPress={handleDisconnect}
                className="bg-[#FF006E] border-4 border-white px-6 py-3 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
                  DISCONNECT
                </Text>
              </Pressable>
            )}

            {isWrongNetwork && (
              <Pressable
                onPress={switchToChiliz}
                className="bg-[#0080FF] border-4 border-white px-6 py-3 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
                  SWITCH NETWORK
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Protected Action Example */}
        <View className="space-y-4">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            PROTECTED ACTION
          </Text>
          
          <View className="border-3 border-white bg-[#1a1a1a] p-4">
            <Text className="text-white text-sm mb-4">
              This button demonstrates the chain guard. It will only work when:
            </Text>
            <Text className="text-white text-sm mb-1">• Wallet is connected</Text>
            <Text className="text-white text-sm mb-4">
              • On Chiliz network (88888)
            </Text>
            
            <Pressable
              onPress={handleExampleTransaction}
              disabled={!canTransact}
              className={`
                border-4 border-white px-6 py-3
                shadow-[4px_4px_0px_#000000]
                active:shadow-none active:translate-x-1 active:translate-y-1
                ${canTransact ? 'bg-[#00FF80]' : 'bg-[#808080] opacity-50'}
              `}
            >
              <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
                {canTransact ? 'SEND TRANSACTION' : 'NOT READY'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Reown AppKit Info */}
        <View className="space-y-4">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            REOWN APPKIT
          </Text>
          
          <View className="border-3 border-[#8000FF] bg-[#1a001a] p-4 space-y-2">
            <Text className="text-[#8000FF] text-xs uppercase mb-2">
              ✨ INTEGRATION STATUS
            </Text>
            <Text className="text-white text-xs mb-1">
              • Provider: Reown AppKit (WalletConnect v2)
            </Text>
            <Text className="text-white text-xs mb-1">
              • Network: Chiliz Chain (88888)
            </Text>
            <Text className="text-white text-xs mb-1">
              • Storage: AsyncStorage with custom adapter
            </Text>
            <Text className="text-white text-xs mb-1">
              • State Management: Reown hooks (single source of truth)
            </Text>
            <Text className="text-white text-xs">
              • Features: Direct wallet connection, no swaps/onramp
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View className="space-y-4 pb-8">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            USAGE GUIDE
          </Text>
          
          <View className="border-3 border-[#0080FF] bg-[#001a33] p-4 space-y-2">
            <Text className="text-[#0080FF] text-xs mb-2 font-bold">
              📱 HOW TO USE
            </Text>
            <Text className="text-white text-xs mb-1">
              1. Tap &quot;CONNECT WALLET&quot; to open the Reown modal
            </Text>
            <Text className="text-white text-xs mb-1">
              2. Select your wallet (MetaMask, Trust Wallet, etc.)
            </Text>
            <Text className="text-white text-xs mb-1">
              3. Approve the connection in your wallet app
            </Text>
            <Text className="text-white text-xs mb-1">
              4. Ensure you&apos;re on Chiliz Chain (88888)
            </Text>
            <Text className="text-white text-xs">
              5. You can now send transactions!
            </Text>
          </View>

          <View className="border-3 border-[#00FF80] bg-[#001a1a] p-4 space-y-2">
            <Text className="text-[#00FF80] text-xs mb-2 font-bold">
              💡 DEVELOPER NOTE
            </Text>
            <Text className="text-white text-xs mb-1">
              This demo uses the useWallet() hook from wallet-context.tsx
            </Text>
            <Text className="text-white text-xs">
              All wallet state comes directly from Reown&apos;s hooks (useAccount, useAppKit)
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

