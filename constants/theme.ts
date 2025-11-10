/**
 * Peppercoin Design System - Light Theme Colors
 * Based on peppercoin.com design aesthetic
 */

// Brand Colors
export const PEPPER_RED = '#E54545';
export const FOREST_GREEN = '#1E4F3A';
export const LEAF_GREEN = '#2E6B4E';
export const MINT = '#8FD9A8';
export const GOLD = '#FFC043';
export const OFF_WHITE = '#FAFAF7';
export const INK = '#11181C';

// Surface Colors
export const SURFACE = '#FFFFFF';
export const SURFACE_ALT = '#F3F6F4';
export const BORDER = '#1A2A22';

export const Colors = {
  light: {
    // Text colors
    text: INK,
    textSecondary: FOREST_GREEN,
    textMuted: LEAF_GREEN,
    
    // Background colors
    background: OFF_WHITE,
    surface: SURFACE,
    surfaceAlt: SURFACE_ALT,
    
    // Brand colors
    primary: PEPPER_RED,
    secondary: FOREST_GREEN,
    accent: GOLD,
    mint: MINT,
    
    // UI colors
    border: BORDER,
    tint: PEPPER_RED,
    icon: LEAF_GREEN,
    tabIconDefault: LEAF_GREEN,
    tabIconSelected: PEPPER_RED,
    
    // Link color
    link: PEPPER_RED,
  },
  dark: {
    // Keep dark mode structure for future use, but not actively used
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};
