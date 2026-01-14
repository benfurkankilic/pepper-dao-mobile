import { Modal, Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface PixelAlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

const TYPE_STYLES = {
  error: {
    borderColor: '#FF006E',
    titleColor: '#FF006E',
    bgColor: '#1a0a10',
    buttonBg: '#FF006E',
    buttonText: '#FFFFFF',
  },
  warning: {
    borderColor: '#FFEA00',
    titleColor: '#FFEA00',
    bgColor: '#1a1a0a',
    buttonBg: '#FFEA00',
    buttonText: '#000000',
  },
  info: {
    borderColor: '#0080FF',
    titleColor: '#0080FF',
    bgColor: '#0a1a1a',
    buttonBg: '#0080FF',
    buttonText: '#FFFFFF',
  },
};

export function PixelAlertModal(props: PixelAlertModalProps) {
  const { visible, onClose, title, message, type = 'error' } = props;
  const styles = TYPE_STYLES[type];

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        <View
          className="w-full max-w-sm border-4 p-4 shadow-[6px_6px_0px_#000000]"
          style={{
            borderColor: styles.borderColor,
            backgroundColor: styles.bgColor,
          }}
        >
          {/* Header */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text
              className="font-['PPNeueBit-Bold'] text-lg uppercase tracking-wider"
              style={{ color: styles.titleColor }}
            >
              {title}
            </Text>
            <Pressable
              onPress={handleClose}
              className="h-8 w-8 items-center justify-center border-2"
              style={{ borderColor: styles.borderColor }}
            >
              <Text
                className="font-['PPNeueBit-Bold'] text-sm"
                style={{ color: styles.titleColor }}
              >
                X
              </Text>
            </Pressable>
          </View>

          {/* Message */}
          <Text className="mb-4 text-sm leading-5 text-white/90">{message}</Text>

          {/* OK Button */}
          <Pressable
            onPress={handleClose}
            className="border-4 border-white py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
    </Modal>
  );
}
