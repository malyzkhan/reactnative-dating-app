/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#211E1C',
    textPrimary: '#211E1C',
    textSecondary: '#716A65',
    textMuted: '#9B918B',
    background: '#F8F5EF',
    surface: '#FFFDFA',
    surfaceMuted: '#F0EBE3',
    backgroundElement: '#E8D9D8',
    backgroundSelected: '#E5DED5',
    primary: '#713B46',
    primaryPressed: '#592D37',
    border: '#E5DED5',
    success: '#34745B',
    warning: '#A66A25',
    error: '#B84040',
    disabled: '#C9C1BA',
  },
  dark: {
    text: '#F4F1EE',
    textPrimary: '#F4F1EE',
    textSecondary: '#A4A5B2',
    textMuted: '#7B818C',
    background: '#0A0D12',
    surface: '#141922',
    surfaceMuted: '#1D2432',
    backgroundElement: '#212B3B',
    backgroundSelected: '#2A3446',
    primary: '#E95D7A',
    primaryPressed: '#D94B69',
    border: '#242D38',
    success: '#4BA67E',
    warning: '#D29A57',
    error: '#D56B6B',
    disabled: '#525B69',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
