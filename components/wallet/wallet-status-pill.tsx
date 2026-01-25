import { Text, View } from 'react-native';

import { useWalletState } from '@/hooks/use-wallet-state';

/**
 * Retro-styled status pill showing wallet connection state
 * Shows different colors based on connection status
 */
export function WalletStatusPill() {
  const { statusMessage, statusColor, displayAddress } = useWalletState();

  // Map status color to actual colors and text colors
  const colorMap = {
    green: { bg: 'bg-[#00FF80]', text: 'text-[#1A2A22]' },
    yellow: { bg: 'bg-[#FFD700]', text: 'text-[#1A2A22]' },
    red: { bg: 'bg-[#FF006E]', text: 'text-white' },
    gray: { bg: 'bg-[#808080]', text: 'text-white' },
  };

  const colors = colorMap[statusColor as keyof typeof colorMap] || colorMap.gray;

  return (
    <View
      className={`
        ${colors.bg}
        border-4 border-black
        px-4 py-3
        shadow-[4px_4px_0px_#000000]
      `}
    >
      <Text className={`font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider ${colors.text}`}>
        {statusMessage}
        {displayAddress && ` • ${displayAddress}`}
      </Text>
    </View>
  );
}

