import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#F9F9F7',
    surface: '#FFFFFF',
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
    muted: '#C4C4C4',
    accent: '#4F46E5',
    danger: '#EF4444',
    border: '#EFEFEF',
    tint: '#4F46E5',
    icon: '#6B6B6B',
    tabIconDefault: '#C4C4C4',
    tabIconSelected: '#4F46E5',
  },
  dark: {
    text: '#ECEDEE',
    background: '#111111',
    surface: '#1E1E1E',
    primary: '#ECEDEE',
    secondary: '#9BA1A6',
    muted: '#444444',
    accent: '#6366F1',
    danger: '#EF4444',
    border: '#2A2A2A',
    tint: '#6366F1',
    icon: '#9BA1A6',
    tabIconDefault: '#444444',
    tabIconSelected: '#6366F1',
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

export const Theme = {
  font: {
    xs: 11, sm: 13, md: 15, lg: 18,
    xl: 22, xxl: 28, xxxl: 34,
  },
  radius: {
    sm: 6, md: 12, lg: 18, full: 999,
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
  },
};
