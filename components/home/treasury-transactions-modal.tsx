import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { DANGER_RED, SUCCESS_GREEN } from '@/constants/theme';
import { useTreasuryChzTransactions } from '@/hooks/use-treasury-chz-transactions';
import { copyToClipboard } from '@/lib/clipboard';
import { formatPepperAmount } from '@/lib/pepper-metrics';
import { TreasuryChzTx } from '@/services/chiliz-api';

type TreasuryWindow = '24h' | '7d' | '30d' | '365d' | 'all';

interface TreasuryTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function TreasuryTransactionsModal({
  visible,
  onClose,
}: TreasuryTransactionsModalProps) {
  const [window, setWindow] = useState<TreasuryWindow>('24h');

  const { height } = useWindowDimensions();

  const { transactions, isLoading, isError } = useTreasuryChzTransactions(
    window,
    visible,
  );

  function handleCopy(address: string): void {
    try {
      void copyToClipboard(address);
    } catch (error) {
      console.warn('[TreasuryTransactionsModal] Failed to copy address', error);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/80 px-4">
        <View
          className="w-full max-w-md border-4 border-gray-300 bg-white p-4 shadow-[8px_8px_0px_#000000]"
          style={{ height: height / 2 }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <ThemedText type="subtitle">
              Treasury activity
            </ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="caption">
                CLOSE
              </ThemedText>
            </Pressable>
          </View>

          <View className="mb-3 flex-row flex-wrap gap-2">
            {[
              { id: '24h', label: 'Last 24h' },
              { id: '7d', label: 'Last 7d' },
              { id: '30d', label: 'Last 30d' },
              { id: '365d', label: 'Last 365d' },
              { id: 'all', label: 'All' },
            ].map((option) => (
              <Pressable
                key={option.id}
                onPress={() => {
                  setWindow(option.id as TreasuryWindow);
                }}
                className={`rounded-none border-2 px-2 py-1 ${
                  window === option.id
                    ? 'border-black bg-surface-alt'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <ThemedText type="caption">
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {isLoading ? (
            <ThemedText type="body">
              Loading transactions...
            </ThemedText>
          ) : isError ? (
            <ThemedText type="body">
              Unable to load recent transactions.
            </ThemedText>
          ) : !transactions || transactions.length === 0 ? (
            <ThemedText type="body">
              No treasury transactions in this period.
            </ThemedText>
          ) : (
            <FlashList
              data={transactions}
              keyExtractor={(tx: TreasuryChzTx) => tx.hash}
              renderItem={({ item: tx }: { item: TreasuryChzTx }) => {
                const shortFrom = `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`;
                const shortTo = `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`;

                return (
                  <View className="mb-2 rounded-none border-2 border-gray-300 bg-surface-alt px-3 py-2">
                    <View className="flex-row items-center justify-between">
                      <ThemedText type="caption">
                        {tx.direction === 'in' ? 'IN' : 'OUT'}
                      </ThemedText>
                      <ThemedText
                        type="caption"
                        lightColor={tx.direction === 'in' ? SUCCESS_GREEN : DANGER_RED}
                      >
                        {`${formatPepperAmount(tx.value, 18)} CHZ`}
                      </ThemedText>
                    </View>
                    <View className="mt-1 flex-row items-center justify-between gap-2">
                      <View className="flex-row items-center gap-1">
                        <ThemedText type="caption" className="text-xs">
                          {shortFrom} → {shortTo}
                        </ThemedText>
                        <Pressable
                          onPress={() => {
                            handleCopy(tx.from);
                          }}
                          className="px-1"
                        >
                          <MaterialIcons
                            name="content-copy"
                            size={14}
                            color="#000000"
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            handleCopy(tx.to);
                          }}
                          className="px-1"
                        >
                          <MaterialIcons
                            name="content-copy"
                            size={14}
                            color="#000000"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}


