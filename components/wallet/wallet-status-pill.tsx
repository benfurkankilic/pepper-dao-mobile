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
        border-3 border-white
        px-4 py-2
        shadow-[3px_3px_0px_#000000]
      `}
    >
      <Text className="font-bold text-xs text-white uppercase tracking-wider">
        {statusMessage}
        {displayAddress && ` • ${displayAddress}`}
      </Text>
    </View>
  );
}

