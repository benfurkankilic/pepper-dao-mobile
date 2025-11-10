import * as Font from 'expo-font';

export const FONTS = {
  pixel: 'PPNeueBit-Bold',
  sans: 'PPMondwest-Regular',
} as const;

export async function loadFontsAsync(): Promise<void> {
  await Font.loadAsync({
    [FONTS.pixel]: require('@/assets/fonts/PPNeueBit-Bold.otf'),
    [FONTS.sans]: require('@/assets/fonts/PPMondwest-Regular.otf'),
  });
}

