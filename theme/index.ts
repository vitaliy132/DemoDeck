export const colors = {
  background: '#000000',
  surface: '#0A0A0A',
  border: '#1A1A1A',
  borderLight: '#333333',
  text: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#555555',
  accent: '#FFFFFF',
  error: '#FF4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 2,
  md: 4,
} as const;

export const fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansBold: 'Inter_700Bold',
  mono: 'SpaceMono_400Regular',
} as const;
