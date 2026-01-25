import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { useTreasuryChzTransactions } from '@/hooks/use-treasury-chz-transactions';
import { copyToClipboard } from '@/lib/clipboard';
import {
  formatPepperAmount,
  formatTimeAgoFromSeconds,
} from '@/lib/pepper-metrics';
import { TreasuryChzTx } from '@/services/chiliz-api';

type TreasuryWindow = '24h' | '7d' | '30d' | '365d' | 'all';

interface TreasuryTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
}

const COLORS = {
  accent: '#1a1a1a',
  border: '#4ADE80',
  borderSubtle: 'rgba(74, 222, 128, 0.3)',
  bg: '#1a1a1a',
  text: '#4ADE80',
  muted: 'rgba(255,255,255,0.6)',
  success: '#4ADE80',
  danger: '#FF6B6B',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  cardBg: 'rgba(255,255,255,0.05)',
  filterBg: 'rgba(255,255,255,0.1)',
};

export function TreasuryTransactionsModal({
  visible,
  onClose,
}: TreasuryTransactionsModalProps) {
  const [timeWindow, setTimeWindow] = useState<TreasuryWindow>('24h');

  const { height } = useWindowDimensions();

  const { transactions, isLoading, isError } = useTreasuryChzTransactions(
    timeWindow,
    visible,
  );

  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  function handleFilterPress(newWindow: TreasuryWindow) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeWindow(newWindow);
  }

  async function handleCopy(address: string): Promise<void> {
    try {
      await copyToClipboard(address);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiedHash(address);

      if (toastTimeoutRef.current !== null) {
        clearTimeout(toastTimeoutRef.current);
      }

      toastTimeoutRef.current = setTimeout(() => {
        setCopiedHash(null);
      }, 2000);
    } catch (error) {
      console.warn('[TreasuryTransactionsModal] Failed to copy address', error);
    }
  }

  const filterOptions: Array<{ id: TreasuryWindow; label: string }> = [
    { id: '24h', label: '24H' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: '365d', label: '1Y' },
    { id: 'all', label: 'ALL' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { height: height * 0.6 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Treasury Activity</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterRow}>
            {filterOptions.map((option) => {
              const isActive = timeWindow === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleFilterPress(option.id)}
                  style={[
                    styles.filterButton,
                    isActive && styles.filterButtonActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      isActive && styles.filterButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Copy Feedback Toast */}
          {copiedHash ? (
            <View style={styles.toast}>
              <MaterialIcons name="check" size={14} color={COLORS.success} />
              <Text style={styles.toastText}>COPIED!</Text>
            </View>
          ) : null}

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.centerContent}>
                <Text style={styles.statusText}>LOADING...</Text>
              </View>
            ) : isError ? (
              <View style={styles.centerContent}>
                <Text style={[styles.statusText, { color: COLORS.danger }]}>
                  FAILED TO LOAD
                </Text>
              </View>
            ) : !transactions || transactions.length === 0 ? (
              <View style={styles.centerContent}>
                <Text style={styles.statusText}>NO TRANSACTIONS</Text>
              </View>
            ) : (
              <FlashList
                data={transactions}
                showsVerticalScrollIndicator={false}
                keyExtractor={(tx: TreasuryChzTx) => tx.hash}
                estimatedItemSize={80}
                renderItem={({ item: tx }: { item: TreasuryChzTx }) => {
                  const shortFrom = `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`;
                  const shortTo = `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`;
                  const isIncoming = tx.direction === 'in';
                  const directionColor = isIncoming ? COLORS.success : COLORS.danger;

                  return (
                    <View style={styles.txCard}>
                      {/* Direction & Amount Row */}
                      <View style={styles.txRow}>
                        <View
                          style={[
                            styles.directionBadge,
                            {
                              borderColor: directionColor,
                              backgroundColor: isIncoming
                                ? 'rgba(74, 222, 128, 0.15)'
                                : 'rgba(255, 107, 107, 0.15)',
                            },
                          ]}
                        >
                          <Text style={[styles.directionText, { color: directionColor }]}>
                            {isIncoming ? 'IN' : 'OUT'}
                          </Text>
                        </View>
                        <Text style={[styles.amountText, { color: directionColor }]}>
                          {isIncoming ? '+' : '-'}
                          {formatPepperAmount(tx.value, 18)} CHZ
                        </Text>
                      </View>

                      {/* Addresses Row */}
                      <View style={styles.addressRow}>
                        <TouchableOpacity
                          onPress={() => void handleCopy(tx.from)}
                          style={styles.addressButton}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.addressText}>{shortFrom}</Text>
                          <MaterialIcons
                            name={copiedHash === tx.from ? 'check' : 'content-copy'}
                            size={12}
                            color={copiedHash === tx.from ? COLORS.success : COLORS.muted}
                          />
                        </TouchableOpacity>

                        <Text style={styles.arrowText}>{' → '}</Text>

                        <TouchableOpacity
                          onPress={() => void handleCopy(tx.to)}
                          style={styles.addressButton}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.addressText}>{shortTo}</Text>
                          <MaterialIcons
                            name={copiedHash === tx.to ? 'check' : 'content-copy'}
                            size={12}
                            color={copiedHash === tx.to ? COLORS.success : COLORS.muted}
                          />
                        </TouchableOpacity>

                        <View style={styles.spacer} />

                        <Text style={styles.timeText}>
                          {formatTimeAgoFromSeconds(tx.timestamp)}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  title: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.text,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeButtonText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 12,
    color: COLORS.white,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: COLORS.filterBg,
  },
  filterButtonActive: {
    backgroundColor: COLORS.text,
  },
  filterButtonText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: COLORS.muted,
  },
  filterButtonTextActive: {
    color: COLORS.black,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingVertical: 6,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  toastText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 12,
    color: COLORS.success,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 14,
    color: COLORS.muted,
  },
  txCard: {
    backgroundColor: COLORS.cardBg,
    padding: 12,
    marginBottom: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  directionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  directionText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 12,
  },
  amountText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 12,
    color: COLORS.muted,
  },
  arrowText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 12,
    color: COLORS.text,
  },
  spacer: {
    flex: 1,
  },
  timeText: {
    fontFamily: 'PPNeueBit-Bold',
    fontSize: 10,
    color: COLORS.muted,
  },
});
