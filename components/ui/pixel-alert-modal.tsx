import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Linking, Modal, Pressable, Text, View } from 'react-native';

import { copyToClipboard } from '@/lib/clipboard';

interface PixelAlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  copyableAddress?: string;
  explorerUrl?: string;
}

const TYPE_STYLES = {
  error: {
    borderColor: '#FF006E',
    titleColor: '#FF006E',
    bgColor: '#1a1a1a',
    buttonBg: '#FF006E',
    buttonText: '#FFFFFF',
  },
  warning: {
    borderColor: '#FFC043',
    titleColor: '#FFC043',
    bgColor: '#1a1a1a',
    buttonBg: '#FFC043',
    buttonText: '#000000',
  },
  info: {
    borderColor: '#0080FF',
    titleColor: '#0080FF',
    bgColor: '#1a1a1a',
    buttonBg: '#0080FF',
    buttonText: '#FFFFFF',
  },
  success: {
    borderColor: '#00FF80',
    titleColor: '#00FF80',
    bgColor: '#1a1a1a',
    buttonBg: '#00FF80',
    buttonText: '#000000',
  },
};

export function PixelAlertModal(props: PixelAlertModalProps) {
  const { visible, onClose, title, message, type = 'error', copyableAddress, explorerUrl } = props;
  const styles = TYPE_STYLES[type];
  const [copied, setCopied] = useState(false);

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(false);
    onClose();
  }

  async function handleCopyAddress() {
    if (!copyableAddress) return;
    await copyToClipboard(copyableAddress);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleViewExplorer() {
    if (!explorerUrl) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Linking.openURL(explorerUrl);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/85 px-5">
        <View
          className="w-full max-w-sm border-2 shadow-[4px_4px_0px_#000000]"
          style={{
            borderColor: styles.borderColor,
            backgroundColor: styles.bgColor,
          }}
        >
          {/* Header */}
          <View
            className="flex-row items-center justify-between px-4 py-3"
            style={{ borderBottomWidth: 1, borderBottomColor: `${styles.borderColor}50` }}
          >
            <Text
              className="font-['PPNeueBit-Bold'] text-base uppercase tracking-wider"
              style={{ color: styles.titleColor }}
            >
              {title}
            </Text>
            <Pressable
              onPress={handleClose}
              className="h-7 w-7 items-center justify-center bg-white/10 active:bg-white/20"
            >
              <Text className="font-['PPNeueBit-Bold'] text-xs text-white">X</Text>
            </Pressable>
          </View>

          {/* Content */}
          <View className="px-4 py-4">
            {/* Message */}
            <Text className="text-sm leading-5 text-white/90">{message}</Text>

            {/* Copyable Address */}
            {copyableAddress ? (
              <Pressable
                onPress={handleCopyAddress}
                className="mt-4 flex-row items-center justify-between bg-white/10 p-3"
              >
                <Text
                  className="flex-1 font-['PPNeueBit-Bold'] text-xs"
                  style={{ color: styles.titleColor }}
                  numberOfLines={1}
                >
                  {copyableAddress}
                </Text>
                <View className="ml-2 flex-row items-center">
                  <MaterialIcons
                    name={copied ? 'check' : 'content-copy'}
                    size={16}
                    color={copied ? '#4ADE80' : styles.titleColor}
                  />
                  {copied ? (
                    <Text className="ml-1 font-['PPNeueBit-Bold'] text-xs text-green-400">
                      Copied!
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            ) : null}
          </View>

          {/* Footer */}
          <View className="gap-2 p-4">
            {explorerUrl ? (
              <Pressable
                onPress={handleViewExplorer}
                className="flex-row items-center justify-center gap-2 border-2 py-3 active:opacity-80"
                style={{ borderColor: styles.borderColor }}
              >
                <MaterialIcons name="open-in-new" size={16} color={styles.titleColor} />
                <Text
                  className="font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider"
                  style={{ color: styles.titleColor }}
                >
                  View on Explorer
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={handleClose}
              className="py-3 active:opacity-80"
              style={{ backgroundColor: styles.buttonBg }}
            >
              <Text
                className="text-center font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider"
                style={{ color: styles.buttonText }}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
