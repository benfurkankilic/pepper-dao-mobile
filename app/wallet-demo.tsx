import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import {
  NetworkMismatchWarning,
  WalletConnectButton,
  WalletStatusPill,
} from '@/components/wallet';
import { useProtectedAction } from '@/hooks/use-protected-action';
import { useWalletActions } from '@/hooks/use-wallet-actions';
import { useWalletState } from '@/hooks/use-wallet-state';

/**
 * Wallet Demo Screen
 * Shows how to use wallet components and hooks
 */
export default function WalletDemoScreen() {
  const {
    isConnected,
    isConnecting,
    displayAddress,
    isWrongNetwork,
    chainId,
    statusMessage,
    canTransact,
  } = useWalletState();

  const { disconnectWallet } = useWalletActions();
  const { executeProtected, canExecute } = useProtectedAction();

  /**
   * Example of a protected action (transaction)
   */
  async function handleExampleTransaction() {
    const error = canExecute();
    if (error) {
      Alert.alert('Cannot Execute', error);
      return;
    }

    try {
      await executeProtected(async () => {
        // This code only runs if:
        // 1. Wallet is connected
        // 2. On correct network (Chiliz - 88888)
        
        Alert.alert('Success', 'Transaction would be sent here!');
        
        // Example: Send actual transaction
        // const tx = await contract.vote(proposalId, support);
        // await tx.wait();
      });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
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
            STATUS
          </Text>
          
          <WalletStatusPill />
          
          <View className="border-3 border-white bg-[#1a1a1a] p-4">
            <Text className="text-white text-sm mb-2">
              <Text className="font-bold">Connected:</Text>{' '}
              {isConnected ? 'Yes ✓' : 'No ✗'}
            </Text>
            <Text className="text-white text-sm mb-2">
              <Text className="font-bold">Address:</Text>{' '}
              {displayAddress || 'Not connected'}
            </Text>
            <Text className="text-white text-sm mb-2">
              <Text className="font-bold">Chain ID:</Text>{' '}
              {chainId || 'N/A'}
            </Text>
            <Text className="text-white text-sm mb-2">
              <Text className="font-bold">Status:</Text>{' '}
              {statusMessage}
            </Text>
            <Text className="text-white text-sm">
              <Text className="font-bold">Can Transact:</Text>{' '}
              {canTransact ? 'Yes ✓' : 'No ✗'}
            </Text>
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
            
            {isConnected && !isConnecting && (
              <Pressable
                onPress={disconnectWallet}
                className="bg-[#808080] border-4 border-white px-6 py-3 shadow-[4px_4px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Text className="font-bold text-sm text-white uppercase tracking-wider text-center">
                  DISCONNECT
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

        {/* Info Section */}
        <View className="space-y-4 pb-8">
          <Text className="font-bold text-lg text-white uppercase tracking-wider">
            INFO
          </Text>
          
          <View className="border-3 border-[#0080FF] bg-[#001a33] p-4">
            <Text className="text-[#0080FF] text-xs mb-2 font-bold">
              ℹ️ SETUP REQUIRED
            </Text>
            <Text className="text-white text-xs mb-2">
              To enable wallet connection, you need to add your WalletConnect
              Project ID.
            </Text>
            <Text className="text-white text-xs">
              See WALLET_SETUP_GUIDE.md for instructions.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

