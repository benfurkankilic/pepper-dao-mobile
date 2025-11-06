import { Pressable, Text, View } from 'react-native';

import { useWalletActions } from '@/hooks/use-wallet-actions';
import { useWalletState } from '@/hooks/use-wallet-state';

/**
 * Retro-styled warning banner for network mismatch
 * Shows when user is connected but on wrong network
 */
export function NetworkMismatchWarning() {
  const { isWrongNetwork, chainId } = useWalletState();
  const { handleNetworkMismatch } = useWalletActions();

  if (!isWrongNetwork) return null;

  return (
    <View className="bg-[#FF006E] border-4 border-white p-4 shadow-[4px_4px_0px_#000000]">
      <Text className="font-bold text-base text-white uppercase tracking-wider mb-2">
        ⚠️ WRONG NETWORK
      </Text>
      
      <Text className="text-sm text-white mb-4">
        You're connected to chain {chainId}. Please switch to Chiliz Chain (88888) to
        continue.
      </Text>

      <Pressable
        onPress={handleNetworkMismatch}
        className="bg-white border-3 border-black px-6 py-3 shadow-[3px_3px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
      >
        <Text className="font-bold text-sm text-[#FF006E] uppercase tracking-wider text-center">
          SWITCH TO CHILIZ
        </Text>
      </Pressable>

      <Text className="text-xs text-white mt-3 opacity-80">
        Can't switch? Open your wallet app and manually change to Chiliz network.
      </Text>
    </View>
  );
}

