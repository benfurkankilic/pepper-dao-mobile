import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FONTS } from '@/lib/fonts';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'display' | 'headline' | 'body' | 'caption' | 'link' | 'default' | 'title' | 'defaultSemiBold' | 'subtitle';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkColor = useThemeColor({ light: Colors.light.link, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'display' ? styles.display : undefined,
        type === 'headline' ? styles.headline : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'link' ? [styles.link, { color: linkColor }] : undefined,
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: FONTS.pixel,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: FONTS.pixel,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    fontFamily: FONTS.sans,
    lineHeight: 24,
    fontSize: 16,
  },
  default: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontFamily: FONTS.sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontFamily: FONTS.pixel,
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: FONTS.pixel,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
});
