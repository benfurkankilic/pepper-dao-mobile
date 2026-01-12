import { Text, View } from 'react-native';

import { useWalletState } from '@/hooks/use-wallet-state';

/**
 * Retro-styled status pill showing wallet connection state
 * Shows different colors based on connection status
 */
export function WalletStatusPill() {
  const { statusMessage, statusColor, displayAddress } = useWalletState();

  // Map status color to actual colors
  const colorMap = {
    green: 'bg-[#00FF80]',
    yellow: 'bg-[#FFD700]',
    red: 'bg-[#FF006E]',
    gray: 'bg-[#808080]',
  };

  const bgColor = colorMap[statusColor as keyof typeof colorMap] || colorMap.gray;

  return (
    <View
      className={`
        ${bgColor}
        border-4 border-black
        px-4 py-3
        shadow-[4px_4px_0px_#000000]
      `}
    >
      <Text className="font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider text-white">
        {statusMessage}
        {displayAddress && ` • ${displayAddress}`}
      </Text>
    </View>
  );
}

