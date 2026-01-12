import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Tab configuration for icons, labels, and active colors
 */
const TAB_CONFIG: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; label: string; activeColor: string }> = {
  index: { icon: 'favorite', label: 'PULSE', activeColor: '#E54545' },
  governance: { icon: 'how-to-vote', label: 'DECIDE', activeColor: '#3B82F6' },
  power: { icon: 'bolt', label: 'POWER', activeColor: '#FBBF24' },
};

interface PixelTabButtonProps {
  route: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  activeColor: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

/**
 * Individual tab button - minimal pixel style
 */
const INACTIVE_COLOR = '#687076';

function PixelTabButton({
  label,
  icon,
  activeColor,
  isFocused,
  onPress,
  onLongPress,
}: PixelTabButtonProps) {
  async function handlePress() {
    if (Platform.OS === 'ios') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  }

  const color = isFocused ? activeColor : INACTIVE_COLOR;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={handlePress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center py-3"
    >
      <MaterialIcons name={icon} size={26} color={color} />
      <Text
        style={{ color }}
        className="mt-1 font-['PPNeueBit-Bold'] text-xs tracking-wider"
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Custom pixel-styled bottom tab bar
 * Minimal, aesthetic design with pixel font
 */
export function PixelTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom - 16, 4) }}
      className="border-t-2 border-[#1A2A22] bg-[#FAFAF7]"
    >
      <View className="flex-row">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || { icon: 'help', label: route.name, activeColor: '#E54545' };

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          function onLongPress() {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          }

          return (
            <PixelTabButton
              key={route.key}
              route={route.name}
              label={config.label}
              icon={config.icon}
              activeColor={config.activeColor}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}
