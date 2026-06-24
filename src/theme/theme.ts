/**
 * Central design tokens. Dark, Jackbox-inspired party aesthetic with neon
 * accents. Fonts are loaded in App.tsx via @expo-google-fonts.
 */

export const colors = {
  // Surfaces (deep indigo/violet night)
  bg: '#0F0A1E',
  bgElevated: '#1A1030',
  surface: '#241640',
  surfaceAlt: '#2E1B4F',
  border: '#3A2A5C',

  // Text
  text: '#F5F0FF',
  textMuted: '#B7A8D4',
  textFaint: '#7E6FA0',

  // Brand + neon accents
  primary: '#FF2E88', // hot magenta
  primaryDark: '#C81E68',
  onPrimary: '#FFFFFF',
  cyan: '#22D3EE',
  lime: '#A3E635',
  yellow: '#FFD93D',
  purple: '#A855F7',
  orange: '#FF8A3D',

  // Semantic
  danger: '#FF4D4D',
  success: '#34D399',

  black: '#000000',
  white: '#FFFFFF',
} as const;

export const fonts = {
  display: 'Fredoka_700Bold',
  displaySemi: 'Fredoka_600SemiBold',
  heading: 'Fredoka_500Medium',
  headingLight: 'Fredoka_400Regular',
  body: 'Nunito_500Medium',
  bodyRegular: 'Nunito_400Regular',
  bodySemi: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtra: 'Nunito_800ExtraBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/** Soft neon glow for a given accent colour (iOS shadow). */
export function glow(color: string, opacity = 0.5) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: opacity,
    shadowRadius: 16,
    elevation: 8,
  };
}
