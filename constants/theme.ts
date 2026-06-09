// Etlob Driver App - Design Tokens

export const Colors = {
  // Brand
  primary: '#FFC107',
  primaryLight: '#FFD54F',
  primaryDark: '#FF8F00',

  // Dark Mode
  dark: {
    background: '#0F0F0F',
    surface: '#1A1A1A',
    card: '#242424',
    cardElevated: '#2C2C2C',
    border: '#333333',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textMuted: '#666666',
    icon: '#888888',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    overlay: 'rgba(0,0,0,0.7)',
    statusBar: 'light' as const,
  },

  // Light Mode
  light: {
    background: '#F5F5F0',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#FAFAFA',
    border: '#E5E5E0',
    text: '#1A1A1A',
    textSecondary: '#555555',
    textMuted: '#999999',
    icon: '#777777',
    success: '#388E3C',
    error: '#C62828',
    warning: '#E65100',
    info: '#1565C0',
    overlay: 'rgba(0,0,0,0.5)',
    statusBar: 'dark' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
