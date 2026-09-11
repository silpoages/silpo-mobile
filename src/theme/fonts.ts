import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';

export const nunitoFonts = {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
};

export const fontFamily = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  body: 14,
  lg: 15,
  xl: 16,
  title: 18,
  heading: 22,
  display: 24,
} as const;

export type FontFamily = (typeof fontFamily)[keyof typeof fontFamily];
