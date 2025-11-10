import { View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  surface?: 'default' | 'alt' | 'inverse';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  surface,
  ...otherProps 
}: ThemedViewProps) {
  let backgroundColor: string;
  
  if (lightColor || darkColor) {
    backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  } else if (surface) {
    const theme = 'light'; // Currently only light theme
    switch (surface) {
      case 'default':
        backgroundColor = Colors[theme].surface;
        break;
      case 'alt':
        backgroundColor = Colors[theme].surfaceAlt;
        break;
      case 'inverse':
        backgroundColor = Colors[theme].secondary;
        break;
      default:
        backgroundColor = Colors[theme].background;
    }
  } else {
    backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  }

  const borderColor = surface === 'inverse' ? undefined : Colors.light.border;
  const borderWidth = surface === 'inverse' ? 0 : (surface ? 2 : 0);

  return (
    <View 
      style={[
        { backgroundColor, borderColor, borderWidth },
        style
      ]} 
      {...otherProps} 
    />
  );
}
