import { Platform } from 'react-native';
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
export const Colors = {
  light: {
    text: '#2D3436',
    textSecondary: '#636E72',
    background: '#F9FAFB',
    card: '#FFFFFF',
    tint: '#6C5CE7',
    tintBackground: '#EAE6FF',
    border: '#E2E8F0',
    icon: '#636E72',
    tabIconDefault: '#B2BEC3',
    tabIconSelected: '#6C5CE7',
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#FF7675',
  },
  dark: {
    text: '#DFE6E9',
    textSecondary: '#B2BEC3',
    background: '#18181B',
    card: '#27272A',
    tint: '#A29BFE',
    tintBackground: '#3F3D56',
    border: '#3F3F46',
    icon: '#B2BEC3',
    tabIconDefault: '#636E72',
    tabIconSelected: '#A29BFE',
    success: '#55EFC4',
    warning: '#FFEAA7',
    error: '#FAB1A0',
  },
};
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});